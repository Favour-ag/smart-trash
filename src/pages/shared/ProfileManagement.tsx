
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const ProfileManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street, Anytown, ST 12345',
    bio: 'Resident of Anytown since 2020. Passionate about recycling and waste reduction.',
    avatarUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    setIsEditing(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handleCancel = () => {
    // Reset to original values
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground">Manage your account information and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-4xl">{profile.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Change Photo</Button>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-2">
            <div className="flex flex-col w-full">
              <span className="font-medium text-sm">Member Since</span>
              <span className="text-muted-foreground text-sm">May 2025</span>
            </div>
            <div className="flex flex-col w-full">
              <span className="font-medium text-sm">Last Login</span>
              <span className="text-muted-foreground text-sm">Today at 10:34 AM</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
            <div className="flex justify-end">
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter className="justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Change Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileManagement;
