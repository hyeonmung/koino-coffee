import { useRef, useState, type ChangeEvent } from 'react'

interface ExportControlsProps {
  onExportChartPng: () => void
  onExportCardPng: () => void
  onExportJson: () => void
  onImportJson: (file: File) => void
  onExportCsv: () => void
  onImportCsv: (file: File) => void
}

export default function ExportControls({
  onExportChartPng,
  onExportCardPng,
  onExportJson,
  onImportJson,
  onExportCsv,
  onImportCsv,
}: ExportControlsProps) {
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const run = async (label: string, fn: () => void | Promise<void>) => {
    setBusy(label)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  const handleFile = (accept: (file: File) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) accept(file)
    e.target.value = ''
  }

  const btn =
    'border border-navy/25 px-2.5 py-2 text-[11px] font-semibold tracking-wide text-navy hover:border-navy hover:bg-navy hover:text-warm-white transition-colors disabled:opacity-40'

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.15em] text-navy/50">PNG EXPORT</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('chart', onExportChartPng)}
            className={btn}
          >
            {busy === 'chart' ? '저장 중...' : 'Radar Chart PNG'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('card', onExportCardPng)}
            className={btn}
          >
            {busy === 'card' ? '저장 중...' : 'Full Card PNG'}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.15em] text-navy/50">DATA BACKUP</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button type="button" onClick={onExportJson} className={btn}>
            Export JSON
          </button>
          <button type="button" onClick={() => jsonInputRef.current?.click()} className={btn}>
            Import JSON
          </button>
          <button type="button" onClick={onExportCsv} className={btn}>
            Export CSV
          </button>
          <button type="button" onClick={() => csvInputRef.current?.click()} className={btn}>
            Import CSV
          </button>
        </div>
        <input
          ref={jsonInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFile(onImportJson)}
        />
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFile(onImportCsv)}
        />
      </div>
    </div>
  )
}
