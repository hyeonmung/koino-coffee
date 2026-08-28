import type { SiteSettings } from '../schema'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: '코이노니아',
  logoText: 'KOINONIA',
  heroTitle: '한 잔, 새로운 목적지.',
  heroSubtitle: '좋은 원두와 다양한 향미를 통해\n커피의 새로운 경험을 제안합니다.',
  heroCtaPrimaryLabel: '원두 둘러보기',
  heroCtaPrimaryUrl: '/coffees',
  heroCtaSecondaryLabel: '내 취향 찾기',
  heroCtaSecondaryUrl: '/discover',
  instagramUrl: '',
  naverUrl: '',
  purchaseUrl: '',
  businessUrl: '/business',
  footerNote: '© 코이노니아. 모든 원두 정보는 로스터가 직접 작성합니다.',
  seoDefaultTitle: 'KOINONIA ROASTERS 공식사이트',
  seoDefaultDescription:
    '코이노니아의 원두, 향미, 로스팅, 추출 이야기를 만나보세요. 좋은 커피를 발견하고 나에게 맞는 한 잔을 찾는 코이노니아 공식 사이트입니다.',
  ogImage: 'https://koinoniaroasters.co.kr/og-image.png',
  homepageFeaturedCoffeeIds: [],
  homepageStoryIds: [],
  homeSectionVisibility: {},

  aboutIntro:
    '코이노니아는 좋은 원두를 정직하게 로스팅하고, 그 맛을 가장 잘 표현하는 방법을 함께 고민하는 로스터리입니다.',
  aboutSections: [
    {
      heading: '우리가 커피를 하는 이유',
      body: '커피 한 잔에는 산지의 계절과 사람의 손길, 그리고 로스터의 판단이 함께 담깁니다. 코이노니아는 그 과정을 손님에게 정직하게 전달하는 것을 가장 중요하게 생각합니다.',
    },
    {
      heading: '로스팅',
      body: '원두마다 표현하고 싶은 향미가 다르기 때문에, 하나의 로스팅 공식을 모든 원두에 똑같이 적용하지 않습니다. 매 배치마다 그 원두가 가장 자연스럽게 드러날 수 있는 지점을 찾습니다.',
    },
    {
      heading: '핸드드립과 다양한 원두',
      body: '산지, 품종, 가공 방식에 따라 완전히 다른 개성을 가진 원두를 소개합니다. 화려한 산미부터 편안한 단맛까지, 다양한 원두를 통해 커피의 폭넓은 스펙트럼을 경험할 수 있도록 구성합니다.',
    },
    {
      heading: '교육',
      body: '좋은 원두를 아는 것만큼 중요한 것은 그것을 집에서도 맛있게 내리는 방법입니다. 브루 가이드와 클래스를 통해 손님이 직접 좋은 한 잔을 완성할 수 있도록 돕습니다.',
    },
    {
      heading: '품질과 정직',
      body: '확인되지 않은 정보를 과장하지 않습니다. 원두에 대한 설명은 로스터와 바리스타가 실제로 경험한 내용을 바탕으로 작성됩니다.',
    },
  ],

  businessIntro: '카페와 매장을 위한 원두 납품부터 컨설팅, 바리스타 교육까지 함께합니다.',
  businessSections: [
    {
      key: 'wholesale',
      title: '원두 납품',
      body: '카페·레스토랑을 위한 정기 원두 납품을 진행합니다. 매장의 메뉴와 손님 취향에 맞는 원두를 함께 선정합니다.',
    },
    {
      key: 'consulting',
      title: '카페 컨설팅',
      body: '메뉴 구성, 원두 로테이션, 추출 레시피까지 매장 운영에 필요한 부분을 함께 설계합니다.',
    },
    {
      key: 'education',
      title: '바리스타 교육',
      body: '핸드드립과 에스프레소 기본기부터 센서리 평가까지, 실무에 바로 적용할 수 있는 교육을 제공합니다.',
    },
    {
      key: 'class',
      title: '커피 클래스',
      body: '커피를 처음 배우는 분들을 위한 클래스를 운영합니다. 원두의 향미를 이해하고 직접 추출해보는 시간입니다.',
    },
  ],

  updatedAt: new Date().toISOString(),
}
