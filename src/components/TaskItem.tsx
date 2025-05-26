
import React, { useState } from 'react';
import { Check, Edit, Trash, Clock, User, Calendar, Star, Camera, Tag, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from './TodoApp';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdateTime: (taskId: string, additionalTime: number) => void;
  onDragStart: (taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateTime,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setTimerStart(Date.now());
  };

  const stopTimer = () => {
    if (timerStart) {
      const timeSpent = Math.round((Date.now() - timerStart) / 60000); // Convert to minutes
      onUpdateTime(task.id, timeSpent);
    }
    setIsTimerRunning(false);
    setTimerStart(null);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-move",
        task.completed && "opacity-70",
        isOverdue && "border-red-300 bg-red-50"
      )}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <h3 className={cn(
                  "text-lg font-semibold",
                  task.completed && "line-through text-gray-500"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={cn(
                    "text-gray-600 mt-1",
                    task.completed && "line-through"
                  )}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={isTimerRunning ? stopTimer : startTimer}
                className={cn(
                  "h-8 w-8 p-0",
                  isTimerRunning && "bg-green-100 text-green-600"
                )}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Photos */}
          {task.photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {task.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Task attachment ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-sm">
            {/* Priority */}
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {getPriorityIcon(task.priority)} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            {/* Category */}
            {task.category && (
              <Badge variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {task.category}
              </Badge>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <Badge variant={isOverdue ? "destructive" : "outline"}>
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(task.dueDate)}
              </Badge>
            )}

            {/* Time Spent */}
            {task.timeSpent > 0 && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(task.timeSpent)}
              </Badge>
            )}

            {/* Created By */}
            <Badge variant="outline">
              <User className="w-3 h-3 mr-1" />
              {task.createdBy}
            </Badge>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Creation Date */}
          <div className="text-xs text-gray-500">
            Created on {formatDate(task.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
