import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import lifestackLogo from '@/assets/lifestack-logo.png';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src={lifestackLogo} alt="LifeStack" className="w-8 h-8" />
            <span className="font-serif text-xl font-semibold">LifeStack</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 29, 2026</p>
        </div>

        <div className="space-y-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                LifeStack ("we," "our," or "us") is deeply committed to protecting your privacy and personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our life companion and AI mentor application.
              </p>
              <p>
                <strong>Your data is YOUR data.</strong> We operate on a principle of minimal data collection 
                and maximum transparency. We never sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <h4>Personal Information You Provide:</h4>
              <ul>
                <li>Account information (name, email address, password hash)</li>
                <li>Profile information (life phase, goals, preferences, timezone)</li>
                <li>User-generated content (journal entries, goals, habits, tasks, posts)</li>
                <li>Media you upload (photos, videos)</li>
                <li>Communications with our AI Mentor</li>
              </ul>

              <h4>Automatically Collected Information:</h4>
              <ul>
                <li>Device information (type, operating system)</li>
                <li>Usage data (features used, interaction patterns)</li>
                <li>Log data (access times, pages viewed, errors)</li>
              </ul>

              <h4>Information We DO NOT Collect:</h4>
              <ul>
                <li>Location data (unless explicitly enabled by you)</li>
                <li>Financial information (we use secure third-party payment processors)</li>
                <li>Biometric data</li>
                <li>Health records or medical information</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <ul>
                <li><strong>Core Functionality:</strong> Provide personalized goal tracking, habit monitoring, and AI mentorship</li>
                <li><strong>AI Features:</strong> Power context-aware recommendations and insights (your data is NOT used to train public AI models)</li>
                <li><strong>Social Features:</strong> Enable connections with friends and family you explicitly invite</li>
                <li><strong>Security:</strong> Protect your account and detect fraudulent activity</li>
                <li><strong>Improvements:</strong> Analyze anonymized, aggregated data to improve our services</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We implement robust security measures:</p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Row-Level Security:</strong> Database access is strictly limited to your own data</li>
                <li><strong>Password Protection:</strong> Passwords are hashed using industry-standard algorithms (never stored in plain text)</li>
                <li><strong>Access Controls:</strong> Strict internal access policies and audit logs</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and penetration testing</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on enterprise-grade cloud infrastructure with SOC 2 compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Data Sharing & Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p><strong>We do NOT sell your personal data. Ever.</strong></p>
              <p>We may share data only in these limited circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> Trusted partners who help operate our service (hosting, analytics) under strict confidentiality agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, subpoena, or to protect rights and safety</li>
                <li><strong>Your Consent:</strong> Social features you explicitly enable (sharing with friends)</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition (you will be notified)</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Your Rights & Controls</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You have full control over your data:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of all your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information at any time</li>
                <li><strong>Deletion:</strong> Request complete deletion of your account and data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Disable any optional data collection features</li>
                <li><strong>Privacy Settings:</strong> Control who can see your posts and profile</li>
              </ul>
              <p>To exercise these rights, visit Settings → Privacy or contact us at privacy@lifestack.app</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                LifeStack is not intended for children under 16. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For privacy inquiries or to exercise your rights:</p>
              <ul>
                <li>Email: privacy@lifestack.app</li>
                <li>Data Protection Officer: dpo@lifestack.app</li>
              </ul>
              <p>
                We will respond to all legitimate requests within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                We may update this Privacy Policy periodically. We will notify you of material changes 
                via email or in-app notification. Continued use of LifeStack after changes constitutes 
                acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
