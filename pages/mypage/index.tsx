import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/router";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";


type UserProfile = {
  displayName: string;
  birthday: string;
  gender: string;
  comment: string;
  favoriteTypes?: string[];
  emailNotifications?: boolean;
  createdAt?: Timestamp | null;
};

type Review = {
  rating: number;
  comment: string;
  shopName: string;
  createdAt: Timestamp | null;
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user.uid);
      } else {
        router.push("/");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // プロフィール情報取得
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        setProfile(userData);
        calculateProfileCompletion(userData);
      } else {
        setProfile({
          displayName: "",
          birthday: "",
          gender: "",
          comment: ""
        });
        setCompletionPercentage(0);
      }

      // ユーザーのレビュー取得
      const reviewsRef = collection(db, "users", userId, "reviews");
      const reviewsSnap = await getDocs(reviewsRef);
      const reviewsList = reviewsSnap.docs.map(doc => doc.data() as Review);
      
      // レビューがあれば日付順に並び替え
      if (reviewsList.length > 0) {
        reviewsList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setReviews(reviewsList.slice(0, 3)); // 最新3件だけ表示
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // プロフィール完成度計算
  const calculateProfileCompletion = (profile: UserProfile) => {
    const fields = [
      { name: 'displayName', value: profile.displayName },
      { name: 'birthday', value: profile.birthday },
      { name: 'gender', value: profile.gender },
      { name: 'comment', value: profile.comment }
    ];
    
    const completedFields = fields.filter(field => field.value && field.value.trim() !== '').length;
    const percentage = Math.round((completedFields / fields.length) * 100);
    setCompletionPercentage(percentage);
  };

  

  // 登録日の表示形式変更
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) return (
    <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
      <div className="loading">
        <p>読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* ヘッダー */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">
              キッチンカー探し
            </Link>

            <nav>
              <ul className="nav-list">
                <li><Link href="/" className="nav-link">ホーム</Link></li>
                <li><Link href="/categories" className="nav-link">カテゴリー</Link></li>
                <li><Link href="/map" className="nav-link">マップ</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-content">
            <h1 className="profile-title">マイページ</h1>
            <p className="profile-subtitle">
              {user?.email}
            </p>
          </div>
          <div className="profile-header-pattern"></div>
        </div>


        <div className="profile-body">
          {/* お知らせバナー */}
          {completionPercentage < 100 && (
            <div className="notice-banner">
              <div className="notice-icon">ℹ️</div>
              <div className="notice-content">
                <div className="notice-title">プロフィールを完成させましょう</div>
                <div className="notice-message">
                  プロフィールを完成させることで、より多くの機能が利用できるようになります。
                </div>
              </div>
            </div>
          )}

          {/* プロフィール完成度 */}
          <div className="completion-container">
            <div className="completion-info">
              <span className="completion-label">プロフィール完成度</span>
              <span className="completion-percentage">{completionPercentage}%</span>
            </div>
            <div className="completion-bar">
              <div className="completion-progress" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">{reviews.length}</div>
              <div className="stat-label">投稿したレビュー</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">お気に入り</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {profile?.createdAt ? formatDate(profile.createdAt).split('年')[0] : '-'}
              </div>
              <div className="stat-label">登録年</div>
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-detail">
              <span className="detail-label">表示名</span>
              <div className="detail-value">
                {profile?.displayName ? profile.displayName : (
                  <span className="detail-value empty">未設定</span>
                )}
              </div>
            </div>

            <div className="profile-detail">
              <span className="detail-label">生年月日</span>
              <div className="detail-value">
                {profile?.birthday ? profile.birthday : (
                  <span className="detail-value empty">未設定</span>
                )}
              </div>
            </div>

            <div className="profile-detail">
              <span className="detail-label">性別</span>
              <div className="detail-value">
                {profile?.gender ? profile.gender : (
                  <span className="detail-value empty">未設定</span>
                )}
              </div>
            </div>

            {profile?.favoriteTypes && profile.favoriteTypes.length > 0 && (
              <div className="profile-detail">
                <span className="detail-label">好きな料理タイプ</span>
                <div className="detail-value">
                  {profile.favoriteTypes.map(type => (
                    <span key={type} className="favorite-badge">{type}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="profile-comment">
            <span className="detail-label">自己紹介</span>
            <div className={`comment-content ${!profile?.comment ? 'empty' : ''}`}>
              {profile?.comment || '自己紹介は設定されていません'}
            </div>
          </div>

          {/* 最近のレビュー */}
          {reviews.length > 0 && (
            <div className="activity-section">
              <h2 className="activity-heading">最近のレビュー</h2>
              <div className="activity-list">
                {reviews.map((review, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-date">
                      {review.createdAt ? formatDate(review.createdAt) : '日付不明'}
                    </div>
                    <div className="activity-content">
                      <strong>{review.shopName}</strong>：{review.rating}★ - {review.comment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-actions">
            <Link href="/" className="btn btn-secondary">ホームに戻る</Link>
            <Link href="/mypage/edit" className="btn btn-primary">プロフィールを編集する</Link>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <h3>キッチンカー探し</h3>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                お近くの美味しいキッチンカーをすぐに見つけられるアプリ
              </p>
            </div>
            
            <div className="footer-column">
              <h3>リンク</h3>
              <div className="footer-links">
                <Link href="/" className="footer-link">ホーム</Link>
                <Link href="/categories" className="footer-link">カテゴリー</Link>
                <Link href="/map" className="footer-link">マップ</Link>
                <Link href="/about" className="footer-link">サイトについて</Link>
              </div>
            </div>
            
            <div className="footer-column">
              <h3>お問い合わせ</h3>
              <div className="footer-links">
                <Link href="/contact" className="footer-link">お問い合わせフォーム</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} キッチンカー探し. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}