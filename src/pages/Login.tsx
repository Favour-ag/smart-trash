
import React from 'react';
import Header from '@/components/Header';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 page-background">
        <div className="w-full">
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default Login;
