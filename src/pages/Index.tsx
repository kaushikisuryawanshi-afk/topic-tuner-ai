import React from 'react';
import Header from '@/components/Header';
import { StudyPlannerForm } from '@/components/StudyPlannerForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto">
        <StudyPlannerForm />
      </main>
    </div>
  );
};

export default Index;