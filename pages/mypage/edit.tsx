// pages/mypage/edit.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// コンポーネントのインポート
import Layout from "@/components/Layout";
import ProfileContainer from "@/components/profile/ProfileContainer";
import FoodTypeSelector from "@/components/FoodTypeSelector";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import SuccessMessage from "@/components/ui/SuccessMessage";
import Button from "@/components/ui/Button";
import { 
  FormGroup, 
  FormLabel, 
  FormInput, 
  FormSelect,
  FormTextarea,
  FormCheckbox 
} from "@/components/ui/form";

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

  const router = useRouter();

  // 料理タイプの選択肢
  const foodTypes = [
    "和食", "洋食", "中華", "アジア料理", "スイーツ", "ドリンク", "その他"
  ];

  // 性別オプション
  const genderOptions = [
    { value: "未選択", label: "選択してください" },
    { value: "男性", label: "男性" },
    { value: "女性", label: "女性" },
    { value: "その他", label: "その他" },
    { value: "回答しない", label: "回答しない" }
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
  }, [router]);

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
      }, { merge: true }); //ここ帰る

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

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Layout>
      <ProfileContainer 
        title="プロフィール編集" 
        email={user?.email || ""}
      >
        <form className="edit-form" onSubmit={handleSave}>
          <FormGroup>
            <FormLabel htmlFor="displayName">表示名</FormLabel>
            <FormInput
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="あなたの表示名"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="birthday">生年月日</FormLabel>
            <FormInput
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="gender">性別</FormLabel>
            <FormSelect
              id="gender"
              options={genderOptions}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>好きな料理タイプ（複数選択可）</FormLabel>
            <FoodTypeSelector
              selectedTypes={favoriteTypes}
              availableTypes={foodTypes}
              onChange={toggleFoodType}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="comment">自己紹介</FormLabel>
            <FormTextarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="あなた自身について教えてください（好きな食べ物、普段の過ごし方など）"
              rows={5}
            />
          </FormGroup>

          <FormGroup className="mb-8">
            <FormCheckbox
              id="notifications"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              label="最新情報やおすすめをメールで受け取る"
            />
          </FormGroup>

          <div className="profile-actions">
            <Button href="/mypage" variant="secondary">
              キャンセル
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '変更を保存する'}
            </Button>
          </div>

          {saveSuccess && (
            <SuccessMessage>
              プロフィールが正常に保存されました！マイページにリダイレクトします...
            </SuccessMessage>
          )}
        </form>
      </ProfileContainer>
    </Layout>
  );
}