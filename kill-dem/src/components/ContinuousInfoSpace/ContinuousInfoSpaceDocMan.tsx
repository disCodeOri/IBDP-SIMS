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
  readDocuments,
  updateDocumentPositions,
  deleteDocument,
  updateDocument,
  Document,
  addDocument,
} from "@/lib/continuous-info-space-doc-man-actions";

interface DocumentsProps {
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

function SortableDocumentCard({
  document,
  onEdit,
  isDragging,
  disableEdit,
}: {
  document: Document;
  onEdit: (document: Document) => void;
  isDragging: boolean;
  disableEdit: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
  } = useSortable({ id: document.id });

  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDraggableNodeRef,
    transform: dragTransform,
  } = useDraggable({
    id: document.id,
    data: { type: "document" },
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
      <h3 className="text-gray-800 font-bold text-lg mb-2 break-words">{document.name}</h3> {/* Changed text color */}
      <p className="text-gray-700 text-sm break-words overflow-y-auto max-h-24">{document.description}</p> {/* Changed text color */}

      {!disableEdit && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(document);
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

export default function DocumentJar({ disableEdit = false, disableAdd = false, disableDelete = false, gridCols = 4 }: DocumentsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
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
    async function fetchDocuments() {
      const fetchedDocuments = await readDocuments();
      setDocuments(fetchedDocuments);
    }
    fetchDocuments();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewDocument((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleEdit = (document: Document) => {
    if (disableEdit) return;
    setNewDocument(document);
    setIsEditing(true);
    setEditingDocumentId(document.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingDocumentId) {
      if (disableEdit) return;

      const updatedDocument: Document = {
        ...newDocument,
        id: editingDocumentId,
      } as Document;

      try {
        await updateDocument(updatedDocument);
        const updatedDocuments = await readDocuments();
        setDocuments(updatedDocuments);
      } catch (error) {
        console.error("Failed to update document:", error);
      } finally {
        setIsEditing(false);
        setEditingDocumentId(null);
        setNewDocument({ name: "", description: "" });
        setIsModalOpen(false);
      }
    } else {
      if (disableAdd) return;

      try {
        if (!newDocument.name || !newDocument.description) {
          console.error("Name and description are required");
          return;
        }

        const documentToAdd = {
          name: newDocument.name,
          description: newDocument.description,
        };

        await addDocument(documentToAdd, gridCols);
        const updatedDocuments = await readDocuments();
        setDocuments(updatedDocuments);
        setNewDocument({ name: "", description: "" });
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to add document:", error);
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
      await deleteDocument(String(active.id));
      const updatedDocuments = await readDocuments();
      setDocuments(updatedDocuments);
      return;
    }

    setDocuments((items) => {
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

      updateDocumentPositions(updatedItemsWithPositions);
      return updatedItemsWithPositions;
    });
  };

  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${gridCols} gap-4`;

  return (
    <div className="p-6">
      {!disableAdd && (
        <Button
          onClick={() => {
            setNewDocument({ name: "", description: "" });
            setIsEditing(false);
            toggleModal();
          }}
          variant="outline"
          size="default"
          className="mb-4"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={documents.map((a) => a.id)}
          strategy={rectSortingStrategy}
        >
          <div className={gridClasses}>
            {documents.map((document) => (
              <SortableDocumentCard
                key={document.id}
                document={document}
                onEdit={handleEdit}
                isDragging={activeId === document.id}
                disableEdit={disableEdit}
              />
            ))}
          </div>
        </SortableContext>

        <TrashZone disabled={disableDelete} />
      </DndContext>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700"> {/* Changed text color */}
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newDocument.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-200" // Changed background and text color, added border
                  placeholder="Enter document name"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700"> {/* Changed text color */}
                  Description
                </label>
                <textarea
                  id="description"
                  value={newDocument.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 border border-gray-200" // Changed background and text color, added border
                  rows={3}
                  placeholder="Enter document description"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  onClick={() => {
                    toggleModal();
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  size="default"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="default"
                >
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