# HWPX Kordoc Runtime — Starter

직원별 독립 저장소에서 사용할 경량 Kordoc HWPX 런타임입니다.

- Node.js 20 이상
- `npm install --omit=optional --ignore-scripts --no-audit --no-fund`
- `npm run check`
- `npm test`
- `node src/cli.mjs --help`

의존성은 `package.json`에서 exact pin합니다. Starter의 첫 검증 실행은 lockfile을 전제로 하지 않으며, 이후 독립 저장소에서 `package-lock.json`을 생성·커밋해 재현성을 강화할 수 있습니다.

실제 업무 HWPX, 추출 Markdown, JSON, 생성 결과와 `node_modules`는 저장소에 커밋하지 않습니다.
