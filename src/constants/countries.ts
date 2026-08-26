export interface CountryMeta {
  en: string
  ko: string
  flag: string
}

export const COUNTRY_META: Record<string, CountryMeta> = {
  ethiopia: { en: 'Ethiopia', ko: '에티오피아', flag: '🇪🇹' },
  kenya: { en: 'Kenya', ko: '케냐', flag: '🇰🇪' },
  colombia: { en: 'Colombia', ko: '콜롬비아', flag: '🇨🇴' },
  'papua new guinea': { en: 'Papua New Guinea', ko: '파푸아뉴기니', flag: '🇵🇬' },
  guatemala: { en: 'Guatemala', ko: '과테말라', flag: '🇬🇹' },
  panama: { en: 'Panama', ko: '파나마', flag: '🇵🇦' },
  brazil: { en: 'Brazil', ko: '브라질', flag: '🇧🇷' },
  'costa rica': { en: 'Costa Rica', ko: '코스타리카', flag: '🇨🇷' },
  honduras: { en: 'Honduras', ko: '온두라스', flag: '🇭🇳' },
  rwanda: { en: 'Rwanda', ko: '르완다', flag: '🇷🇼' },
  burundi: { en: 'Burundi', ko: '부룬디', flag: '🇧🇮' },
  yemen: { en: 'Yemen', ko: '예멘', flag: '🇾🇪' },
  indonesia: { en: 'Indonesia', ko: '인도네시아', flag: '🇮🇩' },
  'el salvador': { en: 'El Salvador', ko: '엘살바도르', flag: '🇸🇻' },
  peru: { en: 'Peru', ko: '페루', flag: '🇵🇪' },
  bolivia: { en: 'Bolivia', ko: '볼리비아', flag: '🇧🇴' },
  mexico: { en: 'Mexico', ko: '멕시코', flag: '🇲🇽' },
  nicaragua: { en: 'Nicaragua', ko: '니카라과', flag: '🇳🇮' },
  uganda: { en: 'Uganda', ko: '우간다', flag: '🇺🇬' },
  tanzania: { en: 'Tanzania', ko: '탄자니아', flag: '🇹🇿' },
}

// Primary lineup shown first on the gallery home page; everything else follows alphabetically.
export const COUNTRY_PRIORITY: string[] = [
  'ethiopia',
  'kenya',
  'colombia',
  'papua new guinea',
  'guatemala',
  'panama',
  'brazil',
]

export const OTHER_COUNTRY_KEY = 'other'
