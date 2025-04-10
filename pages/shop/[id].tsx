import { useRouter } from "next/router";
import { doc, getDoc, getDocs, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
  } from "firebase/auth";
  import { auth, provider } from "@/lib/firebase";
  import { Timestamp } from "firebase/firestore"; // 上部でインポート追加

type Shop = {
  name: string;
  location: string;
  image: string;
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
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = async () => {
    if (!id) return;
    const reviewRef = collection(db, "kitchens", String(id), "reviews");
    const snapshot = await getDocs(reviewRef);
    const reviewList: Review[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Review);
    setReviews(reviewList);
  };
  const [user, setUser] = useState<User | null>(null);

// 初回にログイン状態を監視する
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
  });
  return () => unsubscribe(); // クリーンアップ
}, []);

// ログイン
const handleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("ログインエラー", err);
  }
};

// ログアウト
const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("ログアウトエラー", err);
  }
};

  useEffect(() => {
    if (!id) return;
    const fetchShop = async () => {
      const ref = doc(db, "kitchens", String(id));
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setShop(snapshot.data() as Shop);
      }
    };
    fetchShop();
    fetchReviews();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const displayName = userData?.displayName ?? "名無し";

    const reviewRef = collection(db, "kitchens", String(id), "reviews");
    await addDoc(reviewRef, {
      rating,
      comment,
      displayName,
      createdAt: serverTimestamp(),
    });

    setComment("");
    setRating(5);
    setSuccess(true);
    fetchReviews();
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!shop) return <p className="p-8">読み込み中...</p>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{shop.name}</h1>
        <p className="text-gray-600 mt-2">{shop.location}</p>
        <img src={shop.image} alt={shop.name} className="mt-4 rounded-lg w-full max-w-md shadow" />
      </div>
      <div className="mb-4">
  {user ? (
    <div className="flex items-center justify-between">
      <p className="text-black font-semibold">
        ログイン中：{user.displayName}
      </p>
      <button
        onClick={handleLogout}
        className="text-sm text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
      >
        ログアウト
      </button>
    </div>
  ) : (
    <button
      onClick={handleLogin}
      className="text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
    >
      Googleでログイン
    </button>
  )}
</div>

      {/* レビュー投稿フォーム */}
    {user ? (
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-black">レビューを投稿する</h2>

        <label className="block text-black">
          評価（1〜5）:
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border mt-1 p-2 w-full"
            required
          />
        </label>

        <label className="block text-black">
          コメント:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border mt-1 p-2 w-full"
            rows={4}
            required
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          投稿する
        </button>

        {success && <p className="text-green-600 mt-2">投稿が完了しました！</p>}
      </form>
    ) : (
        <div className="text-white text-sm">※レビュー投稿にはログインが必要です。</div>
    )}
      {/* レビュー一覧 */}
        <div className="mt-10 max-w-md">
            <h2 className="text-xl font-bold text-black mb-4">レビュー一覧</h2>
            {reviews.length === 0 ? (
                <p className="text-gray-600">まだレビューはありません。</p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((review, index) => (
                        <li key={index} className="border p-4 rounded bg-white shadow">
                            <p className="font-semibold text-black">評価: ★{review.rating}</p>
                            <p className="text-black mt-1">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                投稿者: {review.displayName ?? "匿名ユーザー"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
}