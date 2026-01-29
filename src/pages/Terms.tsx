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
              <CardTitle>Content Ownership & License</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>Transfer of Ownership:</strong> By uploading, submitting, or posting any content 
                (including but not limited to text, images, videos, audio recordings, journal entries, and 
                any other materials) to LifeStack, you hereby irrevocably transfer and assign all rights, 
                title, and interest in such content to <strong>Pragmatic Analytics Solutions (Pty) Ltd</strong>. 
                This includes all intellectual property rights, copyrights, and any derivative works.
              </p>
              <p>
                <strong>License Grant:</strong> You grant Pragmatic Analytics Solutions (Pty) Ltd a perpetual, 
                worldwide, royalty-free, non-exclusive license to use, reproduce, modify, adapt, publish, 
                translate, distribute, and display such content for any purpose, including but not limited 
                to improving the Service, training AI models, marketing, and research purposes.
              </p>
              <p>
                <strong>Waiver of Moral Rights:</strong> To the extent permitted by applicable law, you waive 
                any moral rights you may have in the content you upload.
              </p>
              <p>
                <strong>Responsibility:</strong> You are solely responsible for ensuring that any content 
                you upload does not infringe upon the intellectual property rights or privacy rights of 
                any third party, and that it complies with all applicable laws.
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
                Disclaimers & Limitations of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>AS-IS Basis:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT 
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED 
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p>
                <strong>No Guarantee:</strong> PRAGMATIC ANALYTICS SOLUTIONS (PTY) LTD DOES NOT WARRANT 
                THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS 
                WILL BE CORRECTED.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, 
                IN NO EVENT SHALL PRAGMATIC ANALYTICS SOLUTIONS (PTY) LTD, ITS DIRECTORS, OFFICERS, EMPLOYEES, 
                AFFILIATES, AGENTS, CONTRACTORS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS 
                OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION 
                WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.
              </p>
              <p>
                <strong>Maximum Liability:</strong> OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS 
                ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS 
                PAID BY YOU TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED 
                US DOLLARS (USD $100).
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Data Loss & Security Breach Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>No Liability for Data Loss:</strong> PRAGMATIC ANALYTICS SOLUTIONS (PTY) LTD SHALL 
                NOT BE LIABLE FOR ANY LOSS, CORRUPTION, OR DESTRUCTION OF DATA, WHETHER CAUSED BY SYSTEM 
                FAILURES, SECURITY BREACHES, UNAUTHORIZED ACCESS, NATURAL DISASTERS, ACTS OF WAR, TERRORISM, 
                CIVIL UNREST, OR ANY OTHER CAUSE BEYOND OUR REASONABLE CONTROL.
              </p>
              <p>
                <strong>Security Breach Disclaimer:</strong> WHILE WE IMPLEMENT INDUSTRY-STANDARD SECURITY 
                MEASURES, NO SYSTEM IS COMPLETELY SECURE. WE DISCLAIM ALL LIABILITY FOR ANY UNAUTHORIZED 
                ACCESS, DATA BREACHES, HACKING, CYBERATTACKS, PHISHING, RANSOMWARE, OR OTHER SECURITY 
                INCIDENTS THAT MAY RESULT IN THE EXPOSURE, THEFT, MODIFICATION, OR DELETION OF YOUR DATA.
              </p>
              <p>
                <strong>Force Majeure:</strong> We shall not be liable for any failure or delay in performing 
                our obligations due to circumstances beyond our reasonable control, including but not limited 
                to natural disasters, pandemics, war, terrorism, riots, government actions, power outages, 
                internet service provider failures, or third-party service disruptions.
              </p>
              <p>
                <strong>User Responsibility:</strong> You are responsible for maintaining your own backups 
                of any critical data and for implementing appropriate security measures on your devices. 
                You acknowledge that you use the Service at your own risk.
              </p>
              <p>
                <strong>Indemnification:</strong> You agree to indemnify, defend, and hold harmless 
                Pragmatic Analytics Solutions (Pty) Ltd and its affiliates from any claims, damages, 
                losses, or expenses arising from your use of the Service, your violation of these Terms, 
                or your infringement of any third-party rights.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Data Storage & Encryption</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>Data Storage Location:</strong> Your data is stored on secure cloud infrastructure 
                provided by our hosting partners, with primary data centers located in the <strong>United States</strong> and 
                <strong> European Union</strong>. Data may be replicated across multiple geographic regions for 
                redundancy and performance optimization.
              </p>
              <p>
                <strong>Encryption Standards:</strong> We implement the following encryption measures to protect your data:
              </p>
              <ul>
                <li><strong>Data in Transit:</strong> All data transmitted between your device and our servers 
                is encrypted using TLS 1.3 (Transport Layer Security) with AES-256-GCM cipher suites</li>
                <li><strong>Data at Rest:</strong> All stored data is encrypted using AES-256 (Advanced Encryption 
                Standard with 256-bit keys), an industry-standard encryption algorithm approved for classified 
                government information</li>
                <li><strong>Database Encryption:</strong> Database-level encryption using transparent data 
                encryption (TDE) with AES-256</li>
                <li><strong>Backup Encryption:</strong> All database backups and replicas are encrypted using 
                AES-256 encryption</li>
                <li><strong>Key Management:</strong> Encryption keys are managed through secure key management 
                systems with regular key rotation and access controls</li>
              </ul>
              <p>
                <strong>Compliance:</strong> Our security practices are designed to align with internationally 
                recognized standards including SOC 2 Type II, ISO 27001, and GDPR requirements. However, 
                as stated in our disclaimers, no security measures can guarantee absolute protection against 
                all threats.
              </p>
              <p>
                <strong>Third-Party Processors:</strong> We may use third-party service providers for data 
                processing, storage, and analytics. These providers are contractually obligated to maintain 
                appropriate security measures and confidentiality of your data.
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
              <CardTitle>Governing Law & Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the 
                <strong> Republic of South Africa</strong>, without regard to its conflict of law provisions.
              </p>
              <p>
                <strong>Jurisdiction:</strong> You agree to submit to the exclusive jurisdiction of the 
                courts located in Johannesburg, South Africa for the resolution of any disputes arising 
                from these Terms or your use of the Service.
              </p>
              <p>
                <strong>Arbitration:</strong> Any disputes arising from these Terms will first be subject 
                to good faith negotiation. If unresolved within 30 days, disputes will be resolved through 
                binding arbitration administered by the Arbitration Foundation of Southern Africa (AFSA), 
                except where prohibited by law.
              </p>
              <p>
                <strong>Class Action Waiver:</strong> TO THE EXTENT PERMITTED BY APPLICABLE LAW, YOU WAIVE 
                ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST 
                PRAGMATIC ANALYTICS SOLUTIONS (PTY) LTD.
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
