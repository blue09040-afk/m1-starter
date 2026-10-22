---
name: lawnb-local-case-law-lookup
description: Use in the Codex desktop app or Codex CLI when a working local stdio lawnb-local-mcp and institution IP access are available to identify Korean case law from LAWnB metadata, verify its bibliographic identity, and open the LAWnB case page for human review. Do not use in web or cloud Chat mode or to extract paid full text.
metadata:
  short-description: LAWnB local case-law metadata lookup
---

# LAWnB 로컬 판례 찾기

## 개요와 적용 범위

`lawnb-local-mcp`로 판례의 사건번호·법원·선고일 등 서지정보를 찾고, 정확히 특정한 뒤 원문 확인 경로를 연결한다. 검색 목록과 서지정보는 판례 **식별 단서**이며 판시 내용이나 법적 결론의 근거가 아니다.

이 스킬은 로컬 stdio MCP와 기관 IP 인증을 사용할 수 있는 **Codex 데스크톱 앱 또는 Codex CLI 전용**이다. 웹·클라우드 Chat 모드에서는 이 로컬 도구에 접근할 수 없으므로 적용하지 않는다. MCP 등록 사실만으로 현재 기관 인증을 추정하지 않는다.

## 사전 점검 (Gate)

1. 현재 세션에 `lawnb_status`, `lawnb_search`, `lawnb_get_metadata`, `lawnb_open`이 실제로 제공되는지 확인한다.
2. `lawnb_status`를 호출해 서비스 응답, `authenticated: true`, `contentMode: metadata`를 확인한다. `metadata`는 이 도구의 메타데이터 전용 응답 모드를 뜻한다. 기관 표시가 예상과 다르거나 인증 상태가 불분명하면 사용 가능한 범위를 확인하기 전에는 검색하지 않는다.
3. 도구가 없거나 인증에 실패하면 LAWnB 경로를 중단한다. 프록시·비공식 접속·계정정보 추출로 우회하지 않는다. 필요한 판례는 사용 가능한 공공 판례 경로에서 찾고, LAWnB 확인을 하지 못했다고 명시한다.

## 표준 워크플로

1. **상태 점검:** 위 Gate를 통과한다. 이미 제공된 판례 원문이나 사건번호가 있으면 이를 먼저 확인하고, 필요한 식별정보만 조회한다.
2. **검색:** `lawnb_search`에 법률 쟁점, 공개된 판례 사건번호 등 최소 검색어를 넣는다. `limit`은 필요한 만큼만 설정하며 도구의 최대 20건을 넘기지 않는다. 검색 목록의 제목·서지정보만으로 판시나 사건 동일성을 확정하지 않는다.
3. **서지 확인:** 후보의 `sid` 또는 LAWnB 판례 URL로 `lawnb_get_metadata`를 호출한다. 검색 결과와 상세 결과의 **법원·사건번호·선고일**을 대조한다. 서로 다르거나 핵심 항목이 빠지면 해당 판례를 미확인으로 두고 다른 공식 식별자료와 대조한다. 확인된 서지만 출처 URL과 함께 기록한다.
4. **원문 연계:**
   - LAWnB에서만 확인되는 하급심 판례는 `lawnb_open`으로 확인된 LAWnB 판례 URL을 사용자의 브라우저에 연다. 사용자에게 원문 직접 확인을 안내하고, 모델이 원문을 읽었다거나 판시 내용을 검증했다고 쓰지 않는다.
   - 대법원 등 공공 공개 판례의 본문 분석이 필요하면 현재 세션에 실제 제공된 공공 판례 검색·본문 조회 도구를 먼저 확인한다. 확인한 사건번호로 공공 원문 후보를 찾고 사건번호·법원·선고일을 대조한 뒤, 실제 원문 텍스트를 읽을 수 있는 경우에만 그 **공공 원문**을 근거로 분석한다. 제공되지 않은 MCP나 도구 이름을 추정하지 않으며, 공공 원문을 찾지 못하면 본문 판단을 보류한다.
5. **결과 보고:** 판례별 법원·사건번호·선고일·LAWnB 판례 URL, 서지 대조 결과, 실제 확인한 원문 출처를 구분해 제시한다. 원문을 보지 못한 판례의 판시나 적용 결론은 단정하지 않는다.

## 주의사항과 안전 경계

- `metadata-only` 경계를 지킨다. LAWnB 유료 판례 전문을 자동으로 수집·복사·저장하거나 모델 컨텍스트로 대량 반입하지 않는다. 브라우저 자동화, 다른 스크래퍼, 우회 URL로 이 경계를 넘지 않는다.
- 기관망 IP와 서비스 이용 조건을 보호한다. 광범위·반복 검색이나 대량 조회를 피하고, 같은 목적의 검색을 여러 도구에서 불필요하게 되풀이하지 않는다.
- 검색어·공유 산출물·예시에는 민원인 성명, 연락처, 내부 사건 식별자, 비공개 사건자료를 넣지 않는다. 필요한 경우 공개된 법률 쟁점이나 판례 사건번호로 바꿔 검색한다.
- LAWnB 메타데이터, 사용자가 브라우저에서 확인한 원문, 모델이 실제로 읽은 공공 판례 원문을 혼동하지 않는다. 법령·판례의 현재 효력이나 후속 변경이 결론에 중요하면 별도 공식 출처에서 확인한다.

