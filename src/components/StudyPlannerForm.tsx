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
  
  // Academic Profile state
  const [educationLevel, setEducationLevel] = useState('');
  const [academicProfile, setAcademicProfile] = useState({
    class: '',
    board: '',
    stream: '',
    subject: '',
    courseName: '',
    university: '',
    yearSemester: '',
    degreeName: '',
    specialization: ''
  });
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

  const generateAcademicContext = () => {
    if (!educationLevel || educationLevel === 'Select...') return '';
    
    let context = educationLevel;
    
    switch (educationLevel) {
      case 'School (Class 6-10)':
        if (academicProfile.class) context += ` Class ${academicProfile.class}`;
        if (academicProfile.board) context += ` ${academicProfile.board}`;
        break;
      case 'Senior Secondary (Class 11-12)':
        if (academicProfile.class) context += ` Class ${academicProfile.class}`;
        if (academicProfile.stream) context += ` ${academicProfile.stream}`;
        if (academicProfile.subject) context += ` ${academicProfile.subject}`;
        break;
      case 'Undergraduate (College)':
        if (academicProfile.courseName) context += ` ${academicProfile.courseName}`;
        if (academicProfile.yearSemester) context += ` ${academicProfile.yearSemester}`;
        if (academicProfile.university) context += ` at ${academicProfile.university}`;
        break;
      case 'Postgraduate':
        if (academicProfile.degreeName) context += ` ${academicProfile.degreeName}`;
        if (academicProfile.specialization) context += ` in ${academicProfile.specialization}`;
        if (academicProfile.university) context += ` at ${academicProfile.university}`;
        break;
      default:
        break;
    }
    
    return context;
  };

  const updateAcademicProfile = (field: string, value: string) => {
    setAcademicProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetAcademicProfile = () => {
    setAcademicProfile({
      class: '',
      board: '',
      stream: '',
      subject: '',
      courseName: '',
      university: '',
      yearSemester: '',
      degreeName: '',
      specialization: ''
    });
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
    const academicContext = generateAcademicContext();
    navigate('/results', { 
      state: { 
        examDate, 
        studyHours, 
        academicLevel: academicContext || 'Not specified', 
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

      {/* Academic Profile Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">3. Academic Profile</h2>
        
        {/* Education Level Dropdown */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Select your education level:
          </Label>
          <Select 
            value={educationLevel} 
            onValueChange={(value) => {
              setEducationLevel(value);
              resetAcademicProfile();
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="School (Class 6-10)">School (Class 6-10)</SelectItem>
              <SelectItem value="Senior Secondary (Class 11-12)">Senior Secondary (Class 11-12)</SelectItem>
              <SelectItem value="Undergraduate (College)">Undergraduate (College)</SelectItem>
              <SelectItem value="Postgraduate">Postgraduate</SelectItem>
              <SelectItem value="Competitive Exams">Competitive Exams</SelectItem>
              <SelectItem value="Self-Learner">Self-Learner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Follow-up Questions */}
        {educationLevel === 'School (Class 6-10)' && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select your class:</Label>
                <Select value={academicProfile.class} onValueChange={(value) => updateAcademicProfile('class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select your board:</Label>
                <Select value={academicProfile.board} onValueChange={(value) => updateAcademicProfile('board', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {educationLevel === 'Senior Secondary (Class 11-12)' && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select your class:</Label>
                <Select value={academicProfile.class} onValueChange={(value) => updateAcademicProfile('class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11">11</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select your stream:</Label>
                <Select value={academicProfile.stream} onValueChange={(value) => updateAcademicProfile('stream', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science (PCM)">Science (PCM)</SelectItem>
                    <SelectItem value="Science (PCB)">Science (PCB)</SelectItem>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                    <SelectItem value="Arts/Humanities">Arts/Humanities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select subject:</Label>
                <Select value={academicProfile.subject} onValueChange={(value) => updateAcademicProfile('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Accountancy">Accountancy</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {educationLevel === 'Undergraduate (College)' && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Course Name:</Label>
                <Input
                  placeholder="e.g., B.Tech Computer Science"
                  value={academicProfile.courseName}
                  onChange={(e) => updateAcademicProfile('courseName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">University/Institution:</Label>
                <Input
                  placeholder="e.g., IIT Delhi"
                  value={academicProfile.university}
                  onChange={(e) => updateAcademicProfile('university', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Year/Semester:</Label>
              <Select value={academicProfile.yearSemester} onValueChange={(value) => updateAcademicProfile('yearSemester', value)}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select year/semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="1st Sem">1st Sem</SelectItem>
                  <SelectItem value="2nd Sem">2nd Sem</SelectItem>
                  <SelectItem value="3rd Sem">3rd Sem</SelectItem>
                  <SelectItem value="4th Sem">4th Sem</SelectItem>
                  <SelectItem value="5th Sem">5th Sem</SelectItem>
                  <SelectItem value="6th Sem">6th Sem</SelectItem>
                  <SelectItem value="7th Sem">7th Sem</SelectItem>
                  <SelectItem value="8th Sem">8th Sem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {educationLevel === 'Postgraduate' && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Degree Name:</Label>
                <Input
                  placeholder="e.g., M.Tech, MBA"
                  value={academicProfile.degreeName}
                  onChange={(e) => updateAcademicProfile('degreeName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Specialization:</Label>
                <Input
                  placeholder="e.g., Data Science, Finance"
                  value={academicProfile.specialization}
                  onChange={(e) => updateAcademicProfile('specialization', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">University/Institution:</Label>
              <Input
                placeholder="e.g., Stanford University"
                value={academicProfile.university}
                onChange={(e) => updateAcademicProfile('university', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Display generated context */}
        {generateAcademicContext() && (
          <div className="mt-4 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Academic Context:</span> {generateAcademicContext()}
            </p>
          </div>
        )}
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
          disabled={!examDate || !studyHours || !educationLevel || topics.length === 0}
        >
          Generate Plan
        </Button>
      </div>
    </div>
  );
};

export default StudyPlannerForm;