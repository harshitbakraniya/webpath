import { useNavigate } from 'react-router-dom';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteSite } from '../../api/pages.api';
import type { SiteDocument } from '../../types/page';
import { SitePreview } from './SitePreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function SiteDetailPanel({
  site,
  onDelete,
}: {
  site: SiteDocument;
  onDelete: (siteId: string) => void;
}) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteSite(site.id);
      toast.success('Site deleted');
      onDelete(site.id);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete site');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--e-text)]">{site.name}</h1>
          <p className="mt-1 capitalize text-[var(--e-text-muted)]">{site.status}</p>
        </div>
        <div className="flex items-center gap-2">
          {site.homePageId && (
            <Button type="button" onClick={() => navigate(`/editor/${site.id}/${site.homePageId}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit site
            </Button>
          )}
          {site.status === 'published' && (
            <Button type="button" variant="outline" asChild>
              <a href={`/site/${site.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View live
              </a>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete website?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <span className="font-medium text-[var(--e-text)]">{site.name}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => void handleDelete()}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {site.homePageRoot?.length ? (
            <SitePreview root={site.homePageRoot} className="h-[420px] w-full border-b border-[var(--e-border)]" />
          ) : (
            <div className="flex h-64 items-center justify-center bg-[var(--e-hover)] text-[var(--e-text-subtle)]">No preview available</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--e-text-subtle)]">Slug</p>
            <p className="mt-1 font-medium text-[var(--e-text)]">/site/{site.slug}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--e-text-subtle)]">Created</p>
            <p className="mt-1 font-medium text-[var(--e-text)]">{new Date(site.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
