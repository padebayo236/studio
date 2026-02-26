"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function FarmWorkerDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
        <CardDescription>Your personal dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your tasks and productivity information will be displayed here.</p>
      </CardContent>
    </Card>
  )
}
