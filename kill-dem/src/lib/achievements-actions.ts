// src/lib/achievements-actions.ts
'use server';

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Path to the achievements JSON file
const ACHIEVEMENTS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'achievements.json');

// Ensure the file and directory exist
async function ensureFileExists() {
  const dir = path.dirname(ACHIEVEMENTS_FILE_PATH);
  await mkdir(dir, { recursive: true });
  
  try {
    await writeFile(ACHIEVEMENTS_FILE_PATH, '[]', { flag: 'wx' });
  } catch (error) {
    // File already exists, which is fine
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Achievement schema with optional and partial types
const AchievementSchema = z.object({
  id: z.string().or(z.number()).optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).or(z.number()).optional()
});

export type Achievement = z.infer<typeof AchievementSchema>;

// Read achievements from the JSON file
export async function readAchievements(): Promise<Achievement[]> {
  await ensureFileExists();
  
  try {
    const fileContents = await readFile(ACHIEVEMENTS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // If file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write achievements to the JSON file
export async function writeAchievements(achievements: Achievement[]): Promise<void> {
  // Validate and transform achievements
  const validatedAchievements = achievements.map(achievement => {
    // Ensure id is a string
    const id = achievement.id ? String(achievement.id) : undefined;
    
    // Ensure position is an object if it's not already
    const position = typeof achievement.position === 'number'
      ? { x: achievement.position % 4, y: Math.floor(achievement.position / 4) }
      : achievement.position;
    
    // Create a new object with transformed values
    return {
      ...achievement,
      id,
      position
    };
  }).map(achievement => 
    // Parse with the schema, which will now be more lenient
    AchievementSchema.parse(achievement)
  );

  await writeFile(
    ACHIEVEMENTS_FILE_PATH, 
    JSON.stringify(validatedAchievements, null, 2)
  );
}

// Add a new achievement
export async function addAchievement(newAchievement: Omit<Achievement, 'id'>): Promise<void> {
  const achievements = await readAchievements();
  
  // Generate a unique ID
  const id = Date.now().toString();
  
  // Create the full achievement object
  const achievementToAdd: Achievement = {
    ...newAchievement,
    id,
    position: { 
      x: achievements.length % 4, 
      y: Math.floor(achievements.length / 4) 
    }
  };

  // Validate the new achievement
  AchievementSchema.parse(achievementToAdd);

  // Add to existing achievements
  const updatedAchievements = [...achievements, achievementToAdd];

  // Write back to file
  await writeAchievements(updatedAchievements);
}

// Update achievement positions (for drag and drop)
export async function updateAchievementPositions(updatedAchievements: Achievement[]): Promise<void> {
  await writeAchievements(updatedAchievements);
}