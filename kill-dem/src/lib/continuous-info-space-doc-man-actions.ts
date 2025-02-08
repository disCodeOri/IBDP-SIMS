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

// Document schema (no changes needed here)
const DocumentSchema = z.object({
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
export type Document = z.infer<typeof DocumentSchema>;

// --- Firestore Interaction Functions ---

// Function to get the user's documentJar subcollection reference
async function getDocumentJarCollectionRef() {
  const authResult = await auth(); // AWAIT the auth() promise
  const { userId } = authResult;     // Now you can get userId from the resolved object

  if (!userId) {
    throw new Error("User not authenticated");
  }
  return collection(db, "users", userId, "documentJar");
}

// Read documents from Firestore
export async function readDocuments(): Promise<Document[]> {
  try {
    const documentJarCollection = await getDocumentJarCollectionRef();
    const documentsSnapshot = await getDocs(query(documentJarCollection, orderBy("position.y"), orderBy("position.x"))); // Order by position for consistent display
    const documentsList = documentsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Document ID as document ID
        name: data.name,
        description: data.description,
        position: data.position,
      } as Document; // Type assertion here
    });
    return documentsList;
  } catch (error) {
    console.error("Error reading documents from Firestore:", error);
    return []; // Return empty array in case of error
  }
}

// Add a new document to Firestore
export async function addDocument(
  newDocument: Omit<Document, "id">,
  gridCols: number = 4,
): Promise<void> {
  try {
    const documentJarCollection = await getDocumentJarCollectionRef();
    const id = crypto.randomUUID(); // Generate UUID for Firestore document ID
    const documentToAdd: Document = {
      ...newDocument,
      id,
      position: {
        x: 0, // Initial position, you might want to calculate this based on existing documents or default to 0,0 and update later
        y: 0,
      },
    };
    const documentDocRef = doc(documentJarCollection, id); // Use the generated UUID as document ID
    await setDoc(documentDocRef, documentToAdd); // setDoc to create or overwrite document
  } catch (error) {
    console.error("Error adding document to Firestore:", error);
  }
}

// Delete a document from Firestore
export async function deleteDocument(id: string): Promise<void> {
  try {
    const documentJarCollection = await getDocumentJarCollectionRef();
    const documentDocRef = doc(documentJarCollection, id);
    await deleteDoc(documentDocRef);
  } catch (error) {
    console.error("Error deleting document from Firestore:", error);
  }
}

// Update a document in Firestore
export async function updateDocument(updatedDocument: Document): Promise<void> {
  try {
    const documentJarCollection = await getDocumentJarCollectionRef();
    const documentDocRef = doc(documentJarCollection, updatedDocument.id);
    await updateDoc(documentDocRef, {
      name: updatedDocument.name,
      description: updatedDocument.description,
      position: updatedDocument.position,
    }); // Update only the fields that might have changed
  } catch (error) {
    console.error("Error updating document in Firestore:", error);
  }
}

// Update document positions in Firestore
export async function updateDocumentPositions(
  updatedDocuments: Document[]
): Promise<void> {
  try {
    const documentJarCollection = await getDocumentJarCollectionRef();
    // Batch updates for efficiency if you have many documents to update at once
    const batch = [];
    for (const document of updatedDocuments) {
      const documentDocRef = doc(documentJarCollection, document.id);
      batch.push(updateDoc(documentDocRef, { position: document.position })); // Only update position
    }
    await Promise.all(batch); // Execute all updates in parallel
  } catch (error) {
    console.error("Error updating document positions in Firestore:", error);
  }
}
