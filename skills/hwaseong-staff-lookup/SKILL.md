---
name: hwaseong-staff-lookup
description: Use when a Hwaseong-si Korean administrative, complaint, audit, investigation, or public-interest report task needs 담당부서, 담당업무, 담당자, 행정번호, 관할, 소재지, 구청/읍면동/본청/사업소 routing, or staff lookup verification. Do not use for generic legal analysis when no Hwaseong department or staff routing is needed.
metadata:
  short-description: Hwaseong department and staff lookup
---

# Hwaseong Staff Lookup

## Core Workflow

모든 담당부서·담당자 확인 업무에서 아래 순서를 기본으로 적용한다. 보건·의약 업무에만 한정된 절차가 아니다.

1. 먼저 대상의 **정확한 소재지·관할, 대상물 또는 업종, 민원·조사 내용, 필요한 행정행위**를 정리한다.
2. 본청·구청·읍면동·보건소·사업소·외부기관 중 어느 기관 단계의 사무인지 판단한다.
3. 기관이나 과를 찾았다고 종료하지 않고, 현재 공개된 업무분장에서 **동·권역, 업종·시설유형, 세부 법정업무, 허가·단속·처분 단계** 등에 따라 담당이 나뉘는지 확인한다.
4. 화성시 직원찾기와 공식 조직·업무분장 자료에서 현재 사건과 가장 직접적으로 일치하는 **담당업무와 담당 행정번호**를 확인한다. 단순 키워드 일치보다 소재지·관할·실제 처리행위의 일치를 우선한다.
5. 현재 공개자료에서 직접 담당업무와 행정번호를 확인할 수 있으면 `기관/과(팀) + 담당업무 + 행정번호 4자리`까지 확인한 뒤 안내한다. **상위 부서명만 확인한 상태에서 검색을 종료하지 않는다.**
6. 동일 업무가 여러 담당자에게 나뉘거나 검색결과가 충돌하면 소재지·업종·처리단계 기준으로 다시 좁히고, 필요하면 부서 업무안내·구청/읍면동 조직도·공문 문의처 등으로 교차확인한다.
7. 현재 공개자료만으로 행정번호를 확정할 수 없는 경우에는 번호를 추정하지 말고 `행정번호 확인 필요`로 남기며, 확인된 부서·업무와 남은 확인사항을 함께 제시한다.
8. 보건·의약 업무는 위 공통 절차에 더해 `references/health_medical_staff_routing.md`의 보건소 권역·업종 세분화 기준을 적용한다.
9. 단순히 현재 직원찾기 결과로 바로 이동하는 링크만 필요한 경우에는 담당자 명단을 별도 저장하지 않고 검색 링크를 생성한다.
10. 전화정보는 원칙적으로 `031-5189-` 뒤 **행정번호 4자리**만 기록·안내한다.

## References

- Read `references/hwaseong_staff_lookup_general_guide.md` for full search and judgment rules. 그 상세 예시가 부서·팀 수준에서 끝나더라도, 이 스킬의 완료 기준인 **직접 담당업무·행정번호까지 확인** 원칙을 우선 적용한다.
- Read `references/health_medical_staff_routing.md` only as an additional specialization for pharmacy, medical institution, medical device, drug wholesaler, safe OTC, narcotics, and other health/medical routing.
- Use `scripts/new_hwaseong_staff_search_links.ps1` when a reusable HTML or CSV index of staff-search result links is useful.
- Use `public-interest-report-review` when staff routing is part of a public-interest report.
- Use `admin-document-base-review` when writing the routing result into an official memo or reply.

## Output Expectations

- 기본 출력은 가능하면 `소재지·관할 근거 → 담당 기관/과(팀) → 직접 담당업무 → 행정번호 4자리` 순으로 제시한다.
- 현재 공개자료에서 직접 담당 행정번호가 확인되면 부서명만 안내하지 말고 그 번호까지 함께 제시한다.
- 담당자가 여러 명이면 현재 사건과 일치하는 세부분장 기준을 밝혀 선택하고, 확정이 어려우면 후보와 확인 필요사항을 구분한다.
- 외부 회신문에는 사용자가 특별히 필요로 하지 않는 한 개인 직원명은 적지 않는다. 내부 업무 안내에서도 성명보다 담당업무와 행정번호를 우선한다.
