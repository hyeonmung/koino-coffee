# KOINO SENSORY MAP

코이노커피 원두 프로파일 관리 및 육각형 레이더 차트 생성 웹앱입니다.

바리스타가 원두 정보와 6가지 관능(Sensory) 점수를 입력하면 실시간으로 육각형 레이더 차트가 그려지고,
원두카드·SNS·온라인몰에 사용할 수 있도록 고해상도 PNG로 저장할 수 있습니다. 손님들은 산지(국가)별로
분류된 갤러리 화면에서 매장이 취급하는 원두의 프로파일을 둘러볼 수 있습니다. 모든 데이터는 브라우저에
저장되며 인터넷 연결 없이도 동작합니다.

## 목차

- [설치 방법](#설치-방법)
- [실행 방법](#실행-방법)
- [Build 방법](#build-방법)
- [화면 구성](#화면-구성)
- [손님용 갤러리 사용 방법](#손님용-갤러리-사용-방법)
- [관리자 비밀번호](#관리자-비밀번호)
- [관리자(바리스타) 페이지 사용 방법](#관리자바리스타-페이지-사용-방법)
- [데이터 저장 방식](#데이터-저장-방식)
- [PNG 저장 방법](#png-저장-방법)
- [데이터 백업 방법](#데이터-백업-방법)
- [주요 폴더 구조](#주요-폴더-구조)
- [기술 스택](#기술-스택)
- [알려진 제한사항](#알려진-제한사항)

## 설치 방법

Node.js가 설치되어 있어야 합니다 (권장: Node 18 이상). 프로젝트 폴더에서 아래 명령어를 실행해
필요한 패키지를 설치합니다.

```bash
npm install
```

## 실행 방법

개발 서버를 실행하면 로컬에서 앱을 바로 사용해볼 수 있습니다.

```bash
npm run dev
```

터미널에 표시되는 주소(기본적으로 `http://localhost:5173`)를 브라우저에서 열면 됩니다.
코드를 수정하면 화면이 자동으로 갱신됩니다.

## Build 방법

매장 PC 등에 배포할 정적 파일을 만들려면 아래 명령어를 실행합니다.

```bash
npm run build
```

`dist` 폴더에 결과물이 생성됩니다. `npm run preview` 명령으로 빌드 결과를 로컬에서 미리 확인할 수
있습니다.

## 화면 구성

앱은 두 영역으로 나뉩니다.

- **손님용 갤러리** (`/` , `/gallery/...`) — 산지(국가)별로 분류된 원두를 손님이 둘러볼 수 있는
  화면입니다. 편집 기능은 없고 조회와 PNG 저장만 가능합니다.
- **평가 기준 안내** (`/guide`) — CUP CHARACTER 5종과 Sensory 6개 항목의 1~5점 기준을 손님도 볼 수
  있도록 정리한 화면입니다. 갤러리 상단 "평가 기준 안내" 링크로 이동합니다.
- **관리자(바리스타) 페이지** (`/admin`) — 원두를 입력·수정·삭제하고 데이터를 백업하는 화면입니다.
  기존 STEP 1~7 입력 흐름 그대로이며, 비밀번호를 입력해야 들어갈 수 있습니다.

각 화면 상단에서 "갤러리 보기" / "관리자" 링크로 두 화면을 오갈 수 있습니다.

## 손님용 갤러리 사용 방법

1. 첫 화면(**산지별 원두 컬렉션**)에는 실제로 원두가 1개 이상 등록된 국가만 카드로 표시됩니다.
   에티오피아, 케냐, 콜롬비아, 파푸아뉴기니, 과테말라, 파나마, 브라질 순으로 우선 정렬되고, 그 외
   국가는 알파벳순으로 뒤에 표시됩니다. 데모용 샘플 원두("ETHIOPIA SAMPLE")는 갤러리에 노출되지
   않습니다.
2. 국가 카드를 클릭하면 해당 산지의 원두 카드 목록(이름, Character, 미니 레이더 차트, Flavor
   Notes)이 표시됩니다.
3. 원두 카드를 클릭하면 원두카드 형태의 상세 화면으로 이동하며, 여기서도 **레이더 차트 PNG** /
   **카드 전체 PNG** 저장이 가능합니다.
4. 새 원두를 국가에 입력하면(관리자 페이지에서) 해당 국가가 존재하지 않았다면 갤러리에 새 카테고리로
   자동으로 나타납니다. 국가명은 대소문자를 구분하지 않고 같은 국가로 묶입니다(예: "kenya"와
   "Kenya"는 같은 카테고리).
5. 원두 카드나 상세 화면의 점수 옆 ⓘ 아이콘에 마우스를 올리면 해당 항목의 1~5점 기준을 바로 확인할
   수 있고, 상단 **평가 기준 안내** 페이지에서는 CUP CHARACTER 5종과 6개 관능 항목 전체 기준을 한
   화면에서 볼 수 있습니다.

## 관리자 비밀번호

`/admin` 페이지는 손님이 실수로 들어가지 않도록 비밀번호로 보호되어 있습니다. 기본 비밀번호는
`8001`입니다. 한 번 입력하면 같은 브라우저 탭에서는 다시 묻지 않고(세션 저장), 탭을 새로 열거나
브라우저를 완전히 종료하면 다시 입력해야 합니다.

> ⚠️ 이 비밀번호는 프런트엔드 코드에 그대로 포함되어 있어(백엔드가 없는 구조상) 개발자 도구로 코드를
> 열어보면 확인할 수 있습니다. 손님이 실수로 관리 화면에 들어가는 것을 막는 용도이며, 진짜 보안이
> 필요한 민감한 정보(결제 정보 등)를 다루는 용도로는 사용하지 마세요. 비밀번호를 바꾸려면
> `src/constants/auth.ts`의 `ADMIN_PASSWORD` 값을 수정한 뒤 다시 빌드하면 됩니다.

## 관리자(바리스타) 페이지 사용 방법

`/admin` 화면 왼쪽 STEP 1~4 순서대로 정보를 입력하면 오른쪽 Live Preview에 실시간으로 원두카드가
그려집니다.

1. **STEP 1 원두 정보** — Coffee Name(필수), Country, Region, Producer/Farm, Variety, Process,
   Altitude, Roast Level을 입력합니다. Country는 갤러리 카테고리 분류 기준이 되므로 일관되게
   입력하는 것이 좋습니다(예: "Kenya"로 통일).
2. **STEP 2 CUP CHARACTER** — CLEAR / VIVID / JUICY / CALM / ELEGANT 중 하나를 선택합니다. 선택한
   Character의 대표 향미와 설명이 아래에 표시됩니다.
3. **STEP 3 Flavor Notes** — 입력 후 Enter로 태그를 추가합니다(최대 6개). 태그의 × 버튼으로 삭제할
   수 있습니다.
4. **STEP 4 Sensory Profile** — ACIDITY, SWEETNESS, BODY, FINISH, FLAVOR, ACCESSIBILITY 6개 항목을
   각각 1~5점으로 선택합니다. 항목명 옆 ⓘ 아이콘에 마우스를 올리면 점수별 평가 기준을 확인할 수
   있습니다. 점수를 바꾸면 오른쪽 육각형 레이더 차트가 즉시 갱신됩니다.
5. 입력이 끝나면 **원두 저장 / 변경사항 저장** 버튼을 눌러 저장합니다.
6. 화면 하단 **저장된 원두** 목록에서 검색, Character별 필터, 정렬(이름순/최근 수정순), 불러오기(클릭),
   복제, 삭제를 할 수 있습니다. 삭제 버튼을 누르면 같은 자리에 "정말 삭제" 확인 버튼이 나타나며,
   4초 안에 다시 누르지 않으면 자동으로 취소됩니다.
7. 상단 **+ 새 원두** 버튼을 누르면 새 원두를 처음부터 입력할 수 있습니다.

## 데이터 저장 방식

모든 원두 데이터는 서버 없이 브라우저의 **LocalStorage**에 저장됩니다. 새로고침하거나 브라우저를
껐다 켜도 데이터가 유지됩니다. 단, LocalStorage는 브라우저·기기별로 분리되어 있으므로 다른 PC나
다른 브라우저에서는 데이터를 백업(Export)해서 옮겨야 합니다.

앱을 처음 실행하면 데모용 샘플 원두("ETHIOPIA SAMPLE")가 하나 자동으로 추가됩니다. 목록에
`SAMPLE` 표시가 붙어 있으며, 필요 없으면 삭제해도 됩니다.

## PNG 저장 방법

관리자 페이지의 Export 영역과 갤러리 상세 페이지에서 두 가지 방식으로 PNG를 저장할 수 있습니다.
모두 3배 해상도로 저장되어 인쇄나 미리캔버스·포토샵 작업에 사용해도 화질이 깨지지 않습니다.

- **Radar Chart PNG** — 육각형 레이더 차트만 **투명 배경** PNG로 저장합니다. 다른 원두카드
  템플릿이나 디자인 위에 바로 얹어 쓸 수 있습니다. (`coffee-name-radar.png`)
- **Full Card PNG** — 원두 이름, Character, Flavor Notes, 레이더 차트, 점수, 원산지 정보가 모두
  포함된 카드 전체를 흰 배경 PNG로 저장합니다. (`coffee-name-profile.png`)

파일 이름은 원두 이름을 기준으로 자동 생성됩니다.

## 데이터 백업 방법

Export 영역의 DATA BACKUP 버튼으로 전체 원두 데이터를 파일로 내보내거나 불러올 수 있습니다.

- **Export JSON** — 저장된 모든 원두를 JSON 파일로 내려받습니다. 다른 PC로 옮기거나 백업할 때
  사용합니다.
- **Import JSON** — JSON 파일을 선택하면 데이터를 가져옵니다. 같은 id를 가진 원두는 덮어쓰고,
  새로운 원두는 목록에 추가됩니다.
- **Export CSV** — 엑셀 등에서 열어볼 수 있는 CSV 파일로 내려받습니다.
- **Import CSV** — 아래 컬럼 순서를 지킨 CSV 파일을 불러와 원두를 일괄 추가할 수 있습니다.

```
Coffee Name, Country, Region, Producer, Variety, Process, Altitude, Roast Level, Character,
Note 1, Note 2, Note 3, Note 4, Note 5, Note 6, Acidity, Sweetness, Body, Finish, Flavor, Accessibility
```

Character는 CLEAR / VIVID / JUICY / CALM / ELEGANT 중 하나여야 하며, 점수는 1~5 범위를 벗어나면
자동으로 가까운 값으로 보정됩니다.

## 주요 폴더 구조

```
src/
  pages/               라우트 단위 화면
    GalleryHomePage.tsx     손님용 갤러리 홈 (산지 카테고리 그리드)
    GalleryCountryPage.tsx  산지별 원두 카드 목록
    GalleryDetailPage.tsx   원두 상세(전체 카드) + PNG export
    GuidePage.tsx            손님용 평가 기준 안내 페이지
    AdminPage.tsx            바리스타 관리 페이지 (입력/저장/백업)
  components/          화면을 구성하는 React 컴포넌트
    CoffeeForm.tsx           원두 기본 정보 입력
    CharacterSelector.tsx    CUP CHARACTER 선택
    FlavorNoteInput.tsx      Flavor Notes 태그 입력
    SensorySlider.tsx        관능 점수 1개 입력(버튼형 슬라이더)
    SensoryProfileInput.tsx  6개 관능 점수 묶음
    RadarChart.tsx           육각형 레이더 차트 (Chart.js, showLabels로 미니/전체 모드 전환)
    CoffeePreview.tsx        원두카드 레이아웃 (PNG export 대상, 관리자·갤러리 상세 공용)
    CoffeeGalleryCard.tsx    갤러리 목록용 축소 원두 카드
    GalleryHeader.tsx        갤러리 공용 헤더(브랜드 로고 + 뒤로가기 + 안내/관리자 링크)
    AdminGate.tsx            관리자 비밀번호 입력 화면
    CoffeeList.tsx           저장된 원두 목록/검색/필터/삭제 (관리자 전용)
    ExportControls.tsx       PNG/JSON/CSV export·import 버튼 (관리자 전용)
    InfoTooltip.tsx          관능 평가 기준 안내 아이콘 (관리자·갤러리 공용)
  constants/           Cup Character, Sensory 평가 기준, 국가 메타데이터, 관리자 비밀번호, 샘플 데이터
  utils/               storage(LocalStorage), csv, download, pngExport, countryGrouping, validation
  types.ts             CoffeeProfile, SensoryProfile 등 타입 정의
  App.tsx              라우터(HashRouter) 정의
```

라우팅은 `HashRouter`를 사용합니다(URL이 `/#/gallery/kenya` 형태). 별도 서버 설정 없이 정적 파일을
그대로 열거나 간단한 정적 호스팅에 올려도 새로고침·직접 링크 접근이 항상 정상 동작하도록 하기
위함입니다.

## 기술 스택

- React 19 + TypeScript + Vite
- React Router (HashRouter) — 갤러리/관리자 화면 라우팅
- Chart.js / react-chartjs-2 (레이더 차트)
- Tailwind CSS 4 (스타일링)
- html-to-image (PNG export)
- LocalStorage (데이터 저장, 백엔드 없음)

## 알려진 제한사항

- 데이터는 브라우저 하나에만 저장되므로, 여러 대의 매장 PC에서 함께 쓰려면 JSON Export/Import로
  수동 동기화가 필요합니다.
- CSV Import 시 컬럼 순서가 다르면 정상적으로 인식되지 않습니다.
- 갤러리 산지 카테고리는 원두의 Country 입력값을 기준으로 자동 분류됩니다. 같은 국가라도 표기가
  다르면(예: "Kenya"와 "케냐") 다른 카테고리로 분리되므로, Country는 가급적 통일된 표기로
  입력하는 것이 좋습니다.
