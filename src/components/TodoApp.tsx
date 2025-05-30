
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '../hooks/useNotifications';
import TaskForm from './TaskForm';
import DarkModeToggle from './DarkModeToggle';
import BulkActions from './BulkActions';
import TaskTemplates from './TaskTemplates';
import TaskAnalytics from './TaskAnalytics';
import ExportImport from './ExportImport';
import KeyboardShortcuts from './KeyboardShortcuts';
import TaskStatistics from './TaskStatistics';
import TaskFilters from './TaskFilters';
import TaskList from './TaskList';
import { useTasks } from '../hooks/useTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
  createdBy: string;
  photos: string[];
  timeSpent: number; // in minutes
  tags: string[];
}

const TodoApp = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [notifiedOverdueTasks, setNotifiedOverdueTasks] = useState<Set<string>>(new Set());
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { permission, requestPermission, showNotification, isSupported } = useNotifications();

  // Use custom hooks
  const {
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
  } = useTasks();

  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    filteredTasks,
    categories
  } = useTaskFilters(tasks);

  // Dark mode effect
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Request notification permission on first load
  useEffect(() => {
    if (isSupported && permission === 'default') {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  // Check for expired tasks - only notify once per task
  useEffect(() => {
    const checkExpiredTasks = () => {
      const now = new Date();
      const overdrueTasks = tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
      });

      // Filter out tasks we've already notified about
      const newOverdueTasks = overdrueTasks.filter(task => !notifiedOverdueTasks.has(task.id));

      // Show notifications only for newly overdue tasks
      newOverdueTasks.forEach(task => {
        const daysOverdue = Math.floor((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        
        showNotification('Task Overdue! ⚠️', {
          body: `"${task.title}" was due ${daysOverdue > 0 ? `${daysOverdue} day(s) ago` : 'today'}`,
          tag: `overdue-${task.id}`,
          requireInteraction: true
        });
      });

      // Show toast only if there are new overdue tasks
      if (newOverdueTasks.length > 0) {
        toast({
          title: "Overdue Tasks",
          description: `You have ${newOverdueTasks.length} new overdue task(s) that need attention.`,
          variant: "destructive",
        });
      }

      // Update the set of notified overdue tasks
      if (newOverdueTasks.length > 0) {
        setNotifiedOverdueTasks(prev => {
          const newSet = new Set(prev);
          newOverdueTasks.forEach(task => newSet.add(task.id));
          return newSet;
        });
      }

      // Clean up notifications for tasks that are no longer overdue (completed or due date changed)
      const currentOverdueIds = new Set(overdrueTasks.map(task => task.id));
      setNotifiedOverdueTasks(prev => {
        const newSet = new Set<string>();
        prev.forEach(taskId => {
          if (currentOverdueIds.has(taskId)) {
            newSet.add(taskId);
          }
        });
        return newSet;
      });
    };

    // Check immediately if we have tasks, but only on initial load
    if (tasks.length > 0 && notifiedOverdueTasks.size === 0) {
      checkExpiredTasks();
    }

    // Set up periodic checking (every hour)
    const interval = setInterval(checkExpiredTasks, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, showNotification, toast, notifiedOverdueTasks]);

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(newTask);
    setShowTaskForm(false);
    
    toast({
      title: "Task Added",
      description: `"${newTask.title}" has been added to your tasks.`,
    });

    // Show browser notification
    showNotification('New Task Added', {
      body: `"${newTask.title}" has been added to your tasks.`,
      tag: 'task-added'
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setEditingTask(null);
    setShowTaskForm(false);

    // Show notification for task updates
    showNotification('Task Updated', {
      body: `"${updatedTask.title}" has been updated.`,
      tag: 'task-updated'
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length && filteredTasks.length > 0) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  // Enhanced task completion handler with notification
  const handleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toggleTaskCompletion(taskId);
      
      const isCompleting = !task.completed;
      if (isCompleting) {
        showNotification('Task Completed! 🎉', {
          body: `"${task.title}" has been marked as completed.`,
          tag: 'task-completed'
        });
      }
    }
  };

  // Enhanced task deletion with notification
  const handleTaskDeletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      deleteTask(taskId);
      showNotification('Task Deleted', {
        body: `"${task.title}" has been deleted.`,
        tag: 'task-deleted'
      });
    }
  };

  // Template usage
  const handleUseTemplate = (template: any) => {
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: template.name,
      description: template.description,
      completed: false,
      priority: template.priority,
      category: template.category,
      createdBy: 'You',
      photos: [],
      timeSpent: 0,
      tags: template.tags,
    };
    addTask(newTask);
    
    toast({
      title: "Template Used",
      description: `Task "${template.name}" created from template.`,
    });

    // Show browser notification
    showNotification('Task Created from Template', {
      body: `"${template.name}" has been created from template.`,
      tag: 'template-used'
    });
  };

  // Keyboard shortcut handlers
  const handleNewTask = () => {
    console.log('Opening new task form via keyboard shortcut');
    setShowTaskForm(true);
  };

  const handleToggleSearch = () => {
    console.log('Focusing search input via keyboard shortcut');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-4 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center space-y-2">
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              My Todo App
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Organize your tasks efficiently with advanced features
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Permission Button */}
            {isSupported && permission !== 'granted' && (
              <Button 
                onClick={requestPermission} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Enable Notifications
              </Button>
            )}
            <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              {selectedTasks.length === filteredTasks.length && filteredTasks.length > 0 ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts 
          onNewTask={handleNewTask}
          onToggleSearch={handleToggleSearch}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Statistics Cards */}
            <TaskStatistics tasks={tasks} />

            {/* Bulk Actions */}
            <BulkActions
              selectedTasks={selectedTasks}
              tasks={tasks}
              onClearSelection={() => setSelectedTasks([])}
              onBulkDelete={handleBulkDelete}
              onBulkComplete={handleBulkComplete}
              onBulkUncomplete={handleBulkUncomplete}
            />

            {/* Enhanced Controls */}
            <TaskFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterStatus={filterStatus}
              onStatusChange={setFilterStatus}
              filterPriority={filterPriority}
              onPriorityChange={setFilterPriority}
              filterCategory={filterCategory}
              onCategoryChange={setFilterCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
              onAddTask={() => setShowTaskForm(true)}
              searchInputRef={searchInputRef}
            />

            {/* Task List */}
            <TaskList
              filteredTasks={filteredTasks}
              totalTasks={tasks.length}
              selectedTasks={selectedTasks}
              onToggleComplete={handleTaskCompletion}
              onEdit={(task) => {
                setEditingTask(task);
                setShowTaskForm(true);
              }}
              onDelete={handleTaskDeletion}
              onUpdateTime={updateTaskTime}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onTaskSelection={handleTaskSelection}
            />
          </TabsContent>

          <TabsContent value="templates">
            <TaskTemplates onUseTemplate={handleUseTemplate} />
          </TabsContent>

          <TabsContent value="analytics">
            <TaskAnalytics tasks={tasks} />
          </TabsContent>

          <TabsContent value="settings">
            <ExportImport tasks={tasks} onImport={handleImportTasks} />
          </TabsContent>
        </Tabs>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <TaskForm
                task={editingTask}
                onSave={editingTask ? handleUpdateTask : handleAddTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;
