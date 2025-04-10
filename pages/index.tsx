import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ShopCard from "@/components/ShopCard";
import { onAuthStateChanged, User, signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import Link from "next/link";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
};



export default function Home() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

const handleLogin = async () => {
  if (auth.currentUser || isLoggingIn) return;

  setIsLoggingIn(true);
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("ログインに失敗しました", e);
  } finally {
    setIsLoggingIn(false);
  }
};
  const [shops, setShops] = useState<Shop[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    
    const fetchShops = async () => {
      const querySnapshot = await getDocs(collection(db, "kitchens"));
      const shopList: Shop[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Shop, "id">),
      }));
      setShops(shopList);
    };

    fetchShops();
    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          キッチンカー情報アプリ
        </h1>

        {user ? (
           <Link href="/mypage" className="flex items-center space-x-1 text-blue-500 hover:underline">
              <span>マイページ</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth="1.5"
                stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
              </svg>
            </Link>
        ) : (
          <button
            onClick={handleLogin}
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            ログイン
          </button>
        )}
      </header>

      
      <main className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50">
        {shops.map((shop) => (
          <ShopCard
            key={shop.id}
            id={shop.id}
            name={shop.name}
            location={shop.location}
            image={shop.image}
            type={shop.type}
          />
        ))}
      </main>
    </>
  );
}