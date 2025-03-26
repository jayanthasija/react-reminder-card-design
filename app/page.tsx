import ReminderForm from "@/components/reminder-form"
import UpcomingReminders from "@/components/upcoming-reminders"
import { Toaster } from "@/components/ui/sonner"
import { ReminderProvider } from "@/context/reminder-context"

export default function Home() {
  return (
    <ReminderProvider>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ReminderForm />
        <UpcomingReminders />
        <Toaster position="bottom-right" />
      </main>
    </ReminderProvider>
  )
}

