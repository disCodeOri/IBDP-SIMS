import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { saveWorkout, getWorkouts, updateWorkout, deleteWorkout } from '@/lib/workouts-actions';

// Define workout type to match server-side schema
type Workout = {
  id: string;
  content: string;
  createdAt: string;
};

export default function Workouts() {
  const [workoutInput, setWorkoutInput] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Fetch workouts on component mount
  React.useEffect(() => {
    async function fetchWorkouts() {
      const fetchedWorkouts = await getWorkouts();
      setWorkouts(fetchedWorkouts);
    }
    fetchWorkouts();
  }, []);

  // Handle workout submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('workout', workoutInput);
    
    const result = await saveWorkout(formData);
    
    if (result.success) {
      // Refresh workouts list
      const updatedWorkouts = await getWorkouts();
      setWorkouts(updatedWorkouts);
      setWorkoutInput('');
    }
  };

  // Open workout details
  const openWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setEditContent(workout.content);
    setIsDialogOpen(true);
    setIsEditing(false);
  };

  // Handle workout update
  const handleUpdateWorkout = async () => {
    if (selectedWorkout) {
      const result = await updateWorkout(selectedWorkout.id, editContent);
      
      if (result.success) {
        // Refresh workouts list
        const updatedWorkouts = await getWorkouts();
        setWorkouts(updatedWorkouts);
        
        // Update selected workout
        setSelectedWorkout({
          ...selectedWorkout,
          content: editContent
        });
        
        // Exit editing mode
        setIsEditing(false);
      }
    }
  };

  // Handle workout deletion
  const handleDeleteWorkout = async () => {
    if (selectedWorkout) {
      const result = await deleteWorkout(selectedWorkout.id);
      
      if (result.success) {
        // Refresh workouts list
        const updatedWorkouts = await getWorkouts();
        setWorkouts(updatedWorkouts);
        
        // Close dialog
        setIsDialogOpen(false);
        setSelectedWorkout(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Workout Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={workoutInput}
          onChange={(e) => setWorkoutInput(e.target.value)}
          placeholder="Enter your workout details..."
          className="mb-4"
        />
        <Button type="submit" disabled={!workoutInput.trim()}>
          Save Workout
        </Button>
      </form>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <Card 
            key={workout.id} 
            onClick={() => openWorkoutDetails(workout)}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle>
                Workout on {new Date(workout.createdAt).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3">{workout.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkout && `Workout on ${new Date(selectedWorkout.createdAt).toLocaleString()}`}
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="h-64"
            />
          ) : (
            <div className="w-full overflow-auto max-h-[60vh] p-2 whitespace-pre-wrap break-words">
              {selectedWorkout?.content}
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateWorkout}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={handleDeleteWorkout}>
                  Delete
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}