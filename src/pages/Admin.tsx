import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Clock, 
  Target,
  BookOpen,
  MessageSquare,
  Heart,
  BarChart3,
  Shield,
  FileText,
  ArrowLeft,
  AlertTriangle,
  Bot,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface Analytics {
  users: {
    total: number;
    byCountry: Record<string, number>;
    byProvince: Record<string, number>;
    byLifePhase: Record<string, number>;
    growth: { date: string; count: number }[];
    details: {
      id: string;
      country: string;
      province: string;
      lifePhase: string;
      isSubscribed: boolean;
      subscriptionTier: string;
      joinedAt: string;
      totalScreenTimeSeconds: number;
      habitsCount: number;
      goalsCount: number;
      journalCount: number;
      postsCount: number;
    }[];
  };
  subscriptions: {
    breakdown: Record<string, number>;
    totalActive: number;
  };
  revenue: {
    monthly: number;
    proRevenue: number;
    founderRevenue: number;
  };
  features: {
    usage: Record<string, number>;
    mostUsed: { feature: string; count: number }[];
    goalCategories: Record<string, number>;
  };
  engagement: {
    totalScreenTimeSeconds: number;
    avgScreenTimePerUserSeconds: number;
    moodTrends: { mood: number; count: number }[];
    moodByCountry: Record<string, { avgMood: number; count: number }>;
  };
  moderation: {
    flaggedPosts: { id: string; content: string; reason: string; createdAt: string }[];
    flaggedJournals: { id: string; reason: string; createdAt: string }[];
  };
  mentorStats: {
    totalConversations: number;
    totalMessages: number;
    recentConversations: { id: string; title: string; messageCount: number; createdAt: string }[];
  };
}

const COLORS = ['#D4AF37', '#8B7355', '#6B8E23', '#4682B4', '#9370DB', '#CD853F'];

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const lifePhaseLabels: Record<string, string> = {
  student_early_career: 'Student/Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy & Impact',
};

export default function Admin() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !isAdmin) return;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          setError('No authentication token');
          setLoading(false);
          return;
        }

        const { data, error: fnError } = await supabase.functions.invoke('admin-analytics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (fnError) {
          console.error('Function error:', fnError);
          setError(fnError.message);
        } else {
          setAnalytics(data);
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && isAdmin) {
      fetchAnalytics();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const countryData = Object.entries(analytics?.users.byCountry || {}).map(([name, value]) => ({ name, value }));
  const lifePhaseData = Object.entries(analytics?.users.byLifePhase || {}).map(([name, value]) => ({ 
    name: lifePhaseLabels[name] || name, 
    value 
  }));
  const subscriptionData = Object.entries(analytics?.subscriptions.breakdown || {}).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }));
  const featureData = analytics?.features.mostUsed || [];
  const goalCategoryData = Object.entries(analytics?.features.goalCategories || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">LifeStack Analytics & Insights</p>
            </div>
          </div>
          <Link 
            to="/ip-docs" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">IP Documentation</span>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.subscriptions.totalActive || 0} subscribed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.revenue.monthly.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Pro: ${analytics?.revenue.proRevenue.toFixed(2)} | Founder: ${analytics?.revenue.founderRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Screen Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(analytics?.engagement.avgScreenTimePerUserSeconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per user average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(analytics?.features.usage || {}).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total feature interactions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="mentor">Mentor</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.users.growth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Country Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Users by Country
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {countryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Life Phase Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Users by Life Phase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lifePhaseData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Province Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Users by Province/State</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {Object.entries(analytics?.users.byProvince || {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([province, count]) => (
                          <div key={province} className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm">{province}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      {Object.keys(analytics?.users.byProvince || {}).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">
                          No province data available yet
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* User Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>User activity and engagement (excluding personal information)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>Life Phase</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Screen Time</TableHead>
                        <TableHead>Habits</TableHead>
                        <TableHead>Goals</TableHead>
                        <TableHead>Journal</TableHead>
                        <TableHead>Posts</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics?.users.details.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.country}</TableCell>
                          <TableCell>{user.province}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {lifePhaseLabels[user.lifePhase] || user.lifePhase}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.subscriptionTier === 'free' ? 'secondary' : 'default'}
                              className={user.subscriptionTier === 'founder' ? 'bg-amber-500' : ''}
                            >
                              {user.subscriptionTier}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDuration(user.totalScreenTimeSeconds)}</TableCell>
                          <TableCell>{user.habitsCount}</TableCell>
                          <TableCell>{user.goalsCount}</TableCell>
                          <TableCell>{user.journalCount}</TableCell>
                          <TableCell>{user.postsCount}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(user.joinedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {subscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      ${analytics?.revenue.monthly.toFixed(2)}
                    </div>
                    <p className="text-muted-foreground">Total Monthly Revenue</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-semibold">${analytics?.revenue.proRevenue.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Pro Plans</p>
                        <p className="text-xs text-muted-foreground">
                          {analytics?.subscriptions.breakdown['pro'] || 0} subscribers × $9.99
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-semibold">${analytics?.revenue.founderRevenue.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Founder Plans</p>
                        <p className="text-xs text-muted-foreground">
                          {analytics?.subscriptions.breakdown['founder'] || 0} subscribers × $6.58/mo
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Free Users</span>
                      <Badge variant="secondary">{analytics?.subscriptions.breakdown['free'] || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-muted-foreground">Conversion Rate</span>
                      <Badge>
                        {analytics?.users.total 
                          ? (((analytics.subscriptions.totalActive) / analytics.users.total) * 100).toFixed(1)
                          : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Most Used Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feature" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Goal Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goal Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={goalCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {goalCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Mood Trends from Journal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Journal Mood Trends
                  </CardTitle>
                  <CardDescription>Distribution of mood scores from journal entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.engagement.moodTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="mood" 
                          tickFormatter={(value) => `${value}/10`}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => `Mood: ${value}/10`}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Usage Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Feature Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Target className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{analytics?.features.usage.goals || 0}</div>
                        <p className="text-sm text-muted-foreground">Goals Created</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{analytics?.features.usage.habits || 0}</div>
                        <p className="text-sm text-muted-foreground">Habits Tracked</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{analytics?.features.usage.journal || 0}</div>
                        <p className="text-sm text-muted-foreground">Journal Entries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MessageSquare className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{analytics?.features.usage.mentor || 0}</div>
                        <p className="text-sm text-muted-foreground">Mentor Chats</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mentor Tab */}
          <TabsContent value="mentor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentor Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Mentor Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Total Conversations</span>
                      <Badge variant="secondary" className="text-lg px-3">
                        {analytics?.mentorStats?.totalConversations || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Total Messages</span>
                      <Badge variant="secondary" className="text-lg px-3">
                        {analytics?.mentorStats?.totalMessages || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                      <span className="text-sm font-medium">Avg Messages per Conversation</span>
                      <Badge variant="default" className="text-lg px-3">
                        {analytics?.mentorStats?.totalConversations 
                          ? (analytics.mentorStats.totalMessages / analytics.mentorStats.totalConversations).toFixed(1)
                          : 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Conversations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Mentor Conversations</CardTitle>
                  <CardDescription>Latest AI mentor interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {analytics?.mentorStats?.recentConversations?.slice(0, 10).map((convo) => (
                        <div key={convo.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                          <div>
                            <p className="text-sm font-medium">{convo.title || 'Untitled Conversation'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(convo.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{convo.messageCount} msgs</Badge>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-sm text-center py-8">
                          No mentor conversations yet
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Mood by Country */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  User Mood by Country
                </CardTitle>
                <CardDescription>Average mood scores across different countries</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Avg Mood</TableHead>
                        <TableHead>Journal Entries</TableHead>
                        <TableHead>Mood Indicator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(analytics?.engagement?.moodByCountry || {})
                        .sort(([, a], [, b]) => b.avgMood - a.avgMood)
                        .map(([country, data]) => (
                          <TableRow key={country}>
                            <TableCell className="font-medium">{country}</TableCell>
                            <TableCell>{data.avgMood.toFixed(1)}</TableCell>
                            <TableCell>{data.count}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={data.avgMood >= 7 ? 'default' : data.avgMood >= 5 ? 'secondary' : 'destructive'}
                                className={data.avgMood >= 7 ? 'bg-success' : ''}
                              >
                                {data.avgMood >= 7 ? '😊 Good' : data.avgMood >= 5 ? '🙂 Okay' : '😔 Low'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {Object.keys(analytics?.engagement?.moodByCountry || {}).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No mood data available yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Flagged Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Flagged Content
                  </CardTitle>
                  <CardDescription>Posts and content flagged by AI moderation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {analytics?.moderation?.flaggedPosts?.map((post) => (
                        <div key={post.id} className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-warning border-warning">
                              Flagged Post
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mb-2 line-clamp-3">{post.content}</p>
                          <p className="text-xs text-warning">Reason: {post.reason}</p>
                        </div>
                      ))}
                      {analytics?.moderation?.flaggedJournals?.map((journal) => (
                        <div key={journal.id} className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-warning border-warning">
                              Flagged Journal
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(journal.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-warning">Reason: {journal.reason}</p>
                        </div>
                      ))}
                      {(!analytics?.moderation?.flaggedPosts?.length && !analytics?.moderation?.flaggedJournals?.length) && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Sparkles className="h-12 w-12 mx-auto mb-4 text-success" />
                          <p className="font-medium">All Clear!</p>
                          <p className="text-sm">No flagged content to review</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
