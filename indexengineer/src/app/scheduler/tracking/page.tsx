"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TrackingEntry {
  id: string;
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
  const [editingEntry, setEditingEntry] = useState<TrackingEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await fetch('/api/data?type=tasks');
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        const trackingResponse = await fetch('/api/data?type=tracking');
        const trackingData = await trackingResponse.json();
        setTrackingEntries(trackingData || []); // Ensure we initialize with an empty array if null
      } catch (error) {
        console.error('Error fetching data:', error);
        const savedTasks = localStorage.getItem('tasks');
        const savedEntries = localStorage.getItem('trackingEntries');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedEntries) setTrackingEntries(JSON.parse(savedEntries));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const saveTrackingEntries = async () => {
      try {
        await fetch('/api/data?type=tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackingEntries),
        });
        localStorage.setItem('trackingEntries', JSON.stringify(trackingEntries));
      } catch (error) {
        console.error('Error saving tracking entries:', error);
        localStorage.setItem('trackingEntries', JSON.stringify(trackingEntries));
      }
    };

    // Only save if we have entries and they've been modified
    if (trackingEntries.length >= 0) {
      saveTrackingEntries();
    }
  }, [trackingEntries]);

  const validateEntry = (entry: Partial<TrackingEntry>, taskId: string) => {
    // Check if we have the required fields
    if (!taskId || !entry.date || !entry.qualitativeNotes) {
      console.log('Validation failed:', { taskId, entry });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEntry(currentEntry, selectedTask)) {
      alert('Please fill in all required fields (Task, Date, and Notes)');
      return;
    }

    const newEntry: TrackingEntry = {
      id: editingEntry?.id || crypto.randomUUID(),
      taskId: selectedTask,
      date: currentEntry.date || new Date().toISOString().split('T')[0],
      qualitativeNotes: currentEntry.qualitativeNotes || '',
      effectiveness: currentEntry.effectiveness as 1 | 2 | 3 | 4 | 5,
      challenges: currentEntry.challenges || '',
      nextSteps: currentEntry.nextSteps || ''
    };

    if (editingEntry) {
      // Update existing entry
      setTrackingEntries(prevEntries => 
        prevEntries.map(e => e.id === editingEntry.id ? newEntry : e)
      );
    } else {
      // Add new entry
      setTrackingEntries(prevEntries => [...prevEntries, newEntry]);
    }

    // Reset form
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      effectiveness: 3
    });
    setSelectedTask('');
    setEditingEntry(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (entry: TrackingEntry) => {
    setEditingEntry(entry);
    setSelectedTask(entry.taskId);
    setCurrentEntry({
      date: entry.date,
      qualitativeNotes: entry.qualitativeNotes,
      effectiveness: entry.effectiveness,
      challenges: entry.challenges,
      nextSteps: entry.nextSteps
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      // Create new array without the deleted entry
      const updatedEntries = trackingEntries.filter(entry => entry.id !== entryId);
      
      try {
        // Update state with filtered entries
        setTrackingEntries(updatedEntries);
        
        // Save to API
        await fetch('/api/data?type=tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEntries),
        });
        
        // Update localStorage
        localStorage.setItem('trackingEntries', JSON.stringify(updatedEntries));
      } catch (error) {
        console.error('Error deleting entry:', error);
        // Revert state if save fails
        setTrackingEntries(trackingEntries);
      }
    }
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Tracking Entry'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map(task => (
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
                value={currentEntry.qualitativeNotes || ''}
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
                value={currentEntry.challenges || ''}
                onChange={e => setCurrentEntry({...currentEntry, challenges: e.target.value})}
              />

              <Textarea
                placeholder="Next Steps"
                value={currentEntry.nextSteps || ''}
                onChange={e => setCurrentEntry({...currentEntry, nextSteps: e.target.value})}
              />

              <Button type="submit" className="w-full">
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {trackingEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => {
                  const task = getTaskById(entry.taskId);
                  return (
                    <Card key={entry.id} className="mb-4">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{task?.title || 'Unknown Task'}</h3>
                            <div className="flex gap-2">
                              <Badge>{new Date(entry.date).toLocaleDateString()}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(entry)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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