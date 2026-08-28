# 배포 (Deployment)

## 현재 구성

- **호스팅**: Vercel (`hyeonmungs-projects/koi-coffee-profile`)
- **프로덕션 도메인**: `https://koinoniaroasters.co.kr` (apex가 primary)
  - `https://www.koinoniaroasters.co.kr`은 apex로 301 리다이렉트
- **DNS**: 가비아(Gabia)에서 관리. apex는 A 레코드, `www`는 CNAME으로 Vercel을 가리킴.
- **DB**: 없음. 데이터는 브라우저 `localStorage`에만 저장됨 (Supabase 등 실제 백엔드
  전환은 아직 하지 않음 — 향후 별도 작업으로 진행 예정).
- **Git 인증**: 이 저장소 전용으로 스코프된 SSH deploy key (`~/.ssh/id_ed25519_koinonia`,
  GitHub repo의 "Deploy keys"에 write 권한으로 등록됨). 계정 전체가 아니라 이 저장소
  하나에만 접근 가능하도록 의도적으로 스코프를 좁힘.

## 코드를 배포하는 방법

현재 GitHub → Vercel 자동 배포(Git 연동)가 연결되어 있지 않아 **수동 배포**가 필요합니다.

1. 코드 수정
2. 로컬에서 검증:
   ```bash
   npx tsc -b && npm run build
   ```
3. 커밋 & 푸시:
   ```bash
   git add <files>
   git commit -m "..."
   git push origin main
   ```
4. 프로덕션 배포:
   ```bash
   vercel --prod --yes
   ```
   (Vercel CLI가 `.vercel/`에 저장된 프로젝트 링크를 사용해 빌드 후
   `koinoniaroasters.co.kr`에 자동으로 alias합니다.)

### 알려진 제약: GitHub 자동 배포 미연결

Vercel 프로젝트를 GitHub 저장소(`hyeonmung/koino-coffee`)에 연결해 push 시 자동 배포되도록
시도했으나 연결에 실패했습니다 ("Failed to connect hyeonmung/koino-coffee to project"). 원인은
파악되지 않았으며, 재시도하거나 Vercel 대시보드에서 직접 연결을 시도해볼 수 있습니다. 그
전까지는 위 4단계(수동 `vercel --prod --yes`)로 배포합니다.

## 데이터 관련 주의사항

- 원두/스토리/설정 등 모든 콘텐츠는 **관리자가 로그인해서 사용하는 브라우저의
  localStorage**에만 존재합니다. 배포는 코드(정적 파일)만 바꿀 뿐, 데이터에는 영향을
  주지 않습니다.
- 배포/재배포 시 브라우저 데이터가 삭제되거나 초기화되는 일은 없습니다 — 정적 사이트
  배포와 브라우저 로컬 저장소는 완전히 분리되어 있습니다.
- 정기 백업 계획은 `LAUNCH_CHECKLIST.md` 섹션 B 참고.

## 도메인/DNS를 다시 바꿔야 할 때

DNS 레코드는 가비아 관리 콘솔(`my.gabia.com`)에서 직접 확인/수정합니다. Vercel이 요구하는
정확한 값(A 레코드 IP, CNAME 대상)은 Vercel 프로젝트 → Settings → Domains에서 항상 최신
값을 확인한 뒤 반영해야 합니다 (직접 값을 추측하지 말 것).
