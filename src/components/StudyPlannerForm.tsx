import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const StudyPlannerForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const addTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic("");
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const generateStudyPlan = () => {
    const today = new Date();
    const examDateObj = new Date(examDate);
    const totalDays = Math.ceil((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyHours = parseInt(hoursPerDay);
    const schedule = [];
    
    // Simple algorithm to distribute topics across days
    const topicsPerDay = Math.ceil(topics.length / Math.max(1, totalDays));
    
    for (let day = 0; day < totalDays; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      const dayTopics = topics.slice(day * topicsPerDay, (day + 1) * topicsPerDay);
      const hoursPerTopic = Math.floor(dailyHours / Math.max(1, dayTopics.length));
      
      schedule.push({
        day: day + 1,
        date: currentDate.toLocaleDateString(),
        topics: dayTopics.map(topic => ({
          name: topic,
          hours: hoursPerTopic,
          type: 'study'
        })),
        totalHours: dailyHours
      });
    }
    
    return schedule;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!examDate || !hoursPerDay || !academicLevel || topics.length === 0) {
      toast.error("Please fill in all fields and add at least one topic");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate a study plan");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate the study plan
      const studyPlan = generateStudyPlan();
      
      // Save to database
      const { error } = await supabase
        .from('study_plans')
        .insert({
          user_id: user.id,
          exam_date: examDate,
          hours_per_day: parseInt(hoursPerDay),
          academic_level: academicLevel,
          topics,
          generated_plan: studyPlan
        });

      if (error) {
        console.error('Error saving study plan:', error);
        toast.error("Failed to save study plan");
        return;
      }

      // Navigate to results page with the study plan data
      navigate('/results', { 
        state: { 
          studyPlan,
          formData: {
            examDate,
            hoursPerDay: parseInt(hoursPerDay),
            academicLevel,
            topics
          }
        }
      });
      
      toast.success("Study plan generated and saved!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create Your AI Study Plan</h1>
        <p className="text-muted-foreground">Fill in your details to get a personalized study schedule</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Plan Details</CardTitle>
          <CardDescription>
            Tell us about your exam and study preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-date">Exam Date</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hours-per-day">Study Hours Per Day</Label>
                <Input
                  id="hours-per-day"
                  type="number"
                  min="1"
                  max="12"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  placeholder="e.g., 4"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic-level">Academic Level</Label>
              <Select value={academicLevel} onValueChange={setAcademicLevel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="professional">Professional/Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Study Topics</Label>
              <div className="flex gap-2">
                <Input
                  value={currentTopic}
                  onChange={(e) => setCurrentTopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a topic (e.g., Linear Algebra)"
                  className="flex-1"
                />
                <Button type="button" onClick={addTopic} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {topic}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeTopic(topic)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              {topics.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add at least one topic to generate your study plan
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isGenerating || !examDate || !hoursPerDay || !academicLevel || topics.length === 0}
            >
              {isGenerating ? "Generating..." : "Generate My AI Study Plan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};