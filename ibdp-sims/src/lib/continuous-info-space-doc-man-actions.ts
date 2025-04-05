"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";

/**
 * Zod schema to validate the structure of a Notebook object.
 * Defines the expected data types and constraints for each field in a notebook document.
 * This schema is used to ensure data integrity when reading and writing notebook data.
 */
const NotebookSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  sections: z.array(z.any()).optional()
});

export type notebook = z.infer<typeof NotebookSchema>;

/**
 * Helper function to get a Firestore CollectionReference for notebooks.
 * It encapsulates the logic to retrieve the user ID and then construct the path to the 'notebooks' collection
 * under the user's document in Firestore.
 * @returns {Promise<CollectionReference>} - Firestore CollectionReference for notebooks.
 * @throws {Error} - If the user is not authenticated.
 */
async function getNotebooksCollectionRef() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");
  return collection(db, "users", userId, "notebooks");
}

/**
 * Reads all notebooks for the currently authenticated user from Firestore.
 * Fetches all documents from the 'notebooks' collection for the user and parses them using the NotebookSchema.
 * It also includes error handling and filtering out invalid notebooks.
 * @returns {Promise<notebook[]>} - An array of notebook objects, or an empty array if there are errors or no notebooks.
 */
export async function readNotebooks(): Promise<notebook[]> {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    const snapshot = await getDocs(notebooksCol);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Add null checks and default values to handle potentially missing fields in Firestore documents.
      if (!data.title || !data.createdAt || !data.userId) {
        console.warn(`Notebook ${doc.id} is missing required fields:`, data);
        return null;
      }

      return NotebookSchema.parse({
        id: doc.id,
        title: data.title,
        description: data.description || '',  // Provide default empty string if description is missing
        createdAt: data.createdAt?.toDate() || new Date(),  // Provide current date as fallback if createdAt is missing or invalid
        updatedAt: data.updatedAt?.toDate() || new Date(),  // Provide current date as fallback if updatedAt is missing or invalid
        userId: data.userId,
        sections: data.sections || []
      });
    }).filter(notebook => notebook !== null) as notebook[]; // Filter out invalid notebooks that failed schema parsing
  } catch (error) {
    console.error("Error reading notebooks:", error);
    return [];
  }
}

/**
 * Retrieves a single notebook document from Firestore by its ID.
 * @param {string} id - The ID of the notebook to retrieve.
 * @returns {Promise<notebook | null>} - The notebook object if found and valid, otherwise null.
 */
export async function getNotebook(id: string): Promise<notebook | null> {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    const notebookDoc = await getDoc(doc(notebooksCol, id));

    if (!notebookDoc.exists()) return null;

    const data = notebookDoc.data();
    return NotebookSchema.parse({
      id: notebookDoc.id,
      title: data.title,
      description: data.description,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      userId: data.userId,
      sections: data.sections || []
    });
  } catch (error) {
    console.error("Error getting notebook:", error);
    return null;
  }
}

/**
 * Adds a new notebook to Firestore.
 * It automatically sets the userId, createdAt, and updatedAt fields, and initializes sections as an empty array.
 * @param {Omit<notebook, "id" | "createdAt" | "updatedAt" | "userId">} notebook - Notebook data excluding ID and timestamps.
 * @returns {Promise<notebook>} - The newly created notebook object, including the generated ID and timestamps.
 * @throws {Error} - If there's an error during the process of adding the notebook.
 */
export async function addNotebook(notebook: Omit<notebook, "id" | "createdAt" | "updatedAt" | "userId">) {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    const { userId } = await auth();

    const newNotebookRef = doc(notebooksCol); // Create a new document reference with an auto-generated ID
    const now = serverTimestamp(); // Get the Firestore server timestamp

    await setDoc(newNotebookRef, {
      ...notebook,
      userId,
      sections: [], // Initialize sections as an empty array for new notebooks
      createdAt: now,
      updatedAt: now
    });

    // Return the newly created notebook object with generated ID and timestamps, converting serverTimestamp to Date
    return {
      id: newNotebookRef.id,
      ...notebook,
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };
  } catch (error) {
    console.error("Error adding notebook:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Updates the 'sections' field of an existing notebook in Firestore.
 * Allows for partial updates, specifically for the sections array, and updates the 'updatedAt' timestamp.
 * @param {string} id - The ID of the notebook to update.
 * @param {any[]} sections - The new sections array to be set for the notebook.
 * @throws {Error} - If there's an error during the update process.
 */
export async function updateNotebook(id: string, sections: any[]) {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    await setDoc(doc(notebooksCol, id), {
      sections,
      updatedAt: serverTimestamp() // Update the 'updatedAt' timestamp to the server's current time
    }, { merge: true }); // Use merge: true to avoid overwriting other fields in the notebook document
  } catch (error) {
    console.error("Error updating notebook:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Deletes a notebook document from Firestore.
 * @param {string} id - The ID of the notebook to delete.
 * @throws {Error} - If there's an error during deletion.
 */
export async function deleteNotebook(id: string) {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    await deleteDoc(doc(notebooksCol, id));
  } catch (error) {
    console.error("Error deleting notebook:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}