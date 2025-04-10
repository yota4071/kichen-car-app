import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({
    displayName: "",
    birthDate: "",
    gender: "",
    comment: "",
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as typeof profile);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) return <p className="p-8">読み込み中...</p>;

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow rounded space-y-4">
      <h1 className="text-xl font-bold text-black">マイページ</h1>

      <p className="text-black"><strong>表示名：</strong> {profile.displayName || "未設定"}</p>
      <p className="text-black"><strong>生年月日：</strong> {profile.birthDate || "未設定"}</p>
      <p className="text-black"><strong>性別：</strong> {profile.gender || "未設定"}</p>
      <p className="text-black"><strong>コメント：</strong> {profile.comment || "未設定"}</p>

      <div className="text-right">
        <Link href="/mypage/edit" className="text-blue-600 underline">
          プロフィールを編集する
        </Link>
      </div>
    </div>
  );
}