"use client"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { demoData } from "@/lib/demo-data"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Worker } from "@/lib/types"

export function WorkersTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers</CardTitle>
        <CardDescription>
          A list of all farm workers in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Employment Type
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Wage Rate
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoData.workers.map((worker: Worker) => (
              <TableRow key={worker.workerId}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Worker photo"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={worker.photoUrl}
                    width="64"
                    data-ai-hint={worker.photoHint}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {worker.name}
                  <div className="text-sm text-muted-foreground">{worker.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={worker.status === 'Active' ? "secondary" : "outline"}>
                    {worker.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {worker.employmentType}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  ${worker.wageRate.toFixed(2)}/hr
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
