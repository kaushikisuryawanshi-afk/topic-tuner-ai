import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const StudyPlannerForm = () => {
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [newTopic, setNewTopic] = useState<{
    name: string;
    priority: 'High' | 'Medium' | 'Low';
    hours: string;
  }>({
    name: '',
    priority: 'Medium',
    hours: ''
  });

  const addTopic = () => {
    if (newTopic.name && newTopic.hours) {
      const topic: Topic = {
        id: Date.now().toString(),
        name: newTopic.name,
        priority: newTopic.priority,
        hours: parseFloat(newTopic.hours)
      };
      setTopics([...topics, topic]);
      setNewTopic({ name: '', priority: 'Medium', hours: '' });
    }
  };

  const removeTopic = (id: string) => {
    setTopics(topics.filter(topic => topic.id !== id));
  };

  const generatePlan = () => {
    // Step 1: Sort topics by priority
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    const sortedTopics = [...topics].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Step 2: Calculate total days
    const today = new Date();
    const examDateObj = new Date(examDate);
    const totalDays = Math.ceil((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      alert('Exam date must be in the future!');
      return;
    }
    
    // Step 3: Create empty day-by-day schedule with new structure
    const dailyHours = parseFloat(studyHours);
    const daySchedules: DaySchedule[] = [];
    const remainingHours: number[] = [];
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      daySchedules.push({
        date: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        dayNumber: i + 1,
        topics: [],
        totalScheduledHours: 0,
        availableHours: dailyHours
      });
      remainingHours.push(dailyHours);
    }
    
    // Step 4: Schedule topics with grouped structure
    const topicsToReview: { topicName: string, firstScheduledDay: number }[] = [];
    
    for (const topic of sortedTopics) {
      let topicHoursLeft = topic.hours;
      
      while (topicHoursLeft > 0) {
        // Find first day with available hours
        let scheduledDay = -1;
        for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
          if (remainingHours[dayIndex] >= 1) {
            scheduledDay = dayIndex;
            break;
          }
        }
        
        if (scheduledDay === -1) {
          alert(`Not enough time to schedule all topics! Consider increasing daily study hours or extending exam date.`);
          return;
        }
        
        // Schedule 1-2 hour block (or remaining hours if less)
        const hoursToSchedule = Math.min(Math.min(2, topicHoursLeft), remainingHours[scheduledDay]);
        
        // Find existing topic in this day or create new one
        let existingTopicIndex = daySchedules[scheduledDay].topics.findIndex(t => t.topicName === topic.name);
        
        if (existingTopicIndex === -1) {
          // Create new topic entry for this day
          daySchedules[scheduledDay].topics.push({
            topicName: topic.name,
            sessions: [{
              hours: hoursToSchedule,
              type: 'NEW'
            }],
            totalHours: hoursToSchedule
          });
        } else {
          // Add to existing topic
          daySchedules[scheduledDay].topics[existingTopicIndex].sessions.push({
            hours: hoursToSchedule,
            type: 'NEW'
          });
          daySchedules[scheduledDay].topics[existingTopicIndex].totalHours += hoursToSchedule;
        }
        
        // Track first scheduled day for review
        if (topicHoursLeft === topic.hours) {
          topicsToReview.push({ topicName: topic.name, firstScheduledDay: scheduledDay });
        }
        
        daySchedules[scheduledDay].totalScheduledHours += hoursToSchedule;
        remainingHours[scheduledDay] -= hoursToSchedule;
        topicHoursLeft -= hoursToSchedule;
      }
    }
    
    // Step 5: Add spaced repetition (review sessions) - 2 days later
    for (const { topicName, firstScheduledDay } of topicsToReview) {
      const reviewDay = firstScheduledDay + 2;
      
      if (reviewDay < totalDays && remainingHours[reviewDay] >= 1) {
        // Find existing topic in review day or create new one
        let existingTopicIndex = daySchedules[reviewDay].topics.findIndex(t => t.topicName === topicName);
        
        if (existingTopicIndex === -1) {
          // Create new topic entry for review
          daySchedules[reviewDay].topics.push({
            topicName: `${topicName} Review`,
            sessions: [{
              hours: 1,
              type: 'REVIEW'
            }],
            totalHours: 1
          });
        } else {
          // Add review session to existing topic
          daySchedules[reviewDay].topics[existingTopicIndex].sessions.push({
            hours: 1,
            type: 'REVIEW'
          });
          daySchedules[reviewDay].topics[existingTopicIndex].totalHours += 1;
        }
        
        daySchedules[reviewDay].totalScheduledHours += 1;
        remainingHours[reviewDay] -= 1;
      }
    }
    
    setSchedule(daySchedules);
  };

  const toggleResourceGuide = (topicName: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName);
    } else {
      newExpanded.add(topicName);
    }
    setExpandedResources(newExpanded);
  };

  const generateResourceGuide = (topicName: string) => {
    // Clean topic name for better suggestions (remove "Review" suffix if present)
    const cleanTopicName = topicName.replace(' Review', '');
    
    // Generate smart study suggestions based on topic name and academic level
    const keyTerms = generateKeyTerms(cleanTopicName, academicLevel);
    const levelSpecificBook = generateBookSuggestion(cleanTopicName, academicLevel);
    
    return {
      freeResources: [
        `Search for "${cleanTopicName} ${academicLevel}" on YouTube. For example, for 'Calculus Class 12', search for 'Calculus Class 12 JEE' or 'Calculus CBSE Boards'`,
        `Look for "${cleanTopicName}" courses on SWAYAM or NPTEL that are tagged for your level (e.g., 'Undergraduate')`,
        `Check Khan Academy for "${cleanTopicName}" content suitable for your academic level`
      ],
      bookSuggestions: [
        `For your level, a common textbook is often "${levelSpecificBook}". Search for its PDF online`,
        `Search for "${cleanTopicName} ${academicLevel} textbook PDF" on Google Scholar`,
        `Check your library for books specifically recommended for ${academicLevel} students`
      ],
      keyTerms,
      practiceQuestions: {
        howMany: "10-15 practice problems",
        wherToFind: [
          `Search for "${cleanTopicName} ${academicLevel} important questions" or "${cleanTopicName} ${academicLevel} worksheet PDF"`,
          `For exam prep, search for "${academicLevel} ${cleanTopicName} previous year papers"`,
          `Check educational websites that specialize in ${academicLevel} level content`
        ]
      },
      flashcards: {
        count: "5-7 flashcards",
        suggestion: "Use Anki or Quizlet to create digital flashcards for key terms and definitions"
      }
    };
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Goal Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">1. Set Your Goal</h2>
        <div className="space-y-2">
          <Label htmlFor="exam-date" className="text-base font-medium">
            Exam Date:
          </Label>
          <Input
            id="exam-date"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            required
            className="w-full max-w-xs"
          />
        </div>
      </section>

      {/* Availability Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">2. Your Availability</h2>
        <div className="space-y-2">
          <Label htmlFor="study-hours" className="text-base font-medium">
            Available Study Hours Per Day:
          </Label>
          <Input
            id="study-hours"
            type="number"
            min="0.5"
            step="0.5"
            value={studyHours}
            onChange={(e) => setStudyHours(e.target.value)}
            required
            className="w-full max-w-xs"
            placeholder="e.g., 3.5"
          />
        </div>
      </section>

      {/* Academic Level Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">3. Academic Level</h2>
        <div className="space-y-2">
          <Label htmlFor="academic-level" className="text-base font-medium">
            Academic Level / Course Context:
          </Label>
          <Input
            id="academic-level"
            type="text"
            value={academicLevel}
            onChange={(e) => setAcademicLevel(e.target.value)}
            required
            className="w-full max-w-md"
            placeholder="e.g., 'Class 10 CBSE', '1st Year Computer Science', 'GMAT Prep', 'Self-Learner'"
          />
        </div>
      </section>

      {/* Topics Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">4. Add Your Topics</h2>
        <p className="text-muted-foreground">
          Enter each topic you need to study, its priority, and how long you think it will take.
        </p>

        {/* Add Topic Form */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="topic-name" className="text-sm font-medium">
              Topic Name
            </Label>
            <Input
              id="topic-name"
              type="text"
              placeholder="e.g., Neural Networks"
              value={newTopic.name}
              onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div className="min-w-[130px] space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={newTopic.priority} onValueChange={(value) => setNewTopic({ ...newTopic, priority: value as 'High' | 'Medium' | 'Low' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="min-w-[100px] space-y-2">
            <Label htmlFor="topic-hours" className="text-sm font-medium">
              Hours
            </Label>
            <Input
              id="topic-hours"
              type="number"
              min="1"
              step="0.5"
              placeholder="Hours"
              value={newTopic.hours}
              onChange={(e) => setNewTopic({ ...newTopic, hours: e.target.value })}
            />
          </div>
          
          <Button 
            variant="success" 
            onClick={addTopic}
            className="mb-0"
          >
            Add Topic
          </Button>
        </div>

        {/* Topics Table */}
        {topics.length > 0 && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Topic Name</th>
                  <th className="text-left p-4 font-semibold">Priority</th>
                  <th className="text-left p-4 font-semibold">Hours</th>
                  <th className="text-left p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id} className="border-t">
                    <td className="p-4 font-medium">{topic.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        topic.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                        topic.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {topic.priority}
                      </span>
                    </td>
                    <td className="p-4">{topic.hours}</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTopic(topic.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Generate Plan Button */}
      <div className="pt-6">
        <Button
          variant="primary-deep"
          size="lg"
          onClick={generatePlan}
          className="w-full max-w-md mx-auto block py-4 text-lg"
          disabled={!examDate || !studyHours || !academicLevel || topics.length === 0}
        >
          Generate My AI Study Plan
        </Button>
      </div>

      {/* AI Study Plan Display */}
      {schedule.length > 0 && (
        <section className="space-y-8 pt-12 border-t-2 border-primary/20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">🎯 Your AI-Powered Study Plan</h1>
            <p className="text-lg text-muted-foreground">
              Intelligent scheduling with spaced repetition for optimal learning
            </p>
          </div>
          
          <div className="space-y-6">
            {schedule.filter(day => day.topics.length > 0).map((day, index) => (
              <Card key={index} className="shadow-lg border-l-4 border-l-primary">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-primary">
                    ## Day {day.dayNumber}: {day.date}
                    <span className="text-base font-normal text-muted-foreground ml-3">
                      - {day.totalScheduledHours} / {day.availableHours} Hours
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {day.topics.map((topicSchedule, topicIndex) => (
                    <div key={topicIndex} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-foreground">
                            **{topicSchedule.topicName}** ({topicSchedule.totalHours} hours total)
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleResourceGuide(topicSchedule.topicName)}
                            className="text-xs"
                          >
                            📚 Get Resources
                          </Button>
                        </div>
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        {topicSchedule.sessions.map((session, sessionIndex) => (
                          <div key={sessionIndex} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-foreground">
                              {session.hours} hour{session.hours !== 1 ? 's' : ''} - 
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.type === 'NEW' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {session.type === 'NEW' ? 'New Material' : 'Review from 2 days ago'}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Resource Guide */}
                      <Collapsible open={expandedResources.has(topicSchedule.topicName)}>
                        <CollapsibleContent className="ml-4 mt-4">
                          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                              <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
                                ### 🧠 Smart Study Guide for {topicSchedule.topicName.replace(' Review', '')} ({academicLevel})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                              {(() => {
                                const guide = generateResourceGuide(topicSchedule.topicName);
                                return (
                                  <>
                                    <div>
                                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        **1. How to Learn This for Your Level:**
                                      </h5>
                                      <div className="space-y-1 ml-4">
                                        <p><strong>YouTube:</strong></p>
                                        {guide.freeResources.map((resource, i) => (
                                          <p key={i} className="text-blue-800 dark:text-blue-200">- {resource}</p>
                                        ))}
                                        <p className="mt-2"><strong>Key Concepts:</strong> Based on your level, you should focus on: {guide.keyTerms.join(', ')}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        **2. Practice Questions:**
                                      </h5>
                                      <div className="space-y-1 ml-4">
                                        <p><strong>How Many:</strong> Aim for **{guide.practiceQuestions.howMany}** for this topic.</p>
                                        <p><strong>Where to Find Them:</strong></p>
                                        {guide.practiceQuestions.wherToFind.map((source, i) => (
                                          <p key={i} className="text-blue-800 dark:text-blue-200">- {source}</p>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        **3. Book Suggestions:**
                                      </h5>
                                      <div className="space-y-1 ml-4">
                                        {guide.bookSuggestions.map((book, i) => (
                                          <p key={i} className="text-blue-800 dark:text-blue-200">- {book}</p>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        **4. Make Flashcards:**
                                      </h5>
                                      <div className="space-y-1 ml-4">
                                        <p><strong>Create {guide.flashcards.count}</strong> for the key terms and definitions.</p>
                                        <p><strong>App Suggestion:</strong> {guide.flashcards.suggestion}</p>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudyPlannerForm;