import React from "react";
import DoubtCard from "./DoubtCard";

interface Comment {
  id: string;
  text: string;
  replies: Comment[];
}

interface Doubt {
  id: string;
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
  onResolve: (id: string, solution: string) => void;
  onReopen: (id: string) => void;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onAddComment: (
    doubtId: string,
    commentText: string,
    parentCommentId?: string
  ) => void;
  onEditDoubt: (id: string, title: string, description: string) => void;
  onEditComment: (doubtId: string, commentId: string, newText: string) => void;
  onDeleteComment: (doubtId: string, commentId: string) => void;
  onEditSolution: (id: string, newSolution: string) => void;
  onDeleteDoubt: (id: string) => void;
}

export default function DoubtList({
  doubts,
  onResolve,
  onReopen,
  onUpvote,
  onDownvote,
  onAddComment,
  onEditDoubt,
  onEditComment,
  onDeleteComment,
  onEditSolution,
  onDeleteDoubt,
}: DoubtListProps) {
  const sortedDoubts = [...doubts].sort(
    (a, b) =>
      b.upvotes - b.downvotes - (a.upvotes - a.downvotes) ||
      Number(b.id) - Number(a.id)
  );

  return (
    <div className="space-y-4">
      {sortedDoubts.map((doubt) => (
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
