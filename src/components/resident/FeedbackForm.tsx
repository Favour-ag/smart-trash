
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmitSuccess }) => {
  const [feedbackType, setFeedbackType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getFeedbackTypeValue = (type: string) => {
    switch (type) {
      case 'missed-collection': return 'Missed Collection';
      case 'improper-disposal': return 'Improper Disposal';
      case 'schedule-question': return 'Schedule Question';
      case 'general-feedback': return 'General Feedback';
      case 'suggestion': return 'Suggestion';
      default: return 'General Feedback';
    }
  };

  const getUrgencyValue = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'LOW';
      case 'medium': return 'MEDIUM';
      case 'high': return 'HIGH';
      default: return 'MEDIUM';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const feedbackData = {
        subject: subject,
        description: message,
        feedback_type: getFeedbackTypeValue(feedbackType),
        urgency: getUrgencyValue(urgency),
        status: 'NEW' as const,
        user_id: user.id
      };

      const { error } = await supabase
        .from('feedback')
        .insert(feedbackData);

      if (error) throw error;
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback. We'll review it shortly.",
      });
      
      // Reset form
      setFeedbackType('');
      setSubject('');
      setMessage('');
      setUrgency('');
      
      // Call the callback if provided
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem submitting your feedback. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType} required>
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missed-collection">Missed Collection</SelectItem>
                <SelectItem value="improper-disposal">Improper Disposal</SelectItem>
                <SelectItem value="schedule-question">Schedule Question</SelectItem>
                <SelectItem value="general-feedback">General Feedback</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              placeholder="Brief description of your feedback" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Detailed Description</Label>
            <Textarea
              id="message"
              placeholder="Please provide detailed information about your feedback or issue"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Urgency Level</Label>
            <RadioGroup value={urgency} onValueChange={setUrgency} required>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="urgency-low" />
                  <Label htmlFor="urgency-low">Low - General feedback or suggestion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="urgency-medium" />
                  <Label htmlFor="urgency-medium">Medium - Issue that needs attention but not urgent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="urgency-high" />
                  <Label htmlFor="urgency-high">High - Urgent issue requiring immediate attention</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FeedbackForm;
