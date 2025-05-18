
import React from 'react';
import ProfileForm from '@/components/resident/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useResidentInfo } from '@/hooks/useResidentInfo';

const ResidentProfile = () => {
  const { data: residentInfo, isLoading } = useResidentInfo();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Profile</h1>
        <p className="text-muted-foreground">Update your personal information and contact details.</p>
      </div>
      
      <ProfileForm />
    </div>
  );
};

export default ResidentProfile;
