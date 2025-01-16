"use client";

import React, { useState } from 'react';
import { Archive, Plus, GripHorizontal, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  content: string;
  timestamp: string;
  isEditing: boolean;
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
  timestamp: string;
  columns: Column[];
  isEditing: boolean;
}

const KanbanInterface = () => {
  const [sections, setSections] = useState<Section[]>([{
    id: '1',
    title: 'How to onboard a user',
    timestamp: new Date().toLocaleString(),
    isEditing: false,
    columns: [{
      id: 'col1',
      title: 'Ideas',
      isEditing: false,
      notes: [{
        id: 'note1',
        content: 'We need an easy way to ease the user into how to use globe',
        timestamp: new Date().toLocaleString(),
        isEditing: false
      }]
    }]
  }]);

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'New Section',
      timestamp: new Date().toLocaleString(),
      isEditing: true,
      columns: [{
        id: `col-${Date.now()}`,
        title: 'New Column',
        isEditing: false,
        notes: []
      }]
    };
    setSections([...sections, newSection]);
  };

  const addColumn = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          columns: [...section.columns, {
            id: `col-${Date.now()}`,
            title: 'New Column',
            isEditing: true,
            notes: []
          }]
        };
      }
      return section;
    }));
  };

  const addNote = (sectionId: string, columnId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          columns: section.columns.map(column => {
            if (column.id === columnId) {
              return {
                ...column,
                notes: [...column.notes, {
                  id: `note-${Date.now()}`,
                  content: 'New note',
                  timestamp: new Date().toLocaleString(),
                  isEditing: true
                }]
              };
            }
            return column;
          })
        };
      }
      return section;
    }));
  };

  const moveNote = (
    fromSectionId: string,
    fromColumnId: string,
    toSectionId: string,
    toColumnId: string,
    noteId: string
  ) => {
    setSections(sections.map(section => {
      const isFromSection = section.id === fromSectionId;
      const isToSection = section.id === toSectionId;
      
      if (!isFromSection && !isToSection) return section;

      if (isFromSection) {
        const noteToMove = section.columns
          .find(col => col.id === fromColumnId)
          ?.notes.find(note => note.id === noteId);

        return {
          ...section,
          columns: section.columns.map(column => {
            if (column.id === fromColumnId) {
              return {
                ...column,
                notes: column.notes.filter(note => note.id !== noteId)
              };
            }
            if (column.id === toColumnId && fromSectionId === toSectionId) {
              return {
                ...column,
                notes: [...column.notes, noteToMove!]
              };
            }
            return column;
          })
        };
      }

      if (isToSection && fromSectionId !== toSectionId) {
        const noteToMove = sections
          .find(s => s.id === fromSectionId)
          ?.columns.find(col => col.id === fromColumnId)
          ?.notes.find(note => note.id === noteId);

        return {
          ...section,
          columns: section.columns.map(column => {
            if (column.id === toColumnId) {
              return {
                ...column,
                notes: [...column.notes, noteToMove!]
              };
            }
            return column;
          })
        };
      }

      return section;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen pb-20">
      {sections.map((section) => (
        <div key={section.id} className="border-b border-gray-100 mb-8">
          {/* Section Header */}
          <div className="flex justify-between items-center px-4 py-2 bg-white">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{section.timestamp}</span>
              {section.isEditing ? (
                <Input
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s => 
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  onBlur={() => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, isEditing: false } : s
                    ));
                  }}
                  className="w-48"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-medium">{section.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSections(sections.map(s =>
                        s.id === section.id ? { ...s, isEditing: true } : s
                      ));
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500">
              Archive
            </Button>
          </div>

          {/* Kanban Board */}
          <div className="px-4 py-2 overflow-x-auto">
            <div className="flex space-x-4 min-h-[200px] pb-4">
              {section.columns.map((column) => (
                <div
                  key={column.id}
                  className="flex-none w-80 bg-gray-50 rounded-lg p-4"
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4">
                    {column.isEditing ? (
                      <Input
                        value={column.title}
                        onChange={(e) => {
                          setSections(sections.map(s => {
                            if (s.id === section.id) {
                              return {
                                ...s,
                                columns: s.columns.map(c =>
                                  c.id === column.id ? { ...c, title: e.target.value } : c
                                )
                              };
                            }
                            return s;
                          }));
                        }}
                        onBlur={() => {
                          setSections(sections.map(s => {
                            if (s.id === section.id) {
                              return {
                                ...s,
                                columns: s.columns.map(c =>
                                  c.id === column.id ? { ...c, isEditing: false } : c
                                )
                              };
                            }
                            return s;
                          }));
                        }}
                        className="w-full"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center space-x-2 w-full">
                        <h3 className="font-medium">{column.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSections(sections.map(s => {
                              if (s.id === section.id) {
                                return {
                                  ...s,
                                  columns: s.columns.map(c =>
                                    c.id === column.id ? { ...c, isEditing: true } : c
                                  )
                                };
                              }
                              return s;
                            }));
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    {column.notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-[#fff9e6] rounded-lg p-4"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('noteId', note.id);
                          e.dataTransfer.setData('fromSectionId', section.id);
                          e.dataTransfer.setData('fromColumnId', column.id);
                        }}
                      >
                        {note.isEditing ? (
                          <Textarea
                            value={note.content}
                            onChange={(e) => {
                              setSections(sections.map(s => {
                                if (s.id === section.id) {
                                  return {
                                    ...s,
                                    columns: s.columns.map(c => {
                                      if (c.id === column.id) {
                                        return {
                                          ...c,
                                          notes: c.notes.map(n =>
                                            n.id === note.id ? { ...n, content: e.target.value } : n
                                          )
                                        };
                                      }
                                      return c;
                                    })
                                  };
                                }
                                return s;
                              }));
                            }}
                            onBlur={() => {
                              setSections(sections.map(s => {
                                if (s.id === section.id) {
                                  return {
                                    ...s,
                                    columns: s.columns.map(c => {
                                      if (c.id === column.id) {
                                        return {
                                          ...c,
                                          notes: c.notes.map(n =>
                                            n.id === note.id ? { ...n, isEditing: false } : n
                                          )
                                        };
                                      }
                                      return c;
                                    })
                                  };
                                }
                                return s;
                              }));
                            }}
                            className="w-full"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="flex justify-between items-start"
                            onClick={() => {
                              setSections(sections.map(s => {
                                if (s.id === section.id) {
                                  return {
                                    ...s,
                                    columns: s.columns.map(c => {
                                      if (c.id === column.id) {
                                        return {
                                          ...c,
                                          notes: c.notes.map(n =>
                                            n.id === note.id ? { ...n, isEditing: true } : n
                                          )
                                        };
                                      }
                                      return c;
                                    })
                                  };
                                }
                                return s;
                              }));
                            }}
                          >
                            <p className="text-gray-800">{note.content}</p>
                            <GripHorizontal className="h-4 w-4 text-gray-400 cursor-move" />
                          </div>
                        )}
                      </div>
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
                </div>
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
  );
};

export default KanbanInterface;
