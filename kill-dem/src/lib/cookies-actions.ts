// src/lib/cookies-actions.ts
"use server";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";

// Path to the cookies JSON file
const COOKIES_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "cookies.json"
);

// Ensure the file and directory exist
async function ensureFileExists() {
  const dir = path.dirname(COOKIES_FILE_PATH);
  await mkdir(dir, { recursive: true });

  try {
    await writeFile(COOKIES_FILE_PATH, "[]", { flag: "wx" });
  } catch (error) {
    // File already exists, which is fine
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

// Cookie schema
const CookieSchema = z.object({
  id: z.string(), // id is always a string
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

export type Cookie = z.infer<typeof CookieSchema>;

// Read cookies from the JSON file
export async function readCookies(): Promise<Cookie[]> {
  await ensureFileExists();

  try {
    const fileContents = await readFile(COOKIES_FILE_PATH, "utf8");
    const parsedCookies: unknown[] = JSON.parse(fileContents); // Type as unknown[]

    // Validate and parse with Zod
    const validatedCookies: Cookie[] = parsedCookies
      .map((cookie: unknown) => {
        try {
          return CookieSchema.parse(cookie);
        } catch (error) {
          console.error("Invalid cookie data:", cookie, error);
          return null; // Or throw the error if you want to halt execution
        }
      })
      .filter(Boolean) as Cookie[]; //Filter out the nulls

    return validatedCookies;
  } catch (error) {
    console.error("Error reading cookies:", error);
    return []; // Return empty array in case of error
  }
}

// Write cookies to the JSON file
export async function writeCookies(cookies: Cookie[]): Promise<void> {
  const validatedCookies = cookies.map((cookie) => CookieSchema.parse(cookie));

  await writeFile(COOKIES_FILE_PATH, JSON.stringify(validatedCookies, null, 2));
}

// Add a new cookie
export async function addCookie(newCookie: Omit<Cookie, "id">): Promise<void> {
  const cookies = await readCookies();

  // Generate a unique ID (using UUID is recommended for production)
  const id = crypto.randomUUID();

  const cookieToAdd: Cookie = {
    ...newCookie,
    id,
    position: {
      x: cookies.length % 4,
      y: Math.floor(cookies.length / 4),
    },
  };

  const updatedCookies = [...cookies, cookieToAdd];

  await writeCookies(updatedCookies);
}

export async function deleteCookie(id: string): Promise<void> {
  try {
    const cookies = await readCookies();
    const updatedCookies = cookies.filter((cookie) => cookie.id !== id);
    await writeCookies(updatedCookies);
  } catch (error) {
    console.error("Error deleting cookie:", error);
    // Handle the error as needed (e.g., display an error message)
  }
}

// Update cookie
export async function updateCookie(updatedCookie: Cookie): Promise<void> {
  try {
    const cookies = await readCookies();
    const index = cookies.findIndex((cookie) => cookie.id === updatedCookie.id);

    if (index === -1) {
      console.error("Cookie not found");
      return;
    }
    cookies[index] = updatedCookie;

    await writeCookies(cookies);
  } catch (error) {
    console.error("Error updating cookie:", error);
  }
}

// Update cookie positions (for drag and drop)
export async function updateCookiePositions(
  updatedCookies: Cookie[]
): Promise<void> {
  await writeCookies(updatedCookies);
}
