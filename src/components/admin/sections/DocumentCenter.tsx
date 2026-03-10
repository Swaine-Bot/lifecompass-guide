import { useState } from 'react';
import { FileText, Apple, PlayCircle, Scale, ExternalLink, Search } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const documents = [
  { title: 'App Store Submission Pack', description: 'Complete Apple App Store submission documentation', icon: Apple, path: '/app-store-submission', category: 'Store Submissions', color: 'text-foreground' },
  { title: 'Play Store Submission Pack', description: 'Complete Google Play Store submission documentation', icon: PlayCircle, path: '/play-store-submission', category: 'Store Submissions', color: 'text-success' },
  { title: 'IP & Patent Documentation', description: 'Intellectual property, patent claims, and ownership records', icon: Scale, path: '/ip-docs', category: 'Legal & IP', color: 'text-primary' },
  { title: 'Source Code Manifest', description: 'Complete source code inventory and architecture documentation', icon: FileText, path: '/ip-docs', category: 'Legal & IP', color: 'text-info' },
];

export function DocumentCenter() {
  const [search, setSearch] = useState('');

  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filtered.map(d => d.category))];

  return (
    <div className="space-y-8">
      <SectionHeader title="Document Center" description="Store submissions, IP documentation, and legal records" icon={FileText} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.filter(d => d.category === category).map((doc) => (
              <Link
                key={doc.title}
                to={doc.path}
                className="group rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-5 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                    <doc.icon className={`h-5 w-5 ${doc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{doc.title}</h4>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
