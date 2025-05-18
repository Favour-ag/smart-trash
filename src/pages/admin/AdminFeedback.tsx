
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Search, CheckCircle, XCircle, MessageCircleReply } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Feedback {
  id: string;
  subject: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  user_id: string;
  admin_response: string | null;
  feedback_type: string | null;
  urgency: string | null;
  area_id: string | null;
}

interface UserData {
  [key: string]: {
    fullName: string;
    email: string;
  }
}

const AdminFeedback = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [filteredItems, setFilteredItems] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData>({});
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
    
    // Set up realtime subscription for feedback updates
    const channel = supabase
      .channel('admin-feedback-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'feedback'
        }, 
        () => {
          fetchFeedback();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (feedbackItems.length > 0) {
      const userIds = [...new Set(feedbackItems.map(item => item.user_id))];
      fetchUserData(userIds);
    }
  }, [feedbackItems]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, activeTab, feedbackItems]);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFeedbackItems(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load feedback',
        description: 'There was a problem loading the feedback data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (error) throw error;

      const newUserData: UserData = {};
      data?.forEach(user => {
        newUserData[user.id] = {
          fullName: user.full_name,
          email: user.email
        };
      });

      setUserData(newUserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const filterItems = () => {
    let filtered = [...feedbackItems];
    
    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => {
        if (activeTab === 'new') return item.status === 'NEW';
        if (activeTab === 'in-progress') return item.status === 'IN_PROGRESS';
        if (activeTab === 'resolved') return item.status === 'RESOLVED';
        return true;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.subject.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) || 
        userData[item.user_id]?.fullName.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
  };

  const handleStatusChange = async (id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Feedback marked as ${status.toLowerCase()}.`,
      });
      
      fetchFeedback();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: 'There was a problem updating the feedback status.',
      });
    }
  };

  const openResponseDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.admin_response || '');
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('feedback')
        .update({
          admin_response: adminResponse,
          status: 'IN_PROGRESS' as const, // Using const assertion to specify literal type
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;
      
      toast({
        title: 'Response saved',
        description: 'Your response has been saved and sent to the resident.',
      });
      
      setResponseDialogOpen(false);
      fetchFeedback();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'There was a problem sending your response.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">New</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string | null) => {
    if (!urgency) return null;
    
    switch (urgency.toUpperCase()) {
      case 'HIGH':
        return <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
        <p className="text-muted-foreground">Review and respond to resident feedback.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Resident Feedback</CardTitle>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search feedback..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No feedback items found.
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Type</TableHead>
                        <TableHead className="hidden lg:table-cell">Urgency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map(feedback => (
                        <TableRow key={feedback.id}>
                          <TableCell className="font-medium">{feedback.subject}</TableCell>
                          <TableCell>
                            {userData[feedback.user_id]?.fullName || "Unknown User"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {feedback.feedback_type || "General"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {getUrgencyBadge(feedback.urgency)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => openResponseDialog(feedback)}
                              >
                                <MessageCircleReply className="h-4 w-4" />
                              </Button>
                              {feedback.status !== 'RESOLVED' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600"
                                  onClick={() => handleStatusChange(feedback.id, 'RESOLVED')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {feedback.status !== 'REJECTED' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => handleStatusChange(feedback.id, 'REJECTED')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Subject</p>
                <p className="text-base">{selectedFeedback.subject}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedFeedback.description}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Response</p>
                <Textarea 
                  value={adminResponse} 
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={5}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitResponse} 
              disabled={isSubmitting || !adminResponse.trim()}
            >
              {isSubmitting ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;
