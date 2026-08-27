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
import { Radar } from 'react-chartjs-2'
import { SENSORY_FIELDS } from '../constants/sensory'
import type { SensoryProfile } from '../types'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const NAVY = '#14213d'

export const COMPARE_COLORS = ['#14213d', '#f2c94c', '#7c8ba1']

interface RadarSeries {
  label: string
  sensory: SensoryProfile
  color: string
}

interface RadarOverlayChartProps {
  series: RadarSeries[]
  size?: number
}

export default function RadarOverlayChart({ series, size = 320 }: RadarOverlayChartProps) {
  const data: ChartData<'radar'> = {
    labels: SENSORY_FIELDS.map((f) => f.labelKo),
    datasets: series.map((s) => ({
      label: s.label,
      data: SENSORY_FIELDS.map((f) => s.sensory[f.key]),
      backgroundColor: `${s.color}26`,
      borderColor: s.color,
      borderWidth: 2,
      pointBackgroundColor: s.color,
      pointBorderColor: s.color,
      pointRadius: 3,
    })),
  }

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
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
          showLabelBackdrop: false,
          color: 'rgba(20, 33, 61, 0.4)',
          font: { size: 9 },
          backdropColor: 'transparent',
        },
        grid: { color: 'rgba(20, 33, 61, 0.16)' },
        angleLines: { color: 'rgba(20, 33, 61, 0.22)' },
        pointLabels: { color: NAVY, font: { size: 10, weight: 'bold' }, padding: 6 },
      },
    },
  }

  return (
    <div className="mx-auto p-3" style={{ width: size, height: size }}>
      <Radar data={data} options={options} />
    </div>
  )
}
