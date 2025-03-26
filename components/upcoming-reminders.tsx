"use client"

import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useReminders } from "@/context/reminder-context"

export default function UpcomingReminders() {
  const { reminders, deleteReminder, undoDelete } = useReminders()

  const handleDelete = (id: string) => {
    deleteReminder(id)

    // Show toast with undo option
    toast("Reminder deleted", {
      description: "The reminder has been removed",
      action: {
        label: "Undo",
        onClick: () => undoDelete(),
      },
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upcoming Reminders</h2>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No upcoming reminders</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">{reminder.task}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {format(new Date(reminder.dateTime), "PPP 'at' p")}
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this reminder? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(reminder.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

