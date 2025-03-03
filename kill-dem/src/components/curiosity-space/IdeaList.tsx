import React from "react";
import IdeaCard from "./IdeaCard";

// Define the Comment interface to structure comment data.
interface Comment {
  id: string;
  text: string;
  replies: Comment[];
}

// Define the Idea interface to structure idea data, including comments.
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

// Define the props for the IdeaList component.
interface IdeaListProps {
  ideas: Idea[];
  onResolve: (id: string, solution: string) => void;
  onReopen: (id: string) => void;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onAddComment: (
    ideaId: string,
    commentText: string,
    parentCommentId?: string
  ) => void;
  onEditIdea: (id: string, title: string, description: string) => void;
  onEditComment: (ideaId: string, commentId: string, newText: string) => void;
  onDeleteComment: (ideaId: string, commentId: string) => void;
  onEditSolution: (id: string, newSolution: string) => void;
  onDeleteIdea: (id: string) => void;
}

// IdeaList component: Displays a list of IdeaCards.
export default function IdeaList({
  ideas, // Array of idea objects to be displayed.
  onResolve, // Function to handle resolving an idea.
  onReopen, // Function to handle reopening a resolved idea.
  onUpvote, // Function to handle upvoting an idea.
  onDownvote, // Function to handle downvoting an idea.
  onAddComment, // Function to handle adding a comment to an idea.
  onEditIdea, // Function to handle editing an idea's details.
  onEditComment, // Function to handle editing a comment.
  onDeleteComment, // Function to handle deleting a comment.
  onEditSolution, // Function to handle editing the solution of an idea.
  onDeleteIdea, // Function to handle deleting an idea.
}: IdeaListProps) {
  // Sort ideas based on vote difference (upvotes - downvotes) in descending order,
  // and then by ID in descending order as a secondary sort.
  const sortedIdeas = [...ideas].sort(
    (a, b) =>
      b.upvotes - b.downvotes - (a.upvotes - a.downvotes) ||
      Number(b.id) - Number(a.id)
  );

  return (
    <div className="space-y-4">
      {/* Map through the sorted ideas and render an IdeaCard for each idea. */}
      {sortedIdeas.map((idea) => (
        <IdeaCard
          key={idea.id} // Unique key for each IdeaCard, using idea ID.
          idea={idea} // Pass the current idea object as props to IdeaCard.
          onResolve={onResolve} // Pass the resolve handler.
          onReopen={onReopen} // Pass the reopen handler.
          onUpvote={onUpvote} // Pass the upvote handler.
          onDownvote={onDownvote} // Pass the downvote handler.
          onAddComment={onAddComment} // Pass the add comment handler.
          onEditIdea={onEditIdea} // Pass the edit idea handler.
          onEditComment={onEditComment} // Pass the edit comment handler.
          onDeleteComment={onDeleteComment} // Pass the delete comment handler.
          onEditSolution={onEditSolution} // Pass the edit solution handler.
          onDeleteIdea={onDeleteIdea} // Pass the delete idea handler.
        />
      ))}
    </div>
  );
}