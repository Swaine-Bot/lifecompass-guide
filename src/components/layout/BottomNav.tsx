import { Home, Target, BarChart3, Sparkles, Users, Crown } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingFriendRequests } from '@/hooks/usePendingFriendRequests';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/goals', label: 'Plan', icon: Target },
  { path: '/habits', label: 'Track', icon: BarChart3 },
  { path: '/mirror', label: 'Mirror', icon: Sparkles },
  { path: '/community', label: 'Connect', icon: Users },
];

export const BottomNav = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const pendingCount = usePendingFriendRequests();

  return (
    <nav className="bottom-nav lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/home' && location.pathname.startsWith(item.path));
          const showBadge = item.path === '/community' && pendingCount > 0;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "bottom-nav-item flex-1 relative",
                isActive && "active"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
              {item.label}
              </span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "bottom-nav-item flex-1",
              location.pathname.startsWith('/admin') && "active"
            )}
          >
            <Crown className={cn(
              "w-5 h-5 transition-colors",
              location.pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs font-medium",
              location.pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground"
            )}>
              Admin
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
};
