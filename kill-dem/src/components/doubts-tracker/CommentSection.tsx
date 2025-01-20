import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Edit, Save, Reply, MoreVertical, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: number;
  text: string;
  replies: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string, parentId?: number) => void;
  onEditComment: (commentId: number, newText: string) => void;
  onDeleteComment: (commentId: number) => void;
}

const CommentItem: React.FC<{
  comment: Comment;
  onAddComment: (text: string, parentId: number) => void;
  onEditComment: (commentId: number, newText: string) => void;
  onDeleteComment: (commentId: number) => void;
}> = ({ comment, onAddComment, onEditComment, onDeleteComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (replyRef.current && !replyRef.current.contains(event.target as Node)) {
        if (!replyText) {
          setIsReplying(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyText]);

  const handleSaveEdit = () => {
    onEditComment(comment.id, editedText);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!hasChanges && editRef.current && !editRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hasChanges]);

  return (
    <div className="mt-2 pl-4 border-l-2 border-gray-200">
      {isEditing ? (
        <div ref={editRef} className="flex items-center space-x-2">
          <Input
            value={editedText}
            onChange={handleEditTextChange}
            className="flex-grow"
          />
          <Button size="sm" onClick={handleSaveEdit}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <p className="text-sm whitespace-pre-wrap break-words max-w-[90%]">{comment.text}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsReplying(true)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
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
      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default function CommentSection({ comments, onAddComment, onEditComment, onDeleteComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="w-full">
      <Button 
        variant="ghost" 
        className="p-0 h-auto text-gray-500 hover:text-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {expanded ? 'Hide Comments' : `${comments.length} Comments`}
      </Button>
      {expanded && (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
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

