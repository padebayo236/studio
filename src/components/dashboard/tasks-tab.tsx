"use client"
import * as React from "react"
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
import { Button } from "@/components/ui/button"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { demoData } from "@/lib/demo-data"
import type { Task } from "@/lib/types"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusVariant: { [key in Task['status']]: "default" | "secondary" | "destructive" } = {
  "Completed": "default",
  "In Progress": "secondary",
  "Pending": "destructive",
};

export function TasksTab() {
  const [tasks, setTasks] = React.useState(demoData.tasks);

  const handleAddTask = (newTask: Omit<Task, 'taskId'>) => {
    const taskWithId: Task = {
      ...newTask,
      taskId: `T${String(tasks.length + 1).padStart(3, '0')}`,
    };
    setTasks(prevTasks => [taskWithId, ...prevTasks]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Manage and assign farm tasks.</CardDescription>
        </div>
        <TaskFormDialog onTaskCreate={handleAddTask} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Crop</TableHead>
              <TableHead className="hidden md:table-cell">Deadline</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TableRow key={task.taskId}>
                <TableCell>
                  <div className="font-medium">{task.taskType}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {task.description.length > 40 ? `${task.description.substring(0, 40)}...` : task.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[task.status]}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>{task.fieldName}</TableCell>
                <TableCell>{task.cropType}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
