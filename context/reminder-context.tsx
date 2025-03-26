"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Reminder = {
  id: string
  task: string
  dateTime: Date | string
}

interface ReminderContextType {
  reminders: Reminder[]
  addReminder: (reminder: Reminder) => void
  deleteReminder: (id: string) => void
  undoDelete: () => void
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined)

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [lastDeletedReminder, setLastDeletedReminder] = useState<Reminder | null>(null)

  // Load reminders from localStorage on initial render
  useEffect(() => {
    const loadReminders = () => {
      const storedReminders = JSON.parse(localStorage.getItem("reminders") || "[]")

      // Convert string dates to Date objects and sort by date
      const processedReminders = storedReminders
        .map((reminder: Reminder) => ({
          ...reminder,
          dateTime: new Date(reminder.dateTime),
        }))
        .sort((a: Reminder, b: Reminder) => {
          return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        })

      setReminders(processedReminders)
    }

    loadReminders()
  }, [])

  const addReminder = (reminder: Reminder) => {
    const updatedReminders = [...reminders, reminder].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    )

    setReminders(updatedReminders)
    localStorage.setItem("reminders", JSON.stringify(updatedReminders))
  }

  const deleteReminder = (id: string) => {
    const reminderToDelete = reminders.find((reminder) => reminder.id === id)

    if (reminderToDelete) {
      setLastDeletedReminder(reminderToDelete)

      const updatedReminders = reminders.filter((reminder) => reminder.id !== id)
      setReminders(updatedReminders)
      localStorage.setItem("reminders", JSON.stringify(updatedReminders))
    }
  }

  const undoDelete = () => {
    if (lastDeletedReminder) {
      const updatedReminders = [...reminders, lastDeletedReminder].sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      )

      setReminders(updatedReminders)
      localStorage.setItem("reminders", JSON.stringify(updatedReminders))
      setLastDeletedReminder(null)
    }
  }

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, deleteReminder, undoDelete }}>
      {children}
    </ReminderContext.Provider>
  )
}

export function useReminders() {
  const context = useContext(ReminderContext)
  if (context === undefined) {
    throw new Error("useReminders must be used within a ReminderProvider")
  }
  return context
}

