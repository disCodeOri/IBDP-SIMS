import React, { useState } from 'react';
import DoubtList from '@/components/doubts-tracker/DoubtList';
import NewDoubtForm from '@/components/doubts-tracker/NewDoubtForm';
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from 'lucide-react'

interface Comment {
  id: number;
  text: string;
  replies: Comment[];
}

interface Doubt {
  id: number;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  resolved: boolean;
  solution?: string;
  comments: Comment[];
}

const initialDoubts: Doubt[] = [
  {
    id: 1,
    title: "How does photosynthesis work?",
    description: "I'm having trouble understanding the light-dependent reactions...",
    upvotes: 5,
    downvotes: 1,
    resolved: false,
    comments: [
      { id: 1, text: "I found a great Khan Academy video on this.", replies: [
        { id: 2, text: "Could you share the link?", replies: [] }
      ] },
      { id: 3, text: "Remember the role of chlorophyll!", replies: [] },
    ],
  },
  {
    id: 2,
    title: "What is the best way to learn a new programming language?",
    description: "I'm trying to learn Python, but I'm feeling overwhelmed...",
    upvotes: 12,
    downvotes: 2,
    resolved: true,
    solution: "Focus on building small projects and practice consistently.",
    comments: [],
  },
];

export default function DoubtTracker() {
  const [doubts, setDoubts] = useState<Doubt[]>(initialDoubts);

  const addDoubt = (title: string, description: string) => {
    const newDoubt: Doubt = {
      id: doubts.length + 1,
      title,
      description,
      upvotes: 0,
      downvotes: 0,
      resolved: false,
      comments: [],
    };
    setDoubts([...doubts, newDoubt]);
  };

  const resolveDoubt = (id: number, solution: string) => {
    setDoubts(doubts.map(doubt => 
      doubt.id === id ? { ...doubt, resolved: true, solution } : doubt
    ));
  };

  const reopenDoubt = (id: number) => {
    setDoubts(doubts.map(doubt => 
      doubt.id === id ? { ...doubt, resolved: false, solution: undefined } : doubt
    ));
  };

  const upvoteDoubt = (id: number) => {
    setDoubts(doubts.map(doubt => 
      doubt.id === id ? { ...doubt, upvotes: doubt.upvotes + 1 } : doubt
    ));
  };

  const downvoteDoubt = (id: number) => {
    setDoubts(doubts.map(doubt => 
      doubt.id === id ? { ...doubt, downvotes: doubt.downvotes + 1 } : doubt
    ));
  };

  const addComment = (doubtId: number, commentText: string, parentCommentId?: number) => {
    setDoubts(doubts.map(doubt => {
      if (doubt.id === doubtId) {
        const newComment: Comment = { id: Date.now(), text: commentText, replies: [] };
        if (parentCommentId) {
          return {
            ...doubt,
            comments: addReply(doubt.comments, parentCommentId, newComment)
          };
        } else {
          return {
            ...doubt,
            comments: [...doubt.comments, newComment]
          };
        }
      }
      return doubt;
    }));
  };

  const addReply = (comments: Comment[], parentId: number, newReply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      } else if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReply(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  };

  const editDoubt = (id: number, title: string, description: string) => {
    setDoubts(doubts.map(doubt => 
      doubt.id === id ? { ...doubt, title, description } : doubt
    ));
  };

  const editComment = (doubtId: number, commentId: number, newText: string) => {
    setDoubts(doubts.map(doubt => {
      if (doubt.id === doubtId) {
        return {
          ...doubt,
          comments: updateCommentText(doubt.comments, commentId, newText)
        };
      }
      return doubt;
    }));
  };

  const updateCommentText = (comments: Comment[], commentId: number, newText: string): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, text: newText };
      } else if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentText(comment.replies, commentId, newText)
        };
      }
      return comment;
    });
  };

  const deleteComment = (doubtId: number, commentId: number) => {
    setDoubts(doubts.map(doubt => {
      if (doubt.id === doubtId) {
        return {
          ...doubt,
          comments: removeComment(doubt.comments, commentId)
        };
      }
      return doubt;
    }));
  };
  
  const removeComment = (comments: Comment[], commentId: number): Comment[] => {
    return comments.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      comment.replies = removeComment(comment.replies, commentId);
      return true;
    });
  };
  
  const editSolution = (id: number, newSolution: string) => {
    setDoubts(doubts.map(doubt => 
      doubt.id === id ? { ...doubt, solution: newSolution } : doubt
    ));
  };

  const deleteDoubt = (id: number) => {
    setDoubts(doubts.filter(doubt => doubt.id !== id));
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

