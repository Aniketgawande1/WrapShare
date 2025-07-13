// client/src/pages/HowItWorks.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-black text-white px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">FileHub</Link>
          <div className="space-x-4">
            <Link to="/login" className="hover:text-gray-300">Login</Link>
            <Link to="/register" className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* How It Works Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How FileHub Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share files instantly and securely with anyone, anywhere in the world in just a few simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Create Account & Login</h3>
                <p className="text-gray-600 text-lg">
                  Sign up for free with just your email and password. Login to access your dashboard where you can manage all your file sharing activities.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-600">Quick & Easy Registration</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Create or Join a Room</h3>
                <p className="text-gray-600 text-lg">
                  Create a new private room or join an existing one using a room ID. Each room is secure and only accessible to invited members.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-8-2v2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2" />
                  </svg>
                  <p className="text-gray-600">Secure Private Rooms</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Upload & Share Files</h3>
                <p className="text-gray-600 text-lg">
                  Drag and drop or click to upload any file type. Your files are instantly available to all room members in real-time.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <p className="text-gray-600">Instant File Sharing</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-2xl font-bold mb-4">Download & Collaborate</h3>
                <p className="text-gray-600 text-lg">
                  Download files instantly with one click. See who's online, track file activity, and collaborate in real-time with team members.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600">Real-time Collaboration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FileHub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Secure</h3>
              <p className="text-gray-600">End-to-end encryption and private rooms ensure your files are always safe.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Real-time sharing with instant notifications and zero delays.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Access</h3>
              <p className="text-gray-600">Share with anyone, anywhere in the world with just a room ID.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of users who trust FileHub for their file sharing needs.</p>
          <div className="space-x-4">
            <Link to="/register" className="bg-black text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-800">
              Start Free Today
            </Link>
            <Link to="/" className="border-2 border-gray-300 px-8 py-4 rounded-md text-lg font-semibold hover:bg-gray-50">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
