'use client'

import React, { useState } from 'react'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import subjectsData from '../data/subjects.json'

type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'review_required'

interface SubTopic {
  title: string
  status: NodeStatus
}

interface Chapter {
  id: string
  title: string
  status: NodeStatus
  progress: number
  subtopics: {
    current?: string[]
    future_expansion?: string[]
  }
}

interface Book {
  name: string
  chapters: Chapter[]
}

interface Subject {
  level: string
  books: Book[]
  metadata: {
    total_chapters: number
    completed_chapters: number
    in_progress_chapters: number
    not_started_chapters: number
    overall_progress: number
  }
}

const statusColors: Record<NodeStatus, string> = {
  'not_started': 'bg-gray-500',
  'in_progress': 'bg-blue-500',
  'completed': 'bg-green-500',
  'review_required': 'bg-yellow-500'
}

interface TreeNodeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
  depth: number
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const [status, setStatus] = useState<NodeStatus>(node.status || 'not_started')

  const handleStatusChange = (newStatus: NodeStatus) => {
    setStatus(newStatus)
    // Here you would typically update the status in your backend or state management system
  }

  return (
    <div className={`ml-${depth * 4}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className={`flex items-center cursor-pointer p-2 rounded ${statusColors[status]}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {node.children && (
              <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
            )}
            <span>{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => handleStatusChange('not_started')}>Not Started</ContextMenuItem>
          <ContextMenuItem onSelect={() => handleStatusChange('in_progress')}>In Progress</ContextMenuItem>
          <ContextMenuItem onSelect={() => handleStatusChange('completed')}>Completed</ContextMenuItem>
          <ContextMenuItem onSelect={() => handleStatusChange('review_required')}>Review Required</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isExpanded && node.children && (
        <div className="ml-4">
          {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
          {node.children.map((child: any, index: number) => (
            <TreeNode key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const convertDataToTreeStructure = (subject: Subject) => {
  return {
    name: subject.level,
    children: subject.books.map(book => ({
      name: book.name,
      children: book.chapters.map(chapter => ({
        name: chapter.title,
        status: chapter.status,
        children: [
          //...(chapter.subtopics.current || []).map(topic => ({ name: topic })),
          //...(chapter.subtopics.future_expansion || []).map(topic => ({ name: topic }))
        ]
      }))
    }))
  }
}

interface FocusBeamProps {
  subjectName: string
}

const FocusBeam: React.FC<FocusBeamProps> = ({ subjectName }) => {
  const subject = subjectsData.subjects[subjectName as keyof typeof subjectsData.subjects]

  if (!subject) {
    return <div>Subject not found</div>
  }

  const treeData = convertDataToTreeStructure(subject)

  return (
    <div className="overflow-auto h-full">
      <TreeNode node={treeData} depth={0} />
    </div>
  )
}

export default FocusBeam

