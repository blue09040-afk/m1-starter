# HWPX Reading Kit Instructions

이 폴더는 바이너리 `.hwp` 파일을 한컴 공식 HWPX 변환기로 `.hwpx` 작업본으로 바꾸어 읽기와 검토에 투입하기 위한 재사용 키트다.

## 기본 원칙

- 원본 `.hwp`는 수정하지 않는다.
- `.hwp`는 먼저 로컬에서 `.hwpx`로 변환하고, 내용 확인은 생성된 `.hwpx`의 ZIP/XML 구조를 기준으로 수행한다.
- 변환 기본 도구는 한컴 공식 `HWPX 변환기`이며, `tools/convert_hwp_to_hwpx.ps1`은 파일을 한 건씩 순차 호출한다.
- 한글 COM 자동화는 반복 승인, 확인창, 멈춤 위험이 있으므로 기본 자동화 경로로 사용하지 않는다.
- 검토 중간 문안은 MD로 유지하고, HWPX 생성·수정은 원본 판독 또는 최종 제출본이 필요한 경우로 제한한다.
- 변환 결과를 판단 근거로 사용할 때는 원본 파일명, 변환 도구, 변환 로그, 남은 서식 확인 필요 사항을 남긴다.

## 기본 처리 순서

1. `tools/HwpxConverter/HwpxConverter.exe`가 있는지 확인한다.
2. 없으면 `tools/install_hwpx_converter.ps1`을 관리자 권한 PowerShell에서 한 번 실행한다.
3. 다음 명령으로 HWP를 별도 출력 폴더에 HWPX로 변환한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\convert_hwp_to_hwpx.ps1 `
  -Target ".\input" `
  -OutputDirectory ".\output\hwpx"
```

4. `output/hwpx/`의 변환본과 `output/logs/`의 JSON 로그를 확인한다.
5. HWPX 본문 읽기·표 확인·최종 문안 작업은 `hwp-hwpx-processing` 스킬을 따른다.

## 설치파일 확보

설치 배포본 ZIP은 키트에 보관하지 않는다. 설치가 완료된 `tools/HwpxConverter/`는 다른 작업공간에서도 바로 쓸 수 있도록 키트에 유지한다. 재설치가 필요하면 `tools/install_hwpx_converter.ps1`이 한컴 공식 다운로드 주소에서 ZIP을 임시로 내려받아 설치하고 다운로드 파일을 정리한다.

공식 안내 기준:

- 한컴오피스 한/글 NEO, 2018, 2020, 2022, 2024 설치 PC 지원
- HWP를 HWPX로 변환
- 프로그램 화면에서 1회 최대 30개 파일 변환
- 암호화 문서는 한/글 설치 환경 필요

공식 확인 경로:

- 다운로드 센터: <https://www.store.hancom.com/support/downloadCenter/download>
- FAQ: <https://www.hancom.com/support/faqCenter/faq/detail/3128>

## 대량 변환 주의

- 공식 변환기에 여러 파일 경로를 한 프로세스 인자로 전달하는 방식은 사용하지 않는다.
- `tools/convert_hwp_to_hwpx.ps1`처럼 각 파일을 개별 호출하여 반복 처리한다.
- 파일명 중복, 변환 실패, HWPX 구조 검증 실패는 로그에서 확인하고 해당 파일만 재처리한다.
- HWPX 변환이 성공해도 표 폭, 병합 셀, 머리글·바닥글, 쪽번호, 글꼴 등 시각적 서식은 제출 전 한글 프로그램에서 확인한다.
