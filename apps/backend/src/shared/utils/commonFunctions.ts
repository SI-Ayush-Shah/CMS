export function convertDurationToMs({ value, unit }: ConvertDurationToMsArgs): ConvertDurationToMsResult {
  if (!Number.isFinite(value) || value <= 0) return { milliseconds: 0 }

  const unitToFactorMs: Record<SupportedDurationUnit, number> = {
    minutes: 60_000,
    hours: 3_600_000
  }

  const factor = unitToFactorMs[unit]
  if (!factor) throw new Error('Unsupported unit for convertDurationToMs: expected "minutes" or "hours"')

  return { milliseconds: Math.floor(value * factor) }
}

export function minutesToMs({ minutes }: MinutesToMsArgs): ConvertDurationToMsResult {
  return convertDurationToMs({ value: minutes, unit: 'minutes' })
}

export function hoursToMs({ hours }: HoursToMsArgs): ConvertDurationToMsResult {
  return convertDurationToMs({ value: hours, unit: 'hours' })
}

// Interfaces (static types) kept at the end per project conventions
export interface ConvertDurationToMsArgs {
  value: number
  unit: SupportedDurationUnit
}

export interface ConvertDurationToMsResult {
  milliseconds: number
}

export interface MinutesToMsArgs {
  minutes: number
}

export interface HoursToMsArgs {
  hours: number
}

export interface UnitToFactorMap {
  minutes: number
  hours: number
}

export type SupportedDurationUnit = keyof UnitToFactorMap


