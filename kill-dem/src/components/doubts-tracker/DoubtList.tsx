import React from "react";
import DoubtCard from "./DoubtCard";

// Define the Comment interface to structure comment data.
interface Comment {
  id: string;
  text: string;
  replies: Comment[];
}

// Define the Doubt interface to structure doubt data, including comments.
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

// Define the props for the DoubtList component.
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

// DoubtList component: Displays a list of DoubtCards.
export default function DoubtList({
  doubts, // Array of doubt objects to be displayed.
  onResolve, // Function to handle resolving an doubt.
  onReopen, // Function to handle reopening a resolved doubt.
  onUpvote, // Function to handle upvoting an doubt.
  onDownvote, // Function to handle downvoting an doubt.
  onAddComment, // Function to handle adding a comment to an doubt.
  onEditDoubt, // Function to handle editing an doubt's details.
  onEditComment, // Function to handle editing a comment.
  onDeleteComment, // Function to handle deleting a comment.
  onEditSolution, // Function to handle editing the solution of an doubt.
  onDeleteDoubt, // Function to handle deleting an doubt.
}: DoubtListProps) {
  // Sort doubts based on vote difference (upvotes - downvotes) in descending order,
  // and then by ID in descending order as a secondary sort.
  const sortedDoubts = [...doubts].sort(
    (a, b) =>
      b.upvotes - b.downvotes - (a.upvotes - a.downvotes) ||
      Number(b.id) - Number(a.id)
  );

  return (
    <div className="space-y-4">
      {/* Map through the sorted doubts and render an DoubtCard for each doubt. */}
      {sortedDoubts.map((doubt) => (
        <DoubtCard
          key={doubt.id} // Unique key for each DoubtCard, using doubt ID.
          doubt={doubt} // Pass the current doubt object as props to DoubtCard.
          onResolve={onResolve} // Pass the resolve handler.
          onReopen={onReopen} // Pass the reopen handler.
          onUpvote={onUpvote} // Pass the upvote handler.
          onDownvote={onDownvote} // Pass the downvote handler.
          onAddComment={onAddComment} // Pass the add comment handler.
          onEditDoubt={onEditDoubt} // Pass the edit doubt handler.
          onEditComment={onEditComment} // Pass the edit comment handler.
          onDeleteComment={onDeleteComment} // Pass the delete comment handler.
          onEditSolution={onEditSolution} // Pass the edit solution handler.
          onDeleteDoubt={onDeleteDoubt} // Pass the delete doubt handler.
        />
      ))}
    </div>
  );
}