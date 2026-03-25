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
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Privacy Controls</span>
      </div>

      {/* Private Aesthetic Mode */}
      <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-card/50 border border-white/[0.08]">
        <div className="flex items-center gap-2.5">
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
        <p className="text-[10px] text-foreground/40 px-1">
          Hides name, photo, and exact numbers automatically
        </p>
      )}

      <div className="space-y-1">
        {controls.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between py-2 px-1">
            <div className="flex items-center gap-2.5">
              <Icon className="w-3.5 h-3.5 text-foreground/40" />
              <Label className="text-xs text-foreground/70 cursor-pointer">{label}</Label>
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
