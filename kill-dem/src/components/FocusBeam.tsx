'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FocusIcon, ClockIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import subjectsData from '@/data/subjects.json';
import { useEbbinghaus } from '@/components/contexts/EbbinghausContext';

interface SubtopicData {
  future_expansion?: string[];
}

interface ChapterData {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  current_focus?: boolean;
  covered?: boolean;
  review_required?: boolean;
  last_covered_date?: string;
  subtopics?: SubtopicData;
}

interface BookData {
  name: string;
  chapters: ChapterData[];
}

interface SubjectData {
  level: string;
  books: BookData[];
}


interface Subjects {
    [key: string]: SubjectData;
}

const STATUS_COLORS = {
  not_started: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

const PROGRESS_OPTIONS = [
  { label: 'Not Started', value: 'not_started', progress: 0 },
  { label: 'In Progress', value: 'in_progress', progress: 50 },
  { label: 'Completed', value: 'completed', progress: 100 },
];

const FocusBeamTabbedTreeView: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});
  const [subjects, setSubjects] = useState<Subjects>(subjectsData.subjects);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chapterId: string; subjectName: string } | null>(null);
  const [progressDropdown, setProgressDropdown] = useState(false);
  const { updateReviewDates } = useEbbinghaus();

  useEffect(() => {
    const handleScroll = () => {
      setContextMenu(null);
      setProgressDropdown(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const markChapterCovered = async (subjectName: string, chapterId: string, coveredStatus: boolean) => {
    const updatedSubjects = { ...subjects };
    const targetSubject = updatedSubjects[subjectName];

    if (targetSubject) {
      targetSubject.books.forEach((book) => {
        const chapterToUpdate = book.chapters.find((ch) => ch.id === chapterId);
        if (chapterToUpdate) {
          chapterToUpdate.covered = coveredStatus;
          chapterToUpdate.last_covered_date = coveredStatus ? new Date().toISOString() : undefined;
        }
      });
      setSubjects(updatedSubjects);
      await updateReviewDates();
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const updateCurrentFocus = (subjectName: string, chapterId: string) => {
    const updatedSubjects = { ...subjects };

    Object.values(updatedSubjects).forEach((subject) => {
      subject.books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          delete chapter.current_focus;
        });
      });
    });

    const targetSubject = updatedSubjects[subjectName];

    if (targetSubject) {
      targetSubject.books.forEach((book) => {
        const chapter = book.chapters.find((ch) => ch.id === chapterId);
        if (chapter) {
          chapter.current_focus = true;
        }
      });
      setSubjects(updatedSubjects);
    }
  };

  const renderContextMenu = (chapter: ChapterData, subjectName: string) => {
    if (!contextMenu) return null;

    const handleStatusChange = (option: { value: string; progress: number }) => {
      const updatedSubjects = { ...subjects };
      const targetSubject = updatedSubjects[subjectName];

      if (targetSubject) {
        targetSubject.books.forEach((book) => {
          const chapterToUpdate = book.chapters.find((ch) => ch.id === chapter.id);
          if (chapterToUpdate) {
            chapterToUpdate.status = option.value as ChapterData['status'];
            chapterToUpdate.progress = option.progress;
          }
        });
        setSubjects(updatedSubjects);
      }

    };

    return (
      <div className="fixed bg-gray-800 text-green-400 shadow-lg rounded p-2 z-50 w-64" style={{ top: contextMenu.y, left: contextMenu.x }}>
        <div className="cursor-pointer hover:bg-gray-700 p-1 relative" onClick={() => setProgressDropdown(!progressDropdown)}>
          Change Progress Status {progressDropdown ? '▼' : '►'}
          {progressDropdown && (
            <div className="absolute left-full top-0 bg-gray-800 rounded shadow-lg">
              {PROGRESS_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="px-2 py-1 hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(option);
                    setContextMenu(null);
                    setProgressDropdown(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className="cursor-pointer hover:bg-gray-700 p-1"
          onClick={async () => {
            await markChapterCovered(subjectName, chapter.id, !chapter.covered);
            setContextMenu(null);
          }}
        >
          {chapter.covered ? 'Mark Not Covered' : 'Mark Covered'}
        </div>
        <div
          className="cursor-pointer hover:bg-gray-700 p-1"
          onClick={() => {
            const updatedSubjects = { ...subjects };
            const targetSubject = updatedSubjects[subjectName];
              if (targetSubject) {
                targetSubject.books.forEach((book) => {
                  const chapterToUpdate = book.chapters.find((ch) => ch.id === chapter.id);
                  if (chapterToUpdate) {
                    chapterToUpdate.review_required = !chapterToUpdate.review_required;
                  }
                });
                setSubjects(updatedSubjects);
              }
            setContextMenu(null);
          }}
        >
          {chapter.review_required ? 'Remove Review Flag' : 'Flag for Review'}
        </div>
        <div className="cursor-pointer hover:bg-gray-700 p-1 flex items-center" onClick={() => { updateCurrentFocus(subjectName, chapter.id); setContextMenu(null); }}>
          <FocusIcon className="mr-2 h-4 w-4" /> Set as Current Focus
        </div>
      </div>
    );
  };

  const ChapterRow: React.FC<{
    subjectName: string;
    chapter: ChapterData;
    isExpanded: boolean;
    onToggle: () => void;
  }> = ({ subjectName, chapter, isExpanded, onToggle }) => {
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, chapterId: chapter.id, subjectName });
    };

    return (
<div className={`ml-4 mb-1 flex items-center ${chapter.current_focus ? 'bg-green-900/20' : ''}`} onContextMenu={handleContextMenu}>
        {chapter.subtopics && chapter.subtopics.future_expansion && chapter.subtopics.future_expansion.length > 0 ? (
          <button onClick={onToggle} className="mr-2 text-green-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-6"></div>
        )}
        <div className="flex-grow flex items-center">
          {chapter.title}
          {chapter.current_focus && <FocusIcon className="ml-2 h-4 w-4 text-green-500" />}
          {chapter.review_required && <ClockIcon className="ml-2 h-4 w-4 text-yellow-500" />}
        </div>
        <div className={`px-2 py-1 rounded text-xs mr-2 ${chapter.covered ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {chapter.covered ? 'Covered' : 'Not Covered'}
        </div>
        <div className={`px-2 py-1 rounded text-xs mr-2 ${STATUS_COLORS[chapter.status]}`}>{chapter.status.replace('_', ' ')}</div>
        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${chapter.progress}%` }}></div>
        </div>
        {contextMenu?.chapterId === chapter.id && renderContextMenu(chapter, subjectName)}
        {isExpanded && chapter.subtopics && chapter.subtopics.future_expansion && (
          <div className="ml-8 text-sm text-gray-500">
            {chapter.subtopics.future_expansion.map((subtopic, index) => (
              <div key={index} className="mb-1">
                {subtopic}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg text-green-400">
      <h2 className="text-2xl font-bold mb-4 text-green-500">Focus Beam Tree View</h2>
      <Tabs defaultValue={Object.keys(subjects)[0]} className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-4 bg-gray-800">
          {Object.keys(subjects).map((subjectName) => (
            <TabsTrigger key={subjectName} value={subjectName} className="text-green-300 data-[state=active]:bg-green-900">
              {subjectName}
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(subjects).map(([subjectName, subjectData]) => (
          <TabsContent key={subjectName} value={subjectName}>
            <div className="bg-gray-800 p-4 rounded">
              <div className="font-bold text-lg mb-2 text-green-600">
                {subjectName} ({subjectData.level})
              </div>
              {subjectData.books.map((book, bookIndex) => (
                <div key={`${subjectName}-book-${bookIndex}`} className="ml-4">
                  <div className="font-semibold text-md mb-1 text-green-500">
                    {book.name}
                  </div>
                  {book.chapters.map((chapter) => (
                    <ChapterRow key={chapter.id} subjectName={subjectName} chapter={chapter} isExpanded={!!expandedNodes[chapter.id]} onToggle={() => toggleNode(chapter.id)} />
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FocusBeamTabbedTreeView;