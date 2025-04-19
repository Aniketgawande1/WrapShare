// client/src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-black text-white px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">FileHub</div>
          <div className="space-x-4">
            <Link to="/login" className="hover:text-gray-300">Login</Link>
            <Link to="/register" className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8">Real-Time File Sharing Made Simple</h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-600">
          Create private rooms, share files instantly, and collaborate securely with anyone around the world.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register" className="bg-black text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-800">
            Get Started
          </Link>
          <Link to="/how-it-works" className="border-2 border-black px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-100">
            How It Works
          </Link>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-10 mt-20">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="bg-black text-white p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Private Rooms</h3>
            <p className="text-gray-600">Create secure rooms with unique IDs that only your invited users can access.</p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="bg-black text-white p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Sharing</h3>
            <p className="text-gray-600">Upload and share files in real-time with zero delays or complicated setup.</p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="bg-black text-white p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Access</h3>
            <p className="text-gray-600">Share with anyone, anywhere with just a simple room ID or QR code.</p>
          </div>
        </div>
      </section>
    </div>
  );
}