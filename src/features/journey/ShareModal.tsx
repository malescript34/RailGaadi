"use client";

import React, { useState } from "react";
import { Journey, LiveTrainStatus } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Share2, MessageSquare } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  journey: Journey;
  liveStatus: LiveTrainStatus;
}

export function ShareModal({
  isOpen,
  onClose,
  journey,
  liveStatus,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/journey/${journey.train.number}/${journey.serviceDate}`
    : `https://railgaadi.app/journey/${journey.train.number}/${journey.serviceDate}`;

  const shareText = `Track my train: ${journey.train.name} (${journey.train.number})\nCurrently near ${
    liveStatus.currentStation?.name || "En Route"
  } • ${liveStatus.statusMessage || "Live on RailGaadi"}\n${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `RailGaadi Live Tracking — ${journey.train.name} (${journey.train.number})`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(waUrl, "_blank");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Live Journey">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-slate-500">
          Share real-time GPS position, ETA, and delay updates with friends & family. Anyone with this link can view live progress.
        </p>

        {/* Train Summary Pill */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
              {journey.train.number}
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {journey.train.name}
            </span>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {liveStatus.completionPercentage}% Done
          </span>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 select-all focus:outline-none"
          />
          <Button
            size="md"
            variant="secondary"
            onClick={handleCopy}
            className="flex-shrink-0 gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>

        {/* Direct Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleWhatsAppShare}
            className="gap-2 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </Button>

          <Button
            variant="primary"
            onClick={handleNativeShare}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Link</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
