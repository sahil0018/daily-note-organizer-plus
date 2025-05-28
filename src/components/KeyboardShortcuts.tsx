
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
      // Only trigger if not typing in an input, textarea, or contenteditable element
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      // Skip if typing in form fields, unless it's the search shortcut
      if (isTyping && !((e.ctrlKey || e.metaKey) && e.key === 'f')) {
        return;
      }

      // Ctrl+N or Cmd+N for new task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        console.log('New task shortcut triggered');
        onNewTask();
        return;
      }
      
      // Ctrl+F or Cmd+F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Search shortcut triggered');
        onToggleSearch();
        return;
      }

      // Escape to close modals (handled by individual components)
      if (e.key === 'Escape') {
        console.log('Escape key pressed');
        // This will be handled by individual modal components
      }
    };

    // Add event listener to document with capture phase to ensure it runs first
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onNewTask, onToggleSearch]);

  const shortcuts = [
    { key: 'Ctrl+N', mac: 'Cmd+N', action: 'New Task' },
    { key: 'Ctrl+F', mac: 'Cmd+F', action: 'Focus Search' },
    { key: 'Escape', mac: 'Escape', action: 'Close Modals' },
  ];

  // Detect if user is on Mac
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

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
              {isMac ? shortcut.mac : shortcut.key}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default KeyboardShortcuts;
