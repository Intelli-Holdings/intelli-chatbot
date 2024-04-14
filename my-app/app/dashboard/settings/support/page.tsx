import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import HotelInfo from "@/components/hotel-info"

export default function Page (){
  return (
    <div className="min-h-screen w-full">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/10 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav className="grid gap-4 text-sm text-muted-foreground">
            <Link href="#" className="font-semibold text-primary">
              Support
            </Link>
            <Link href="/dashboard/settings/">General</Link>
            <Link href="/dashboard/settings/security">Security</Link>
            <Link href="/dashboard/settings/advanced">Advanced</Link>
            <Link href="/dashboard/settings/integrations">Integrations</Link>

            
          </nav>
          <div className="grid gap-6">         
          </div>
        </div>
      </main>
    </div>
  )
}
