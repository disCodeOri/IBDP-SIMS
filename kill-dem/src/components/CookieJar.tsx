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

interface CookiesProps {
  disableEdit?: boolean;
  disableAdd?: boolean;
  disableDelete?: boolean;
  gridCols?: number;
}

function TrashZone({ disabled }: { disabled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash",
    disabled,
  });

  if (disabled) return null;

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

function SortableCookieCard({
  cookie,
  onEdit,
  isDragging,
  disableEdit,
}: {
  cookie: Cookie;
  onEdit: (cookie: Cookie) => void;
  isDragging: boolean;
  disableEdit: boolean;
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
      className="bg-white p-4 rounded-lg shadow-md cursor-move relative group min-h-[120px] flex flex-col border border-gray-200" // Changed background and added border
    >
      <h3 className="text-gray-800 font-bold text-lg mb-2 break-words">{cookie.name}</h3> {/* Changed text color */}
      <p className="text-gray-700 text-sm break-words overflow-y-auto max-h-24">{cookie.description}</p> {/* Changed text color */}

      {!disableEdit && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cookie);
            }}
            className="text-gray-600 hover:text-gray-800" // Changed text color
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Cookies({ disableEdit = false, disableAdd = false, disableDelete = false, gridCols = 4 }: CookiesProps) {
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
        distance: 30,
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
    if (disableEdit) return;
    setNewCookie(cookie);
    setIsEditing(true);
    setEditingCookieId(cookie.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingCookieId) {
      if (disableEdit) return;

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
      if (disableAdd) return;

      try {
        if (!newCookie.name || !newCookie.description) {
          console.error("Name and description are required");
          return;
        }

        const cookieToAdd = {
          name: newCookie.name,
          description: newCookie.description,
        };

        await addCookie(cookieToAdd, gridCols);
        const updatedCookies = await readCookies();
        setCookies(updatedCookies);
        setNewCookie({ name: "", description: "" });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to add cookie:", error);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    setActiveId(null);

    if (!disableDelete && over?.id === "trash" && active.id) {
      await deleteCookie(String(active.id));
      const updatedCookies = await readCookies();
      setCookies(updatedCookies);
      return;
    }

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
          x: index % gridCols,
          y: Math.floor(index / gridCols),
        },
      }));

      updateCookiePositions(updatedItemsWithPositions);
      return updatedItemsWithPositions;
    });
  };

  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${gridCols} gap-4`;

  return (
    <div className="p-6">
      {!disableAdd && (
        <button
          onClick={() => {
            setNewCookie({ name: "", description: "" });
            setIsEditing(false);
            toggleModal();
          }}
          className="bg-green-400 text-white px-4 py-2 rounded-md font-bold hover:bg-green-500 flex items-center gap-2 mb-4" // Changed text color
        >
          <Plus className="h-5 w-5" /> Add Cookie
        </button>
      )}

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
          <div className={gridClasses}>
            {cookies.map((cookie) => (
              <SortableCookieCard
                key={cookie.id}
                cookie={cookie}
                onEdit={handleEdit}
                isDragging={activeId === cookie.id}
                disableEdit={disableEdit}
              />
            ))}
          </div>
        </SortableContext>

        <TrashZone disabled={disableDelete} />
      </DndContext>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-md max-w-md w-full shadow-lg"> {/* Changed background and text color, added shadow */}
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? "Edit Cookie" : "Add Cookie"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700"> {/* Changed text color */}
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCookie.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-200" // Changed background and text color, added border
                  placeholder="Enter cookie name"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700"> {/* Changed text color */}
                  Description
                </label>
                <textarea
                  id="description"
                  value={newCookie.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-200" // Changed background and text color, added border
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
                  className="bg-gray-200 px-4 py-2 rounded-md text-gray-800 hover:bg-gray-300" // Changed background and text color
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-green-400 text-white px-4 py-2 rounded-md font-bold hover:bg-green-500" // Changed text color
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