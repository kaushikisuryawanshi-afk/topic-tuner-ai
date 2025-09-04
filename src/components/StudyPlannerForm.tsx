import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Topic {
  id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  hours: number;
}

interface ScheduleItem {
  topicName: string;
  hours: number;
  type: 'NEW' | 'REVIEW';
}

interface DaySchedule {
  date: string;
  items: ScheduleItem[];
}

const StudyPlannerForm = () => {
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
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
    
    // Step 3: Create empty day-by-day schedule
    const dailyHours = parseFloat(studyHours);
    const daySchedules: DaySchedule[] = [];
    const remainingHours: number[] = [];
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      daySchedules.push({
        date: currentDate.toLocaleDateString(),
        items: []
      });
      remainingHours.push(dailyHours);
    }
    
    // Step 4: Schedule topics
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
        
        daySchedules[scheduledDay].items.push({
          topicName: topic.name,
          hours: hoursToSchedule,
          type: 'NEW'
        });
        
        // Track first scheduled day for review
        if (topicHoursLeft === topic.hours) {
          topicsToReview.push({ topicName: topic.name, firstScheduledDay: scheduledDay });
        }
        
        remainingHours[scheduledDay] -= hoursToSchedule;
        topicHoursLeft -= hoursToSchedule;
      }
    }
    
    // Step 5: Add spaced repetition (review sessions)
    for (const { topicName, firstScheduledDay } of topicsToReview) {
      const reviewDay = firstScheduledDay + 2;
      
      if (reviewDay < totalDays && remainingHours[reviewDay] >= 1) {
        daySchedules[reviewDay].items.push({
          topicName,
          hours: 1,
          type: 'REVIEW'
        });
        remainingHours[reviewDay] -= 1;
      }
    }
    
    setSchedule(daySchedules);
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

      {/* Topics Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">3. Add Your Topics</h2>
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
          disabled={!examDate || !studyHours || topics.length === 0}
        >
          Generate My AI Study Plan
        </Button>
      </div>

      {/* Schedule Display */}
      {schedule.length > 0 && (
        <section className="space-y-6 pt-8 border-t">
          <h2 className="text-2xl font-semibold text-foreground">Your AI Study Plan</h2>
          <div className="space-y-4">
            {schedule.map((day, index) => (
              <div key={index} className="bg-card border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Day {index + 1}: {day.date}
                </h3>
                {day.items.length > 0 ? (
                  <div className="space-y-2">
                    {day.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between bg-muted/30 rounded p-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{item.topicName}</span>
                          <span className="text-muted-foreground">({item.hours} hour{item.hours !== 1 ? 's' : ''})</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'NEW' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-secondary/10 text-secondary-foreground'
                        }`}>
                          [{item.type}]
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Rest day - No studying scheduled</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudyPlannerForm;