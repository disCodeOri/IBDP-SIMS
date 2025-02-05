// src/lib/cookies-actions.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase"; // Import your firebase db instance
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
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

// --- Firestore Interaction Functions ---

// Function to get the user's cookieJar subcollection reference
async function getCookieJarCollectionRef() {
  const authResult = await auth(); // AWAIT the auth() promise
  const { userId } = authResult;     // Now you can get userId from the resolved object

  if (!userId) {
    throw new Error("User not authenticated");
  }
  return collection(db, "users", userId, "cookieJar");
}

// Read cookies from Firestore
export async function readCookies(): Promise<Cookie[]> {
  try {
    const cookieJarCollection = await getCookieJarCollectionRef();
    const cookiesSnapshot = await getDocs(query(cookieJarCollection, orderBy("position.y"), orderBy("position.x"))); // Order by position for consistent display
    const cookiesList = cookiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Document ID as cookie ID
        name: data.name,
        description: data.description,
        position: data.position,
      } as Cookie; // Type assertion here
    });
    return cookiesList;
  } catch (error) {
    console.error("Error reading cookies from Firestore:", error);
    return []; // Return empty array in case of error
  }
}

// Add a new cookie to Firestore
export async function addCookie(
  newCookie: Omit<Cookie, "id">,
): Promise<void> {
  try {
    const cookieJarCollection = await getCookieJarCollectionRef();
    const id = crypto.randomUUID(); // Generate UUID for Firestore document ID
    const cookieToAdd: Cookie = {
      ...newCookie,
      id,
      position: {
        x: 0, // Initial position, you might want to calculate this based on existing cookies or default to 0,0 and update later
        y: 0,
      },
    };
    const cookieDocRef = doc(cookieJarCollection, id); // Use the generated UUID as document ID
    await setDoc(cookieDocRef, cookieToAdd); // setDoc to create or overwrite document
  } catch (error) {
    console.error("Error adding cookie to Firestore:", error);
  }
}

// Delete a cookie from Firestore
export async function deleteCookie(id: string): Promise<void> {
  try {
    const cookieJarCollection = await getCookieJarCollectionRef();
    const cookieDocRef = doc(cookieJarCollection, id);
    await deleteDoc(cookieDocRef);
  } catch (error) {
    console.error("Error deleting cookie from Firestore:", error);
  }
}

// Update a cookie in Firestore
export async function updateCookie(updatedCookie: Cookie): Promise<void> {
  try {
    const cookieJarCollection = await getCookieJarCollectionRef();
    const cookieDocRef = doc(cookieJarCollection, updatedCookie.id);
    await updateDoc(cookieDocRef, {
      name: updatedCookie.name,
      description: updatedCookie.description,
      position: updatedCookie.position,
    }); // Update only the fields that might have changed
  } catch (error) {
    console.error("Error updating cookie in Firestore:", error);
  }
}

// Update cookie positions in Firestore
export async function updateCookiePositions(
  updatedCookies: Cookie[]
): Promise<void> {
  try {
    const cookieJarCollection = await getCookieJarCollectionRef();
    // Batch updates for efficiency if you have many cookies to update at once
    const batch = [];
    for (const cookie of updatedCookies) {
      const cookieDocRef = doc(cookieJarCollection, cookie.id);
      batch.push(updateDoc(cookieDocRef, { position: cookie.position })); // Only update position
    }
    await Promise.all(batch); // Execute all updates in parallel
  } catch (error) {
    console.error("Error updating cookie positions in Firestore:", error);
  }
}
