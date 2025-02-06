import React from 'react';
import IdeaCard from './IdeaCard';

interface Comment {
  id: string;
  text: string;
  replies: Comment[];
}

interface Idea {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  resolved: boolean;
  solution?: string;
  comments: Comment[];
}

interface IdeaListProps {
  ideas: Idea[];
  onResolve: (id: string, solution: string) => void;
  onReopen: (id: string) => void;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onAddComment: (ideaId: string, commentText: string, parentCommentId?: string) => void;
  onEditIdea: (id: string, title: string, description: string) => void;
  onEditComment: (ideaId: string, commentId: string, newText: string) => void;
  onDeleteComment: (ideaId: string, commentId: string) => void;
  onEditSolution: (id: string, newSolution: string) => void;
  onDeleteIdea: (id: string) => void;
}

export default function IdeaList({
  ideas,
  onResolve,
  onReopen,
  onUpvote,
  onDownvote,
  onAddComment,
  onEditIdea,
  onEditComment,
  onDeleteComment,
  onEditSolution,
  onDeleteIdea
}: IdeaListProps) {
  const sortedIdeas = [...ideas].sort(
    (a, b) =>
      (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes) || Number(b.id) - Number(a.id)
  );

  return (
    <div className="space-y-4">
      {sortedIdeas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onResolve={onResolve}
          onReopen={onReopen}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
          onAddComment={onAddComment}
          onEditIdea={onEditIdea}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onEditSolution={onEditSolution}
          onDeleteIdea={onDeleteIdea}
        />
      ))}
    </div>
  );
}
