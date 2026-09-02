# HWPX_READING_KIT

한컴 공식 `HWPX 변환기`를 이용해 바이너리 `.hwp` 입력자료를 로컬 `.hwpx` 작업본으로 일괄 준비하는 실행 키트다.

## 구성

```text
HWPX_READING_KIT/
  hwp_agents.md
  README.md
  guides/
    HWPX_READING_KIT_WORKFLOW.md
  tools/
    install_hwpx_converter.ps1
    convert_hwp_to_hwpx.ps1
    HwpxConverter/        # 각 PC의 로컬 설치본, Git 추적 제외
  output/                 # 변환 실행 후 로컬에 생성, 기본지침 공유본에서는 제외
```

## 사용

먼저 `hwp_agents.md`와 `guides/HWPX_READING_KIT_WORKFLOW.md`를 읽는다.

공식 변환기가 아직 설치되지 않은 경우 관리자 권한 PowerShell에서 실행한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\install_hwpx_converter.ps1
```

HWP 파일 또는 폴더를 변환한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\convert_hwp_to_hwpx.ps1 `
  -Target ".\input" `
  -OutputDirectory ".\output\hwpx"
```

하위 폴더까지 처리하려면 `-Recurse`, 기존 출력물을 대체하려면 `-Overwrite`를 지정한다.

## 보관 범위

공식 설치 ZIP과 설치된 `tools/HwpxConverter/`는 각 PC의 로컬 실행용으로만 두고 GitHub `m1`과 공유 패키지에서는 제외한다. 로컬 설치본이 없으면 `install_hwpx_converter.ps1`이 공식 주소에서 설치 ZIP을 임시 다운로드하여 설치 후 정리한다.

변환 출력물과 로그에는 원문 내용이나 파일명이 포함될 수 있으므로 `output/`도 기본지침 공유본에서 제외한다.

## 공식 다운로드 기록

- 동작 확인일: `2026-05-27`
- 공식 다운로드 센터: <https://www.store.hancom.com/support/downloadCenter/download>
- 공식 FAQ: <https://www.hancom.com/support/faqCenter/faq/detail/3128>
- 테스트 당시 공식 ZIP URL: <https://cdn.hancom.com/pds/hnc/FNT/HWPX_converter.zip>
- 테스트 당시 파일명: `HWPX_converter.zip`
- 테스트 당시 SHA-256: `21A338F0403C2870654E8848A5CCF5329802EDB3E7671E56329A711A1165682C`

직접 ZIP 주소가 바뀌거나 내려받기가 실패하면 공식 다운로드 센터에서 최신 HWPX 변환기 경로를 다시 확인한다.
