'use client';
import React, { useState, useEffect } from 'react';
import { useEbbinghaus } from '@/components/contexts/EbbinghausContext';
import { Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import subjectsData from '@/data/subjects.json';

interface ReviewNotification {
  chapterId: string;
  subjectName: string;
  bookName: string;
  chapterTitle: string;
  nextReviewDate: string;
}

const ReviewNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<ReviewNotification[]>([]);
  const { checkDueReviews } = useEbbinghaus();

  useEffect(() => {
    const fetchAndDisplayNotifications = async () => {
      const dueReviews = await checkDueReviews(); // Array of chapterIds
      const fullNotifications: ReviewNotification[] = [];

      for (const chapterId of dueReviews) {
        const notification = getChapterDetails(chapterId);
        if (notification) {
          fullNotifications.push(notification);
        }
      }
      setNotifications(fullNotifications);
    };

    const getChapterDetails = (chapterId: string): ReviewNotification | null => {
      for (const [subjectName, subject] of Object.entries(subjectsData.subjects)) {
        for (const book of subject.books) {
          const chapter = book.chapters.find((ch: any) => ch.id === chapterId);
          if (chapter) {
            return {
              chapterId,
              subjectName,
              bookName: book.name,
              chapterTitle: chapter.title,
              nextReviewDate: new Date().toLocaleDateString(), // Placeholder until server-side formatting is implemented
            };
          }
        }
      }
      return null;
    };


    fetchAndDisplayNotifications();
    const intervalId = setInterval(fetchAndDisplayNotifications, 3600000);

    return () => clearInterval(intervalId);
  }, [checkDueReviews]);

  const dismissNotification = (chapterId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.chapterId !== chapterId));
  };

  //The markAsReviewed function is not needed anymore as the review date is updated on the server

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.chapterId} className="w-80 bg-yellow-50 border-yellow-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Review Reminder</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-bold text-yellow-900">{notification.chapterTitle}</p>
              <p className="text-yellow-700">{notification.subjectName} - {notification.bookName}</p>
              <p className="text-yellow-600 mt-1">
                <Clock className="inline-block mr-2 h-4 w-4" />
                Due for Review: {notification.nextReviewDate}
              </p>
            </div>
            <div className="flex justify-between mt-3">
              <button onClick={() => dismissNotification(notification.chapterId)} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition">
                Dismiss
              </button>
              {/* Removed Mark Reviewed button as it's handled on server */}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewNotifications;