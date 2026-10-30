# QM2027 웹앱 로드맵

원칙: Indico에 이미 있는 텍스트 정보는 복제하지 않고 딥링크만 한다. 이 사이트는 Indico 게시판식 페이지로는 불가능한 **상호작용 기능**에 집중한다. 모든 화면은 휴대폰(세로·가로) / 태블릿 / 데스크톱을 모두 고려한다.

## ✅ 완료

- [x] 정적 export + basePath 환경변수화 (`NEXT_PUBLIC_BASE_PATH`) — [next.config.ts](../next.config.ts)
- [x] GitHub Pages 배포 워크플로 — [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)
- [x] 반응형 레이아웃: 모바일 하단 탭바 / 태블릿·데스크톱 상단 내비, safe-area, 다크모드
- [x] `/explore` 인터랙티브 지도 (카테고리·우천 필터, 거리/시간, Kakao·Naver 딥링크, 추천 코스, URL 공유)
- [x] `/getting-there` 공항→ICC 비교 + 택시 기사용 한국어 카드
- [x] 홈: 카운트다운, 기능 카드, Indico 딥링크 허브 — [src/data/indico-links.ts](../src/data/indico-links.ts)
- [x] `/program` 임시 페이지 (Indico 타임테이블 링크)

## 🚨 배포 전 필수

- [ ] 장소 좌표 검증 (Kakao/Naver Map 대조) — [src/data/places.ts](../src/data/places.ts)
- [ ] ICC Jeju 좌표 검증 — [src/lib/geo.ts](../src/lib/geo.ts) `ICC`
- [ ] 공항버스 600 요금·소요시간·승차 위치, 택시·렌터카 요금 확인 — [src/app/getting-there/page.tsx](../src/app/getting-there/page.tsx)
- [ ] 택시 카드 주소(ICC, 서귀포의료원) 확인 — [src/components/TaxiCard.tsx](../src/components/TaxiCard.tsx)
- [ ] 브랜치 `master` → `main` 변경, 첫 커밋
- [ ] GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 설정
- [ ] 커스텀 도메인 전환 시: Pages 설정에 도메인 등록 + `public/CNAME` 추가 (basePath는 워크플로가 자동 처리)

## 📋 다음 작업 (우선순위 순)

### 3. 회의장 인터랙티브 평면도 `/venue`
- [ ] ICC Jeju 층별 평면도 원본 확보 (PDF/이미지) → SVG화
- [ ] 층 전환 탭, 방 클릭 시 정보 표시
- [ ] 등록데스크, 포스터 구역, 커피브레이크, 화장실, 수유실/Child care, 엘리베이터 표시
- [ ] 방 이름 매핑 테이블 `src/data/rooms.ts` (나중에 Indico 방 이름과 연결)

### 4. 관광 확장 1차
- [ ] **A. March in Jeju 시즌** `/explore/season` — 유채꽃, 왕벚꽃, 들불축제(2027 개최 여부 확인), 한라봉·천혜향 제철; 학회 날짜(3/21~27)와 겹치는지 타임라인 표시
- [ ] **D. 먹거리 가이드** `/explore/food` — 제주 음식 Must-try 체크리스트(localStorage), 식이 필터(vegetarian/vegan/halal/gluten-free/해산물 알레르기), 한국어 주문 문구
- [ ] **C. 아침 산책·러닝 코스** `/explore/run` — 올레 8코스 구간, 3/5/10km 루프, GPX 다운로드, 고도 프로파일
- [ ] **E. Physicist's Science Trail** `/explore/science` — UNESCO 지질 명소 해설, 천문대, 학회 기간 월령·별보기 조건

### 5. 관광 확장 2차 + 도구
- [ ] **B. 자유시간 플래너** `/explore/plan` — 가용 시간 + 이동수단 → 추천; Open-Meteo 예보로 비/강풍 시 실내 우선; 일출·일몰 반영
- [ ] **F. 동반자·가족 프로그램** `/explore/companions` — 아이 친화·휠체어 접근 필터
- [ ] `/toolkit` — 실시간 날씨(Open-Meteo), 환율 변환기(Frankfurter), 한국어 문구 카드, 비상 연락처(112/119/1330), 교통카드·eSIM 팁
- [ ] `/excursions` — 한라산 탐방로 비교(거리·고도 프로파일·입산 통제시간·예약), Indico Hallasan 페이지 링크
- [ ] `places.ts` 필드 확장: `openHours`, `dietary`, `accessibility`, `seasonMonths`

### 6. 관광 확장 3차 + PWA
- [ ] **G. Jeju Passport 스탬프 투어** — Geolocation 체크인, localStorage, 완료 배지 공유 이미지(canvas)
- [ ] **H. Korea 연계 여행** `/explore/korea` — Satellite meetings(서울·대전 등) 연계 전후 이동 플래너
- [ ] **I. 기념품·쇼핑** + 면세/택스리펀드 안내
- [ ] **J. 사진 스폿 레이어** + 해시태그 #QM2027Jeju
- [ ] PWA: `src/app/manifest.ts`, 아이콘(192/512/maskable), `public/sw.js`(앱셸 precache, 지도 타일 캐시 제한, 빌드 해시로 무효화), 설치 안내 배너(iOS 포함)
- [ ] SEO/OG 이미지, 접근성 점검(키보드·스크린리더), Lighthouse

### 7. 데이터 보강
- [ ] 한국관광공사 TourAPI 4.0 영문 서비스 키 발급(data.go.kr) → 빌드 타임에 장소·축제·이미지 메타데이터 보강, 키는 GitHub Secrets
- [ ] 제주관광공사 / 제주컨벤션뷰로 MICE 지원 문의 (사진 라이선스, 문화공연, 웰컴키트, 쿠폰) — 조직위 담당

### 8. (후순위) Indico 연동
- [ ] `scripts/sync-indico.ts` — `/export/timetable/1622375.json`, `/export/event/1622375.json?detail=contributions` → zod 검증 → `src/data/indico/*.json` (실패 시 기존 스냅샷 유지)
- [ ] `.github/workflows/sync-indico.yml` — cron(평시 6h, 학회 주간 30분) + 수동 실행, diff 있을 때만 커밋 → 자동 배포
- [ ] `/program` 본 구현: 일자별 그리드(병렬 세션×방), Now/Next, 세션·talk 상세(KaTeX), Indico 원문 링크
- [ ] My Schedule (localStorage), 시간 겹침 경고, `.ics` 내보내기
- [ ] 오프라인 검색 (minisearch)
- [ ] Program updates (이전 동기화 대비 변경 목록, 저장한 talk 변경 배지)
- [ ] 평면도에 "지금/다음 세션" 연동
- [ ] (검증) Indico export의 CORS 허용 여부 → 허용 시 클라이언트에서 최신 여부 확인 배너

## 💡 서버가 필요한 기능 (필요 시 Vercel 전환)
- 일정 변경 푸시 알림
- talk Q&A / 평점
- 참가자 "같이 가요" 저녁·관광 모임 게시
- 지도 Kakao Map JS SDK로 교체 검토 (도메인 등록 키, 정적 호스팅에서도 가능)

## 메모
- `cacheComponents`는 `output: "export"`와 호환되지 않아 비활성화함.
- Git Bash에서 로컬 빌드 시 basePath 경로 변환 방지: `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/qm2027_pwa npm run build`
- 헤드리스 Chrome은 창 너비 최소값(~500px)이 있어 모바일 스크린샷은 iframe(390×844 등)으로 확인할 것.
