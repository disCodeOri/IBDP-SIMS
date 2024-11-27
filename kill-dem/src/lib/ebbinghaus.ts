// src/lib/ebbinghaus.ts
import fs from 'fs';
import path from 'path';

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90, 180];

interface ReviewEntry {
  chapterId: string;
  lastCoveredDate: string;
  nextReviewDate: string;
  reviewCount: number;
}

export class EbbinghausService {
  private subjectsPath: string;
  private reviewDatesPath: string;

  constructor() {
    this.subjectsPath = path.join(process.cwd(), 'src', 'data', 'subjects.json');
    this.reviewDatesPath = path.join(process.cwd(), 'src', 'data', 'review-dates.json');
  }

  calculateNextReviewDate(lastCoveredDate: string, reviewCount: number): string {
    const lastCovered = new Date(lastCoveredDate);
    const daysToAdd = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
    const nextReviewDate = new Date(lastCovered);
    nextReviewDate.setDate(lastCovered.getDate() + daysToAdd);
    return nextReviewDate.toISOString();
  }

  updateReviewDates() {
    try {
      const subjectsRaw = fs.readFileSync(this.subjectsPath, 'utf-8');
      const subjectsData = JSON.parse(subjectsRaw);
      let reviewDatesRaw = '{}';
      try {
        reviewDatesRaw = fs.readFileSync(this.reviewDatesPath, 'utf-8');
      } catch (error) {}
      const reviewDates: { [key: string]: ReviewEntry } = JSON.parse(reviewDatesRaw);

      Object.values(subjectsData.subjects).forEach((subject: any) => {
        subject.books.forEach((book: any) => {
          book.chapters.forEach((chapter: any) => {
            if (chapter.covered && chapter.last_covered_date) {
              const existingEntry = reviewDates[chapter.id];
              if (!existingEntry) {
                reviewDates[chapter.id] = {
                  chapterId: chapter.id,
                  lastCoveredDate: chapter.last_covered_date,
                  nextReviewDate: this.calculateNextReviewDate(chapter.last_covered_date, 0),
                  reviewCount: 0,
                };
              } else {
                const newReviewCount = existingEntry.reviewCount + 1;
                reviewDates[chapter.id] = {
                  ...existingEntry,
                  lastCoveredDate: chapter.last_covered_date,
                  nextReviewDate: this.calculateNextReviewDate(chapter.last_covered_date, newReviewCount),
                  reviewCount: newReviewCount,
                };
              }
            }
          });
        });
      });

      fs.writeFileSync(this.reviewDatesPath, JSON.stringify(reviewDates, null, 2));
    } catch (error) {
      console.error('Error updating review dates:', error);
    }
  }

  checkDueReviews(): string[] {
    const now = new Date();
    const reviewDatesRaw = fs.readFileSync(this.reviewDatesPath, 'utf-8');
    const reviewDates: { [key: string]: ReviewEntry } = JSON.parse(reviewDatesRaw);
    const dueReviews = Object.values(reviewDates)
      .filter((entry) => new Date(entry.nextReviewDate) <= now)
      .map((entry) => entry.chapterId);
    return dueReviews;
  }
}
