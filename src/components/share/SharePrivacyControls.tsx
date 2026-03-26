import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, User, Hash, MessageSquare, Clock, Type, EyeOff } from 'lucide-react';
import { PrivacySettings } from '@/services/shareService';

interface SharePrivacyControlsProps {
  privacy: PrivacySettings;
  onChange: (privacy: PrivacySettings) => void;
}

const controls = [
  { key: 'includeName' as const, label: 'Name', icon: User },
  { key: 'includePhoto' as const, label: 'Photo', icon: User },
  { key: 'includeExactNumbers' as const, label: 'Numbers', icon: Hash },
  { key: 'includeMentorQuote' as const, label: 'Mentor quote', icon: MessageSquare },
  { key: 'includeDateTime' as const, label: 'Date/time', icon: Clock },
  { key: 'includeFooter' as const, label: 'Footer', icon: Type },
];

export function SharePrivacyControls({ privacy, onChange }: SharePrivacyControlsProps) {
  return (
    <div className="space-y-4">
      {/* Private Aesthetic Mode */}
      <div className="studio-switch-row">
        <div className="flex items-center gap-2">
          <EyeOff className="w-3.5 h-3.5 text-primary/40" />
          <Label className="text-[11px] font-medium text-white cursor-pointer">Private mode</Label>
        </div>
        <Switch
          checked={privacy.privateAestheticMode}
          onCheckedChange={(checked) => onChange({ ...privacy, privateAestheticMode: checked })}
          className="scale-75"
        />
      </div>

      <div className="space-y-0.5">
        {controls.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-2">
              <Icon className="w-3 h-3 text-white" />
              <Label className="text-[10px] text-white cursor-pointer">{label}</Label>
            </div>
            <Switch
              checked={privacy[key]}
              disabled={privacy.privateAestheticMode && ['includeName', 'includePhoto', 'includeExactNumbers'].includes(key)}
              onCheckedChange={(checked) => onChange({ ...privacy, [key]: checked })}
              className="scale-[0.65]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
