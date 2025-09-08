import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Build Your Perfect Study Plan with AI
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Get a personalized study schedule that prioritizes your topics, manages your time, and even suggests resources. Just enter your goals and let the AI do the rest.
          </p>
          
          {/* CTA Button */}
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary-deep text-primary-foreground text-lg px-8 py-4 mb-16"
          >
            Start Planning Now →
          </Button>
          
          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                🧠 Intelligent Scheduling
              </h3>
              <p className="text-muted-foreground">
                AI-powered plan based on topic priority & available time.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                🔄 Spaced Repetition
              </h3>
              <p className="text-muted-foreground">
                Automatic review sessions to help you remember better.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                📚 Resource Guidance
              </h3>
              <p className="text-muted-foreground">
                Get tips on where to learn and how to practice each topic.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                ✨ Simple & Secure
              </h3>
              <p className="text-muted-foreground">
                Easy to use with secure account management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;