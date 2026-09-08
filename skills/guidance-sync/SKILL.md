---
name: guidance-sync
description: Use when synchronizing an already-confirmed reusable Korean administrative guidance set across the current canonical GitHub repository, a local guidance source, installed Codex skills, and app recognition, or when publishing those confirmed changes through a PR. Triggers include 지침 동기화, 최신 지침 반영, 로컬과 싱크, 설치본 업데이트, 앱에 스킬 반영, and 동기화 후 PR. Do not use for editing the guidance content itself, ordinary case drafting, public-interest classification, or one-off case facts.
metadata:
  short-description: Sync guidance across GitHub, local, and Codex
---

# Guidance Sync

## Trigger

사용자가 재사용 지침을 현재 정본 GitHub 저장소, 로컬 기본지침, Codex 설치본, 앱 인식 사이에서 맞추거나 올리라고 하면 적용한다.

- `지침 동기화`, `최신 지침 반영`, `원격·로컬 싱크`
- `GitHub 지침 반영`, `로컬과 싱크`
- `설치본 업데이트`, `앱에 스킬 반영`, `동기화 후 PR`

사건 문안 작성, 공익신고 대상성, 일회성 사건 사실은 이 스킬의 대상이 아니다. 공통 지침·스킬의 **내용 자체를 만들거나 수정하는 업데이트**는 `guidance-repo-maintenance`가 맡는다. 그 변경이 확정된 뒤 GitHub·로컬·설치본을 맞추거나 PR로 게시하는 단계에서 이 스킬을 적용한다.

이 starter를 복제한 뒤에는 복제한 사용자의 저장소가 정본이다. 원본 제공자의 `m1`은 자동 동기화 대상이 아니며, 필요한 개선만 사용자가 명시한 범위에서 가져온다.

## 모델

이 스킬은 특정 모델에 묶지 않는다. 모델·공급자 선택과 외부 전송 경계는 `AGENTS.md`의 하네스·개인정보 규칙을 정본으로 따른다. 사건 원문·개인정보·인증정보·런타임은 전송 후보에서 제외한다.

## 핵심 순서

1. 요청 방향을 나눈다. 내려받기(정본 기본 브랜치 → 로컬 → 설치본 → 앱 인식), 올리기(로컬 확정분 → 기능 브랜치·PR), 또는 둘 다.
2. 현재 PC와 조직 정책에서 허용되는 GitHub 접근 방식을 확인한다. 불명확하면 더 제한적인 규칙을 쓴다.
3. 조직의 제한 PC에서는 허용된 GitHub 플러그인 또는 MCP만 사용한다. 승인되지 않은 SSH·PAT·GCM·로컬 `fetch`·`pull`·`push`로 우회하지 않는다.
4. 상세 절차는 `references/repository_sync_workflow.md`를 정본으로 읽는다.
5. 파일 대조는 가능한 한 `scripts/compare_guidance_manifest.ps1`로 집계한다. 전체 경로를 화면에 반복 출력하지 말고 총계와 불일치만 보고한다.
6. 한 단계의 성공을 다음 단계의 성공으로 쓰지 않는다. GitHub 병합, 로컬 원본, 설치본 SHA, 앱 인식은 별개다.

## 완료 보고

최종 보고에는 확인한 원격 SHA, 로컬 대조 집계, 실제 반영·PR 파일, `PR 생성(미병합)` 또는 `기본 브랜치 반영(병합 확인)`, 설치본 검증, 앱 인식 여부, 하지 못한 항목을 구분한다. 요청 범위의 단계가 모두 끝나기 전에는 `동기화 완료`라고 쓰지 않는다.
