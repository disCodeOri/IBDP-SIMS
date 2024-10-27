// src/app/scheduler/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';

const TaskForm = ({ onSubmit, initialData = null, onClose }: any) => {
  const [task, setTask] = useState<Partial<Task>>(
  initialData || {
    title: '',
    description: '',
    category: 'Academic',
    priority: 'Medium',
    status: 'Pending',
    dueDate: new Date().toISOString().split('T')[0],
    concepts: [],
  }
  );

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onSubmit({ ...task, id: initialData?.id || crypto.randomUUID() });
  onClose();
  };

  return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <Input
    placeholder="Task Title"
    value={task.title}
    onChange={(e) => setTask({ ...task, title: e.target.value })}
    required
    />
    <Textarea
    placeholder="Description"
    value={task.description}
    onChange={(e) => setTask({ ...task, description: e.target.value })}
    />
    <div className="grid grid-cols-2 gap-4">
    <Select
      value={task.category}
      onValueChange={(value) => setTask({ ...task, category: value as Category })}
    >
      <SelectTrigger>
      <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
      <SelectItem value="Academic">Academic</SelectItem>
      <SelectItem value="University">University</SelectItem>
      <SelectItem value="Sports">Sports</SelectItem>
      <SelectItem value="Extracurricular">Extracurricular</SelectItem>
      <SelectItem value="Mental Health">Mental Health</SelectItem>
      </SelectContent>
    </Select>
    <Select
      value={task.priority}
      onValueChange={(value) => setTask({ ...task, priority: value as Priority })}
    >
      <SelectTrigger>
      <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
      <SelectItem value="Low">Low</SelectItem>
      <SelectItem value="Medium">Medium</SelectItem>
      <SelectItem value="High">High</SelectItem>
      </SelectContent>
    </Select>
    </div>
    <Input
    type="date"
    value={task.dueDate}
    onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
    />
    {task.category === 'Academic' && (
    <div className="space-y-4">
      <Input
      placeholder="Subject"
      value={task.subject}
      onChange={(e) => setTask({ ...task, subject: e.target.value })}
      />
      <Textarea
      placeholder="Syllabus Topics"
      value={task.syllabus}
      onChange={(e) => setTask({ ...task, syllabus: e.target.value })}
      />
      <Input
      placeholder="Add concepts (comma-separated)"
      value={task.concepts?.join(', ')}
      onChange={(e) => setTask({ 
        ...task, 
        concepts: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
      })}
      />
    </div>
    )}
    <Button type="submit" className="w-full">
    {initialData ? 'Update Task' : 'Create Task'}
    </Button>
  </form>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: any) => {
  const getPriorityColor = (priority: Priority) => {
  const colors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };
  return colors[priority];
  };

  const getStatusColor = (status: Status) => {
  const colors = {
    Pending: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800'
  };
  return colors[status];
  };

  return (
  <Card className="mb-4">
    <CardHeader>
    <div className="flex justify-between items-start">
      <div>
      <CardTitle>{task.title}</CardTitle>
      <CardDescription>{task.description}</CardDescription>
      </div>
      <div className="flex gap-2">
      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
      </div>
    </div>
    </CardHeader>
    <CardContent>
    <div className="space-y-2">
      <p className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      {task.subject && <p className="text-sm">Subject: {task.subject}</p>}
      {task.concepts?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {task.concepts.map((concept: string, index: number) => (
        <Badge key={index} variant="outline">{concept}</Badge>
        ))}
      </div>
      )}
    </div>
    </CardContent>
    <CardFooter className="justify-between">
    <Select
      value={task.status}
      onValueChange={(value) => onStatusChange(task.id, value)}
    >
      <SelectTrigger className="w-32">
      <SelectValue />
      </SelectTrigger>
      <SelectContent>
      <SelectItem value="Pending">Pending</SelectItem>
      <SelectItem value="In Progress">In Progress</SelectItem>
      <SelectItem value="Completed">Completed</SelectItem>
      </SelectContent>
    </Select>
    <div className="space-x-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
      Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
      Delete
      </Button>
    </div>
    </CardFooter>
  </Card>
  );
};

export default function SchedulerPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [search, setSearch] = useState('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    setTasks(JSON.parse(savedTasks));
  }
  }, []);

  useEffect(() => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (task: Task) => {
  if (editTask) {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
  } else {
    setTasks([...tasks, task]);
  }
  };

  const handleDelete = (id: string) => {
  setTasks(tasks.filter(task => task.id !== id));
  };

  const handleStatusChange = (id: string, status: Status) => {
  setTasks(tasks.map(task => 
    task.id === id ? { ...task, status } : task
  ));
  };

  const handleEdit = (task: Task) => {
  setEditTask(task);
  setIsDialogOpen(true);
  };

  const filteredTasks = tasks
  .filter(task => filter === 'All' || task.status === filter)
  .filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div className="max-w-4xl mx-auto py-8">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Task Scheduler</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/scheduler/tracking')}>
          <Calendar className="mr-2 h-4 w-4" /> Track Progress
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={handleSubmit}
              initialData={editTask}
              onClose={() => {
                setIsDialogOpen(false);
                setEditTask(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <div className="flex gap-4 mb-6">
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10"
        />
      </div>
    </div>
    <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
      <SelectTrigger className="w-32">
      <SelectValue placeholder="Filter" />
      </SelectTrigger>
      <SelectContent>
      <SelectItem value="All">All</SelectItem>
      <SelectItem value="Pending">Pending</SelectItem>
      <SelectItem value="In Progress">In Progress</SelectItem>
      <SelectItem value="Completed">Completed</SelectItem>
      </SelectContent>
    </Select>
    </div>

    <Tabs defaultValue="all" className="w-full">
    <TabsList className="mb-4">
      <TabsTrigger value="all">All Tasks</TabsTrigger>
      <TabsTrigger value="academic">Academic</TabsTrigger>
      <TabsTrigger value="university">University</TabsTrigger>
      <TabsTrigger value="other">Other</TabsTrigger>
    </TabsList>

    <ScrollArea className="h-[calc(100vh-300px)]">
      <TabsContent value="all">
      {filteredTasks.map(task => (
        <TaskCard
        key={task.id}
        task={task}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        />
      ))}
      </TabsContent>

      <TabsContent value="academic">
      {filteredTasks
        .filter(task => task.category === 'Academic')
        .map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        ))}
      </TabsContent>

      <TabsContent value="university">
      {filteredTasks
        .filter(task => task.category === 'University')
        .map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        ))}
      </TabsContent>

      <TabsContent value="other">
      {filteredTasks
        .filter(task => !['Academic', 'University'].includes(task.category))
        .map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        ))}
      </TabsContent>
    </ScrollArea>
    </Tabs>
  </div>
  );
}