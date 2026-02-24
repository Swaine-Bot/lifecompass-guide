import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail, Scale, Heart, FileText, Users, AlertTriangle } from 'lucide-react';
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
          <p className="text-muted-foreground">Last updated: February 24, 2026</p>
          <p className="text-muted-foreground text-sm mt-2">
            Compliant with GDPR (EU), POPIA (South Africa) &amp; HIPAA-aligned practices
          </p>
        </div>

        <div className="space-y-8">
          {/* Data Controller */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Data Controller &amp; Information Officer
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>Pragmatic Analytics Solutions (Pty) Ltd</strong> ("we," "our," or "us"), registered in the Republic of South Africa, is the <strong>data controller</strong> (GDPR) and <strong>responsible party</strong> (POPIA) for your personal information processed through LifeStack.
              </p>
              <ul>
                <li><strong>Information Officer (POPIA):</strong> dpo@lifestack.app</li>
                <li><strong>Data Protection Officer (GDPR):</strong> dpo@lifestack.app</li>
                <li><strong>General Privacy Enquiries:</strong> privacy@lifestack.app</li>
              </ul>
            </CardContent>
          </Card>

          {/* Commitment */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                <strong>Your data is YOUR data.</strong> We operate on a principle of <strong>data minimisation</strong> (GDPR Art. 5(1)(c)) and <strong>purpose limitation</strong> (POPIA §13). We never sell your personal information to third parties.
              </p>
              <p>
                We process your data only where we have a <strong>lawful basis</strong> to do so, and we are transparent about how, why, and for how long we keep it.
              </p>
            </CardContent>
          </Card>

          {/* Lawful Basis */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Lawful Basis for Processing (GDPR Art. 6 / POPIA §11)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We process personal data under the following legal bases:</p>
              <ul>
                <li><strong>Consent (Art. 6(1)(a)):</strong> For optional features such as AI mentor analysis, location services, push notifications, and sharing AI insights with friends. You may withdraw consent at any time via Settings → Privacy.</li>
                <li><strong>Contract Performance (Art. 6(1)(b)):</strong> To provide core LifeStack services — account management, goal tracking, habit monitoring, journaling, and social features you opt into.</li>
                <li><strong>Legitimate Interests (Art. 6(1)(f)):</strong> For security, fraud prevention, service improvement using anonymised/aggregated analytics, and ensuring platform integrity.</li>
                <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> Where required to comply with applicable law, regulation, or lawful government request.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Collected */}
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
                <li>Profile information (life phase, goals, preferences, timezone, gender, country)</li>
                <li>User-generated content (journal entries, goals, habits, tasks, posts)</li>
                <li>Media you upload (photos, videos, audio recordings)</li>
                <li>Communications with our AI Mentor</li>
              </ul>

              <h4>Sensitive / Special Category Data:</h4>
              <p>
                LifeStack may process data that relates to your <strong>emotional well-being</strong> (mood, energy levels, journal reflections). Under GDPR Art. 9 and POPIA §26–27, this may constitute <strong>special personal information</strong>. We process this data <strong>only with your explicit consent</strong>, which you provide when you use these features. You may stop providing this data at any time.
              </p>
              <p>
                <strong>HIPAA Note:</strong> LifeStack is a personal wellness application and is <strong>not a covered entity</strong> under HIPAA. However, we apply HIPAA-aligned safeguards to any health-related data you voluntarily provide, including encryption at rest (AES-256), encryption in transit (TLS 1.3), access controls, and audit logging.
              </p>

              <h4>Automatically Collected Information:</h4>
              <ul>
                <li>Device information (type, operating system)</li>
                <li>Usage data (features used, session duration — anonymised and aggregated)</li>
                <li>Log data (access times, pages viewed, errors)</li>
              </ul>

              <h4>Information We DO NOT Collect:</h4>
              <ul>
                <li>Location data (unless explicitly enabled by you with granular consent)</li>
                <li>Financial information (we use secure third-party payment processors)</li>
                <li>Biometric data</li>
                <li>Formal health or medical records</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <ul>
                <li><strong>Core Functionality:</strong> Provide personalised goal tracking, habit monitoring, and AI mentorship (Basis: Contract)</li>
                <li><strong>AI Features:</strong> Power context-aware recommendations and insights. <strong>Your data is NOT used to train public AI models.</strong> AI processing uses anonymised, session-scoped data only (Basis: Consent)</li>
                <li><strong>Social Features:</strong> Enable connections with friends and family you explicitly invite (Basis: Consent/Contract)</li>
                <li><strong>Security:</strong> Protect your account and detect fraudulent activity (Basis: Legitimate Interest)</li>
                <li><strong>Improvements:</strong> Analyse <strong>anonymised, aggregated</strong> data to improve our services — individual user data is never used for this purpose (Basis: Legitimate Interest)</li>
                <li><strong>Anonymised Trend Analysis:</strong> We may analyse anonymised, aggregated mentor chat topics to identify broad trends. This analysis <strong>never contains identifiable data</strong> and cannot be traced back to any individual user (Basis: Legitimate Interest)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Data Retention (GDPR Art. 5(1)(e) / POPIA §14)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We retain personal data only for as long as necessary for the purposes for which it was collected:</p>
              <ul>
                <li><strong>Active Account Data:</strong> Retained for the duration of your account plus 30 days after deletion request</li>
                <li><strong>Journal Entries &amp; AI Conversations:</strong> Retained while your account is active. Permanently deleted within 30 days of account deletion</li>
                <li><strong>Session / Usage Logs:</strong> Anonymised and aggregated after 90 days; raw logs deleted after 180 days</li>
                <li><strong>Backup Data:</strong> Purged from all backup systems within 90 days of deletion</li>
                <li><strong>Legal Hold:</strong> Data may be retained longer if required by applicable law or an active legal proceeding</li>
              </ul>
            </CardContent>
          </Card>

          {/* Security */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Data Security &amp; HIPAA-Aligned Safeguards
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>We implement robust security measures aligned with HIPAA technical safeguards (45 CFR §164.312):</p>
              <ul>
                <li><strong>Encryption in Transit:</strong> TLS 1.3 with AES-256-GCM cipher suites</li>
                <li><strong>Encryption at Rest:</strong> AES-256 for all stored data, backups, and replicas</li>
                <li><strong>Row-Level Security (RLS):</strong> Database access is strictly limited to your own data — no user can access another user's records</li>
                <li><strong>Access Controls:</strong> Role-based access with principle of least privilege; admin access is audited</li>
                <li><strong>Password Protection:</strong> Industry-standard bcrypt hashing (never stored in plain text)</li>
                <li><strong>Audit Logging:</strong> Access and modification events are logged for security monitoring</li>
                <li><strong>Regular Security Assessments:</strong> Periodic vulnerability assessments and code reviews</li>
                <li><strong>Secure Infrastructure:</strong> Enterprise-grade cloud infrastructure with SOC 2 compliance</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                International Data Transfers (GDPR Art. 44–49 / POPIA §72)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                Your data is stored on secure cloud infrastructure with primary data centres in the <strong>United States</strong> and <strong>European Union</strong>.
              </p>
              <p>Where data is transferred outside the EEA or South Africa, we ensure adequate protection through:</p>
              <ul>
                <li><strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
                <li>Transfers to countries with <strong>adequacy decisions</strong> where applicable</li>
                <li><strong>Supplementary measures</strong> including encryption and access controls</li>
                <li>Binding commitments from our sub-processors to maintain equivalent data protection standards</li>
              </ul>
              <p>
                Under POPIA §72, we ensure that any cross-border transfer of personal information is to a jurisdiction with adequate data protection laws, or is subject to binding agreements that provide equivalent protection.
              </p>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Data Sharing &amp; Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p><strong>We do NOT sell your personal data. Ever.</strong></p>
              <p>We may share data only in these limited circumstances:</p>
              <ul>
                <li><strong>Sub-Processors:</strong> Trusted partners who help operate our service (hosting, AI inference) under <strong>Data Processing Agreements (DPAs)</strong> compliant with GDPR Art. 28</li>
                <li><strong>Legal Requirements:</strong> When required by law, subpoena, or to protect rights and safety — we will notify you unless legally prohibited from doing so</li>
                <li><strong>Your Consent:</strong> Social features you explicitly enable (sharing with friends)</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition, you will be notified at least 30 days in advance and given the option to delete your data before transfer</li>
                <li><strong>Anonymised Analytics:</strong> Aggregated, non-identifiable trend data may be shared — this data cannot identify any individual user</li>
              </ul>
            </CardContent>
          </Card>

          {/* Automated Decision Making */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                AI Processing &amp; Automated Decision-Making (GDPR Art. 22)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                LifeStack uses AI to provide mentorship, journal analysis, and personalised recommendations. You should be aware that:
              </p>
              <ul>
                <li>AI processing is used to generate <strong>suggestions and insights only</strong> — no decisions with legal or significant effects are made automatically</li>
                <li>AI mentor conversations are processed in <strong>real-time and not stored for model training</strong></li>
                <li>Journal analysis (mood insights, nudges) uses your data solely to provide you with personal feedback</li>
                <li>You can <strong>disable AI features</strong> at any time without losing access to core functionality</li>
                <li>You have the right to request <strong>human review</strong> of any AI-generated insight by contacting us</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>Under GDPR, POPIA, and applicable law, you have the following rights:</p>
              <ul>
                <li><strong>Right of Access (GDPR Art. 15 / POPIA §23):</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Right to Rectification (Art. 16 / POPIA §24):</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure / "Right to be Forgotten" (Art. 17 / POPIA §24):</strong> Request deletion of your data. We will comply within 30 days unless legal obligations require retention</li>
                <li><strong>Right to Restrict Processing (Art. 18):</strong> Limit how we process your data while disputes are resolved</li>
                <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format (JSON)</li>
                <li><strong>Right to Object (Art. 21 / POPIA §11(3)):</strong> Object to processing based on legitimate interests, including direct marketing</li>
                <li><strong>Right to Withdraw Consent (Art. 7(3) / POPIA §11):</strong> Withdraw any consent you have given, at any time, without affecting the lawfulness of prior processing</li>
                <li><strong>Right Not to be Subject to Automated Decisions (Art. 22):</strong> Request human review of AI-generated insights</li>
                <li><strong>Right to Lodge a Complaint:</strong>
                  <ul>
                    <li><strong>EU:</strong> You may lodge a complaint with your local Data Protection Authority (DPA)</li>
                    <li><strong>South Africa:</strong> You may lodge a complaint with the <strong>Information Regulator</strong> at inforeg@justice.gov.za</li>
                  </ul>
                </li>
              </ul>
              <p>
                To exercise any of these rights, visit <strong>Settings → Privacy</strong> or email us at <strong>privacy@lifestack.app</strong>. We will respond within <strong>30 days</strong> (GDPR) / <strong>30 days</strong> (POPIA).
              </p>
            </CardContent>
          </Card>

          {/* Children */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                LifeStack is not intended for children under <strong>16 years of age</strong> (GDPR Art. 8) or under <strong>18 years of age</strong> where required by local law (POPIA). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately and we will delete it within 48 hours.
              </p>
            </CardContent>
          </Card>

          {/* Breach Notification */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Data Breach Notification (GDPR Art. 33–34 / POPIA §22)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>In the event of a personal data breach:</p>
              <ul>
                <li>We will notify the relevant <strong>supervisory authority within 72 hours</strong> of becoming aware of the breach (GDPR Art. 33)</li>
                <li>If the breach is likely to result in a <strong>high risk to your rights and freedoms</strong>, we will notify you directly <strong>without undue delay</strong> (GDPR Art. 34)</li>
                <li>Under POPIA §22, we will notify the <strong>Information Regulator</strong> and affected data subjects as soon as reasonably possible</li>
                <li>Notifications will include the nature of the breach, data affected, likely consequences, and measures taken</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>For privacy enquiries, data subject requests, or to exercise your rights:</p>
              <ul>
                <li><strong>Privacy Enquiries:</strong> privacy@lifestack.app</li>
                <li><strong>Data Protection Officer / Information Officer:</strong> dpo@lifestack.app</li>
                <li><strong>Postal Address:</strong> Pragmatic Analytics Solutions (Pty) Ltd, Johannesburg, South Africa</li>
              </ul>
              <p>We will acknowledge your request within <strong>5 business days</strong> and respond substantively within <strong>30 days</strong>.</p>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p>
                We may update this Privacy Policy periodically. For <strong>material changes</strong>, we will:
              </p>
              <ul>
                <li>Notify you via email and/or in-app notification at least <strong>30 days</strong> before changes take effect</li>
                <li>Clearly describe what has changed and why</li>
                <li>Obtain fresh consent where the changes affect processing based on consent</li>
                <li>Provide the option to delete your account if you disagree with the changes</li>
              </ul>
              <p>Continued use of LifeStack after the notice period constitutes acceptance of the updated policy for non-consent-based processing.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
