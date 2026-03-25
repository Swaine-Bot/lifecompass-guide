import { useState } from 'react';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Conversation {
  id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface MentorSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function MentorSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
}: MentorSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <h3 className="font-serif font-semibold text-sm text-foreground">Chat History</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-foreground" onClick={onNewConversation}>
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-foreground" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/60">
                No conversations yet
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">
                Start a new conversation to begin
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
                  activeConversationId === conv.id
                    ? "bg-primary/[0.10] border border-primary/15"
                    : "hover:bg-white/[0.04] border border-transparent"
                )}
                onClick={() => onSelectConversation(conv.id)}
              >
                <MessageSquare className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  activeConversationId === conv.id ? "text-primary/80" : "text-muted-foreground/50"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm truncate",
                    activeConversationId === conv.id ? "text-foreground font-medium" : "text-foreground/80"
                  )}>
                    {conv.title || 'New Conversation'}
                  </p>
                  {conv.updated_at && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {format(new Date(conv.updated_at), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
                
                <AlertDialog open={deletingId === conv.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground/50 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(conv.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this conversation and all its messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(conv.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
