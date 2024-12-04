'use server'

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Define the Workout type
type Workout = {
  id: string;
  content: string;
  createdAt: string;
  tags: string[];
};

// Define the Workout schema using zod
const WorkoutSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  tags: z.array(z.string())
});

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

// Save a new workout
export async function saveWorkout(formData: FormData) {
  const content = formData.get('workout') as string;
  const tags = JSON.parse(formData.get('tags') as string) as string[];
  
  if (!content) {
    return { success: false, message: 'Workout content cannot be empty' };
  }

  try {
    const existingWorkouts = await readWorkouts();
    
    const newWorkout: Workout = {
      id: uuidv4(),
      content,
      createdAt: new Date().toISOString(),
      tags
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

// Update an existing workout
export async function updateWorkout(id: string, content: string, tags: string[]) {
  try {
    const workouts = await readWorkouts();
    
    const updatedWorkouts = workouts.map(workout => 
      workout.id === id 
        ? { ...workout, content, tags } 
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

// Delete a workout
export async function deleteWorkout(id: string) {
  try {
    const workouts = await readWorkouts();
    
    const updatedWorkouts = workouts.filter(workout => workout.id !== id);
    
    await saveWorkouts(updatedWorkouts);
    revalidatePath('/');
    
    return { success: true, message: 'Workout deleted successfully' };
  } catch (error) {
    console.error('Failed to delete workout:', error);
    return { success: false, message: 'Failed to delete workout' };
  }
}

// Get all unique tags from workouts
export async function getAllTags() {
  try {
    const workouts = await readWorkouts();
    const allTags = workouts.flatMap(workout => workout.tags);
    const uniqueTags = allTags.filter((tag, index) => allTags.indexOf(tag) === index);
    return uniqueTags.sort();
  } catch (error) {
    console.error('Failed to get tags:', error);
    return [];
  }
}

// Search workouts by content or tags
export async function searchWorkouts(query: string) {
  try {
    const workouts = await readWorkouts();
    const lowercaseQuery = query.toLowerCase();
    
    const filteredWorkouts = workouts.filter(workout => 
      workout.content.toLowerCase().includes(lowercaseQuery) ||
      workout.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
    
    return filteredWorkouts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to search workouts:', error);
    return [];
  }
}

