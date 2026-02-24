import { useState } from 'react';
import { Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MentorMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MentorMessage({ role, content }: MentorMessageProps) {
  const [isHidden, setIsHidden] = useState(false);

  if (role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="chat-bubble-user">{content}</div>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="chat-bubble-assistant">
          {isHidden ? (
            <p className="text-muted-foreground text-sm italic">Response hidden</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 mt-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsHidden(!isHidden)}
        >
          {isHidden ? (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Show response
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Hide response
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
