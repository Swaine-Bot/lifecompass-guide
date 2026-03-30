import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Crown, Shield, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';

interface TermsAcceptanceProps {
  onAccept: (termsVersion: string, privacyVersion: string) => Promise<void> | void;
}

export const TermsAcceptance = ({ onAccept }: TermsAcceptanceProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue = termsAccepted && privacyAccepted;

  useEffect(() => {
    console.log('[TermsAcceptance] mounted');
  }, []);

  const handleContinue = async () => {
    console.log(`[TermsAcceptance] continue tapped termsAccepted=${termsAccepted} privacyAccepted=${privacyAccepted} canContinue=${canContinue} isSubmitting=${isSubmitting}`);
    if (!canContinue || isSubmitting) {
      console.log('[TermsAcceptance] continue blocked validation_failed_or_submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`[TermsAcceptance] calling onAccept termsVersion=${CURRENT_TERMS_VERSION} privacyVersion=${CURRENT_PRIVACY_VERSION}`);
      await Promise.resolve(onAccept(CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION));
      console.log('[TermsAcceptance] onAccept resolved nextStep=account_type');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[TermsAcceptance] onAccept failed error=${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] bg-background flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-6 pb-28">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
              <Crown className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="font-serif text-3xl font-bold mb-2">Welcome to LifeStack</h1>
            <p className="text-muted-foreground">Your personal life operating system</p>
          </motion.div>

          {/* Terms cards */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Terms of Service */}
            <motion.div
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                termsAccepted
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-card/50 hover:border-primary/30"
              )}
              onClick={() => {
                setTermsAccepted((prev) => {
                  const next = !prev;
                  console.log(`[TermsAcceptance] terms toggled next=${next}`);
                  return next;
                });
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    console.log(`[TermsAcceptance] terms checkbox changed next=${next}`);
                    setTermsAccepted(next);
                  }}
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium">Terms of Service</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I have read and agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>
                    , including the content licence and acceptable use policy
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Privacy Policy */}
            <motion.div
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                privacyAccepted
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-card/50 hover:border-primary/30"
              )}
              onClick={() => {
                setPrivacyAccepted((prev) => {
                  const next = !prev;
                  console.log(`[TermsAcceptance] privacy toggled next=${next}`);
                  return next;
                });
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    console.log(`[TermsAcceptance] privacy checkbox changed next=${next}`);
                    setPrivacyAccepted(next);
                  }}
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium">Privacy Policy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I have read and agree to the{' '}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                    {' '}and consent to the processing of my personal data as described therein (GDPR Art. 6(1)(a) / POPIA §11)
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Data protection notice */}
          <motion.div
            className="bg-secondary/30 rounded-xl p-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Your data is protected</p>
                <p className="text-xs text-muted-foreground">
                  We comply with GDPR (EU), POPIA (South Africa) and apply HIPAA-aligned security safeguards.
                  Your data is encrypted with AES-256, we never sell your personal information, and you retain
                  full ownership of your content. You can export or delete your data at any time via Settings.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky bottom CTA — always visible and reachable */}
      <div
        className="shrink-0 px-4 pb-4 pt-3 border-t border-border/30 bg-background/95 backdrop-blur-sm"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className="w-full max-w-md mx-auto">
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={!canContinue || isSubmitting}
            onClick={handleContinue}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>

          {!canContinue && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              Please accept both agreements to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
