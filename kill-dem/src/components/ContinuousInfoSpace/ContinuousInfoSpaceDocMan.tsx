"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Notebook, Eye } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  readNotebooks,
  deleteNotebook,
  addNotebook,
  getNotebook,
  notebook,
} from "@/lib/continuous-info-space-doc-man-actions";

/**
 * Component for displaying a single Notebook as a card.
 * It handles rendering notebook details and provides interactive buttons for actions like previewing, opening, and deleting the notebook.
 */
function NotebookCard({
  notebook,
  onDelete,
  onOpen,
  onPreview,
}: {
  notebook: notebook;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onPreview: (notebook: notebook) => void;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md relative group min-h-[150px] flex flex-col border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Notebook className="h-5 w-5 text-blue-600" />
          <h3 className="text-gray-800 font-semibold text-lg">
            {notebook.title}
          </h3>
        </div>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {notebook.description || "No description"}
        </p>
        <div className="text-xs text-gray-500 mt-auto">
          Last modified: {new Date(notebook.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Action buttons for the notebook, visible on hover */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(notebook)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpen(notebook.id)}
          className="text-blue-600 hover:text-blue-800"
        >
          Open
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notebook.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Main component for managing and displaying notebooks.
 * It handles fetching, creating, deleting, and previewing notebooks.
 * Uses drag and drop context for potential future sortable notebook lists, although sorting is not implemented in this version.
 */
export default function NotebookManager() {
  const router = useRouter();
  // State to hold the list of notebooks fetched from the database
  const [notebooks, setNotebooks] = useState<notebook[]>([]);
  // State to control the visibility of the modal for creating a new notebook
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to control the visibility of the notebook preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // State to hold the notebook data that is currently being previewed
  const [selectedNotebook, setSelectedNotebook] = useState<notebook | null>(
    null
  );
  // State to manage the input values for creating a new notebook (title and description)
  const [newNotebook, setNewNotebook] = useState({
    title: "",
    description: "",
  });

  // Sensors for drag and drop functionality (pointer and keyboard sensors)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  /**
   * Handles opening the preview dialog for a given notebook.
   * Sets the selected notebook to the notebook to be previewed and opens the preview modal.
   * @param {notebook} notebook - The notebook object to preview.
   */
  const handlePreview = (notebook: notebook) => {
    setSelectedNotebook(notebook);
    setIsPreviewOpen(true);
  };

  // useEffect hook to load notebooks when the component mounts
  useEffect(() => {
    loadNotebooks();
  }, []);

  /**
   * Loads notebooks from the database and updates the component state.
   * Fetches notebooks using `readNotebooks` action and sets the `notebooks` state.
   */
  const loadNotebooks = async () => {
    const fetchedNotebooks = await readNotebooks();
    setNotebooks(fetchedNotebooks);
  };

  /**
   * Handles the submission of the new notebook form.
   * Prevents default form submission, validates input, and calls `addNotebook` action to create a new notebook.
   * After successful creation, it closes the modal, resets the new notebook input state, and navigates to the newly created notebook's page.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebook.title) return;

    try {
      const createdNotebook = await addNotebook({
        title: newNotebook.title,
        description: newNotebook.description,
      });

      setIsModalOpen(false);
      setNewNotebook({ title: "", description: "" });
      router.push(
        `/ContinuousInfoSpaceDocMan/ContinuousInfoSpace/${createdNotebook.id}`
      );
    } catch (error) {
      console.error("Failed to create notebook:", error);
    }
  };

  /**
   * Handles deleting a notebook.
   * Calls the `deleteNotebook` action to remove a notebook from the database and then updates the local state by filtering out the deleted notebook.
   * @param {string} id - The ID of the notebook to delete.
   */
  const handleDeleteNotebook = async (id: string) => {
    try {
      await deleteNotebook(id);
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notebook:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Header section with title and button to add a new notebook */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Notebooks</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Notebook
        </Button>
      </div>

      {/* Drag and Drop Context for potential future sortable notebook list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <SortableContext items={notebooks} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Map through notebooks and render each as a NotebookCard */}
            {notebooks.map((notebook) => (
              <NotebookCard
                key={notebook.id}
                notebook={notebook}
                onDelete={handleDeleteNotebook}
                onOpen={(id) =>
                  router.push(
                    `/ContinuousInfoSpaceDocMan/ContinuousInfoSpace/${id}`
                  )
                }
                onPreview={handlePreview}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal for creating a new notebook */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Notebook</h2>
            <form onSubmit={handleCreateNotebook}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  required
                  type="text"
                  value={newNotebook.title}
                  onChange={(e) =>
                    setNewNotebook({ ...newNotebook, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-md border focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newNotebook.description}
                  onChange={(e) =>
                    setNewNotebook({
                      ...newNotebook,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-md border focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Notebook</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog for previewing a notebook */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-none border-b pb-4">
            <DialogTitle>{selectedNotebook?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="space-y-4 p-6">
              {/* Render sections and columns of the selected notebook for preview */}
              {selectedNotebook?.sections?.map(
                (section: any, index: number) => (
                  <div
                    key={section.id || index}
                    className="border rounded-lg p-4"
                  >
                    <h3 className="font-medium text-lg mb-3">
                      {section.title}
                    </h3>
                    <div className="flex gap-4">
                      {section.columns?.map((column: any, colIndex: number) => (
                        <div
                          key={column.id || colIndex}
                          className="flex-none w-72 bg-gray-50 rounded-lg p-3"
                        >
                          <h4 className="font-medium mb-2">{column.title}</h4>
                          <div className="space-y-2">
                            {column.notes?.map(
                              (note: any, noteIndex: number) => (
                                <div
                                  key={note.id || noteIndex}
                                  className="bg-white p-2 rounded border"
                                >
                                  {note.content}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
              {/* Display message if the notebook has no sections */}
              {(!selectedNotebook?.sections ||
                selectedNotebook.sections.length === 0) && (
                <p className="text-gray-500 text-center py-8">
                  This notebook is empty
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
