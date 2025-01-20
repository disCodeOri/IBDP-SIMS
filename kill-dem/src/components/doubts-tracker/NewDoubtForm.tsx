import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface NewDoubtFormProps {
  onSubmit: (title: string, description: string) => void;
}

export default function NewDoubtForm({ onSubmit }: NewDoubtFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      onSubmit(title, description);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Doubt title"
          required
        />
      </div>
      <div className="space-y-2">
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description"
          required
        />
      </div>
      <Button type="submit">Create Doubt</Button>
    </form>
  );
}

