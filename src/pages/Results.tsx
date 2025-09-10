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
    
    // Math/Quantitative Subjects - Enhanced detection
    const mathKeywords = [
      'calculus', 'algebra', 'geometry', 'trigonometry', 'probability', 'statistics',
      'maths', 'mathematics', 'differential', 'integral', 'linear algebra', 'discrete math',
      'numerical analysis', 'real analysis', 'complex analysis', 'topology', 'number theory',
      'matrix', 'vector', 'derivative', 'integration', 'limit', 'function', 'equation',
      'graph theory', 'combinatorics', 'optimization', 'mathematical modeling'
    ];
    
    // Programming/Technical Subjects - Enhanced detection  
    const programmingKeywords = [
      'python', 'java', 'javascript', 'c++', 'c#', 'coding', 'programming', 'software',
      'data structures', 'algorithms', 'html', 'css', 'react', 'node', 'angular', 'vue',
      'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural networks',
      'database', 'sql', 'web development', 'mobile development', 'api', 'backend', 'frontend',
      'devops', 'cloud computing', 'cybersecurity', 'blockchain', 'data science', 'big data'
    ];
    
    if (mathKeywords.some(keyword => lowerTopic.includes(keyword))) {
      return 'MATH';
    }
    
    if (programmingKeywords.some(keyword => lowerTopic.includes(keyword))) {
      return 'PROGRAMMING';
    }
    
    // Theory/Conceptual Subjects (default for most other subjects)
    return 'THEORY';
  };

  const generateKeyTerms = (topicName: string, level: string) => {
    const lowerTopic = topicName.toLowerCase();
    const category = categorizeSubject(topicName);
    
    // Math/Quantitative Topics
    if (category === 'MATH') {
      if (lowerTopic.includes('calculus')) {
        return ['limits', 'derivatives', 'integrals', 'fundamental theorem of calculus', 'chain rule', 'integration by parts'];
      } else if (lowerTopic.includes('algebra')) {
        return ['variables', 'equations', 'functions', 'polynomials', 'factoring', 'graphing'];
      } else if (lowerTopic.includes('probability')) {
        return ['sample space', 'events', 'conditional probability', 'bayes theorem', 'distributions', 'expected value'];
      } else if (lowerTopic.includes('statistics')) {
        return ['mean', 'median', 'standard deviation', 'hypothesis testing', 'regression', 'correlation'];
      } else if (lowerTopic.includes('linear algebra')) {
        return ['vectors', 'matrices', 'eigenvalues', 'linear transformations', 'vector spaces', 'determinants'];
      } else {
        return ['formulas', 'proofs', 'problem-solving techniques', 'mathematical reasoning'];
      }
    }
    
    // Programming/Technical Topics
    else if (category === 'PROGRAMMING') {
      if (lowerTopic.includes('python')) {
        return ['loops', 'functions', 'list comprehensions', 'OOP', 'modules', 'exception handling'];
      } else if (lowerTopic.includes('java')) {
        return ['classes', 'objects', 'inheritance', 'polymorphism', 'interfaces', 'exception handling'];
      } else if (lowerTopic.includes('javascript')) {
        return ['functions', 'objects', 'arrays', 'DOM manipulation', 'async/await', 'closures'];
      } else if (lowerTopic.includes('data structures')) {
        return ['arrays', 'linked lists', 'stacks', 'queues', 'trees', 'graphs', 'hash tables'];
      } else if (lowerTopic.includes('algorithms')) {
        return ['time complexity', 'space complexity', 'sorting', 'searching', 'recursion', 'dynamic programming'];
      } else if (lowerTopic.includes('machine learning')) {
        return ['supervised learning', 'unsupervised learning', 'neural networks', 'feature engineering', 'model evaluation'];
      } else {
        return ['syntax', 'debugging', 'best practices', 'code organization', 'testing'];
      }
    }
    
    // Theoretical/Conceptual Topics
    else {
      if (lowerTopic.includes('history of ai')) {
        return ['Turing Test', 'Alan Turing', 'John McCarthy', 'AI winter', 'machine learning evolution', 'expert systems'];
      } else if (lowerTopic.includes('environmental science')) {
        return ['ecosystem', 'biodiversity', 'climate change', 'sustainability', 'pollution', 'conservation'];
      } else if (lowerTopic.includes('email writing')) {
        return ['subject lines', 'professional tone', 'structure', 'etiquette', 'call to action', 'formatting'];
      } else if (lowerTopic.includes('psychology')) {
        return ['cognitive processes', 'behavioral theories', 'research methods', 'key theorists', 'applications'];
      } else if (lowerTopic.includes('economics')) {
        return ['supply and demand', 'market structures', 'fiscal policy', 'monetary policy', 'elasticity'];
      } else {
        return ['key concepts', 'definitions', 'theories', 'applications', 'case studies'];
      }
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

  const getTopicResources = (topicName: string, academicLevel: string) => {
    // Clean topic name for better suggestions (remove "Review" suffix if present)
    const cleanTopicName = topicName.replace(' Review', '');
    const category = categorizeSubject(cleanTopicName);
    
    // Generate context-aware key concepts
    const keyTerms = generateKeyTerms(cleanTopicName, academicLevel);
    const levelSpecificBook = generateBookSuggestion(cleanTopicName, academicLevel);
    
    // Math/Quantitative Topics
    if (category === 'MATH') {
      return {
        howToLearn: [
          "Focus on deriving formulas and solving step-by-step problems. Watch videos that trace the logic from first principles.",
          `Search for "${cleanTopicName} derivation explained" and "${cleanTopicName} step by step solutions"`,
          "Practice writing out complete solutions, don't skip steps even if they seem obvious"
        ],
        practice: {
          amount: "Aim for 20-30 varied problems daily",
          resources: [
            `Search for "${cleanTopicName} problem set with solutions PDF"`,
            `Look for "${cleanTopicName} ${academicLevel} practice problems"`,
            "Focus on problems that build from basic to advanced difficulty"
          ]
        },
        keyConcepts: keyTerms,
        bookSuggestions: [
          levelSpecificBook,
          `Search for "${cleanTopicName} ${academicLevel} textbook PDF"`,
          "Look for solution manuals to verify your problem-solving approach"
        ]
      };
    }
    
    // Programming/Technical Topics  
    else if (category === 'PROGRAMMING') {
      return {
        howToLearn: [
          "You must code along. Build a small project. Don't just watch tutorials passively.",
          `Search for "${cleanTopicName} project tutorial for beginners"`,
          "Set up your development environment and practice immediately after learning each concept"
        ],
        practice: {
          amount: "Build 2-3 projects and solve coding problems daily",
          resources: [
            `Solve problems on LeetCode or HackerRank tagged "${cleanTopicName}"`,
            `Search for "${cleanTopicName} coding challenges" and "${cleanTopicName} mini projects"`,
            "Build a portfolio project to demonstrate your understanding"
          ]
        },
        keyConcepts: keyTerms,
        bookSuggestions: [
          levelSpecificBook,
          `Look for hands-on books with projects for ${cleanTopicName}`,
          "GitHub repositories with example projects and code samples"
        ]
      };
    }
    
    // Theoretical/Conceptual Topics
    else {
      return {
        howToLearn: [
          "Create mind maps or flashcards for key terms. Watch documentary-style explanations.",
          `Search for "${cleanTopicName} ${academicLevel} concepts overview"`,
          "Focus on understanding relationships between concepts rather than memorizing facts"
        ],
        practice: {
          amount: "Focus on past exam questions and case studies",
          resources: [
            `Search for "${cleanTopicName} important questions ${academicLevel}"`,
            `Look for "${cleanTopicName} ${academicLevel} question bank PDF"`,
            "Practice writing detailed answers and explaining concepts in your own words"
          ]
        },
        keyConcepts: keyTerms,
        bookSuggestions: [
          levelSpecificBook,
          `Search for "${cleanTopicName} ${academicLevel} study guide"`,
          "Academic journals and research papers for deeper understanding"
        ]
      };
    }
  };

  const generateResourceGuide = (topicName: string) => {
    if (!studyPlanData) return null;

    const resources = getTopicResources(topicName, studyPlanData.academicLevel);
    
    return {
      freeResources: resources.howToLearn,
      bookSuggestions: resources.bookSuggestions,
      keyTerms: resources.keyConcepts,
      practiceQuestions: {
        howMany: resources.practice.amount,
        wherToFind: resources.practice.resources
      },
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