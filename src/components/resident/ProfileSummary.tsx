
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Home, AlertCircle } from 'lucide-react';
import { useResidentInfo, ResidentInfo } from '@/hooks/useResidentInfo';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSummaryProps {
  compact?: boolean;
}

const ProfileSummary = ({ compact = false }: ProfileSummaryProps) => {
  const { data: residentInfo, isLoading, error } = useResidentInfo();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!residentInfo) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Profile</CardTitle>
          <CardDescription>Please complete your profile information</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-amber-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">Profile incomplete</span>
            </div>
            <Link to="/resident/profile">
              <Button size="sm" variant="outline" className="text-tw-purple-600 border-tw-purple-200 hover:bg-tw-purple-50">
                Complete Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar>
              <AvatarImage src={residentInfo.profile_photo_url || undefined} />
              <AvatarFallback className="bg-tw-purple-100 text-tw-purple-800">
                {residentInfo.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{residentInfo.full_name}</p>
              {residentInfo.occupation && (
                <p className="text-xs text-muted-foreground">{residentInfo.occupation}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2 text-tw-purple-500" />
              <span className="text-sm">{residentInfo.street_address}, {residentInfo.house_number}</span>
            </div>
            <div className="flex justify-end">
              <Link to="/resident/profile">
                <Button size="sm" variant="ghost" className="text-tw-purple-600 hover:text-tw-purple-800">
                  Manage Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Your residence information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={residentInfo.profile_photo_url || undefined} />
              <AvatarFallback className="bg-tw-purple-100 text-tw-purple-800 text-xl">
                {residentInfo.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{residentInfo.full_name}</h3>
              {residentInfo.occupation && (
                <p className="text-sm text-muted-foreground">{residentInfo.occupation}</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
            <div className="flex items-center">
              <Home className="h-5 w-5 mr-2 text-tw-purple-500" />
              <span>{residentInfo.street_address}, {residentInfo.house_number}</span>
            </div>
          </div>
          
          <div className="pt-2">
            <Link to="/resident/profile">
              <Button size="sm" variant="outline" className="w-full text-tw-purple-600 border-tw-purple-200 hover:bg-tw-purple-50">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;
