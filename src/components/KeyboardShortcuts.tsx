
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KeyboardShortcutsProps {
  onNewTask: () => void;
  onToggleSearch: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onNewTask, onToggleSearch }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N for new task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewTask();
      }
      
      // Ctrl+F or Cmd+F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onToggleSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewTask, onToggleSearch]);

  const shortcuts = [
    { key: 'Ctrl+N', action: 'New Task' },
    { key: 'Ctrl+F', action: 'Focus Search' },
    { key: 'Escape', action: 'Close Modals' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <span>{shortcut.action}</span>
            <Badge variant="outline" className="text-xs">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default KeyboardShortcuts;
