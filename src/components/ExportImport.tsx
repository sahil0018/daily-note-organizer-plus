
import React, { useRef } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from './TodoApp';

interface ExportImportProps {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ tasks, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Priority', 'Category', 'Completed', 'Due Date', 'Time Spent (min)', 'Tags', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        `"${task.description}"`,
        task.priority,
        `"${task.category}"`,
        task.completed,
        task.dueDate || '',
        task.timeSpent,
        `"${task.tags.join(';')}"`,
        task.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTasks = JSON.parse(content);
        onImport(importedTasks);
      } catch (error) {
        alert('Error importing file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Export & Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Export Tasks</h4>
          <div className="flex gap-2">
            <Button onClick={exportToJSON} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export JSON
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Import Tasks</h4>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportImport;
