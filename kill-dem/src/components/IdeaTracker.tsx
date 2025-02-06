"use client";
import React, { useState, useEffect } from 'react';
import IdeaList from '@/components/curiosity-space/IdeaList';
import NewIdeaForm from '@/components/curiosity-space/NewIdeaForm';
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
import { Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
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
} from 'firebase/firestore';

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
  // Comments will be loaded separately from the "comments" subcollection.
  comments: Comment[];
}

export default function IdeaTracker() {
  const { user } = useUser();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  
  useEffect(() => {
    if (!user) return;
    const nuggetRef = collection(db, "users", user.id, "nugget");
    const q = query(nuggetRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedIdeas: Idea[] = [];
      snapshot.forEach(docSnap => {
        loadedIdeas.push({
          id: docSnap.id,
          title: docSnap.data().title,
          description: docSnap.data().description,
          upvotes: docSnap.data().upvotes,
          downvotes: docSnap.data().downvotes,
          resolved: docSnap.data().resolved,
          solution: docSnap.data().solution,
          comments: [],
        });
      });
      setIdeas(loadedIdeas);
    });
    return () => unsubscribe();
  }, [user]);

  const addIdea = async (title: string, description: string) => {
    if (!user) return;
    try {
      const nuggetRef = collection(db, "users", user.id, "nugget");
      await addDoc(nuggetRef, {
        title,
        description,
        upvotes: 0,
        downvotes: 0,
        resolved: false,
        solution: "",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating idea:", error);
    }
  };

  const resolveIdea = async (id: string, solution: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await updateDoc(ideaRef, { resolved: true, solution });
    } catch (error) {
      console.error("Error resolving idea:", error);
    }
  };

  const reopenIdea = async (id: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await updateDoc(ideaRef, { resolved: false, solution: "" });
    } catch (error) {
      console.error("Error reopening idea:", error);
    }
  };

  const upvoteIdea = async (id: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await updateDoc(ideaRef, { upvotes: increment(1) });
    } catch (error) {
      console.error("Error upvoting idea:", error);
    }
  };

  const downvoteIdea = async (id: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await updateDoc(ideaRef, { downvotes: increment(1) });
    } catch (error) {
      console.error("Error downvoting idea:", error);
    }
  };

  // Flattened comment operations: All comments are stored in the same subcollection.
  const addComment = async (ideaId: string, commentText: string, parentId?: string) => {
    if (!user) return;
    try {
      const commentsRef = collection(db, "users", user.id, "nugget", ideaId, "comments");
      await addDoc(commentsRef, {
        text: commentText,
        parentId: parentId || null,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const editComment = async (ideaId: string, commentId: string, newText: string) => {
    if (!user) return;
    try {
      const commentRef = doc(db, "users", user.id, "nugget", ideaId, "comments", commentId);
      await updateDoc(commentRef, { text: newText });
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const deleteComment = async (ideaId: string, commentId: string) => {
    if (!user) return;
    try {
      const commentRef = doc(db, "users", user.id, "nugget", ideaId, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const editIdea = async (id: string, title: string, description: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await updateDoc(ideaRef, { title, description });
    } catch (error) {
      console.error("Error editing idea:", error);
    }
  };

  const editSolution = async (id: string, newSolution: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await updateDoc(ideaRef, { solution: newSolution });
    } catch (error) {
      console.error("Error editing solution:", error);
    }
  };

  const deleteIdea = async (id: string) => {
    if (!user) return;
    try {
      const ideaRef = doc(db, "users", user.id, "nugget", id);
      await deleteDoc(ideaRef);
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-orange-600">Ideas Tracker</h1>
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
            <NewIdeaForm onSubmit={addIdea} />
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="open" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Ideas</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Ideas</TabsTrigger>
        </TabsList>
        <TabsContent value="open">
          <IdeaList
            ideas={ideas.filter(d => !d.resolved)}
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
        <TabsContent value="resolved">
          <IdeaList
            ideas={ideas.filter(d => d.resolved)}
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
