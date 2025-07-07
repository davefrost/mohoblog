import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Youtube
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}: RichTextEditorProps) {
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const insertText = useCallback((before: string, after: string = "") => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  }, [value, onChange, textareaRef]);

  const toolbarButtons = [
    { icon: Bold, action: () => insertText("**", "**"), tooltip: "Bold" },
    { icon: Italic, action: () => insertText("*", "*"), tooltip: "Italic" },
    { icon: Link, action: () => insertText("[", "](url)"), tooltip: "Link" },
    { icon: Image, action: () => insertText("![alt text](", ")"), tooltip: "Image" },
    { icon: List, action: () => insertText("- "), tooltip: "Bullet List" },
    { icon: ListOrdered, action: () => insertText("1. "), tooltip: "Numbered List" },
    { icon: Quote, action: () => insertText("> "), tooltip: "Quote" },
    { icon: Code, action: () => insertText("`", "`"), tooltip: "Code" },
    { icon: Youtube, action: () => insertText("[![](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)"), tooltip: "YouTube Video" },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-muted px-4 py-2 border-b flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              className="h-8 w-8 p-0"
              title={button.tooltip}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
      
      {/* Editor */}
      <Textarea
        ref={setTextareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[300px] border-0 focus:ring-0 focus:outline-none resize-none"
      />
      
      {/* Help Text */}
      <div className="bg-muted px-4 py-2 border-t text-xs text-muted-foreground">
        <p>
          <strong>Tip:</strong> Use Markdown syntax for formatting. 
          Select text and click toolbar buttons for quick formatting.
        </p>
      </div>
    </div>
  );
}
