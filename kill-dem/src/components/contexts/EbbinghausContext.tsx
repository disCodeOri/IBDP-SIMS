'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EbbinghausContextType {
  updateReviewDates: () => Promise<void>;
  checkDueReviews: () => Promise<string[]>;
}

const EbbinghausContext = createContext<EbbinghausContextType | null>(null);

export const EbbinghausProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null);
  const updateReviewDates = async () => {
    try {
      const response = await fetch('/api/ebbinghaus', { method: 'POST' });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDueReviews = async () => {
    try {
        const response = await fetch('/api/ebbinghaus');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        return data.dueReviews
    } catch (error) {
        setError(error as Error)
        return []
    }
  };


  useEffect(() => {
    updateReviewDates();
  }, []);

  const contextValue: EbbinghausContextType = {
    updateReviewDates,
    checkDueReviews,
  };

  return (
    <EbbinghausContext.Provider value={contextValue}>
      {children}
    </EbbinghausContext.Provider>
  );
};

export const useEbbinghaus = () => {
  const context = useContext(EbbinghausContext);
  if (context === null) {
    throw new Error('useEbbinghaus must be used within an EbbinghausProvider');
  }
  return context;
};