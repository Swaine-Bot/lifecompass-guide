import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, ArrowLeft, Upload, Zap, Archive, FileText, BarChart3, StickyNote, Eye, Building2, TrendingUp, Target } from 'lucide-react';
import {
  fetchPartners, createPartner, updatePartner,
  fetchPartnerAssets, uploadPartnerAsset, activatePartnerAsset,
  type Partner, type PartnerAsset, type PartnerCreateInput,
} from '@/services/partnerService';
import { cn } from '@/lib/utils';
import { PartnerAnalyst } from './PartnerAnalyst';
import { PartnerPlacementConfig } from './PartnerPlacementConfig';

// ─── Create Partner Dialog ────────────────────────────────────────────

function CreatePartnerDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PartnerCreateInput>({
    name: '',
    slug: '',
    disclosure_label: 'Sponsored',
    status: 'active',
  });

  const update = (key: keyof PartnerCreateInput, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      await createPartner(form);
      toast.success(`Partner "${form.name}" created`);
      setOpen(false);
      setForm({ name: '', slug: '', disclosure_label: 'Sponsored', status: 'active' });
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create partner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />Create Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Partner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Partner Name *</Label>
              <Input value={form.name} onChange={e => { update('name', e.target.value); if (!form.slug || form.slug === autoSlug(form.name.slice(0, -1))) update('slug', autoSlug(e.target.value)); }} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slug *</Label>
              <Input value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="acme-corp" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Name</Label>
              <Input value={form.contact_name || ''} onChange={e => update('contact_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Email</Label>
              <Input type="email" value={form.contact_email || ''} onChange={e => update('contact_email', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Phone</Label>
              <Input value={form.contact_phone || ''} onChange={e => update('contact_phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input value={form.website_url || ''} onChange={e => update('website_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input value={form.industry || ''} onChange={e => update('industry', e.target.value)} placeholder="Health & Wellness" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value={form.country || ''} onChange={e => update('country', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Brand Description</Label>
            <Textarea value={form.brand_description || ''} onChange={e => update('brand_description', e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Brand Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.brand_color || '#000000'} onChange={e => update('brand_color', e.target.value)} className="w-10 h-9 p-1 cursor-pointer" />
                <Input value={form.brand_color || ''} onChange={e => update('brand_color', e.target.value)} placeholder="#FF5500" className="flex-1" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Disclosure Label</Label>
              <Input value={form.disclosure_label || 'Sponsored'} onChange={e => update('disclosure_label', e.target.value)} placeholder="Sponsored" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Default CTA Label</Label>
              <Input value={form.default_cta_label || ''} onChange={e => update('default_cta_label', e.target.value)} placeholder="Learn More" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Default CTA URL</Label>
              <Input value={form.default_cta_url || ''} onChange={e => update('default_cta_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Billing Entity</Label>
              <Input value={form.billing_entity || ''} onChange={e => update('billing_entity', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={form.status === 'active'} onCheckedChange={v => update('status', v ? 'active' : 'inactive')} />
                <span className="text-xs text-muted-foreground">{form.status === 'active' ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Contract Start</Label>
              <Input type="date" value={form.contract_start_date || ''} onChange={e => update('contract_start_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contract End</Label>
              <Input type="date" value={form.contract_end_date || ''} onChange={e => update('contract_end_date', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Internal Notes</Label>
            <Textarea value={form.internal_notes || ''} onChange={e => update('internal_notes', e.target.value)} rows={2} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Creating…' : 'Create Partner'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Asset Upload Dialog ──────────────────────────────────────────────

function AssetUploadDialog({ partner, onUploaded }: { partner: Partner; onUploaded: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [placementType, setPlacementType] = useState('share_card');
  const [disclosureOverride, setDisclosureOverride] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [activateNow, setActivateNow] = useState(false);

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error('File and title are required');
      return;
    }
    setUploading(true);
    try {
      await uploadPartnerAsset(partner.id, partner.slug, file, {
        title,
        campaign_name: campaignName || undefined,
        placement_type: placementType,
        disclosure_override: disclosureOverride || undefined,
        cta_label_override: ctaLabel || undefined,
        cta_url_override: ctaUrl || undefined,
        notes: notes || undefined,
        activate_now: activateNow,
      });
      toast.success(`Asset "${title}" uploaded${activateNow ? ' and activated' : ''}`);
      setOpen(false);
      setFile(null);
      setTitle('');
      setCampaignName('');
      setNotes('');
      setActivateNow(false);
      onUploaded();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Upload className="w-3.5 h-3.5" />Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Asset — {partner.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">File *</Label>
            <Input type="file" accept="image/*,.pdf,.svg,.webp,.gif" onChange={e => setFile(e.target.files?.[0] || null)} />
            {file && <p className="text-[10px] text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Asset Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Hero banner — Spring 2026" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign Name</Label>
              <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Winter Momentum 2026" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Placement</Label>
              <select value={placementType} onChange={e => setPlacementType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                <option value="share_card">Share Card</option>
                <option value="ai_insight">AI Insight</option>
                <option value="feed_post">Feed Post</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Disclosure Override</Label>
              <Input value={disclosureOverride} onChange={e => setDisclosureOverride(e.target.value)} placeholder={partner.disclosure_label} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CTA Label Override</Label>
              <Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder={partner.default_cta_label || 'Learn More'} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">CTA URL Override</Label>
            <Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder={partner.default_cta_url || 'https://...'} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
            <div>
              <Label className="text-xs font-medium">Activate Now</Label>
              <p className="text-[10px] text-muted-foreground">Makes this the live asset, archives current active</p>
            </div>
            <Switch checked={activateNow} onCheckedChange={setActivateNow} />
          </div>

          <Button onClick={handleUpload} disabled={uploading || !file} className="w-full">
            {uploading ? 'Uploading…' : 'Upload Asset'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Partner Profile ──────────────────────────────────────────────────

function PartnerProfile({ partner, onBack, onUpdate }: { partner: Partner; onBack: () => void; onUpdate: () => void }) {
  const [assets, setAssets] = useState<PartnerAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const loadAssets = useCallback(async () => {
    try {
      const data = await fetchPartnerAssets(partner.id);
      setAssets(data);
    } catch (err: any) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [partner.id]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const activeAssets = assets.filter(a => a.asset_status === 'active');
  const archivedAssets = assets.filter(a => a.asset_status === 'archived');
  const draftAssets = assets.filter(a => a.asset_status === 'draft' || a.asset_status === 'approved');

  const handleActivate = async (assetId: string) => {
    try {
      await activatePartnerAsset(assetId);
      toast.success('Asset activated');
      loadAssets();
    } catch (err: any) {
      toast.error(err.message || 'Activation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">{partner.name}</h2>
            <Badge variant={partner.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
              {partner.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{partner.slug} · {partner.industry || 'No industry'}</p>
        </div>
        <AssetUploadDialog partner={partner} onUploaded={loadAssets} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1 text-xs"><Eye className="w-3 h-3" />Overview</TabsTrigger>
          <TabsTrigger value="placement" className="gap-1 text-xs"><Target className="w-3 h-3" />Placement</TabsTrigger>
          <TabsTrigger value="assets" className="gap-1 text-xs"><Upload className="w-3 h-3" />Assets</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1 text-xs"><BarChart3 className="w-3 h-3" />Campaigns</TabsTrigger>
          <TabsTrigger value="analyst" className="gap-1 text-xs"><TrendingUp className="w-3 h-3" />Analyst</TabsTrigger>
          <TabsTrigger value="archive" className="gap-1 text-xs"><Archive className="w-3 h-3" />Archive</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1 text-xs"><StickyNote className="w-3 h-3" />Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="placement" className="pt-4">
          <PartnerPlacementConfig partnerId={partner.id} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Contact" value={partner.contact_name} />
            <InfoField label="Email" value={partner.contact_email} />
            <InfoField label="Phone" value={partner.contact_phone} />
            <InfoField label="Website" value={partner.website_url} />
            <InfoField label="Country" value={partner.country} />
            <InfoField label="Industry" value={partner.industry} />
            <InfoField label="Disclosure Label" value={partner.disclosure_label} />
            <InfoField label="Default CTA" value={partner.default_cta_label ? `${partner.default_cta_label} → ${partner.default_cta_url || ''}` : null} />
            <InfoField label="Brand Color" value={partner.brand_color}>
              {partner.brand_color && <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: partner.brand_color }} />}
            </InfoField>
            <InfoField label="Billing Entity" value={partner.billing_entity} />
            <InfoField label="Contract" value={partner.contract_start_date ? `${partner.contract_start_date} → ${partner.contract_end_date || 'ongoing'}` : null} />
          </div>
          {partner.brand_description && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Brand Description</p>
              <p className="text-sm">{partner.brand_description}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4 pt-4">
          {activeAssets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active</h3>
              <div className="grid gap-3">
                {activeAssets.map(a => <AssetCard key={a.id} asset={a} />)}
              </div>
            </div>
          )}
          {draftAssets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Draft / Pending</h3>
              <div className="grid gap-3">
                {draftAssets.map(a => <AssetCard key={a.id} asset={a} onActivate={() => handleActivate(a.id)} />)}
              </div>
            </div>
          )}
          {assets.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No assets uploaded yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4 pt-4">
          {(() => {
            const campaigns = new Map<string, PartnerAsset[]>();
            assets.forEach(a => {
              const key = a.campaign_name || 'Uncategorized';
              if (!campaigns.has(key)) campaigns.set(key, []);
              campaigns.get(key)!.push(a);
            });
            if (campaigns.size === 0) return (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No campaigns yet</p>
              </div>
            );
            return Array.from(campaigns.entries()).map(([name, campAssets]) => (
              <Card key={name}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">{name}</CardTitle>
                  <CardDescription className="text-xs">{campAssets.length} asset{campAssets.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  {campAssets.map(a => (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <StatusBadge status={a.asset_status} />
                      <span className="truncate flex-1">{a.title}</span>
                      <span className="text-muted-foreground">{a.placement_type}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ));
          })()}
        </TabsContent>

        <TabsContent value="analyst" className="pt-4">
          <PartnerAnalyst partnerId={partner.id} partnerName={partner.name} assets={assets} />
        </TabsContent>

        <TabsContent value="archive" className="space-y-3 pt-4">
          {archivedAssets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No archived assets</p>
            </div>
          ) : archivedAssets.map(a => (
            <Card key={a.id} className="opacity-75">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  {a.file_type?.startsWith('image') && (
                    <img src={a.file_url} alt={a.title} className="w-12 h-12 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Archived on {a.archived_at ? new Date(a.archived_at).toLocaleString() : 'unknown'}
                      {a.replaced_campaign_name && ` · replaced by campaign "${a.replaced_campaign_name}"`}
                    </p>
                    {a.campaign_name && <p className="text-[10px] text-muted-foreground">Campaign: {a.campaign_name}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-xs">Internal Notes</Label>
            <NotesEditor partnerId={partner.id} initialNotes={partner.internal_notes || ''} onUpdate={onUpdate} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Small Components ─────────────────────────────────────────────────

function InfoField({ label, value, children }: { label: string; value: string | null | undefined; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-1.5">
        {children}
        <p className="text-sm truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    approved: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    archived: 'bg-white/5 text-white/60 border-white/10',
  };
  return <span className={cn('text-[9px] px-1.5 py-0.5 rounded border font-medium', colors[status] || colors.draft)}>{status}</span>;
}

function AssetCard({ asset, onActivate }: { asset: PartnerAsset; onActivate?: () => void }) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          {asset.file_type?.startsWith('image') && (
            <img src={asset.file_url} alt={asset.title} className="w-16 h-16 rounded-lg object-cover border" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium truncate">{asset.title}</p>
              <StatusBadge status={asset.asset_status} />
              {asset.is_latest_active && <Badge variant="outline" className="text-[8px] gap-0.5"><Zap className="w-2 h-2" />Live</Badge>}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {asset.placement_type} · {asset.campaign_name || 'No campaign'} · v{asset.version_number}
            </p>
            {(asset.disclosure_override || asset.cta_label_override) && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {asset.disclosure_override && `Disclosure: "${asset.disclosure_override}"`}
                {asset.cta_label_override && ` · CTA: "${asset.cta_label_override}"`}
              </p>
            )}
          </div>
          {onActivate && (asset.asset_status === 'draft' || asset.asset_status === 'approved') && (
            <Button size="sm" variant="outline" onClick={onActivate} className="gap-1 text-xs shrink-0">
              <Zap className="w-3 h-3" />Activate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NotesEditor({ partnerId, initialNotes, onUpdate }: { partnerId: string; initialNotes: string; onUpdate: () => void }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePartner(partnerId, { internal_notes: notes });
      toast.success('Notes saved');
      onUpdate();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} placeholder="Internal notes, strategy, history..." />
      <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Notes'}</Button>
    </div>
  );
}

// ─── Main Partner Manager ─────────────────────────────────────────────

export function PartnerManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const loadPartners = useCallback(async () => {
    try {
      const data = await fetchPartners();
      setPartners(data);
    } catch (err: any) {
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPartners(); }, [loadPartners]);

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    (p.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  if (selectedPartner) {
    return (
      <PartnerProfile
        partner={selectedPartner}
        onBack={() => { setSelectedPartner(null); loadPartners(); }}
        onUpdate={loadPartners}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Partner Media Pipeline</h2>
          <p className="text-xs text-muted-foreground">Onboard partners, manage assets, control share card integrations</p>
        </div>
        <CreatePartnerDialog onCreated={loadPartners} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners…" className="pl-10" />
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-secondary/30 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{partners.length === 0 ? 'No partners onboarded yet' : 'No matches'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <Card key={p.id} className="cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setSelectedPartner(p)}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-[9px]">{p.status}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {p.slug} · {p.industry || 'No industry'} · {p.disclosure_label}
                    </p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
