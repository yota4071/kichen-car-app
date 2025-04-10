import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("男性");
  const [comment, setComment] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || "");
          setBirthday(data.birthday || "");
          setGender(data.gender || "男性");
          setComment(data.comment || "");
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await setDoc(doc(db, "users", user.uid), {
      displayName,
      birthday,
      gender,
      comment,
    });

    alert("プロフィールを保存しました！");
    router.push("/mypage");
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow rounded space-y-4">
      <h1 className="text-xl font-bold text-black">プロフィール編集</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <label className="block text-black">
          表示名：
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <label className="block text-black">
          生年月日：
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <label className="block text-black">
          性別：
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border p-2 w-full"
          >
            <option>男性</option>
            <option>女性</option>
            <option>その他</option>
          </select>
        </label>

        <label className="block text-black">
          コメント：
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 w-full"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          保存する
        </button>
      </form>
    </div>
  );
}