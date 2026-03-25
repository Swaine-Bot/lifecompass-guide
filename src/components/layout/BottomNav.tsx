import { Home, Target, PenLine, MessageCircle, Users, Crown } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingFriendRequests } from '@/hooks/usePendingFriendRequests';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/goals', label: 'Plan', icon: Target },
  { path: '/journal', label: 'Journal', icon: PenLine },
  { path: '/mentor', label: 'Mentor', icon: MessageCircle },
  { path: '/community', label: 'Connect', icon: Users },
];

export const BottomNav = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const pendingCount = usePendingFriendRequests();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/80 backdrop-blur-2xl border-t border-white/[0.04]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/home' && location.pathname.startsWith(item.path));
          const showBadge = item.path === '/community' && pendingCount > 0;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-2 flex-1 relative transition-colors duration-200",
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2.5 rounded-full bg-primary/[0.08]" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-colors relative z-10",
                  isActive ? "text-primary" : "text-muted-foreground/60"
                )} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1 z-20">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-wide transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground/60"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex flex-col items-center gap-0.5 py-2 px-2 flex-1"
          >
            <div className="relative">
              {location.pathname.startsWith('/admin') && (
                <div className="absolute -inset-2.5 rounded-full bg-primary/[0.08]" />
              )}
              <Crown className={cn(
                "w-5 h-5 transition-colors relative z-10",
                location.pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground/60"
              )} />
            </div>
            <span className={cn(
              "text-[10px] font-medium tracking-wide transition-colors duration-200",
              location.pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground/60"
            )}>
              Admin
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
};
