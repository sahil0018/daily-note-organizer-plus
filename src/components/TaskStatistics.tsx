
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from './TodoApp';

interface TaskStatisticsProps {
  tasks: Task[];
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalTimeSpent = tasks.reduce((total, task) => total + task.timeSpent, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round(totalTimeSpent / 60)}h</div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStatistics;
