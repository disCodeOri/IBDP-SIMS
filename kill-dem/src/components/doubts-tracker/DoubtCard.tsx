import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  CheckCircle2,
  Edit,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import CommentSection from "./CommentSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface DoubtCardProps {
  doubt: Doubt;
  onResolve: (id: number, solution: string) => void;
  onReopen: (id: number) => void;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onAddComment: (
    doubtId: number,
    commentText: string,
    parentCommentId?: number
  ) => void;
  onEditDoubt: (id: number, title: string, description: string) => void;
  onEditComment: (doubtId: number, commentId: number, newText: string) => void;
  onDeleteComment: (doubtId: number, commentId: number) => void;
  onEditSolution: (id: number, newSolution: string) => void;
  onDeleteDoubt: (id: number) => void;
}

export default function DoubtCard({
  doubt,
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
}: DoubtCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [solution, setSolution] = useState("");
  const [editTitle, setEditTitle] = useState(doubt.title);
  const [editDescription, setEditDescription] = useState(doubt.description);
  const [isEditingSolution, setIsEditingSolution] = useState(false);
  const [editedSolution, setEditedSolution] = useState(doubt.solution || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add refs for edit components
  const editTitleRef = useRef<HTMLDivElement>(null);
  const editDescriptionRef = useRef<HTMLDivElement>(null);
  const editSolutionRef = useRef<HTMLDivElement>(null);

  // Add state to track if content has changed
  const [hasEditChanges, setHasEditChanges] = useState(false);

  // Update edit handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
    setHasEditChanges(e.target.value !== doubt.title);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditDescription(e.target.value);
    setHasEditChanges(e.target.value !== doubt.description);
  };

  // Add click outside handler with useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!hasEditChanges) {
        if (
          editTitleRef.current &&
          !editTitleRef.current.contains(event.target as Node)
        ) {
          setIsEditing(false);
        }
        if (
          editSolutionRef.current &&
          !editSolutionRef.current.contains(event.target as Node)
        ) {
          setIsEditingSolution(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hasEditChanges]);

  const handleResolve = () => {
    onResolve(doubt.id, solution);
    setSolution("");
  };

  const handleEdit = () => {
    onEditDoubt(doubt.id, editTitle, editDescription);
  };

  const handleEditSolution = () => {
    onEditSolution(doubt.id, editedSolution);
    setIsEditingSolution(false);
  };

  return (
    <Card className={`${doubt.resolved ? "bg-gray-50" : "bg-white"}`}>
      <CardHeader className="flex flex-row items-start space-x-4 pb-2">
        <div className="flex flex-col items-center space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="px-0"
            onClick={() => onUpvote(doubt.id)}
          >
            <ArrowBigUp
              className={`h-5 w-5 ${
                doubt.upvotes > doubt.downvotes
                  ? "text-orange-500"
                  : "text-gray-500"
              }`}
            />
          </Button>
          <span className="text-sm font-bold">
            {doubt.upvotes - doubt.downvotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="px-0"
            onClick={() => onDownvote(doubt.id)}
          >
            <ArrowBigDown
              className={`h-5 w-5 ${
                doubt.downvotes > doubt.upvotes
                  ? "text-blue-500"
                  : "text-gray-500"
              }`}
            />
          </Button>
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg break-all overflow-wrap-anywhere">
            {doubt.title}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {doubt.resolved ? "Resolved" : "Open"} • {doubt.comments.length}{" "}
            comments
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Doubt</DialogTitle>
                <DialogDescription>
                  Make changes to your doubt here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input
                    id="title"
                    value={editTitle}
                    onChange={handleTitleChange}
                    placeholder="Doubt title"
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Detailed description"
                  />
                </div>
              </div>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Doubt</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this doubt? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDeleteDoubt(doubt.id);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {doubt.resolved ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReopen(doubt.id)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reopen
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap break-words">
          {expanded
            ? doubt.description
            : `${doubt.description.slice(0, 200)}...`}
          {doubt.description.length > 200 && (
            <Button
              variant="link"
              className="p-0 h-auto text-blue-500"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Read Less" : "Read More"}
            </Button>
          )}
        </p>
        {doubt.resolved && doubt.solution && (
          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
            {isEditingSolution ? (
              <div className="flex space-x-2">
                <Input
                  value={editedSolution}
                  onChange={(e) => setEditedSolution(e.target.value)}
                  className="flex-grow"
                />
                <Button size="sm" onClick={handleEditSolution}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-green-800 whitespace-pre-wrap break-words">
                  Solution: {doubt.solution}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingSolution(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        {!doubt.resolved && (
          <div className="flex w-full space-x-2">
            <Input
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter solution"
            />
            <Button onClick={handleResolve} disabled={!solution}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </div>
        )}
        <CommentSection
          comments={doubt.comments}
          onAddComment={(text, parentId) =>
            onAddComment(doubt.id, text, parentId)
          }
          onEditComment={(commentId, newText) =>
            onEditComment(doubt.id, commentId, newText)
          }
          onDeleteComment={(commentId) => onDeleteComment(doubt.id, commentId)}
        />
      </CardFooter>
    </Card>
  );
}
