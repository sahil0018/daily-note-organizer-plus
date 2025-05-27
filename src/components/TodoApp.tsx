
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(newTask);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length && filteredTasks.length > 0) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
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
  };

  const handleKeyboardShortcuts = {
    onNewTask: () => setShowTaskForm(true),
    onToggleSearch: () => searchInputRef.current?.focus(),
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
            <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              {selectedTasks.length === filteredTasks.length && filteredTasks.length > 0 ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts {...handleKeyboardShortcuts} />

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
              onToggleComplete={toggleTaskCompletion}
              onEdit={(task) => {
                setEditingTask(task);
                setShowTaskForm(true);
              }}
              onDelete={deleteTask}
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
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
