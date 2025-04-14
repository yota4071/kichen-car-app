// lib/admin.ts
import { doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./firebase";

// 管理者かどうかを確認する関数
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    return adminDoc.exists();
  } catch (error) {
    console.error("管理者確認エラー:", error);
    return false;
  }
}