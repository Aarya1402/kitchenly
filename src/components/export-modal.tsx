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
import { useMemo, useState } from "react";
import axios from "axios";

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

  /* ───────── Derived share URL (SSR-safe) ───────── */

  const shareUrl = useMemo(() => {
    console.log(window.location.origin);
    if (typeof window === "undefined" || !token) return null;
    return `${window.location.origin}/shopping-lists/share/${token}`;
  }, [token]);

  /* ───────── Clipboard helper ───────── */

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success("Link copied");
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Failed to copy link");
    }
  };

  /* ───────── Generate / Regenerate Link ───────── */

  const generateLink = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`/api/shopping-lists/${listId}/share`);

      const newToken = res.data?.token;
      setToken(newToken);

      if (typeof window !== "undefined" && newToken) {
        const url = `${window.location.origin}/shopping-lists/share/${newToken}`;
        await copyToClipboard(url);
      } else {
        toast.success("Share link generated");
      }
    } catch (err) {
      console.error("Generate link failed", err);
      toast.error("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Disable Sharing ───────── */

  const disableSharing = async () => {
    try {
      setLoading(true);

      await axios.delete(`/api/shopping-lists/${listId}/share`);

      setToken(null);
      toast.success("Sharing disabled");
    } catch (err) {
      console.error("Disable sharing failed", err);
      toast.error("Failed to disable sharing");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Export PDF ───────── */

  const exportPdf = () => {
    window.open(`/api/shopping-lists/${listId}/export-pdf`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>Share or Export</DialogTitle>
        </DialogHeader>

        {/* ───────── Share Section ───────── */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="h-4 w-4" />
            Shareable link
          </h3>

          {shareUrl ? (
            <div className="space-y-2">
              <div className="break-all rounded-md border bg-muted px-3 py-2 text-xs">
                {shareUrl}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => copyToClipboard(shareUrl)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  disabled={loading}
                  onClick={disableSharing}
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
          <h3 className="flex items-center gap-2 text-sm font-medium">
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
