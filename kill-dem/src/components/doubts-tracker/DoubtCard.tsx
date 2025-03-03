import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
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
  CheckCircle2,
  Edit,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import CommentSection, { Comment } from "./CommentSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface DoubtCardProps {
  doubt: Doubt;
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
  // User authentication state
  const { user } = useUser();
  // State to manage whether the full description is expanded or collapsed
  const [expanded, setExpanded] = useState(false);
  // State to hold the solution text when resolving an doubt
  const [solution, setSolution] = useState("");
  // State for editing the doubt title, initialized with the current doubt title
  const [editTitle, setEditTitle] = useState(doubt.title);
  // State for editing the doubt description, initialized with the current doubt description
  const [editDescription, setEditDescription] = useState(doubt.description);
  // State to track if the solution is currently being edited
  const [isEditingSolution, setIsEditingSolution] = useState(false);
  // State to hold the edited solution text, initialized with the current solution
  const [editedSolution, setEditedSolution] = useState(doubt.solution || "");
  // State to track if the doubt itself is being edited (title and description)
  const [isEditing, setIsEditing] = useState(false);
  // State to control the visibility of the delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State to track if there are changes in the edit form to prevent accidental navigation away
  const [hasEditChanges, setHasEditChanges] = useState(false);
  // This state holds the nested comment tree built from the flat list of comments fetched from Firestore.
  const [nestedComments, setNestedComments] = useState<Comment[]>([]);
  // useRef for the title edit input to detect outside clicks for cancelling edit mode
  const editTitleRef = useRef<HTMLDivElement>(null);
  // useRef for the solution edit input to detect outside clicks for cancelling edit mode
  const editSolutionRef = useRef<HTMLDivElement>(null);

  // Load flat comments from Firestore and build the nested comment tree structure.
  useEffect(() => {
    if (!user) return;
    // Reference to the comments subcollection for this doubt
    const commentsRef = collection(
      db,
      "users",
      user.id,
      "nugget",
      doubt.id,
      "comments"
    );
    // Query to fetch comments ordered by creation time
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    // Subscribe to comment updates using onSnapshot to get real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments: Comment[] = [];
      snapshot.forEach((docSnap) => {
        loadedComments.push({
          id: docSnap.id,
          text: docSnap.data().text,
          parentId: docSnap.data().parentId || null,
          replies: [], // Initialize replies as empty array, to be populated in nesting logic
        });
      });
      // Build nested structure from flat comments
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];
      loadedComments.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] }); // Store comment in map for easy access
      });
      commentMap.forEach((comment) => {
        if (comment.parentId) {
          // If comment has a parentId, find the parent comment and add this comment as a reply
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(comment);
          } else {
            // If parent not found (e.g., orphaned comment), treat as top-level
            topLevelComments.push(comment);
          }
        } else {
          // If no parentId, it's a top-level comment
          topLevelComments.push(comment);
        }
      });
      setNestedComments(topLevelComments); // Update state with nested comments
    });
    return () => unsubscribe(); // Unsubscribe from snapshot listener when component unmounts
  }, [user, doubt.id]);

  // Handler for input changes in the title edit field
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
    setHasEditChanges(e.target.value !== doubt.title); // Track changes for "are you sure?" logic
  };

  // Handler for textarea changes in the description edit field
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditDescription(e.target.value);
    setHasEditChanges(e.target.value !== doubt.description); // Track changes for "are you sure?" logic
  };

  // useEffect hook to handle clicks outside the edit title/solution area to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!hasEditChanges) {
        // If no changes, clicking outside should cancel edit mode
        if (
          editTitleRef.current &&
          !editTitleRef.current.contains(event.target as Node)
        ) {
          setIsEditing(false); // Exit title edit mode
        }
        if (
          editSolutionRef.current &&
          !editSolutionRef.current.contains(event.target as Node)
        ) {
          setIsEditingSolution(false); // Exit solution edit mode
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hasEditChanges]);

  // Function to handle resolving an doubt - calls the onResolve prop function
  const handleResolve = () => {
    onResolve(doubt.id, solution);
    setSolution(""); // Clear the solution input after resolving
  };

  // Function to handle initiating the edit mode for the doubt (title/description)
  const handleEdit = () => {
    onEditDoubt(doubt.id, editTitle, editDescription);
  };

  // Function to handle saving the edited solution
  const handleEditSolution = () => {
    onEditSolution(doubt.id, editedSolution);
    setIsEditingSolution(false); // Exit solution edit mode after saving
  };

  return (
    <Card className={`${doubt.resolved ? "bg-gray-50" : "bg-white"}`}>
      <CardHeader className="flex flex-row items-start space-x-4 pb-2">
        {/* Upvote/Downvote buttons and score display */}
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
            {doubt.resolved ? "Resolved" : "Open"} •{" "}
            {nestedComments.reduce((acc, c) => acc + 1 + countReplies(c), 0)}{" "}
            comments
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Edit Doubt Dialog */}
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
          {/* Delete Doubt Dialog */}
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
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
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
        {/* Reopen Doubt Button - only shown if the doubt is resolved */}
        {doubt.resolved ? (
          <Button variant="outline" size="sm" onClick={() => onReopen(doubt.id)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reopen
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap break-words">
          {/* Conditionally render full description or truncated description based on expanded state */}
          {expanded ? doubt.description : `${doubt.description.slice(0, 200)}...`}
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
        {/* Solution display - only shown if the doubt is resolved and has a solution */}
        {doubt.resolved && doubt.solution && (
          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
            {/* Conditionally render solution text or solution edit input based on isEditingSolution state */}
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
        {/* Resolve input and button - only shown if the doubt is not resolved */}
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
        {/* Comment section component for displaying and adding comments */}
        <CommentSection
          doubtId={doubt.id}
          comments={nestedComments}
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

// Helper function to recursively count nested replies for a comment
function countReplies(comment: Comment): number {
  return comment.replies.reduce(
    (acc, reply) => acc + 1 + countReplies(reply),
    0
  );
}
