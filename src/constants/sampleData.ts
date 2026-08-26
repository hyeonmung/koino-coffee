import type { CoffeeProfile } from '../types'

export const SAMPLE_COFFEE_ID = 'sample-ethiopia-koi'

export function createSampleCoffee(): CoffeeProfile {
  const now = new Date().toISOString()
  return {
    id: SAMPLE_COFFEE_ID,
    coffeeName: 'ETHIOPIA SAMPLE',
    country: 'Ethiopia',
    region: 'Yirgacheffe',
    producer: '',
    variety: 'Heirloom',
    process: 'Washed',
    altitude: '1,900 - 2,100m',
    roastLevel: 'Light',
    character: 'ELEGANT',
    notes: ['Jasmine', 'Bergamot', 'White Peach', 'Black Tea'],
    sensory: {
      acidity: 4,
      sweetness: 4,
      body: 2,
      finish: 4,
      flavor: 5,
      accessibility: 3,
    },
    isSample: true,
    createdAt: now,
    updatedAt: now,
  }
}
