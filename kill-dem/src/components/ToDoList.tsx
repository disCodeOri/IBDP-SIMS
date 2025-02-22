"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Plus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
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
import { BackButton } from "@/components/ui/custom-ui/back-button";

// ─── DATA STRUCTURES───

interface Note {
  id: string;
  content: string;
  checked: boolean;
  // Each note can have nested subtasks.
  subtasks?: Note[];
}

interface Column {
  id: string;
  title: string;
  notes: Note[];
  isEditing?: boolean;
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
  type: "note" | "column" | "subtask";
  sectionId: string;
  columnId?: string;
  noteId?: string;
  // For subtasks:
  parentNoteId?: string;
  subtaskId?: string;
}

interface ToDoListProps {
  hideBackButton?: boolean;
  isDashboard?: boolean;
}

// DRAGGABLE/DROPPABLECOMPONENTS

// Columns
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
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
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
    data: { type: "column", sectionId: section.id, columnId: column.id },
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

// Main notes (tasks)
const DraggableNote = ({
  note,
  children,
}: {
  note: Note;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: note.id,
    data: { type: "note", noteId: note.id },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[#fff9e6] rounded-lg p-4 cursor-move group"
    >
      {children}
    </div>
  );
};

// Subtasks – similar to DraggableNote but with extra drag data.
const DraggableSubtask = ({
  subtask,
  sectionId,
  columnId,
  parentNoteId,
  children,
}: {
  subtask: Note;
  sectionId: string;
  columnId: string;
  parentNoteId: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `subtask-${subtask.id}`,
    data: {
      type: "subtask",
      sectionId,
      columnId,
      parentNoteId,
      subtaskId: subtask.id,
    },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[#e6f7ff] rounded-lg p-2 cursor-move group"
    >
      {children}
    </div>
  );
};

const DroppableSubtaskContainer = ({
  parentNoteId,
  columnId,
  children,
}: {
  parentNoteId: string;
  columnId: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-subtasks-${parentNoteId}`,
    data: { type: "subtask-container", parentNoteId, columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`ml-4 mt-2 p-2 rounded-lg ${isOver ? "bg-blue-50" : ""}`}
    >
      {children}
    </div>
  );
};

// ─── THE MAIN COMPONENT

// Update the component definition to accept props
const ToDoList = ({
  hideBackButton = false,
  isDashboard = false,
}: ToDoListProps) => {
  // User authentication state
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<{
    type: "note" | "subtask" | "column";
    item: Note | Column;
    extraData?: any;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ─── FETCH / SYNC DATA ───────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    const fetchTodoListData = async () => {
      try {
        const userDocRef = doc(db, "users", user.id);
        const todoListRef = doc(collection(userDocRef, "todoList"), "data");
        const todoListDoc = await getDoc(todoListRef);
        if (todoListDoc.exists()) {
          const data = todoListDoc.data();
          const processSections = (sections: Section[]) =>
            sections.map((section) => ({
              ...section,
              columns: section.columns.map((column) => ({
                ...column,
                notes: column.notes.map((note) => ({
                  ...note,
                  checked:
                    note.hasOwnProperty("checked") &&
                    typeof note.checked === "boolean"
                      ? note.checked
                      : false,
                  subtasks: note.subtasks
                    ? note.subtasks.map((subtask: Note) => ({
                        ...subtask,
                        checked:
                          subtask.hasOwnProperty("checked") &&
                          typeof subtask.checked === "boolean"
                            ? subtask.checked
                            : false,
                      }))
                    : [],
                })),
              })),
            }));
          setSections(processSections(data.sections || []));
        } else {
          await setDoc(todoListRef, {
            sections: [],
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        console.error("Error fetching todoList data:", error);
      }
    };
    fetchTodoListData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timeoutId = setTimeout(async () => {
      try {
        const userDocRef = doc(db, "users", user.id);
        const todoListRef = doc(collection(userDocRef, "todoList"), "data");
        await setDoc(todoListRef, { sections, lastUpdated: new Date() });
      } catch (error) {
        console.error("Error updating data:", error);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [sections, user]);

  // ─── SECTION / COLUMN / NOTE / SUBTASK FUNCTIONS ───────────────────────

  const archiveSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
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
      sections.map((section) =>
        section.id === sectionId
          ? {
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
            }
          : section
      )
    );
  };

  const addNote = (sectionId: string, columnId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      notes: [
                        ...column.notes,
                        {
                          id: `note-${Date.now()}`,
                          content: "New note",
                          checked: false,
                          subtasks: [],
                          isEditing: true,
                        },
                      ],
                    }
                  : column
              ),
            }
          : section
      )
    );
  };

  const addSubtask = (
    sectionId: string,
    columnId: string,
    parentNoteId: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              columns: section.columns.map((column) =>
                column.id !== columnId
                  ? column
                  : {
                      ...column,
                      notes: column.notes.map((note) =>
                        note.id !== parentNoteId
                          ? note
                          : {
                              ...note,
                              subtasks: note.subtasks
                                ? [
                                    ...note.subtasks,
                                    {
                                      id: `subtask-${Date.now()}`,
                                      content: "New Subtask",
                                      checked: false,
                                      subtasks: [],
                                    },
                                  ]
                                : [
                                    {
                                      id: `subtask-${Date.now()}`,
                                      content: "New Subtask",
                                      checked: false,
                                      subtasks: [],
                                    },
                                  ],
                            }
                      ),
                    }
              ),
            }
      )
    );
  };

  const moveNote = (
    fromSectionId: string,
    fromColumnId: string,
    toSectionId: string,
    toColumnId: string,
    noteId: string
  ) => {
    const noteToMove = sections
      .find((s) => s.id === fromSectionId)
      ?.columns.find((c) => c.id === fromColumnId)
      ?.notes.find((n) => n.id === noteId);
    if (!noteToMove) return;
    setSections(
      sections.map((section) => {
        if (section.id === fromSectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === fromColumnId) {
                return {
                  ...column,
                  notes: column.notes.filter((note) => note.id !== noteId),
                };
              }
              if (column.id === toColumnId && fromSectionId === toSectionId) {
                return { ...column, notes: [...column.notes, noteToMove] };
              }
              return column;
            }),
          };
        }
        if (section.id === toSectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === toColumnId) {
                return { ...column, notes: [...column.notes, noteToMove] };
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

  // Move a subtask within the same parent note.
  const moveSubtaskWithinParent = (
    sectionId: string,
    columnId: string,
    parentNoteId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              notes: column.notes.map((note) => {
                if (note.id !== parentNoteId || !note.subtasks) return note;
                const newSubtasks = [...note.subtasks];
                const [moved] = newSubtasks.splice(fromIndex, 1);
                newSubtasks.splice(toIndex, 0, moved);
                return { ...note, subtasks: newSubtasks };
              }),
            };
          }),
        };
      })
    );
  };

  // Move a subtask from one parent note to another (and possibly into a different column).
  const moveSubtaskToAnotherParent = (
    sectionId: string,
    fromColumnId: string,
    fromParentNoteId: string,
    subtaskId: string,
    toParentNoteId: string,
    toColumnId: string
  ) => {
    let movedSubtask: Note | null = null;
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            // Remove the subtask from its original parent in the source column.
            if (column.id === fromColumnId) {
              return {
                ...column,
                notes: column.notes.map((note) => {
                  if (note.id === fromParentNoteId && note.subtasks) {
                    const newSubtasks = note.subtasks.filter((subtask) => {
                      if (subtask.id === subtaskId) {
                        movedSubtask = subtask;
                        return false;
                      }
                      return true;
                    });
                    return { ...note, subtasks: newSubtasks };
                  }
                  return note;
                }),
              };
            }
            // In the target column, add the subtask to the target parent.
            if (column.id === toColumnId) {
              return {
                ...column,
                notes: column.notes.map((note) => {
                  if (note.id === toParentNoteId) {
                    return {
                      ...note,
                      subtasks: note.subtasks
                        ? [...note.subtasks, movedSubtask!]
                        : [movedSubtask!],
                    };
                  }
                  return note;
                }),
              };
            }
            return column;
          }),
        };
      })
    );
  };

  const deleteSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    setSections(sections.filter((section) => section.id !== sectionId));
    toast({
      title: "Section deleted",
      description: `${section?.title || "Section"} has been deleted.`,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            if (section) setSections((prev) => [...prev, section]);
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const deleteColumn = (sectionId: string, columnId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const column = section?.columns.find((c) => c.id === columnId);
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.filter((col) => col.id !== columnId),
            }
          : section
      )
    );
    toast({
      title: "Column deleted",
      description: `${column?.title || "Column"} has been deleted.`,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            if (column) {
              setSections((prev) =>
                prev.map((s) =>
                  s.id === sectionId
                    ? { ...s, columns: [...s.columns, column] }
                    : s
                )
              );
            }
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const deleteNote = (sectionId: string, columnId: string, noteId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const note = section?.columns
      .find((c) => c.id === columnId)
      ?.notes.find((n) => n.id === noteId);
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      notes: col.notes.filter((note) => note.id !== noteId),
                    }
                  : col
              ),
            }
          : section
      )
    );
    toast({
      title: "Note deleted",
      description: `${note?.content || "Note"} has been deleted.`,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            if (note) {
              setSections((prev) =>
                prev.map((s) =>
                  s.id === sectionId
                    ? {
                        ...s,
                        columns: s.columns.map((c) =>
                          c.id === columnId
                            ? { ...c, notes: [...c.notes, note] }
                            : c
                        ),
                      }
                    : s
                )
              );
            }
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const deleteSubtask = (
    sectionId: string,
    columnId: string,
    parentNoteId: string,
    subtaskId: string
  ) => {
    let deletedSubtask: Note | undefined;
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              notes: column.notes.map((note) => {
                if (note.id !== parentNoteId) return note;
                const newSubtasks = note.subtasks?.filter((subtask) => {
                  if (subtask.id === subtaskId) {
                    deletedSubtask = subtask;
                    return false;
                  }
                  return true;
                });
                return {
                  ...note,
                  subtasks: newSubtasks,
                };
              }),
            };
          }),
        };
      })
    );

    toast({
      title: "Subtask deleted",
      description: `${deletedSubtask?.content || "Subtask"} has been deleted.`,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            if (deletedSubtask) {
              setSections((prev) =>
                prev.map((s) =>
                  s.id === sectionId
                    ? {
                        ...s,
                        columns: s.columns.map((c) =>
                          c.id === columnId
                            ? {
                                ...c,
                                notes: c.notes.map((n) =>
                                  n.id === parentNoteId
                                    ? {
                                        ...n,
                                        subtasks: [
                                          ...(n.subtasks || []),
                                          deletedSubtask!,
                                        ],
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
            }
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const toggleNoteChecked = (
    sectionId: string,
    columnId: string,
    noteId: string
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      notes: col.notes.map((note) =>
                        note.id === noteId
                          ? { ...note, checked: !note.checked }
                          : note
                      ),
                    }
                  : col
              ),
            }
          : section
      )
    );
  };

  const toggleSubtaskChecked = (
    sectionId: string,
    columnId: string,
    parentNoteId: string,
    subtaskId: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((col) => {
            if (col.id !== columnId) return col;
            return {
              ...col,
              notes: col.notes.map((note) => {
                if (note.id !== parentNoteId) return note;
                return {
                  ...note,
                  subtasks: note.subtasks?.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, checked: !subtask.checked }
                      : subtask
                  ),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const updateSubtaskContent = (
    sectionId: string,
    columnId: string,
    parentNoteId: string,
    subtaskId: string,
    newContent: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((col) => {
            if (col.id !== columnId) return col;
            return {
              ...col,
              notes: col.notes.map((note) => {
                if (note.id !== parentNoteId) return note;
                return {
                  ...note,
                  subtasks: note.subtasks?.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, content: newContent }
                      : subtask
                  ),
                };
              }),
            };
          }),
        };
      })
    );
  };

  // DRAG & DROP HANDLERS

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current as DragData;
    if (activeData.type === "note") {
      const noteId = active.id as string;
      const draggedNote = sections
        .flatMap((section) =>
          section.columns.flatMap((col) =>
            col.notes.find((note) => note.id === noteId)
          )
        )
        .find(Boolean);
      if (draggedNote) setActiveDragItem({ type: "note", item: draggedNote });
    } else if (activeData.type === "subtask") {
      const subtaskId = activeData.subtaskId;
      let draggedSubtask: Note | undefined;
      sections.forEach((section) => {
        section.columns.forEach((col) => {
          col.notes.forEach((note) => {
            if (note.subtasks) {
              const found = note.subtasks.find((sub) => sub.id === subtaskId);
              if (found) draggedSubtask = found;
            }
          });
        });
      });
      if (draggedSubtask)
        setActiveDragItem({
          type: "subtask",
          item: draggedSubtask,
          extraData: { parentNoteId: activeData.parentNoteId },
        });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;
    const activeData = active.data.current as DragData;
    const overData = over.data.current as any;

    // ── COLUMN DRAGGING ──
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
      if (fromIndex !== toIndex) moveColumn(sectionId, fromIndex, toIndex);
      return;
    }

    // ── NOTE DRAGGING ──
    if (activeData.type === "note") {
      if (!overData || !overData.columnId) return;
      let fromSectionId = "",
        fromColumnId = "";
      sections.some((section) => {
        return section.columns.some((col) => {
          const found = col.notes.some((note) => note.id === active.id);
          if (found) {
            fromSectionId = section.id;
            fromColumnId = col.id;
            return true;
          }
          return false;
        });
      });
      const toSectionId = overData.sectionId;
      const toColumnId = overData.columnId;
      if (fromSectionId && fromColumnId && toSectionId && toColumnId) {
        moveNote(
          fromSectionId,
          fromColumnId,
          toSectionId,
          toColumnId,
          active.id as string
        );
      }
    }

    // ── SUBTASK DRAGGING ──
    if (activeData.type === "subtask") {
      if (!overData || !activeData.columnId) return;
      if (overData.type === "subtask-container") {
        // Retrieve the target parent note and target column from the droppable.
        const toParentNoteId = overData.parentNoteId;
        const toColumnId = overData.columnId;
        const { sectionId, columnId, parentNoteId, subtaskId } = activeData;
        if (
          !sectionId ||
          !columnId ||
          !parentNoteId ||
          !subtaskId ||
          !toColumnId
        )
          return;

        if (parentNoteId === toParentNoteId && columnId === toColumnId) {
          // Reordering within the same parent note.
          let fromIndex = -1,
            toIndex = -1;
          sections.forEach((section) => {
            if (section.id === sectionId) {
              section.columns.forEach((col) => {
                if (col.id === columnId) {
                  col.notes.forEach((note) => {
                    if (note.id === parentNoteId && note.subtasks) {
                      fromIndex = note.subtasks.findIndex(
                        (s) => s.id === subtaskId
                      );
                      if (over.id.toString().startsWith("subtask-")) {
                        const hoveredSubtaskId = over.id
                          .toString()
                          .replace("subtask-", "");
                        toIndex = note.subtasks.findIndex(
                          (s) => s.id === hoveredSubtaskId
                        );
                      } else {
                        toIndex = note.subtasks.length;
                      }
                    }
                  });
                }
              });
            }
          });
          if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            moveSubtaskWithinParent(
              sectionId,
              columnId,
              parentNoteId,
              fromIndex,
              toIndex
            );
          }
        } else {
          moveSubtaskToAnotherParent(
            sectionId,
            columnId,
            parentNoteId,
            subtaskId,
            toParentNoteId,
            toColumnId
          );
        }
      }
    }
  };

  // RENDERING

  return (
    <div className="flex flex-col h-full">
      {" "}
      {/* Changed from h-screen to h-full */}
      <header className="flex items-center justify-between p-4 border-b">
        {!hideBackButton && <BackButton />}
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
            {/* (Optional archived sections UI) */}
          </SheetContent>
        </Sheet>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`max-w-none bg-white flex-1 relative ${
            isDashboard ? "pb-24" : "pb-20"
          }`}
        >
          {sections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-100 mb-8 overflow-x-auto"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-white group">
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
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => archiveSection(section.id)}
                  >
                    Archive
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                        <div className="flex justify-between items-center mb-4 group">
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
                                                  e.currentTarget.textContent ||
                                                  c.title,
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
                              onClick={() =>
                                deleteColumn(section.id, column.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {column.notes.map((note) => (
                            <DraggableNote key={note.id} note={note}>
                              <div className="flex flex-col">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={note.checked}
                                      onChange={() =>
                                        toggleNoteChecked(
                                          section.id,
                                          column.id,
                                          note.id
                                        )
                                      }
                                      className="mt-1 h-4 w-4"
                                    />
                                    <p
                                      contentEditable
                                      suppressContentEditableWarning
                                      className={`text-gray-800 outline-none focus:outline-none flex-1 ${
                                        note.checked
                                          ? "line-through opacity-75"
                                          : ""
                                      }`}
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
                                                          notes: c.notes.map(
                                                            (n) =>
                                                              n.id === note.id
                                                                ? {
                                                                    ...n,
                                                                    content:
                                                                      e
                                                                        .currentTarget
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
                                  </div>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        deleteNote(
                                          section.id,
                                          column.id,
                                          note.id
                                        )
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {/* ─── SUBTASKS RENDERING ─── */}
                                <DroppableSubtaskContainer
                                  parentNoteId={note.id}
                                  columnId={column.id}
                                >
                                  {note.subtasks &&
                                    note.subtasks.map((subtask) => (
                                      <DraggableSubtask
                                        key={subtask.id}
                                        subtask={subtask}
                                        sectionId={section.id}
                                        columnId={column.id}
                                        parentNoteId={note.id}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-2 flex-1">
                                            <input
                                              type="checkbox"
                                              checked={subtask.checked}
                                              onChange={() =>
                                                toggleSubtaskChecked(
                                                  section.id,
                                                  column.id,
                                                  note.id,
                                                  subtask.id
                                                )
                                              }
                                              className="mt-1 h-4 w-4"
                                            />
                                            <p
                                              contentEditable
                                              suppressContentEditableWarning
                                              className={`text-gray-800 outline-none focus:outline-none flex-1 ${
                                                subtask.checked
                                                  ? "line-through opacity-75"
                                                  : ""
                                              }`}
                                              onBlur={(e) => {
                                                updateSubtaskContent(
                                                  section.id,
                                                  column.id,
                                                  note.id,
                                                  subtask.id,
                                                  e.currentTarget.textContent ||
                                                    ""
                                                );
                                              }}
                                            >
                                              {subtask.content}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              deleteSubtask(
                                                section.id,
                                                column.id,
                                                note.id,
                                                subtask.id
                                              )
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </DraggableSubtask>
                                    ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() =>
                                      addSubtask(section.id, column.id, note.id)
                                    }
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Subtask
                                  </Button>
                                </DroppableSubtaskContainer>
                              </div>
                            </DraggableNote>
                          ))}
                        </div>
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
          <DragOverlay>
            {activeDragItem ? (
              <div className="bg-[#fff9e6] rounded-lg p-4 w-72 shadow-lg">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800">
                    {"content" in activeDragItem.item
                      ? activeDragItem.item.content
                      : ""}
                  </p>
                </div>
              </div>
            ) : null}
          </DragOverlay>

          <Button
            variant="outline"
            size="lg"
            className={`${
              isDashboard
                ? "absolute bottom-4 left-1/2 transform -translate-x-1/2"
                : "fixed bottom-8 left-1/2 transform -translate-x-1/2"
            }`}
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

export default ToDoList;
