// src/lib/cookies-actions.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase"; // Import your firebase db instance
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth } from "@clerk/nextjs/server"; // Import Clerk auth for user ID

// Cookie schema (no changes needed here)
const CookieSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});
export type Cookie = z.infer<typeof CookieSchema>;

interface CookieJarDocument {
  cookies: Record<string, Omit<Cookie, 'id'>>;
}

// --- Firestore Interaction Functions ---

// Function to get the user's cookieJar document reference
async function getCookieJarDocRef() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return doc(db, "users", userId, "cookieJar", "cookies");
}

// Read cookies from Firestore
export async function readCookies(): Promise<Cookie[]> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);
    
    if (!docSnap.exists()) {
      return [];
    }

    const data = docSnap.data() as CookieJarDocument;
    return Object.entries(data.cookies).map(([id, cookie]) => ({
      id,
      ...cookie
    })).sort((a, b) => {
      if (a.position?.y === b.position?.y) {
        return (a.position?.x || 0) - (b.position?.x || 0);
      }
      return (a.position?.y || 0) - (b.position?.y || 0);
    });
  } catch (error) {
    console.error("Error reading cookies from Firestore:", error);
    return [];
  }
}

// Add a new cookie to Firestore
export async function addCookie(
  newCookie: Omit<Cookie, "id">,
  gridCols: number = 4,
): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);
    const id = crypto.randomUUID();
    
    const existingData = docSnap.exists() 
      ? (docSnap.data() as CookieJarDocument) 
      : { cookies: {} };

    await setDoc(cookieJarDocRef, {
      cookies: {
        ...existingData.cookies,
        [id]: {
          name: newCookie.name,
          description: newCookie.description,
          position: { x: 0, y: 0 }
        }
      }
    });
  } catch (error) {
    console.error("Error adding cookie to Firestore:", error);
  }
}

// Delete a cookie from Firestore
export async function deleteCookie(id: string): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);
    
    if (!docSnap.exists()) return;

    const data = docSnap.data() as CookieJarDocument;
    const { [id]: deletedCookie, ...remainingCookies } = data.cookies;

    await setDoc(cookieJarDocRef, {
      cookies: remainingCookies
    });
  } catch (error) {
    console.error("Error deleting cookie from Firestore:", error);
  }
}

// Update a cookie in Firestore
export async function updateCookie(updatedCookie: Cookie): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);
    
    if (!docSnap.exists()) return;

    const data = docSnap.data() as CookieJarDocument;
    
    await setDoc(cookieJarDocRef, {
      cookies: {
        ...data.cookies,
        [updatedCookie.id]: {
          name: updatedCookie.name,
          description: updatedCookie.description,
          position: updatedCookie.position
        }
      }
    });
  } catch (error) {
    console.error("Error updating cookie in Firestore:", error);
  }
}

// Update cookie positions in Firestore
export async function updateCookiePositions(
  updatedCookies: Cookie[]
): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);
    
    if (!docSnap.exists()) return;

    const data = docSnap.data() as CookieJarDocument;
    const updatedData = { ...data.cookies };

    updatedCookies.forEach(cookie => {
      if (updatedData[cookie.id]) {
        updatedData[cookie.id] = {
          ...updatedData[cookie.id],
          position: cookie.position
        };
      }
    });

    await setDoc(cookieJarDocRef, {
      cookies: updatedData
    });
  } catch (error) {
    console.error("Error updating cookie positions in Firestore:", error);
  }
}
