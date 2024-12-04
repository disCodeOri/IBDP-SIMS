// src/components/CookieJar.tsx
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
  readCookies,
  updateCookiePositions,
  deleteCookie,
  updateCookie,
  Cookie,
  addCookie,
} from "@/lib/cookies-actions";

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

// Sortable Cookie Card
function SortableCookieCard({
  cookie,
  onEdit,
  isDragging,
}: {
  cookie: Cookie;
  onEdit: (cookie: Cookie) => void;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
  } = useSortable({ id: cookie.id });

  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDraggableNodeRef,
    transform: dragTransform,
  } = useDraggable({
    id: cookie.id,
    data: { type: "cookie" },
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
      <h3 className="text-green-400 font-bold text-lg mb-2">{cookie.name}</h3>
      <p className="text-green-300 text-sm">{cookie.description}</p>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(cookie);
          }}
          className="text-green-500 hover:text-green-300"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Cookies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [newCookie, setNewCookie] = useState<Partial<Cookie>>({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCookieId, setEditingCookieId] = useState<string | null>(null);
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
    async function fetchCookies() {
      const fetchedCookies = await readCookies();
      setCookies(fetchedCookies);
    }
    fetchCookies();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCookie((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleEdit = (cookie: Cookie) => {
    setNewCookie(cookie);
    setIsEditing(true);
    setEditingCookieId(cookie.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingCookieId) {
      const updatedCookie: Cookie = {
        ...newCookie,
        id: editingCookieId,
      } as Cookie;

      try {
        await updateCookie(updatedCookie);
        const updatedCookies = await readCookies();
        setCookies(updatedCookies);
      } catch (error) {
        console.error("Failed to update cookie:", error);
      } finally {
        setIsEditing(false);
        setEditingCookieId(null);
        setNewCookie({ name: "", description: "" });
        setIsModalOpen(false);
      }
    } else {
      try {
        // Validate that name and description are not undefined
        if (!newCookie.name || !newCookie.description) {
          console.error("Name and description are required");
          return;
        }

        // Create a new cookie with guaranteed string values
        const cookieToAdd = {
          name: newCookie.name,
          description: newCookie.description,
        };

        // Call the addCookie server action
        await addCookie(cookieToAdd);

        // Refresh the cookies list
        const updatedCookies = await readCookies();
        setCookies(updatedCookies);

        // Reset form and close modal
        setNewCookie({ name: "", description: "" });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to add cookie:", error);
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

    // If dragged over trash, delete the cookie
    if (over?.id === "trash" && active.id) {
      await deleteCookie(String(active.id));
      const updatedCookies = await readCookies();
      setCookies(updatedCookies);
      return;
    }

    // If not over trash, reorder cookies
    setCookies((items) => {
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

      updateCookiePositions(updatedItemsWithPositions);
      return updatedItemsWithPositions;
    });
  };

  return (
    <div className="p-6">
      <button
        onClick={() => {
          setNewCookie({ name: "", description: "" });
          setIsEditing(false);
          toggleModal();
        }}
        className="bg-green-500 text-black px-4 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2 mb-4"
      >
        <Plus className="h-5 w-5" /> Add Cookie
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cookies.map((a) => a.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-4 gap-4">
            {cookies.map((cookie) => (
              <SortableCookieCard
                key={cookie.id}
                cookie={cookie}
                onEdit={handleEdit}
                isDragging={activeId === cookie.id}
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
              {isEditing ? "Edit Cookie" : "Add Cookie"}
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
                  value={newCookie.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter cookie name"
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
                  value={newCookie.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Enter cookie description"
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
