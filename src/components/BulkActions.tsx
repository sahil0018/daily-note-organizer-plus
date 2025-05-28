
import React from 'react';
import { Trash, Check, X, Edit, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from './TodoApp';

interface BulkActionsProps {
  selectedTasks: string[];
  tasks: Task[];
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkComplete: () => void;
  onBulkUncomplete: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedTasks,
  onClearSelection,
  onBulkDelete,
  onBulkComplete,
  onBulkUncomplete,
}) => {
  if (selectedTasks.length === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
        {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
      </span>
      <div className="flex gap-1 ml-auto">
        <Button size="sm" variant="outline" onClick={onBulkComplete}>
          <Check className="w-4 h-4 mr-1" />
          Complete
        </Button>
        <Button size="sm" variant="outline" onClick={onBulkUncomplete}>
          <X className="w-4 h-4 mr-1" />
          Uncomplete
        </Button>
        <Button size="sm" variant="destructive" onClick={onBulkDelete}>
          <Trash className="w-4 h-4 mr-1" />
          Delete
        </Button>
        <Button size="sm" variant="outline" onClick={onClearSelection}>
          <Square className="w-4 h-4 mr-1" />
          Unselect All
        </Button>
      </div>
    </div>
  );
};

export default BulkActions;
