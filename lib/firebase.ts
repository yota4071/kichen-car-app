// firebase.ts
// 既存のfirebase.tsのコードはこのまま残す
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); 
export const provider = new GoogleAuthProvider();

// 以下、型定義を追加

// キッチンカー（店舗）の型定義
export type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  dish?: string; // カテゴリー
  subDish?: string; // サブカテゴリー
  description?: string;
};

// メニューアイテムの型定義
export type MenuItem = {
  id: string;
  kitchenId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  likedBy?: string[];
};

// スケジュールの型定義
export type Schedule = {
  id: string;
  date: Timestamp;
  kitchenId: string;
  spotId: string;
  createdBy: string;
  createdAt: Timestamp;
  kitchenName?: string; // 表示用に追加するプロパティ（非保存）
  spotName?: string; // 表示用に追加するプロパティ（非保存）
};

// キャンパススポットの型定義
export type CampusSpot = {
  id: string;
  campusId: 'oic' | 'bkc' | 'kinugasa';
  name: string;
  description: string;
  x: number; // マップ上の位置（X座標）
  y: number; // マップ上の位置（Y座標）
};

// キャンパスIDの型定義
export type CampusId = 'oic' | 'bkc' | 'kinugasa';