"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar } from "lucide-react"
import type { Reminder } from "./reminder-app"

interface ReminderListProps {
  reminders: Reminder[]
  onDeleteClick: (id: string) => void
}

export function ReminderList({ reminders, onDeleteClick }: ReminderListProps) {
  // Sort reminders by date (earliest first)
  const sortedReminders = [...reminders].sort((a, b) => a.datetime.getTime() - b.datetime.getTime())

  if (sortedReminders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No reminders set</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {sortedReminders.map((reminder) => (
          <Card key={reminder.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{reminder.task}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteClick(reminder.id)}
                  aria-label="Delete reminder"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <p className="text-sm">{reminder.datetime.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

