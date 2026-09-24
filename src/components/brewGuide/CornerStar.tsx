import { archive } from '../../pages/public/brewGuide/tokens'

export default function CornerStar({ className }: { className: string }) {
  return (
    <svg viewBox="-16 -16 32 32" className={`absolute h-6 w-6 animate-pulse ${archive.accentText} ${className}`} fill="currentColor">
      <path d="M0,-12 C0.4,-3.8 1.3,-0.9 12,0 C1.3,0.9 0.4,3.8 0,12 C-0.4,3.8 -1.3,0.9 -12,0 C-1.3,-0.9 -0.4,-3.8 0,-12 Z" />
    </svg>
  )
}
