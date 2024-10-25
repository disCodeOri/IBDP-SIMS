I need you to make the entire scheduler component, there is no need for any database, for now just implement the data persistence without the database.
Here is the document containing the details about the project:

# CS IA Scheduler Application Project Handover Document

## Project Overview

This project is a CS Internal Assessment (IA) for an IBDP student. The goal is to create a robust web application that can manage various aspects of the student's life, including academics, university applications, sports, extracurricular activities, and mental health.

## Client Details

The client is an IBDP student (the developer themselves) who needs a comprehensive life management tool. The main aspects of their life to be managed are:

1. Academics
   - Studying for exam-related course content
   - Producing Internal Assessments for each subject
   - Fulfilling core components (TOK, CAS, EE)
   - Client subject include:
	 - Physics HL
	 - Computer Science HL
	 - Mathematics AA HL
	 - Economics SL
	 - English A: Language and Literature SL
	 - Spanish ab initio SL
2. University search and application writing
3. Sports (Triathlon) and Fitness (Muay Thai and Calisthenics)
4. Extracurricular activities
   - Ultra learning projects for engineering
   - Side hustle businesses
5. Mental Health
   - Self-Esteem checkups
   - Observations/thoughts note-taking
   - Relaxation activities

## Client Requirements

The application should include:
1. A "Scheduler" application with:
   - Main Scheduler component
   - Tracking component
   - Analytics component
2. A "Note-taker" application with specific environments for different subjects
3. AI component

### Scheduler Requirements

- Use spaced repetition for learning
- Include an AI component for enhanced scheduling
- Allow input of specific task requirements
  - Customizable Task Entries:
	- The Scheduler will allow the user to input specific task details, such as upcoming exams. Users can enter syllabus details and specific concepts they need to study. These details can either be pulled from the existing Note-Taker database or manually entered by the user. The system will allow the user to override existing data if necessary to ensure accuracy.
- Process new requirements and track performance
- Display analytics on login
- Retrieve and manipulate Google Calendar events
- Password protection

## Project Structure

The project is a Next.js application with TypeScript and TailwindCSS. Here's the current file structure:

```

IBDP-SIMS/
└── indexengineer/
	└── src/
		├── app/
		│   ├── layout.tsx
		│   ├── page.tsx
		│   ├── fonts/
		│   │   ├── GeistMonoVF.woff
		│   │   └── GeistVF.woff
		│   └── scheduler/
		│       └── page.tsx
		├── components/
		│   ├── ui/
		│   ├── CommandProvider.tsx
		│   ├── SearchContent.tsx
		│   └── SearchNavigation.tsx
		└── lib/
			└── utils.ts
```

## Project Setup

The project was set up using create-next-app with the following options:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Import alias: No

## Technical Stack

- Frontend: Next.js 14 with TypeScript
- Styling: TailwindCSS
- State Management: React hooks (useState, useEffect)
- Data Persistence: Local Storage (currently), planned migration to PostgreSQL
- Deployment: Not specified yet

#Contents of combined_output.txt:

/indexengineer/src/app/global.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
	text-wrap: balance;
  }
}

@layer base {
  :root {
	--background: 0 0% 100%;
	--foreground: 222.2 84% 4.9%;
	--card: 0 0% 100%;
	--card-foreground: 222.2 84% 4.9%;
	--popover: 0 0% 100%;
	--popover-foreground: 222.2 84% 4.9%;
	--primary: 222.2 47.4% 11.2%;
	--primary-foreground: 210 40% 98%;
	--secondary: 210 40% 96.1%;
	--secondary-foreground: 222.2 47.4% 11.2%;
	--muted: 210 40% 96.1%;
	--muted-foreground: 215.4 16.3% 46.9%;
	--accent: 210 40% 96.1%;
	--accent-foreground: 222.2 47.4% 11.2%;
	--destructive: 0 84.2% 60.2%;
	--destructive-foreground: 210 40% 98%;
	--border: 214.3 31.8% 91.4%;
	--input: 214.3 31.8% 91.4%;
	--ring: 222.2 84% 4.9%;
	--chart-1: 12 76% 61%;
	--chart-2: 173 58% 39%;
	--chart-3: 197 37% 24%;
	--chart-4: 43 74% 66%;
	--chart-5: 27 87% 67%;
	--radius: 0.5rem;
  }
  .dark {
	--background: 222.2 84% 4.9%;
	--foreground: 210 40% 98%;
	--card: 222.2 84% 4.9%;
	--card-foreground: 210 40% 98%;
	--popover: 222.2 84% 4.9%;
	--popover-foreground: 210 40% 98%;
	--primary: 210 40% 98%;
	--primary-foreground: 222.2 47.4% 11.2%;
	--secondary: 217.2 32.6% 17.5%;
	--secondary-foreground: 210 40% 98%;
	--muted: 217.2 32.6% 17.5%;
	--muted-foreground: 215 20.2% 65.1%;
	--accent: 217.2 32.6% 17.5%;
	--accent-foreground: 210 40% 98%;
	--destructive: 0 62.8% 30.6%;
	--destructive-foreground: 210 40% 98%;
	--border: 217.2 32.6% 17.5%;
	--input: 217.2 32.6% 17.5%;
	--ring: 212.7 26.8% 83.9%;
	--chart-1: 220 70% 50%;
	--chart-2: 160 60% 45%;
	--chart-3: 30 80% 55%;
	--chart-4: 280 65% 60%;
	--chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
	@apply border-border;
  }
  body {
	@apply bg-background text-foreground;
  }
}

```

/indexengineer/src/app/layout.tsx
```
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CommandProvider } from "@/components/CommandProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Scheduler App",
  description: "A simple scheduler application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
	<html lang="en" className="overflow-hidden">
	  <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen text-gray-900`}>
		<CommandProvider>
		  <main className="container mx-auto p-4">
			{children}
		  </main>
		</CommandProvider>
	  </body>
	</html>
  );
}
```

/indexengineer/src/app/page.tsx
```
import SearchNavigation from '@/components/SearchNavigation';
import { Command } from '@/components/ui/command';
import SearchContent from '@/components/SearchContent';

export default function Home() {
  /*return (
	//<SearchContent />
	<div className="min-h-screen flex items-start justify-center pt-32">
	  <div className="w-full max-w-2xl">
		<Command className="rounded-lg">

		  <SearchNavigation />
		</Command>
		<div className="mt-4 flex justify-center space-x-4 text-sm">
		  <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">↑↓</kbd> to navigate</span>
		  <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">enter</kbd> to select</span>
		  <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">esc</kbd> to close</span>
		</div>
	  </div>
	</div>
  );*/
  return <SearchNavigation />;
}
```
/indexengineer/src/app/scheduler/page.tsx
```
//add code for main scheduler page here.
```
/indexengineer/src/components/ui/
```
//this folder contains all the shadcn\ ui compoents
```
/indexengineer/src/components/CommandProvider.tsx
```
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CommandDialog } from "@/components/ui/command";
import SearchContent from '@/components/SearchContent';

const CommandContext = createContext<{ openCommandBar: () => void }>({
  openCommandBar: () => {},
});

export const CommandProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
	const down = (e: KeyboardEvent) => {
	  if (e.key === "/" && 
		  !(e.target instanceof HTMLInputElement) && 
		  !(e.target instanceof HTMLTextAreaElement) &&
		  window.location.pathname !== '/') {
		e.preventDefault();
		setOpen(true);
	  }
	};

	document.addEventListener("keydown", down);
	return () => document.removeEventListener("keydown", down);
  }, []);

  return (
	<CommandContext.Provider value={{ openCommandBar: () => setOpen(true) }}>
	  {children}
	  <CommandDialog open={open} onOpenChange={setOpen}>
		<SearchContent />
	  </CommandDialog>
	</CommandContext.Provider>
  );
};

export const useCommand = () => useContext(CommandContext);
```
/indexengineer/src/components/SearchContent.tsx
```
"use client";

import React from 'react';
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ArrowRight } from "lucide-react";

const pages = [
  { title: 'Scheduler', path: '/scheduler', description: 'Manage your tasks and calendar' },
  { title: 'Note Taker', path: '/notes', description: 'Take and organize your study notes' },
  { title: 'University', path: '/university', description: 'Track university applications and deadlines' },
  { title: 'Sports Tracker', path: '/sports', description: 'Monitor your triathlon, Muay Thai, and fitness progress' },
  { title: 'Mental Health', path: '/mental-health', description: 'Track your well-being and relaxation activities' },
  { title: 'Analytics', path: '/analytics', description: 'View your performance metrics and insights' }
];

const SearchContent = () => {
  return (
	<>
	  <CommandInput placeholder="Search pages... (Press '/' to focus)" />
	  <CommandList>
		<CommandEmpty>No results found.</CommandEmpty>
		<CommandGroup heading="Pages">
		  {pages.map((page) => (
			<CommandItem
			  key={page.path}
			  value={page.title}
			  onSelect={() => {
				window.location.href = page.path;
			  }}
			  className="flex items-center justify-between py-3"
			>
			  <div>
				<p className="font-medium text-sm">{page.title}</p>
				<p className="text-sm text-gray-500">{page.description}</p>
			  </div>
			  <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
			</CommandItem>
		  ))}
		</CommandGroup>
	  </CommandList>
	</>
  );
};

export default SearchContent;
```
/indexengineer/src/components/SearchNavigation.tsx
```
"use client";

import React from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, ArrowRight } from "lucide-react";

const pages = [
  { title: 'Scheduler', path: '/scheduler', description: 'Manage your tasks and calendar' },
  { title: 'Note Taker', path: '/notes', description: 'Take and organize your study notes' },
  { title: 'University', path: '/university', description: 'Track university applications and deadlines' },
  { title: 'Sports Tracker', path: '/sports', description: 'Monitor your triathlon, Muay Thai, and fitness progress' },
  { title: 'Mental Health', path: '/mental-health', description: 'Track your well-being and relaxation activities' },
  { title: 'Analytics', path: '/analytics', description: 'View your performance metrics and insights' }
];

const SearchNavigation = () => {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
	const down = (e: KeyboardEvent) => {
	  if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
		e.preventDefault();
		inputRef.current?.focus();
		setOpen(true);
	  }
	};

	document.addEventListener("keydown", down);
	return () => document.removeEventListener("keydown", down);
  }, []);

  return (
	<div className="flex items-start justify-center pt-32">
	  <div className="w-full max-w-2xl">
		<Command className="rounded-xl shadow-md overflow-visible">
		  <div className="relative">
		  <CommandInput 
			ref={inputRef}
			placeholder="Search pages... (Press '/' to focus)" 
			className="h-12"
			onFocus={() => setOpen(true)}
			onBlur={() => {
				setTimeout(() => setOpen(false), 200);
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
				inputRef.current?.blur();
				setOpen(false);
				}
			}}
			/>
		  </div>
		  {open && (
			<CommandList>
			  <CommandEmpty>No results found.</CommandEmpty>
			  <CommandGroup heading="Pages">
				{pages.map((page) => (
				  <CommandItem
					key={page.path}
					value={page.title}
					onSelect={() => {
					  window.location.href = page.path;
					}}
					className="flex items-center justify-between py-3 cursor-pointer"
				  >
					<div>
					  <p className="font-medium text-sm">{page.title}</p>
					  <p className="text-sm text-gray-500">{page.description}</p>
					</div>
					<ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-aria-selected:opacity-100" />
				  </CommandItem>
				))}
			  </CommandGroup>
			</CommandList>
		  )}
		</Command>

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
```


I want you to make the entire application in a single response, including the extended functionalities, but with the exception of the google calendar integration and the analytics component.

I also want you to maintain a consistent UI style throughout the application  Use any of the Shadcn\ components that are available.

Also try to be really concise with whatever you say as there is a length limit to this chat.