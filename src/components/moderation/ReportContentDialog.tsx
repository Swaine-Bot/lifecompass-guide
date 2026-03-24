import { useState } from 'react';
import { Flag, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate', label: 'Hate or abusive content' },
  { value: 'sexual', label: 'Sexual / explicit content' },
  { value: 'violence', label: 'Graphic / violent content' },
  { value: 'self_harm', label: 'Self-harm or dangerous content' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'misleading', label: 'Misleading / deceptive content' },
  { value: 'privacy', label: 'Privacy violation' },
  { value: 'ip', label: 'Intellectual property concern' },
  { value: 'other', label: 'Other' },
];

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: 'post' | 'comment' | 'profile' | 'share_card';
  contentOwnerId?: string;
}

export function ReportContentDialog({ open, onOpenChange, targetId, targetType, contentOwnerId }: ReportContentDialogProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be signed in to report content');
        return;
      }

      // Check for duplicate report
      const { data: existing } = await supabase
        .from('content_reports')
        .select('id')
        .eq('reporter_user_id', session.session.user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        toast.info('You have already reported this content. It is under review.');
        setSubmitted(true);
        return;
      }

      const { error } = await supabase.from('content_reports').insert({
        reporter_user_id: session.session.user.id,
        target_id: targetId,
        target_type: targetType,
        reason: REPORT_REASONS.find(r => r.value === reason)?.label || reason,
        notes: details.trim() || null,
        status: 'pending',
      } as any);

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setReason('');
      setDetails('');
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Flag className="w-4 h-4 text-muted-foreground" />
            Report Content
          </DialogTitle>
          <DialogDescription className="text-xs">
            Help us keep LifeStack safe. Your report is confidential.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm font-medium">Report submitted</p>
            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
              Thanks. Your report has been submitted and will be reviewed by our team.
            </p>
            <Button variant="outline" size="sm" onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Why are you reporting this?</p>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-1.5">
                {REPORT_REASONS.map(r => (
                  <div key={r.value} className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-lg border border-border/30 transition-colors cursor-pointer",
                    reason === r.value ? "bg-primary/5 border-primary/30" : "hover:bg-secondary/30"
                  )}>
                    <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                    <Label htmlFor={`reason-${r.value}`} className="text-sm cursor-pointer flex-1">{r.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Additional context (optional)</Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                placeholder="Add any details that might help our review..."
                className="mt-1.5 text-sm resize-none"
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">{details.length}/500</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="w-full"
              size="sm"
            >
              {submitting ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-3.5 h-3.5 mr-1.5" /> Submit Report</>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground/50 text-center">
              Reporter identity is never shared with the content author.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
