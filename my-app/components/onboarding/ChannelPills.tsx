"use client"

import React from 'react';
import type { ChannelOption } from '@/types/onboarding';

interface ChannelPillsProps {
  channels: ChannelOption[];
}

export function ChannelPills({ channels }: ChannelPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {channels.map((channel) => (
        <span
          key={channel.name}
          className="inline-flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1"
          style={
            channel.comingSoon
              ? {
                  color: "#94a3b8",
                  background: "rgba(148,163,184,0.06)",
                  border: "1px dashed rgba(148,163,184,0.3)",
                }
              : {
                  color: "#1e3a5f",
                  background: "#e8f4ff",
                  border: "1px solid #b8dcff",
                }
          }
        >
          {channel.emoji} {channel.name}
          {channel.comingSoon && (
            <span className="text-[10px] text-gray-400 italic">soon</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default ChannelPills;
