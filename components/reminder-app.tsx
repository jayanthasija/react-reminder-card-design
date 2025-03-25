"use client"

import { useState, useEffect } from "react"
import { ReminderForm } from "./reminder-form"
import { ReminderList } from "./reminder-list"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Calendar } from "lucide-react"

export type Reminder = {
  id: string
  task: string
  datetime: Date
}

export function ReminderApp() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null)
  const [deletedReminder, setDeletedReminder] = useState<Reminder | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { toast } = useToast()

  // Check if browser supports notifications
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      }
    }
  }, [])

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        toast({
          title: "Notifications enabled",
          description: "You will now receive reminder notifications",
        })
      } else {
        setNotificationsEnabled(false)
        toast({
          title: "Notifications disabled",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        })
      }
    }
  }

  // Add new reminder
  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder])
    toast({
      title: "Reminder set",
      description: `Reminder for "${reminder.task}" set for ${reminder.datetime.toLocaleString()}`,
    })
  }

  // Delete reminder
  const deleteReminder = (id: string) => {
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      setDeletedReminder(reminder)
      setReminders((prev) => prev.filter((r) => r.id !== id))

      // Use the toast with a working undo button
      toast({
        title: "Reminder deleted",
        description: "Click 'Undo' to restore it",
        action: (
          <button
            onClick={() => {
              if (reminder) {
                setReminders((prev) => [...prev, reminder])
                setDeletedReminder(null)
                toast({
                  title: "Reminder restored",
                })
              }
            }}
            className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium"
          >
            Undo
          </button>
        ),
      })
    }
    setReminderToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">New Reminder</h1>
      </div>

      <ReminderForm
        onAddReminder={addReminder}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={requestNotificationPermission}
      />

      <ReminderList reminders={reminders} onDeleteClick={(id) => setReminderToDelete(id)} />

      <DeleteConfirmDialog
        isOpen={reminderToDelete !== null}
        onClose={() => setReminderToDelete(null)}
        onConfirm={() => reminderToDelete && deleteReminder(reminderToDelete)}
      />

      <Toaster />
    </div>
  )
}

