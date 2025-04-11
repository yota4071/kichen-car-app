// components/profile/ProfileContainer.tsx
import { ReactNode } from 'react';

type ProfileContainerProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  email?: string;
};

export default function ProfileContainer({ 
  children, 
  title, 
  subtitle, 
  email 
}: ProfileContainerProps) {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-title">{title}</h1>
          <p className="profile-subtitle">
            {subtitle || email}
          </p>
        </div>
        <div className="profile-header-pattern"></div>
      </div>

      <div className="profile-body">
        {children}
      </div>
    </div>
  );
}