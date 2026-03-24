import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Crown, Shield, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';

interface TermsAcceptanceProps {
  onAccept: (termsVersion: string, privacyVersion: string) => void;
}

export const TermsAcceptance = ({ onAccept }: TermsAcceptanceProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const canContinue = termsAccepted && privacyAccepted;

  // Trigger entrance animation
  useState(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo animation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
              <Crown className="w-12 h-12 text-primary" />
            </div>
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
          <p className="text-muted-foreground">
            Your personal life operating system
          </p>
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
            onClick={() => setTermsAccepted(!termsAccepted)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
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
            onClick={() => setPrivacyAccepted(!privacyAccepted)}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                className="mt-1"
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

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={!canContinue}
            onClick={onAccept}
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          
          {!canContinue && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              Please accept both agreements to continue
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
