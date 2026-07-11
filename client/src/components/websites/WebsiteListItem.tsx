import { useState } from "react";
import { Link } from "react-router-dom";
import { EllipsisVertical, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSite } from "../../api/pages.api";
import type { SiteDocument } from "../../types/page";
import { SitePreview } from "./SitePreview";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function WebsiteListItem({
  site,
  onDelete,
}: {
  site: SiteDocument;
  onDelete: (siteId: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSite(site.id);
      toast.success("Site deleted");
      onDelete(site.id);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete site");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col items-center p-0">
        {/* Preview area links to editor */}
        {site.homePageRoot?.length ? (
          <Link
            to={`/editor/${site.id}/${site.homePageId}`}
            tabIndex={-1}
            className="w-full"
          >
            <SitePreview
              root={site.homePageRoot}
              className="h-36 w-full shrink-0"
            />
          </Link>
        ) : (
          <Link
            to={`/editor/${site.id}/${site.homePageId}`}
            tabIndex={-1}
            className="w-full"
          >
            <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg border border-[var(--e-border)] bg-[var(--e-hover)] text-sm text-[var(--e-text-subtle)]">
              No preview
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="w-full">
            <h3 className="truncate text-sm font-semibold text-[var(--e-text)]">
              <Link
                to={`/editor/${site.id}/${site.homePageId}`}
                className="hover:underline"
              >
                {site.name}
              </Link>
            </h3>
            <Link
              to={`/site/${site.slug}`}
              className="text-xs text-[var(--e-text-subtle)] underline"
              onClick={e => e.stopPropagation()}
            >
              View site
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer h-8 w-10 flex items-center justify-center p-0"
                // Prevent the dropdown button from triggering navigation when inside a clickable card
                onClick={e => e.stopPropagation()}
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={e => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
