# KOI SENSORY MAP

코이노커피가 취급하는 커피를 손님이 직접 탐색하고 취향을 발견할 수 있는 **공개형 Coffee Knowledge &
Discovery Platform**입니다. 손님용 사이트(취향 찾기, 원두 탐색, 비교, 사전, 브루 가이드, 저널,
납품 문의)와 바리스타가 개발자 없이 직접 운영하는 관리자 CMS로 구성되어 있습니다.

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
- [PNG / QR 내보내기](#png--qr-내보내기)
- [데이터 백업 (기존 원두 관리 화면)](#데이터-백업-기존-원두-관리-화면)
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

- **홈** — Hero, 현재 소개 중인 원두(Featured), Character 찾기, 취향 찾기 CTA, 3단계 설명, Brew
  Guide/저널 미리보기, 하단 CTA. 문구는 관리자 사이트 설정에서 수정 가능.
- **Coffee Explorer** (`/coffees`) — 이름·산지·향미 검색 + Character/Origin/Process/Roast
  Type/Flavor Family/Availability 다중 필터. 실제 데이터를 필터링합니다(더미 UI 아님).
- **Coffee Detail** (`/coffees/:slug`) — Hero, CUP CHARACTER(+ "Why this Character?"), KOI
  SENSORY MAP(육각형 레이더 + 수치 + 툴팁 + 품질 순위 아님 안내), Flavor Notes(Family별 그룹핑),
  Origin, Process(값이 없으면 자동 숨김), Roast, 연결된 Brew Guide, Recommended
  For + 데이터 기반 Similar Coffees, 연결된 Story, QR 코드(PNG/SVG 다운로드), 공유 버튼(Web Share
  API 또는 링크 복사), Profile Updated/version 메타 정보.
- **Cup Character** (`/characters`, `/characters/:key`) — 5개 Character 소개 + 상세 페이지(평균
  Sensory 경향 레이더, 해당 Character 원두 목록).
- **Compare** (`/compare`) — 최대 3개 원두를 검색해 추가하면 레이더 오버레이 차트 + 항목별 비교
  표 생성.
- **Find Your Coffee — Taste Finder** (`/discover`) — 5문항(인상/산미/바디/향미 계열/새로움
  선호) 응답을 실제 원두 데이터와 매칭해 Match %·추천 이유와 함께 상위 3종 추천. 채점 로직은
  `src/data/tasteFinder.ts`의 `TASTE_FINDER_WEIGHTS`에서 가중치를 조정할 수 있습니다.
- **Sensory Dictionary** (`/dictionary`) — Flavor Descriptor + 별도 용어(Body, Washed,
  Anaerobic, SL28, Geisha 등)를 카테고리별로 검색.
- **Brew Guide** (`/brew-guide`, `/brew-guide/:slug`) — 장비별 레시피, Pour Timeline, Tips,
  연결된 추천 원두.
- **Stories / Journal** (`/stories`, `/stories/:slug`) — 카테고리별 에디토리얼 콘텐츠.
- **Wholesale** (`/wholesale`) — 실제로 저장되는 납품 문의 폼(관리자 "납품 문의" 메뉴에서 확인).
- **About Sensory Map** (`/about-sensory-map`) — Character/Sensory 읽는 법 안내.
- **404 페이지** — 잘못된 주소 접근 시 안내 + 홈 이동 버튼.

### 관리자 (Admin, `/admin/*`, 비밀번호 보호)

- **대시보드** — 전체/공개/초안 원두 수, 새 문의 수, 빠른 등록 링크, 데모 원두 8종 추가 버튼.
- **원두 관리** — 검색/Character/상태 필터, 상태(Draft/Published/Archived) 인라인 변경, Featured
  토글, 복제, 삭제(오탐 방지용 2단계 확인), 공개 페이지 미리보기 링크.
- **원두 편집기** — 01 BASIC ~ 12 PUBLISH 12개 탭(기본정보/Character/Flavor/Sensory/산지/
  프로세스/로스팅/Brew 연결/Story 연결·추천문구/미디어/SEO/공개설정) + 오른쪽 실시간 Live
  Preview(실제 공개 카드와 동일) + 그 자리에서 Radar/Full Card PNG 저장.
- **Character 관리** — 5개 고정 Character의 설명/대표 향미/소개 문구/이미지/정렬 순서 수정
  (삭제는 실수 방지를 위해 지원하지 않음).
- **Flavor Library** — Family별 Flavor Descriptor 추가/삭제. 여기서 추가한 향미는 원두 편집기
  Flavor 입력 시 자동완성으로 제안됩니다.
- **Brew Guide 관리** — 목록 + 레시피/Pour Step 편집기.
- **Stories 관리** — 목록 + 본문(빈 줄 = 문단, `## ` = 소제목) 편집기, Draft/Published 상태.
- **납품 문의** — 손님이 제출한 Wholesale 문의 확인, 상태 변경(새 문의/확인함/보관), 삭제.
- **사이트 설정** — 브랜드명, Hero 문구/CTA, 연락처, SNS 링크, SEO 기본값을 코드 수정 없이 변경.

## URL 구조

```
공개
/                              홈
/coffees                       Coffee Explorer
/coffees/:slug                 원두 상세
/characters                    Character 목록
/characters/:key               Character 상세 (clear|vivid|juicy|calm|elegant)
/discover                      Taste Finder
/compare                       원두 비교
/dictionary                    Sensory Dictionary
/brew-guide                    Brew Guide 목록
/brew-guide/:slug              Brew Guide 상세
/stories                       Journal 목록
/stories/:slug                 Story 상세
/wholesale                     납품 문의
/about-sensory-map             평가 기준 안내

관리자 (비밀번호 필요)
/admin                         대시보드
/admin/coffees                 원두 목록
/admin/coffees/new             새 원두
/admin/coffees/:id             원두 편집
/admin/characters              Character 관리
/admin/flavors                 Flavor Library
/admin/brew-guides             Brew Guide 목록
/admin/brew-guides/new|:id     Brew Guide 편집
/admin/stories                 Stories 목록
/admin/stories/new|:id         Story 편집
/admin/settings                사이트 설정
/admin/inquiries                납품 문의함
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
| `Coffee` | 원두 프로파일. 기존 CoffeeProfile 필드(이름/산지/향미/Sensory) + slug, 공개상태, featured, 산지 세부정보, 프로세스, 로스팅, 연결된 Brew Guide/Story, 구매 URL, SEO 등 |
| `Character` | CLEAR/VIVID/JUICY/CALM/ELEGANT 5종 고정, 설명·소개문구·이미지·정렬만 수정 가능 |
| `FlavorFamily` / `FlavorDescriptor` | 향미 계열과 향미 용어 라이브러리 |
| `BrewGuide` | 장비별 추출 레시피 |
| `Story` | 저널 콘텐츠 |
| `SiteSettings` | 사이트 전역 설정 (싱글턴) |
| `Inquiry` | 납품 문의 제출 내역 |
| `DictionaryTerm` | Flavor 외 일반 용어 (Sensory/Process/Variety/General) |

기존에 사용하던 단일 원두 목록(`koi-coffee-profiles` 키)이 브라우저에 남아 있다면, 앱이 처음
로드될 때 자동으로 새 `Coffee` 스키마로 마이그레이션되어 `koi-sensory-map-coffees` 키에
저장됩니다. **기존 키는 삭제되지 않고 그대로 남아 있으므로 데이터 손실이 없습니다.**

## 관리자 사용법

1. 아무 페이지에서 하단 "관리자" 링크(또는 `/admin`)로 이동 → 비밀번호 입력(기본값 `8001`, 변경
   방법은 아래 참고) → 대시보드 진입.
2. **원두 등록**: 대시보드 또는 "원두 관리 → + 새 원두 등록" → 12개 탭을 순서대로 채우고(필수는
   Coffee Name, Country, Character, Sensory 4개 값) 오른쪽 Live Preview로 확인 → 우측 상단
   "저장". 저장 전에는 자동으로 slug가 이름에서 생성되며, 직접 수정도 가능합니다(URL에 사용되므로
   영문/숫자/하이픈 권장).
3. **공개하기(Publish)**: "12 PUBLISH" 탭 또는 목록의 상태 드롭다운에서 `공개`로 바꿔야 손님
   사이트에 노출됩니다. `초안`은 관리자만 볼 수 있고, `보관`은 손님 사이트의 "Past Coffees"
   필터에서만 조회됩니다(판매 종료 원두 자산 보존용, 삭제 아님).
4. **Featured 지정**: 목록의 별 아이콘 또는 편집기 12번 탭에서 체크하면 홈 화면 "현재 소개 중인
   커피"에 노출됩니다.
5. **Character 관리법**: `/admin/characters`에서 5개 고정 Character의 설명·대표 향미·소개
   문구·이미지·정렬 순서만 수정합니다(추가/삭제 불가).
6. **Flavor 관리법**: `/admin/flavors`에서 Family를 고르고 향미 이름(영문/한글)을 추가하면, 원두
   편집기의 Flavor Notes 입력 시 자동완성 목록에 나타납니다. 목록에 없는 향미도 자유 입력으로
   추가할 수 있습니다("Create New" 별도 버튼 없이 바로 입력·저장됨).
7. **이미지 관리법**: 현재는 중앙 Media Library 대신 각 원두/Story/사이트 설정에서 이미지
   **URL**을 직접 입력하는 방식입니다(외부 이미지 호스팅 또는 CDN URL 필요). 로컬 파일 업로드와
   압축을 지원하는 진짜 미디어 라이브러리는 Supabase Storage 연결 이후 지원 예정입니다.
8. **Publish 방법 요약**: Draft로 편집 → Live Preview로 확인 → 상태를 Published로 변경 → 저장.
   즉시 공개 사이트에 반영됩니다(빌드/배포 불필요, 같은 브라우저 기준).
9. **QR 생성법**: 원두 상세 공개 페이지 하단 "SCAN & SHARE"에서 PNG/SVG 다운로드. 관리자
   편집기에서 별도 QR 생성 버튼은 두지 않았으며, 공개 페이지의 QR을 그대로 사용하면 됩니다(같은
   `#/coffees/:slug` URL을 인코딩).
10. **Profile Export 방법**: 원두 편집기 12번 탭 또는 공개 상세 페이지에서 "레이더 차트 PNG"(투명
    배경, 3배 해상도) / "카드 전체 PNG"(흰 배경, 3배 해상도) 저장. 인스타그램 정방형 등 사이즈
    프리셋은 아직 지원하지 않고 카드 원본 비율로 저장됩니다(제한사항 참고).

### 관리자 비밀번호

기본 비밀번호는 `8001`입니다. 한 번 입력하면 같은 브라우저 탭에서는 다시 묻지 않고(세션 저장),
새 탭이나 브라우저를 완전히 종료하면 다시 입력해야 합니다.

> ⚠️ 백엔드가 없는 구조상 비밀번호가 프런트엔드 코드에 그대로 포함되어 있어 개발자 도구로 열어보면
> 확인할 수 있습니다. 손님이 실수로 관리 화면에 들어가는 것을 막는 용도이며, 진짜 보안이 필요한
> 정보(결제 등)에는 사용하지 마세요. 비밀번호를 바꾸려면 `src/constants/auth.ts`의
> `ADMIN_PASSWORD` 값을 수정한 뒤 다시 빌드/배포하면 됩니다.

## 손님용 사이트 사용법

메뉴는 상단 COFFEES / CHARACTERS / DISCOVER / DICTIONARY / BREW GUIDE / STORIES / COMPARE로
어디서나 접근할 수 있습니다(모바일에서는 ☰ 버튼).

- **원두 찾기**: COFFEES에서 필터·검색으로 직접 찾거나, DISCOVER의 5문항 취향 찾기로 추천받습니다.
- **비교하기**: 원두 상세 페이지의 "비슷한 커피 찾기" 또는 상단 COMPARE에서 최대 3개까지 골라
  레이더를 겹쳐볼 수 있습니다.
- **용어가 궁금할 때**: DICTIONARY에서 검색하거나, 원두 상세의 각 Sensory 점수 옆 ⓘ 아이콘을
  누르면 해당 항목의 1~5점 기준이 바로 나옵니다.
- **집에서 내리기**: 원두 상세에 연결된 Brew Guide 카드를 누르면 레시피로 이동합니다.

## PNG / QR 내보내기

- **Radar Chart PNG** — 육각형 레이더 차트만 **투명 배경**으로 저장됩니다. 다른 원두카드
  템플릿 위에 바로 얹어 쓸 수 있습니다.
- **Full Card PNG** — 이름/Character/Flavor/레이더/점수/산지 정보가 포함된 카드 전체를 **흰
  배경**으로 저장합니다.
- 둘 다 3배 해상도(pixelRatio 3)로 저장되어 인쇄물에도 사용할 수 있습니다.
- **QR PNG/SVG** — 원두 상세 페이지 URL을 인코딩한 QR을 즉시 생성해 다운로드합니다(원두카드나
  패키지 인쇄용).

## 데이터 백업 (기존 원두 관리 화면)

`src/utils/csv.ts` / `src/utils/download.ts`에 구축된 기존 백업 유틸은 그대로 남아 있어 필요 시
재사용할 수 있지만, 새 관리자 CMS 화면에는 아직 Export/Import 버튼을 연결하지 않았습니다(남아
있는 제한사항 참고). 지금은 브라우저 개발자 도구 콘솔에서 `localStorage`를 직접 확인하거나, 추후
Import/Export UI를 다시 연결해 사용할 수 있습니다.

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
    seed/                     초기 시드 데이터 (샘플 원두 8종, Character, Flavor, Brew Guide, Story 등)
    repositories/             엔티티별 CRUD 함수 (coffeeRepository, characterRepository, ...)
  pages/
    public/                  손님용 페이지 (Home, CoffeeExplorer, CoffeeDetail, Characters, Compare, ...)
    admin/                   관리자 페이지 (Dashboard, CoffeeList, CoffeeEditor, Characters, Flavors, ...)
  components/               공용 React 컴포넌트
    PublicHeader / PublicFooter    손님용 사이트 상단/하단
    AdminLayout / AdminGate         관리자 레이아웃 / 비밀번호 게이트
    CoffeeCard / CoffeePreview      원두 카드(목록용) / 원두 카드(상세·PNG export용)
    RadarChart / RadarOverlayChart  레이더 차트(단일) / 비교용 오버레이 차트
    QRCodeBlock                     QR PNG/SVG 생성·다운로드
    SEO                             페이지별 <title>/description/OG 태그 (react-helmet-async)
    decorative/KOIStarField         Navy 섹션에 선택적으로 쓰는 절제된 밤하늘 별 accent (아래 참고)
    InfoTooltip / StoryBody / ...   기타 공용 UI
  constants/                 Cup Character, Sensory 평가 기준, 국가 메타데이터, 관리자 비밀번호
  utils/                     storage, csv, download, pngExport, validation
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
- `html-to-image` — PNG export
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

- `npm run build` (`tsc -b && vite build`) — 통과. 빌드 산출물 약 590KB(gzip 186KB)이며, 코드
  분할을 하지 않아 "chunk 500KB 초과" 경고가 표시되지만 빌드 자체는 실패하지 않습니다.
- Chrome 브라우저로 아래 전체 플로우를 직접 실행해 확인했습니다.
  - 홈 → Coffee Explorer(검색/필터) → 원두 상세(모든 섹션, PNG export, QR) → Characters →
    Character 상세 → Compare(레이더 오버레이) → Discover(5문항 → 실제 매칭 결과) → Dictionary
    → Brew Guide 목록/상세 → Stories 목록/상세 → Wholesale(폼 제출 → 관리자 문의함에 반영 확인)
  - 관리자 로그인(정답/오답 모두 확인) → 대시보드 → 데모 원두 8종 추가 → 원두 목록 → 기존 Kenya
    원두 수정(산지 정보 추가, Featured 지정) → 저장 → 공개 사이트에서 즉시 반영 확인(상세 페이지
    필드, 홈 Featured 노출)
  - 레거시 원두 2건(사용자가 실제로 입력한 Kenya 원두 + 기존 Ethiopia 샘플)이 새 스키마로
    자동 마이그레이션되어 데이터 손실 없이 유지되는 것을 확인
  - 404 페이지, 빈 상태(비교 전, 검색 결과 없음 등) 정상 동작 확인
  - 콘솔 에러 없음
- 자동화 E2E(Playwright)나 Lighthouse 점수는 이번 세션에서 실행하지 않았습니다 (제한사항 참고).

## 남아 있는 제한사항

- **백엔드 없음**: 모든 데이터가 LocalStorage에만 저장되어 브라우저/기기 간 공유가 안 됩니다.
  여러 매장 PC나 여러 관리자가 동시에 쓰려면 Supabase 연결이 필요합니다([전환 가이드](#데이터베이스로의-전환-supabase)
  참고).
- **이미지 업로드 미지원**: 현재는 이미지 URL 입력만 가능하고, 로컬 파일 업로드·자동 압축·중앙
  Media Library는 지원하지 않습니다.
- **데이터 Import/Export UI 미연결**: 기존 JSON/CSV export·import 유틸은 코드에 남아 있지만 새
  관리자 화면에는 버튼이 연결되어 있지 않습니다.
- **SEO는 클라이언트 사이드**: Vite SPA이므로 `react-helmet-async`로 `<title>`/메타 태그를
  갱신하지만, JavaScript를 실행하지 않는 크롤러에는 index.html의 기본 태그만 보입니다. 완전한
  서버 렌더링·동적 OG 이미지 생성이 필요하면 Next.js 마이그레이션이 필요합니다(이번 작업 범위
  밖으로 사용자와 확인 후 제외).
- **`sitemap.xml`/`robots.txt` 미생성**: 정적 라우트만으로 구성된 sitemap을 만들 수는 있지만,
  원두별 동적 slug까지 포함하려면 빌드 시점에 데이터를 읽을 백엔드가 필요해 이번 범위에서는
  제외했습니다.
- **자동화 테스트 없음**: TypeScript 컴파일 + 프로덕션 빌드 + 수동 브라우저 워크스루로 검증했으며,
  Playwright E2E나 Lighthouse 자동 측정은 이 환경에 설치되어 있지 않아 실행하지 않았습니다.
- **PNG Export 사이즈 프리셋 없음**: 인스타그램 정사각형/스토리/A6 등 사이즈 선택은 아직
  지원하지 않고, 카드 원본 비율로만 저장됩니다.
- **Character는 5종 고정**: 관리자가 새 Character를 추가/삭제할 수 없습니다(타입 시스템에
  하드코딩됨). 의도된 설계이며, 필요 시 `types.ts`의 `CupCharacter` 유니온 타입 확장이
  필요합니다.
- **Taste Finder 가중치는 코드 레벨**: 관리자 UI에서 가중치를 조정하는 화면은 아직 없고,
  `src/data/tasteFinder.ts`의 상수를 직접 수정해야 합니다.
- **번들 코드 분할 없음**: 빌드 결과가 하나의 JS 청크(약 590KB)로 묶여 있습니다. 실제 운영 전
  `React.lazy` 등으로 라우트별 코드 분할을 적용하면 초기 로딩 속도를 개선할 수 있습니다.
