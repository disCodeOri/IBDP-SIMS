// src/pages/_app.tsx
import { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;

// src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <Layout>
      <h1>Welcome to Life Management App</h1>
      <CommandBar />
    </Layout>
  );
};

export default Home;

// src/pages/dashboard.tsx
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please authenticate to view this page.</div>;
  }

  return (
    <Layout>
      <h1>Dashboard</h1>
      <CommandBar />
      {/* Add dashboard content here */}
    </Layout>
  );
};

export default Dashboard;

// src/components/Layout.tsx
import { ReactNode } from 'react';
import Head from 'next/head';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <>
    <Head>
      <title>Life Management App</title>
    </Head>
    <main>{children}</main>
  </>
);

export default Layout;

// src/components/CommandBar.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CommandList } from '@/components/CommandList';

const CommandBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAuth();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === '/' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    } else if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCommand = (command: string) => {
    setIsOpen(false);
    switch (command) {
      case 'scheduler':
        router.push('/scheduler');
        break;
      case 'note-taker':
        router.push('/note-taker');
        break;
      case 'sports-tracker':
        router.push('/sports-tracker');
        break;
      case 'mental-health':
        router.push('/mental-health');
        break;
      case 'performance-tracking':
        router.push('/performance-tracking');
        break;
      case 'analytics':
        router.push('/analytics');
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <Input
          type={isAuthenticated ? 'text' : 'password'}
          placeholder={isAuthenticated ? 'Type a command...' : 'Enter password...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isAuthenticated) {
              login(query);
              setQuery('');
            }
          }}
        />
        {isAuthenticated && <CommandList query={query} onSelect={handleCommand} />}
      </DialogContent>
    </Dialog>
  );
};

export default CommandBar;

// src/components/CommandList.tsx
import { useState, useEffect } from 'react';
import { Command } from 'cmdk';

type CommandListProps = {
  query: string;
  onSelect: (command: string) => void;
};

const CommandList = ({ query, onSelect }: CommandListProps) => {
  const [filteredItems, setFilteredItems] = useState<string[]>([]);

  const items = [
    'scheduler',
    'note-taker',
    'sports-tracker',
    'mental-health',
    'performance-tracking',
    'analytics',
    'logout',
  ];

  useEffect(() => {
    setFilteredItems(
      items.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query]);

  return (
    <Command.List>
      {filteredItems.map((item) => (
        <Command.Item key={item} onSelect={() => onSelect(item)}>
          {item}
        </Command.Item>
      ))}
    </Command.List>
  );
};

export default CommandList;

// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (password: string) => {
    // In a real app, you'd validate the password against a stored hash
    if (password === 'your_secure_password') {
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/pages/scheduler.tsx
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const Scheduler = () => (
  <Layout>
    <h1>Scheduler</h1>
    <CommandBar />
    {/* Add scheduler component here */}
  </Layout>
);

export default Scheduler;

// src/pages/note-taker.tsx
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const NoteTaker = () => (
  <Layout>
    <h1>Note Taker</h1>
    <CommandBar />
    {/* Add note-taker component here */}
  </Layout>
);

export default NoteTaker;

// src/pages/sports-tracker.tsx
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const SportsTracker = () => (
  <Layout>
    <h1>Sports Tracker</h1>
    <CommandBar />
    {/* Add sports tracker component here */}
  </Layout>
);

export default SportsTracker;

// src/pages/mental-health.tsx
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const MentalHealth = () => (
  <Layout>
    <h1>Mental Health</h1>
    <CommandBar />
    {/* Add mental health component here */}
  </Layout>
);

export default MentalHealth;

// src/pages/performance-tracking.tsx
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const PerformanceTracking = () => (
  <Layout>
    <h1>Performance Tracking</h1>
    <CommandBar />
    {/* Add performance tracking component here */}
  </Layout>
);

export default PerformanceTracking;

// src/pages/analytics.tsx
import Layout from '@/components/Layout';
import CommandBar from '@/components/CommandBar';

const Analytics = () => (
  <Layout>
    <h1>Analytics</h1>
    <CommandBar />
    {/* Add analytics component here */}
  </Layout>
);

export default Analytics;

// src/components/Calendar.tsx
import { useState } from 'react';
import { Calendar as CalendarUI } from '@/components/ui/calendar';

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <CalendarUI
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
};

export default Calendar;

// src/components/TaskList.tsx
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: newTaskTitle, completed: false }]);
      setNewTaskTitle('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div>
      <div className="flex mb-4">
        <Input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task"
          className="mr-2"
        />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="flex items-center mb-2">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="mr-2"
            />
            <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;

// src/components/NoteList.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Note = {
  id: string;
  title: string;
  content: string;
};

const NoteList = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const addNote = () => {
    if (newNoteTitle.trim()) {
      setNotes([...notes, { id: Date.now().toString(), title: newNoteTitle, content: newNoteContent }]);
      setNewNoteTitle('');
      setNewNoteContent('');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          placeholder="Note title"
          className="mb-2"
        />
        <Textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Note content"
          className="mb-2"
        />
        <Button onClick={addNote}>Add Note</Button>
      </div>
      <ul>
        {notes.map(note => (
          <li key={note.id} className="mb-4">
            <h3 className="font-bold">{note.title}</h3>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;

// src/components/SportsTracker.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Activity = {
  id: string;
  name: string;
  duration: number;
};

const SportsTracker = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDuration, setNewActivityDuration] = useState('');

  const addActivity = () => {
    if (newActivityName.trim() && newActivityDuration.trim()) {
      setActivities([...activities, {
        id: Date.now().toString(),
        name: newActivityName,
        duration: parseInt(newActivityDuration)
      }]);
      setNewActivityName('');
      setNewActivityDuration('');
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <Input
          type="text"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
          placeholder="Activity name"
          className="mr-2"
        />
        <Input
          type="number"
          value={newActivityDuration}
          onChange={(e) => setNewActivityDuration(e.target.value)}
          placeholder="Duration (minutes)"
          className="mr-2"
        />
        <Button onClick={addActivity}>Add Activity</Button>
      </div>
      <ul>
        {activities.map(activity => (
          <li key={activity.id} className="mb-2">
            {activity.name} - {activity.duration} minutes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SportsTracker;

// src/components/MentalHealthTracker.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MoodEntry = {
  id: string;
  date: string;
  mood: string;
  notes: string;
};

const MentalHealthTracker = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');

  const addEntry = () => {
    if (mood) {
      setEntries([...entries, {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mood,
        notes
      }]);
      setMood('');
      setNotes('');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Select onValueChange={setMood}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="Select mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="happy">Happy</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="sad">Sad</SelectItem>
            <SelectItem value="anxious">Anxious</SelectItem>
            <SelectItem value="angry">Angry</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes about your day"
          className="mb-2"
        />
        <Button onClick={addEntry}>Add Entry</Button>
      </div>
      <ul>
        {entries.map(entry => (
          <li key={entry.id} className="mb-2">
            <strong>{new Date(entry.date).toLocaleDateString()}</strong> - Mood: {entry.mood}
            <p>{entry.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MentalHealthTracker;

// src/components/PerformanceTracker.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Performance = {
  id: string;
  date: string;
  metric: string;
  value: number;
};

const PerformanceTracker = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [metric, setMetric] = useState('');
  const [value, setValue] = useState('');

  const addPerformance = () => {
    if (metric.trim() && value.trim()) {
      setPerformances([...performances, {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        metric,
        value: parseFloat(value)
      }]);
      setMetric('');
      setValue('');
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <Input
          type="text"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          placeholder="Metric name"
          className="mr-2"
        />
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value"
          className="mr-2"
        />
        <Button onClick={addPerformance}>Add Performance</Button>
      </div>
      <ul>
        {performances.map(perf => (
          <li key={perf.id} className="mb-2">
            <strong>{new Date(perf.date).toLocaleDateString()}</strong> - {perf.metric}: {perf.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PerformanceTracker;

// src/components/Analytics.tsx
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type DataPoint = {
  date: string;
  value: number;
};

const Analytics = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch this data from your API or database
    const mockData: DataPoint[] = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 15 },
      { date: '2023-01-03', value: 13 },
      { date: '2023-01-04', value: 17 },
      { date: '2023-01-05', value: 20 },
    ];
    setData(mockData);
  }, []);

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Performance',
        data: data.map(d => d.value),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div>
      <h2>Performance Over Time</h2>
      <Line data={chartData} />
    </div>
  );
};

export default Analytics;

// src/utils/localStorage.ts
export const saveToLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const loadFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorage';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return loadFromLocalStorage(key) ?? initialValue;
  });

  useEffect(() => {
    saveToLocalStorage(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;

// src/styles/globals.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

body {
  font-family: 'Inter', sans-serif;
}

// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// next.config.js
module.exports = {
  reactStrictMode: true,
}

// package.json
{
  "name": "life-management-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-select": "^1.2.2",
    "chart.js": "^4.3.0",
    "cmdk": "^0.2.0",
    "next": "13.4.4",
    "react": "18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.2.5",
    "@types/react": "18.2.7",
    "@types/react-dom": "18.2.4",
    "autoprefixer": "^10.4.14",
    "eslint": "8.41.0",
    "eslint-config-next": "13.4.4",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "typescript": "5.0.4"
  }
}

// src/components/SpacedRepetition.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useLocalStorage from '@/hooks/useLocalStorage';

type FlashCard = {
  id: string;
  question: string;
  answer: string;
  nextReviewDate: string;
  interval: number;
};

const SpacedRepetition = () => {
  const [flashCards, setFlashCards] = useLocalStorage<FlashCard[]>('flashCards', []);
  const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const dueCards = flashCards.filter(card => card.nextReviewDate <= today);
    if (dueCards.length > 0) {
      setCurrentCard(dueCards[0]);
    } else {
      setCurrentCard(null);
    }
  }, [flashCards]);

  const updateCardInterval = (quality: number) => {
    if (!currentCard) return;

    const newInterval = calculateNewInterval(currentCard.interval, quality);
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const updatedCards = flashCards.map(card =>
      card.id === currentCard.id
        ? { ...card, interval: newInterval, nextReviewDate: nextReviewDate.toISOString().split('T')[0] }
        : card
    );

    setFlashCards(updatedCards);
    setShowAnswer(false);
    setCurrentCard(null);
  };

  const calculateNewInterval = (oldInterval: number, quality: number): number => {
    if (quality < 3) return 1;
    if (oldInterval === 0) return 1;
    if (oldInterval === 1) return 6;
    return Math.round(oldInterval * (1.2 + (quality - 3) * 0.2));
  };

  if (!currentCard) {
    return <div>No cards due for review.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{showAnswer ? 'Answer' : 'Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{showAnswer ? currentCard.answer : currentCard.question}</p>
        {!showAnswer && (
          <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
        )}
        {showAnswer && (
          <div>
            <Button onClick={() => updateCardInterval(1)}>Hard</Button>
            <Button onClick={() => updateCardInterval(3)}>Good</Button>
            <Button onClick={() => updateCardInterval(5)}>Easy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpacedRepetition;

// src/components/ZettelkastenNotes.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/useLocalStorage';

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
};

const ZettelkastenNotes = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('zettelkastenNotes', []);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [links, setLinks] = useState('');

  const addNote = () => {
    if (title.trim() && content.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        links: links.split(',').map(link => link.trim()).filter(Boolean),
      };
      setNotes([...notes, newNote]);
      setTitle('');
      setContent('');
      setTags('');
      setLinks('');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="mb-2"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          className="mb-2"
        />
        <Input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="mb-2"
        />
        <Input
          type="text"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Links to other notes (comma-separated)"
          className="mb-2"
        />
        <Button onClick={addNote}>Add Note</Button>
      </div>
      <ul>
        {notes.map(note => (
          <li key={note.id} className="mb-4">
            <h3 className="font-bold">{note.title}</h3>
            <p>{note.content}</p>
            <p>Tags: {note.tags.join(', ')}</p>
            <p>Links: {note.links.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ZettelkastenNotes;

// src/components/ConstraintHandler.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';

type Task = {
  id: string;
  title: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
};

const ConstraintHandler = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('constrainedTasks', []);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const addTask = () => {
    if (title.trim() && deadline) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        deadline,
        priority,
      };
      setTasks([...tasks, newTask]);
      setTitle('');
      setDeadline('');
      setPriority('medium');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.deadline !== b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="mb-2"
        />
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mb-2"
        />
        <Select onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <ul>
        {sortedTasks.map(task => (
          <li key={task.id} className="mb-2">
            <strong>{task.title}</strong> - Due: {task.deadline}, Priority: {task.priority}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConstraintHandler;

// src/components/HabitTracker.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import useLocalStorage from '@/hooks/useLocalStorage';

type Habit = {
  id: string;
  name: string;
  frequency: number;
  completedDates: string[];
};

const HabitTracker = () => {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('');

  const addHabit = () => {
    if (newHabitName.trim() && newHabitFrequency.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        frequency: parseInt(newHabitFrequency),
        completedDates: [],
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
      setNewHabitFrequency('');
    }
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates.includes(today)
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today];
        return { ...habit, completedDates };
      }
      return habit;
    }));
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="Habit name"
          className="mb-2"
        />
        <Input
          type="number"
          value={newHabitFrequency}
          onChange={(e) => setNewHabitFrequency(e.target.value)}
          placeholder="Frequency (days per week)"
          className="mb-2"
        />
        <Button onClick={addHabit}>Add Habit</Button>
      </div>
      <ul>
        {habits.map(habit => {
          const today = new Date().toISOString().split('T')[0];
          const isCompletedToday = habit.completedDates.includes(today);
          return (
            <li key={habit.id} className="mb-2 flex items-center">
              <Checkbox
                checked={isCompletedToday}
                onCheckedChange={() => toggleHabitCompletion(habit.id)}
                className="mr-2"
              />
              <span>{habit.name} ({habit.frequency} days/week)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HabitTracker;

// src/components/PomodoroClock.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const PomodoroClock = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(interval);
          setIsActive(false);
          setIsWorkSession(!isWorkSession);
          setMinutes(isWorkSession ? 5 : 25);
          setSeconds(0);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isWorkSession]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsWorkSession(true);
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">
        {isWorkSession ? 'Work Session' : 'Break Time'}
      </h2>
      <div className="text-4xl mb-4">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div>
        <Button onClick={toggleTimer} className="mr-2">
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer}>Reset</Button>
      </div>
    </div>
  );
};

export default PomodoroClock;

// src/components/DailyJournal.tsx
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/useLocalStorage';

type JournalEntry = {
  id: string;
  date: string;
  content: string;
};

const DailyJournal = () => {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [currentEntry, setCurrentEntry] = useState('');

  const saveEntry = () => {
    if (currentEntry.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: currentEntry.trim(),
      };
      setEntries([...entries, newEntry]);
      setCurrentEntry('');
    }
  };

  return (
    <div>
      <Textarea
        value={currentEntry}
        onChange={(e) => setCurrentEntry(e.target.value)}
        placeholder="Write your journal entry here..."
        className="mb-4"
      />
      <Button onClick={saveEntry}>Save Entry</Button>
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Previous Entries</h3>
        {entries.map(entry => (
          <div key={entry.id} className="mb-4">
            <p className="font-bold">{new Date(entry.date).toLocaleDateString()}</p>
            <p>{entry.content}</p>
          </div>
        )).reverse()}
      </div>
    </div>
  );
};

export default DailyJournal;

// src/components/GoalSetting.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';

type Goal = {
  id: string;
  title: string;
  deadline: string;
  category: string;
  completed: boolean;
};

const GoalSetting = () => {
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');

  const addGoal = () => {
    if (title.trim() && deadline && category) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: title.trim(),
        deadline,
        category,
        completed: false,
      };
      setGoals([...goals, newGoal]);
      setTitle('');
      setDeadline('');
      setCategory('');
    }
  };

  const toggleGoalCompletion = (goalId: string) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal title"
          className="mb-2"
        />
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mb-2"
        />
        <Select onValueChange={setCategory}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={addGoal}>Add Goal</Button>
      </div>
      <ul>
        {goals.map(goal => (
          <li key={goal.id} className="mb-2 flex items-center">
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => toggleGoalCompletion(goal.id)}
              className="mr-2"
            />
            <span className={goal.completed ? 'line-through' : ''}>
              {goal.title} - Due: {goal.deadline}, Category: {goal.category}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoalSetting;

// src/components/Dashboard.tsx
import MentalHealthTracker from './MentalHealthTracker';
import PerformanceTracker from './PerformanceTracker';
import Analytics from './Analytics';
import SpacedRepetition from './SpacedRepetition';
import ZettelkastenNotes from './ZettelkastenNotes';
import ConstraintHandler from './ConstraintHandler';
import HabitTracker from './HabitTracker';
import PomodoroClock from './PomodoroClock';
import DailyJournal from './DailyJournal';
import GoalSetting from './GoalSetting';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Life Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Mental Health</h2>
          <MentalHealthTracker />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Performance</h2>
          <PerformanceTracker />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Analytics</h2>
          <Analytics />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Spaced Repetition</h2>
          <SpacedRepetition />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Zettelkasten Notes</h2>
          <ZettelkastenNotes />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Constraint Handler</h2>
          <ConstraintHandler />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Habit Tracker</h2>
          <HabitTracker />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Pomodoro Clock</h2>
          <PomodoroClock />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Daily Journal</h2>
          <DailyJournal />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Goal Setting</h2>
          <GoalSetting />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// src/components/MentalHealthTracker.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';

type MoodEntry = {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  notes: string;
};

const MentalHealthTracker = () => {
  const [entries, setEntries] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [mood, setMood] = useState<MoodEntry['mood']>('okay');
  const [notes, setNotes] = useState('');

  const addEntry = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      notes: notes.trim(),
    };
    setEntries([...entries, newEntry]);
    setMood('okay');
    setNotes('');
  };

  return (
    <div>
      <div className="mb-4">
        <Select onValueChange={(value: MoodEntry['mood']) => setMood(value)}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="How are you feeling?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="great">Great</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="okay">Okay</SelectItem>
            <SelectItem value="bad">Bad</SelectItem>
            <SelectItem value="terrible">Terrible</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about your day?"
          className="mb-2"
        />
        <Button onClick={addEntry}>Add Entry</Button>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Recent Entries</h3>
        {entries.slice(-5).reverse().map(entry => (
          <div key={entry.id} className="mb-2">
            <p><strong>{new Date(entry.date).toLocaleDateString()}</strong>: {entry.mood}</p>
            {entry.notes && <p>{entry.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentalHealthTracker;

// src/components/PerformanceTracker.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/useLocalStorage';

type PerformanceEntry = {
  id: string;
  date: string;
  task: string;
  duration: number;
  productivity: number;
};

const PerformanceTracker = () => {
  const [entries, setEntries] = useLocalStorage<PerformanceEntry[]>('performanceEntries', []);
  const [task, setTask] = useState('');
  const [duration, setDuration] = useState('');
  const [productivity, setProductivity] = useState('');

  const addEntry = () => {
    if (task.trim() && duration && productivity) {
      const newEntry: PerformanceEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        task: task.trim(),
        duration: parseFloat(duration),
        productivity: parseInt(productivity),
      };
      setEntries([...entries, newEntry]);
      setTask('');
      setDuration('');
      setProductivity('');
    }
  };

  const calculateAverageProductivity = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.productivity, 0);
    return sum / entries.length;
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Task name"
          className="mb-2"
        />
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (hours)"
          className="mb-2"
        />
        <Input
          type="number"
          value={productivity}
          onChange={(e) => setProductivity(e.target.value)}
          placeholder="Productivity (1-10)"
          min="1"
          max="10"
          className="mb-2"
        />
        <Button onClick={addEntry}>Add Entry</Button>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Performance Summary</h3>
        <p>Average Productivity: {calculateAverageProductivity().toFixed(2)}</p>
        <h4 className="text-lg font-bold mt-4 mb-2">Recent Entries</h4>
        {entries.slice(-5).reverse().map(entry => (
          <div key={entry.id} className="mb-2">
            <p><strong>{new Date(entry.date).toLocaleDateString()}</strong>: {entry.task}</p>
            <p>Duration: {entry.duration}h, Productivity: {entry.productivity}/10</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceTracker;

// src/components/Analytics.tsx
import { useMemo } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';

const Analytics = () => {
  const [moodEntries] = useLocalStorage<any[]>('moodEntries', []);
  const [performanceEntries] = useLocalStorage<any[]>('performanceEntries', []);
  const [habits] = useLocalStorage<any[]>('habits', []);
  const [goals] = useLocalStorage<any[]>('goals', []);

  const moodAnalytics = useMemo(() => {
    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      percentage: ((count as number) / moodEntries.length) * 100
    }));
  }, [moodEntries]);

  const performanceAnalytics = useMemo(() => {
    if (performanceEntries.length === 0) return { averageProductivity: 0, totalHours: 0 };
    const totalProductivity = performanceEntries.reduce((sum, entry) => sum + entry.productivity, 0);
    const totalHours = performanceEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return {
      averageProductivity: totalProductivity / performanceEntries.length,
      totalHours
    };
  }, [performanceEntries]);

  const habitCompletion = useMemo(() => {
    return habits.map(habit => {
      const completionRate = habit.completedDates.length / 7; // Assuming weekly tracking
      return { name: habit.name, completionRate };
    });
  }, [habits]);

  const goalProgress = useMemo(() => {
    const completed = goals.filter(goal => goal.completed).length;
    const total = goals.length;
    return {
      completedPercentage: (completed / total) * 100,
      remainingCount: total - completed
    };
  }, [goals]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Analytics Overview</h3>
      
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Mood Distribution</h4>
        {moodAnalytics.map(({ mood, percentage }) => (
          <div key={mood} className="flex justify-between mb-1">
            <span>{mood}</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Performance</h4>
        <p>Average Productivity: {performanceAnalytics.averageProductivity.toFixed(2)}/10</p>
        <p>Total Hours Tracked: {performanceAnalytics.totalHours.toFixed(1)}h</p>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Habit Completion Rates</h4>
        {habitCompletion.map(({ name, completionRate }) => (
          <div key={name} className="flex justify-between mb-1">
            <span>{name}</span>
            <span>{(completionRate * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Goal Progress</h4>
        <p>Completed: {goalProgress.completedPercentage.toFixed(1)}%</p>
        <p>Remaining: {goalProgress.remainingCount}</p>
      </div>
    </div>
  );
};

export default Analytics;

// src/pages/index.tsx
import Head from 'next/head';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Life Management Dashboard</title>
        <meta name="description" content="A comprehensive life management dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Dashboard />
      </main>
    </>
  );
}

// src/pages/_app.tsx
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;

// src/styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-100;
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;

// .gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

// package.json
{
  "name": "life-management-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/node": "20.2.5",
    "@types/react": "18.2.7",
    "@types/react-dom": "18.2.4",
    "autoprefixer": "10.4.14",
    "next": "13.4.4",
    "postcss": "8.4.24",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "3.3.2",
    "typescript": "5.0.4"
  }
}
