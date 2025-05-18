
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

export interface Feedback {
  id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  admin_response?: string;
}

interface FeedbackListProps {
  feedbacks: Feedback[];
  isLoading: boolean;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Previous Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">You haven't submitted any feedback yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{feedback.subject}</h3>
                    <p className="text-sm text-gray-600">{feedback.description}</p>
                  </div>
                  <StatusBadge status={feedback.status} />
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Submitted: {format(new Date(feedback.created_at), 'MMMM d, yyyy')}</p>
                  
                  {feedback.admin_response && (
                    <p className="mt-2 text-sm border-l-2 border-gray-300 pl-3 py-1 bg-gray-50">
                      <span className="font-medium">Response:</span> {feedback.admin_response}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackList;
