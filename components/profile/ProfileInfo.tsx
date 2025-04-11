// components/profile/ProfileInfo.tsx
import { ReactNode } from 'react';

type ProfileDetailProps = {
  label: string;
  value?: string | ReactNode;
  isEmpty?: boolean;
};

function ProfileDetail({ label, value, isEmpty = false }: ProfileDetailProps) {
  return (
    <div className="profile-detail">
      <span className="detail-label">{label}</span>
      <div className="detail-value">
        {!isEmpty ? value : (
          <span className="detail-value empty">未設定</span>
        )}
      </div>
    </div>
  );
}

type ProfileInfoProps = {
  displayName?: string;
  birthday?: string;
  gender?: string;
  favoriteTypes?: string[];
};

export default function ProfileInfo({ 
  displayName, 
  birthday, 
  gender, 
  favoriteTypes 
}: ProfileInfoProps) {
  return (
    <div className="profile-info">
      <ProfileDetail 
        label="表示名" 
        value={displayName} 
        isEmpty={!displayName} 
      />

      <ProfileDetail 
        label="生年月日" 
        value={birthday} 
        isEmpty={!birthday} 
      />

      <ProfileDetail 
        label="性別" 
        value={gender} 
        isEmpty={!gender || gender === "未選択"} 
      />

      {favoriteTypes && favoriteTypes.length > 0 && (
        <ProfileDetail 
          label="好きな料理タイプ" 
          value={
            <>
              {favoriteTypes.map(type => (
                <span key={type} className="favorite-badge">{type}</span>
              ))}
            </>
          } 
        />
      )}
    </div>
  );
}