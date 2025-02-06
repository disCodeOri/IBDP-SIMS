import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Edit, Save, Reply, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Comment {
  id: string;
  text: string;
  replies: Comment[];
}

interface CommentSectionProps {
  doubtId: string;
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onEditComment: (commentId: string, newText: string, parentId?: string) => void;
  onDeleteComment: (commentId: string, parentId?: string) => void;
}

interface CommentItemProps {
  doubtId: string;
  comment: Comment;
  // parentId is the immediate parent's id (undefined for top-level comments)
  parentId?: string;
  onAddComment: (text: string, parentId: string) => void;
  onEditComment: (commentId: string, newText: string, parentId?: string) => void;
  onDeleteComment: (commentId: string, parentId?: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  doubtId,
  comment,
  parentId,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [nestedReplies, setNestedReplies] = useState<Comment[]>([]);
  const replyRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load nested replies for this comment from Firestore.
  // They are stored in the "comments" subcollection of this comment's document.
  useEffect(() => {
    if (!user) return;
    const nestedRef = collection(db, "users", user.id, "posts", doubtId, "comments", comment.id, "comments");
    const q = query(nestedRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReplies: Comment[] = [];
      snapshot.forEach(docSnap => {
        loadedReplies.push({
          id: docSnap.id,
          text: docSnap.data().text,
          replies: [] // Further nesting can be loaded similarly if needed.
        });
      });
      setNestedReplies(loadedReplies);
    });
    return () => unsubscribe();
  }, [user, doubtId, comment.id]);

  // Hide reply input if clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (replyRef.current && !replyRef.current.contains(event.target as Node)) {
        if (!replyText) setIsReplying(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [replyText]);

  const handleSaveEdit = () => {
    onEditComment(comment.id, editedText, parentId);
    setIsEditing(false);
  };

  const handleAddReply = () => {
    if (replyText) {
      // For a reply to this comment, pass this comment's id as the parentId.
      onAddComment(replyText, comment.id);
      setIsReplying(false);
      setReplyText('');
    }
  };

  const handleEditTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(e.target.value);
    setHasChanges(e.target.value !== comment.text);
  };

  // Cancel editing if clicking outside and no changes detected.
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
              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              <DropdownMenuItem className="text-red-600" onClick={() => onDeleteComment(comment.id, parentId)}>
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
      {/* Render nested replies */}
      {nestedReplies.map(reply => (
        <CommentItem
          key={reply.id}
          doubtId={doubtId}
          comment={reply}
          // For nested replies, the immediate parent is the current comment.
          parentId={comment.id}
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default function CommentSection({ doubtId, comments, onAddComment, onEditComment, onDeleteComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment) {
      onAddComment(newComment); // No parentId for top-level comment.
      setNewComment('');
    }
  };

  return (
    <div className="w-full">
      <Button variant="ghost" className="p-0 h-auto text-gray-500 hover:text-gray-700" onClick={() => setExpanded(!expanded)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        {expanded ? 'Hide Comments' : `${comments.length} Comments`}
      </Button>
      {expanded && (
        <div className="mt-4 space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              doubtId={doubtId}
              comment={comment}
              // Top-level comments have no parentId.
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
