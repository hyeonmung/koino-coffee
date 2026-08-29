import { useRef, useState } from 'react'
import { supabase } from '../../data/supabaseClient'

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.85

function readImageBlob(file: File): Promise<{ blob: Blob; ext: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'))
      img.onload = () => {
        let { naturalWidth: width, naturalHeight: height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('이미지를 처리할 수 없습니다.'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지를 처리할 수 없습니다.'))
              return
            }
            resolve({ blob, ext: mime === 'image/png' ? 'png' : 'jpg' })
          },
          mime,
          JPEG_QUALITY,
        )
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  placeholder?: string
  helpText?: React.ReactNode
}

export default function ImageUploadField({ label, value, onChange, placeholder, helpText }: ImageUploadFieldProps) {
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const process = async (file: File | undefined | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 첨부할 수 있습니다.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const { blob, ext } = await readImageBlob(file)
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('images').upload(path, blob, { contentType: blob.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('images').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지를 처리하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  // Older content saved before this field uploaded to storage may still hold a base64
  // data: URI directly — still displays fine, just can't show a meaningful byte size for it.
  const isDataUrl = value.startsWith('data:')

  return (
    <div>
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void process(e.dataTransfer.files?.[0])
        }}
        className={`relative flex min-h-[120px] flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? 'border-navy bg-navy/5' : 'border-navy/25 bg-white'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="max-h-[140px] max-w-full object-contain" />
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="border border-navy/25 px-2.5 py-1 text-[10px] font-semibold text-navy/70 hover:border-navy/50"
              >
                이미지 변경
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="border border-navy/25 px-2.5 py-1 text-[10px] font-semibold text-navy/50 hover:border-red-400 hover:text-red-500"
              >
                제거
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[12px] text-navy/50">{busy ? '업로드 중...' : '이미지를 여기로 드래그하세요'}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border border-navy px-3 py-1.5 text-[11px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
            >
              파일 넣기
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void process(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}

      <details className="mt-2" open={Boolean(value) && !isDataUrl}>
        <summary className="cursor-pointer text-[10px] text-navy/40 hover:text-navy/60">또는 이미지 URL 직접 입력</summary>
        <input
          value={isDataUrl ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isDataUrl ? '(업로드된 이미지 사용 중 — 입력하면 대체됩니다)' : (placeholder ?? 'https://...')}
          className="mt-1.5 w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy"
        />
      </details>

      {helpText}
    </div>
  )
}
