# HWPX Kordoc Runtime — Starter

직원별 독립 저장소에서 사용할 경량 Kordoc HWPX 런타임입니다. 현재 reusable runtime은 원본 `m1`의 검증된 HWPX 작성 경로를 기준으로 **Kordoc 4.12.0**에 맞춥니다.

- Node.js 20 이상
- `npm install --omit=optional --ignore-scripts --no-audit --no-fund`
- `npm run check`
- `npm test`
- `node src/cli.mjs --help`

의존성은 `package.json`에서 exact pin합니다. Starter의 첫 검증 실행은 lockfile을 전제로 하지 않으며 workflow가 실행 중 lockfile을 생성해 artifact에 포함합니다. 템플릿으로 복제한 독립 저장소는 자신의 첫 성공 실행에서 runtime artifact를 새로 생성합니다.

실제 업무 HWPX, 추출 Markdown, JSON, 생성 결과와 `node_modules`는 저장소에 커밋하지 않습니다.
