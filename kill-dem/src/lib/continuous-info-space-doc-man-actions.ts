// File: src/lib/continuous-info-space-doc-man-actions.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";

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

async function getNotebooksCollectionRef() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");
  return collection(db, "users", userId, "notebooks");
}

export async function readNotebooks(): Promise<notebook[]> {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    const snapshot = await getDocs(notebooksCol);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Add null checks and default values
      if (!data.title || !data.createdAt || !data.userId) {
        console.warn(`Notebook ${doc.id} is missing required fields:`, data);
        return null;
      }
      
      return NotebookSchema.parse({
        id: doc.id,
        title: data.title,
        description: data.description || '',  // Provide default empty string
        createdAt: data.createdAt?.toDate() || new Date(),  // Provide current date as fallback
        updatedAt: data.updatedAt?.toDate() || new Date(),  // Provide current date as fallback
        userId: data.userId,
        sections: data.sections || []
      });
    }).filter(notebook => notebook !== null) as notebook[]; // Filter out invalid notebooks
  } catch (error) {
    console.error("Error reading notebooks:", error);
    return [];
  }
}

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

export async function addNotebook(notebook: Omit<notebook, "id" | "createdAt" | "updatedAt" | "userId">) {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    const { userId } = await auth();
    
    const newNotebookRef = doc(notebooksCol);
    const now = serverTimestamp();
    
    await setDoc(newNotebookRef, {
      ...notebook,
      userId,
      sections: [],
      createdAt: now,
      updatedAt: now
    });

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
    throw error;
  }
}

export async function updateNotebook(id: string, sections: any[]) {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    await setDoc(doc(notebooksCol, id), {
      sections,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating notebook:", error);
    throw error;
  }
}

export async function deleteNotebook(id: string) {
  try {
    const notebooksCol = await getNotebooksCollectionRef();
    await deleteDoc(doc(notebooksCol, id));
  } catch (error) {
    console.error("Error deleting notebook:", error);
    throw error;
  }
}