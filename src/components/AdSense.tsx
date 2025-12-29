'use client'; // Required for AdSense in Next.js App Router

import React, { useEffect } from 'react';

interface AdProps {
  slot: string;
}

export const AdSense: React.FC<AdProps> = ({ slot }) => {
  useEffect(() => {
    try {
      // Check if window and adsbygoogle are available
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, [slot]); // Re-run if slot changes

  return (
    <div className="my-8 flex justify-center overflow-hidden min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your real ID
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};