import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewDoubtFormProps {
  onSubmit: (title: string, description: string) => void;
}

/**
 * NewDoubtForm Component
 *
 * This component renders a form for creating a new doubt.
 * It includes input fields for the doubt's title and description,
 * and a submit button to trigger the creation process.
 */
export default function NewDoubtForm({ onSubmit }: NewDoubtFormProps) {
  // State variables to manage the input values for the doubt's title and description.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /**
   * handleSubmit function
   *
   * Handles the form submission event.
   * It prevents the default form submission behavior, checks if both title and description are filled,
   * and then calls the `onSubmit` prop function passed from the parent component to handle doubt creation.
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
    // Form element that handles the submission of new doubt data.
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Container for the title input field */}
      <div className="space-y-2">
        {/* Input field for the title of the doubt */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Doubt title"
          required
        />
      </div>
      {/* Container for the description textarea */}
      <div className="space-y-2">
        {/* Textarea for the detailed description of the doubt */}
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description"
          required
        />
      </div>
      {/* Button to submit the form and create a new doubt */}
      <Button type="submit">Create Doubt</Button>
    </form>
  );
}
