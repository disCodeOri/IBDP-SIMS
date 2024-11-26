// FocusBeam.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  FocusIcon,
  ClockIcon 
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import subjectsData from '@/data/subjects.json'


// Enhanced Types
interface SubtopicData {
  future_expansion?: string[]
}

interface ChapterData {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  current_focus?: boolean
  covered?: boolean
  review_required?: boolean
  last_covered_date?: string
  subtopics?: SubtopicData
}

interface BookData {
  name: string
  chapters: ChapterData[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SubjectData {
  level: string
  books: BookData[]
}

// Status color and text mapping
const STATUS_COLORS = {
  'not_started': 'bg-red-100 text-red-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800'
}

const PROGRESS_OPTIONS = [
  { label: 'Not Started', value: 'not_started', progress: 0 },
  { label: 'In Progress', value: 'in_progress', progress: 50 },
  { label: 'Completed', value: 'completed', progress: 100 }
]

const FocusBeamTabbedTreeView: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<{[key: string]: boolean}>({})
  const [subjects, setSubjects] = useState(subjectsData.subjects)
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, chapterId: string, subjectName: string} | null>(null)
  const [progressDropdown, setProgressDropdown] = useState(false)

  // Close context menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      setContextMenu(null)
      setProgressDropdown(false)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }))
  }

  // Update current focus across all subjects
  const updateCurrentFocus = (subjectName: string, chapterId: string) => {
    const updatedSubjects = { ...subjects }
    
    // Reset current focus for all chapters across all subjects
    Object.keys(updatedSubjects).forEach(subject => {
      updatedSubjects[subject].books.forEach(book => {
        book.chapters.forEach(chapter => {
          delete chapter.current_focus
        })
      })
    })

    // Set current focus for selected chapter
    const targetSubject = updatedSubjects[subjectName]
    targetSubject.books.forEach(book => {
      const chapter = book.chapters.find(ch => ch.id === chapterId)
      if (chapter) {
        chapter.current_focus = true
      }
    })

    setSubjects(updatedSubjects)
  }

  // Render context menu
  const renderContextMenu = (chapter: ChapterData, subjectName: string) => {
    if (!contextMenu) return null

    return (
      <div 
        className="fixed bg-gray-800 text-green-400 shadow-lg rounded p-2 z-50 w-64"
        style={{
          top: contextMenu.y,
          left: contextMenu.x
        }}
      >
        {/* Progress Status Submenu */}
        <div 
          className="cursor-pointer hover:bg-gray-700 p-1 relative"
          onClick={() => setProgressDropdown(!progressDropdown)}
        >
          Change Progress Status {progressDropdown ? '▼' : '►'}
          
          {progressDropdown && (
            <div className="absolute left-full top-0 bg-gray-800 rounded shadow-lg">
              {PROGRESS_OPTIONS.map(option => (
                <div 
                  key={option.value}
                  className="px-2 py-1 hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    const updatedSubjects = { ...subjects }
                    const targetSubject = updatedSubjects[subjectName]
                    
                    targetSubject.books.forEach(book => {
                      const chapterToUpdate = book.chapters.find(ch => ch.id === chapter.id)
                      if (chapterToUpdate) {
                        chapterToUpdate.status = option.value as any
                        chapterToUpdate.progress = option.progress
                      }
                    })

                    setSubjects(updatedSubjects)
                    setContextMenu(null)
                    setProgressDropdown(false)
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Covered Status Submenu */}
        <div 
          className="cursor-pointer hover:bg-gray-700 p-1"
          onClick={() => {
            const updatedSubjects = { ...subjects }
            const targetSubject = updatedSubjects[subjectName]
            
            targetSubject.books.forEach(book => {
              const chapterToUpdate = book.chapters.find(ch => ch.id === chapter.id)
              if (chapterToUpdate) {
                chapterToUpdate.covered = !chapterToUpdate.covered
                chapterToUpdate.last_covered_date = chapterToUpdate.covered ? new Date().toISOString() : undefined
              }
            })

            setSubjects(updatedSubjects)
            setContextMenu(null)
          }}
        >
          {chapter.covered ? 'Mark Not Covered' : 'Mark Covered'}
        </div>

        {/* Review Required Toggle */}
        <div 
          className="cursor-pointer hover:bg-gray-700 p-1"
          onClick={() => {
            const updatedSubjects = { ...subjects }
            const targetSubject = updatedSubjects[subjectName]
            
            targetSubject.books.forEach(book => {
              const chapterToUpdate = book.chapters.find(ch => ch.id === chapter.id)
              if (chapterToUpdate) {
                chapterToUpdate.review_required = !chapterToUpdate.review_required
              }
            })

            setSubjects(updatedSubjects)
            setContextMenu(null)
          }}
        >
          {chapter.review_required ? 'Remove Review Flag' : 'Flag for Review'}
        </div>

        {/* Current Focus Option */}
        <div 
          className="cursor-pointer hover:bg-gray-700 p-1 flex items-center"
          onClick={() => {
            updateCurrentFocus(subjectName, chapter.id)
            setContextMenu(null)
          }}
        >
          <FocusIcon className="mr-2 h-4 w-4" /> Set as Current Focus
        </div>
      </div>
    )
  }

  // Individual Chapter Row Component
  const ChapterRow: React.FC<{
    subjectName: string
    chapter: ChapterData, 
    isExpanded: boolean, 
    onToggle: () => void
  }> = ({ subjectName, chapter, isExpanded, onToggle }) => {
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault()
      setContextMenu({
        x: e.clientX, 
        y: e.clientY, 
        chapterId: chapter.id, 
        subjectName
      })
    }

    return (
      <div 
        className={`ml-4 mb-1 flex items-center ${chapter.current_focus ? 'bg-green-900/20' : ''}`}
        onContextMenu={handleContextMenu}
      >
        {/* Expansion toggle */}
        {chapter.subtopics && chapter.subtopics.future_expansion.length > 0 ? (
          <button 
            onClick={onToggle} 
            className="mr-2 text-green-600"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-6"></div>
        )}

        {/* Chapter title */}
        <div className="flex-grow flex items-center">
          {chapter.title}
          {chapter.current_focus && (
            <FocusIcon className="ml-2 h-4 w-4 text-green-500" />
          )}
          {chapter.review_required && (
            <ClockIcon className="ml-2 h-4 w-4 text-yellow-500" />
          )}
        </div>

        {/* Covered Status */}
        <div 
          className={`px-2 py-1 rounded text-xs mr-2 ${
            chapter.covered 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {chapter.covered ? 'Covered' : 'Not Covered'}
        </div>

        {/* Status indicator */}
        <div 
          className={`px-2 py-1 rounded text-xs mr-2 ${STATUS_COLORS[chapter.status]}`}
        >
          {chapter.status.replace('_', ' ')}
        </div>

        {/* Progress indicator */}
        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{width: `${chapter.progress}%`}}
          ></div>
        </div>

        {/* Render context menu if active */}
        {contextMenu?.chapterId === chapter.id && 
         renderContextMenu(chapter, subjectName)}

        {/* Subtopics expansion */}
        {isExpanded && chapter.subtopics && chapter.subtopics.future_expansion.length > 0 && (
          <div className="ml-8 text-sm text-gray-500">
            {chapter.subtopics.future_expansion.map((subtopic, index) => (
              <div key={index} className="mb-1">
                {subtopic}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg text-green-400">
      <h2 className="text-2xl font-bold mb-4 text-green-500">Focus Beam Tree View</h2>
      <Tabs defaultValue={Object.keys(subjects)[0]} className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-4 bg-gray-800">
          {Object.keys(subjects).map(subjectName => (
            <TabsTrigger 
              key={subjectName} 
              value={subjectName}
              className="text-green-300 data-[state=active]:bg-green-900"
            >
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
                    <ChapterRow 
                      key={chapter.id} 
                      subjectName={subjectName}
                      chapter={chapter} 
                      isExpanded={!!expandedNodes[chapter.id]}
                      onToggle={() => toggleNode(chapter.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default FocusBeamTabbedTreeView