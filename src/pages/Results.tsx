import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Header from '@/components/Header';

interface Topic {
  id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  hours: number;
}

interface ScheduleSession {
  hours: number;
  type: 'NEW' | 'REVIEW';
}

interface TopicSchedule {
  topicName: string;
  sessions: ScheduleSession[];
  totalHours: number;
}

interface DaySchedule {
  date: string;
  dayNumber: number;
  topics: TopicSchedule[];
  totalScheduledHours: number;
  availableHours: number;
}

interface StudyPlanData {
  examDate: string;
  studyHours: string;
  academicLevel: string;
  topics: Topic[];
  schedule: DaySchedule[];
}

const Results = () => {
  const location = useLocation();
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanData | null>(null);

  useEffect(() => {
    if (location.state) {
      setStudyPlanData(location.state as StudyPlanData);
    }
  }, [location.state]);

  const toggleResourceGuide = (topicName: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedResources(newExpanded);
  };

  const categorizeSubject = (topicName: string) => {
    const lowerTopic = topicName.toLowerCase();
    
    // Math/Quantitative Subjects
    if (lowerTopic.includes('calculus') || lowerTopic.includes('algebra') || 
        lowerTopic.includes('geometry') || lowerTopic.includes('trigonometry') || 
        lowerTopic.includes('probability') || lowerTopic.includes('statistics') || 
        lowerTopic.includes('maths') || lowerTopic.includes('mathematics') ||
        lowerTopic.includes('differential') || lowerTopic.includes('integral')) {
      return 'MATH';
    }
    
    // Programming/Technical Subjects
    if (lowerTopic.includes('python') || lowerTopic.includes('java') || 
        lowerTopic.includes('javascript') || lowerTopic.includes('coding') || 
        lowerTopic.includes('programming') || lowerTopic.includes('data structures') || 
        lowerTopic.includes('algorithms') || lowerTopic.includes('software') ||
        lowerTopic.includes('html') || lowerTopic.includes('css') ||
        lowerTopic.includes('react') || lowerTopic.includes('node')) {
      return 'PROGRAMMING';
    }
    
    // Theory/Conceptual Subjects (default for most other subjects)
    return 'THEORY';
  };

  const generateKeyTerms = (topicName: string, level: string) => {
    // Level-appropriate inference of key terms based on topic name and academic level
    const lowerTopic = topicName.toLowerCase();
    const lowerLevel = level.toLowerCase();
    
    if (lowerTopic.includes('calculus')) {
      if (lowerLevel.includes('class 11') || lowerLevel.includes('class 12')) {
        return ['limits', 'derivatives', 'applications of derivatives'];
      } else if (lowerLevel.includes('engineering') || lowerLevel.includes('university')) {
        return ['differential calculus', 'integral calculus', 'multivariable calculus'];
      } else {
        return ['derivatives', 'integrals', 'limits'];
      }
    } else if (lowerTopic.includes('algebra')) {
      if (lowerLevel.includes('class 9') || lowerLevel.includes('class 10')) {
        return ['linear equations', 'quadratic equations', 'polynomials'];
      } else {
        return ['equations', 'variables', 'functions'];
      }
    } else if (lowerTopic.includes('shakespeare')) {
      if (lowerLevel.includes('class 9') || lowerLevel.includes('icse') || lowerLevel.includes('cbse')) {
        return ['Macbeth themes', 'character analysis', 'plot summary'];
      } else if (lowerLevel.includes('ma') || lowerLevel.includes('literature')) {
        return ['critical analysis', 'literary devices', 'contextual interpretation'];
      } else {
        return ['themes', 'characters', 'literary techniques'];
      }
    } else if (lowerTopic.includes('physics')) {
      if (lowerLevel.includes('class 11') || lowerLevel.includes('class 12')) {
        return ['mechanics', 'thermodynamics', 'electromagnetism'];
      } else {
        return ['forces', 'energy', 'motion'];
      }
    } else if (lowerTopic.includes('chemistry')) {
      return ['molecules', 'reactions', 'bonds'];
    } else if (lowerTopic.includes('biology')) {
      return ['cells', 'genetics', 'evolution'];
    } else if (lowerTopic.includes('programming') || lowerTopic.includes('coding')) {
      if (lowerLevel.includes('1st year') || lowerLevel.includes('beginner')) {
        return ['syntax', 'variables', 'loops'];
      } else {
        return ['algorithms', 'data structures', 'debugging'];
      }
    } else if (lowerTopic.includes('history')) {
      return ['timeline', 'causes', 'effects'];
    } else if (lowerTopic.includes('english') || lowerTopic.includes('literature')) {
      return ['themes', 'analysis', 'structure'];
    } else {
      // Generic terms based on the topic name itself
      return [topicName.toLowerCase(), 'concepts', 'applications'];
    }
  };

  const generateBookSuggestion = (topicName: string, level: string) => {
    const lowerTopic = topicName.toLowerCase();
    const lowerLevel = level.toLowerCase();
    
    if (lowerTopic.includes('calculus')) {
      if (lowerLevel.includes('engineering') || lowerLevel.includes('university')) {
        return "Thomas' Calculus or Stewart's Calculus";
      } else if (lowerLevel.includes('class 12') || lowerLevel.includes('cbse')) {
        return "RD Sharma Class 12 Mathematics";
      } else {
        return "Introduction to Calculus";
      }
    } else if (lowerTopic.includes('algebra')) {
      if (lowerLevel.includes('class 10') || lowerLevel.includes('cbse')) {
        return "RD Sharma Class 10 Mathematics";
      } else {
        return "Elementary Algebra";
      }
    } else if (lowerTopic.includes('physics')) {
      if (lowerLevel.includes('class 12') || lowerLevel.includes('cbse')) {
        return "HC Verma Concepts of Physics";
      } else if (lowerLevel.includes('engineering')) {
        return "Resnick, Halliday & Walker Physics";
      } else {
        return "Fundamentals of Physics";
      }
    } else if (lowerTopic.includes('programming') && lowerTopic.includes('python')) {
      return "Automate the Boring Stuff with Python or Python Crash Course";
    } else {
      return `Introduction to ${topicName} or Fundamentals of ${topicName}`;
    }
  };

  const generateResourceGuide = (topicName: string) => {
    if (!studyPlanData) return null;

    // Clean topic name for better suggestions (remove "Review" suffix if present)
    const cleanTopicName = topicName.replace(' Review', '');
    const category = categorizeSubject(cleanTopicName);
    
    // Generate smart study suggestions based on category, topic name and academic level
    const keyTerms = generateKeyTerms(cleanTopicName, studyPlanData.academicLevel);
    const levelSpecificBook = generateBookSuggestion(cleanTopicName, studyPlanData.academicLevel);
    
    // Category-specific advice
    let howToLearn, practiceAdvice, bookAdvice;
    
    if (category === 'MATH') {
      howToLearn = [
        "Focus on understanding formulas and practicing derivations. Watch videos that solve problems step-by-step.",
        `Search for "${cleanTopicName} ${studyPlanData.academicLevel} solved examples" on YouTube`,
        "Don't just memorize - understand the logic behind each step"
      ];
      practiceAdvice = {
        howMany: "20-30 problems per day",
        wherToFind: [
          `Search for "${cleanTopicName} problem set with solutions"`,
          `Look for "${cleanTopicName} ${studyPlanData.academicLevel} practice worksheet PDF"`,
          "Practice is key - solve problems daily to build muscle memory"
        ]
      };
      bookAdvice = `For ${studyPlanData.academicLevel}, common books are "${levelSpecificBook}". Search for "engineering mathematics 1 book pdf" or similar.`;
    } else if (category === 'PROGRAMMING') {
      howToLearn = [
        "You must code along with the tutorial. Don't just watch.",
        `Search for "${cleanTopicName} projects for beginners" or "${cleanTopicName} crash course"`,
        "Set up a development environment and practice coding immediately"
      ];
      practiceAdvice = {
        howMany: "Build 2-3 small projects",
        wherToFind: [
          "Solve problems on platforms like HackerRank or LeetCode for this topic",
          `Search for "${cleanTopicName} coding challenges" or "${cleanTopicName} mini projects"`,
          "GitHub has tons of beginner-friendly project ideas"
        ]
      };
      bookAdvice = `Look for practical books like "Automate the Boring Stuff with Python" or "Head First Java" depending on your language.`;
    } else { // THEORY subjects
      howToLearn = [
        "Focus on concepts, definitions, and case studies. Watch documentary-style videos or overview lectures.",
        `Search for "${cleanTopicName} ${studyPlanData.academicLevel} concepts explained" on YouTube`,
        "Create mind maps to connect related concepts"
      ];
      practiceAdvice = {
        howMany: "Focus on long and short answer questions",
        wherToFind: [
          `Search for "${cleanTopicName} important questions" or "${cleanTopicName} notes"`,
          `Look for "${studyPlanData.academicLevel} ${cleanTopicName} question bank PDF"`,
          "Practice explaining concepts in your own words"
        ]
      };
      bookAdvice = `Look for textbooks by your university's prescribed author. Search for "${cleanTopicName} textbook pdf" or "${studyPlanData.academicLevel} ${cleanTopicName} notes".`;
    }
    
    return {
      freeResources: howToLearn,
      bookSuggestions: [
        bookAdvice,
        `Search for "${cleanTopicName} ${studyPlanData.academicLevel} textbook PDF" on Google Scholar`,
        `Check your library for books specifically recommended for ${studyPlanData.academicLevel} students`
      ],
      keyTerms,
      practiceQuestions: practiceAdvice,
      flashcards: {
        count: "5-7 flashcards",
        suggestion: "Use Anki or Quizlet to create digital flashcards for key terms and definitions"
      }
    };
  };

  if (!studyPlanData || !studyPlanData.schedule || studyPlanData.schedule.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">No Study Plan Found</h2>
          <p className="text-muted-foreground mb-6">Please go back and create your study plan.</p>
          <Link to="/planner">
            <Button>← Create a New Plan</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Your AI-Powered Study Plan</h1>
            <Link to="/planner">
              <Button variant="outline" className="mb-6">
                ← Create a New Plan
              </Button>
            </Link>
          </div>

          {/* Study Plan Display */}
          <div className="space-y-6">
            {studyPlanData.schedule.map((day) => (
              <Card key={day.dayNumber} className="border-2 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">
                    Day {day.dayNumber}: {day.date} - {day.totalScheduledHours} / {day.availableHours} Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {day.topics.map((topic, topicIndex) => (
                    <div key={`${day.dayNumber}-${topicIndex}`} className="space-y-2">
                      <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-foreground">{topic.topicName}</h4>
                          <p className="text-sm text-muted-foreground">({topic.totalHours} hours total)</p>
                          <div className="mt-2 space-y-1">
                            {topic.sessions.map((session, sessionIndex) => (
                              <div 
                                key={sessionIndex}
                                className={`text-sm px-2 py-1 rounded ${
                                  session.type === 'NEW' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-success text-success-foreground'
                                }`}
                              >
                                {session.hours} hour{session.hours > 1 ? 's' : ''} - {session.type === 'NEW' ? 'New Material' : 'Review from 2 days ago'}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleResourceGuide(topic.topicName)}
                          className="ml-4"
                        >
                          📚 Get Resources
                        </Button>
                      </div>

                      {/* Resource Guide */}
                      <Collapsible open={expandedResources.has(topic.topicName)}>
                        <CollapsibleContent>
                          {(() => {
                            const guide = generateResourceGuide(topic.topicName);
                            if (!guide) return null;

                            return (
                              <div className="mt-3 p-4 bg-accent rounded-lg border-l-4 border-primary">
                                <h5 className="font-semibold text-accent-foreground mb-3">
                                  🧠 Smart Study Guide for {topic.topicName} ({studyPlanData.academicLevel})
                                </h5>
                                
                                <div className="space-y-4 text-sm">
                                  <div>
                                    <h6 className="font-medium text-accent-foreground mb-2">1. How to Learn This for Your Level:</h6>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                      {guide.freeResources.map((resource, i) => (
                                        <li key={i}>{resource}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h6 className="font-medium text-accent-foreground mb-2">2. Practice Questions:</h6>
                                    <p className="text-muted-foreground mb-2">
                                      <strong>How Many:</strong> {guide.practiceQuestions.howMany}
                                    </p>
                                    <p className="text-muted-foreground mb-2"><strong>Where to Find Them:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                      {guide.practiceQuestions.wherToFind.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h6 className="font-medium text-accent-foreground mb-2">3. Book Suggestions:</h6>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                      {guide.bookSuggestions.map((book, i) => (
                                        <li key={i}>{book}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h6 className="font-medium text-accent-foreground mb-2">4. Key Concepts to Focus On:</h6>
                                    <div className="flex flex-wrap gap-2">
                                      {guide.keyTerms.map((term, i) => (
                                        <span key={i} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                                          {term}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h6 className="font-medium text-accent-foreground mb-2">5. Make Flashcards:</h6>
                                    <p className="text-muted-foreground">
                                      <strong>Create {guide.flashcards.count}</strong> for the key terms and definitions.
                                    </p>
                                    <p className="text-muted-foreground">{guide.flashcards.suggestion}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                  
                  {day.topics.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No study sessions scheduled for this day</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;