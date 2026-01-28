"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, FileDown, Link2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  listId: string;
  open: boolean;
  onClose: () => void;
  isShared: boolean;
  shareToken?: string | null;
};

export function ShareExportModal({
  listId,
  open,
  onClose,
  isShared,
  shareToken,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(shareToken ?? null);

  const shareUrl = token
    ? `${window.location.origin}/shopping-lists/share/${token}`
    : null;

  /* ───────── Generate / Regenerate Link ───────── */

  const generateLink = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/shopping-lists/${listId}/share`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      setToken(json.token);

      const url = `${window.location.origin}/shopping-lists/share/${json.token}`;
      await navigator.clipboard.writeText(url);

      toast.success("Share link generated & copied");
    } catch {
      toast.error("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Disable Sharing ───────── */

  const disableSharing = async () => {
    try {
      setLoading(true);

      await fetch(`/api/shopping-lists/share/${listId}/share`, {
        method: "DELETE",
      });

      setToken(null);
      toast.success("Sharing disabled");
    } catch {
      toast.error("Failed to disable sharing");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Export PDF (hook only) ───────── */

  const exportPdf = () => {
    toast.info("PDF export coming next 🚀");
    // later:
    // window.open(`/api/shopping-lists/share/${listId}/export-pdf`)
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>Share or Export</DialogTitle>
        </DialogHeader>

        {/* ───────── Share Section ───────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Shareable link
          </h3>

          {shareUrl ? (
            <div className="space-y-2">
              <div className="rounded-md border bg-muted px-3 py-2 text-xs break-all">
                {shareUrl}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={disableSharing}
                  disabled={loading}
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Disable
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" onClick={generateLink} disabled={loading}>
              Generate link
            </Button>
          )}
        </div>

        {/* ───────── Export Section ───────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </h3>

          <Button variant="outline" size="sm" onClick={exportPdf}>
            Export as PDF
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
