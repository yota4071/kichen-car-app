// components/profile/ProfileCompletion.tsx

type ProfileCompletionProps = {
    percentage: number;
  };
  
  export default function ProfileCompletion({ percentage }: ProfileCompletionProps) {
    return (
      <div className="completion-container">
        <div className="completion-info">
          <span className="completion-label">プロフィール完成度</span>
          <span className="completion-percentage">{percentage}%</span>
        </div>
        <div className="completion-bar">
          <div 
            className="completion-progress" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }