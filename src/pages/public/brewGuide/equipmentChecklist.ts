/** Generic, brand-agnostic tool checklists per brewer type — standard practice knowledge for
 * that equipment category, not a claim about any specific sourced recipe. Never used to invent
 * recipe-specific facts (dose/water/ratio/etc. always come straight from the verified guide data). */
const CHECKLISTS: Record<string, string[]> = {
  V60: ['Hario V60 드리퍼', '전용 페이퍼 필터', '드립 케틀', '저울', '타이머', '그라인더'],
  Origami: ['오리가미 드리퍼', '전용 또는 V60 페이퍼 필터', '드립 케틀', '저울', '타이머', '그라인더'],
  Orea: ['오레아 드리퍼', '전용 필터', '드립 케틀', '저울', '타이머', '그라인더'],
  'Hario Switch': ['하리오 스위치', '전용 페이퍼 필터', '드립 케틀', '저울', '타이머', '그라인더'],
  'Kalita Wave': ['칼리타 웨이브 드리퍼', '웨이브 전용 필터', '드립 케틀', '저울', '타이머', '그라인더'],
  Chemex: ['케멕스', '케멕스 전용 필터', '드립 케틀', '저울', '타이머', '그라인더'],
  Aeropress: ['에어로프레스', '전용 필터', '드립 케틀 또는 주전자', '저울', '타이머', '그라인더'],
  'French Press': ['프렌치프레스', '드립 케틀 또는 주전자', '저울', '타이머', '그라인더'],
  Espresso: ['에스프레소 머신', '포터필터', '탬퍼', '저울', '타이머', '그라인더'],
  'Cold Brew': ['콜드브루 용기 또는 드리퍼', '저울', '타이머', '그라인더', '냉장 보관 용기'],
  'Moka Pot': ['모카포트', '가스레인지 또는 인덕션', '저울', '타이머', '그라인더'],
  'Auto Drip': ['오토드립 커피메이커', '전용 필터', '저울', '그라인더'],
}

const DEFAULT_CHECKLIST = ['드리퍼', '페이퍼 필터', '드립 케틀', '저울', '타이머', '그라인더']

export function getEquipmentChecklist(equipment: string): string[] {
  return CHECKLISTS[equipment] ?? DEFAULT_CHECKLIST
}
