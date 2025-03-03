"use client";
import React, { useState, useEffect } from "react";
import IdeaList from "@/components/curiosity-space/IdeaList";
import NewIdeaForm from "@/components/curiosity-space/NewIdeaForm";
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

export interface Idea {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  resolved: boolean;
  solution?: string;
  comments: Comment[];
}

export default function IdeaTracker() {
  // User authentication state
  const { user } = useUser();
  // State to hold the list of ideas.
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // useEffect hook to fetch ideas from Firestore when the component mounts or when the user changes.
  useEffect(() => {
    if (!user) return;
    // Reference to the 'nugget' collection within the user's document in Firestore.
    const nuggetRef = collection(db, "users", user.id, "nugget");
    // Create a query to fetch ideas, ordered by creation time in descending order.
    const q = query(nuggetRef, orderBy("createdAt", "desc"));
    // Subscribe to real-time updates from Firestore using onSnapshot.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedIdeas: Idea[] = [];
      // Iterate over each document in the snapshot.
      snapshot.forEach((docSnap) => {
        // Extract data from each document and shape it into an Idea object.
        loadedIdeas.push({
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
      // Update the ideas state with the fetched ideas.
      setIdeas(loadedIdeas);
    });
    // Return the unsubscribe function to detach the listener when the component unmounts.
    return () => unsubscribe();
  }, [user]); // Dependency array ensures this effect runs when 'user' object changes.

  // Function to add a new idea to Firestore.
  const addIdea = async (title: string, description: string) => {
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
      console.error("Error creating idea:", error);
    }
  };

  // Function to resolve an idea in Firestore.
  const resolveIdea = async (id: string, solution: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document within the user's 'nugget' collection.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Update the idea document to mark it as resolved and add the provided solution.
      await updateDoc(ideaRef, { resolved: true, solution });
    } catch (error) {
      console.error("Error resolving idea:", error);
    }
  };

  // Function to reopen a resolved idea in Firestore.
  const reopenIdea = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Update the idea document to mark it as not resolved and clear the solution.
      await updateDoc(ideaRef, { resolved: false, solution: "" });
    } catch (error) {
      console.error("Error reopening idea:", error);
    }
  };

  // Function to upvote an idea in Firestore.
  const upvoteIdea = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Increment the upvotes count for the idea document using Firestore's increment operator.
      await updateDoc(ideaRef, { upvotes: increment(1) });
    } catch (error) {
      console.error("Error upvoting idea:", error);
    }
  };

  // Function to downvote an idea in Firestore.
  const downvoteIdea = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Increment the downvotes count for the idea document using Firestore's increment operator.
      await updateDoc(ideaRef, { downvotes: increment(1) });
    } catch (error) {
      console.error("Error downvoting idea:", error);
    }
  };

  // Function to add a comment to an idea in Firestore.
  const addComment = async (
    ideaId: string,
    commentText: string,
    parentId?: string
  ) => {
    if (!user) return;
    try {
      // Get reference to the 'comments' subcollection within the specific idea document.
      const commentsRef = collection(
        db,
        "users",
        user.id,
        "nugget",
        ideaId,
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
    ideaId: string,
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
        ideaId,
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
  const deleteComment = async (ideaId: string, commentId: string) => {
    if (!user) return;
    try {
      // Get reference to the specific comment document to be deleted.
      const commentRef = doc(
        db,
        "users",
        user.id,
        "nugget",
        ideaId,
        "comments",
        commentId
      );
      // Delete the comment document from Firestore.
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Function to edit an idea's title and description in Firestore.
  const editIdea = async (id: string, title: string, description: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Update the title and description fields of the idea document.
      await updateDoc(ideaRef, { title, description });
    } catch (error) {
      console.error("Error editing idea:", error);
    }
  };

  // Function to edit the solution of a resolved idea in Firestore.
  const editSolution = async (id: string, newSolution: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Update the solution field of the idea document with the new solution.
      await updateDoc(ideaRef, { solution: newSolution });
    } catch (error) {
      console.error("Error editing solution:", error);
    }
  };

  // Function to delete an idea from Firestore.
  const deleteIdea = async (id: string) => {
    if (!user) return;
    try {
      // Get reference to the specific idea document to be deleted.
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      // Delete the idea document from Firestore.
      await deleteDoc(ideaRef);
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header section of the Idea Tracker, containing the title and 'New Idea' button. */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-orange-600">Ideas Tracker</h1>
        {/* Dialog component for creating a new idea, triggered by the 'New Idea' button. */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Idea</DialogTitle>
              <DialogDescription>
                Add a new idea to track and resolve.
              </DialogDescription>
            </DialogHeader>
            {/* NewIdeaForm component for handling the input and submission of new ideas. */}
            <NewIdeaForm onSubmit={addIdea} />
          </DialogContent>
        </Dialog>
      </div>
      {/* Tabs component to separate 'Open Ideas' and 'Resolved Ideas'. */}
      <Tabs defaultValue="open" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Ideas</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Ideas</TabsTrigger>
        </TabsList>
        {/* Content for the 'Open Ideas' tab. */}
        <TabsContent value="open">
          {/* IdeaList component to display the list of open ideas. */}
          <IdeaList
            ideas={ideas.filter((d) => !d.resolved)} // Filter ideas to show only open ones.
            onResolve={resolveIdea}
            onReopen={reopenIdea}
            onUpvote={upvoteIdea}
            onDownvote={downvoteIdea}
            onAddComment={addComment}
            onEditIdea={editIdea}
            onEditComment={editComment}
            onDeleteComment={deleteComment}
            onEditSolution={editSolution}
            onDeleteIdea={deleteIdea}
          />
        </TabsContent>
        {/* Content for the 'Resolved Ideas' tab. */}
        <TabsContent value="resolved">
          {/* IdeaList component to display the list of resolved ideas. */}
          <IdeaList
            ideas={ideas.filter((d) => d.resolved)} // Filter ideas to show only resolved ones.
            onResolve={resolveIdea}
            onReopen={reopenIdea}
            onUpvote={upvoteIdea}
            onDownvote={downvoteIdea}
            onAddComment={addComment}
            onEditIdea={editIdea}
            onEditComment={editComment}
            onDeleteComment={deleteComment}
            onEditSolution={editSolution}
            onDeleteIdea={deleteIdea}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
