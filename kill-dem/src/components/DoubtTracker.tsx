"use client";

import React, { useState, useEffect } from 'react';
import DoubtList from '@/components/doubts-tracker/DoubtList';
import NewDoubtForm from '@/components/doubts-tracker/NewDoubtForm';
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

interface Comment {
  id: string;
  text: string;
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
  const { user } = useUser();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  
  // Firestore: Listen to doubts (posts) for the current user.
  useEffect(() => {
    if (!user) return;
    const postsRef = collection(db, "users", user.id, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedDoubts: Doubt[] = [];
      snapshot.forEach(docSnap => {
        loadedDoubts.push({
          id: docSnap.id,
          title: docSnap.data().title,
          description: docSnap.data().description,
          upvotes: docSnap.data().upvotes,
          downvotes: docSnap.data().downvotes,
          resolved: docSnap.data().resolved,
          solution: docSnap.data().solution,
          // Comments will be loaded in the DoubtCard (default empty array here)
          comments: [],
        });
      });
      setDoubts(loadedDoubts);
    });
    return () => unsubscribe();
  }, [user]);

  // Firestore CRUD functions

  const addDoubt = async (title: string, description: string) => {
    if (!user) return;
    try {
      const postsRef = collection(db, "users", user.id, "posts");
      await addDoc(postsRef, {
        title,
        description,
        upvotes: 0,
        downvotes: 0,
        resolved: false,
        solution: "",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating doubt:", error);
    }
  };

  const resolveDoubt = async (id: string, solution: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await updateDoc(doubtRef, { resolved: true, solution });
    } catch (error) {
      console.error("Error resolving doubt:", error);
    }
  };

  const reopenDoubt = async (id: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await updateDoc(doubtRef, { resolved: false, solution: "" });
    } catch (error) {
      console.error("Error reopening doubt:", error);
    }
  };

  const upvoteDoubt = async (id: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await updateDoc(doubtRef, { upvotes: increment(1) });
    } catch (error) {
      console.error("Error upvoting doubt:", error);
    }
  };

  const downvoteDoubt = async (id: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await updateDoc(doubtRef, { downvotes: increment(1) });
    } catch (error) {
      console.error("Error downvoting doubt:", error);
    }
  };

  // Comment operations support an optional parentId.
  const addComment = async (doubtId: string, commentText: string, parentId?: string) => {
    if (!user) return;
    try {
      if (parentId) {
        const parentCommentRef = doc(db, "users", user.id, "posts", doubtId, "comments", parentId);
        const repliesRef = collection(parentCommentRef, "comments");
        await addDoc(repliesRef, {
          text: commentText,
          createdAt: serverTimestamp(),
        });
      } else {
        const commentsRef = collection(db, "users", user.id, "posts", doubtId, "comments");
        await addDoc(commentsRef, {
          text: commentText,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const editComment = async (
    doubtId: string,
    commentId: string,
    newText: string,
    parentId?: string
  ) => {
    if (!user) return;
    try {
      let commentRef;
      if (parentId) {
        commentRef = doc(db, "users", user.id, "posts", doubtId, "comments", parentId, "comments", commentId);
      } else {
        commentRef = doc(db, "users", user.id, "posts", doubtId, "comments", commentId);
      }
      await updateDoc(commentRef, { text: newText });
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const deleteComment = async (
    doubtId: string,
    commentId: string,
    parentId?: string
  ) => {
    if (!user) return;
    try {
      let commentRef;
      if (parentId) {
        commentRef = doc(db, "users", user.id, "posts", doubtId, "comments", parentId, "comments", commentId);
      } else {
        commentRef = doc(db, "users", user.id, "posts", doubtId, "comments", commentId);
      }
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const editDoubt = async (id: string, title: string, description: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await updateDoc(doubtRef, { title, description });
    } catch (error) {
      console.error("Error editing doubt:", error);
    }
  };

  const editSolution = async (id: string, newSolution: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await updateDoc(doubtRef, { solution: newSolution });
    } catch (error) {
      console.error("Error editing solution:", error);
    }
  };

  const deleteDoubt = async (id: string) => {
    if (!user) return;
    try {
      const doubtRef = doc(db, "users", user.id, "posts", id);
      await deleteDoc(doubtRef);
    } catch (error) {
      console.error("Error deleting doubt:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-orange-600">Doubts Tracker</h1>
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
            <NewDoubtForm onSubmit={addDoubt} />
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="open" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Doubts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Doubts</TabsTrigger>
        </TabsList>
        <TabsContent value="open">
          <DoubtList 
            doubts={doubts.filter(d => !d.resolved)} 
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
        <TabsContent value="resolved">
          <DoubtList 
            doubts={doubts.filter(d => d.resolved)} 
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
