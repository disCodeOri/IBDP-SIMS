// src/app/scheduler/tracking/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrackingEntry {
  taskId: string;
  date: string;
  qualitativeNotes: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  challenges: string;
  nextSteps: string;
}

export default function TrackingPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [trackingEntries, setTrackingEntries] = useState<TrackingEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<TrackingEntry>>({
    date: new Date().toISOString().split('T')[0],
    effectiveness: 3
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedEntries = localStorage.getItem('trackingEntries');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedEntries) setTrackingEntries(JSON.parse(savedEntries));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TrackingEntry = {
      taskId: selectedTask,
      date: currentEntry.date || new Date().toISOString().split('T')[0],
      qualitativeNotes: currentEntry.qualitativeNotes || '',
      effectiveness: currentEntry.effectiveness as 1 | 2 | 3 | 4 | 5,
      challenges: currentEntry.challenges || '',
      nextSteps: currentEntry.nextSteps || ''
    };

    const updatedEntries = [...trackingEntries, newEntry];
    setTrackingEntries(updatedEntries);
    localStorage.setItem('trackingEntries', JSON.stringify(updatedEntries));

    // Reset form
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      effectiveness: 3
    });
    setSelectedTask('');
  };

  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push('/scheduler')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scheduler
        </Button>
        <h1 className="text-3xl font-bold">Task Tracking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Tracking Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks
                    .filter(t => t.status !== 'Completed')
                    .map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={currentEntry.date}
                onChange={e => setCurrentEntry({...currentEntry, date: e.target.value})}
              />

              <Textarea
                placeholder="Qualitative Notes"
                value={currentEntry.qualitativeNotes}
                onChange={e => setCurrentEntry({...currentEntry, qualitativeNotes: e.target.value})}
              />

              <Select
                value={currentEntry.effectiveness?.toString()}
                onValueChange={value => setCurrentEntry({...currentEntry, effectiveness: parseInt(value) as 1 | 2 | 3 | 4 | 5})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Effectiveness Rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} - {rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Challenges Faced"
                value={currentEntry.challenges}
                onChange={e => setCurrentEntry({...currentEntry, challenges: e.target.value})}
              />

              <Textarea
                placeholder="Next Steps"
                value={currentEntry.nextSteps}
                onChange={e => setCurrentEntry({...currentEntry, nextSteps: e.target.value})}
              />

              <Button type="submit" className="w-full">
                Save Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {trackingEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry, index) => {
                  const task = getTaskById(entry.taskId);
                  return (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{task?.title}</h3>
                            <Badge>{new Date(entry.date).toLocaleDateString()}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{entry.qualitativeNotes}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              Effectiveness: {entry.effectiveness}/5
                            </Badge>
                          </div>
                          {entry.challenges && (
                            <div className="text-sm">
                              <strong>Challenges:</strong> {entry.challenges}
                            </div>
                          )}
                          {entry.nextSteps && (
                            <div className="text-sm">
                              <strong>Next Steps:</strong> {entry.nextSteps}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}