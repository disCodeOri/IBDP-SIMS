import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewIdeaFormProps {
  onSubmit: (title: string, description: string) => void;
}

/**
 * NewIdeaForm Component
 *
 * This component renders a form for creating a new idea.
 * It includes input fields for the idea's title and description,
 * and a submit button to trigger the creation process.
 */
export default function NewIdeaForm({ onSubmit }: NewIdeaFormProps) {
  // State variables to manage the input values for the idea's title and description.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /**
   * handleSubmit function
   *
   * Handles the form submission event.
   * It prevents the default form submission behavior, checks if both title and description are filled,
   * and then calls the `onSubmit` prop function passed from the parent component to handle idea creation.
   * After successful submission, it resets the title and description input fields.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      onSubmit(title, description);
      setTitle("");
      setDescription("");
    }
  };

  return (
    // Form element that handles the submission of new idea data.
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Container for the title input field */}
      <div className="space-y-2">
        {/* Input field for the title of the idea */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title"
          required
        />
      </div>
      {/* Container for the description textarea */}
      <div className="space-y-2">
        {/* Textarea for the detailed description of the idea */}
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description"
          required
        />
      </div>
      {/* Button to submit the form and create a new idea */}
      <Button type="submit">Create Idea</Button>
    </form>
  );
}
