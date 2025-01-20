import React from 'react';
import DoubtCard from './DoubtCard';

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

interface DoubtListProps {
  doubts: Doubt[];
  onResolve: (id: number, solution: string) => void;
  onReopen: (id: number) => void;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onAddComment: (doubtId: number, commentText: string, parentCommentId?: number) => void;
  onEditDoubt: (id: number, title: string, description: string) => void;
  onEditComment: (doubtId: number, commentId: number, newText: string) => void;
  onDeleteComment: (doubtId: number, commentId: number) => void;
  onEditSolution: (id: number, newSolution: string) => void;
  onDeleteDoubt: (id: number) => void;
}

export default function DoubtList({ doubts, onResolve, onReopen, onUpvote, onDownvote, onAddComment, onEditDoubt, onEditComment,onDeleteComment, onEditSolution, onDeleteDoubt }: DoubtListProps) {
  const sortedDoubts = [...doubts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes) || b.id - a.id);

  return (
    <div className="space-y-4">
      {sortedDoubts.map(doubt => (
        <DoubtCard 
          key={doubt.id} 
          doubt={doubt} 
          onResolve={onResolve}
          onReopen={onReopen}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
          onAddComment={onAddComment}
          onEditDoubt={onEditDoubt}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onEditSolution={onEditSolution}
          onDeleteDoubt={onDeleteDoubt}
        />
      ))}
    </div>
  );
}

