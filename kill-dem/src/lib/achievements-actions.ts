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

// Achievement schema
const AchievementSchema = z.object({
    id: z.string(), // id is always a string
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().optional(),
    position: z.object({
        x: z.number(),
        y: z.number()
    }).optional()
});

export type Achievement = z.infer<typeof AchievementSchema>;

// Read achievements from the JSON file
export async function readAchievements(): Promise<Achievement[]> {
  await ensureFileExists();

  try {
      const fileContents = await readFile(ACHIEVEMENTS_FILE_PATH, 'utf8');
      const parsedAchievements: unknown[] = JSON.parse(fileContents); // Type as unknown[]

      // Validate and parse with Zod
      const validatedAchievements: Achievement[] = parsedAchievements.map((achievement: unknown) => {
        try {
          return AchievementSchema.parse(achievement)
        } catch (error) {
          console.error("Invalid achievement data:", achievement, error);
          return null; // Or throw the error if you want to halt execution
        }
      }).filter(Boolean) as Achievement[];  //Filter out the nulls

      return validatedAchievements;


  } catch (error) {
      console.error("Error reading achievements:", error)
      return []; // Return empty array in case of error
  }
}

// Write achievements to the JSON file
export async function writeAchievements(achievements: Achievement[]): Promise<void> {
    const validatedAchievements = achievements.map(achievement => AchievementSchema.parse(achievement));

    await writeFile(
        ACHIEVEMENTS_FILE_PATH,
        JSON.stringify(validatedAchievements, null, 2)
    );
}

// Add a new achievement
export async function addAchievement(newAchievement: Omit<Achievement, 'id'>): Promise<void> {
    const achievements = await readAchievements();

    // Generate a unique ID (using UUID is recommended for production)
    const id = crypto.randomUUID();


    const achievementToAdd: Achievement = {
        ...newAchievement,
        id,
        position: {
            x: achievements.length % 4,
            y: Math.floor(achievements.length / 4)
        }
    };


    const updatedAchievements = [...achievements, achievementToAdd];

    await writeAchievements(updatedAchievements);
}

export async function deleteAchievement(id: string): Promise<void> {
  try {
      const achievements = await readAchievements();
      const updatedAchievements = achievements.filter(achievement => achievement.id !== id);
      await writeAchievements(updatedAchievements);
  } catch (error) {
      console.error("Error deleting achievement:", error);
      // Handle the error as needed (e.g., display an error message)
  }
}

// Update achievement
export async function updateAchievement(updatedAchievement: Achievement): Promise<void> {
    try {
        const achievements = await readAchievements();
        const index = achievements.findIndex(achievement => achievement.id === updatedAchievement.id);

        if (index === -1) {
            console.error("Achievement not found");
            return;
        }
        achievements[index] = updatedAchievement;


        await writeAchievements(achievements);
    } catch (error) {
        console.error("Error updating achievement:", error)
    }
}

// Update achievement positions (for drag and drop)
export async function updateAchievementPositions(updatedAchievements: Achievement[]): Promise<void> {
    await writeAchievements(updatedAchievements);
}