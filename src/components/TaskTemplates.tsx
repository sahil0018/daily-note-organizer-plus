
import React, { useState } from 'react';
import { Plus, Bookmark, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  estimatedTime: number;
  isCustom?: boolean;
}

interface TaskTemplatesProps {
  onUseTemplate: (template: Omit<TaskTemplate, 'id' | 'name'>) => void;
}

const TaskTemplates: React.FC<TaskTemplatesProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: '1',
      name: 'Daily Standup',
      description: 'Prepare for daily team standup meeting',
      priority: 'medium',
      category: 'Work',
      tags: ['meeting', 'daily'],
      estimatedTime: 15,
    },
    {
      id: '2',
      name: 'Code Review',
      description: 'Review pull requests and provide feedback',
      priority: 'high',
      category: 'Work',
      tags: ['development', 'review'],
      estimatedTime: 30,
    },
    {
      id: '3',
      name: 'Grocery Shopping',
      description: 'Buy weekly groceries',
      priority: 'low',
      category: 'Personal',
      tags: ['shopping', 'weekly'],
      estimatedTime: 60,
    },
    {
      id: '4',
      name: 'Exercise Session',
      description: 'Complete workout routine',
      priority: 'medium',
      category: 'Health',
      tags: ['fitness', 'routine'],
      estimatedTime: 45,
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    tags: '',
    estimatedTime: 30,
  });
  const [suggestions, setSuggestions] = useState<TaskTemplate[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionCategory, setSuggestionCategory] = useState('');
  
  const { toast } = useToast();

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const template: TaskTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      priority: newTemplate.priority,
      category: newTemplate.category || 'Custom',
      tags: newTemplate.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      estimatedTime: newTemplate.estimatedTime,
      isCustom: true,
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      description: '',
      priority: 'medium',
      category: '',
      tags: '',
      estimatedTime: 30,
    });
    setShowCreateDialog(false);
    
    toast({
      title: "Success",
      description: "Template created successfully!",
    });
  };

  const generateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    
    try {
      // Simulate API call for task suggestions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions: TaskTemplate[] = [
        {
          id: 'suggestion-1',
          name: 'Weekly Team Retrospective',
          description: 'Conduct team retrospective to discuss what went well and areas for improvement',
          priority: 'medium',
          category: suggestionCategory || 'Work',
          tags: ['meeting', 'retrospective', 'team'],
          estimatedTime: 60,
        },
        {
          id: 'suggestion-2',
          name: 'Update Project Documentation',
          description: 'Review and update project README and technical documentation',
          priority: 'low',
          category: suggestionCategory || 'Work',
          tags: ['documentation', 'maintenance'],
          estimatedTime: 45,
        },
        {
          id: 'suggestion-3',
          name: 'Client Follow-up Call',
          description: 'Schedule and conduct follow-up call with key clients',
          priority: 'high',
          category: suggestionCategory || 'Work',
          tags: ['client', 'communication'],
          estimatedTime: 30,
        },
        {
          id: 'suggestion-4',
          name: 'Skill Development Session',
          description: 'Dedicate time to learning new skills or technologies',
          priority: 'medium',
          category: suggestionCategory || 'Personal',
          tags: ['learning', 'development'],
          estimatedTime: 90,
        },
      ];
      
      setSuggestions(mockSuggestions);
      
      toast({
        title: "Suggestions Generated",
        description: "Found some great task suggestions for you!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addSuggestionAsTemplate = (suggestion: TaskTemplate) => {
    const template: TaskTemplate = {
      ...suggestion,
      id: Date.now().toString(),
      isCustom: true,
    };
    
    setTemplates(prev => [...prev, template]);
    
    toast({
      title: "Success",
      description: "Suggestion added as template!",
    });
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    
    toast({
      title: "Success",
      description: "Template deleted successfully!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Task Templates
          </div>
          <div className="flex gap-2">
            <Dialog open={showSuggestionsDialog} onOpenChange={setShowSuggestionsDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Globe className="w-4 h-4 mr-1" />
                  Get Suggestions
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>AI Task Suggestions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Category (optional)"
                      value={suggestionCategory}
                      onChange={(e) => setSuggestionCategory(e.target.value)}
                    />
                    <Button onClick={generateSuggestions} disabled={isLoadingSuggestions}>
                      <Sparkles className="w-4 h-4 mr-1" />
                      {isLoadingSuggestions ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div className="grid gap-3">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm">{suggestion.name}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addSuggestionAsTemplate(suggestion)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600">{suggestion.description}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.estimatedTime}m
                              </Badge>
                              {suggestion.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Template name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={newTemplate.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setNewTemplate(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Category"
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newTemplate.tags}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Estimated time (minutes)"
                    value={newTemplate.estimatedTime}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                  />
                  <Button onClick={handleCreateTemplate} className="w-full">
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUseTemplate(template)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      {template.isCustom && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplate(template.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {template.estimatedTime}m
                    </Badge>
                    {template.isCustom && (
                      <Badge variant="default" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTemplates;
