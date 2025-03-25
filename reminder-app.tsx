"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, Bell, BellOff, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Reminder {
  id: string
  task: string
  datetime: string
  completed: boolean
}

export default function ReminderApp() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [task, setTask] = useState("")
  const [datetime, setDatetime] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem("reminders")
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders))
  }, [reminders])

  // Check if notifications are supported and permission status
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
      try {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          setNotificationsEnabled(true)
          toast({
            title: "Notifications enabled",
            description: "You will now receive reminder notifications",
          })
        } else {
          toast({
            title: "Notifications disabled",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          })
        }
      } catch (err) {
        console.error("Error requesting notification permission:", err)
        toast({
          title: "Error enabling notifications",
          description: "Please try again or check browser settings",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Notifications not supported",
        description: "Your browser does not support notifications",
        variant: "destructive",
      })
    }
  }

  // Validate the datetime input
  const validateDatetime = (datetimeStr: string): boolean => {
    const selectedDate = new Date(datetimeStr)
    const now = new Date()

    return selectedDate > now
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!task.trim()) {
      setError("Please enter a task")
      return
    }

    if (!datetime) {
      setError("Please select a date and time")
      return
    }

    if (!validateDatetime(datetime)) {
      setError("Please select a future date and time")
      return
    }

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      task: task.trim(),
      datetime,
      completed: false,
    }

    setReminders([...reminders, newReminder])
    setTask("")
    setDatetime("")

    // Schedule notification if enabled
    if (notificationsEnabled) {
      scheduleNotification(newReminder)
    }

    toast({
      title: "Reminder set",
      description: `You will be reminded about "${task}" on ${new Date(datetime).toLocaleString()}`,
    })
  }

  // Schedule a notification for a reminder
  const scheduleNotification = (reminder: Reminder) => {
    const reminderTime = new Date(reminder.datetime).getTime()
    const now = new Date().getTime()
    const timeUntilReminder = reminderTime - now

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Reminder", {
            body: reminder.task,
            icon: "/favicon.ico",
          })
        }
      }, timeUntilReminder)
    }
  }

  // Delete a reminder
  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
    toast({
      title: "Reminder deleted",
      description: "The reminder has been removed",
    })
  }

  // Get upcoming reminders sorted by datetime
  const upcomingReminders = reminders
    .filter((reminder) => !reminder.completed && new Date(reminder.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center mb-6">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          <h1 className="text-xl font-semibold">New Reminder</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task">Task</Label>
                <Input id="task" placeholder="Enter your task" value={task} onChange={(e) => setTask(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="datetime">Date & Time</Label>
                <div className="relative">
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {error && <div className="text-sm font-medium text-destructive">{error}</div>}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  Set Reminder
                </Button>

                <div className="flex items-center justify-between space-x-2 px-2 border rounded-md">
                  <div className="flex items-center space-x-2">
                    {notificationsEnabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Notifications</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2 h-8"
                    onClick={requestNotificationPermission}
                  >
                    <div
                      className={cn(
                        "h-5 w-9 rounded-full p-1 transition-colors",
                        notificationsEnabled ? "bg-primary" : "bg-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full bg-white transition-transform",
                          notificationsEnabled ? "translate-x-4" : "translate-x-0",
                        )}
                      />
                    </div>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {upcomingReminders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upcoming Reminders</h2>
            {upcomingReminders.map((reminder) => (
              <Card key={reminder.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <h3 className="font-medium text-base line-clamp-2">{reminder.task}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(reminder.datetime).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteReminder(reminder.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {upcomingReminders.length === 0 && (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming reminders</p>
              <Button variant="outline" className="mt-4" onClick={() => document.getElementById("task")?.focus()}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first reminder
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

