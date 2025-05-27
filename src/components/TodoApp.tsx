import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Calendar, User, Camera, Clock, Star, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import DarkModeToggle from './DarkModeToggle';
import BulkActions from './BulkActions';
import TaskTemplates from './TaskTemplates';
import TaskAnalytics from './TaskAnalytics';
import ExportImport from './ExportImport';
import KeyboardShortcuts from './KeyboardShortcuts';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority' | 'timeSpent'>('createdAt');
  const [activeTab, setActiveTab] = useState('tasks');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setShowTaskForm(false);
  };

  const updateTask = (updatedTask: Task) => {
    console.log('Updating task:', updatedTask.id, updatedTask.title);
    setTasks(prev => {
      const newTasks = prev.map(task => task.id === updatedTask.id ? updatedTask : task);
      console.log('Tasks after updating:', newTasks.length);
      return newTasks;
    });
    setEditingTask(null);
    setShowTaskForm(false);
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

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
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

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prev => [...prev, ...importedTasks]);
  };

  const handleKeyboardShortcuts = {
    onNewTask: () => setShowTaskForm(true),
    onToggleSearch: () => searchInputRef.current?.focus(),
  };

  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    console.log('Drag started for task:', taskId);
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    console.log('Drop event - draggedTask:', draggedTask, 'targetTaskId:', targetTaskId);
    
    if (!draggedTask || draggedTask === targetTaskId) {
      console.log('Invalid drop - same task or no dragged task');
      return;
    }

    const draggedIndex = tasks.findIndex(task => task.id === draggedTask);
    const targetIndex = tasks.findIndex(task => task.id === targetTaskId);

    console.log('Drag indices - dragged:', draggedIndex, 'target:', targetIndex);

    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('Invalid indices found');
      return;
    }

    const newTasks = [...tasks];
    const [draggedTaskObj] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTaskObj);

    console.log('Reordering tasks - before:', tasks.length, 'after:', newTasks.length);
    setTasks(newTasks);
    setDraggedTask(null);
  };

  // Filter tasks with debugging
  const filteredTasks = tasks
    .filter(task => {
      console.log('Filtering task:', task.title, 'Search term:', searchTerm);
      
      const matchesSearch = searchTerm === '' || 
                           task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      console.log('Search match for', task.title, ':', matchesSearch);
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'completed' && task.completed) ||
                           (filterStatus === 'pending' && !task.completed);
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

      const finalMatch = matchesSearch && matchesStatus && matchesPriority && matchesCategory;
      console.log('Final match for', task.title, ':', finalMatch);

      return finalMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'timeSpent':
          return b.timeSpent - a.timeSpent;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  console.log('Total tasks:', tasks.length, 'Filtered tasks:', filteredTasks.length, 'Search term:', searchTerm);

  // Get unique categories
  const categories = Array.from(new Set(tasks.map(task => task.category).filter(Boolean)));

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalTimeSpent = tasks.reduce((total, task) => total + task.timeSpent, 0);

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Task Management</span>
                  <Button onClick={() => setShowTaskForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search tasks, descriptions, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters and Sorting */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Filters */}
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort by */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="timeSpent">Time Spent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Tasks ({filteredTasks.length})
                  {filteredTasks.length !== tasks.length && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (filtered from {tasks.length})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p>No tasks found. {tasks.length === 0 ? 'Add your first task!' : 'Try adjusting your filters.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
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
                        isSelected={selectedTasks.includes(task.id)}
                        onSelect={handleTaskSelection}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                onSave={editingTask ? updateTask : addTask}
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
