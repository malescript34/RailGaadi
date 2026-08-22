"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/v1/monitoring/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, digest: error.digest, stack: error.stack }),
    }).catch(() => undefined);
  }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">Please retry. If the problem continues, the issue has been recorded for investigation.</p>
      <Button className="mt-5" onClick={reset}>Try again</Button>
    </div>
  );
}
