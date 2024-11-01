// This file is only for the scheduler page. It manages the tasks and tracking data. (Parth on 1st nov 2024)
// src/lib/data.ts
import fs from 'fs';
import path from 'path';
import { Task } from '@/types/task';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const TRACKING_FILE = path.join(DATA_DIR, 'tracking.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files with empty arrays if they don't exist
[TASKS_FILE, TRACKING_FILE].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf-8');
  }
});

export async function readData(type: 'tasks' | 'tracking') {
  const file = type === 'tasks' ? TASKS_FILE : TRACKING_FILE;
  try {
    const data = await fs.promises.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${type}:`, error);
    return [];
  }
}

export async function writeData(type: 'tasks' | 'tracking', data: any) {
  const file = type === 'tasks' ? TASKS_FILE : TRACKING_FILE;
  try {
    await fs.promises.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${type}:`, error);
    return false;
  }
}

// API route handlers
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'tasks' | 'tracking';

  if (!type || !['tasks', 'tracking'].includes(type)) {
    return new Response('Invalid type parameter', { status: 400 });
  }

  const data = await readData(type);
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'tasks' | 'tracking';

  if (!type || !['tasks', 'tracking'].includes(type)) {
    return new Response('Invalid type parameter', { status: 400 });
  }

  try {
    const body = await request.json();
    const success = await writeData(type, body);
    
    if (!success) {
      throw new Error('Failed to write data');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process request' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}