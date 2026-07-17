import { VERIFICATION_STATUS_LABELS, SOURCE_TYPE_LABELS } from '@/lib/constants'
import type { VerificationStatus, SourceType } from '@/types'
import { Badge } from '@/components/ui/badge'

interface SourceBadgeProps {
  verificationStatus: VerificationStatus
  sourceType: SourceType
  compact?: boolean
}

export function SourceBadge({ verificationStatus, sourceType, compact }: SourceBadgeProps) {
  const variant =
    verificationStatus === 'verified'
      ? 'verified'
      : verificationStatus === 'pending_review'
        ? 'pending'
        : verificationStatus === 'rejected'
          ? 'destructive'
          : 'self'

  const label =
    verificationStatus === 'verified'
      ? 'تأییدشده توسط تیم سلامت'
      : verificationStatus === 'self_reported'
        ? 'ثبت‌شده توسط کاربر'
        : VERIFICATION_STATUS_LABELS[verificationStatus]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={variant}>{label}</Badge>
      {!compact && (
        <Badge variant="outline">{SOURCE_TYPE_LABELS[sourceType] ?? sourceType}</Badge>
      )}
    </div>
  )
}
