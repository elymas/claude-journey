# Claude Field Notes

클로드 정복 퀘스트의 전체 지도와 8개 주차를 담은 학습 사이트. Astra 참조안과 비교해 네이비·코퍼 표지와 아이보리 탐험 기록집 본문을 조합했다.

```sh
npm install
npm run dev
```

개발 서버 기본 주소는 http://localhost:5173 이다. `npm run build`로 정적 배포용 `dist/`를 만든다.

## GitHub Pages

배포 주소: **https://elymas.github.io/claude-journey/**

`main`에 푸시하면 GitHub Actions가 본문 검사 → 빌드 → 경로 검사 → Pages 배포를 수행한다. 저장소의 Pages Source는 **GitHub Actions**를 사용한다. 기본 토큰 외 별도 배포 키는 필요하지 않다.

GitHub 프로젝트 경로로 로컬 빌드를 검증하려면:

```sh
npm run check:content
VITE_BASE_PATH=/claude-journey/ npm run build
VITE_BASE_PATH=/claude-journey/ node scripts/check-dist.mjs
```

개발 서버에서는 `/`, Pages에서는 `/claude-journey/`를 사용한다. 주차별 HTML 주소를 직접 열거나 새로고침할 수 있다. 참조용 `refer/`와 원본 수집·OCR 중간 자료는 저장소와 배포 결과에서 제외한다.

- [설계와 구현 범위](CLONE_DESIGN.md)
- [Astra 비교와 채택 결과](design/ASTRA_COMPARISON.md)
- [최종 이미지 생성 프롬프트](design/asset-prompts.json)
- `npm run check:content` — 본문·퀴즈·파일 참조 검사
- 8개 주차, 217개 장면, 51개 퀴즈, 새 배경·캐릭터 7개
- 목차, 복사, 실습 체크, 확대 보기, 브라우저 내 진행 기록

`public/lessons/`는 바로 실행할 수 있는 정적 콘텐츠다. 준비 스크립트는 조사 중 확보한 로컬 원본과 OCR 자료를 사용하는 제작 도구이며, 실행·배포 시에는 필요하지 않다. 작은 스크린샷 안의 텍스트는 OCR을 거쳐 재구성되어 일부 오인이 남을 수 있다. 실습용 원문과 복사 가능한 주문서는 슬라이드 본문에 보존했다.
