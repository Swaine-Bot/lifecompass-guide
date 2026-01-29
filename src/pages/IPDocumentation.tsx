import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Code, Scale, Shield, Calendar, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import lifestackLogo from '@/assets/lifestack-logo.png';

const documents = [
  {
    title: 'IP Documentation',
    description: 'Comprehensive intellectual property documentation including concept, architecture, features, and innovation claims.',
    filename: 'LIFESTACK_IP_DOCUMENTATION.md',
    icon: FileText,
    size: '~50 KB',
  },
  {
    title: 'Source Code Manifest',
    description: 'Complete inventory of all source code files with purposes and line counts.',
    filename: 'LIFESTACK_SOURCE_CODE_MANIFEST.md',
    icon: Code,
    size: '~8 KB',
  },
  {
    title: 'Patent Claims',
    description: 'Formal patent claims documentation for South Africa and PCT international filing.',
    filename: 'LIFESTACK_PATENT_CLAIMS.md',
    icon: Scale,
    size: '~15 KB',
  },
];

export default function IPDocumentation() {
  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/downloads/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    documents.forEach((doc, index) => {
      setTimeout(() => {
        handleDownload(doc.filename);
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
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
          <h1 className="font-serif text-4xl font-bold mb-4">IP Documentation Package</h1>
          <p className="text-muted-foreground text-lg">
            Intellectual Property Protection Documents
          </p>
        </div>

        {/* Owner Info */}
        <Card variant="glass" className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Pragmatic Analytics Solutions (Pty) Ltd</h3>
                <p className="text-muted-foreground">Rights Holder & Legal Owner</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Documentation compiled: January 29, 2026</span>
            </div>
          </CardContent>
        </Card>

        {/* Download All Button */}
        <div className="mb-8 text-center">
          <Button variant="gold" size="lg" onClick={handleDownloadAll}>
            <Download className="w-5 h-5 mr-2" />
            Download All Documents
          </Button>
        </div>

        {/* Individual Documents */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.filename} variant="glass" className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <doc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{doc.filename}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc.filename)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Notes */}
        <Card variant="glass" className="mt-8">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Legal Review Required:</strong> These documents should be reviewed by a qualified patent attorney before filing.
              </li>
              <li>
                <strong className="text-foreground">South Africa Filing:</strong> File with CIPC (Companies and Intellectual Property Commission) for South African patent protection.
              </li>
              <li>
                <strong className="text-foreground">International Filing:</strong> Consider PCT (Patent Cooperation Treaty) application for international protection.
              </li>
              <li>
                <strong className="text-foreground">Screenshots:</strong> Capture current application screenshots to supplement this documentation.
              </li>
              <li>
                <strong className="text-foreground">Source Code:</strong> The complete source code is available via the connected GitHub repository.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Jurisdiction Info */}
        <Card variant="glass" className="mt-4">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recommended Filing Jurisdictions</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-medium mb-2">🇿🇦 South Africa</h4>
                <p className="text-muted-foreground">
                  Primary jurisdiction. File with CIPC. Governing law per Terms & Conditions.
                </p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="font-medium mb-2">🌍 PCT International</h4>
                <p className="text-muted-foreground">
                  For global protection. Designate US, EU, UK, AU, and other key markets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
