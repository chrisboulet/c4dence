'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { recordWeeklyMeasure } from '@/app/actions/lead-measure'

type WeeklyInputProps = {
  leadMeasureId: string
  year: number
  weekNumber: number
  currentValue?: number
  target: number
  unit: string
  onSuccess?: () => void
}

export function WeeklyInput({
  leadMeasureId,
  year,
  weekNumber,
  currentValue,
  target,
  unit,
  onSuccess,
}: WeeklyInputProps) {
  const [value, setValue] = useState(currentValue?.toString() || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    setIsSubmitting(true)
    const result = await recordWeeklyMeasure({
      leadMeasureId,
      year,
      weekNumber,
      value: numValue,
    })
    setIsSubmitting(false)

    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSuccess?.()
    }
  }

  const percentage = value ? Math.round((parseFloat(value) / target) * 100) : 0
  const color = percentage >= 100 ? 'text-green-600' : percentage >= 70 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className="pr-16"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
      <span className={`w-12 text-right text-sm font-medium ${color}`}>
        {percentage}%
      </span>
      <Button
        size="icon"
        variant={saved ? 'default' : 'outline'}
        onClick={handleSubmit}
        disabled={isSubmitting || !value}
        className="h-9 w-9"
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  )
}
