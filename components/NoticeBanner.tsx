// components/NoticeBanner.tsx
import { ReactNode } from 'react';

type NoticeBannerProps = {
  title: string;
  message: string | ReactNode;
  icon?: string | ReactNode;
};

export default function NoticeBanner({ 
  title, 
  message, 
  icon = "ℹ️" 
}: NoticeBannerProps) {
  return (
    <div className="notice-banner">
      <div className="notice-icon">{icon}</div>
      <div className="notice-content">
        <div className="notice-title">{title}</div>
        <div className="notice-message">{message}</div>
      </div>
    </div>
  );
}