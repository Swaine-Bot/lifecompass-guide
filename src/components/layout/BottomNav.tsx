import { Home, Target, BarChart3, MessageCircle, Users, Crown } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/goals', label: 'Plan', icon: Target },
  { path: '/habits', label: 'Track', icon: BarChart3 },
  { path: '/mentor', label: 'Mentor', icon: MessageCircle },
  { path: '/community', label: 'Connect', icon: Users },
];

export const BottomNav = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  return (
    <nav className="bottom-nav lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/home' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "bottom-nav-item flex-1",
                isActive && "active"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
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
