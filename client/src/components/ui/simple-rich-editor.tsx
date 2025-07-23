import { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleRichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SimpleRichEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className 
}: SimpleRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const isCommandActive = useCallback((command: string) => {
    return document.queryCommandState(command);
  }, []);

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children,
    title 
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-primary text-primary-foreground"
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap items-center gap-1 bg-muted">
        {/* Basic Formatting */}
        <ToolbarButton
          onClick={() => execCommand('bold')}
          isActive={isCommandActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('italic')}
          isActive={isCommandActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('underline')}
          isActive={isCommandActive('underline')}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => execCommand('formatBlock', 'h1')}
          isActive={false}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('formatBlock', 'h2')}
          isActive={false}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('formatBlock', 'h3')}
          isActive={false}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => execCommand('insertUnorderedList')}
          isActive={isCommandActive('insertUnorderedList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('insertOrderedList')}
          isActive={isCommandActive('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('formatBlock', 'blockquote')}
          isActive={false}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        {/* Link */}
        <ToolbarButton
          onClick={insertLink}
          isActive={false}
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => execCommand('undo')}
          isActive={false}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => execCommand('redo')}
          isActive={false}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={cn(
          "min-h-[200px] max-h-[400px] overflow-y-auto p-4 prose prose-sm max-w-none focus:outline-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        )}
        style={{ 
          minHeight: '200px',
          wordWrap: 'break-word'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}