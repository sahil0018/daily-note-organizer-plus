
import React, { useState } from 'react';
import { Plus, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  estimatedTime: number;
}

interface TaskTemplatesProps {
  onUseTemplate: (template: Omit<TaskTemplate, 'id' | 'name'>) => void;
}

const TaskTemplates: React.FC<TaskTemplatesProps> = ({ onUseTemplate }) => {
  const [templates] = useState<TaskTemplate[]>([
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="w-5 h-5" />
          Task Templates
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUseTemplate(template)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {template.estimatedTime}m
                    </Badge>
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
