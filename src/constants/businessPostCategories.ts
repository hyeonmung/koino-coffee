import type { BusinessPostCategory } from '../data/schema'

export const BUSINESS_POST_CATEGORY_LABEL: Record<BusinessPostCategory, string> = {
  WHOLESALE: '원두 납품',
  EDUCATION: '커피 교육',
  CLASS: '클래스',
  NOTICE: '공지',
  PARTNERSHIP: '파트너십',
}

export const BUSINESS_POST_CATEGORIES: BusinessPostCategory[] = ['WHOLESALE', 'EDUCATION', 'CLASS', 'NOTICE', 'PARTNERSHIP']
