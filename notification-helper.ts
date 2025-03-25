// Check if browser supports notifications
export const checkNotificationSupport = (): boolean => {
  return "Notification" in window
}

// Check if notification permission is granted
export const checkNotificationPermission = (): boolean => {
  if (!checkNotificationSupport()) return false
  return Notification.permission === "granted"
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) return false

  try {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return false
  }
}

// Send a notification
export const sendNotification = (title: string, options?: NotificationOptions): boolean => {
  if (!checkNotificationSupport() || !checkNotificationPermission()) return false

  try {
    new Notification(title, options)
    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    return false
  }
}

// Schedule a notification for a future time
export const scheduleNotification = (title: string, options: NotificationOptions, scheduledTime: Date): number => {
  const now = new Date()
  const timeUntilNotification = scheduledTime.getTime() - now.getTime()

  if (timeUntilNotification <= 0) {
    console.warn("Scheduled time is in the past")
    return -1
  }

  const timerId = window.setTimeout(() => {
    sendNotification(title, options)
  }, timeUntilNotification)

  return timerId
}

// Cancel a scheduled notification
export const cancelScheduledNotification = (timerId: number): void => {
  window.clearTimeout(timerId)
}

