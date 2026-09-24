import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 수집하는 개인정보 항목 및 수집 방법',
    body: `코이노니아 로스터스(이하 "회사")는 다음과 같은 개인정보를 수집합니다.

· 소셜 로그인(카카오, 네이버) 회원가입 시: 이메일, 닉네임(별명), 프로필 사진, 로그인 제공자 정보
· 납품·교육 문의(입점/도매 문의) 작성 시: 담당자명, 연락처, 이메일, 회사명, 업종, 지역, 문의 내용
· 도매 주문 문의 작성 시: 이름, 연락처, 배송 주소, 주문 내용
· 서비스 이용 과정에서 자동으로 생성되는 정보: 접속 로그, 쿠키, 접속 IP 정보

개인정보는 회원가입(소셜 로그인), 문의 게시판 작성, 서비스 이용 과정에서 수집됩니다.`,
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    body: `· 회원 식별 및 로그인 서비스 제공
· 별명(닉네임) 표시 등 개인 맞춤 서비스 제공
· 납품·교육 및 도매 문의 응대, 견적 안내
· 공지사항 전달 및 민원 처리
· 서비스 이용 통계 분석을 통한 서비스 개선`,
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    body: `회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만 다음의 정보는 아래의 이유로 명시한 기간 동안 보존합니다.

· 회원 탈퇴 시: 부정 이용 방지를 위해 탈퇴 후 즉시 삭제 (관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 별도 보관)
· 문의·주문 기록: 문의 처리 완료 후 3년간 보관 (전자상거래 등에서의 소비자보호에 관한 법률)`,
  },
  {
    title: '4. 개인정보의 제3자 제공',
    body: `회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.

· 이용자가 사전에 동의한 경우
· 카카오, 네이버를 통한 소셜 로그인 이용 시 각 서비스의 정책에 따라 최소한의 정보(이메일, 닉네임 등)를 전달받습니다.
· 법령에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우`,
  },
  {
    title: '5. 개인정보 처리 위탁',
    body: `회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 외부 업체에 위탁하고 있습니다.

· Supabase Inc.: 회원 정보 및 서비스 데이터베이스 운영
· Vercel Inc.: 웹사이트 호스팅 및 배포
· Google LLC (Google Analytics): 서비스 이용 통계 분석
· Resend: 이메일 발송

회사는 위탁계약 체결 시 개인정보보호 관련 법령 준수, 개인정보에 대한 접근 제한 등 안전관리에 관한 사항을 계약서 등 문서에 명시하고 있습니다.`,
  },
  {
    title: '6. 이용자의 권리와 행사 방법',
    body: `이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보 이용에 대한 동의를 철회할 수 있습니다.

· 닉네임(별명)은 로그인 후 프로필 메뉴의 "개인정보"에서 직접 변경할 수 있습니다.
· 그 외 개인정보의 열람, 정정, 삭제, 처리정지 요청은 아래 문의처를 통해 요청할 수 있습니다.`,
  },
  {
    title: '7. 쿠키(Cookie)의 운영',
    body: `회사는 이용자에게 맞춤화된 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다. 이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 이 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.`,
  },
]

export default function PrivacyPolicyPage() {
  const settings = getSiteSettings()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO title="개인정보처리방침" description="코이노니아 로스터스 개인정보처리방침" noIndex />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[820px] px-6 py-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-accent font-kicker">PRIVACY POLICY</p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight text-ink">개인정보처리방침</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-ink/60">
          코이노니아 로스터스(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보보호법」 등 관련 법령을
          준수하고 있습니다. 회사는 개인정보처리방침을 통해 이용자가 제공하는 개인정보가 어떠한 목적과 방식으로
          이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-[16px] font-bold text-ink">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink/65">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-[16px] font-bold text-ink">8. 개인정보보호책임자 및 문의처</h2>
            <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink/65">
              개인정보 관련 문의사항은 아래 연락처로 문의해 주시기 바랍니다.
              {'\n'}
              {settings.businessRegistrationInfo || '상호 및 사업자등록정보: 관리자 설정에서 입력해 주세요.'}
              {settings.phone ? `\n연락처: ${settings.phone}` : ''}
              {settings.address ? `\n주소: ${settings.address}` : ''}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-ink">9. 시행일</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink/65">이 개인정보처리방침은 2026년 9월 9일부터 시행됩니다.</p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
