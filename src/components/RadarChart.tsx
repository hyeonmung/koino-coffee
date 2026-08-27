import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { forwardRef } from 'react'
import { Radar } from 'react-chartjs-2'
import { SENSORY_FIELDS } from '../constants/sensory'
import type { SensoryProfile } from '../types'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const NAVY = '#14213d'
const ACCENT = '#f2c94c'

interface RadarChartProps {
  sensory: SensoryProfile
  size?: number
  showLabels?: boolean
  /** Character accent (src/constants/characterStyle.ts) — tints the polygon line/points when given. Defaults to Navy/Yellow. */
  accentColor?: string
  accentSoft?: string
}

const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  ({ sensory, size = 320, showLabels = true, accentColor, accentSoft }, ref) => {
    const data: ChartData<'radar'> = {
      labels: SENSORY_FIELDS.map((f) => f.label),
      datasets: [
        {
          data: SENSORY_FIELDS.map((f) => sensory[f.key]),
          backgroundColor: accentSoft ?? 'rgba(20, 33, 61, 0.14)',
          borderColor: accentColor ?? NAVY,
          borderWidth: 2,
          pointBackgroundColor: accentColor ?? ACCENT,
          pointBorderColor: NAVY,
          pointBorderWidth: showLabels ? 1.5 : 1,
          pointRadius: showLabels ? 3.5 : 2.5,
          pointHoverRadius: showLabels ? 3.5 : 2.5,
        },
      ],
    }

    const options: ChartOptions<'radar'> = {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      events: [],
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        r: {
          min: 0,
          max: 5,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            display: showLabels,
            showLabelBackdrop: false,
            color: 'rgba(20, 33, 61, 0.4)',
            font: { size: 9 },
            backdropColor: 'transparent',
          },
          grid: {
            color: 'rgba(20, 33, 61, 0.16)',
          },
          angleLines: {
            color: 'rgba(20, 33, 61, 0.22)',
          },
          pointLabels: {
            display: showLabels,
            color: NAVY,
            font: { size: 10, weight: 'bold' },
            padding: 6,
          },
        },
      },
    }

    return (
      <div ref={ref} className="mx-auto p-3">
        <div style={{ width: size, height: size }}>
          <Radar data={data} options={options} />
        </div>
      </div>
    )
  },
)

RadarChart.displayName = 'RadarChart'

export default RadarChart
