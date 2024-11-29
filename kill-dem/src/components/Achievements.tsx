// src/components/Achievements.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  SortableContext,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { readAchievements, addAchievement, updateAchievementPositions, Achievement } from '@/lib/achievements-actions';

// Sortable Achievement Card
function SortableAchievementCard({ achievement }: { achievement: Achievement }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: achievement.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-800 p-4 rounded-lg shadow-md cursor-move relative"
    >
      <h3 className="text-green-400 font-bold text-lg mb-2">{achievement.name}</h3>
      <p className="text-green-300 text-sm">{achievement.description}</p>
    </div>
  );
}

export default function Achievements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
  });

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch achievements on component mount
  useEffect(() => {
    async function fetchAchievements() {
      const fetchedAchievements = await readAchievements();
      setAchievements(fetchedAchievements);
    }
    fetchAchievements();
  }, []);

  // Toggle modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewAchievement(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add achievement
    await addAchievement(newAchievement);
    
    // Refresh achievements
    const updatedAchievements = await readAchievements();
    setAchievements(updatedAchievements);
    
    // Reset form and close modal
    setNewAchievement({ name: '', description: '' });
    setIsModalOpen(false);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setAchievements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Update positions
        const updatedItems = reorderedItems.map((item, index) => ({
          ...item,
          position: { 
            x: index % 4, 
            y: Math.floor(index / 4) 
          }
        }));
        
        // Persist changes
        updateAchievementPositions(updatedItems);
        
        return updatedItems;
      });
    }
  };

  return (
    <div className="p-6">
      {/* Add Achievement Button */}
      <button
        onClick={toggleModal}
        className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
      >
        <Plus className="h-5 w-5" /> Add Achievement
      </button>

      {/* Achievements Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={achievements.map(a => a.id!)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <SortableAchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-green-400 p-6 rounded-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-500">Add Achievement</h2>
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  value={newAchievement.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter achievement name"
                  required
                />
              </div>
              {/* Description Field */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  id="description"
                  value={newAchievement.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter achievement description"
                  required
                ></textarea>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex justify-end gap-4">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-700 px-4 py-2 rounded-md text-green-400 hover:bg-gray-600"
                >
                  Cancel
                </button>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-green-500 px-4 py-2 rounded-md text-black font-bold hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}