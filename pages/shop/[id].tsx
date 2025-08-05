// pages/shop/[id].tsx
import { useRouter } from "next/router";
import { 
  doc, getDoc, getDocs, collection, addDoc, serverTimestamp, 
  updateDoc, arrayUnion, arrayRemove, query, where, setDoc, DocumentData, deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import styles from "../../styles/ShopDetail.module.css";
import ShareButton from "@/components/ShareButton";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { RatingStars } from "@/components/shop/RatingStars";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { ReviewList } from "@/components/shop/ReviewList";
import NoticeBanner from "@/components/NoticeBanner";
import { MenuList } from "@/components/shop/MenuList";
import ShopSchedule from "@/components/shop/ShopSchedule"; // 追加：今後の出店予定コンポーネント

type Shop = {
  name: string;
  location: string;
  image: string;
  type?: string;
  description?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  displayName: string;
  createdAt?: Timestamp;
  likes: number;
  likedBy: string[];
  userLiked?: boolean;
  reports?: number;
  userId?: string; // レビュー投稿者のユーザーID
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  likes: number;
  likedBy: string[];
  userLiked?: boolean;
};

export default function ShopDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [shop, setShop] = useState<Shop | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');
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
      await Promise.all([fetchShop(), fetchReviews(), fetchMenuItems()]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [id, user]);

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
      
      // レビューデータの取得
      const reviewList: Review[] = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        // ここで明示的に型指定
        const data = docSnapshot.data() as DocumentData;
        const likedBy = data.likedBy || [];
        
        // 報告数を取得
        let reportCount = 0;
        try {
          const reportRef = doc(db, "reports", docSnapshot.id);
          const reportSnap = await getDoc(reportRef);
          if (reportSnap.exists()) {
            const reportData = reportSnap.data() as DocumentData;
            reportCount = reportData.count || 0;
          }
        } catch (e) {
          console.error("Error fetching report count:", e);
        }
        
        return {
          id: docSnapshot.id,
          rating: data.rating,
          comment: data.comment,
          displayName: data.displayName || '匿名ユーザー',
          createdAt: data.createdAt,
          likes: likedBy.length,
          likedBy: likedBy,
          userLiked: user ? likedBy.includes(user.uid) : false,
          reports: reportCount,
          userId: data.userId // レビュー投稿者のユーザーID
        };
      }));
      
      setReviews(reviewList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchMenuItems = async () => {
    if (!id) return;
    try {
      const menuRef = collection(db, "kitchens", String(id), "menu");
      const snapshot = await getDocs(menuRef);
      
      const menuList: MenuItem[] = snapshot.docs.map((docSnapshot) => {
        // ここで明示的に型指定
        const data = docSnapshot.data() as DocumentData;
        const likedBy = data.likedBy || [];
        
        return {
          id: docSnapshot.id,
          name: data.name,
          price: data.price,
          description: data.description,
          image: data.image,
          category: data.category,
          likes: likedBy.length,
          likedBy: likedBy,
          userLiked: user ? likedBy.includes(user.uid) : false
        };
      });
      
      setMenuItems(menuList);
    } catch (error) {
      console.error("Error fetching menu items:", error);
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

  const isValidInput = (input: string): boolean => {
    const pattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9F\w\s\-\$\¥\~]*$/;
    return pattern.test(input);
  };
  
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user || !id) return;
  
    // 🔒 入力チェック（コメントに使える文字だけ許可）
    if (!isValidInput(comment)) {
      alert("コメントには日本語・英数字・-・$・¥・~ のみ使用できます。");
      return;
    }
  
    setIsSubmitting(true);
    try {
      const userProfileRef = doc(db, "users", user.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : null;
  
      const displayName = userProfile?.displayName || `匿名ユーザー${user.uid.slice(-4)}`;
  
      const reviewData = {
        rating,
        comment,
        displayName,
        createdAt: serverTimestamp(),
        userId: user.uid,
        likes: 0,
        likedBy: []
      };
  
      const docRef = await addDoc(
        collection(db, "kitchens", String(id), "reviews"),
        reviewData
      );
  
      if (shop) {
        await addDoc(collection(db, "users", user.uid, "reviews"), {
          ...reviewData,
          shopId: id,
          shopName: shop.name,
          reviewId: docRef.id,
        });
      }
  
      setSuccessMessage("レビューが投稿されました！");
      await fetchReviews();
  
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

  const handleLikeReview = async (reviewId: string): Promise<boolean> => {
    if (!user || !id) {
      alert("いいねするにはログインしてください");
      return false; // ログインしていない場合はfalseを返してUIが更新されないようにする
    }
  
    try {
      const reviewRef = doc(db, "kitchens", String(id), "reviews", reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data();
        const likedBy = reviewData.likedBy || [];
        
        // すでにいいねしている場合は取り消す
        if (likedBy.includes(user.uid)) {
          await updateDoc(reviewRef, {
            likedBy: arrayRemove(user.uid)
          });
        } else {
          // いいねを追加
          await updateDoc(reviewRef, {
            likedBy: arrayUnion(user.uid)
          });
        }
        
        // レビュー一覧を更新
        await fetchReviews();
        return true; // 処理成功
      }
      return false; // レビューが存在しない場合
    } catch (error) {
      console.error("Error handling review like:", error);
      return false; // エラーが発生した場合
    }
  };

  // レビュー報告の処理
  const handleReportReview = async (reviewId: string): Promise<boolean> => {
    if (!user || !id) {
      alert("レビューを報告するにはログインしてください");
      return false;
    }
    
    try {
      const reviewRef = doc(db, "kitchens", String(id), "reviews", reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data();
        
        // 投稿者本人は報告できない
        if (reviewData.userId === user.uid) {
          alert("自分の投稿は報告できません");
          return false;
        }
        
        // 報告コレクションをチェックして重複報告を防ぐ
        const reportRef = doc(db, "reports", reviewId);
        const reportSnap = await getDoc(reportRef);
        
        if (reportSnap.exists()) {
          const reportData = reportSnap.data();
          const reportedBy = reportData.reportedBy || [];
          
          // すでに報告している場合は報告しない
          if (reportedBy.includes(user.uid)) {
            alert("すでにこのレビューを報告しています");
            return false;
          }
          
          // 報告者リストに追加して報告数を更新
          await updateDoc(reportRef, {
            reportedBy: arrayUnion(user.uid),
            count: (reportData.count || 0) + 1,
            updatedAt: serverTimestamp()
          });
        } else {
          // 新規報告を作成
          await setDoc(reportRef, {
            reviewId: reviewId,
            kitchenId: id,
            reportedBy: [user.uid],
            count: 1,
            content: reviewData.comment,
            authorId: reviewData.userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        // 報告数をチェックして自動削除の判定
        const updatedReportSnap = await getDoc(reportRef);
        if (updatedReportSnap.exists()) {
          const updatedReportData = updatedReportSnap.data();
          const reportCount = updatedReportData.count || 0;
          const reportThreshold = 5;
          
          if (reportCount >= reportThreshold) {
            try {
              // レビューを削除
              await deleteDoc(reviewRef);
              
              // 報告ドキュメントにステータスを追加
              await updateDoc(reportRef, {
                status: 'auto_deleted',
                deletedAt: serverTimestamp()
              });
              
              alert(`複数のユーザーから報告があったため、レビューは自動的に削除されました。`);
            } catch (deleteError) {
              console.error("レビュー自動削除エラー:", deleteError);
            }
          }
        }
        
        // レビュー一覧を更新
        await fetchReviews();
        return true;
      }
      return false;
    } catch (error) {
      console.error("レビュー報告エラー:", error);
      return false;
    }
  };

  // レビュー削除の処理
  const handleDeleteReview = async (reviewId: string): Promise<boolean> => {
    if (!user || !id) {
      alert("レビューを削除するにはログインしてください");
      return false;
    }
    
    try {
      const reviewRef = doc(db, "kitchens", String(id), "reviews", reviewId);
      const reviewSnap = await getDoc(reviewRef);
      
      if (reviewSnap.exists()) {
        const reviewData = reviewSnap.data();
        
        // 投稿者本人のみ削除可能
        if (reviewData.userId !== user.uid) {
          alert("自分のレビューのみ削除できます");
          return false;
        }
        
        // レビューを削除
        await deleteDoc(reviewRef);
        
        // レビュー一覧を更新
        await fetchReviews();
        return true;
      }
      return false;
    } catch (error) {
      console.error("レビュー削除エラー:", error);
      alert("レビューの削除に失敗しました");
      return false;
    }
  };
  
  // メニューアイテムへのいいね処理
  const handleLikeMenuItem = async (menuId: string): Promise<boolean> => {
    if (!user || !id) {
      alert("いいねするにはログインしてください");
      return false;
    }
    
    try {
      const menuRef = doc(db, "kitchens", String(id), "menu", menuId);
      const menuSnap = await getDoc(menuRef);
      
      if (menuSnap.exists()) {
        const menuData = menuSnap.data();
        const likedBy = menuData.likedBy || [];
        
        // すでにいいねしている場合は取り消す
        if (likedBy.includes(user.uid)) {
          await updateDoc(menuRef, {
            likedBy: arrayRemove(user.uid)
          });
        } else {
          // いいねを追加
          await updateDoc(menuRef, {
            likedBy: arrayUnion(user.uid)
          });
        }
        
        // メニュー一覧を更新
        await fetchMenuItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error handling menu item like:", error);
      return false;
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
              <div className="review-stats">
                <RatingStars 
                  rating={reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length} 
                  size="lg" 
                />
                <span className="review-count">
                  ({reviews.length}件のレビュー)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* シェア機能 */}
        <div className="flex items-center justify-end mt-2 mb-4">
          <ShareButton
            title={`${shop.name} | キッチンカー探し`}
            url="https://nomnom-eats.com/"
          />
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
            className={`${styles.tab} ${activeTab === 'menu' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            メニュー ({menuItems.length})
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
            <h2 className="section-title">キッチンカー情報</h2>
            
            {shop.description ? (
              <p className="shop-description">{shop.description}</p>
            ) : (
              <p className="shop-description">このキッチンカーは、{shop.location}で営業しています。{shop.type}を提供しており、美味しい料理をお楽しみいただけます。</p>
            )}
            
            <div className="shop-detail-box">
              <h3 className="detail-heading">営業情報</h3>
              <p>営業場所: {shop.location}</p>
              <p>料理ジャンル: {shop.type || "不明"}</p>
              <p className="detail-note">※営業時間は日によって異なる場合があります。詳細はお問い合わせください。</p>
            </div>
            
            {/* 今後の出店予定を表示 */}
            <ShopSchedule shopId={id as string} />
          </div>
        ) : activeTab === 'menu' ? (
          <div className={styles.section}>
            <h2 className="section-title">メニュー</h2>
            
            {user ? (
              <MenuList
                menuItems={menuItems}
                onLikeMenuItem={handleLikeMenuItem}
                displayLimit={6}
              />
            ) : (
              <>
                <NoticeBanner
                  title="メニューアイテムにいいねするには"
                  message="いいね機能を使うにはログインが必要です。右上のログインボタンからログインしてください。"
                />
                <div className="mt-4">
                  <MenuList
                    menuItems={menuItems}
                    onLikeMenuItem={handleLikeMenuItem}
                    displayLimit={6}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.section}>
            <h2 className="section-title">レビュー</h2>
            
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
                  onLikeReview={handleLikeReview}
                  onReportReview={handleReportReview}
                  onDeleteReview={handleDeleteReview}
                  currentUserId={user?.uid}
                />
            </div>
          </div>
        )}
        
        {/* 戻るボタン */}
        <div className="back-button-container">
          <Button href="/" variant="secondary">
            ホームに戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
}