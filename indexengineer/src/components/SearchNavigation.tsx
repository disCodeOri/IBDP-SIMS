'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';

const pages = [
  { title: 'Scheduler', path: '/scheduler', description: 'Manage your tasks and calendar' },
  { title: 'Note Taker', path: '/notes', description: 'Take and organize your study notes' },
  { title: 'University', path: '/university', description: 'Track university applications and deadlines' },
  { title: 'Sports Tracker', path: '/sports', description: 'Monitor your triathlon, Muay Thai, and fitness progress' },
  { title: 'Mental Health', path: '/mental-health', description: 'Track your well-being and relaxation activities' },
  { title: 'Analytics', path: '/analytics', description: 'View your performance metrics and insights' }
];

const SearchNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const containerRef = useRef(null);

  const filteredPages = pages.filter(page =>
	page.title.toLowerCase().includes(query.toLowerCase()) ||
	page.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
	const handleKeyDown = (e) => {
	  if (e.key === '/' && e.target.tagName !== 'INPUT') {
		e.preventDefault();
		searchRef.current?.focus();
	  }
	  if (!isOpen) return;

	  switch(e.key) {
		case 'ArrowDown':
		  e.preventDefault();
		  setSelectedIndex(prev => 
			prev < filteredPages.length - 1 ? prev + 1 : prev
		  );
		  break;
		case 'ArrowUp':
		  e.preventDefault();
		  setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
		  break;
		case 'Enter':
		  e.preventDefault();
		  if (filteredPages[selectedIndex]) {
			window.location.href = filteredPages[selectedIndex].path;
		  }
		  break;
		case 'Escape':
		  setIsOpen(false);
		  searchRef.current?.blur();
		  break;
	  }
	};

	window.addEventListener('keydown', handleKeyDown);
	return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredPages]);

  useEffect(() => {
	const handleClickOutside = (event) => {
	  if (containerRef.current && !containerRef.current.contains(event.target)) {
		setIsOpen(false);
	  }
	};

	document.addEventListener('mousedown', handleClickOutside);
	return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
	<div className="min-h-screen flex items-center justify-center bg-gray-50">
	  <div className="w-full max-w-2xl px-4" ref={containerRef}>
		<div className="relative">
		  <div className="relative">
			<Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
			<input
			  ref={searchRef}
			  type="text"
			  placeholder="Search pages... (Press '/' to focus)"
			  value={query}
			  onChange={(e) => {
				setQuery(e.target.value);
				setIsOpen(true);
				setSelectedIndex(0);
			  }}
			  onFocus={() => setIsOpen(true)}
			  className="w-full py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		  </div>

		  {isOpen && filteredPages.length > 0 && (
			<div className="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
			  <ul className="py-2">
				{filteredPages.map((page, index) => (
				  <li
					key={page.path}
					className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
					  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
					}`}
					onMouseEnter={() => setSelectedIndex(index)}
					onClick={() => window.location.href = page.path}
				  >
					<div>
					  <h3 className="text-sm font-medium text-gray-900">
						{page.title}
					  </h3>
					  <p className="text-sm text-gray-500">
						{page.description}
					  </p>
					</div>
					{index === selectedIndex && (
					  <ArrowRight className="h-4 w-4 text-blue-500" />
					)}
				  </li>
				))}
			  </ul>
			</div>
		  )}
		</div>

		<div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
		  <span>
			<kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
			  ↑↓
			</kbd>{' '}
			to navigate
		  </span>
		  <span>
			<kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
			  enter
			</kbd>{' '}
			to select
		  </span>
		  <span>
			<kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
			  esc
			</kbd>{' '}
			to close
		  </span>
		</div>
	  </div>
	</div>
  );
};

export default SearchNavigation;