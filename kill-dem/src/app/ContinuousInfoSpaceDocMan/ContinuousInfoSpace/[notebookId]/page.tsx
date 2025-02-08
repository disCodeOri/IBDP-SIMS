"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackButton } from "@/components/custom-ui/back-button";
import { getNotebook, updateNotebook } from "@/lib/continuous-info-space-doc-man-actions";
import { Archive, Plus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface Note {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  notes: Note[];
  isEditing: boolean;
}

interface Section {
  id: string;
  title: string;
  columns: Column[];
  isEditing: boolean;
  isArchived?: boolean;
  isPreviewingArchived?: boolean;
}

interface DragData {
  type: "note" | "column";
  sectionId: string;
  columnId?: string;
  noteId?: string;
}

const DraggableColumn = ({
  column,
  section,
  children,
}: {
  column: Column;
  section: Section;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `column-${column.id}`,
    data: {
      type: "column",
      sectionId: section.id,
      columnId: column.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex-none w-80"
    >
      {children}
    </div>
  );
};

const DroppableColumn = ({
  column,
  section,
  children,
}: {
  column: Column;
  section: Section;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${column.id}`,
    data: {
      type: "column",
      sectionId: section.id,
      columnId: column.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 ${isOver ? "bg-gray-100" : "bg-gray-50"}`}
    >
      {children}
    </div>
  );
};

const DraggableNote = ({
  note,
  children,
}: {
  note: Note;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: note.id,
    data: {
      type: "note",
      noteId: note.id
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[#fff9e6] rounded-lg p-4 cursor-move group" // Added group for hover effects
    >
      {children}
    </div>
  );
};

const TodoListInterface = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const notebookId = params.notebookId as string;
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [archivedSections, setArchivedSections] = useState<Section[]>([]);
  const [previewSection, setPreviewSection] = useState<Section | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch initial data
  useEffect(() => {
    if (!user || !notebookId) return;

    const fetchNotebookData = async () => {
      try {
        const notebook = await getNotebook(notebookId);
        if (notebook) {
          setSections(notebook.sections || []);
        }
      } catch (error) {
        console.error("Error fetching notebook data:", error);
      }
    };

    fetchNotebookData();
  }, [user, notebookId]);

  // Sync changes to Firestore with debounce
  useEffect(() => {
    if (!user || !notebookId) return;

    // Add debounce to prevent too many writes
    const timeoutId = setTimeout(async () => {
      try {
        await updateNotebook(notebookId, sections);
      } catch (error) {
        console.error("Error updating notebook:", error);
      }
    }, 1000); // Wait 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [sections, user, notebookId]);

  const archiveSection = (sectionId: string) => {
    const sectionToArchive = sections.find((s) => s.id === sectionId);
    if (sectionToArchive) {
      setSections(sections.filter((s) => s.id !== sectionId));
      setArchivedSections([
        ...archivedSections,
        { ...sectionToArchive, isArchived: true },
      ]);
    }
  };

  const unarchiveSection = (sectionId: string) => {
    const sectionToUnarchive = archivedSections.find((s) => s.id === sectionId);
    if (sectionToUnarchive) {
      // Close preview if the unarchived section is currently being previewed
      if (previewSection && previewSection.id === sectionId) {
        setPreviewSection(null);
      }

      setArchivedSections(archivedSections.filter((s) => s.id !== sectionId));
      setSections([...sections, { ...sectionToUnarchive, isArchived: false }]);
    }
  };

  const previewArchivedSection = (section: Section) => {
    setPreviewSection({ ...section, isPreviewingArchived: true });
  };

  const closePreview = () => {
    setPreviewSection(null);
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: "New Section",
      isEditing: true,
      columns: [
        {
          id: `col-${Date.now()}`,
          title: "New Column",
          isEditing: false,
          notes: [],
        },
      ],
    };
    setSections([...sections, newSection]);
  };

  const addColumn = (sectionId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: [
              ...section.columns,
              {
                id: `col-${Date.now()}`,
                title: "New Column",
                isEditing: true,
                notes: [],
              },
            ],
          };
        }
        return section;
      })
    );
  };

  const addNote = (sectionId: string, columnId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === columnId) {
                return {
                  ...column,
                  notes: [
                    ...column.notes,
                    {
                      id: `note-${Date.now()}`,
                      content: "New note",
                      isEditing: true,
                    },
                  ],
                };
              }
              return column;
            }),
          };
        }
        return section;
      })
    );
  };

    const moveNote = (
    fromSectionId: string,
    fromColumnId: string,
    toSectionId: string,
    toColumnId: string,
    noteId: string
  ) => {
    // First, find the note to move
    const noteToMove = sections
      .find((s) => s.id === fromSectionId)
      ?.columns.find((c) => c.id === fromColumnId)
      ?.notes.find((n) => n.id === noteId);
  
    if (!noteToMove) return; // Exit if note not found
  
    setSections(
      sections.map((section) => {
        // If this is not the source or target section, return unchanged
        if (section.id !== fromSectionId && section.id !== toSectionId) {
          return section;
        }
  
        // Handle source section
        if (section.id === fromSectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              // Remove note from source column
              if (column.id === fromColumnId) {
                return {
                  ...column,
                  notes: column.notes.filter((note) => note.id !== noteId),
                };
              }
              // Add note to destination column if same section
              if (column.id === toColumnId && fromSectionId === toSectionId) {
                return {
                  ...column,
                  notes: [...column.notes, noteToMove],
                };
              }
              return column;
            }),
          };
        }
  
        // Handle target section (when different from source)
        if (section.id === toSectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === toColumnId) {
                return {
                  ...column,
                  notes: [...column.notes, noteToMove],
                };
              }
              return column;
            }),
          };
        }
  
        return section;
      })
    );
  };

  const moveColumn = (
    sectionId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newColumns = [...section.columns];
          const [movedColumn] = newColumns.splice(fromIndex, 1);
          newColumns.splice(toIndex, 0, movedColumn);
          return { ...section, columns: newColumns };
        }
        return section;
      })
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const noteId = active.id as string;

    // Find the dragged note
    const draggedNote = sections
      .flatMap((section) =>
        section.columns.flatMap((column) =>
          column.notes.find((note) => note.id === noteId)
        )
      )
      .find(Boolean);

    if (draggedNote) {
      setActiveNote(draggedNote);
    }
  };

    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
  
    // Reset activeNote regardless of outcome
    setActiveNote(null);
  
    // If there's no over target, return early - note will stay in original position
    if (!over) {
      return;
    }
  
    const activeId = active.id as string;
    const activeData = active.data.current as DragData;
    const overData = over.data.current as DragData;
  
    // Handle column dragging
    if (activeData.type === "column" && overData.type === "column") {
      const sectionId = activeData.sectionId;
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;
  
      const fromIndex = section.columns.findIndex(
        (c) => c.id === activeData.columnId
      );
      const toIndex = section.columns.findIndex(
        (c) => c.id === overData.columnId
      );
  
      if (fromIndex !== toIndex) {
        moveColumn(sectionId, fromIndex, toIndex);
      }
      return;
    }
  
    // Handle note dragging
    if (activeData.type === "note" || !activeData.type) {
      // Only proceed if we're dropping onto a column
      if (!overData?.type || !overData.columnId) {
        return; // Note will stay in original position
      }
  
      // Find the source section and column
      let fromSectionId, fromColumnId;
      sections.some(section => {
        return section.columns.some(column => {
          const found = column.notes.some(note => note.id === activeId);
          if (found) {
            fromSectionId = section.id;
            fromColumnId = column.id;
            return true;
          }
          return false;
        });
      });
  
      // Get destination details from the over data
      const toSectionId = overData.sectionId;
      const toColumnId = overData.columnId;
  
      // Only move the note if we have valid source and destination
      if (fromSectionId && fromColumnId && toSectionId && toColumnId) {
        moveNote(fromSectionId, fromColumnId, toSectionId, toColumnId, activeId);
      }
    }
  };

  const deleteSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    toast({
      title: "Delete Section?",
      description: `Are you sure you want to delete "${section.title}"?`,
      action: (
        <ToastAction
          altText="Delete"
          onClick={() => {
            setSections(sections.filter((section) => section.id !== sectionId));
            toast({
              title: "Section deleted",
              description: "The section has been deleted successfully.",
            });
          }}
        >
          Delete
        </ToastAction>
      ),
    });
  };

  const deleteColumn = (sectionId: string, columnId: string) => {
    const column = sections
      .find((s) => s.id === sectionId)
      ?.columns.find((c) => c.id === columnId);
    if (!column) return;

    toast({
      title: "Delete Column?",
      description: `Are you sure you want to delete "${column.title}"?`,
      action: (
        <ToastAction
          altText="Delete"
          onClick={() => {
            setSections(
              sections.map((section) => {
                if (section.id === sectionId) {
                  return {
                    ...section,
                    columns: section.columns.filter(
                      (column) => column.id !== columnId
                    ),
                  };
                }
                return section;
              })
            );
            toast({
              title: "Column deleted",
              description: "The column has been deleted successfully.",
            });
          }}
        >
          Delete
        </ToastAction>
      ),
    });
  };

  const deleteNote = (sectionId: string, columnId: string, noteId: string) => {
    const note = sections
      .find((s) => s.id === sectionId)
      ?.columns.find((c) => c.id === columnId)
      ?.notes.find((n) => n.id === noteId);
    if (!note) return;

    toast({
      title: "Delete Note?",
      description: `Are you sure you want to delete this note?`,
      action: (
        <ToastAction
          altText="Delete"
          onClick={() => {
            setSections(
              sections.map((section) => {
                if (section.id === sectionId) {
                  return {
                    ...section,
                    columns: section.columns.map((column) => {
                      if (column.id === columnId) {
                        return {
                          ...column,
                          notes: column.notes.filter(
                            (note) => note.id !== noteId
                          ),
                        };
                      }
                      return column;
                    }),
                  };
                }
                return section;
              })
            );
            toast({
              title: "Note deleted",
              description: "The note has been deleted successfully.",
            });
          }}
        >
          Delete
        </ToastAction>
      ),
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-none flex items-center justify-between p-4 border-b bg-white">
      <BackButton />

        {/* Archive Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Archive className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Archived Sections</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {archivedSections.map((section) => (
                <Card key={section.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {section.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unarchiveSection(section.id)}
                    >
                      Unarchive
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => previewArchivedSection(section)}
                    >
                      Preview
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-none max-h-none bg-white min-h-screen pb-20">
          {/* Archived Sections */}

          {/* Preview Section (if active) */}
          {previewSection && (
            <div className="border-2 border-gray-200 rounded-lg mb-8">
              <div className="flex justify-between items-center px-4 py-2 bg-white">
                <h2 className="text-lg font-medium">
                  {previewSection.title}{" "}
                  <span className="text-gray-500 text-sm">(Preview)</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={closePreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-4 py-2 overflow-x-auto">
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-4 min-h-[200px] pb-4">
                    {previewSection.columns.map((column) => (
                      <div
                        key={column.id}
                        className="flex-none w-80 rounded-lg p-4 bg-gray-50"
                      >
                        <h3 className="font-medium text-gray-700 mb-4">
                          {column.title}
                        </h3>
                        <div className="space-y-4">
                          {column.notes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-[#fff9e6] rounded-lg p-4"
                            >
                              <p className="text-gray-800">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end px-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={closePreview}
                    >
                      Close Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-100 mb-8 overflow-x-auto"
            >
              {/* Section Header - remove sticky positioning */}
              <div className="flex justify-between items-center px-4 py-2 bg-white group">
                <div className="flex items-center space-x-2">
                  <h2
                    className="text-lg font-medium outline-none focus:outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      setSections(
                        sections.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                title: e.currentTarget.textContent || s.title,
                              }
                            : s
                        )
                      );
                    }}
                  >
                    {section.title}
                  </h2>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                    onClick={() => archiveSection(section.id)}
                  >
                    Archive
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => deleteSection(section.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* TodoList Board */}
              <div className="px-4 py-2">
                <div className="flex space-x-4 min-h-[200px] pb-4">
                  {section.columns.map((column) => (
                    <DraggableColumn
                      key={column.id}
                      column={column}
                      section={section}
                    >
                      <DroppableColumn
                        key={column.id}
                        column={column}
                        section={section}
                      >
                        {/* Column Header */}
                        <div className="flex justify-between items-center mb-4 group">
                          <div className="flex items-center justify-between w-full">
                            <h3
                              className="font-medium text-gray-700 outline-none focus:outline-none"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                setSections(
                                  sections.map((s) =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          columns: s.columns.map((c) =>
                                            c.id === column.id
                                              ? {
                                                  ...c,
                                                  title:
                                                    e.currentTarget
                                                      .textContent || c.title,
                                                }
                                              : c
                                          ),
                                        }
                                      : s
                                  )
                                );
                              }}
                            >
                              {column.title}
                            </h3>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() =>
                                  deleteColumn(section.id, column.id)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-4">
                          {column.notes.map((note) => (
                            <DraggableNote key={note.id} note={note}>
                              <div className="flex justify-between items-start">
                                <p
                                  contentEditable
                                  suppressContentEditableWarning
                                  className="text-gray-800 outline-none focus:outline-none"
                                  onBlur={(e) => {
                                    setSections(
                                      sections.map((s) =>
                                        s.id === section.id
                                          ? {
                                              ...s,
                                              columns: s.columns.map((c) =>
                                                c.id === column.id
                                                  ? {
                                                      ...c,
                                                      notes: c.notes.map((n) =>
                                                        n.id === note.id
                                                          ? {
                                                              ...n,
                                                              content:
                                                                e.currentTarget
                                                                  .textContent ||
                                                                "",
                                                            }
                                                          : n
                                                      ),
                                                    }
                                                  : c
                                              ),
                                            }
                                          : s
                                      )
                                    );
                                  }}
                                >
                                  {note.content}
                                </p>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 h-4 w-4 p-0"
                                    onClick={() =>
                                      deleteNote(section.id, column.id, note.id)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </DraggableNote>
                          ))}
                        </div>

                        {/* Add Note Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-4"
                          onClick={() => addNote(section.id, column.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </DroppableColumn>
                    </DraggableColumn>
                  ))}

                  {/* Add Column Button */}
                  <Button
                    variant="outline"
                    className="flex-none w-80 h-12"
                    onClick={() => addColumn(section.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Drag Overlay */}
          <DragOverlay>
            {activeNote ? (
              <div className="bg-[#fff9e6] rounded-lg p-4 w-72 shadow-lg">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800">{activeNote.content}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>

          {/* Add Section Button */}
          <Button
            variant="outline"
            size="lg"
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
            onClick={addSection}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </DndContext>
    </div>
  );
};

export default TodoListInterface;
