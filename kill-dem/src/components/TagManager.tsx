'use client'

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getTags, addTag, deleteTag } from "@/lib/tag-actions";

interface TagManagerProps {
  onTagsChange: (tags: string[]) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ onTagsChange }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const fetchedTags = await getTags();
    setTags(fetchedTags);
    onTagsChange(fetchedTags);
  };

  const handleAddTag = async () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const result = await addTag(newTag.trim());
      if (result.success) {
        await fetchTags();
        setNewTag('');
      }
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    const result = await deleteTag(tagToDelete);
    if (result.success) {
      await fetchTags();
    }
  };

  return (
    <Card className="bg-gray-900 border-green-800">
      <CardHeader>
        <CardTitle className="text-green-500">Manage Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag"
            className="mr-2 bg-gray-800 text-green-400 border-green-700"
          />
          <Button onClick={handleAddTag} className="bg-green-700 text-black hover:bg-green-600">
            Add Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-green-900 text-green-400">
              {tag}
              <button onClick={() => handleDeleteTag(tag)} className="ml-2 text-green-600">&times;</button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagManager;

