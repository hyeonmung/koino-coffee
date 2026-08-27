import type {
  AboutBackgroundTheme,
  AboutBlockType,
  AboutImageRatio,
  AboutLayoutPreset,
  AboutSpacing,
  AboutTextWidth,
} from '../data/schema'

export const ABOUT_BLOCK_TYPE_LABEL: Record<AboutBlockType, string> = {
  BRAND: '코이노커피 소개',
  PERSON: '대표 / 사람 소개',
  CAREER_LIST: '경력',
  IMAGE_TEXT: '사진 + 글',
  IMAGE_FULL: '큰 사진',
  GALLERY: '갤러리',
  QUOTE: '인용문',
  PHILOSOPHY: '철학',
  FREE_TEXT: '자유 텍스트',
  CTA: 'CTA',
}

export const ABOUT_LAYOUT_LABEL: Record<AboutLayoutPreset, string> = {
  PHOTO_LEFT_TEXT_RIGHT: '사진 왼쪽 / 글 오른쪽',
  TEXT_LEFT_PHOTO_RIGHT: '글 왼쪽 / 사진 오른쪽',
  PHOTO_LARGE: '사진 크게 / 글 작게',
  TEXT_LARGE: '글 크게 / 사진 작게',
  PHOTO_FULL: '사진 전체',
  TEXT_FULL: '텍스트 전체',
  CUSTOM: '사용자 지정',
}

/** Image column span out of 12 for each preset — text takes the rest. CUSTOM uses customImageCols instead. */
export const ABOUT_LAYOUT_IMAGE_COLS: Record<AboutLayoutPreset, number> = {
  PHOTO_LEFT_TEXT_RIGHT: 6,
  TEXT_LEFT_PHOTO_RIGHT: 6,
  PHOTO_LARGE: 7,
  TEXT_LARGE: 5,
  PHOTO_FULL: 12,
  TEXT_FULL: 0,
  CUSTOM: 6,
}

/** Whether the image sits on the left in the grid (mirrored to the right otherwise). */
export const ABOUT_LAYOUT_IMAGE_LEFT: Record<AboutLayoutPreset, boolean> = {
  PHOTO_LEFT_TEXT_RIGHT: true,
  TEXT_LEFT_PHOTO_RIGHT: false,
  PHOTO_LARGE: true,
  TEXT_LARGE: false,
  PHOTO_FULL: true,
  TEXT_FULL: true,
  CUSTOM: true,
}

export const ABOUT_BACKGROUND_LABEL: Record<AboutBackgroundTheme, string> = {
  PAPER: '베이지 (Warm White)',
  WHITE: '화이트',
  NIGHT: '네이비 (Night)',
  SOFT: '아이보리 (Soft)',
}

export const ABOUT_BACKGROUND_CLASS: Record<AboutBackgroundTheme, string> = {
  PAPER: 'bg-warm-white',
  WHITE: 'bg-white',
  NIGHT: 'koi-night-sky',
  SOFT: 'bg-[#f5f1e8]',
}

export const ABOUT_BACKGROUND_TEXT_CLASS: Record<AboutBackgroundTheme, string> = {
  PAPER: 'text-navy',
  WHITE: 'text-navy',
  NIGHT: 'text-warm-white',
  SOFT: 'text-navy',
}

export const ABOUT_SPACING_CLASS: Record<AboutSpacing, string> = {
  TIGHT: 'py-8',
  NORMAL: 'py-14',
  WIDE: 'py-24',
}

export const ABOUT_SPACING_LABEL: Record<AboutSpacing, string> = {
  TIGHT: '좁게',
  NORMAL: '기본',
  WIDE: '넓게',
}

export const ABOUT_TEXT_WIDTH_CLASS: Record<AboutTextWidth, string> = {
  NARROW: 'max-w-[420px]',
  NORMAL: 'max-w-[560px]',
  WIDE: 'max-w-[760px]',
}

export const ABOUT_TEXT_WIDTH_LABEL: Record<AboutTextWidth, string> = {
  NARROW: '좁게',
  NORMAL: '기본',
  WIDE: '넓게',
}

export const ABOUT_IMAGE_RATIO_CLASS: Record<AboutImageRatio, string> = {
  '4:5': 'aspect-[4/5]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
  '3:2': 'aspect-[3/2]',
  '16:9': 'aspect-video',
  ORIGINAL: '',
}

export const ABOUT_IMAGE_RATIO_LABEL: Record<AboutImageRatio, string> = {
  '4:5': 'Portrait (4:5)',
  '3:4': 'Editorial Portrait (3:4)',
  '1:1': 'Square (1:1)',
  '3:2': 'Landscape (3:2)',
  '16:9': 'Wide (16:9)',
  ORIGINAL: '원본 비율',
}

export const ABOUT_CAREER_CATEGORIES = ['자격', '대회', '심사', '교육', '경력', '수상', '활동', '기타'] as const
