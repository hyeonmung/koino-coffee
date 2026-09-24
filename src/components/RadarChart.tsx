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
import { useTheme } from '../hooks/useTheme'
import type { SensoryProfile } from '../types'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

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
    const { resolved } = useTheme()
    // Chart.js draws to <canvas>, which can't resolve CSS custom properties itself — the
    // theme's ink color has to be read out and passed in as a literal RGB string per render.
    const inkRgb = resolved === 'dark' ? '245, 242, 234' : '20, 33, 61'
    const ink = `rgb(${inkRgb})`

    const data: ChartData<'radar'> = {
      labels: SENSORY_FIELDS.map((f) => f.labelKo),
      datasets: [
        {
          data: SENSORY_FIELDS.map((f) => sensory[f.key]),
          backgroundColor: accentSoft ?? `rgba(${inkRgb}, 0.14)`,
          borderColor: accentColor ?? ink,
          borderWidth: 2,
          pointBackgroundColor: accentColor ?? ACCENT,
          pointBorderColor: ink,
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
            color: `rgba(${inkRgb}, 0.4)`,
            font: { size: 9 },
            backdropColor: 'transparent',
          },
          grid: {
            color: `rgba(${inkRgb}, 0.16)`,
          },
          angleLines: {
            color: `rgba(${inkRgb}, 0.22)`,
          },
          pointLabels: {
            display: showLabels,
            color: ink,
            font: { size: 10, weight: 'bold' },
            padding: 6,
          },
        },
      },
    }

    return (
      <div ref={ref} className="mx-auto p-3" style={{ maxWidth: size }}>
        <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
          <Radar data={data} options={options} />
        </div>
      </div>
    )
  },
)

RadarChart.displayName = 'RadarChart'

export default RadarChart
