import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createPage, createSite } from '../../api/pages.api';
import { STARTER_TEMPLATES } from '../../templates/starterTemplates';
import { SitePreview } from './SitePreview';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface CreateWebsiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (siteId: string) => void;
}

export function CreateWebsiteModal({ open, onOpenChange, onCreated }: CreateWebsiteModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'name' | 'template'>('name');
  const [siteName, setSiteName] = useState('');
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep('name');
      setSiteName('');
      setCreating(null);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (creating) return;
    onOpenChange(next);
  };

  const handleContinue = () => {
    const name = siteName.trim();
    if (!name) {
      toast.error('Please enter a website name');
      return;
    }
    setStep('template');
  };

  const handleSelectTemplate = async (templateId: string) => {
    const name = siteName.trim();
    if (!name) return;

    setCreating(templateId);
    try {
      const site = await createSite(name);
      const page = await createPage(site.id, {
        templateId,
        slug: 'home',
        title: 'Home',
      });
      toast.success('Website created!');
      onCreated?.(site.id);
      onOpenChange(false);
      navigate(`/editor/${site.id}/${page.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create website');
    } finally {
      setCreating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0" onInteractOutside={(e) => creating && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create new website</DialogTitle>
          <DialogDescription>
            {step === 'name' ? 'Step 1 of 2 — Name your site' : 'Step 2 of 2 — Choose a template'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {step === 'name' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Website name</Label>
                <Input
                  id="site-name"
                  placeholder="e.g. My Portfolio"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  autoFocus
                />
              </div>
              <DialogFooter className="px-0 py-0">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleContinue} disabled={!siteName.trim()}>
                  Continue
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--e-text-muted)]">
                Creating <span className="font-medium text-[var(--e-text)]">{siteName.trim()}</span>
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {STARTER_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      'cursor-pointer overflow-hidden transition-all hover:border-[var(--palette-timber-wolf)] hover:shadow-md',
                      creating === template.id && 'border-[var(--palette-reversed-grey)] ring-2 ring-[var(--palette-reversed-grey)]',
                      !!creating && creating !== template.id && 'opacity-60',
                    )}
                    onClick={() => !creating && void handleSelectTemplate(template.id)}
                  >
                    <SitePreview root={[...template.sections]} className="h-36 w-full border-b border-[var(--e-border)]" />
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>Banner, About & Contact</CardDescription>
                      {creating === template.id && (
                        <p className="text-xs font-medium text-[var(--e-text-muted)]">Creating...</p>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <DialogFooter className="justify-between px-0 py-0 sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep('name')} disabled={!!creating}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={!!creating}>
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
