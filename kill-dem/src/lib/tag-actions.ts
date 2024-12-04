'use server'

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const TAGS_FILE = path.join(process.cwd(), 'src/data/tags.json');

// Ensure the data directory exists
async function ensureDirectoryExists() {
  try {
    const dataDir = path.dirname(TAGS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// Read existing tags from JSON file
async function readTags(): Promise<string[]> {
  try {
    await ensureDirectoryExists();
    
    // Check if file exists, if not, return empty array
    try {
      await fs.access(TAGS_FILE);
    } catch {
      await fs.writeFile(TAGS_FILE, JSON.stringify([]));
      return [];
    }

    const fileContents = await fs.readFile(TAGS_FILE, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read tags:', error);
    return [];
  }
}

// Save tags to JSON file
async function saveTags(tags: string[]) {
  try {
    await fs.writeFile(TAGS_FILE, JSON.stringify(tags, null, 2));
  } catch (error) {
    console.error('Failed to save tags:', error);
  }
}

// Get all tags
export async function getTags() {
  try {
    const tags = await readTags();
    return tags.sort();
  } catch (error) {
    console.error('Failed to get tags:', error);
    return [];
  }
}

// Add a new tag
export async function addTag(tag: string) {
  try {
    const tags = await readTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      await saveTags(tags);
      revalidatePath('/');
    }
    return { success: true, message: 'Tag added successfully' };
  } catch (error) {
    console.error('Failed to add tag:', error);
    return { success: false, message: 'Failed to add tag' };
  }
}

// Delete a tag
export async function deleteTag(tag: string) {
  try {
    const tags = await readTags();
    const updatedTags = tags.filter(t => t !== tag);
    await saveTags(updatedTags);
    revalidatePath('/');
    return { success: true, message: 'Tag deleted successfully' };
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return { success: false, message: 'Failed to delete tag' };
  }
}

