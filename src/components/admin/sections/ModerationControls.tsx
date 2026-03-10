import { useState } from 'react';
import { Shield, Trash2 } from 'lucide-react';
import { SectionHeader } from '../SectionHeader';
import { AdminAnalytics, deleteUser } from '@/services/adminAnalyticsService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const lifePhaseLabels: Record<string, string> = {
  student_early_career: 'Student/Early Career',
  builder: 'Builder',
  family_home: 'Family & Home',
  explorer: 'Explorer',
  legacy_impact: 'Legacy & Impact',
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export function ModerationControls({ data, onUserDeleted }: { data: AdminAnalytics; onUserDeleted: (userId: string) => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      onUserDeleted(userId);
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Moderation & User Controls"
        description="Operational user management · Separated from behavioral analytics"
        icon={Shield}
      />

      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">USER MANAGEMENT</h3>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Life Phase</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Screen Time</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.details.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-sm">{user.country}</TableCell>
                  <TableCell className="text-sm">{user.province}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {lifePhaseLabels[user.lifePhase] || user.lifePhase}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.subscriptionTier === 'free' ? 'secondary' : 'default'} className="text-xs">
                      {user.subscriptionTier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDuration(user.totalScreenTimeSeconds)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.goalsCount}G · {user.habitsCount}H · {user.journalCount}J · {user.postsCount}P
                  </TableCell>
                  <TableCell className="text-xs">{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" disabled={deletingId === user.id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this user and all their data. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(user.id)}>
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
