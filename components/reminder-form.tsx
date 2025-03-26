"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, CalendarIcon } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useReminders } from "@/context/reminder-context"

const formSchema = z.object({
  task: z.string().min(1, "Task is required"),
  dateTime: z.date({
    required_error: "Please select a date and time",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function ReminderForm() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { addReminder } = useReminders()
  const now = new Date()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (values: FormValues) => {
    // Create new reminder with unique ID
    const newReminder = {
      ...values,
      id: crypto.randomUUID(),
    }

    // Add to context (which updates localStorage)
    addReminder(newReminder)

    // Show success notification
    toast.success("Reminder set successfully", {
      description: `${values.task} on ${format(values.dateTime, "PPP 'at' p")}`,
    })

    // Schedule notification if enabled
    if (notificationsEnabled) {
      scheduleNotification(newReminder)
    }

    // Reset form
    form.reset()
  }

  const scheduleNotification = (reminder: FormValues & { id: string }) => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications")
      return
    }

    if (Notification.permission === "granted") {
      const now = new Date()
      const reminderTime = new Date(reminder.dateTime)
      const timeUntilReminder = reminderTime.getTime() - now.getTime()

      if (timeUntilReminder > 0) {
        setTimeout(() => {
          new Notification("Task Reminder", {
            body: `It's time for: ${reminder.task}`,
            icon: "/placeholder.svg?height=64&width=64",
          })
        }, timeUntilReminder)
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          scheduleNotification(reminder)
        }
      })
    }
  }

  const handleNotificationToggle = (checked: boolean) => {
    setNotificationsEnabled(checked)
    if (checked && Notification.permission !== "granted") {
      Notification.requestPermission()
    }
  }

  // Generate available time options based on selected date
  const getTimeOptions = (selectedDate: Date | undefined) => {
    const options = []
    const currentDate = new Date()
    const isToday = selectedDate && isSameDay(selectedDate, currentDate)

    // Start hour - if today, start from current hour, otherwise start from 0
    const startHour = isToday ? currentDate.getHours() : 0
    // Start minute - if today and we're using the current hour, start from next 15-min interval
    const currentMinute = currentDate.getMinutes()
    const startMinuteInterval = isToday && startHour === currentDate.getHours() ? Math.ceil(currentMinute / 15) : 0

    for (let hour = startHour; hour < 24; hour++) {
      // If it's the start hour, begin from the calculated minute interval
      const minuteStart = hour === startHour ? startMinuteInterval : 0

      for (let minuteIdx = minuteStart; minuteIdx < 4; minuteIdx++) {
        const minute = minuteIdx * 15
        const timeDate = new Date()
        timeDate.setHours(hour, minute, 0, 0)

        // Skip times in the past
        if (isToday && timeDate <= currentDate) continue

        const formattedTime = format(timeDate, "h:mm a")
        const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        options.push({ label: formattedTime, value })
      }
    }

    return options
  }

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calendar className="h-5 w-5" />
          New Reminder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date and Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP 'at' p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // When selecting a date, preserve the time if already set
                            // or set to current time if it's today (and in the future)
                            // or set to beginning of day if it's a future date
                            const newDate = new Date(date)

                            if (field.value) {
                              // Preserve existing time
                              newDate.setHours(field.value.getHours(), field.value.getMinutes(), 0, 0)
                            } else if (isSameDay(date, now)) {
                              // For today, set to next 15-min interval
                              const minutes = now.getMinutes()
                              const nextInterval = Math.ceil(minutes / 15) * 15
                              newDate.setHours(now.getHours(), nextInterval, 0, 0)

                              // If the calculated time is in the past, add 15 minutes
                              if (newDate <= now) {
                                newDate.setMinutes(newDate.getMinutes() + 15)
                              }
                            } else {
                              // For future dates, set to beginning of day
                              newDate.setHours(9, 0, 0, 0)
                            }

                            field.onChange(newDate)
                          }
                        }}
                        // Only disable dates before today, not today itself
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const compareDate = new Date(date)
                          compareDate.setHours(0, 0, 0, 0)
                          return compareDate < today
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <select
                          className="w-full p-2 rounded-md border border-input"
                          onChange={(e) => {
                            if (!field.value) {
                              // If no date is selected, use today
                              const today = new Date()
                              field.onChange(today)
                            }

                            const date = new Date(field.value)
                            const [hours, minutes] = e.target.value.split(":")
                            date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0)

                            // Ensure the selected time is in the future
                            if (date <= now) {
                              toast.error("Please select a future time")
                              return
                            }

                            field.onChange(date)
                          }}
                          value={
                            field.value
                              ? `${field.value.getHours().toString().padStart(2, "0")}:${field.value
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0")}`
                              : ""
                          }
                        >
                          <option value="" disabled>
                            Select time
                          </option>
                          {getTimeOptions(field.value).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
              <label
                htmlFor="notifications"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable browser notifications
              </label>
            </div>

            <Button type="submit" className="w-full">
              Set Reminder
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

