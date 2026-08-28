import { useState } from 'react'
import { Link } from 'react-router-dom'
import StoryBody from '../StoryBody'
import KOIStarField from '../decorative/KOIStarField'
import { renderRichText } from '../../utils/richText'
import {
  ABOUT_BACKGROUND_CLASS,
  ABOUT_BACKGROUND_TEXT_CLASS,
  ABOUT_IMAGE_RATIO_CLASS,
  ABOUT_LAYOUT_IMAGE_COLS,
  ABOUT_LAYOUT_IMAGE_LEFT,
  ABOUT_SPACING_CLASS,
  ABOUT_TEXT_WIDTH_CLASS,
} from '../../constants/aboutBlocks'
import { FOCAL_POINT_POSITION } from '../../constants/media'
import type { AboutBlock, AboutCareerItem } from '../../data/schema'
import { useIsMobile } from '../../utils/useIsMobile'

interface AboutBlockRendererProps {
  block: AboutBlock
  /** Forces mobile/desktop rendering regardless of real viewport — used by the admin preview toggle. Omit on the public page. */
  isMobile?: boolean
}

const VERTICAL_ALIGN_CLASS = { TOP: 'items-start', CENTER: 'items-center', BOTTOM: 'items-end' } as const
const TEXT_ALIGN_CLASS = { LEFT: 'text-left', CENTER: 'text-center mx-auto', RIGHT: 'text-right ml-auto' } as const

function ImageBox({ block }: { block: AboutBlock }) {
  if (!block.image) return null
  const ratioClass = block.imageRatio ? ABOUT_IMAGE_RATIO_CLASS[block.imageRatio] : ABOUT_IMAGE_RATIO_CLASS['4:5']
  const position = block.imageFocalPoint ? FOCAL_POINT_POSITION[block.imageFocalPoint] : 'center'
  return (
    <div
      className={`w-full bg-navy/5 bg-cover ${ratioClass}`}
      style={{ backgroundImage: `url(${block.image})`, backgroundPosition: position }}
      role="img"
      aria-label={block.imageAlt || block.title || ''}
    />
  )
}

function NoPhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="koi-night-sky relative flex aspect-[4/5] w-full items-end overflow-hidden p-4">
      <KOIStarField />
      <p className="relative text-[9px] font-semibold tracking-[0.3em] text-warm-white/30">{label}</p>
    </div>
  )
}

function CareerTimeline({ careers }: { careers: AboutCareerItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = careers.filter((c) => c.visible).sort((a, b) => a.order - b.order)
  const featured = visible.filter((c) => c.featured)
  const primary = featured.length > 0 ? featured : visible.slice(0, 8)
  const shown = expanded ? visible : primary
  const hiddenCount = visible.length - primary.length

  if (visible.length === 0) return null

  return (
    <div className="mt-6">
      <p className="text-[10px] font-semibold tracking-[0.15em] opacity-50">CAREER</p>
      <div className="mt-3 space-y-3">
        {shown.map((c) => (
          <div key={c.id} className="flex gap-4 border-b border-current/10 pb-3 text-[13px]">
            <span className="w-12 shrink-0 font-serif font-bold">{c.year}</span>
            <div>
              <p className="font-medium">{c.organization}</p>
              {c.detail && <p className="mt-0.5 opacity-60">{c.detail}</p>}
            </div>
          </div>
        ))}
      </div>
      {!expanded && hiddenCount > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-3 text-[11px] font-semibold underline opacity-60 hover:opacity-100">
          전체 경력 보기 ({visible.length})
        </button>
      )}
    </div>
  )
}

export default function AboutBlockRenderer({ block, isMobile: isMobileOverride }: AboutBlockRendererProps) {
  const realIsMobile = useIsMobile()
  const isMobile = isMobileOverride ?? realIsMobile

  const bgClass = ABOUT_BACKGROUND_CLASS[block.background]
  const textClass = ABOUT_BACKGROUND_TEXT_CLASS[block.background]
  const spacingClass = ABOUT_SPACING_CLASS[block.spacing]
  const isNight = block.background === 'NIGHT'

  const heading = (
    <>
      {block.subtitle && <p className="text-[11px] font-semibold tracking-[0.2em] opacity-50">{block.subtitle}</p>}
      {block.title && <h2 className="mt-1 font-serif text-[26px] font-bold leading-tight">{block.title}</h2>}
    </>
  )

  let content: React.ReactNode = null

  if (block.type === 'CTA') {
    content = (
      <div className={`${TEXT_ALIGN_CLASS[block.textAlign]} ${ABOUT_TEXT_WIDTH_CLASS[block.textWidth]}`}>
        {heading}
        {block.body && (
          <p className="mt-3 text-[14px] leading-relaxed opacity-70" dangerouslySetInnerHTML={{ __html: renderRichText(block.body) }} />
        )}
        {block.ctaLabel && block.ctaUrl && (
          <Link
            to={block.ctaUrl}
            className={`mt-6 inline-block border px-6 py-3 text-[12px] font-semibold tracking-[0.1em] ${
              isNight ? 'border-warm-white/40 hover:border-warm-white' : 'border-navy bg-navy text-warm-white hover:bg-navy-light'
            }`}
          >
            {block.ctaLabel}
          </Link>
        )}
      </div>
    )
  } else if (block.type === 'QUOTE') {
    content = (
      <div className={`${TEXT_ALIGN_CLASS[block.textAlign]} ${ABOUT_TEXT_WIDTH_CLASS[block.textWidth]}`}>
        {block.quote && <blockquote className="font-serif text-[26px] font-bold leading-snug">&ldquo;{block.quote}&rdquo;</blockquote>}
        {block.caption && <p className="mt-4 text-[12px] opacity-50">{block.caption}</p>}
      </div>
    )
  } else if (block.type === 'IMAGE_FULL') {
    content = (
      <div>
        <ImageBox block={block} />
        {block.caption && <p className="mt-3 text-[12px] opacity-50">{block.caption}</p>}
      </div>
    )
  } else if (block.type === 'GALLERY') {
    const cols = block.galleryColumns ?? 3
    content = (
      <div className={`grid grid-cols-2 gap-3 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {(block.galleryImages ?? []).map((img, i) => (
          <div key={i}>
            <div className="aspect-square w-full bg-navy/5 bg-cover bg-center" style={{ backgroundImage: `url(${img.url})` }} />
            {img.caption && <p className="mt-1.5 text-[11px] opacity-50">{img.caption}</p>}
          </div>
        ))}
      </div>
    )
  } else if (block.type === 'CAREER_LIST') {
    content = (
      <div className={ABOUT_TEXT_WIDTH_CLASS[block.textWidth]}>
        {heading}
        <CareerTimeline careers={block.careers ?? []} />
      </div>
    )
  } else {
    // BRAND / PERSON / PHILOSOPHY / FREE_TEXT — the generic image+text editorial block.
    const textNode = (
      <div className={ABOUT_TEXT_WIDTH_CLASS[block.textWidth]}>
        {block.type === 'PERSON' ? (
          <>
            {block.personRole && <p className="text-[11px] font-semibold tracking-[0.2em] opacity-50">{block.personRole}</p>}
            {block.personName && <h2 className="mt-1 font-serif text-[28px] font-bold leading-tight">{block.personName}</h2>}
            {(block.personEnglishName || block.personEnglishRole) && (
              <p className="mt-0.5 text-[12px] opacity-45">
                {block.personEnglishName}
                {block.personEnglishName && block.personEnglishRole && ' · '}
                {block.personEnglishRole}
              </p>
            )}
            {block.subtitle && <p className="mt-3 text-[14px] font-medium italic opacity-80">{block.subtitle}</p>}
          </>
        ) : (
          heading
        )}
        {block.body && (
          <div className="mt-3 text-[14px] leading-relaxed opacity-75">
            <StoryBody body={block.body} />
          </div>
        )}
        {block.quote && <blockquote className="mt-4 font-serif text-[17px] font-bold leading-snug opacity-90">&ldquo;{block.quote}&rdquo;</blockquote>}
        {block.type === 'PERSON' && <CareerTimeline careers={block.careers ?? []} />}
        {block.ctaLabel && block.ctaUrl && (
          <Link to={block.ctaUrl} className="mt-5 inline-block text-[12px] font-semibold underline opacity-70 hover:opacity-100">
            {block.ctaLabel} →
          </Link>
        )}
      </div>
    )

    const imageNode = block.image ? <ImageBox block={block} /> : block.type === 'PERSON' ? <NoPhotoPlaceholder label="KOI PEOPLE" /> : null

    if (block.layout === 'TEXT_FULL' || (!block.image && block.type !== 'PERSON')) {
      content = <div className={TEXT_ALIGN_CLASS[block.textAlign]}>{textNode}</div>
    } else if (block.layout === 'PHOTO_FULL') {
      content = (
        <div>
          {imageNode}
          <div className={`mt-6 ${TEXT_ALIGN_CLASS[block.textAlign]}`}>{textNode}</div>
        </div>
      )
    } else if (isMobile) {
      content = (
        <div className="flex flex-col gap-6">
          {block.mobileOrder === 'IMAGE_FIRST' ? (
            <>
              {imageNode}
              {textNode}
            </>
          ) : (
            <>
              {textNode}
              {imageNode}
            </>
          )}
        </div>
      )
    } else {
      const imageCols = block.layout === 'CUSTOM' ? (block.customImageCols ?? 6) : ABOUT_LAYOUT_IMAGE_COLS[block.layout]
      const imageLeft = block.layout === 'CUSTOM' ? block.customImageSide !== 'RIGHT' : ABOUT_LAYOUT_IMAGE_LEFT[block.layout]
      const textCols = 12 - imageCols
      content = (
        <div className={`grid grid-cols-12 gap-10 ${VERTICAL_ALIGN_CLASS[block.verticalAlign]}`}>
          {imageLeft ? (
            <>
              <div style={{ gridColumn: `span ${imageCols} / span ${imageCols}` }}>{imageNode}</div>
              <div style={{ gridColumn: `span ${textCols} / span ${textCols}` }}>{textNode}</div>
            </>
          ) : (
            <>
              <div style={{ gridColumn: `span ${textCols} / span ${textCols}` }}>{textNode}</div>
              <div style={{ gridColumn: `span ${imageCols} / span ${imageCols}` }}>{imageNode}</div>
            </>
          )}
        </div>
      )
    }
  }

  return (
    <section className={`relative ${bgClass} ${textClass} ${spacingClass} overflow-hidden`}>
      {isNight && <KOIStarField />}
      <div className="relative mx-auto max-w-[1240px] px-6">{content}</div>
    </section>
  )
}
