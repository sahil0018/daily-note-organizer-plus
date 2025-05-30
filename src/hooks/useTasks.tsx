
import { useState, useEffect } from 'react';
import { Task } from '../components/TodoApp';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    console.log('Loading tasks from localStorage...');
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      console.log('Loaded tasks from localStorage:', parsedTasks);
      setTasks(parsedTasks);
    } else {
      console.log('No saved tasks found in localStorage');
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    console.log('Saving tasks to localStorage:', tasks);
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Debug effect to track task changes
  useEffect(() => {
    console.log('Tasks state changed. Current tasks:', tasks.length);
    tasks.forEach(task => {
      console.log('Task:', task.id, task.title);
    });
  }, [tasks]);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    console.log('Adding new task:', newTask.title);
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    console.log('Created task with ID:', task.id);
    setTasks(prev => {
      const newTasks = [task, ...prev];
      console.log('Tasks after adding:', newTasks.length);
      return newTasks;
    });
  };

  const updateTask = (updatedTask: Task) => {
    console.log('Updating task:', updatedTask.id, updatedTask.title);
    setTasks(prev => {
      const newTasks = prev.map(task => task.id === updatedTask.id ? updatedTask : task);
      console.log('Tasks after updating:', newTasks.length);
      return newTasks;
    });
  };

  const deleteTask = (taskId: string) => {
    console.log('DELETE TASK CALLED for taskId:', taskId);
    console.log('Current tasks before deletion:', tasks.length);
    
    // Add stack trace to see where this is being called from
    console.trace('Delete task called from:');
    
    setTasks(prev => {
      const newTasks = prev.filter(task => task.id !== taskId);
      console.log('Tasks after deletion:', newTasks.length);
      console.log('Deleted task with ID:', taskId);
      return newTasks;
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    console.log('Toggling completion for task:', taskId);
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateTaskTime = (taskId: string, additionalTime: number) => {
    console.log('updateTaskTime called with:', taskId, additionalTime);
    
    setTasks(prev => {
      const newTasks = prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, timeSpent: task.timeSpent + additionalTime };
          console.log('Updating task time:', task.title, 'from', task.timeSpent, 'to', updatedTask.timeSpent);
          return updatedTask;
        }
        return task;
      });
      
      console.log('Tasks after time update:', newTasks.find(t => t.id === taskId)?.timeSpent);
      return newTasks;
    });
  };

  // Bulk operations
  const handleBulkDelete = () => {
    setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
    setSelectedTasks([]);
  };

  const handleBulkComplete = () => {
    setTasks(prev => prev.map(task => 
      selectedTasks.includes(task.id) ? { ...task, completed: true } : task
    ));
    setSelectedTasks([]);
  };

  const handleBulkUncomplete = () => {
    setTasks(prev => prev.map(task => 
      selectedTasks.includes(task.id) ? { ...task, completed: false } : task
    ));
    setSelectedTasks([]);
  };

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prev => [...prev, ...importedTasks]);
  };

  // Improved drag and drop handlers
  const handleDragStart = (taskId: string) => {
    console.log('Drag started for task:', taskId);
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    
    const draggedTaskId = e.dataTransfer.getData('text/plain') || draggedTask;
    console.log('Drop event - draggedTaskId:', draggedTaskId, 'targetTaskId:', targetTaskId);
    
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      console.log('Invalid drop - same task or no dragged task');
      setDraggedTask(null);
      return;
    }

    setTasks(prevTasks => {
      const draggedIndex = prevTasks.findIndex(task => task.id === draggedTaskId);
      const targetIndex = prevTasks.findIndex(task => task.id === targetTaskId);

      console.log('Drag indices - dragged:', draggedIndex, 'target:', targetIndex);

      if (draggedIndex === -1 || targetIndex === -1) {
        console.log('Invalid indices found');
        return prevTasks;
      }

      const newTasks = [...prevTasks];
      const [draggedTaskObj] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(targetIndex, 0, draggedTaskObj);

      console.log('Reordering tasks - before:', prevTasks.length, 'after:', newTasks.length);
      console.log('New order:', newTasks.map(t => t.title));
      
      return newTasks;
    });
    
    setDraggedTask(null);
  };

  return {
    tasks,
    selectedTasks,
    setSelectedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    updateTaskTime,
    handleBulkDelete,
    handleBulkComplete,
    handleBulkUncomplete,
    handleTaskSelection,
    handleImportTasks,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
};
