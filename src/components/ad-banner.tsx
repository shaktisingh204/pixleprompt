
'use client';
import { getAdCodesForClient } from "@/lib/actions";
import { useEffect, useState } from "react";

export function AdBanner({ className }: { className?: string }) {
  const [adCode, setAdCode] = useState('');

  useEffect(() => {
    async function fetchAdCode() {
      try {
        const codes = await getAdCodesForClient();
        setAdCode(codes['banner-main'] || '');
      } catch (error) {
        console.error("Failed to fetch ad code", error);
      }
    }
    fetchAdCode();
  }, []);

  if (!adCode) {
    return (
      <div
        className={`flex items-center justify-center w-full h-24 bg-muted border border-dashed rounded-lg my-8 ${className}`}
      >
        <span className="text-muted-foreground text-sm">Ad Placement</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full my-8 ${className}`}
      dangerouslySetInnerHTML={{ __html: adCode }}
    />
  );
}
