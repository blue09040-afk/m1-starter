# NotebookLM CoWork CLI 운용 지침

## 1. 목적

이 지침은 Codex CLI 환경에서 NotebookLM CoWork 자동화 결과를 읽고, 민원 검토표·후속 질의·회신문 초안을 작성할 때 적용한다.

NotebookLM은 업로드된 자료의 검색·요약·근거 추출 보조 수단으로 사용하고, Codex CLI는 그 결과를 확인하여 사실관계, 추론, 확인 필요 사항, 회신문 문안을 정리한다.

## 2. 기본 구조

```text
Chrome NotebookLM
  -> NotebookLM CoWork 확장 프로그램
  -> local bridge
  -> runs/*.md, runs/*.json 저장
  -> Codex CLI가 최신 runs 파일 검토
```

자동 왕복 중에는 브리지가 Codex CLI를 호출해 다음 NotebookLM 질의를 생성할 수 있다. 그러나 최종 판단과 회신문 작성은 반드시 최신 `runs` 파일을 다시 읽고 수행한다.

## 3. 실행 전 확인

작업공간 기준 경로:

```text
<Codex 작업루트>
```

자동화 폴더:

```text
<Codex 작업루트>\notebooklm-cowork
```

포터블 Codex CLI:

```text
<Codex 작업루트>\tools\codex-cli\codex-x86_64-pc-windows-msvc.exe
```

브리지 실행:

```powershell
cd "<Codex 작업루트>\notebooklm-cowork"
.\start-bridge.cmd
```

정상 실행 시 다음 문구가 보여야 한다.

```text
NotebookLM CoWork bridge listening on http://127.0.0.1:3217/
Using Codex CLI: <Codex 작업루트>\tools\codex-cli\codex-x86_64-pc-windows-msvc.exe
```

`WindowsApps` 경로가 표시되면 잘못된 실행파일을 잡은 것이므로 브리지를 중지하고 `start-bridge.cmd`를 확인한다.

## 4. Chrome 확장 프로그램 사용

1. Chrome에서 `chrome://extensions`를 연다.
2. 개발자 모드를 켠다.
3. `NotebookLM CoWork` 확장 프로그램을 로드 또는 새로고침한다.
4. NotebookLM 노트북을 열고 사용자가 직접 자료를 업로드한다.
5. 확장 프로그램 팝업에서 검토 목표와 라운드 수를 입력한다.
6. 처음에는 라운드 수를 2로 두고 테스트한다.
7. 정상 작동이 확인되면 5~10라운드로 늘린다.

브리지가 정상 종료된 경우 `Continue +1`로 한 라운드씩 추가 진행할 수 있다.

## 5. 결과 파일

자동화 결과는 다음 폴더에 저장된다.

```text
<Codex 작업루트>\notebooklm-cowork\runs
```

주요 파일:

- `run-YYYYMMDD-HHMMSS.md`: 라운드별 질의와 NotebookLM 답변
- `run-YYYYMMDD-HHMMSS.json`: 상태와 원자료 구조화 로그
- `*-codex.txt`: Codex CLI가 생성한 후속 질의

최종 검토는 최신 `.md` 파일을 우선 읽는다.

## 6. CLI에서 이어서 검토하는 표준 프롬프트

Codex CLI에서 다음처럼 요청한다.

```text
notebooklm-cowork/runs 폴더의 최신 run-*.md 파일을 읽고, 민원검토 지침에 따라 다음 형식으로 정리해줘.

1. 쟁점별 결론 초안
2. 확인된 사실
3. NotebookLM 답변에서 나온 추론 또는 불확실한 사항
4. 원문 자료로 추가 확인해야 할 사항
5. 회신문에 사용할 수 있는 문장 초안
6. 표현상 주의할 점

사실, 추론, 확인 필요를 구분하고, NotebookLM 답변만으로 법률 효과를 단정하지 마.
```

회신문 초안까지 작성할 때는 다음을 사용한다.

```text
notebooklm-cowork/runs 폴더의 최신 run-*.md 파일을 읽고, 민원 회신문 초안을 작성해줘.

요구사항:
- 공문서 문체로 작성
- 결론 -> 근거 -> 추가 확인 또는 안내 순서
- 개인정보와 비공개 정보는 최소화
- NotebookLM 답변의 추론은 단정하지 말고 확인 필요로 표시
- 법령, 재결일, 수용개시일, 공탁 여부 등은 자료상 확인된 범위에서만 작성
- 내부 검토 메모와 대외 발송용 문안을 분리
```

## 7. 검토 원칙

NotebookLM 결과는 최종 판단 근거가 아니라 검토 보조 자료로 본다.

다음 항목은 반드시 확인한다.

- 문서명과 날짜가 맞는가
- 사안 당시 법령과 현재 법령이 혼동되지 않았는가
- 수용재결, 이의재결, 수용개시일, 공탁 여부가 구분되었는가
- 일부 지장물 재결 실효를 전체 사업 무효로 확장하지 않았는가
- 행정 과실, 감사 지적, 징계가 재결 효력 무효로 바로 연결되는지 단정하지 않았는가
- 개인정보나 민원인 식별 정보가 불필요하게 노출되지 않았는가
- 원상복구 가능성은 관할·권한·절차를 확인한 범위에서만 표현했는가

## 8. 문제 발생 시

브리지 상태 확인:

```powershell
cd "<Codex 작업루트>\notebooklm-cowork"
powershell -ExecutionPolicy Bypass -File .\diagnose.ps1
```

포트 충돌 시:

```powershell
$pid3217 = (Get-NetTCPConnection -LocalPort 3217 -ErrorAction SilentlyContinue).OwningProcess
Stop-Process -Id $pid3217
```

확장 프로그램 오류가 누적되면:

1. `chrome://extensions`를 연다.
2. NotebookLM CoWork의 오류를 모두 삭제한다.
3. 확장 프로그램을 새로고침한다.
4. NotebookLM 페이지를 새로고침한다.

## 9. 보안 주의

- 서류 업로드는 사용자가 직접 수행한다.
- 자동화는 NotebookLM에 프롬프트를 전송하므로, 개인정보·비공개 정보가 포함될 수 있다.
- 민원자료 원문, 개인정보, 내부 검토 메모는 불필요하게 외부 서비스에 재전송하지 않는다.
- 최종 회신문 작성 전 개인정보, 비공개 정보, 관할, 권한, 처리기한을 점검한다.
