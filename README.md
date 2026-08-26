# KOI COFFEE — 코이노커피 공식 홈페이지

코이노커피(KOI COFFEE)의 공식 브랜드 홈페이지입니다. **KOI SENSORY MAP**(원두 감각 정보를
시각화하는 도구)은 이 사이트를 구성하는 여러 KOI 서브 시스템 중 하나이며, 그 외에도 **KOI CUP
CHARACTER**(취향 성격 분류), **KOI COFFEE CHART**(원두 한눈에 보기), **KOI BREW GUIDE**(추출
가이드)가 함께 사이트를 이룹니다. 메인 내비게이션, 홈 화면, 전체 정보 구조(IA)는 "감각 분석
툴"이 아니라 브랜드 홈페이지로 읽히도록 한글 중심으로 구성되어 있습니다.

손님용 사이트(원두 탐색, 원두 차트, 취향 찾기, 비교, 커피 사전, 브루 가이드, 이야기, 코이노커피
소개, 납품·교육 문의)와 바리스타가 개발자 없이 직접 운영하는 관리자 CMS로 구성되어 있습니다.

현재는 브라우저 **LocalStorage**를 데이터베이스처럼 사용하는 순수 프런트엔드 앱입니다. 서버가
없어도 인터넷 연결 없이 완전히 동작하며, 나중에 Supabase(Postgres) 같은 실제 백엔드로 손쉽게
전환할 수 있도록 데이터 접근 코드를 리포지토리 패턴으로 분리해두었습니다 (자세한 내용은
[데이터베이스로의 전환](#데이터베이스로의-전환-supabase) 참고).

## 목차

- [빠른 시작](#빠른-시작)
- [전체 구현 기능](#전체-구현-기능)
- [URL 구조](#url-구조)
- [데이터 구조](#데이터-구조)
- [관리자 사용법](#관리자-사용법)
- [손님용 사이트 사용법](#손님용-사이트-사용법)
- [원두 차트란](#원두-차트란)
- [PNG / QR / 소셜 이미지 내보내기](#png--qr--소셜-이미지-내보내기)
- [환경 변수](#환경-변수)
- [배포 방법](#배포-방법)
- [데이터베이스로의 전환 (Supabase)](#데이터베이스로의-전환-supabase)
- [주요 폴더 구조](#주요-폴더-구조)
- [기술 스택](#기술-스택)
- [테스트 결과](#테스트-결과)
- [남아 있는 제한사항](#남아-있는-제한사항)

## 빠른 시작

Node.js 18 이상이 필요합니다.

```bash
npm install       # 패키지 설치
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드 (dist/ 생성)
npm run preview   # 빌드 결과 로컬 미리보기
```

## 전체 구현 기능

### 손님용 (Public)

- **홈** (`/`) — 10개 섹션으로 구성되며, 관리자 "홈 관리"에서 섹션별로 노출 여부를 켜고 끌 수
  있습니다: 01 Hero(브랜드 자체 소개) → 02 지금 만날 수 있는 커피(Featured, 첫 항목은 에디토리얼
  강조) → 03 나에게 맞는 커피 찾기 → 04 KOI CUP CHARACTER(카드 나열이 아닌 에디토리얼 리스트) →
  05 KOI SENSORY MAP 소개 → 06 원두 차트 미리보기 → 07 Brew Better → 08 커피 이야기 → 09
  KOI COFFEE 브랜드 소개 → 10 납품·교육 CTA.
- **원두** (`/coffees`) — 이름·산지·향미 검색(상단 헤더 검색창과 연동, `?q=` 쿼리 파라미터 지원)
  + Character/Origin/Process/Roast Type/Flavor Family/Availability 다중 필터.
- **원두 상세** (`/coffees/:slug`) — "깊이 읽기" 페이지. Hero, CUP CHARACTER(+ "왜 이
  Character인가?"), KOI SENSORY MAP(육각형 레이더 + 수치 + 툴팁 + 품질 순위 아님 안내), Flavor
  Notes(Family별 그룹핑), Origin, Process(값이 없으면 자동 숨김), Roast, 연결된 Brew Guide,
  Recommended For + 데이터 기반 Similar Coffees, 연결된 Story, QR 코드, 공유 버튼, "원두 차트로
  한눈에 보기" 버튼(→ `/coffee-chart/:slug`).
- **원두 차트** (`/coffee-chart`, `/coffee-chart/:slug`) — "한눈에 보기" 페이지. 아래
  [원두 차트란](#원두-차트란) 참고.
- **취향 찾기** (`/discover`) — 5문항(인상/산미/바디/향미 계열/새로움 선호) 응답을 실제 원두
  데이터와 매칭해 Match %·추천 이유와 함께 상위 3종 추천.
- **비교** (`/compare`) — 최대 3개 원두를 검색해 추가하면 레이더 오버레이 차트 + 항목별 비교표
  생성.
- **KOI CUP CHARACTER** (`/characters`, `/characters/:key`) — 5개 Character 소개 + 상세
  페이지(평균 Sensory 경향 레이더, 해당 Character 원두 목록).
- **커피 사전** (`/dictionary`, `/dictionary/:id`) — Flavor Descriptor + 일반 용어를
  카테고리별로 검색. 각 용어는 전용 상세 페이지를 가지며 "뜻 → 쉽게 말하면 → 예를 들면" 패턴으로
  설명하고, 해당 향미/용어가 실제로 들어간 원두를 자동으로 연결해 보여줍니다("정보 없음" 문구
  없이, 매칭되는 원두가 없으면 그 섹션 자체를 숨김).
- **브루 가이드** (`/brew-guide`, `/brew-guide/:slug`) — 장비별 레시피, Pour Timeline, Tips,
  연결된 추천 원두.
- **이야기** (`/stories`, `/stories/:slug`) — 카테고리별 에디토리얼 콘텐츠.
- **코이노커피** (`/about`) — 브랜드 스토리 페이지(미션/비전 카드가 아니라 순차적인 스토리
  섹션 구성).
- **납품 · 교육** (`/business`) — 4개 서비스 소개(원두 납품/카페 컨설팅/바리스타 교육/커피
  클래스) + 관심 분야 선택이 포함된 문의 폼. 과거 `/wholesale`은 이 페이지로 리다이렉트됩니다.
- **KOI SENSORY MAP 안내** (`/about-sensory-map`) — Character/Sensory 읽는 법 안내.
- **404 페이지** — 잘못된 주소 접근 시 안내 + 홈 이동 버튼.
- 관리자 로그인 링크는 공개 내비게이션 어디에도 노출되지 않으며, Footer 하단에만 작게
  존재합니다.

### 관리자 (Admin, `/admin/*`, 비밀번호 보호)

- **대시보드** — 전체/공개/초안 원두 수, 새 문의 수, 빠른 등록 링크, 데모 원두 8종 추가 버튼.
- **홈 관리** — Hero 문구/이미지/CTA 수정, Featured 원두 안내(원두 관리의 Featured 토글로
  지정), 홈 10개 섹션 각각의 노출/숨김 체크박스(드래그앤드롭 순서 편집기는 아님 — 의도된
  범위 제한).
- **원두 관리** — 검색/Character/상태 필터, 상태(Draft/Published/Archived) 인라인 변경, Featured
  토글, 완성도(%) 컬럼(관리자 전용 참고용 지표, 손님에게는 노출되지 않음), 복제, 삭제(2단계
  확인), 공개 페이지 미리보기 링크.
- **원두 편집기** — 01 BASIC ~ 12 PUBLISH 탭(기본정보/한글명/Character/Flavor/Sensory/산지/
  프로세스/로스팅/Brew 연결/Story 연결·추천문구/미디어/SEO/공개설정) + 오른쪽 실시간 Live
  Preview. 07 ROAST 탭에서 로스터명, 로스터의 생각(Roaster's Comment), 바리스타의 생각(선택),
  Advanced Roast Data(배치/차지 온도/터닝포인트/옐로우/1차 크랙/드롭/총 시간/디벨롭 타임/디벨롭
  비율/드롭 온도/머신 — 모두 선택 입력, 입력한 값만 공개 화면에 표시됨) 입력. 12 PUBLISH 탭에서
  "원두 차트 노출" 여부와 미리보기 링크 확인 가능.
- **Character 관리** — 5개 고정 Character의 설명/대표 향미/소개 문구/이미지/정렬 순서 수정
  (삭제는 지원하지 않음).
- **Flavor Library** — Family별 Flavor Descriptor 추가/삭제(뜻/쉽게 설명/예시 포함).
- **커피 사전 관리** — 용어 CRUD(영문/한글/분류/뜻/쉽게 말하면/예를 들면). Flavor Notes는 별도로
  향미 관리에서 등록합니다.
- **브루 가이드 관리** — 목록 + 레시피/Pour Step 편집기.
- **이야기 관리** — 목록 + 본문 편집기, Draft/Published 상태.
- **코이노커피 소개 관리** — 인트로 문구 + 스토리 섹션(제목/본문/이미지) 추가·수정·삭제.
- **납품 · 교육 관리** — 인트로 문구 + 서비스 섹션(제목/본문) 추가·수정·삭제.
- **문의 관리** — 손님이 제출한 납품·교육 문의 확인(관심 분야 표시 포함), 상태 변경(새 문의/
  확인함/보관), 삭제.
- **사이트 설정** — 브랜드명, 연락처, SNS 링크, 구매 링크, SEO 기본값을 코드 수정 없이 변경(Hero
  문구는 "홈 관리"로 이동됨).

## URL 구조

```
공개
/                              홈
/coffees                       원두 (Coffee Explorer, ?q= 검색 지원)
/coffees/:slug                 원두 상세 (깊이 읽기)
/coffee-chart                  원두 차트 목록 (한눈에 보기 + 항상 켜진 비교)
/coffee-chart/:slug            원두 차트 상세 (원 스크린 퀵뷰 + 소셜 이미지 export)
/discover                      취향 찾기
/compare                       원두 비교
/characters                    KOI CUP CHARACTER 목록
/characters/:key               Character 상세 (clear|vivid|juicy|calm|elegant)
/dictionary                    커피 사전
/dictionary/:id                용어 상세 (뜻 → 쉽게 설명 → 예시 + 관련 원두)
/brew-guide                    브루 가이드 목록
/brew-guide/:slug              브루 가이드 상세
/stories                       이야기 목록
/stories/:slug                 이야기 상세
/about                         코이노커피 소개
/business                      납품 · 교육 (+ 문의 폼)
/wholesale                     → /business 로 리다이렉트 (하위 호환)
/about-sensory-map             KOI SENSORY MAP 읽는 법 안내

관리자 (비밀번호 필요)
/admin                         대시보드
/admin/home                    홈 관리
/admin/coffees                 원두 목록
/admin/coffees/new             새 원두
/admin/coffees/:id             원두 편집
/admin/characters              Character 관리
/admin/flavors                 Flavor Library
/admin/dictionary              커피 사전 관리
/admin/brew-guides             Brew Guide 목록
/admin/brew-guides/new|:id     Brew Guide 편집
/admin/stories                 이야기 목록
/admin/stories/new|:id         이야기 편집
/admin/about                   코이노커피 소개 관리
/admin/business                납품 · 교육 관리
/admin/inquiries               문의 관리
/admin/settings                사이트 설정
```

라우팅은 `HashRouter`를 사용합니다(URL이 `/#/coffees/kenya...` 형태). 별도 서버 설정 없이 정적
파일을 그대로 열거나 아무 정적 호스팅에 올려도 새로고침·직접 링크 접근이 항상 정상 동작하도록 하기
위한 선택입니다.

## 데이터 구조

`src/data/schema.ts`에 모든 엔티티 타입이 정의되어 있고, `src/data/schema.sql`에는 향후 Supabase로
옮길 때 그대로 사용할 수 있는 Postgres 스키마가 정리되어 있습니다. 현재는 아래 엔티티가 각각
독립된 LocalStorage 키에 저장됩니다.

| 엔티티 | 설명 |
| --- | --- |
| `Coffee` | 원두 프로파일. 기존 필드(이름/산지/향미/Sensory) + `koreanName`, `roaster`, `roasterComment`, `baristaComment`, `roastData`(Advanced Roast Data), `chartVisible`(원두 차트 노출 여부) 등 |
| `Character` | CLEAR/VIVID/JUICY/CALM/ELEGANT 5종 고정, 설명·소개문구·이미지·정렬만 수정 가능 |
| `FlavorFamily` / `FlavorDescriptor` | 향미 계열과 향미 용어 라이브러리(`example` 필드로 "예를 들면" 설명 포함) |
| `BrewGuide` | 장비별 추출 레시피 |
| `Story` | 저널 콘텐츠 |
| `DictionaryTerm` | Flavor 외 일반 용어. `shortDefinition`(뜻)/`detailedDefinition`(쉽게 설명)/`example`(예시) |
| `SiteSettings` | 사이트 전역 설정(싱글턴). `homeSectionVisibility`, `aboutIntro`/`aboutSections`, `businessIntro`/`businessSections` 포함 |
| `Inquiry` | 납품·교육 문의 제출 내역. `interestArea`(관심 분야) 포함 |

기존에 사용하던 단일 원두 목록(`koi-coffee-profiles` 키)이 브라우저에 남아 있다면, 앱이 처음
로드될 때 자동으로 새 `Coffee` 스키마로 마이그레이션되어 `koi-sensory-map-coffees` 키에
저장됩니다. **기존 키는 삭제되지 않고 그대로 남아 있으므로 데이터 손실이 없습니다.**

## 관리자 사용법

1. 아무 페이지에서 Footer 하단 "관리자" 링크(또는 `/admin`)로 이동 → 비밀번호 입력(기본값
   `8001`, 변경 방법은 아래 참고) → 대시보드 진입.
2. **원두 등록**: 대시보드 또는 "원두 관리 → + 새 원두 등록" → 탭을 순서대로 채우고(필수는
   Coffee Name, Country, Character, Sensory 4개 값) 오른쪽 Live Preview로 확인 → 우측 상단
   "저장".
3. **공개하기(Publish)**: "12 PUBLISH" 탭 또는 목록의 상태 드롭다운에서 `공개`로 바꿔야 손님
   사이트에 노출됩니다. 같은 탭에서 "원두 차트 노출" 여부도 함께 결정합니다.
4. **Featured 지정**: 목록의 별 아이콘 또는 편집기 12번 탭에서 체크하면 홈 화면 "지금 만날 수
   있는 커피"에 노출됩니다.
5. **홈 섹션 노출 관리**: `/admin/home`의 "섹션 공개/숨김" 체크박스로 02~10번 섹션을 개별
   on/off할 수 있습니다(01 Hero는 항상 노출).
6. **로스터 코멘트 / Advanced Roast Data**: 원두 편집기 "07 ROAST" 탭에서 입력하면 원두 차트
   상세 페이지(`/coffee-chart/:slug`)에 즉시 반영됩니다. Advanced Roast Data는 입력한 항목만
   공개 화면의 접힌 disclosure에 표시되며, 로스팅 데이터를 임의로 추정해 채우지 않습니다.
7. **커피 사전 항목 추가**: `/admin/dictionary → + 새 용어 추가`에서 영문/한글/분류/뜻/쉽게
   말하면/예를 들면을 입력합니다. 저장하면 즉시 `/dictionary`와 해당 용어 상세 페이지에
   반영됩니다.
8. **문의 확인**: `/admin/inquiries`에서 `/business` 폼으로 들어온 문의를 확인하고 상태를
   변경합니다.
9. **이미지 관리법**: 현재는 중앙 Media Library 대신 각 원두/Story/사이트 설정에서 이미지
   **URL**을 직접 입력하는 방식입니다.
10. **QR 생성법**: 원두 상세 또는 원두 차트 상세 페이지 하단에서 PNG/SVG 다운로드.
11. **Profile / 원두 차트 Export**: 원두 차트 상세 페이지 하단에서 Square/Instagram
    4:5/Story 9:16/A5/A4 프리셋으로 소셜/인쇄용 이미지를 즉시 저장할 수 있습니다.

### 관리자 비밀번호

기본 비밀번호는 `8001`입니다. 한 번 입력하면 같은 브라우저 탭에서는 다시 묻지 않고(세션 저장),
새 탭이나 브라우저를 완전히 종료하면 다시 입력해야 합니다.

> ⚠️ 백엔드가 없는 구조상 비밀번호가 프런트엔드 코드에 그대로 포함되어 있어 개발자 도구로 열어보면
> 확인할 수 있습니다. 손님이 실수로 관리 화면에 들어가는 것을 막는 용도이며, 진짜 보안이 필요한
> 정보(결제 등)에는 사용하지 마세요. 비밀번호를 바꾸려면 `src/constants/auth.ts`의
> `ADMIN_PASSWORD` 값을 수정한 뒤 다시 빌드/배포하면 됩니다.

## 손님용 사이트 사용법

메뉴는 상단 원두 / 원두 차트 / 취향 찾기 / 브루 가이드 / 커피 사전 / 이야기 / 코이노커피 /
납품·교육으로 어디서나 접근할 수 있습니다(모바일에서는 ☰ 버튼, 검색은 ⌕ 아이콘).

- **원두 찾기**: 헤더 검색 또는 "원두" 메뉴에서 필터·검색으로 직접 찾거나, "취향 찾기"의 5문항
  으로 추천받습니다.
- **한눈에 비교하기**: "원두 차트" 목록 자체가 항상 켜진 비교표 역할을 합니다(산미/단맛/바디/
  여운/접근성을 점으로 한 번에 비교). 개별 원두를 눌러 퀵뷰 상세로 들어갈 수 있습니다.
- **용어가 궁금할 때**: "커피 사전"에서 검색하거나, 원두 상세의 각 Sensory 점수 옆 ⓘ 아이콘을
  누르면 해당 항목의 기준이 나옵니다. 사전의 각 용어는 전용 페이지에서 뜻/쉬운 설명/예시와 함께
  실제로 그 향미가 들어간 원두 목록을 보여줍니다.
- **집에서 내리기**: 원두 상세 또는 원두 차트에 연결된 Brew Guide/레시피를 확인할 수 있습니다.

## 원두 차트란

"원두 차트"(`/coffee-chart`)는 기존 "원두 상세"(`/coffees/:slug`, "깊이 읽기")와 다른 목적을
가진 **별도의 두 번째 제품 화면**입니다.

- **목록 화면**은 원두/국가/캐릭터/대표 향미/산미/단맛/바디/여운/접근성을 한 행에 담은 표이며,
  점(dot-scale) 표시가 그 자체로 "항상 켜진 비교"를 겸합니다. 판매 종료 원두는 기본적으로
  숨겨지고 "지난 커피도 함께 보기" 토글로만 노출됩니다.
- **상세 화면**은 한 화면(원 스크린)에 핵심 정보만 압축한 퀵뷰로, Header/Quick Specs/Flavor
  Notes/Sensory Map/Roast Direction/(있을 때만) Advanced Roast Data/(있을 때만) 로스터·바리스타
  코멘트/추천 레시피/QR/소셜 이미지 export 버튼으로 구성됩니다. 로스팅 방향 그래프는 실제
  `roastLevel` 값이 알려진 라벨(Light/Medium/Dark 등)과 일치할 때만 그려지며, 일치하지 않으면
  아무것도 표시하지 않습니다(임의 추정 금지).
- 원두 편집기의 "원두 차트 노출" 체크(기본 노출)를 끄면 해당 원두는 원두 차트에서만 빠지고,
  원두 상세 페이지에는 계속 노출됩니다.

## PNG / QR / 소셜 이미지 내보내기

- **Radar Chart PNG** — 육각형 레이더 차트만 **투명 배경**으로 저장됩니다.
- **Full Card PNG** — 이름/Character/Flavor/레이더/점수/산지 정보가 포함된 카드 전체를 **흰
  배경**으로 저장합니다.
- **원두 차트 소셜 이미지** — 원두 차트 상세 페이지 하단에서 Square / Instagram 4:5 / Story
  9:16 / A5 / A4 프리셋을 선택하면, 카드를 한 번 캡처한 뒤 각 사이즈의 캔버스에 브랜드 배경과
  함께 contain-fit으로 합성해 저장합니다(사이즈별로 카드를 다시 디자인하지 않습니다).
- 카드류는 3배 해상도(pixelRatio 3)로 저장되어 인쇄물에도 사용할 수 있습니다.
- **QR PNG/SVG** — 원두 상세/원두 차트 페이지 URL을 인코딩한 QR을 즉시 생성해 다운로드합니다.

## 환경 변수

현재 버전은 **환경 변수가 필요하지 않습니다**(LocalStorage만 사용). Supabase 연결 시
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등을 `.env`에 추가하는 구조를 권장합니다(아래
참고).

## 배포 방법

정적 SPA이므로 빌드 후 `dist/` 폴더를 아무 정적 호스팅(Netlify, Vercel, Cloudflare Pages, S3,
사내 서버 등)에 올리면 됩니다. `HashRouter`를 사용하므로 별도의 SPA fallback(rewrite) 설정 없이도
새로고침·직접 링크 접근이 정상 동작합니다.

```bash
npm run build
# dist/ 폴더를 정적 호스팅에 업로드
```

## 데이터베이스로의 전환 (Supabase)

1. [supabase.com](https://supabase.com)에서 무료 프로젝트를 생성하고 Project URL과 anon key를
   확인합니다.
2. `src/data/schema.sql`을 Supabase SQL Editor에서 실행해 테이블을 생성합니다.
3. `@supabase/supabase-js`를 설치하고 `src/data/repositories/*.ts`의 각 함수(예:
   `getPublishedCoffees`, `upsertCoffee`)를 동일한 시그니처로 Supabase 쿼리를 사용하도록
   다시 구현합니다. 페이지·컴포넌트는 리포지토리 함수만 호출하므로 이 부분만 교체하면 나머지
   코드는 그대로 동작합니다.
4. Storage 버킷을 만들면 현재 URL 입력 방식인 이미지 필드를 실제 업로드 방식으로 확장할 수
   있습니다.
5. Supabase Auth를 연결하면 현재의 단순 비밀번호 게이트(`AdminGate`)를 진짜 로그인으로 교체할 수
   있습니다.

## 주요 폴더 구조

```
src/
  data/                 데이터 레이어 (LocalStorage, 추후 Supabase로 교체 지점)
    schema.ts               모든 엔티티 타입 정의
    schema.sql               향후 Supabase Postgres 스키마 (문서용)
    localCollection.ts       공통 LocalStorage CRUD 헬퍼
    migrate.ts               레거시 원두 데이터 마이그레이션
    flavorMatch.ts            향미 → Family 매칭 유틸
    similarCoffees.ts         "비슷한 원두" 추천 로직
    tasteFinder.ts            Taste Finder 채점 로직 + 가중치
    completeness.ts           관리자 전용 원두 완성도 heuristic
    seed/                     초기 시드 데이터 (샘플 원두, Character, Flavor, Dictionary, Brew Guide, Story, SiteSettings 등)
    repositories/             엔티티별 CRUD 함수 (coffeeRepository, characterRepository, ...)
  pages/
    public/                  손님용 페이지 (Home, CoffeeExplorer, CoffeeDetail, CoffeeChartIndex/Detail, About, Business, DictionaryDetail, ...)
    admin/                   관리자 페이지 (Dashboard, Home, CoffeeList, CoffeeEditor, Dictionary, About, Business, ...)
  components/               공용 React 컴포넌트
    PublicHeader / PublicFooter    손님용 사이트 상단/하단 (검색 포함)
    AdminLayout / AdminGate         관리자 레이아웃 / 비밀번호 게이트
    CoffeeCard / CoffeePreview      원두 카드(목록용) / 원두 카드(상세·PNG export용)
    RadarChart / RadarOverlayChart  레이더 차트(단일) / 비교용 오버레이 차트
    DotScale / RoastDirection       원두 차트용 점 스케일 / 로스팅 방향 시각화 (데이터 없으면 미표시)
    QRCodeBlock                     QR PNG/SVG 생성·다운로드
    SEO                             페이지별 <title>/description/OG 태그 (react-helmet-async)
    decorative/KOIStarField         Navy 섹션에 선택적으로 쓰는 절제된 밤하늘 별 accent
    InfoTooltip / StoryBody / ...   기타 공용 UI
  constants/                 Cup Character, Sensory 평가 기준, 국가 메타데이터, 관리자 비밀번호
  utils/                     storage, csv, download, pngExport(소셜 사이즈 프리셋 포함), validation
  types.ts                   CoffeeProfile(레거시 기반), SensoryProfile 등 기본 타입
  App.tsx                    라우터(HashRouter) 정의
```

## 기술 스택

- React 19 + TypeScript + Vite (Vite + React Router 유지, Next.js로 마이그레이션하지 않음 —
  이유는 아래 제한사항 참고)
- React Router 7 (`HashRouter`) — 손님/관리자 라우팅
- Chart.js / react-chartjs-2 — 레이더 차트, 비교용 오버레이 차트
- `qrcode` — QR PNG/SVG 생성
- `react-helmet-async` — 페이지별 SEO 메타 태그
- Tailwind CSS 4 — 스타일링 (Deep Navy / Star Yellow / Warm White 브랜드 시스템)
- `html-to-image` — PNG / 소셜 이미지 export
- LocalStorage — 데이터 저장 (Supabase로 교체 가능한 리포지토리 구조)

## Night Sky 브랜드 액센트

Navy 배경이 쓰이는 일부 섹션(Footer, 모바일 메뉴 오버레이, 홈 하단 CTA 밴드)에는 절제된 "밤하늘"
분위기를 더했습니다. 우주 콘셉트가 아니라, 아주 옅은 방향성 그라데이션과 드문드문 배치된 아주
작은 Star Yellow 점(일부는 4-point sparkle)만 사용합니다.

- `src/index.css`의 `.koi-night-sky` 클래스 — Navy 배경 위에 거의 티 나지 않는 방향성 그라데이션.
- `src/components/decorative/KOIStarField.tsx` — 손으로 배치한(랜덤 생성 아님) 14개의 별 점 SVG
  레이어. 타이포그래피가 오는 중앙부는 비워두고, 대부분 아주 느리게(7초 주기) opacity가
  미세하게 변하는 `koi-star` 애니메이션을 사용하며 `prefers-reduced-motion`을 존중합니다.
- 다른 Navy 섹션에 추가로 적용하려면 해당 요소에 `koi-night-sky overflow-hidden relative` 클래스를
  주고 `<KOIStarField />`를 내부 최상단에 넣은 뒤, 콘텐츠에는 `relative` 클래스를 더해 별 레이어
  위로 올려주면 됩니다. 모든 Navy 영역에 반복 적용하지 않는 것이 의도된 디자인입니다.

## 테스트 결과

- `npm run build` (`tsc -b && vite build`) — 통과. 빌드 산출물 약 640KB(gzip 195KB)이며, 코드
  분할을 하지 않아 "chunk 500KB 초과" 경고가 표시되지만 빌드 자체는 실패하지 않습니다.
- Chrome 브라우저로 아래 전체 플로우를 직접 실행해 확인했습니다.
  - 헤더 검색 → `/coffees?q=...` 자동 필터링 확인
  - 관리자 로그인 → 대시보드(새 Korean nav 전체) → 홈 관리에서 Hero 문구 확인 + 섹션 노출/숨김
    토글 → 저장 → 공개 홈 화면에서 즉시 반영 확인 → 다시 원복
  - 코이노커피 소개 관리(`/admin/about`), 납품·교육 관리(`/admin/business`) 편집 화면 렌더링 확인
  - `/business` 문의 폼 실제 제출 → `/admin/inquiries`에 반영 확인 → 삭제로 정리
  - 커피 사전 관리(`/admin/dictionary`)에서 새 용어 생성 → 목록/상세 페이지(뜻/쉽게 설명/예시)
    반영 확인 → 삭제로 정리
  - 원두 차트 목록(`/coffee-chart`, 점 스케일 비교 표) → 상세(`/coffee-chart/:slug`, Quick
    Specs/Sensory Map/Roast Direction/레시피/QR/소셜 export 프리셋) 확인
  - 원두 편집기 07 ROAST 탭에서 로스터 코멘트 + Advanced Roast Data 3개 필드 입력 → 저장 →
    원두 차트 상세에 즉시 반영(로스터 코멘트 표시 + 입력한 필드만 있는 Advanced Roast Data
    disclosure 노출) 확인 → 원복
  - 레거시 원두 데이터가 새 스키마로 마이그레이션되어 유지되는 것을 재확인
- 자동화 E2E(Playwright)나 Lighthouse 점수는 이번 세션에서도 실행하지 않았습니다 (제한사항
  참고). 모바일 뷰포트는 이 환경의 `resize_window` 도구가 실제 렌더링 뷰포트를 바꾸지 못해
  스크린샷으로 직접 검증하지 못했고, 대신 전 페이지에 Tailwind 반응형 클래스(`sm:`/`lg:`/`xl:`)가
  일관되게 적용되어 있는지 코드 리뷰로 확인했습니다.

## 남아 있는 제한사항

- **백엔드 없음**: 모든 데이터가 LocalStorage에만 저장되어 브라우저/기기 간 공유가 안 됩니다.
  여러 매장 PC나 여러 관리자가 동시에 쓰려면 Supabase 연결이 필요합니다([전환 가이드](#데이터베이스로의-전환-supabase)
  참고).
- **이미지 업로드 미지원**: 현재는 이미지 URL 입력만 가능하고, 로컬 파일 업로드·자동 압축·중앙
  Media Library는 지원하지 않습니다.
- **홈/내비게이션 드래그앤드롭 빌더 없음**: 홈 섹션은 순서 고정 + on/off 토글만 지원하며,
  내비게이션 메뉴 구조를 관리자 화면에서 재배치하는 기능은 이번 범위에서 의도적으로 제외했습니다.
- **Stories 리치 텍스트 에디터 없음**: 본문은 여전히 일반 텍스트(빈 줄 = 문단, `## ` = 소제목)
  방식입니다.
- **예약 발행(Scheduled Publishing) 없음**: Draft → Published 전환은 즉시 반영되며, 특정
  시각에 자동 공개하는 기능은 없습니다.
- **실제 로스팅 커브 CSV 업로드 없음**: Advanced Roast Data는 관리자가 직접 입력하는 텍스트
  필드이며, 로스팅 머신에서 내보낸 CSV/로그 파일을 가져와 그래프를 그리는 기능은 없습니다(로스팅
  방향 시각화는 `roastLevel` 라벨 기반의 단순 위치 표시입니다).
- **SEO는 클라이언트 사이드**: Vite SPA이므로 `react-helmet-async`로 `<title>`/메타 태그를
  갱신하지만, JavaScript를 실행하지 않는 크롤러에는 index.html의 기본 태그만 보입니다. 완전한
  서버 렌더링·동적 OG 이미지 생성이 필요하면 Next.js 마이그레이션이 필요합니다(이번 작업 범위
  밖).
- **`sitemap.xml`/`robots.txt` 미생성**: 원두별 동적 slug까지 포함하려면 빌드 시점에 데이터를
  읽을 백엔드가 필요해 이번 범위에서는 제외했습니다.
- **자동화 테스트 없음**: TypeScript 컴파일 + 프로덕션 빌드 + 수동 브라우저 워크스루로 검증했으며,
  Playwright E2E나 Lighthouse 자동 측정은 이 환경에 설치되어 있지 않아 실행하지 않았습니다.
- **모바일 실기기/실뷰포트 스크린샷 미검증**: 이 환경의 브라우저 자동화 도구가 실제 뷰포트
  크기를 바꾸지 못해, 반응형 클래스 적용 여부를 코드 리뷰로만 확인했습니다.
- **Character는 5종 고정**: 관리자가 새 Character를 추가/삭제할 수 없습니다(타입 시스템에
  하드코딩됨). 필요 시 `types.ts`의 `CupCharacter` 유니온 타입 확장이 필요합니다.
- **Taste Finder 가중치는 코드 레벨**: 관리자 UI에서 가중치를 조정하는 화면은 아직 없고,
  `src/data/tasteFinder.ts`의 상수를 직접 수정해야 합니다.
- **번들 코드 분할 없음**: 빌드 결과가 하나의 JS 청크(약 640KB)로 묶여 있습니다. 실제 운영 전
  `React.lazy` 등으로 라우트별 코드 분할을 적용하면 초기 로딩 속도를 개선할 수 있습니다.
