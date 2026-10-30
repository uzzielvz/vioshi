'use client';

import { useState } from 'react';
import { CheckIcon, ShareIcon } from '@/components/ui/icons';
import { iconButtonClass } from '@/components/ui/styles';

// Native share sheet on phones; elsewhere it copies the link.
export default function ShareButton({ title, label, copiedLabel }: { title: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closing the share sheet rejects; nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access (http, old browser): leave the button as is.
    }
  }

  return (
    <button type="button" onClick={share} aria-label={label} title={copied ? copiedLabel : label} className={iconButtonClass}>
      {copied ? <CheckIcon className="h-[17px] w-[17px]" /> : <ShareIcon className="h-[17px] w-[17px]" />}
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </button>
  );
}
