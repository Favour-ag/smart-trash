
import React from 'react';
import ResidentsTable from '@/components/admin/ResidentsTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const AdminResidents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Residents</h1>
        <p className="text-muted-foreground">View and manage resident information and payment status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Residents</CardTitle>
          <CardDescription>List of all registered residents and their payment status.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResidentsTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResidents;
