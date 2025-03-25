"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "lucide-react"
import type { Reminder } from "./reminder-app"

interface ReminderFormProps {
  onAddReminder: (reminder: Reminder) => void
  notificationsEnabled: boolean
  onToggleNotifications: () => void
}

export function ReminderForm({ onAddReminder, notificationsEnabled, onToggleNotifications }: ReminderFormProps) {
  const [task, setTask] = useState("")
  const [datetime, setDatetime] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Get current date and time in ISO format for min attribute
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const minDatetime = `${year}-${month}-${day}T${hours}:${minutes}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!task.trim()) {
      setError("Please select a task")
      return
    }

    if (!datetime) {
      setError("Please set a date and time")
      return
    }

    const datetimeObj = new Date(datetime)
    if (datetimeObj <= new Date()) {
      setError("Please select a future date and time")
      return
    }

    // Create new reminder
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      task: task.trim(),
      datetime: datetimeObj,
    }

    // Add reminder
    onAddReminder(newReminder)

    // Reset form
    setTask("")
    setDatetime("")
    setError(null)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Input id="task" placeholder="Select a task" value={task} onChange={(e) => setTask(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Date & Time</Label>
            <div className="relative">
              <Input
                id="datetime"
                type="datetime-local"
                min={minDatetime}
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="cursor-pointer"
                onClick={(e) => {
                  // This ensures the native datetime picker opens when clicking anywhere on the input
                  e.currentTarget.showPicker()
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={onToggleNotifications} />
            <Label htmlFor="notifications" className="cursor-pointer">
              Enable browser notifications
            </Label>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <Button type="submit" className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Set Reminder
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

