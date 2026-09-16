---
name: admin-source-lookup
description: Use for Korean administrative 법적용어, 담당부서 확인, 자료검색, 법령 검색, 웹 PDF, 고시, 조례, 필지, or 브이월드 대체조회. Prefer dedicated official sources, use Web only to discover an unknown official URL when needed, and keep Firecrawl off the default path. Do not use for generic tech, news, or place research, and do not scrape staff lists.
metadata:
  short-description: Administrative source lookup dispatcher
---

# Admin Source Lookup

민원·행정에서 외부 공식자료를 확인할 때의 분기 스킬이다. 상세 검색 도구 선택 규칙을 복제하지 않고 기존 전문 스킬과 이 starter의 `guides/WEB_SEARCH.md` 검색 정본으로 연결한다.

## Core Workflow

1. 첨부·사건폴더 원문을 먼저 확인한다. 이미 있는 고시·공문·도면·회신으로 충분하면 외부 검색을 시작하지 않는다.
2. 대상별 전용 경로를 먼저 고른다.
   - 법령·조례·행정규칙: `guides/BASE_INSTRUCTIONS.md` 17·17-1·17-2와 사용 가능한 법령정보 공식 경로. 절차 본문은 복제하지 않는다.
   - 화성시 담당부서·담당자: `hwaseong-staff-lookup`. 직원명단 스크래핑 금지.
   - 필지·토지이용: 브이월드 MCP 등 전용 공식 경로. 장애 시 다른 공식 지적·토지이용 서비스 또는 사용자 화면을 우선한다.
   - 웹 PDF: 일반 Chat의 네이티브 PDF 원문 확인 기능이 있으면 그 기능을 사용한다. Codex·로컬 파일 판독이면 PDF를 확보한 뒤 `pdf-reading-kit`을 적용한다. Firecrawl PDF 파싱은 사용하지 않는다.
   - 남은 공식 HTML: 공식 URL이 확인되면 해당 페이지만 직접 읽는다.
3. 공식 URL을 모를 때는 Web 검색을 **공식 원문 발견용으로 최소 사용**할 수 있다. 공식 원문을 찾으면 검색결과 스니펫이 아니라 원문에서 확인하고, 같은 질문을 여러 검색 도구에 연속 호출하지 않는다.
4. 도구 선택이 애매하거나 전용 도구 실패 후 fallback, Firecrawl 사용 여부, 크레딧 통제가 실제 쟁점이면 `guides/WEB_SEARCH.md`를 읽고 따른다. 평범한 전용 경로 조회마다 기계적으로 읽지 않는다.
5. 확인하지 못한 원문은 추정하지 않고 `확인 필요`로 남긴다.

## References

- `guides/WEB_SEARCH.md` — 민원·행정 자료검색의 도구 선택·fallback·크레딧 통제 정본. 필요한 경우에만 읽는다.
- `hwaseong-staff-lookup` — 화성시 담당부서·담당자.
- `pdf-reading-kit` — 파일로 확보한 PDF 판독. private GitHub PDF 획득은 `skills/pdf-reading-kit/references/GITHUB_PDF_SOURCE_HANDOFF.md`를 따른다.
- `guides/BASE_INSTRUCTIONS.md` 17·17-1·17-2 — 법령 확인.

## Boundaries

- 일반 기술·뉴스·장소 검색은 이 스킬의 대상이 아니며, 현재 실행환경과 사용자가 정한 일반 검색 정책을 따른다.
- GitHub 파일은 GitHub 플러그인/MCP로 읽고 Firecrawl로 읽지 않는다.
- 실제 조회 입력에는 현재 작업에 필요한 최소 식별자만 쓴다. 필지·건축물 조회의 지번·주소처럼 조회키 자체가 필요한 경우는 사용할 수 있다.
- 민원인 성명·연락처·내부 식별자는 필요하지 않으면 검색어에 넣지 않고, 재사용 예시·로그에는 사건 고유 식별자를 남기지 않는다.
- 일반 Chat에서 공식 웹 PDF를 네이티브 기능으로 직접 확인할 수 있으면 그 경로를 막지 않는다. 실제 원문 판독이 불가능할 때만 공식 주소 제시 또는 첨부 요청으로 전환한다.
