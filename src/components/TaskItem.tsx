
import React, { useState, useRef } from 'react';
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
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  hasSelectedTasks?: boolean; // New prop to indicate if any tasks are selected
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
  isSelected = false,
  onSelect,
  hasSelectedTasks = false,
}) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerStartRef = useRef<number | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
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
    console.log('Starting timer for task:', task.title);
    setIsTimerRunning(true);
    timerStartRef.current = Date.now();
    console.log('Timer start time set to:', timerStartRef.current);
  };

  const stopTimer = () => {
    console.log('Stopping timer for task:', task.title);
    console.log('Timer start ref:', timerStartRef.current);
    
    if (timerStartRef.current) {
      const timeSpentMs = Date.now() - timerStartRef.current;
      const timeSpentMinutes = Math.max(1, Math.round(timeSpentMs / 60000));
      
      console.log('Time spent in ms:', timeSpentMs);
      console.log('Time spent in minutes:', timeSpentMinutes);
      console.log('Current task time spent:', task.timeSpent);
      
      onUpdateTime(task.id, timeSpentMinutes);
      console.log('Called onUpdateTime with:', task.id, timeSpentMinutes);
    } else {
      console.log('No timer start time found');
    }
    
    setIsTimerRunning(false);
    timerStartRef.current = null;
  };

  const handleTimerToggle = () => {
    console.log('Timer toggle clicked for task:', task.title, 'Current state:', isTimerRunning);
    if (isTimerRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const showSelectionCheckbox = onSelect && (hasSelectedTasks || isHovered || isSelected);

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-move",
        task.completed && "opacity-70",
        isOverdue && "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20",
        isSelected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
      )}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {showSelectionCheckbox && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect!(task.id, checked as boolean)}
                  className="mt-0.5"
                />
              )}
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <h3 className={cn(
                  "text-lg font-semibold dark:text-white",
                  task.completed && "line-through text-gray-500 dark:text-gray-400"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={cn(
                    "text-gray-600 dark:text-gray-300 mt-1",
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
                onClick={handleTimerToggle}
                className={cn(
                  "h-8 w-8 p-0",
                  isTimerRunning && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                )}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
                    className="w-16 h-16 object-cover rounded-lg border dark:border-gray-600"
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
              <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                <Tag className="w-3 h-3 mr-1" />
                {task.category}
              </Badge>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <Badge variant={isOverdue ? "destructive" : "outline"} className="dark:border-gray-600">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(task.dueDate)}
              </Badge>
            )}

            {/* Time Spent */}
            {task.timeSpent > 0 && (
              <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(task.timeSpent)}
              </Badge>
            )}

            {/* Created By */}
            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
              <User className="w-3 h-3 mr-1" />
              {task.createdBy}
            </Badge>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Creation Date */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Created on {formatDate(task.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
