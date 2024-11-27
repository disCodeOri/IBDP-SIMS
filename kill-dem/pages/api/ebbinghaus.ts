import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises'; // Use promises for async/await
import path from 'path';

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90, 180];

interface ReviewEntry {
  chapterId: string;
  lastCoveredDate: string;
  nextReviewDate: string;
  reviewCount: number;
}

const subjectsPath = path.join(process.cwd(), 'src', 'data', 'subjects.json');
const reviewDatesPath = path.join(process.cwd(), 'src', 'data', 'review-dates.json');


const calculateNextReviewDate = (lastCoveredDate: string, reviewCount: number): string => {
  const lastCovered = new Date(lastCoveredDate);
  const daysToAdd = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
  const nextReviewDate = new Date(lastCovered);
  nextReviewDate.setDate(lastCovered.getDate() + daysToAdd);
  return nextReviewDate.toISOString();
};

const updateReviewDates = async (req:NextApiRequest, res:NextApiResponse) => {
    try {
        const subjectsRaw = await fs.readFile(subjectsPath, 'utf-8');
        const subjectsData = JSON.parse(subjectsRaw);
        let reviewDatesRaw = '{}';
        try {
          reviewDatesRaw = await fs.readFile(reviewDatesPath, 'utf-8');
        } catch (error) {}
        let reviewDates: { [key: string]: ReviewEntry } = JSON.parse(reviewDatesRaw);
  
        Object.values(subjectsData.subjects).forEach((subject: any) => {
          subject.books.forEach((book: any) => {
            book.chapters.forEach((chapter: any) => {
              if (chapter.covered && chapter.last_covered_date) {
                const existingEntry = reviewDates[chapter.id];
                if (!existingEntry) {
                  reviewDates[chapter.id] = {
                    chapterId: chapter.id,
                    lastCoveredDate: chapter.last_covered_date,
                    nextReviewDate: calculateNextReviewDate(chapter.last_covered_date, 0),
                    reviewCount: 0,
                  };
                } else {
                  const newReviewCount = existingEntry.reviewCount + 1;
                  reviewDates[chapter.id] = {
                    ...existingEntry,
                    lastCoveredDate: chapter.last_covered_date,
                    nextReviewDate: calculateNextReviewDate(chapter.last_covered_date, newReviewCount),
                    reviewCount: newReviewCount,
                  };
                }
              }
            });
          });
        });
  
        await fs.writeFile(reviewDatesPath, JSON.stringify(reviewDates, null, 2));
        res.status(200).json({ message: 'Review dates updated successfully' });
      } catch (error) {
        console.error('Error updating review dates:', error);
        res.status(500).json({ error: 'Failed to update review dates' });
      }
}

const checkDueReviews = async (req:NextApiRequest, res:NextApiResponse) => {
    try {
        const reviewDatesRaw = await fs.readFile(reviewDatesPath, 'utf-8');
        const reviewDates: { [key: string]: ReviewEntry } = JSON.parse(reviewDatesRaw);
        const now = new Date();
        const dueReviews = Object.values(reviewDates)
          .filter((entry) => new Date(entry.nextReviewDate) <= now)
          .map((entry) => ({...entry, nextReviewDate: new Date(entry.nextReviewDate).toLocaleDateString()})); 
        res.status(200).json({ dueReviews });
      } catch (error) {
        console.error('Error checking due reviews:', error);
        res.status(500).json({ error: 'Failed to check due reviews' });
      }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST'){
        updateReviewDates(req, res)
    } else if (req.method === 'GET'){
        checkDueReviews(req, res)
    } else {
        res.status(405).end()
    }
}