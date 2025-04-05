"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";

/**
 * Zod schema to validate the structure of a Cookie object.
 * Ensures that cookie data conforms to the expected format before being processed or stored.
 * Defines the shape of a cookie with properties like id, name, description, and an optional position.
 */
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

/**
 * Interface defining the structure of the cookieJar document in Firestore.
 * It specifies that the document should contain a 'cookies' field, which is a record (object)
 * where keys are cookie IDs (strings) and values are Cookie objects (without the 'id' field, as the ID is the key).
 */
interface CookieJarDocument {
  cookies: Record<string, Omit<Cookie, 'id'>>;
}

// --- Firestore Interaction Functions ---

/**
 * Asynchronously retrieves a DocumentReference to the user's cookieJar document in Firestore.
 * This function handles authentication to ensure only logged-in users can access their cookie jar.
 * It constructs the Firestore path to the cookieJar document, which is nested under the user's document.
 * @returns {Promise<DocumentReference>} - A promise that resolves to a DocumentReference for the cookieJar.
 * @throws {Error} - If the user is not authenticated, an error is thrown.
 */
async function getCookieJarDocRef() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return doc(db, "users", userId, "cookieJar", "cookies");
}

/**
 * Reads and retrieves all cookies from the user's cookieJar in Firestore.
 * Fetches the cookieJar document and extracts the cookie data, then transforms it into an array of Cookie objects.
 * It also sorts the cookies based on their 'position' property to maintain visual order, defaulting to position (0,0) if not set.
 * @returns {Promise<Cookie[]>} - A promise that resolves to an array of Cookie objects. Returns an empty array if no cookies are found or in case of errors.
 */
export async function readCookies(): Promise<Cookie[]> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);

    // If the cookieJar document does not exist, return an empty array.
    if (!docSnap.exists()) {
      return [];
    }

    const data = docSnap.data() as CookieJarDocument;
    // Convert the record of cookies into an array of Cookie objects, including the ID from the document key.
    return Object.entries(data.cookies).map(([id, cookie]) => ({
      id,
      ...cookie
    })).sort((a, b) => {
      // Sort cookies primarily by y-position (row) and then by x-position (column) to maintain grid order.
      if (a.position?.y === b.position?.y) {
        return (a.position?.x || 0) - (b.position?.x || 0); // Default to 0 if position is not defined.
      }
      return (a.position?.y || 0) - (b.position?.y || 0); // Default to 0 if position is not defined.
    });
  } catch (error) {
    console.error("Error reading cookies from Firestore:", error);
    return []; // Return an empty array in case of an error to prevent app crashes.
  }
}

/**
 * Adds a new cookie to the user's cookieJar in Firestore.
 * Generates a unique ID for the new cookie and sets its initial position to the top-left of the grid (0,0).
 * It merges the new cookie into the existing cookieJar document, preserving existing cookies.
 * @param {Omit<Cookie, "id">} newCookie - An object containing the new cookie's data (name and description), excluding the ID.
 * @param {number} [gridCols=4] - Optional parameter for the number of columns in the cookie grid (currently not directly used in addCookie but might be relevant for position calculation in future).
 * @returns {Promise<void>} - A promise that resolves when the cookie is successfully added to Firestore.
 */
export async function addCookie(
  newCookie: Omit<Cookie, "id">,
  gridCols: number = 4, // gridCols parameter is defined but not currently used in positioning logic
): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);
    const id = crypto.randomUUID(); // Generate a unique ID for the new cookie using crypto.randomUUID().

    // Determine the existing cookie data. If the document doesn't exist yet, start with an empty cookies object.
    const existingData = docSnap.exists()
      ? (docSnap.data() as CookieJarDocument)
      : { cookies: {} };

    await setDoc(cookieJarDocRef, {
      cookies: {
        ...existingData.cookies, // Merge with existing cookies
        [id]: {
          name: newCookie.name,
          description: newCookie.description,
          position: { x: 0, y: 0 } // Set initial position for new cookies to (0,0)
        }
      }
    });
  } catch (error) {
    console.error("Error adding cookie to Firestore:", error);
  }
}

/**
 * Deletes a cookie from the user's cookieJar in Firestore.
 * Removes the cookie with the given ID from the 'cookies' record in the cookieJar document.
 * @param {string} id - The ID of the cookie to delete.
 * @returns {Promise<void>} - A promise that resolves when the cookie is successfully deleted from Firestore.
 */
export async function deleteCookie(id: string): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);

    // If the cookieJar document does not exist, there's nothing to delete, so just return.
    if (!docSnap.exists()) return;

    const data = docSnap.data() as CookieJarDocument;
    // Use destructuring to remove the cookie with the specified ID from the cookies record.
    const { [id]: deletedCookie, ...remainingCookies } = data.cookies;

    await setDoc(cookieJarDocRef, {
      cookies: remainingCookies // Update Firestore with the remaining cookies.
    });
  } catch (error) {
    console.error("Error deleting cookie from Firestore:", error);
  }
}

/**
 * Updates an existing cookie's data in Firestore.
 * Overwrites the data for the cookie with the matching ID in the cookieJar document.
 * @param {Cookie} updatedCookie - The complete Cookie object with updated properties (name, description, position).
 * @returns {Promise<void>} - A promise that resolves when the cookie is successfully updated in Firestore.
 */
export async function updateCookie(updatedCookie: Cookie): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);

    // If the cookieJar document does not exist, return as there's nothing to update.
    if (!docSnap.exists()) return;

    const data = docSnap.data() as CookieJarDocument;

    await setDoc(cookieJarDocRef, {
      cookies: {
        ...data.cookies, // Keep existing cookies
        [updatedCookie.id]: { // Overwrite the cookie with the given ID
          name: updatedCookie.name,
          description: updatedCookie.description,
          position: updatedCookie.position // Update position as well
        }
      }
    });
  } catch (error) {
    console.error("Error updating cookie in Firestore:", error);
  }
}

/**
 * Updates the positions of multiple cookies in Firestore.
 * Efficiently updates the 'position' field for each cookie in the provided array within the cookieJar document.
 * This is typically used after drag-and-drop operations to persist the new cookie layout.
 * @param {Cookie[]} updatedCookies - An array of Cookie objects, each containing an updated 'position' property.
 * @returns {Promise<void>} - A promise that resolves when all cookie positions are successfully updated in Firestore.
 */
export async function updateCookiePositions(
  updatedCookies: Cookie[]
): Promise<void> {
  try {
    const cookieJarDocRef = await getCookieJarDocRef();
    const docSnap = await getDoc(cookieJarDocRef);

    // If the cookieJar document does not exist, return as there's nothing to update.
    if (!docSnap.exists()) return;

    const data = docSnap.data() as CookieJarDocument;
    const updatedData = { ...data.cookies }; // Create a shallow copy of the existing cookies data.

    updatedCookies.forEach(cookie => {
      // Only update if the cookie exists in the current data.
      if (updatedData[cookie.id]) {
        updatedData[cookie.id] = {
          ...updatedData[cookie.id],
          position: cookie.position // Update only the position, preserving other cookie properties.
        };
      }
    });

    await setDoc(cookieJarDocRef, {
      cookies: updatedData // Update Firestore with the modified cookies data containing new positions.
    });
  } catch (error) {
    console.error("Error updating cookie positions in Firestore:", error);
  }
}