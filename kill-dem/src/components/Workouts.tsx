"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  saveWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
  getAllTags,
} from "@/lib/workouts-actions";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Workout = {
  id: string;
  content: string;
  createdAt: string;
  tags: string[];
};

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutInput, setWorkoutInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchWorkouts();
    fetchTags();
  }, []);

  const fetchWorkouts = async () => {
    const fetchedWorkouts = await getWorkouts();
    setWorkouts(fetchedWorkouts);
  };

  const fetchTags = async () => {
    const fetchedTags = await getAllTags();
    setAvailableTags(fetchedTags);
  };

  const openWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout);
    setEditContent(workout.content);
    setTags(workout.tags || []);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedWorkout(null);
    setEditContent("");
    setTags([]);
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("workout", workoutInput);
    formData.append("tags", JSON.stringify(tags));

    const result = await saveWorkout(formData);

    if (result.success) {
      await fetchWorkouts();
      await fetchTags();
      setWorkoutInput("");
      setTags([]);
    }
  };

  const handleUpdateWorkout = async () => {
    if (!selectedWorkout) return;
    const result = await updateWorkout(selectedWorkout.id, editContent, tags);
    if (result.success) {
      await fetchWorkouts();
      await fetchTags();
      handleCloseDialog();
    }
  };

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;
    const result = await deleteWorkout(selectedWorkout.id);
    if (result.success) {
      await fetchWorkouts();
      await fetchTags();
      handleCloseDialog();
    }
  };

  const addTag = () => {
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
      setSelectedTag("");
    }
  };

  const addNewTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-green-400">
      {/* Workout Input Form */}
      <form onSubmit={handleSubmit} className="mb-6 mt-6">
        <Textarea
          value={workoutInput}
          onChange={(e) => setWorkoutInput(e.target.value)}
          placeholder="Enter your workout details..."
          className="mb-4 bg-gray-900 text-green-400 border-green-800"
        />
        <div className="flex mb-4">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[180px] bg-gray-900 text-green-400 border-green-800">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-green-400 border-green-800">
              {availableTags.map((tag) => (
                <SelectItem
                  key={tag}
                  value={tag}
                  className="hover:bg-green-700 hover:text-black focus:bg-green-700 focus:text-black"
                >
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addTag}
            type="button"
            className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
          >
            Add Tag
          </Button>
        </div>
        <div className="flex mb-4">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag"
            className="mr-2 bg-gray-900 text-green-400 border-green-800"
          />
          <Button
            onClick={addNewTag}
            type="button"
            className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
          >
            Add New Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-green-900 text-green-400"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-green-600"
              >
                &times;
              </button>
            </Badge>
          ))}
        </div>
        <Button
          type="submit"
          disabled={!workoutInput.trim()}
          className="bg-green-700 text-black hover:bg-green-600"
        >
          Save Workout
        </Button>
      </form>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <Card
            key={workout.id}
            onClick={() => openWorkoutDetails(workout)}
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-900 border-green-800"
          >
            <CardHeader>
              <CardTitle className="text-green-500">
                Workout on {new Date(workout.createdAt).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-green-400">{workout.content}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {workout.tags &&
                  workout.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-green-900 text-green-400"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 text-green-400 border-green-800">
          <DialogHeader>
            <DialogTitle className="text-green-500">
              {selectedWorkout &&
                `Workout on ${new Date(
                  selectedWorkout.createdAt
                ).toLocaleString()}`}
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="h-64 bg-gray-800 text-green-400 border-green-700"
              />
              <div className="flex mb-4">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[180px] bg-gray-800 text-green-400 border-green-700">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-green-400 border-green-700">
                    {availableTags.map((tag) => (
                      <SelectItem
                        key={tag}
                        value={tag}
                        className="hover:bg-green-700 hover:text-black focus:bg-green-700 focus:text-black"
                      >
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={addTag}
                  type="button"
                  className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
                >
                  Add Tag
                </Button>
              </div>
              <div className="flex mb-4">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag"
                  className="mr-2 bg-gray-800 text-green-400 border-green-700"
                />
                <Button
                  onClick={addNewTag}
                  type="button"
                  className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
                >
                  Add New Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-green-900 text-green-400"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-green-600"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="w-full overflow-auto max-h-[60vh] p-2 whitespace-pre-wrap break-words">
                {selectedWorkout?.content}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedWorkout?.tags &&
                  selectedWorkout.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-green-900 text-green-400"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </>
          )}

          <DialogFooter>
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="text-green-400 border-green-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateWorkout}
                  className="bg-green-700 text-black hover:bg-green-600"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleDeleteWorkout}
                  className="bg-red-700 text-white hover:bg-red-600"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-700 text-black hover:bg-green-600"
                >
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workouts;
