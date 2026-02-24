import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, Users, Heart, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import lifestackLogo from '@/assets/lifestack-logo.png';

export default function Terms() {
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground">Last updated: February 24, 2026</p>
        </div>

        <div className="space-y-8">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                By accessing or using LifeStack ("the Service"), operated by <strong>Pragmatic Analytics Solutions (Pty) Ltd</strong>, you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service. You must
                be at least <strong>16 years old</strong> (or 18 where required by local law) to use this Service.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <ul>
                <li>You are responsible for safeguarding your account credentials</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You may not share your account with others or allow unauthorised access</li>
                <li>You must notify us immediately of any security breach</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>You agree NOT to:</p>
              <ul>
                <li>Use the Service for any unlawful purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post content that is offensive, defamatory, or infringes intellectual property rights</li>
                <li>Attempt to gain unauthorised access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Upload malware, viruses, or harmful code</li>
                <li>Collect personal information about other users without consent</li>
              </ul>
            </CardContent>
          </Card>

          {/* FIXED: Content ownership - GDPR/POPIA compliant */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Content Ownership &amp; License
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>You retain ownership of your content.</strong> All content you upload, submit, or post to LifeStack (including text, images, videos, audio recordings, journal entries, and any other materials) remains <strong>your intellectual property</strong>.
              </p>
              <p>
                <strong>Limited License Grant:</strong> By using LifeStack, you grant Pragmatic Analytics Solutions (Pty) Ltd a limited, non-exclusive, revocable licence to use your content <strong>solely for the purpose of providing and improving the Service to you</strong>. This includes:
              </p>
              <ul>
                <li>Displaying your content back to you within the app</li>
                <li>Processing your content through AI features <strong>you have opted into</strong></li>
                <li>Sharing content with friends/connections <strong>you have explicitly chosen</strong></li>
                <li>Creating anonymised, aggregated analytics that cannot identify you</li>
              </ul>
              <p>
                <strong>What we will NOT do with your content:</strong>
              </p>
              <ul>
                <li>We will NOT use your personal content to train public AI models</li>
                <li>We will NOT sell or licence your content to third parties</li>
                <li>We will NOT use your content for marketing without your explicit consent</li>
                <li>We will NOT retain your content after you delete it (subject to backup retention periods stated in our Privacy Policy)</li>
              </ul>
              <p>
                <strong>Revocation:</strong> You may revoke this licence at any time by deleting your content or your account. Upon account deletion, we will delete your content within 30 days from all systems, including backups within 90 days.
              </p>
              <p>
                <strong>Responsibility:</strong> You are solely responsible for ensuring that any content you upload does not infringe upon the intellectual property rights or privacy rights of any third party.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                AI Mentor Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                The AI Mentor feature provides supportive guidance and planning assistance. Please understand:
              </p>
              <ul>
                <li><strong>Not Professional Advice:</strong> AI Mentor responses are not substitutes for professional medical, legal, financial, or mental health advice</li>
                <li><strong>Emergency Situations:</strong> If you're experiencing a crisis or emergency, please contact appropriate emergency services immediately</li>
                <li><strong>Human Professionals:</strong> For serious concerns, we encourage you to consult qualified human professionals</li>
                <li><strong>Limitations:</strong> AI responses may not always be accurate or appropriate for your specific situation</li>
                <li><strong>Data Usage:</strong> Your conversations with the AI Mentor are processed to provide responses and are <strong>not used for model training</strong>. You may delete conversation history at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Social Features</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <ul>
                <li>You may only connect with people who consent to the connection</li>
                <li>Content shared with friends should respect their privacy</li>
                <li>You may block or remove connections at any time</li>
                <li>We may remove content or accounts that violate community standards</li>
                <li>Report abusive behaviour through our reporting tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                The Service, including its design, features, code, and content (excluding user content),
                is owned by Pragmatic Analytics Solutions (Pty) Ltd and protected by copyright, trademark, and other laws. You may not copy, modify, distribute, or create derivative works without permission.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Disclaimers &amp; Limitations of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>AS-IS Basis:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW
                (including the Consumer Protection Act 68 of 2008 in South Africa and mandatory EU consumer protection laws),
                IN NO EVENT SHALL PRAGMATIC ANALYTICS SOLUTIONS (PTY) LTD BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
              <p>
                <strong>Maximum Liability:</strong> OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS (USD $100).
              </p>
              <p>
                <strong>Note:</strong> Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded under applicable law including GDPR, POPIA, or the South African Consumer Protection Act.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Data Storage &amp; Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>Data Storage Location:</strong> Your data is stored on secure cloud infrastructure with primary data centres in the <strong>United States</strong> and <strong>European Union</strong>, with appropriate cross-border transfer safeguards (Standard Contractual Clauses).
              </p>
              <p>
                <strong>Your Data Rights:</strong> You have comprehensive rights over your data as detailed in our{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, including access, rectification, erasure, portability, and the right to withdraw consent.
              </p>
              <p>
                <strong>Data Export:</strong> You may request a full export of your data in machine-readable format (JSON) at any time via Settings → Privacy or by contacting privacy@lifestack.app.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                We may terminate or suspend your account for conduct that violates these Terms or is harmful to other users. Where possible, we will provide <strong>14 days' notice</strong> before termination, except in cases of severe violations.
              </p>
              <p>
                You may delete your account at any time through Settings. Upon deletion, your data will be
                permanently removed within 30 days, with backups purged within 90 days, as detailed in our Privacy Policy.
              </p>
              <p>
                Upon termination, you may request a <strong>full data export</strong> before your data is deleted.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                We reserve the right to modify these Terms. For material changes, we will:
              </p>
              <ul>
                <li>Notify you via email and/or in-app notification at least <strong>30 days</strong> before changes take effect</li>
                <li>Clearly describe what has changed</li>
                <li>Give you the opportunity to review and accept or reject the new terms</li>
                <li>Allow you to export and delete your data if you disagree</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Governing Law &amp; Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                <strong> Republic of South Africa</strong>, including the Protection of Personal Information Act (POPIA) and the Consumer Protection Act.
              </p>
              <p>
                <strong>EU Users:</strong> If you are located in the European Union, you retain all mandatory protections afforded by the laws of your country of residence, including GDPR. Nothing in these Terms restricts your rights under mandatory EU consumer protection or data protection law.
              </p>
              <p>
                <strong>Jurisdiction:</strong> You agree to submit to the exclusive jurisdiction of the courts located in Johannesburg, South Africa, except where mandatory local law requires otherwise.
              </p>
              <p>
                <strong>Dispute Resolution:</strong> Any disputes will first be subject to good faith negotiation. If unresolved within 30 days, disputes will be resolved through binding arbitration administered by the Arbitration Foundation of Southern Africa (AFSA), except where prohibited by applicable law.
              </p>
              <p>
                <strong>Note:</strong> EU consumers retain their right to bring proceedings in the courts of their member state under EU Regulation 1215/2012.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For questions about these Terms, contact us at:</p>
              <ul>
                <li><strong>General:</strong> legal@lifestack.app</li>
                <li><strong>Privacy / Data Rights:</strong> privacy@lifestack.app</li>
                <li><strong>Data Protection Officer:</strong> dpo@lifestack.app</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
