
import React from 'react';
import FeedbackForm from '@/components/resident/FeedbackForm';
import FeedbackList from '@/components/resident/FeedbackList';
import { useFeedbackData } from '@/hooks/useFeedbackData';

const ResidentFeedback = () => {
  const { feedbacks, isLoadingFeedbacks, refreshFeedbacks } = useFeedbackData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit Feedback</h1>
        <p className="text-muted-foreground">Report issues or provide feedback about waste collection services.</p>
      </div>

      <FeedbackForm onSubmitSuccess={refreshFeedbacks} />
      <FeedbackList feedbacks={feedbacks} isLoading={isLoadingFeedbacks} />
    </div>
  );
};

export default ResidentFeedback;
