// src/components/Achievements.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  readAchievements,
  updateAchievementPositions,
  deleteAchievement,
  updateAchievement,
  Achievement,
  addAchievement,
} from "@/lib/achievements-actions";

// Droppable Trash Zone
function TrashZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash",
  });

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white p-4 rounded-full
        transition-all duration-300 ${
          isOver ? "scale-110 bg-red-600" : "scale-100"
        }`}
    >
      <Trash2 className="h-6 w-6" />
    </div>
  );
}

// Sortable Achievement Card
function SortableAchievementCard({
  achievement,
  onEdit,
  isDragging,
}: {
  achievement: Achievement;
  onEdit: (achievement: Achievement) => void;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
  } = useSortable({ id: achievement.id });

  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDraggableNodeRef,
    transform: dragTransform,
  } = useDraggable({
    id: achievement.id,
    data: { type: "achievement" },
  });

  const style = {
    transform: CSS.Transform.toString(transform || dragTransform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setSortableNodeRef(node);
        setDraggableNodeRef(node);
      }}
      style={style}
      {...attributes}
      {...listeners}
      {...dragAttributes}
      {...dragListeners}
      className="bg-gray-800 p-4 rounded-lg shadow-md cursor-move relative group"
    >
      <h3 className="text-green-400 font-bold text-lg mb-2">
        {achievement.name}
      </h3>
      <p className="text-green-300 text-sm">{achievement.description}</p>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(achievement);
          }}
          className="text-green-500 hover:text-green-300"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Achievements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<
    string | null
  >(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 30, // Slightly increased from 5
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function fetchAchievements() {
      const fetchedAchievements = await readAchievements();
      setAchievements(fetchedAchievements);
    }
    fetchAchievements();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewAchievement((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleEdit = (achievement: Achievement) => {
    setNewAchievement(achievement);
    setIsEditing(true);
    setEditingAchievementId(achievement.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingAchievementId) {
      const updatedAchievement: Achievement = {
        ...newAchievement,
        id: editingAchievementId,
      } as Achievement;

      try {
        await updateAchievement(updatedAchievement);
        const updatedAchievements = await readAchievements();
        setAchievements(updatedAchievements);
      } catch (error) {
        console.error("Failed to update achievement:", error);
      } finally {
        setIsEditing(false);
        setEditingAchievementId(null);
        setNewAchievement({ name: "", description: "" });
        setIsModalOpen(false);
      }
    } else {
      try {
        // Validate that name and description are not undefined
        if (!newAchievement.name || !newAchievement.description) {
          console.error("Name and description are required");
          return;
        }

        // Create a new achievement with guaranteed string values
        const achievementToAdd = {
          name: newAchievement.name,
          description: newAchievement.description,
        };

        // Call the addAchievement server action
        await addAchievement(achievementToAdd);

        // Refresh the achievements list
        const updatedAchievements = await readAchievements();
        setAchievements(updatedAchievements);

        // Reset form and close modal
        setNewAchievement({ name: "", description: "" });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to add achievement:", error);
        // Optionally, you could add user-facing error handling here
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;

    // Reset activeId
    setActiveId(null);

    // If dragged over trash, delete the achievement
    if (over?.id === "trash" && active.id) {
      await deleteAchievement(String(active.id));
      const updatedAchievements = await readAchievements();
      setAchievements(updatedAchievements);
      return;
    }

    // If not over trash, reorder achievements
    setAchievements((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) {
        return items;
      }

      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      const updatedItemsWithPositions = reorderedItems.map((item, index) => ({
        ...item,
        position: {
          x: index % 4,
          y: Math.floor(index / 4),
        },
      }));

      updateAchievementPositions(updatedItemsWithPositions);
      return updatedItemsWithPositions;
    });
  };

  return (
    <div className="p-6">
      <button
        onClick={() => {
          setNewAchievement({ name: "", description: "" });
          setIsEditing(false);
          toggleModal();
        }}
        className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
      >
        <Plus className="h-5 w-5" /> Add Achievement
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={achievements.map((a) => a.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <SortableAchievementCard
                key={achievement.id}
                achievement={achievement}
                onEdit={handleEdit}
                isDragging={activeId === achievement.id}
              />
            ))}
          </div>
        </SortableContext>

        <TrashZone />
      </DndContext>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-green-400 p-6 rounded-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              {isEditing ? "Edit Achievement" : "Add Achievement"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Name
                </label>
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

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={newAchievement.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter achievement description"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    toggleModal();
                    setIsEditing(false);
                  }}
                  className="bg-gray-700 px-4 py-2 rounded-md text-green-400 hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-green-500 px-4 py-2 rounded-md text-black font-bold hover:bg-green-700"
                >
                  {isEditing ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
