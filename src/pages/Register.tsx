
import React from 'react';
import Header from '@/components/Header';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 page-background">
        <div className="w-full">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
};

export default Register;
