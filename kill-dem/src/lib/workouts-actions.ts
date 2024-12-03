'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Workout schema for type safety
const WorkoutSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string()
});

type Workout = z.infer<typeof WorkoutSchema>;

// Path to the workouts JSON file
const WORKOUTS_FILE = path.join(process.cwd(), 'src/data/workouts.json');

// Ensure the data directory exists
async function ensureDirectoryExists() {
  try {
    const dataDir = path.dirname(WORKOUTS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// Read existing workouts from JSON file
async function readWorkouts(): Promise<Workout[]> {
  try {
    await ensureDirectoryExists();
    
    // Check if file exists, if not, return empty array
    try {
      await fs.access(WORKOUTS_FILE);
    } catch {
      await fs.writeFile(WORKOUTS_FILE, JSON.stringify([]));
      return [];
    }

    const fileContents = await fs.readFile(WORKOUTS_FILE, 'utf-8');
    const workouts = JSON.parse(fileContents);
    return WorkoutSchema.array().parse(workouts);
  } catch (error) {
    console.error('Failed to read workouts:', error);
    return [];
  }
}

// Save workouts to JSON file
async function saveWorkouts(workouts: Workout[]) {
  try {
    await fs.writeFile(WORKOUTS_FILE, JSON.stringify(workouts, null, 2));
  } catch (error) {
    console.error('Failed to save workouts:', error);
  }
}

// Save a new workout
export async function saveWorkout(formData: FormData) {
  const workout = formData.get('workout') as string;
  
  if (!workout) {
    return { success: false, message: 'Workout cannot be empty' };
  }

  try {
    const existingWorkouts = await readWorkouts();
    
    const newWorkout: Workout = {
      id: crypto.randomUUID(), // Use built-in UUID generation
      content: workout,
      createdAt: new Date().toISOString()
    };

    const updatedWorkouts = [newWorkout, ...existingWorkouts];
    
    await saveWorkouts(updatedWorkouts);
    revalidatePath('/');
    
    return { success: true, message: 'Workout saved successfully' };
  } catch (error) {
    console.error('Failed to save workout:', error);
    return { success: false, message: 'Failed to save workout' };
  }
}

// Get all workouts
export async function getWorkouts() {
  try {
    const workouts = await readWorkouts();
    return workouts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to get workouts:', error);
    return [];
  }
}

// Update a specific workout
export async function updateWorkout(id: string, newContent: string) {
  try {
    const workouts = await readWorkouts();
    
    const updatedWorkouts = workouts.map(workout => 
      workout.id === id 
        ? { ...workout, content: newContent } 
        : workout
    );
    
    await saveWorkouts(updatedWorkouts);
    revalidatePath('/');
    
    return { success: true, message: 'Workout updated successfully' };
  } catch (error) {
    console.error('Failed to update workout:', error);
    return { success: false, message: 'Failed to update workout' };
  }
}

// Delete a specific workout
export async function deleteWorkout(id: string) {
  try {
    const workouts = await readWorkouts();
    
    const filteredWorkouts = workouts.filter(workout => workout.id !== id);
    
    await saveWorkouts(filteredWorkouts);
    revalidatePath('/');
    
    return { success: true, message: 'Workout deleted successfully' };
  } catch (error) {
    console.error('Failed to delete workout:', error);
    return { success: false, message: 'Failed to delete workout' };
  }
}