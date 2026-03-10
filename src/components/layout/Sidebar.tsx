import { Home, Target, BarChart3, MessageCircle, BookOpen, Settings, LogOut, Calendar, PenLine, Users, Gift, Crown, Sparkles, Film, Archive, Lightbulb } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import lifestackLogo from '@/assets/lifestack-logo.png';
import { usePendingFriendRequests } from '@/hooks/usePendingFriendRequests';

const mainNavItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/goals', label: 'Goals & Plans', icon: Target },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/habits', label: 'Habits', icon: BarChart3 },
  { path: '/life-events', label: 'Life Events', icon: Gift },
  { path: '/mentor', label: 'AI Mentor', icon: MessageCircle },
  { path: '/community', label: 'Community', icon: Users, showBadge: true },
  { path: '/mirror', label: 'Mirror', icon: Sparkles },
  { path: '/cinematics', label: 'Cinematics', icon: Film },
  { path: '/vault', label: 'Vault', icon: Archive },
  { path: '/insights', label: 'Insight Library', icon: Lightbulb },
  { path: '/library', label: 'Library', icon: BookOpen },
];

const phaseLabels: Record<string, string> = {
  student_early_career: 'Student / Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy & Impact',
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const pendingCount = usePendingFriendRequests();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/home" className="flex items-center gap-2">
          <img src={lifestackLogo} alt="LifeStack" className="w-8 h-8" />
          <span className="font-serif text-xl font-semibold text-foreground">LifeStack</span>
        </Link>
      </div>

      {/* User Info */}
      {profile && (
        <div className="p-4 mx-4 mt-4 rounded-xl bg-secondary/50 border border-border/30">
          <p className="text-sm font-medium text-foreground truncate">{profile.name || 'User'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {phaseLabels[profile.life_phase] || 'Builder'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/home' && location.pathname.startsWith(item.path));
          const showBadge = item.showBadge && pendingCount > 0;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn("nav-item", isActive && "active")}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="h-px bg-border/50 my-4" />
            <Link
              to="/admin"
              className={cn("nav-item", location.pathname.startsWith('/admin') && "active")}
            >
              <Crown className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className={cn("nav-item", location.pathname === '/settings' && "active")}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-3 h-auto text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
