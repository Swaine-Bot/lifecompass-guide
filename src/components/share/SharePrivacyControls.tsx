import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, User, Hash, MessageSquare, Clock, Type, EyeOff } from 'lucide-react';
import { PrivacySettings } from '@/services/shareService';

interface SharePrivacyControlsProps {
  privacy: PrivacySettings;
  onChange: (privacy: PrivacySettings) => void;
}

const controls = [
  { key: 'includeName' as const, label: 'Include my name', icon: User },
  { key: 'includePhoto' as const, label: 'Include profile photo', icon: User },
  { key: 'includeExactNumbers' as const, label: 'Include exact numbers', icon: Hash },
  { key: 'includeMentorQuote' as const, label: 'Include mentor quote', icon: MessageSquare },
  { key: 'includeDateTime' as const, label: 'Include date/time', icon: Clock },
  { key: 'includeFooter' as const, label: 'Include LifeStack footer', icon: Type },
];

export function SharePrivacyControls({ privacy, onChange }: SharePrivacyControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Privacy Controls</span>
        </div>
      </div>

      {/* Private Aesthetic Mode */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/40 border border-border/30">
        <div className="flex items-center gap-2">
          <EyeOff className="w-3.5 h-3.5 text-primary" />
          <Label className="text-xs font-medium text-foreground cursor-pointer">Private Aesthetic Mode</Label>
        </div>
        <Switch
          checked={privacy.privateAestheticMode}
          onCheckedChange={(checked) => onChange({ ...privacy, privateAestheticMode: checked })}
          className="scale-75"
        />
      </div>
      {privacy.privateAestheticMode && (
        <p className="text-[10px] text-muted-foreground px-1">
          Hides name, photo, and exact numbers automatically
        </p>
      )}

      <div className="space-y-2">
        {controls.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground cursor-pointer">{label}</Label>
            </div>
            <Switch
              checked={privacy[key]}
              disabled={privacy.privateAestheticMode && ['includeName', 'includePhoto', 'includeExactNumbers'].includes(key)}
              onCheckedChange={(checked) => onChange({ ...privacy, [key]: checked })}
              className="scale-75"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
