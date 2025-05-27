
import { useState, useMemo } from 'react';
import { Task } from '../components/TodoApp';

export const useTaskFilters = (tasks: Task[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority' | 'timeSpent'>('createdAt');

  // Filter tasks with debugging
  const filteredTasks = useMemo(() => {
    return tasks
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
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, sortBy]);

  console.log('Total tasks:', tasks.length, 'Filtered tasks:', filteredTasks.length, 'Search term:', searchTerm);

  // Get unique categories
  const categories = useMemo(() => 
    Array.from(new Set(tasks.map(task => task.category).filter(Boolean))), 
    [tasks]
  );

  return {
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
  };
};
