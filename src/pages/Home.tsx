
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-tw-green-50 via-white to-tw-blue-50 py-16 md:py-24">
          <div className="tw-container">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-tw-green-800">
                  Smart Waste Management for Communities
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  TrashWise helps communities manage waste collection efficiently with 
                  schedules, notifications, and feedback systems.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-tw-green-600 hover:bg-tw-green-700">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-tw-green-600 text-tw-green-600">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Waste Management" 
                  className="w-full h-auto rounded-xl" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="tw-section bg-white">
          <div className="tw-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-tw-green-800 mb-4">How TrashWise Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform simplifies waste management for both residents and administrators.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="tw-card flex flex-col items-center text-center">
                <div className="bg-tw-green-100 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tw-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Schedule Management</h3>
                <p className="text-gray-600">View your collection schedule and get notified before collection days.</p>
              </div>

              <div className="tw-card flex flex-col items-center text-center">
                <div className="bg-tw-blue-100 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tw-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Feedback System</h3>
                <p className="text-gray-600">Report issues, submit feedback, and rate the collection service.</p>
              </div>

              <div className="tw-card flex flex-col items-center text-center">
                <div className="bg-tw-green-100 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tw-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-gray-600">Access insights on collection efficiency and community feedback.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="tw-section bg-tw-green-700 text-white">
          <div className="tw-container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to improve waste management in your community?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Join TrashWise today and start enjoying a cleaner, more organized community waste collection system.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-tw-green-700 hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="tw-container">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">TrashWise</h3>
              <p>Smart waste management for modern communities.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Contact Us</h3>
              <p>Email: info@trashwise.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p>© 2025 TrashWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
