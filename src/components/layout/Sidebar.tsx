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
  { path: '/habits', label: 'Habits', icon: BarChart3 },
  { path: '/journal', label: 'Journal', icon: PenLine },
  { path: '/mentor', label: 'AI Mentor', icon: MessageCircle },
  { path: '/community', label: 'Community', icon: Users, showBadge: true },
  { path: '/mirror', label: 'Mirror', icon: Sparkles },
];

const secondaryNavItems = [
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/life-events', label: 'Life Events', icon: Gift },
  { path: '/cinematics', label: 'Cinematics', icon: Film },
  { path: '/vault', label: 'Vault', icon: Archive },
  { path: '/insights', label: 'Insight Library', icon: Lightbulb },
  { path: '/library', label: 'Playbooks', icon: BookOpen },
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

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const isActive = location.pathname === item.path || 
      (item.path !== '/home' && location.pathname.startsWith(item.path));
    const showBadge = (item as any).showBadge && pendingCount > 0;
    
    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
          isActive 
            ? "bg-primary/[0.08] text-primary" 
            : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.03]"
        )}
      >
        <div className="relative">
          <item.icon className="w-[18px] h-[18px]" />
          {showBadge && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
        <span className="tracking-wide">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-card/40 backdrop-blur-xl border-r border-white/[0.04]">
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-white/[0.04]">
        <Link to="/home" className="flex items-center gap-2.5">
          <img src={lifestackLogo} alt="LifeStack" className="w-7 h-7" />
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">LifeStack</span>
        </Link>
      </div>

      {/* User Info */}
      {profile && (
        <div className="p-3.5 mx-3 mt-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <p className="text-sm font-medium text-foreground truncate">{profile.name || 'User'}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">
            {phaseLabels[profile.life_phase] || 'Builder'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin mt-1">
        {mainNavItems.map(renderNavItem)}

        {/* Divider */}
        <div className="h-px bg-white/[0.04] my-3" />
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70 px-4 mb-1.5 font-medium">More</p>
        {secondaryNavItems.map(renderNavItem)}

        {isAdmin && (
          <>
            <div className="h-px bg-white/[0.04] my-3" />
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                location.pathname.startsWith('/admin')
                  ? "bg-primary/[0.08] text-primary"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.03]"
              )}
            >
              <Crown className="w-[18px] h-[18px]" />
              <span className="tracking-wide">Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/[0.04] space-y-0.5">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
            location.pathname === '/settings'
              ? "bg-primary/[0.08] text-primary"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.03]"
          )}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="tracking-wide">Settings</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-2.5 h-auto text-muted-foreground/60 hover:text-destructive text-sm"
          onClick={handleSignOut}
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="tracking-wide">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
