"use client";
import React, { useState, useEffect } from "react";
import DoubtList from "@/components/doubts-tracker/DoubtList";
import NewDoubtForm from "@/components/doubts-tracker/NewDoubtForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp,
  doc,
} from "firebase/firestore";

export interface Comment {
  id: string;
  text: string;
  parentId?: string | null;
  replies: Comment[];
}

export interface Doubt {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  resolved: boolean;
  solution?: string;
  comments: Comment[];
}

export default function DoubtTracker() {
  // User authentication state
  const { user } = useUser();
  // State to hold the list of doubts.
  const [doubts, setDoubts] = useState<Doubt[]>([]);

  // useEffect hook to fetch doubts from Firestore when the component mounts or when the user changes.
  useEffect(() => {
    if (!user) return;
    // Reference to the 'nugget' collection within the user's document in Firestore.
    const nuggetRef = collection(db, "users", user.id, "nugget");
    // Create a query to fetch doubts, ordered by creation time in descending order.
    const q = query(nuggetRef, orderBy("createdAt", "desc"));
    // Subscribe to real-time updates from Firestore using onSnapshot.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedDoubts: Doubt[] = [];
      // Iterate over each document in the snapshot.
      snapshot.forEach((docSnap) => {
        // Extract data from each document and shape it into an Doubt object.
        loadedDoubts.push({
          id: docSnap.id,
          title: docSnap.data().title,
          description: docSnap.data().description,
          upvotes: docSnap.data().upvotes,
          downvotes: docSnap.data().downvotes,
          resolved: docSnap.data().resolved,
          solution: docSnap.data().solution,
          comments: [], // Initialize comments as an empty array, they are fetched separately if needed.
        });
      });
      // Update the doubts state with the fetched doubts.
      setDoubts(loadedDoubts);
    });
    // Return the unsubscribe function to detach the listener when the component unmounts.
    return () => unsubscribe();
  }, [user]); // Dependency array ensures this effect runs when 'user' object changes.

  // Function to add a new doubt to Firestore.
  const addDoubt = async (title: string, description: string) => {
    if (!user) return;
    try {
      // Get reference to the 'nugget' collection for the current user.
      const nuggetRef = collection(db, "users", user.id, "nugget");
      // Add a new document to the 'nugget' collection with the provided title and description.
      await addDoc(nuggetRef, {
        title,
        description,
        upvotes: 0,
        downvotes: 0,
        resolved: false,
        solution: "",
        createdAt: serverTimestamp(), // Use Firestore server timestamp for creation time.
      });
    } catch (error) {
      console.error("Error creating doubt:", error);
    }
  };

  // Function to resolve an doubt in Firestore.
  const resolveDoubt = async (id: string, solution: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document within the user's 'nugget' collection.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Update the doubt document to mark it as resolved and add the provided solution.
      await updateDoc(doubtRef, { resolved: true, solution });
    } catch (error) {
      console.error("Error resolving doubt:", error);
    }
  };

  // Function to reopen a resolved doubt in Firestore.
  const reopenDoubt = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Update the doubt document to mark it as not resolved and clear the solution.
      await updateDoc(doubtRef, { resolved: false, solution: "" });
    } catch (error) {
      console.error("Error reopening doubt:", error);
    }
  };

  // Function to upvote an doubt in Firestore.
  const upvoteDoubt = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Increment the upvotes count for the doubt document using Firestore's increment operator.
      await updateDoc(doubtRef, { upvotes: increment(1) });
    } catch (error) {
      console.error("Error upvoting doubt:", error);
    }
  };

  // Function to downvote an doubt in Firestore.
  const downvoteDoubt = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Increment the downvotes count for the doubt document using Firestore's increment operator.
      await updateDoc(doubtRef, { downvotes: increment(1) });
    } catch (error) {
      console.error("Error downvoting doubt:", error);
    }
  };

  // Function to add a comment to an doubt in Firestore.
  const addComment = async (
    doubtId: string,
    commentText: string,
    parentId?: string
  ) => {
    if (!user) return;
    try {
      // Get reference to the 'comments' subcollection within the specific doubt document.
      const commentsRef = collection(
        db,
        "users",
        user.id,
        "nugget",
        doubtId,
        "comments"
      );
      // Add a new comment document to the 'comments' subcollection.
      await addDoc(commentsRef, {
        text: commentText,
        parentId: parentId || null, // Store parentId if it's a reply, otherwise null for top-level comments.
        createdAt: serverTimestamp(), // Use Firestore server timestamp for comment creation time.
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Function to edit an existing comment in Firestore.
  const editComment = async (
    doubtId: string,
    commentId: string,
    newText: string
  ) => {
    if (!user) return;
    try {
      // Get reference to the specific comment document within the 'comments' subcollection.
      const commentRef = doc(
        db,
        "users",
        user.id,
        "nugget",
        doubtId,
        "comments",
        commentId
      );
      // Update the text field of the comment document with the new text.
      await updateDoc(commentRef, { text: newText });
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  // Function to delete a comment from Firestore.
  const deleteComment = async (doubtId: string, commentId: string) => {
    if (!user) return;
    try {
      // Get reference to the specific comment document to be deleted.
      const commentRef = doc(
        db,
        "users",
        user.id,
        "nugget",
        doubtId,
        "comments",
        commentId
      );
      // Delete the comment document from Firestore.
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Function to edit an doubt's title and description in Firestore.
  const editDoubt = async (id: string, title: string, description: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Update the title and description fields of the doubt document.
      await updateDoc(doubtRef, { title, description });
    } catch (error) {
      console.error("Error editing doubt:", error);
    }
  };

  // Function to edit the solution of a resolved doubt in Firestore.
  const editSolution = async (id: string, newSolution: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Update the solution field of the doubt document with the new solution.
      await updateDoc(doubtRef, { solution: newSolution });
    } catch (error) {
      console.error("Error editing solution:", error);
    }
  };

  // Function to delete an doubt from Firestore.
  const deleteDoubt = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific doubt document to be deleted.
      const doubtRef = doc(db, "users", user.id, "nugget", id);
      // Delete the doubt document from Firestore.
      await deleteDoc(doubtRef);
    } catch (error) {
      console.error("Error deleting doubt:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header section of the Doubt Tracker, containing the title and 'New Doubt' button. */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-orange-600">Doubts Tracker</h1>
        {/* Dialog component for creating a new doubt, triggered by the 'New Doubt' button. */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Doubt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Doubt</DialogTitle>
              <DialogDescription>
                Add a new doubt to track and resolve.
              </DialogDescription>
            </DialogHeader>
            {/* NewDoubtForm component for handling the input and submission of new doubts. */}
            <NewDoubtForm onSubmit={addDoubt} />
          </DialogContent>
        </Dialog>
      </div>
      {/* Tabs component to separate 'Open Doubts' and 'Resolved Doubts'. */}
      <Tabs defaultValue="open" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Doubts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Doubts</TabsTrigger>
        </TabsList>
        {/* Content for the 'Open Doubts' tab. */}
        <TabsContent value="open">
          {/* DoubtList component to display the list of open doubts. */}
          <DoubtList
            doubts={doubts.filter((d) => !d.resolved)} // Filter doubts to show only open ones.
            onResolve={resolveDoubt}
            onReopen={reopenDoubt}
            onUpvote={upvoteDoubt}
            onDownvote={downvoteDoubt}
            onAddComment={addComment}
            onEditDoubt={editDoubt}
            onEditComment={editComment}
            onDeleteComment={deleteComment}
            onEditSolution={editSolution}
            onDeleteDoubt={deleteDoubt}
          />
        </TabsContent>
        {/* Content for the 'Resolved Doubts' tab. */}
        <TabsContent value="resolved">
          {/* DoubtList component to display the list of resolved doubts. */}
          <DoubtList
            doubts={doubts.filter((d) => d.resolved)} // Filter doubts to show only resolved ones.
            onResolve={resolveDoubt}
            onReopen={reopenDoubt}
            onUpvote={upvoteDoubt}
            onDownvote={downvoteDoubt}
            onAddComment={addComment}
            onEditDoubt={editDoubt}
            onEditComment={editComment}
            onDeleteComment={deleteComment}
            onEditSolution={editSolution}
            onDeleteDoubt={deleteDoubt}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
