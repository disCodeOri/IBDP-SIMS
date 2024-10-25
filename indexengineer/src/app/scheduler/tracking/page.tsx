// src/app/scheduler/tracking/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

interface ReviewSession {
  id: string;
  taskId: string;
  date: string;
  confidence: number;
  notes: string;
}

interface TrackingStats {
  completed: number;
  inProgress: number;
  pending: number;
  totalReviews: number;
  avgConfidence: number;
  streak: number;
  nextReviews: { taskId: string; title: string; dueDate: string }[];
}

const TrackedTask = ({ task, onReview }: any) => {
  const [confidence, setConfidence] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  return (
	<Card className="mb-4">
	  <CardHeader>
		<CardTitle className="text-lg">{task.title}</CardTitle>
	  </CardHeader>
	  <CardContent>
		<div className="space-y-4">
		  <div>
			<p className="text-sm mb-2">Confidence Level</p>
			<div className="flex gap-2">
			  {[1, 2, 3, 4, 5].map((level) => (
				<Button
				  key={level}
				  variant={confidence === level ? "default" : "outline"}
				  size="sm"
				  onClick={() => setConfidence(level)}
				>
				  {level}
				</Button>
			  ))}
			</div>
		  </div>
		  <div className="flex justify-end">
			<Button 
			  onClick={() => onReview(task.id, { confidence, notes })}
			  disabled={!confidence}
			>
			  Complete Review
			</Button>
		  </div>
		</div>
	  </CardContent>
	</Card>
  );
};

const StatsOverview = ({ stats }: { stats: TrackingStats }) => {
  return (
	<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
	  <Card>
		<CardHeader>
		  <CardTitle className="text-sm">Task Progress</CardTitle>
		</CardHeader>
		<CardContent>
		  <div className="space-y-2">
			<div className="flex justify-between text-sm">
			  <span>Completed</span>
			  <span>{stats.completed}</span>
			</div>
			<Progress value={(stats.completed / (stats.completed + stats.inProgress + stats.pending)) * 100} />
		  </div>
		</CardContent>
	  </Card>

	  <Card>
		<CardHeader>
		  <CardTitle className="text-sm">Review Streak</CardTitle>
		</CardHeader>
		<CardContent>
		  <div className="text-3xl font-bold">{stats.streak} days</div>
		</CardContent>
	  </Card>

	  <Card>
		<CardHeader>
		  <CardTitle className="text-sm">Average Confidence</CardTitle>
		</CardHeader>
		<CardContent>
		  <div className="text-3xl font-bold">{stats.avgConfidence.toFixed(1)}/5</div>
		</CardContent>
	  </Card>
	</div>
  );
};

const ProgressChart = ({ data }: { data: any[] }) => {
  return (
	<Card className="mb-6">
	  <CardHeader>
		<CardTitle>Progress Over Time</CardTitle>
	  </CardHeader>
	  <CardContent>
		<div className="h-[300px]">
		  <ResponsiveContainer width="100%" height="100%">
			<LineChart data={data}>
			  <CartesianGrid strokeDasharray="3 3" />
			  <XAxis dataKey="date" />
			  <YAxis />
			  <Tooltip />
			  <Line type="monotone" dataKey="completed" stroke="#4CAF50" name="Completed" />
			  <Line type="monotone" dataKey="confidence" stroke="#2196F3" name="Confidence" />
			</LineChart>
		  </ResponsiveContainer>
		</div>
	  </CardContent>
	</Card>
  );
};

const NextReviews = ({ reviews }: { reviews: TrackingStats['nextReviews'] }) => {
  return (
	<Card>
	  <CardHeader>
		<CardTitle>Upcoming Reviews</CardTitle>
	  </CardHeader>
	  <CardContent>
		<ScrollArea className="h-[200px]">
		  {reviews.map((review) => (
			<div key={review.taskId} className="flex justify-between items-center py-2 border-b">
			  <div>
				<p className="font-medium">{review.title}</p>
				<p className="text-sm text-gray-500">
				  Due: {new Date(review.dueDate).toLocaleDateString()}
				</p>
			  </div>
			  <Calendar className="h-4 w-4 text-gray-500" />
			</div>
		  ))}
		</ScrollArea>
	  </CardContent>
	</Card>
  );
};

export default function TrackingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<ReviewSession[]>([]);
  const [stats, setStats] = useState<TrackingStats>({
	completed: 0,
	inProgress: 0,
	pending: 0,
	totalReviews: 0,
	avgConfidence: 0,
	streak: 0,
	nextReviews: []
  });

  useEffect(() => {
	// Load tasks and reviews from localStorage
	const savedTasks = localStorage.getItem('tasks');
	const savedReviews = localStorage.getItem('reviews');

	if (savedTasks) {
	  setTasks(JSON.parse(savedTasks));
	}
	if (savedReviews) {
	  setReviews(JSON.parse(savedReviews));
	}
  }, []);

  useEffect(() => {
	// Calculate statistics
	const calculateStats = () => {
	  const taskStats = tasks.reduce(
		(acc, task) => {
		  acc[task.status.toLowerCase()]++;
		  return acc;
		},
		{ completed: 0, inProgress: 0, pending: 0 }
	  );

	  const avgConfidence = reviews.length
		? reviews.reduce((sum, review) => sum + review.confidence, 0) / reviews.length
		: 0;

	  // Calculate streak
	  const today = new Date().toISOString().split('T')[0];
	  const reviewDates = [...new Set(reviews.map(r => r.date))].sort();
	  let streak = 0;
	  let currentDate = new Date(today);

	  for (let i = reviewDates.length - 1; i >= 0; i--) {
		const reviewDate = new Date(reviewDates[i]);
		if (
		  reviewDate.toISOString().split('T')[0] ===
		  currentDate.toISOString().split('T')[0]
		) {
		  streak++;
		  currentDate.setDate(currentDate.getDate() - 1);
		} else {
		  break;
		}
	  }

	  // Calculate next reviews
	  const nextReviews = tasks
		.filter(task => task.status !== 'Completed')
		.map(task => ({
		  taskId: task.id,
		  title: task.title,
		  dueDate: task.dueDate
		}))
		.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
		.slice(0, 5);

	  setStats({
		...taskStats,
		totalReviews: reviews.length,
		avgConfidence,
		streak,
		nextReviews
	  });
	};

	calculateStats();
  }, [tasks, reviews]);

  const handleReview = (taskId: string, reviewData: { confidence: number; notes: string }) => {
	const newReview: ReviewSession = {
	  id: crypto.randomUUID(),
	  taskId,
	  date: new Date().toISOString().split('T')[0],
	  confidence: reviewData.confidence,
	  notes: reviewData.notes
	};

	const updatedReviews = [...reviews, newReview];
	setReviews(updatedReviews);
	localStorage.setItem('reviews', JSON.stringify(updatedReviews));
  };

  const progressData = reviews.reduce((acc: any[], review) => {
	const date = review.date;
	const existingEntry = acc.find(entry => entry.date === date);

	if (existingEntry) {
	  existingEntry.confidence = (existingEntry.confidence + review.confidence) / 2;
	  existingEntry.completed++;
	} else {
	  acc.push({
		date,
		confidence: review.confidence,
		completed: 1
	  });
	}

	return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
	<div className="max-w-4xl mx-auto py-8">
	  <h1 className="text-3xl font-bold mb-6">Progress Tracking</h1>

	  <StatsOverview stats={stats} />

	  <Tabs defaultValue="progress" className="w-full">
		<TabsList className="mb-4">
		  <TabsTrigger value="progress">Progress</TabsTrigger>
		  <TabsTrigger value="reviews">Reviews</TabsTrigger>
		</TabsList>

		<TabsContent value="progress">
		  <ProgressChart data={progressData} />
		  <NextReviews reviews={stats.nextReviews} />
		</TabsContent>

		<TabsContent value="reviews">
		  <ScrollArea className="h-[calc(100vh-300px)]">
			{tasks
			  .filter(task => task.status === 'In Progress')
			  .map(task => (
				<TrackedTask
				  key={task.id}
				  task={task}
				  onReview={handleReview}
				/>
			  ))}
		  </ScrollArea>
		</TabsContent>
	  </Tabs>
	</div>
  );
}