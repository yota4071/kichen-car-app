// pages/shop/[id].tsx
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter } from "next/router";
import { doc, getDoc, getDocs, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
//import Link from "next/link";
import styles from "../../styles/ShopDetail.module.css";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { RatingStars } from "@/components/shop/RatingStars";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { ReviewList } from "@/components/shop/ReviewList";
import NoticeBanner from "@/components/NoticeBanner";

type Shop = {
  name: string;
  location: string;
  image: string;
  type?: string;
  description?: string;
};

type Review = {
  rating: number;
  comment: string;
  displayName: string;
  createdAt?: Timestamp;
};

export default function ShopDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shop, setShop] = useState<Shop | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初回にログイン状態を監視する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchShop(), fetchReviews()]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [id]);

  const fetchShop = async () => {
    if (!id) return;
    try {
      const ref = doc(db, "kitchens", String(id));
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setShop(snapshot.data() as Shop);
      } else {
        router.push("/404");
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const reviewRef = collection(db, "kitchens", String(id), "reviews");
      const snapshot = await getDocs(reviewRef);
      const reviewList: Review[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Review);
      
      // レビューを日付順に並べ替え（新しい順）
      reviewList.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      setReviews(reviewList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // pages/shop/[id].tsx の handleReviewSubmit 関数の修正

const handleReviewSubmit = async (rating: number, comment: string) => {
  if (!user || !id) return;
  
  setIsSubmitting(true);
  try {
    // ユーザープロフィールから表示名を取得
    const userProfileRef = doc(db, "users", user.uid);
    const userProfileSnap = await getDoc(userProfileRef);
    const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : null;
    
    // 表示名の決定（優先順位: プロフィールの表示名 > 匿名ID）
    const displayName = userProfile?.displayName || `匿名ユーザー${user.uid.slice(-4)}`;
    
    // キッチンカーのレビューコレクションに追加
    const reviewData = {
      rating,
      comment,
      displayName: displayName, // プロフィールの表示名を使用
      createdAt: serverTimestamp(),
      userId: user.uid,
    };
    
    // キッチンカーのレビューに追加
    await addDoc(collection(db, "kitchens", String(id), "reviews"), reviewData);
    
    // ユーザーのレビュー履歴にも追加
    if (shop) {
      await addDoc(collection(db, "users", user.uid, "reviews"), {
        ...reviewData,
        shopId: id,
        shopName: shop.name,
      });
    }
    
    setSuccessMessage("レビューが投稿されました！");
    setRating(5);
    setComment("");
    
    // レビュー一覧を更新
    await fetchReviews();
    
    // 3秒後にメッセージを消す
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("レビューの投稿に失敗しました。もう一度お試しください。");
  } finally {
    setIsSubmitting(false);
  }
};
  
  // 日付のフォーマット関数
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    return new Date(timestamp.toMillis()).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingIndicator message="キッチンカー情報を読み込み中..." />
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">キッチンカーが見つかりませんでした</h1>
          <p className="mb-8">お探しのキッチンカーは存在しないか、削除された可能性があります。</p>
          <Button href="/" variant="primary">ホームに戻る</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${shop.name} | キッチンカー探し`}>
      <div className={styles.container}>
        {/* キッチンカー情報ヘッダー */}
        <div className={styles.shopHeader}>
          <div className={styles.shopImage}>
            <img src={shop.image} alt={shop.name} />
          </div>
          
          <div className={styles.shopInfo}>
            <h1 className={styles.shopName}>{shop.name}</h1>
            
            <div className={styles.shopLocation}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {shop.location}
            </div>
            
            {shop.type && (
              <div className={styles.typeBadge}>
                {shop.type}
              </div>
            )}
            
            {/* レビュー平均 */}
            {reviews.length > 0 && (
              <div className="mt-4 flex items-center">
                <RatingStars 
                  rating={reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length} 
                  size="lg" 
                />
                <span className="ml-2 text-gray-600">
                  ({reviews.length}件のレビュー)
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* ログイン状態表示セクション */}
        <div className={styles.loginSection}>
          {user ? (
            <div className={styles.userInfo}>
              <span>👤 {user.displayName || user.email || "ユーザー"}</span>
              <span>としてログイン中</span>
            </div>
          ) : (
            <div>レビューを投稿するにはログインしてください</div>
          )}
          
          {user ? (
            <button onClick={handleLogout} className={styles.logoutButton}>
              ログアウト
            </button>
          ) : (
            <button onClick={handleLogin} className={styles.loginButton}>
              ログイン
            </button>
          )}
        </div>
        
        {/* タブ切り替え */}
        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('info')}
          >
            基本情報
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            レビュー ({reviews.length})
          </div>
        </div>
        
        {/* タブコンテンツ */}
        {activeTab === 'info' ? (
          <div className={styles.section}>
            <h2 className="text-xl font-bold mb-4">キッチンカー情報</h2>
            
            {shop.description ? (
              <p className="mb-4">{shop.description}</p>
            ) : (
              <p className="mb-4">このキッチンカーは、{shop.location}で営業しています。{shop.type}を提供しており、美味しい料理をお楽しみいただけます。</p>
            )}
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold mb-2">営業情報</h3>
              <p>営業場所: {shop.location}</p>
              <p>料理ジャンル: {shop.type || "不明"}</p>
              <p className="text-gray-500 text-sm mt-2">※営業時間は日によって異なる場合があります。詳細はお問い合わせください。</p>
            </div>
          </div>
        ) : (
          <div className={styles.section}>
            <h2 className="text-xl font-bold mb-4">レビュー</h2>
            
            {/* レビューフォーム */}
            {user ? (
              <div className={styles.reviewForm}>
                <ReviewForm
                  onSubmit={handleReviewSubmit}
                  isSubmitting={isSubmitting}
                  successMessage={successMessage}
                />
              </div>
            ) : (
              <NoticeBanner
                title="レビューを投稿するには"
                message="レビューを投稿するにはログインが必要です。右上のログインボタンからログインしてください。"
              />
            )}
            
            {/* レビュー一覧 */}
            <div className={styles.reviewsSection}>
              <h3 className={styles.reviewsTitle}>ユーザーレビュー</h3>
              <ReviewList
                reviews={reviews}
                formatDate={(date) => date instanceof Timestamp ? formatDate(date) : ""}
              />
            </div>
          </div>
        )}
        
        {/* 戻るボタン */}
        <div className="mt-12">
          <Button href="/" variant="secondary">
            ホームに戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
}