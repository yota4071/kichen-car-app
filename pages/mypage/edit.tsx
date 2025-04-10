import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";


type UserProfile = {
  displayName: string;
  birthday: string;
  gender: string;
  comment: string;
  favoriteTypes?: string[];
  emailNotifications?: boolean;
};

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("未選択");
  const [comment, setComment] = useState("");
  const [favoriteTypes, setFavoriteTypes] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  // 料理タイプの選択肢
  const foodTypes = [
    "和食", "洋食", "中華", "アジア料理", "スイーツ", "ドリンク", "その他"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user.uid);
      } else {
        router.push("/");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const ref = doc(db, "users", userId);
      const snap = await getDoc(ref);
      
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setDisplayName(data.displayName || "");
        setBirthday(data.birthday || "");
        setGender(data.gender || "未選択");
        setComment(data.comment || "");
        setFavoriteTypes(data.favoriteTypes || []);
        setEmailNotifications(data.emailNotifications || false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        birthday,
        gender,
        comment,
        favoriteTypes,
        emailNotifications,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // 新規作成時のみ設定される
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/mypage");
      }, 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("プロフィールの保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFoodType = (type: string) => {
    if (favoriteTypes.includes(type)) {
      setFavoriteTypes(favoriteTypes.filter(t => t !== type));
    } else {
      setFavoriteTypes([...favoriteTypes, type]);
    }
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

            <button
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="container">
            <ul>
              <li className="mobile-nav-item"><Link href="/">ホーム</Link></li>
              <li className="mobile-nav-item"><Link href="/categories">カテゴリー</Link></li>
              <li className="mobile-nav-item"><Link href="/map">マップ</Link></li>
              <li className="mobile-nav-item"><Link href="/mypage">マイページ</Link></li>
            </ul>
          </div>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-content">
            <h1 className="profile-title">プロフィール編集</h1>
            <p className="profile-subtitle">
              {user?.email}
            </p>
          </div>
          <div className="profile-header-pattern"></div>
        </div>



        <div className="profile-body">
          <form className="edit-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input"
                placeholder="あなたの表示名"
              />
            </div>

            <div className="form-group">
              <label className="form-label">生年月日</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">性別</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
              >
                <option value="未選択">選択してください</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="その他">その他</option>
                <option value="回答しない">回答しない</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">好きな料理タイプ（複数選択可）</label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                marginTop: '0.5rem' 
              }}>
                {foodTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleFoodType(type)}
                    style={{ 
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      border: '1px solid #e2e8f0',
                      background: favoriteTypes.includes(type) ? '#3b82f6' : 'transparent',
                      color: favoriteTypes.includes(type) ? 'white' : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.875rem'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">自己紹介</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-textarea"
                placeholder="あなた自身について教えてください（好きな食べ物、普段の過ごし方など）"
              ></textarea>
            </div>

            <div className="form-group" style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '2rem' 
            }}>
              <input
                type="checkbox"
                id="notifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="notifications" style={{ cursor: 'pointer' }}>
                最新情報やおすすめをメールで受け取る
              </label>
            </div>

            <div className="profile-actions">
              <Link href="/mypage" className="btn btn-secondary">
                キャンセル
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '変更を保存する'}
              </button>
            </div>

            {saveSuccess && (
              <div style={{ 
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f0fff4',
                color: '#38a169',
                borderRadius: '0.5rem',
                textAlign: 'center',
                border: '1px solid #c6f6d5'
              }}>
                プロフィールが正常に保存されました！マイページにリダイレクトします...
              </div>
            )}
          </form>
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