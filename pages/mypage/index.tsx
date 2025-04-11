// pages/mypage/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import ProfileContainer from "@/components/profile/ProfileContainer";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileComment from "@/components/profile/ProfileComment";
import ProfileCompletion from "@/components/profile/ProfileCompletion";
import NoticeBanner from "@/components/NoticeBanner";
import StatsContainer from "@/components/profile/StatsContainer";
import ActivitySection from "@/components/profile/ActivitySection";
import Button from "@/components/ui/Button";
import LoadingIndicator from "@/components/ui/LoadingIndicator";

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
  }, [router]);

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

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Layout>
      <ProfileContainer
        title="マイページ"
        email={user?.email || ""}
      >
        {/* お知らせバナー */}
        {completionPercentage < 100 && (
          <NoticeBanner
            title="プロフィールを完成させましょう"
            message="プロフィールを完成させることで、より多くの機能が利用できるようになります。"
          />
        )}

        {/* プロフィール完成度 */}
        <ProfileCompletion percentage={completionPercentage} />

        {/* 統計情報 */}
        <StatsContainer
          reviewCount={reviews.length}
          favoritesCount={0}
          registrationYear={profile?.createdAt ? formatDate(profile.createdAt).split('年')[0] : '-'}
        />

        {/* プロフィール情報 */}
        <ProfileInfo
          displayName={profile?.displayName}
          birthday={profile?.birthday}
          gender={profile?.gender}
          favoriteTypes={profile?.favoriteTypes}
        />

        {/* 自己紹介 */}
        <ProfileComment comment={profile?.comment} />

        {/* 最近のレビュー */}
        <ActivitySection 
          title="最近のレビュー"
          reviews={reviews}
          formatDate={formatDate}
        />

        {/* アクション */}
        <div className="profile-actions">
          <Button href="/" variant="secondary">ホームに戻る</Button>
          <Button href="/mypage/edit" variant="primary">プロフィールを編集する</Button>
        </div>
      </ProfileContainer>
    </Layout>
  );
}