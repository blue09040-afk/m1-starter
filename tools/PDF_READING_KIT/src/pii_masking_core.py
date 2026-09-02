"""Small, dependency-free personal-information masking core."""
from __future__ import annotations
import argparse, json, re, sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

@dataclass(frozen=True)
class PiiMatch:
    category: str
    start: int
    end: int
    replacement: str

_SEP = r"[\s.·/\\\\_\-–—]*"
_DSEP = r"[\s.·/\\\\_\-–—]+"
_AREA = r"(?:02|0(?:3[1-3]|4[1-4]|5[1-5]|6[1-4]|70|50))"
_MASK = "[MASKED]"
_PATTERNS = (
    ("resident_registration_number", re.compile(r"(?<!\d)(?:\d[ \t]*){6}[\s\-·–—]*(?:\d[ \t]*){7}(?!\d)")),
    ("driver_license", re.compile(rf"(?<!\d)\d{{2}}{_DSEP}\d{{2}}{_DSEP}\d{{6}}{_DSEP}\d{{2}}(?!\d)")),
    ("card_number", re.compile(rf"(?<!\d)\d{{4}}{_DSEP}\d{{4}}{_DSEP}\d{{4}}{_DSEP}\d{{4}}(?!\d)")),
    ("international_mobile_phone", re.compile(rf"(?<!\d)\+?82{_SEP}10{_SEP}\d{{3,4}}{_SEP}\d{{4}}(?!\d)")),
    ("mobile_phone", re.compile(rf"(?<!\d)01[016789]{_SEP}\d{{3,4}}{_SEP}\d{{4}}(?!\d)")),
    ("telephone", re.compile(rf"(?<!\d){_AREA}{_SEP}\d{{3,4}}{_SEP}\d{{4}}(?!\d)")),
    ("email", re.compile(r"(?<![A-Za-z0-9._%+\-])[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}(?![A-Za-z])")),
    ("passport", re.compile(r"(?<![A-Za-z0-9])[A-Za-z]{1,2}\d{7,8}(?!\d)")),
    ("birth_date", re.compile(r"(?<!\d)(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])(?!\d)")),
    ("account_number", re.compile(rf"(?<!\d)\d{{3,6}}{_DSEP}\d{{2,6}}{_DSEP}\d{{4,8}}(?!\d)")),
)

def _normalise(value: str) -> str:
    return re.sub(r"[\W_]+", "", value, flags=re.UNICODE).casefold()

def find_pii(text: str, preserve_values: Iterable[str] = (), mask_values: Iterable[str] = ()) -> list[PiiMatch]:
    preserve = {_normalise(v) for v in preserve_values if _normalise(v)}
    protected, candidates = [], []
    for value in preserve_values:
        if not value: continue
        start = text.find(value)
        while start != -1:
            protected.append((start, start + len(value))); start = text.find(value, start + 1)
    for value in mask_values:
        if not value or _normalise(value) in preserve: continue
        start = text.find(value)
        while start != -1:
            candidates.append((start, start + len(value), -1, "explicit")); start = text.find(value, start + 1)
    for priority, (category, pattern) in enumerate(_PATTERNS):
        for match in pattern.finditer(text):
            start, end = match.span(); value = match.group(0)
            if _normalise(value) in preserve: protected.append((start, end))
            else: candidates.append((start, end, priority, category))
    candidates = [c for c in candidates if not any(c[0] < pe and c[1] > ps for ps, pe in protected)]
    candidates.sort(key=lambda c: (c[0], c[2], -(c[1]-c[0])))
    accepted = []
    for c in candidates:
        if not accepted or c[0] >= accepted[-1][1]: accepted.append(c)
        elif c[2] < accepted[-1][2]: accepted[-1] = c
    return [PiiMatch(category, start, end, _MASK) for start, end, _priority, category in accepted]

def mask_text(text: str, preserve_values: Iterable[str] = (), mask_values: Iterable[str] = ()):
    matches = find_pii(text, preserve_values, mask_values)
    pieces, cursor = [], 0
    for match in matches:
        pieces.extend((text[cursor:match.start], match.replacement)); cursor = match.end
    pieces.append(text[cursor:])
    return "".join(pieces), matches

def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path); parser.add_argument("--output", type=Path)
    parser.add_argument("--preserve-value", action="append", default=[]); parser.add_argument("--mask-value", action="append", default=[])
    parser.add_argument("--report-json", type=Path); args = parser.parse_args(argv)
    text = args.input.read_text(encoding="utf-8") if args.input else sys.stdin.read()
    masked, matches = mask_text(text, args.preserve_value, args.mask_value)
    if args.output: args.output.write_text(masked, encoding="utf-8")
    else: sys.stdout.write(masked)
    if args.report_json: args.report_json.write_text(json.dumps([{"category":m.category,"start":m.start,"end":m.end} for m in matches], ensure_ascii=False, indent=2), encoding="utf-8")
    return 0

if __name__ == "__main__": raise SystemExit(main())
