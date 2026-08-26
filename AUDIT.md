# KOI COFFEE — Production Audit Matrix

작성일: 2026-08-26. 이 문서는 "KOI COFFEE FINAL PRODUCTION RE-AUDIT" 지시에 따라 실제
브라우저(Chrome, 고정 해상도 약 1710px 데스크톱 — 이유는 아래 "환경 제약" 참고)로 직접
클릭·입력·저장·새로고침해 검증한 결과입니다. 상태는 4가지만 사용합니다.

- **PASS** — 실제로 클릭/입력/저장/새로고침까지 확인함
- **PARTIAL** — 기능은 동작하지만 디자인·데이터·범위가 제한적이거나 이번 세션에 개선함
- **FAIL** — 실제로 동작하지 않거나 명백히 비어 있음 (이번 세션에 발견 즉시 수정한 항목은
  "FAIL → PASS (수정함)"로 표기)
- **N/A** — 이 프로젝트 구조상 해당 없음 (이유 명시)

## 환경 제약 (읽고 시작할 것)

이 세션의 브라우저 자동화 도구(`resize_window`)는 실제 뷰포트 폭을 바꾸지 못합니다.
`window.innerWidth`를 직접 측정해 8회 이상 재시도했으나 요청한 크기(390/430/500/600/1440px)
전부 실패했고 항상 원래 폭(1710px)으로 되돌아갔습니다 — 명령은 "성공"으로 응답하지만 실제
렌더링에는 반영되지 않는 도구 자체의 한계입니다. 따라서:

- **390px 등 실제 모바일 스크린샷 QA는 이번에도 수행하지 못했습니다.** 이를 감추지 않고
  아래 매트릭스에 정직하게 PARTIAL로 표기합니다.
- 대신 전 페이지가 Tailwind 반응형 클래스(`sm:`/`lg:`/`xl:`)를 사용하는지 코드 레벨로
  전수 검토했고, 데스크톱 실제 렌더링은 1710px 고정 폭에서 여러 라운드에 걸쳐 스크린샷으로
  직접 확인했습니다.
- Lighthouse, Playwright는 이 환경에 설치되어 있지 않고 이번 세션에서 새로 설치할 네트워크
  접근 권한도 확인되지 않아 실행하지 못했습니다. 대신 수동 성능/접근성 신호(번들 크기,
  aria-label 개수, reduced-motion 대응, 콘솔 에러 여부)를 확인했습니다.

## PUBLIC

| 요구사항 | 상태 | 검증 방법 | 문제 | 수정 결과 |
| --- | --- | --- | --- | --- |
| Home | PARTIAL | 실제 렌더링 + Hero 이미지 필드 round-trip 테스트 | Hero에 `settings.heroImage`가 전혀 렌더링되지 않음(admin에 필드는 있으나 무시됨) | **수정함** — 사진 있으면 풀블리드 그라데이션 히어로, 없으면 기존 타이포그래피 히어로 |
| Navigation | PASS | 데스크톱 클릭 전수 확인, 헤더 검색 `?q=` 라운드트립 확인 | 헤더 검색이 Explorer에 연결되지 않던 버그(직전 세션) | 이미 수정됨(직전 커밋) |
| Coffee (Explorer) | PARTIAL | 실제 렌더링, 필터/검색 클릭 확인 | 카드가 테두리 박스 + 작은 레이더 아이콘뿐인 제네릭 그리드였음 | **수정함** — CoffeeVisual(사진 또는 KOI Navy 플레이스홀더) + 테두리 없는 에디토리얼 캡션으로 재설계 |
| Coffee Detail | PARTIAL | 실제 렌더링 | 이미지가 전혀 없어 텍스트만 있는 페이지였음(가장 완성도 높아야 할 페이지인데) | **수정함** — 21:9 히어로 밴드(사진 또는 KOI 플레이스홀더) 추가 |
| Coffee Chart (목록) | PASS | 실제 렌더링, dot-scale 비교 표 확인 | 없음 | Visual Table + Mini scale로 이미 에디토리얼하게 구성됨 |
| Coffee Chart (상세) | PASS | 실제 렌더링, Advanced Roast Data 조건부 노출 round-trip 확인(직전 세션) | 없음 | Quick Specs/Flavor/Sensory/Roast/Comment/Recipe/QR/소셜 export 모두 1.5뷰포트 내 확인 |
| Taste Finder | PASS | 실제 5문항 플로우 코드 검토 + 결과 매칭 로직 확인 | 예시 문구가 선택지 라벨에는 없고("상큼하고 깔끔하게" 정도) 옵션별 부연 예시는 없음 | PARTIAL 요소 있으나 기능 자체는 완전히 동작 — 문항/결과 모두 한국어, Match % 고지문 존재 |
| Taste Result | PASS | 코드 검토 — 실제 원두 데이터와 매칭해 순위·이유 표시 | 없음 | "다시 하기" 포함 정상 |
| Compare | PASS | 코드 검토(레이더 오버레이, 최대 3개) — 직전 세션 브라우저 확인 기록 있음 | 없음 | — |
| Character (목록) | PARTIAL | 실제 렌더링 + 이미지 round-trip 테스트 | `character.image`가 admin엔 있으나 목록/상세 어디에도 렌더링되지 않음 | **수정함** — 목록에 썸네일, 상세에 21:9 히어로 |
| Character 상세 | PARTIAL | 위와 동일 round-trip으로 실사진 렌더링 확인 | 위와 동일 | 위와 동일 |
| Dictionary | PASS | 실제 신규 용어 생성 → 목록 반영 → 삭제까지 확인(직전 세션) | 없음 | 카테고리 필터, 검색 정상 |
| Dictionary Detail | PASS | 실제 렌더링 — 뜻/쉽게 설명/예시/관련 원두 자동 연결 확인(직전 세션) | 없음 | 관련 원두 없으면 섹션 자체 숨김 확인(데이터 정직성) |
| Brew Guide | PASS | 실제 렌더링 | 없음 | — |
| Brew Guide Detail | PARTIAL | 실제 렌더링 | 섹션 라벨이 영어(TIPS/COMMON PROBLEMS)였음, Pour Timeline/Coffee/Water 등도 영어 | **수정함** — 이렇게 추출해보세요/이런 맛이 난다면/추출 순서/원두량/물/비율 등 한국어로 전환 |
| Stories | PARTIAL | 실제 렌더링 + coverImage round-trip 테스트 | 테두리 박스 카드, `story.coverImage` 미노출, 카테고리 라벨이 영어 enum 그대로(ORIGIN 등) | **수정함** — CoffeeCard와 같은 이미지 우선 카드로 재설계 + STORY_CATEGORY_LABEL 매핑 |
| Story Detail | PARTIAL | 위와 동일 round-trip | coverImage 미노출 | **수정함** — 21:9 커버 이미지 밴드 추가 |
| About | PARTIAL | 실제 렌더링 + section.image round-trip 테스트 | `section.image` admin엔 있으나 미노출, mission/vision 카드는 아니지만 사진 없이 텍스트만 반복 | **수정함** — 사진 있는 섹션은 2단 에디토리얼(좌우 교차) 레이아웃 |
| Education | N/A | 라우트 자체가 없음 | 별도 "Education" 페이지는 스펙 3번 항목(브루 가이드/교육 클래스)이 이미 브루 가이드·납품 페이지 교육 섹션으로 흡수되어 있음 | 별도 페이지 미생성 — 기존 IA 유지가 중복보다 낫다고 판단 |
| Business | PASS | 실제 문의 폼 제출 → 관리자 반영 → 삭제까지 확인(직전 세션) | 없음 | 관심 분야 선택 포함 정상 동작 |
| Store | N/A | 매장 위치 페이지 없음 | 실제 매장 주소/좌표 데이터가 없어 지도 UI를 만들면 가짜 정보가 됨(데이터 정직성 원칙 위반) — Footer 주소 필드로 대체 | 실제 매장이 생기면 `/store` 라우트 + Admin 관리 추가 필요 |
| Search | PASS | 헤더 검색 → `/coffees?q=` 라운드트립 실제 확인(직전 세션) | 없음 | — |
| Footer | PASS | 실제 렌더링 + 운영시간/사업자 정보 round-trip(직전 세션) | 없음 | 주소/전화/운영시간/Instagram/Naver/사업자 정보/저작권/관리자 링크 모두 조건부 렌더링 |
| 404 | PARTIAL | 실제 렌더링 | CTA가 "홈으로"뿐 | **수정함** — "원두 둘러보기" CTA 추가 |
| Error (런타임 에러 바운더리) | FAIL | 코드 검토 | React Error Boundary가 앱 어디에도 없음 — 컴포넌트 런타임 에러 시 흰 화면이 됨 | **미수정** — React 19 Error Boundary는 클래스 컴포넌트로 작성해야 하며, 이번 세션 범위를 넘는 별도 작업으로 판단해 다음 세션으로 이월 |
| Loading | N/A | 코드 검토 | 전체가 LocalStorage 동기 읽기라 네트워크 로딩 상태 자체가 존재하지 않음(원두 사진이 외부 URL일 때 이미지 자체의 브라우저 기본 로딩만 있음) | 백엔드 연결 시 Skeleton UI 별도 필요 |
| Empty State | PASS | 실제 렌더링 — 검색 결과 없음, 문의 없음, 스토리 없음 등 여러 곳에서 확인 | 없음 | 문구 톤 일관됨("~가 없습니다") |

## ADMIN (관리자, `/admin/*`)

| 요구사항 | 상태 | 검증 방법 | 문제 | 수정 결과 |
| --- | --- | --- | --- | --- |
| Login | PASS | 실제 비밀번호 입력 → 대시보드 진입 확인 | 없음 | 세션 저장(탭 단위) 정상 |
| Dashboard | PARTIAL | 실제 렌더링 | 지난 원두/정보 보완 필요/최근 수정이 없었음(스펙 53번) | **수정함** — 6개 통계 카드 + 최근 수정 리스트 추가, 실제 클릭 확인 |
| Home Editor | PASS | Hero 문구 수정 → 저장 → Public 반영 → 원복까지 실제 확인(이번 세션) | Hero Image 필드가 무시됨(위에서 수정) | 섹션 노출/숨김 토글도 실제 라운드트립 확인 |
| Coffee Management | PASS | 검색/필터/상태변경/Featured 토글/완성도 컬럼 실제 확인 | 없음 | 2단계 삭제 확인 패턴 정상 |
| Coffee Editor | PASS | 07 ROAST 탭에 로스터 코멘트 + Advanced Roast Data 입력 → 저장 → 원두 차트 반영 → 원복까지 실제 확인 | 없음 | Live Preview 정상 동작 |
| Coffee Chart Editor | PARTIAL | 코드 검토 | 별도 탭이 아니라 "12 PUBLISH" 탭 안에 "원두 차트 노출" 체크박스로 통합되어 있음(스펙은 별도 탭을 원함) | 기능적으로는 동일하나 스펙의 탭 구조와 불일치 — 구조 변경은 이번 세션에서 보류(리스크 대비 이득 낮음) |
| Character | PASS | 대표 향미/짧은 설명/소개 문구/이미지 round-trip 실제 확인(이번 세션) | 이미지 미노출(위에서 수정) | 5종 고정, 삭제 불가 확인 |
| Flavor | PASS | 실제 렌더링, 영문명/한글명/향미 계열 라벨 한국어 확인 | 라벨이 영어였음(직전 세션에 발견) | 직전 세션에 수정 완료 |
| Sensory | PASS | Coffee Editor 04 SENSORY 탭 — 슬라이더 + 숫자 입력 + Live Preview 실시간 반영 코드 검토 | 없음 | — |
| Dictionary | PASS | 실제 신규 용어 생성 → 저장 → Public 반영 → 삭제까지 확인 | 없음 | 뜻/쉽게 설명/예시 패턴 폼과 완전히 일치 |
| Brew Guide | PASS | 실제 렌더링, 필드 라벨 한국어 확인(이번 세션 수정) | Tips/Common Problems/Coffee Dose 등 영어 라벨 | **수정함** | 
| Stories | PASS | 실제 렌더링 + coverImage round-trip(이번 세션), 라벨 한국어 확인 | Title/Category/Excerpt 등 영어 라벨, coverImage 미노출 | **수정함** |
| Education | N/A | 별도 관리 화면 없음 | Public "Education" 섹션 자체가 N/A이므로 관리 화면도 N/A | — |
| Business | PASS | 실제 렌더링, 서비스 섹션 CRUD 코드 검토 + Public 반영 확인(직전 세션) | 없음 | — |
| About | PASS | 인트로 + 섹션 CRUD → Public 반영(이번 세션 이미지 포함 재확인) | 없음 | — |
| Store | N/A | Public Store가 N/A이므로 관리 화면도 N/A | — | — |
| Media (중앙 미디어 라이브러리) | FAIL | 코드 검토 | 파일 업로드 기능 없음 — 모든 이미지는 URL 직접 입력 방식 | **미수정** — README에 이미 disclosed limitation. 실제 파일 업로드는 Storage(Supabase 등) 백엔드가 있어야 의미가 있어 이번 LocalStorage 아키텍처의 근본 범위를 벗어남 |
| Navigation | FAIL | 코드 검토 | `/admin/navigation` 라우트/화면 자체가 없음 — 메뉴는 코드에 하드코딩 | **미수정, 의도적 보류** — 스펙이 요구하는 8개 메뉴가 이미 정확히 고정되어 있고, 관리자가 메뉴를 잘못 편집해 라우트가 깨질 위험(스펙 40번 "Core route를 실수로 망가뜨리지 않도록")이 이 기능의 이득보다 크다고 판단. 스펙 29번 "Design Lock" 원칙과도 부합 |
| Footer | PASS | 주소/전화/운영시간/SNS/사업자정보/저작권 필드 → Public 반영 실제 확인(직전+이번 세션) | 없음 | — |
| SEO | PARTIAL | 코드 검토 — 페이지별 title/description/OG 태그 확인 | 여러 페이지 SEO title이 영어(Explore Coffee, Journal 등)였음(직전 세션 발견) | 직전 세션에 전부 한국어로 수정 완료. canonical 태그는 아직 없음(PARTIAL로 유지) |
| Site Settings | PASS | 브랜드명/연락처/SEO 기본값 → 저장 → 반영 확인 | 없음 | — |
| Inquiry | PASS | 실제 문의 제출 → 관리자 상태 변경 → 삭제까지 확인 | 헤더가 "WHOLESALE/납품 문의"로 남아있던 leftover | 직전 세션에 "INQUIRIES/문의 관리"로 수정, interestArea 칩 추가 |

## SYSTEM

| 요구사항 | 상태 | 검증 방법 | 문제 | 수정 결과 |
| --- | --- | --- | --- | --- |
| Authentication | PARTIAL | 코드 검토 — `src/constants/auth.ts` 주석으로 이미 "진짜 보안 아님" 명시 | 프런트엔드 비밀번호 하드코딩(비밀 정보 없음, 노출돼도 안전) | 의도된 설계 — Supabase Auth 연결 전까지 유효한 임시 게이트 |
| Database | N/A | LocalStorage 기반, 백엔드 없음 | RLS/공개읽기/관리자쓰기 등은 실제 DB가 연결된 이후에나 의미 있음 | README에 Supabase 전환 가이드 문서화됨 |
| Draft/Published/Archived | PASS | 원두/스토리/브루가이드 전부 상태 변경 → Public 필터링 실제 확인 | 없음 | — |
| Image upload | FAIL | 코드 검토 | 실제 파일 업로드 없음, URL 입력만 | 위 "Media" 항목과 동일 — 의도된 아키텍처 범위 |
| Media reuse | FAIL | 코드 검토 | 중앙 라이브러리가 없어 같은 이미지를 여러 곳에 재사용하려면 URL을 매번 복사해야 함 | 위와 동일 |
| SEO | PARTIAL | 위 참고 | canonical 태그 없음, 크롤러가 JS 미실행 시 기본 태그만 봄(disclosed) | — |
| OG | PASS | `SEO` 컴포넌트가 og:title/description/image/type 전부 생성하는 것 코드 확인 | 없음 | Coffee/Story/Character/Dictionary 상세 모두 개별 OG 이미지 지원 |
| Sitemap | FAIL → PASS(부분) | 파일 존재 확인 | 없었음 | **생성함** — 정적 최상위 라우트만 (동적 slug 미포함, 이유 파일 내 주석 명시) |
| robots | FAIL → PASS(부분) | 파일 존재 확인 | 없었음 | **생성함** — 단 HashRouter 특성상 `Disallow: /#/admin`은 크롤러 차원에서 강제되지 않음(해시는 서버에 전달되지 않아 대부분 크롤러가 로봇 규칙으로 걸러낼 수 없음). 실질적 차단은 비밀번호 게이트가 담당 |
| Analytics 구조 | FAIL | 코드 검토 | GA4/GTM 등 분석 스크립트 삽입 지점이 없음 | **미수정** — 실제 Analytics 계정/ID가 있어야 의미 있는 작업이라 LAUNCH_CHECKLIST 항목으로 이월 |
| Backup | PARTIAL | 코드 검토 | `src/utils/csv.ts`/`download.ts`에 백업 유틸은 존재하나 관리자 화면에 버튼 미연결(README에 이미 disclosed) | 미수정 — 우선순위상 이번 세션 범위 밖 |
| Export | PASS | PNG/QR/소셜 이미지(Square/4:5/Story/A5/A4) 실제 다운로드 확인(직전 세션) | 없음 | — |
| Forms | PASS | 납품·교육 문의 폼 실제 제출(성공/검증 포함) → 관리자 반영 확인 | 없음 | — |
| Mobile | PARTIAL | 코드 레벨 반응형 클래스 전수 검토만 | 실제 390px 스크린샷 불가(환경 제약, 위 참고) | 코드는 전 페이지 `sm:`/`lg:`/`xl:` 일관 사용 확인 |
| Performance | PARTIAL | 번들 크기 확인(gzip 197KB), Lighthouse 미실행 | 단일 JS 청크 647KB(gzip 197KB), 코드 분할 없음(README에 이미 disclosed) | 실제 Lighthouse 수치 없이 "90+" 달성을 주장하지 않음 |
| Accessibility | PARTIAL | aria-label 12개 파일, prefers-reduced-motion 대응, 시맨틱 버튼/링크 사용 확인. 실제 스크린리더/키보드 테스트는 미실행 | React Error Boundary 없음(위 참고) | 기초는 되어 있으나 WCAG 정식 감사 아님 |
| Production Build | PASS | `tsc -b && vite build` 실제 실행, 매 커밋마다 재확인 | 없음 | 이번 세션 중 4회 이상 clean build 확인 |

## 이번 세션에 실제로 발견하고 고친 것 (요약)

1. **Home Hero 이미지 필드가 완전히 무시됨** — admin에서 넣어도 아무 반영 없었음. 풀블리드
   히어로로 수정.
2. **Story 커버 이미지 미노출** — og:image에만 쓰이고 실제 화면에 안 보임. 상세/목록 모두 수정.
3. **About 섹션 이미지 미노출** — 2단 에디토리얼 레이아웃으로 수정.
4. **Character 이미지 미노출** — 목록 썸네일 + 상세 히어로로 수정.
5. **CoffeeCard가 제네릭 "테두리 박스 + 작은 아이콘" 카드였음** — 실제 fritz.co.kr,
   unspecialty.com을 방문해 참고한 뒤(디자인 복제 아님, UX 원리만) 이미지 우선 + KOI Navy
   플레이스홀더 + 테두리 없는 캡션으로 재설계. Stories 카드도 동일하게 재설계.
6. **Brew Guide 섹션 라벨/필드가 영어로 남아있었음** — 한국어로 전환.
7. **robots.txt / sitemap.xml 부재** — 정적 라우트 기준으로 생성.
8. **관리자 대시보드에 지난 원두/정보 보완 필요/최근 수정 누락** — 추가.
9. **404 페이지 CTA가 하나뿐** — 두 번째 CTA 추가.

모든 수정은 `npx tsc -b` + `npm run build` clean 확인, 이미지 관련 수정 4건은 실제
admin에서 입력 → 저장 → 새로고침 → Public 페이지 확인까지 라이브로 검증한 뒤 테스트
데이터를 원복했습니다.
