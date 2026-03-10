import { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Shield, LayoutDashboard, BarChart3, Heart, Target, MessageSquare, Activity, Users, FileText } from 'lucide-react';
import { AdminAnalytics, fetchAdminAnalytics } from '@/services/adminAnalyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Section components
import { ExecutiveOverview } from '@/components/admin/sections/ExecutiveOverview';
import { BehavioralAnalytics } from '@/components/admin/sections/BehavioralAnalytics';
import { SentimentClimate } from '@/components/admin/sections/SentimentClimate';
import { GoalIntelligence } from '@/components/admin/sections/GoalIntelligence';
import { MentorTopicIntelligence } from '@/components/admin/sections/MentorTopicIntelligence';
import { RetentionSignals } from '@/components/admin/sections/RetentionSignals';
import { ModerationControls } from '@/components/admin/sections/ModerationControls';
import { DocumentCenter } from '@/components/admin/sections/DocumentCenter';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'behavioral', label: 'Behavior', icon: BarChart3 },
  { id: 'sentiment', label: 'Sentiment', icon: Heart },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'mentor', label: 'Mentor', icon: MessageSquare },
  { id: 'retention', label: 'Retention', icon: Activity },
  { id: 'moderation', label: 'Users', icon: Users },
  { id: 'documents', label: 'Docs', icon: FileText },
];

export default function Admin() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const load = async () => {
      if (!user || !isAdmin) return;
      try {
        const data = await fetchAdminAnalytics();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && isAdmin) {
      load();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, isAdmin]);

  const handleUserDeleted = useCallback((userId: string) => {
    if (!analytics) return;
    setAnalytics({
      ...analytics,
      overview: { ...analytics.overview, totalUsers: analytics.overview.totalUsers - 1 },
      users: { details: analytics.users.details.filter(u => u.id !== userId) },
    });
  }, [analytics]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto text-center py-20">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-serif font-bold text-foreground">Executive Intelligence</h1>
              <p className="text-xs text-muted-foreground">Privacy-First Analytics · LifeStack</p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            Suitable for external presentation
          </span>
        </div>

        {/* Section Navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-2">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'overview' && <ExecutiveOverview data={analytics} />}
        {activeSection === 'behavioral' && <BehavioralAnalytics data={analytics} />}
        {activeSection === 'sentiment' && <SentimentClimate data={analytics} />}
        {activeSection === 'goals' && <GoalIntelligence data={analytics} />}
        {activeSection === 'mentor' && <MentorTopicIntelligence data={analytics} />}
        {activeSection === 'retention' && <RetentionSignals data={analytics} />}
        {activeSection === 'moderation' && <ModerationControls data={analytics} onUserDeleted={handleUserDeleted} />}
        {activeSection === 'documents' && <DocumentCenter />}
      </div>
    </div>
  );
}
