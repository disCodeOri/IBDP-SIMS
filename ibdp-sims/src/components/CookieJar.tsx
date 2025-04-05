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
import { Button } from "@/components/ui/button";
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

/**
 * TrashZone Component: Represents the droppable area for deleting cookies.
 * It becomes visible at the bottom of the screen during drag operations when delete is enabled.
 */
function TrashZone({ disabled }: { disabled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash",
    disabled,
  });

  // If deletion is disabled, don't render the trash zone
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

/**
 * SortableCookieCard Component: Represents a single cookie card that can be dragged and sorted.
 * It includes functionalities for editing and displaying cookie information.
 */
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
  // Hooks for sortable functionality from dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
  } = useSortable({ id: cookie.id });

  // Hooks for draggable functionality from dnd-kit - nested draggable within sortable
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDraggableNodeRef,
    transform: dragTransform,
  } = useDraggable({
    id: cookie.id,
    data: { type: "cookie" }, // Data to identify the type of draggable item
  });

  // Style to apply during drag operation for visual feedback
  const style = {
    transform: CSS.Transform.toString(transform || dragTransform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Make card slightly transparent during drag
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
      <h3 className="text-gray-800 font-bold text-lg mb-2 break-words">
        {cookie.name}
      </h3>{" "}
      {/* Changed text color */}
      <p className="text-gray-700 text-sm break-words overflow-y-auto max-h-24">
        {cookie.description}
      </p>{" "}
      {/* Changed text color */}
      {!disableEdit && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering parent actions
              onEdit(cookie); // Callback to handle cookie editing
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

/**
 * CookieJar Component: Main component for displaying and managing cookies in a draggable grid.
 * It handles cookie data fetching, adding, editing, deleting, and reordering.
 */
export default function CookieJar({
  disableEdit = false,
  disableAdd = false,
  disableDelete = false,
  gridCols = 4,
}: CookiesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling the cookie modal
  const [cookies, setCookies] = useState<Cookie[]>([]); // State to store the list of cookies
  const [newCookie, setNewCookie] = useState<Partial<Cookie>>({
    name: "",
    description: "",
  }); // State to manage new cookie input values in the modal
  const [isEditing, setIsEditing] = useState(false); // State to track if the modal is in edit mode
  const [editingCookieId, setEditingCookieId] = useState<string | null>(null); // State to hold the ID of the cookie being edited
  const [activeId, setActiveId] = useState<string | null>(null); // State to track the currently dragged cookie ID

  // Configure sensors for drag and drop interactions (Pointer and Keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 30, // Drag activation distance threshold
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, // Use keyboard coordinates for accessibility
    })
  );

  // useEffect hook to fetch cookies on component mount
  useEffect(() => {
    async function fetchCookies() {
      const fetchedCookies = await readCookies(); // Call to fetch cookies from database
      setCookies(fetchedCookies); // Update cookies state with fetched data
    }
    fetchCookies();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen); // Function to toggle modal visibility

  // Handler for input changes in the modal form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCookie((prev) => ({
      ...prev,
      [e.target.id]: e.target.value, // Dynamically update the corresponding field in newCookie state
    }));
  };

  // Handler to prepare modal for editing an existing cookie
  const handleEdit = (cookie: Cookie) => {
    if (disableEdit) return; // Prevent edit if editing is disabled
    setNewCookie(cookie); // Populate modal form with cookie data
    setIsEditing(true); // Set modal to edit mode
    setEditingCookieId(cookie.id); // Store the ID of the cookie being edited
    setIsModalOpen(true); // Open the modal
  };

  // Handler for form submission (Add or Edit Cookie)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingCookieId) {
      // Handle cookie update
      if (disableEdit) return; // Prevent update if editing is disabled

      const updatedCookie: Cookie = {
        ...newCookie,
        id: editingCookieId,
      } as Cookie;

      try {
        await updateCookie(updatedCookie); // Call to update cookie in database
        const updatedCookies = await readCookies(); // Re-fetch cookies to reflect changes
        setCookies(updatedCookies); // Update local cookie state
      } catch (error) {
        console.error("Failed to update cookie:", error);
      } finally {
        setIsEditing(false); // Reset edit mode state
        setEditingCookieId(null); // Clear editing cookie ID
        setNewCookie({ name: "", description: "" }); // Reset new cookie input state
        setIsModalOpen(false); // Close the modal
      }
    } else {
      // Handle new cookie addition
      if (disableAdd) return; // Prevent add if adding is disabled

      try {
        if (!newCookie.name || !newCookie.description) {
          console.error("Name and description are required");
          return;
        }

        const cookieToAdd = {
          name: newCookie.name,
          description: newCookie.description,
        };

        await addCookie(cookieToAdd, gridCols); // Call to add new cookie to database
        const updatedCookies = await readCookies(); // Re-fetch cookies to reflect addition
        setCookies(updatedCookies); // Update local cookie state
        setNewCookie({ name: "", description: "" }); // Reset new cookie input state
        setIsModalOpen(false); // Close the modal
      } catch (error) {
        console.error("Failed to add cookie:", error);
      }
    }
  };

  // Handler for drag start event
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string); // Set active ID to the ID of the dragged cookie
  };

  // Handler for drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    setActiveId(null); // Reset active ID after drag end

    if (!disableDelete && over?.id === "trash" && active.id) {
      // Handle cookie deletion when dropped on trash zone
      await deleteCookie(String(active.id)); // Call to delete cookie from database
      const updatedCookies = await readCookies(); // Re-fetch cookies to reflect deletion
      setCookies(updatedCookies); // Update local cookie state
      return;
    }

    setCookies((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id); // Find the original index of the dragged cookie
      const newIndex = items.findIndex((item) => item.id === over?.id); // Find the new index based on drop target

      if (oldIndex === -1 || newIndex === -1) {
        return items; // Return original items if indices are invalid
      }

      const reorderedItems = arrayMove(items, oldIndex, newIndex); // Reorder items array

      // Update positions based on new order in the grid
      const updatedItemsWithPositions = reorderedItems.map((item, index) => ({
        ...item,
        position: {
          x: index % gridCols, // Calculate x position based on column
          y: Math.floor(index / gridCols), // Calculate y position based on row
        },
      }));

      updateCookiePositions(updatedItemsWithPositions); // Call to update cookie positions in database
      return updatedItemsWithPositions; // Return updated items array
    });
  };

  // Dynamic grid classes based on props
  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${gridCols} gap-4`;

  return (
    <div className="p-6">
      {!disableAdd && (
        <Button
          onClick={() => {
            setNewCookie({ name: "", description: "" }); // Reset input fields
            setIsEditing(false); // Ensure modal is in add mode
            toggleModal(); // Open the modal
          }}
          variant="outline"
          size="default"
          className="mb-4"
        >
          <Plus className="h-4 w-4" />
          Add Cookie
        </Button>
      )}

      {/* DndContext Provider for drag and drop functionality */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // Strategy for detecting collisions during drag
        onDragStart={handleDragStart} // Handler for drag start event
        onDragEnd={handleDragEnd} // Handler for drag end event
      >
        {/* SortableContext to manage sortable items */}
        <SortableContext
          items={cookies.map((a) => a.id)} // Array of cookie IDs for sortable context
          strategy={rectSortingStrategy} // Strategy for sorting (rectangle sorting)
        >
          <div className={gridClasses}>
            {cookies.map((cookie) => (
              <SortableCookieCard
                key={cookie.id}
                cookie={cookie}
                onEdit={handleEdit}
                isDragging={activeId === cookie.id} // Pass dragging state to card for styling
                disableEdit={disableEdit}
              />
            ))}
          </div>
        </SortableContext>

        {/* TrashZone component for deleting cookies */}
        <TrashZone disabled={disableDelete} />
      </DndContext>

      {/* Modal for adding/editing cookies */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  {" "}
                  {/* Changed text color */}
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
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  {" "}
                  {/* Changed text color */}
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
                <Button
                  type="button"
                  onClick={() => {
                    toggleModal(); // Close the modal
                    setIsEditing(false); // Reset edit mode
                  }}
                  variant="secondary"
                  size="default"
                >
                  Cancel
                </Button>

                <Button type="submit" variant="default" size="default">
                  {isEditing ? "Update" : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
