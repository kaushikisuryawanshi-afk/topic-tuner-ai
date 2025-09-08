import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const navigate = useNavigate();
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
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
    // Navigate to results page with the generated schedule data
    navigate('/results', { 
      state: { 
        examDate, 
        studyHours, 
        academicLevel, 
        topics, 
        schedule: daySchedules 
      } 
    });
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
        </Button>
      </div>
    </div>
  );
};

export default StudyPlannerForm;