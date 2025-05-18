
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type AuthCardProps = {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const AuthCard = ({ title, description, footer, children }: AuthCardProps) => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-gray-100">
      <CardHeader className="bg-gradient-to-r from-tw-purple-50 to-tw-purple-100 rounded-t-lg">
        <CardTitle className="text-tw-purple-800">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
      {footer && <CardFooter className="bg-gray-50">{footer}</CardFooter>}
    </Card>
  );
};

export default AuthCard;
