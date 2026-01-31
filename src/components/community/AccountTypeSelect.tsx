import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Building2, Check, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountTypeSelectProps {
  onComplete: (data: { accountType: 'individual' | 'page'; pageCategory?: string }) => void;
  loading?: boolean;
}

const pageCategories = [
  { id: 'business', label: 'Business / Company' },
  { id: 'nonprofit', label: 'Non-profit / Charity' },
  { id: 'sports_club', label: 'Sports Club / Team' },
  { id: 'community', label: 'Community Group' },
  { id: 'school', label: 'School / Educational' },
  { id: 'government', label: 'Government / Public' },
  { id: 'other', label: 'Other Organization' },
];

export function AccountTypeSelect({ onComplete, loading }: AccountTypeSelectProps) {
  const [accountType, setAccountType] = useState<'individual' | 'page' | null>(null);
  const [pageCategory, setPageCategory] = useState<string>('');

  const handleContinue = () => {
    if (!accountType) return;
    onComplete({
      accountType,
      pageCategory: accountType === 'page' ? pageCategory : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-xl font-bold mb-2">How will you use LifeStack?</h2>
        <p className="text-muted-foreground text-sm">Choose the type of account that best fits your needs</p>
      </div>

      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => setAccountType('individual')}
          className={cn(
            "w-full p-5 rounded-xl border text-left transition-all duration-200",
            accountType === 'individual'
              ? "border-primary bg-primary/10"
              : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
              accountType === 'individual' ? "bg-primary/20" : "bg-secondary"
            )}>
              <User className={cn(
                "w-6 h-6",
                accountType === 'individual' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Individual</p>
                {accountType === 'individual' && <Check className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Personal account for tracking your goals, habits, and connecting with friends & family
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('page')}
          className={cn(
            "w-full p-5 rounded-xl border text-left transition-all duration-200",
            accountType === 'page'
              ? "border-primary bg-primary/10"
              : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
              accountType === 'page' ? "bg-primary/20" : "bg-secondary"
            )}>
              <Building2 className={cn(
                "w-6 h-6",
                accountType === 'page' ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Page / Organization</p>
                {accountType === 'page' && <Check className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                For businesses, non-profits, sports clubs, or any organization to share updates and connect with followers
              </p>
            </div>
          </div>
        </button>
      </div>

      {accountType === 'page' && (
        <div className="space-y-3 animate-fade-in">
          <Label>What type of organization?</Label>
          <div className="grid grid-cols-2 gap-2">
            {pageCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setPageCategory(cat.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm transition-all",
                  pageCategory === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="gold"
        className="w-full"
        onClick={handleContinue}
        disabled={!accountType || (accountType === 'page' && !pageCategory) || loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
