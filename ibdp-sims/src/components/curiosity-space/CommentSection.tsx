import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Edit,
  Save,
  Reply,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";

// Define the Comment interface to structure comment data
export interface Comment {
  id: string;
  text: string;
  parentId?: string | null;
  replies: Comment[];
}

// Define the props for the CommentSection component
interface CommentSectionProps {
  ideaId: string; // ID of the idea to which the comments belong
  comments: Comment[]; // Array of comments to display
  onAddComment: (text: string, parentId?: string) => void; // Function to handle adding a new comment
  onEditComment: (commentId: string, newText: string) => void; // Function to handle editing an existing comment
  onDeleteComment: (commentId: string) => void; // Function to handle deleting a comment
}

// Define the props for the CommentItem component, which represents a single comment
interface CommentItemProps {
  ideaId: string; // ID of the idea, passed down for comment actions
  comment: Comment; // The comment object to render
  onAddComment: (text: string, parentId: string) => void; // Function to add a reply to a comment
  onEditComment: (commentId: string, newText: string) => void; // Function to edit a comment (passed down)
  onDeleteComment: (commentId: string) => void; // Function to delete a comment (passed down)
}

/**
 * CommentItem Component: Represents a single comment and its replies.
 * Handles rendering comment text, edit/delete options, and reply functionality.
 */
const CommentItem: React.FC<CommentItemProps> = ({
  ideaId,
  comment,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  // User authentication state from Clerk
  const { user } = useUser();
  // State to manage whether the comment is in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State to hold the text being edited in the comment
  const [editedText, setEditedText] = useState(comment.text);
  // State to manage whether the reply input is shown for this comment
  const [isReplying, setIsReplying] = useState(false);
  // State to hold the text for a new reply
  const [replyText, setReplyText] = useState("");
  // useRef to manage focus outside of the reply input to close it
  const replyRef = useRef<HTMLDivElement>(null);
  // useRef to manage focus outside of the edit input to exit edit mode
  const editRef = useRef<HTMLDivElement>(null);
  // State to track if there are unsaved changes in the edit input
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Handler for saving the edited comment text.
   * Calls the onEditComment prop function to update the comment and exits edit mode.
   */
  const handleSaveEdit = () => {
    onEditComment(comment.id, editedText);
    setIsEditing(false);
  };

  /**
   * Handler for cancelling comment editing.
   * Resets the edited text to the original comment text and exits edit mode.
   */
  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  /**
   * Handler for adding a reply to the comment.
   * Calls the onAddComment prop function with the reply text and the current comment's ID as the parent.
   * Resets the reply input and closes the reply input area.
   */
  const handleAddReply = () => {
    if (replyText) {
      onAddComment(replyText, comment.id);
      setIsReplying(false);
      setReplyText("");
    }
  };

  /**
   * Handler for input changes in the edit comment input.
   * Updates the editedText state and checks if changes have been made compared to the original text.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleEditTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(e.target.value);
    setHasChanges(e.target.value !== comment.text);
  };

  /**
   * useEffect hook to handle closing the reply input when clicking outside.
   * Adds a mousedown event listener to the document to detect clicks outside the reply input area.
   */
  useEffect(() => {
    const handleClickOutsideReply = (event: MouseEvent) => {
      if (
        replyRef.current &&
        !replyRef.current.contains(event.target as Node)
      ) {
        if (!replyText) setIsReplying(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideReply);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideReply);
  }, [replyText]); // Dependency array includes replyText to re-run effect when reply text changes.

  /**
   * useEffect hook to handle exiting edit mode when clicking outside the edit input area, if no changes are made.
   * Adds a mousedown event listener to the document to detect clicks outside the edit input area.
   */
  useEffect(() => {
    const handleClickOutsideEdit = (event: MouseEvent) => {
      if (
        !hasChanges &&
        editRef.current &&
        !editRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideEdit);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideEdit);
  }, [hasChanges]); // Dependency array includes hasChanges to re-run effect when changes status is updated.

  return (
    <div className="mt-2 pl-4 border-l-2 border-gray-200 group">
      {/* Conditional rendering: Edit mode input or comment text display */}
      {isEditing ? (
        <div ref={editRef} className="flex items-center space-x-2">
          <Input
            value={editedText}
            onChange={handleEditTextChange}
            className="flex-grow"
          />
          <Button size="sm" onClick={handleSaveEdit} title="Save">
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelEdit}
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm whitespace-pre-wrap break-words max-w-[90%]">
            {comment.text}
          </p>
          {/* Conditional rendering: Action buttons (Reply, Edit, Delete) - Shown on group hover */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reply button to toggle reply input */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsReplying(true)}
              title="Reply"
            >
              <Reply className="h-4 w-4" />
            </Button>
            {/* Dropdown menu for Edit and Delete actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" title="More options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {/* Conditional rendering: Reply input area */}
      {isReplying && (
        <div ref={replyRef} className="mt-2 flex items-center space-x-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-grow"
          />
          <Button size="sm" onClick={handleAddReply}>
            Reply
          </Button>
        </div>
      )}
      {/* Recursive rendering of replies */}
      {comment.replies &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            ideaId={ideaId}
            comment={reply}
            onAddComment={onAddComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
          />
        ))}
    </div>
  );
};

/**
 * CommentSection Component: Renders the comment section, including the list of comments and the new comment input form.
 * Manages the overall display of comments and handles adding new top-level comments.
 */
export default function CommentSection({
  ideaId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: CommentSectionProps) {
  // State to hold the text for a new top-level comment
  const [newComment, setNewComment] = useState("");
  // State to manage the expanded/collapsed state of the comment section
  const [expanded, setExpanded] = useState(false);

  /**
   * Handler for submitting a new top-level comment.
   * Prevents default form submission and calls the onAddComment prop function to add the new comment.
   * Resets the new comment input area after submission.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  /**
   * Helper function to recursively count all replies for a given comment and its nested replies.
   * @param {Comment} comment - The comment object to start counting replies from.
   * @returns {number} - The total count of replies for the comment and all its nested replies.
   */
  const countReplies = (comment: Comment): number => {
    return comment.replies.reduce(
      (acc, reply) => acc + 1 + countReplies(reply),
      0
    );
  };

  // Calculate total comment count (including nested replies) for display purposes
  const totalCommentCount = comments.reduce(
    (acc, c) => acc + 1 + countReplies(c),
    0
  );

  return (
    <div className="w-full">
      {/* Button to toggle the comment section's expanded state */}
      <Button
        variant="ghost"
        className="p-0 h-auto text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {expanded ? "Hide Comments" : `${totalCommentCount} Comments`}
      </Button>
      {/* Conditional rendering: Comment list and new comment form - Shown when expanded is true */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Map through comments and render each as a CommentItem */}
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              ideaId={ideaId}
              comment={comment}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
          {/* Form for adding a new top-level comment */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              className="flex-grow"
            />
            <Button type="submit">Comment</Button>
          </form>
        </div>
      )}
    </div>
  );
}

// Helper function to count nested replies for a comment
function countReplies(comment: Comment): number {
  return comment.replies.reduce(
    (acc, reply) => acc + 1 + countReplies(reply),
    0
  );
}
