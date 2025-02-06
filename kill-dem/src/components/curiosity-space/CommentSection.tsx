import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Edit, Save, Reply, Trash2, MoreVertical, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from '@clerk/nextjs';

export interface Comment {
  id: string;
  text: string;
  parentId?: string | null;
  replies: Comment[];
}

interface CommentSectionProps {
  ideaId: string;
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onEditComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
}

interface CommentItemProps {
  ideaId: string;
  comment: Comment;
  onAddComment: (text: string, parentId: string) => void;
  onEditComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  ideaId,
  comment,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Handler for saving the edit
  const handleSaveEdit = () => {
    onEditComment(comment.id, editedText);
    setIsEditing(false);
  };

  // Handler for cancelling editing
  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  const handleAddReply = () => {
    if (replyText) {
      onAddComment(replyText, comment.id);
      setIsReplying(false);
      setReplyText('');
    }
  };

  const handleEditTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(e.target.value);
    setHasChanges(e.target.value !== comment.text);
  };

  // Hide reply box when clicking outside
  useEffect(() => {
    const handleClickOutsideReply = (event: MouseEvent) => {
      if (replyRef.current && !replyRef.current.contains(event.target as Node)) {
        if (!replyText) setIsReplying(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideReply);
    return () => document.removeEventListener('mousedown', handleClickOutsideReply);
  }, [replyText]);

  // Hide edit mode when clicking outside (if no unsaved changes)
  useEffect(() => {
    const handleClickOutsideEdit = (event: MouseEvent) => {
      if (!hasChanges && editRef.current && !editRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideEdit);
    return () => document.removeEventListener('mousedown', handleClickOutsideEdit);
  }, [hasChanges]);

  return (
    <div className="mt-2 pl-4 border-l-2 border-gray-200 group">
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
          <Button size="sm" variant="ghost" onClick={handleCancelEdit} title="Cancel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm whitespace-pre-wrap break-words max-w-[90%]">{comment.text}</p>
          {/* Buttons container: hidden by default and shown on hover */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reply button */}
            <Button size="sm" variant="ghost" onClick={() => setIsReplying(true)} title="Reply">
              <Reply className="h-4 w-4" />
            </Button>
            {/* Three dot menu for Edit and Delete */}
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
                <DropdownMenuItem className="text-red-600" onClick={() => onDeleteComment(comment.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {isReplying && (
        <div ref={replyRef} className="mt-2 flex items-center space-x-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-grow"
          />
          <Button size="sm" onClick={handleAddReply}>Reply</Button>
        </div>
      )}
      {/* Render nested replies recursively */}
      {comment.replies && comment.replies.map(reply => (
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

export default function CommentSection({ ideaId, comments, onAddComment, onEditComment, onDeleteComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  // Calculate total comment count (including nested replies)
  const totalCommentCount = comments.reduce((acc, c) => acc + 1 + countReplies(c), 0);

  return (
    <div className="w-full">
      <Button variant="ghost" className="p-0 h-auto text-gray-500 hover:text-gray-700" onClick={() => setExpanded(!expanded)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        {expanded ? 'Hide Comments' : `${totalCommentCount} Comments`}
      </Button>
      {expanded && (
        <div className="mt-4 space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              ideaId={ideaId}
              comment={comment}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
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
  return comment.replies.reduce((acc, reply) => acc + 1 + countReplies(reply), 0);
}
