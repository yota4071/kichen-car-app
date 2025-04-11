// components/profile/StatsContainer.tsx

type StatCardProps = {
    value: number | string;
    label: string;
  };
  
  function StatCard({ value, label }: StatCardProps) {
    return (
      <div className="stat-card">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  }
  
  type StatsContainerProps = {
    reviewCount: number;
    favoritesCount: number;
    registrationYear: string | number;
  };
  
  export default function StatsContainer({ 
    reviewCount, 
    favoritesCount, 
    registrationYear 
  }: StatsContainerProps) {
    return (
      <div className="stats-container">
        <StatCard value={reviewCount} label="投稿したレビュー" />
        <StatCard value={favoritesCount} label="お気に入り" />
        <StatCard value={registrationYear} label="登録年" />
      </div>
    );
  }