
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, MoreVertical, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAreas } from '@/hooks/useAreas';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RESIDENT"; // Ensuring we use the correct type here
  status: string;
  area: string;
  joined: string;
}

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles which include user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Transform the data to match our UI needs
      const transformedUsers = profiles.map((profile) => ({
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role as "ADMIN" | "RESIDENT", // Type assertion to ensure correct type
        status: 'active', // We'll assume all fetched users are active
        area: profile.address || 'Not set',
        joined: format(new Date(profile.created_at), 'MMM d, yyyy')
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load users',
        description: 'There was an error loading the user data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => {
          console.log('Profiles change detected:', payload);
          // Refresh user list when there's a change
          fetchUsers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateUserRole = async (userId: string, newRole: "ADMIN" | "RESIDENT") => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole.toLowerCase()}.`,
      });
      
      fetchUsers(); // Refresh users
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update role',
        description: 'There was an error updating the user role. Please try again.',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentTab === 'all') return matchesSearch;
    if (currentTab === 'residents') return matchesSearch && user.role === 'RESIDENT';
    if (currentTab === 'admins') return matchesSearch && user.role === 'ADMIN';
    if (currentTab === 'inactive') return matchesSearch && user.status === 'inactive';
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs pl-8"
            />
          </div>
        </div>
        <Button className="w-full sm:w-auto gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab}>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-4 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No users found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.area}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.joined}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'RESIDENT')}>
                                        <Check className={`mr-2 h-4 w-4 ${user.role === 'RESIDENT' ? 'opacity-100' : 'opacity-0'}`} />
                                        Resident
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'ADMIN')}>
                                        <Check className={`mr-2 h-4 w-4 ${user.role === 'ADMIN' ? 'opacity-100' : 'opacity-0'}`} />
                                        Admin
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                {user.status === 'active' ? (
                                  <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>Activate</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
