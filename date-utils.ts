// Check if a date is in the past
export const isDateInPast = (date: Date): boolean => {
  const now = new Date()
  return date < now
}

// Check if a datetime string is valid and in the future
export const isValidFutureDateTime = (datetimeStr: string): boolean => {
  if (!datetimeStr) return false

  const date = new Date(datetimeStr)

  // Check if date is valid
  if (isNaN(date.getTime())) return false

  // Check if date is in the future
  return !isDateInPast(date)
}

// Format a date for display
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Get minimum datetime string for input (current time)
export const getMinDateTimeString = (): string => {
  const now = new Date()
  return now.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
}

// Calculate time remaining until a date (returns object with days, hours, minutes)
export const getTimeRemaining = (
  targetDate: Date,
): {
  days: number
  hours: number
  minutes: number
  totalMinutes: number
} => {
  const now = new Date()
  const difference = targetDate.getTime() - now.getTime()

  // If the date is in the past
  if (difference < 0) {
    return { days: 0, hours: 0, minutes: 0, totalMinutes: 0 }
  }

  const totalMinutes = Math.floor(difference / (1000 * 60))
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, totalMinutes }
}

