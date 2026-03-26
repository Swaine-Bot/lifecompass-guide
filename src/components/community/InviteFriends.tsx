import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageCircle, UserPlus, Send, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface InviteFriendsProps {
  userName?: string;
}

export function InviteFriends({ userName = 'A friend' }: InviteFriendsProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  const appUrl = window.location.origin;
  const inviteMessage = `${userName} invites you to join LifeStack - Your personal life companion for goal setting, habit tracking, and personal growth. Download now: ${appUrl}`;

  const handleEmailInvite = () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const subject = encodeURIComponent(`${userName} invites you to LifeStack`);
    const body = encodeURIComponent(inviteMessage);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    
    toast.success('Email app opened with invite!');
    setEmail('');
  };

  const handleWhatsAppInvite = () => {
    // Format phone number - remove spaces and ensure it starts with country code
    let formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    
    if (!formattedPhone) {
      // If no phone number, open WhatsApp with just the message
      const encodedMessage = encodeURIComponent(inviteMessage);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      toast.success('WhatsApp opened!');
      return;
    }

    // Remove leading + if present for the wa.me link
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }

    const encodedMessage = encodeURIComponent(inviteMessage);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
    
    toast.success('WhatsApp opened with invite!');
    setPhone('');
  };

  const copyInviteLink = async () => {
    try {
      const { copyText } = await import('@/services/share/nativeClipboardAdapter');
      await copyText(inviteMessage);
      setCopied(true);
      toast.success('Invite message copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Friends to LifeStack
          </DialogTitle>
          <DialogDescription>
            Share LifeStack with friends and family who aren't signed up yet
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Friend's Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailInvite()}
              />
            </div>
            <Button 
              variant="gold" 
              className="w-full gap-2"
              onClick={handleEmailInvite}
            >
              <Send className="w-4 h-4" />
              Send Email Invite
            </Button>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Friend's Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code. Leave empty to choose from contacts.
              </p>
            </div>
            <Button 
              variant="gold" 
              className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
              onClick={handleWhatsAppInvite}
            >
              <MessageCircle className="w-4 h-4" />
              {phone ? 'Send WhatsApp Invite' : 'Open WhatsApp'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-border/30">
          <Label className="text-muted-foreground text-xs mb-2 block">Or copy invite message:</Label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground line-clamp-2">
              {inviteMessage}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyInviteLink}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
