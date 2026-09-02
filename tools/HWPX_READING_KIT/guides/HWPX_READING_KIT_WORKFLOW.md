# HWPX Reading Kit Workflow

## 1. 목적

이 문서는 `.hwp` 입력자료를 한컴 공식 변환기로 `.hwpx` 작업본으로 준비하여, ZIP/XML 기반 읽기와 검토 흐름으로 넘기는 실행 절차를 정한다.

`hwp-hwpx-processing` 스킬은 HWPX 분석·문안 작업·최종 검증의 기준본이다. 이 문서는 공식 변환기 설치와 HWP 입력 변환 실행만 다룬다.

## 2. 원칙

1. 원본 `.hwp`는 수정하거나 덮어쓰지 않는다.
2. HWP 내용 판단 전에 HWPX 작업본을 먼저 만든다.
3. 공식 `HWPX 변환기`를 로컬에서 사용하며 외부 서비스 전송은 발생하지 않는다.
4. COM 자동화는 기본 절차에서 제외한다.
5. 여러 HWP는 변환기 실행파일을 파일별로 순차 호출한다.
6. 검토 중 수정안은 MD로 유지하고, 최종 HWPX 생성은 필요한 시점에만 한다.

## 3. 준비

키트에는 공식 설치 ZIP을 저장하지 않지만, 설치된 변환기 실행파일은 즉시 사용 가능하도록 `tools/HwpxConverter/`에 유지한다. 실행파일이 없거나 재설치가 필요하면 관리자 권한 PowerShell에서 다음을 실행하며, 스크립트가 공식 URL에서 설치 ZIP을 임시 다운로드한 뒤 정리한다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\install_hwpx_converter.ps1
```

설치 위치:

```text
tools/HwpxConverter/HwpxConverter.exe
```

설치 프로그램이 생성하는 공용 바탕화면·시작 메뉴 바로가기는 설치 스크립트가 제거한다. 변환기는 키트 경로에서만 호출한다.

공식 다운로드 확인 경로:

- <https://www.store.hancom.com/support/downloadCenter/download>
- <https://www.hancom.com/support/faqCenter/faq/detail/3128>

## 4. 변환 실행

단일 파일:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\convert_hwp_to_hwpx.ps1 `
  -Target ".\input\문서.hwp" `
  -OutputDirectory ".\output\hwpx"
```

폴더 일괄 처리:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\convert_hwp_to_hwpx.ps1 `
  -Target ".\input" `
  -OutputDirectory ".\output\hwpx"
```

하위 폴더 포함:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\convert_hwp_to_hwpx.ps1 `
  -Target ".\input" `
  -OutputDirectory ".\output\hwpx" `
  -Recurse
```

동일한 출력 파일이 이미 있으면 기본적으로 실패 처리한다. 사용자가 교체를 명시한 경우에만 `-Overwrite`를 사용한다.

## 5. 스크립트 동작

`convert_hwp_to_hwpx.ps1`은 각 원본 파일에 대해 다음을 수행한다.

1. 출력 폴더 아래 임시 작업 폴더에 HWP 복사본을 만든다.
2. 공식 변환기를 복사본 한 건에 대해 숨김 실행하고 종료를 기다린다.
3. 생성된 HWPX의 필수 항목을 검사한다.
4. 검증된 HWPX만 출력 폴더로 이동한다.
5. 임시 HWP 복사본과 작업 폴더를 정리한다.
6. 결과를 JSON 로그에 남긴다.

필수 검사 항목:

```text
mimetype
Contents/header.xml
Contents/section0.xml
Preview/PrvText.txt
META-INF/container.xml
META-INF/manifest.xml
```

## 6. 결과 활용

변환이 성공하면 HWPX는 ZIP/XML 파일로 읽는다. 빠른 본문 확인은 `Preview/PrvText.txt`, 구조·표 확인은 `Contents/section*.xml`을 중심으로 수행한다.

HWPX는 본문 판단을 위한 작업본이며, 최종 제출본으로 사용하려면 다음 항목을 한글 프로그램에서 확인한다.

- 표 폭과 병합 셀
- 머리글·바닥글
- 쪽번호와 쪽 나눔
- 글꼴과 문단 서식
- 이미지 및 첨부 객체

## 7. 실패 기록

변환 실패 시 다음을 남긴다.

- 원본 파일명
- 변환기 실행 종료코드 또는 오류 메시지
- HWPX 구조 검증 실패 항목
- 암호화 문서 여부 또는 열기 제한 여부
- 재변환 또는 원본 화면 확인 필요 여부
