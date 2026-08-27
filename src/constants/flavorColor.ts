import type { FlavorColor } from '../data/schema'

/** Used for any Flavor Note without a registered color — never borrows the Character accent. */
export const FLAVOR_NEUTRAL_COLOR: FlavorColor = { onLight: '#5b6472', onDark: '#a9b1bf' }

/**
 * Curated, on-brand starting palette for the admin's "향미 색상" picker. Muted and refined —
 * calibrated to sit alongside KOI's Character accents (src/constants/characterStyle.ts) rather
 * than reading as a rainbow. Admins can still enter a custom hex pair via the Advanced field.
 */
export const FLAVOR_COLOR_PRESETS: { label: string; color: FlavorColor }[] = [
  { label: '망고 골드', color: { onLight: '#9c7318', onDark: '#e0c271' } },
  { label: '파인애플 옐로', color: { onLight: '#8f7c1e', onDark: '#dbcc76' } },
  { label: '레몬 옐로', color: { onLight: '#8a7317', onDark: '#e3ce74' } },
  { label: '허니 골드', color: { onLight: '#94741a', onDark: '#dec073' } },
  { label: '피치 코랄', color: { onLight: '#a9673f', onDark: '#e5b08c' } },
  { label: '살구 오렌지', color: { onLight: '#a16324', onDark: '#e0ac6c' } },
  { label: '오렌지', color: { onLight: '#a15a1f', onDark: '#e4a768' } },
  { label: '딸기 레드', color: { onLight: '#9c3f44', onDark: '#e09a9e' } },
  { label: '라즈베리 레드', color: { onLight: '#a13f55', onDark: '#e2a0af' } },
  { label: '자몽 핑크', color: { onLight: '#b14f5c', onDark: '#e6a3ac' } },
  { label: '수박 핑크', color: { onLight: '#b14f5f', onDark: '#e6a5b0' } },
  { label: '자스민 핑크', color: { onLight: '#9c5170', onDark: '#e3a9be' } },
  { label: '로즈 핑크', color: { onLight: '#a14d68', onDark: '#e2a2b6' } },
  { label: '베르가못 바이올렛', color: { onLight: '#6e5490', onDark: '#c6aee0' } },
  { label: '포도 바이올렛', color: { onLight: '#684a88', onDark: '#c2a6de' } },
  { label: '블루베리 바이올렛', color: { onLight: '#4f5697', onDark: '#a6abdb' } },
  { label: '블랙베리 퍼플', color: { onLight: '#63406e', onDark: '#c09fcb' } },
  { label: '자두 퍼플', color: { onLight: '#6a4160', onDark: '#c49db6' } },
  { label: '와인 레드', color: { onLight: '#742e3b', onDark: '#c58996' } },
  { label: '청사과 그린', color: { onLight: '#4c7a3c', onDark: '#a0d08b' } },
  { label: '라임 그린', color: { onLight: '#5c7a24', onDark: '#b4d07e' } },
  { label: '멜론 그린', color: { onLight: '#5a7a3f', onDark: '#a6ce90' } },
  { label: '녹차 그린', color: { onLight: '#4c6e3f', onDark: '#9ec28d' } },
  { label: '허브 그린', color: { onLight: '#506b44', onDark: '#9cbe8c' } },
  { label: '캐러멜 브라운', color: { onLight: '#855530', onDark: '#cca377' } },
  { label: '흑설탕 브라운', color: { onLight: '#785030', onDark: '#c09976' } },
  { label: '헤이즐넛 브라운', color: { onLight: '#765030', onDark: '#bc9971' } },
  { label: '아몬드 브라운', color: { onLight: '#79603e', onDark: '#c0a67f' } },
  { label: '월넛 브라운', color: { onLight: '#6b4a30', onDark: '#b4926f' } },
  { label: '다크초콜릿 브라운', color: { onLight: '#573a2a', onDark: '#ab8871' } },
  { label: '밀크초콜릿 브라운', color: { onLight: '#7a5a3e', onDark: '#c4a47f' } },
  { label: '홍차 앰버', color: { onLight: '#7e5a2c', onDark: '#cba76a' } },
  { label: '우롱차 앰버', color: { onLight: '#8a6224', onDark: '#d2ac6c' } },
  { label: '몰라세스 브라운', color: { onLight: '#5e3e24', onDark: '#ad8862' } },
  { label: '뉴트럴 네이비', color: FLAVOR_NEUTRAL_COLOR },
]
