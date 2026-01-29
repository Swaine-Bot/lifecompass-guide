import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertTriangle, Users, Heart } from 'lucide-react';
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
          <h1 className="font-serif text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: January 29, 2026</p>
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
                By accessing or using LifeStack ("the Service"), you agree to be bound by these Terms and 
                Conditions ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service. You must 
                be at least 16 years old to use this Service.
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
                <li>You may not share your account with others or allow unauthorized access</li>
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
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Upload malware, viruses, or harmful code</li>
                <li>Collect personal information about other users without consent</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Your Content</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>Ownership:</strong> You retain all rights to content you create and upload to LifeStack. 
                Your goals, journal entries, and personal data remain yours.
              </p>
              <p>
                <strong>License:</strong> By posting content, you grant us a limited license to store, display, 
                and process that content to provide the Service to you. This license ends when you delete your content or account.
              </p>
              <p>
                <strong>Responsibility:</strong> You are solely responsible for your content and its legality.
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
                <li>Report abusive behavior through our reporting tools</li>
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
                is owned by LifeStack and protected by copyright, trademark, and other laws. You may not 
                copy, modify, distribute, or create derivative works without permission.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>AS-IS Basis:</strong> The Service is provided "as is" without warranties of any kind, 
                either express or implied, including fitness for a particular purpose.
              </p>
              <p>
                <strong>No Guarantee:</strong> We do not guarantee that the Service will be uninterrupted, 
                secure, or error-free.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, LifeStack 
                shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                or any loss of profits or revenues.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct that 
                violates these Terms or is harmful to other users or the Service.
              </p>
              <p>
                You may delete your account at any time through Settings. Upon deletion, your data will be 
                removed according to our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material 
                changes via email or in-app notification at least 30 days before they take effect.
              </p>
              <p>
                Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                These Terms shall be governed by the laws of the jurisdiction in which LifeStack is 
                incorporated, without regard to conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms will be resolved through binding arbitration, 
                except where prohibited by law.
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
                <li>Email: legal@lifestack.app</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
