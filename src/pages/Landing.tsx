import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-blue-800 mb-6">
            Build Your Perfect Study Plan with AI
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get a personalized study schedule that prioritizes your topics, manages your time, and even suggests resources. Just enter your goals and let the AI do the rest.
          </p>
          
          {/* CTA Button */}
          <Link to="/planner">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 mb-16">
              Start Planning Now →
            </Button>
          </Link>
          
          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                🧠 Intelligent Scheduling
              </h3>
              <p className="text-slate-600">
                AI-powered plan based on topic priority & available time.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                🔄 Spaced Repetition
              </h3>
              <p className="text-slate-600">
                Automatic review sessions to help you remember better.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                📚 Resource Guidance
              </h3>
              <p className="text-slate-600">
                Get tips on where to learn and how to practice each topic.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                ✨ Simple & Free
              </h3>
              <p className="text-slate-600">
                Easy to use, with no sign-up required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;