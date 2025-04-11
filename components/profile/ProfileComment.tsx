// components/profile/ProfileComment.tsx

type ProfileCommentProps = {
    comment?: string;
  };
  
  export default function ProfileComment({ comment }: ProfileCommentProps) {
    const isEmpty = !comment || comment.trim() === '';
    
    return (
      <div className="profile-comment">
        <span className="detail-label">自己紹介</span>
        <div className={`comment-content ${isEmpty ? 'empty' : ''}`}>
          {isEmpty ? '自己紹介は設定されていません' : comment}
        </div>
      </div>
    );
  }