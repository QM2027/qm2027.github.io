# QM2027 웹앱 로드맵

원칙:
- **성격**: QM2027 조직위원회가 만드는 **방문자 가이드(Jeju Visitor Guide)**. Indico 공식 페이지의 보조 사이트이며, **공식 사이트처럼 보이지 않게** 한다. 등록·프로그램·마감 등 공식 정보는 Indico로 딥링크하고, 차이가 있으면 Indico가 우선한다는 안내를 모든 페이지 하단에 둔다.
- **여행 정보는 풍부하게**: 이 사이트의 주된 가치. Indico 게시판식 페이지로는 불가능한 **상호작용 기능**에 집중한다.
- 모든 화면은 휴대폰(세로·가로) / 태블릿 / 데스크톱을 모두 고려한다.

## ✅ 완료

- [x] 정적 export + basePath 환경변수화 (`NEXT_PUBLIC_BASE_PATH`) — [next.config.ts](../next.config.ts)
- [x] GitHub Pages 배포 워크플로 — [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)
- [x] 반응형 레이아웃: 모바일 하단 탭바 / 태블릿·데스크톱 상단 내비, safe-area, 다크모드
- [x] `/explore` 인터랙티브 지도 (카테고리·우천 필터, 거리/시간, Kakao·Naver 딥링크, 추천 코스, URL 공유)
- [x] `/getting-there` 공항→ICC 비교 + 택시 기사용 한국어 카드
- [x] 홈: 카운트다운, 기능 카드, Indico 딥링크 허브 — [src/data/indico-links.ts](../src/data/indico-links.ts)
- [x] `/program` 임시 페이지 (Indico 타임테이블 링크)
- [x] 방문자 가이드 브랜딩("QM2027 Jeju Visitor Guide"), 공통 푸터에 "공식 정보는 Indico" 안내
- [x] `/venue` 도식 평면도 (층 탭, 방 상세, 시설 찾기)
- [x] `/explore/season`, `/explore/food`, `/explore/run`, `/explore/science` (4단계)
- [x] `/explore/plan`, `/explore/companions`, `/explore/hallasan`, `/travel` (5단계)
- [x] PWA, `/explore/passport`, `/explore/korea`, 사진 스폿 필터 (6단계)

## 🚨 배포 전 필수

- [ ] 장소 좌표 검증 (Kakao/Naver Map 대조) — [src/data/places.ts](../src/data/places.ts)
- [ ] ICC Jeju 좌표 검증 — [src/lib/geo.ts](../src/lib/geo.ts) `ICC`
- [ ] 공항버스 600 요금·소요시간·승차 위치, 택시·렌터카 요금 확인 — [src/app/getting-there/page.tsx](../src/app/getting-there/page.tsx)
- [ ] 러닝 코스 경로를 실제 GPX로 다시 그리기 — [src/data/runs.ts](../src/data/runs.ts)
- [ ] 시즌 날짜(개화 예상, 들불축제·걷기대회 2027 일정) 확인 — [src/data/season.ts](../src/data/season.ts)
- [ ] 스탬프 투어 체크인 반경 현장 테스트 — [src/data/passport.ts](../src/data/passport.ts)
- [ ] 국내선 소요시간·환승 안내 확인 — [src/data/korea.ts](../src/data/korea.ts)
- [ ] 한라산 탐방로 거리·고도·예약 규정·입산 통제시간 확인 — [src/data/hallasan.ts](../src/data/hallasan.ts)
- [ ] `/travel` 실용정보(택스리펀드 기준, 비자/K-ETA, 제주 무사증) 확인 — [src/app/travel/page.tsx](../src/app/travel/page.tsx)
- [ ] 음식 설명·식이 분류, 한국어 문구 원어민 검수 — [src/data/food.ts](../src/data/food.ts)
- [ ] 택시 카드 주소(ICC, 서귀포의료원) 확인 — [src/components/TaxiCard.tsx](../src/components/TaxiCard.tsx)
- [ ] GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 설정
- [ ] 커스텀 도메인 전환 시: Pages 설정에 도메인 등록 + `public/CNAME` 추가 (basePath는 워크플로가 자동 처리)

## 📋 다음 작업 (우선순위 순)

### 3. 회의장 인터랙티브 평면도 `/venue` (도식 버전 완료)
- [ ] ICC Jeju 층별 평면도 원본 확보 (PDF/이미지) → SVG화
- [x] 층 전환 탭, 방 클릭 시 정보 표시, 시설 찾기(하이라이트), URL 공유
- [x] (도식) 등록데스크, 포스터 구역, 커피브레이크, 화장실, 수유실/Child care, 엘리베이터 표시
- [ ] 실제 방 이름·배치로 [src/data/venue.ts](../src/data/venue.ts) 교체, Indico 방 이름 매핑

### 4. 관광 확장 1차 ✅
- [x] **A. March in Jeju 시즌** `/explore/season` — 유채꽃, 왕벚꽃, 들불축제(2027 개최 여부 확인), 한라봉·천혜향 제철; 학회 날짜(3/21~27)와 겹치는지 타임라인 표시
- [x] **D. 먹거리 가이드** `/explore/food` — 제주 음식 Must-try 체크리스트(localStorage), 식이 필터(vegetarian/vegan/halal/gluten-free/해산물 알레르기), 한국어 주문 문구
- [x] **C. 아침 산책·러닝 코스** `/explore/run` — 3개 코스, GPX 다운로드, 학회 기간 일출·일몰
- [ ] (C 후속) 고도 프로파일 — 실제 GPX/DEM 데이터 확보 후
- [x] **E. Physicist's Science Trail** `/explore/science` — UNESCO 지질 명소 해설, 천문대, 학회 기간 월령·별보기 조건

### 5. 관광 확장 2차 + 도구 ✅
- [x] **B. 자유시간 플래너** `/explore/plan` — 가용 시간 + 이동수단 → 추천; Open-Meteo 예보로 비/강풍 시 실내 우선; 일출·일몰 반영
- [x] **F. 동반자·가족 프로그램** `/explore/companions` — 아이 친화·휠체어 접근 필터
- [x] `/travel` (툴킷) — 실시간 날씨(Open-Meteo), 환율 변환기(Frankfurter), 한국어 문구 카드, 비상 연락처(112/119/1330), 교통카드·eSIM 팁
- [x] `/explore/hallasan` — 한라산 탐방로 비교(거리·고도 프로파일·예약), Indico Hallasan 페이지 링크
- [x] `places.ts`: `family`/`accessible` 태그 추가 (플래너·동반자 필터)
- [ ] 장소별 실제 영업시간 (`openHours`) — 현재 플래너는 유형별 추정 마감시간 사용 (`closingMin` in [src/lib/planner.ts](../src/lib/planner.ts))

### 6. 관광 확장 3차 + PWA (대부분 완료)
- [x] **G. Jeju Passport 스탬프 투어** `/explore/passport` — Geolocation 체크인, localStorage, 배지 공유 이미지(canvas / Web Share)
- [x] **H. Korea 연계 여행** `/explore/korea` — 서울·대전·부산/경주·인천 귀국 경로, Satellite meetings 링크
- [x] **I. 기념품·쇼핑** + 면세/택스리펀드 안내 (`/travel` "Souvenirs", "Money")
- [x] **J. 사진 스폿** — 지도 "📸 Photo spots" 필터(`?photo=1`), 해시태그 #QM2027Jeju
- [x] PWA: manifest, 아이콘(192/512/maskable/apple), `public/sw.js`(페이지 precache, 지도 타일 600장 캐시), 설치 배너(iOS 안내 포함)
- [ ] **실기기 검증**: Android Chrome 설치 → 비행기 모드로 페이지·본 지도 열람, iOS Safari 홈 화면 추가
- [ ] 새 페이지 추가 시 `public/sw.js`의 `SHELL` 목록에도 추가 (자동화 검토)
- [ ] Satellite meetings 날짜·장소 기입 (현재 각 사이트 링크만)
- [ ] SEO/OG 이미지, 접근성 점검(키보드·스크린리더), Lighthouse

### 7. 데이터 보강
- [ ] 한국관광공사 TourAPI 4.0 영문 서비스 키 발급(data.go.kr) → 빌드 타임에 장소·축제·이미지 메타데이터 보강, 키는 GitHub Secrets
- [ ] 제주관광공사 / 제주컨벤션뷰로 MICE 지원 문의 (사진 라이선스, 문화공연, 웰컴키트, 쿠폰) — 조직위 담당

### 8. Indico 연동 ✅ (QM2025 데이터로 검증, QM2027 시간표 공개 대기)
- [x] [scripts/sync-indico.mjs](../scripts/sync-indico.mjs) — 타임테이블 export → `public/data/program.json` (실패 시 기존 스냅샷 유지, 내용이 바뀔 때만 기록, 변경 내역 diff)
- [x] [.github/workflows/sync-indico.yml](../.github/workflows/sync-indico.yml) — cron(6h, 3/15–28은 30분) + 수동 실행, 변경 시 커밋 → `gh workflow run deploy.yml`
- [x] `/program`: 일자별 세션(병렬 세션 나란히), NOW 표시, 발표 상세 패널, Indico 링크
- [x] My schedule (localStorage), 시간 겹침·변경 경고, `.ics` 내보내기
- [x] 검색 (제목·발표자·소속·초록, 클라이언트 필터 — 의존성 없음)
- [x] Updates 탭 (moved / added / removed)
- [x] 평면도 방 카드 "Now / Next" — `venue.ts`의 `indicoRooms`에 Indico 방 이름 매핑 필요
- [x] CORS 확인: Indico export는 CORS 헤더 없음 → 클라이언트 직접 조회 불가, 빌드 타임 동기화만 사용
- [ ] 초록 수식(KaTeX) 렌더링 — 실제 초록 형식 확인 후 결정
- [ ] 포스터 보드 번호 검색 (`board` 필드는 저장 중)
- [ ] 첫 실제 동기화 후 화면 점검 (방 이름, 세션 색상, 초록 형식)

## 💡 서버가 필요한 기능 (필요 시 Vercel 전환)
- 일정 변경 푸시 알림
- talk Q&A / 평점
- 참가자 "같이 가요" 저녁·관광 모임 게시
- 지도 Kakao Map JS SDK로 교체 검토 (도메인 등록 키, 정적 호스팅에서도 가능)

## 메모
- `cacheComponents`는 `output: "export"`와 호환되지 않아 비활성화함.
- Git Bash에서 로컬 빌드 시 basePath 경로 변환 방지: `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/qm2027_pwa npm run build`
- 헤드리스 Chrome은 창 너비 최소값(~500px)이 있어 모바일 스크린샷은 iframe(390×844 등)으로 확인할 것.
