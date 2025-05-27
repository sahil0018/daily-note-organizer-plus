
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from './TodoApp';
import TaskItem from './TaskItem';

interface TaskListProps {
  filteredTasks: Task[];
  totalTasks: number;
  selectedTasks: string[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdateTime: (taskId: string, additionalTime: number) => void;
  onDragStart: (taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, taskId: string) => void;
  onTaskSelection: (taskId: string, selected: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  filteredTasks,
  totalTasks,
  selectedTasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateTime,
  onDragStart,
  onDragOver,
  onDrop,
  onTaskSelection
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Tasks ({filteredTasks.length})
          {filteredTasks.length !== totalTasks && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (filtered from {totalTasks})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p>No tasks found. {totalTasks === 0 ? 'Add your first task!' : 'Try adjusting your filters.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateTime={onUpdateTime}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isSelected={selectedTasks.includes(task.id)}
                onSelect={onTaskSelection}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
