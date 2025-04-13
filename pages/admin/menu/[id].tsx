// pages/admin/menu/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc, 
  getDocs, serverTimestamp, query, where, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, Shop, MenuItem } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import NoticeBanner from '@/components/NoticeBanner';
import Link from 'next/link';

// 管理者ユーザーID（実際の環境に合わせて設定）
const ADMIN_USER_IDS = [
  'ZoBOb8slRfTCOOknolAWZk7kX6P2',  // ここに実際の管理者ユーザーIDを追加
  'lJgt23pnbCQ9y8CoKbgwAVA9RKI3',
];

const AdminMenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: ''
  });
  
  const router = useRouter();
  const { id } = router.query; // 店舗ID

  // 認証状態監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 管理者チェック
        const isUserAdmin = ADMIN_USER_IDS.includes(user.uid);
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          // 管理者でない場合はトップページにリダイレクト
          router.push('/');
        }
      } else {
        // 未ログインの場合はトップページにリダイレクト
        router.push('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // 店舗データを取得
  useEffect(() => {
    const fetchShopData = async () => {
      if (!id || !isAdmin) return;
      
      try {
        const docRef = doc(db, "kitchens", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setShopData({
            id: docSnap.id,
            name: docSnap.data().name || "",
            location: docSnap.data().location || "",
            image: docSnap.data().image || "",
            type: docSnap.data().type || "",
            dish: docSnap.data().dish || "",
            subDish: docSnap.data().subDish || "",
            description: docSnap.data().description || ""
          });
        } else {
          alert("店舗データが見つかりません。");
          router.push('/admin/shops');
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
        alert("店舗データの取得中にエラーが発生しました。");
      }
    };
    
    if (isAdmin && id) {
      fetchShopData();
    }
  }, [id, isAdmin, router]);

  // メニューデータを取得
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!id || !isAdmin) return;
      
      setIsLoading(true);
      try {
        const menuRef = collection(db, "kitchens", id as string, "menu");
        const menuSnap = await getDocs(menuRef);
        
        const menuList = menuSnap.docs.map(doc => ({
          id: doc.id,
          kitchenId: id as string,
          name: doc.data().name || "",
          price: doc.data().price || 0,
          description: doc.data().description || "",
          image: doc.data().image || "",
          category: doc.data().category || "",
          likedBy: doc.data().likedBy || []
        }));
        
        setMenuItems(menuList);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin && id) {
      fetchMenuItems();
    }
  }, [id, isAdmin]);

  // 入力フォーム変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // メニューアイテム選択処理
  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: String(item.price),
      description: item.description || '',
      image: item.image || '',
      category: item.category || ''
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // 新規追加モード
  const handleAddNew = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      image: '',
      category: ''
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  // キャンセル処理
  const handleCancel = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  // 保存処理（新規追加 or 更新）
  const handleSave = async () => {
    if (!user || !id) return;
    
    try {
      // 入力チェック
      if (!formData.name || !formData.price) {
        alert("メニュー名と価格は必須項目です。");
        return;
      }
      
      const price = Number(formData.price);
      if (isNaN(price) || price <= 0) {
        alert("価格は1以上の数値で入力してください。");
        return;
      }
      
      if (isAdding) {
        // 新規追加の場合
        await addDoc(collection(db, "kitchens", id as string, "menu"), {
          name: formData.name,
          price: price,
          description: formData.description,
          image: formData.image,
          category: formData.category,
          likedBy: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        alert("新しいメニューを登録しました。");
      } else if (isEditing && selectedItem) {
        // 更新の場合
        await updateDoc(doc(db, "kitchens", id as string, "menu", selectedItem.id), {
          name: formData.name,
          price: price,
          description: formData.description,
          image: formData.image,
          category: formData.category,
          updatedAt: serverTimestamp()
        });
        
        alert("メニュー情報を更新しました。");
      }
      
      // 状態をリセットして再読み込み
      setSelectedItem(null);
      setIsEditing(false);
      setIsAdding(false);
      
      // メニュー一覧を再取得
      const menuRef = collection(db, "kitchens", id as string, "menu");
      const menuSnap = await getDocs(menuRef);
      
      const menuList = menuSnap.docs.map(doc => ({
        id: doc.id,
        kitchenId: id as string,
        name: doc.data().name || "",
        price: doc.data().price || 0,
        description: doc.data().description || "",
        image: doc.data().image || "",
        category: doc.data().category || "",
        likedBy: doc.data().likedBy || []
      }));
      
      setMenuItems(menuList);
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("保存中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // 削除処理
  const handleDelete = async (itemId: string) => {
    if (!confirm("このメニューを削除してもよろしいですか？")) return;
    
    try {
      // Firestoreから削除
      await deleteDoc(doc(db, "kitchens", id as string, "menu", itemId));
      
      // 表示を更新
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(null);
        setIsEditing(false);
      }
      
      alert("メニューが削除されました。");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("削除中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // メニュー一括削除
  const handleDeleteAllMenu = async () => {
    if (!confirm("このキッチンカーのメニューをすべて削除してもよろしいですか？この操作は元に戻せません。")) return;
    
    try {
      const batch = writeBatch(db);
      const menuRef = collection(db, "kitchens", id as string, "menu");
      const menuSnap = await getDocs(menuRef);
      
      menuSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      setMenuItems([]);
      setSelectedItem(null);
      setIsEditing(false);
      setIsAdding(false);
      
      alert("すべてのメニューを削除しました。");
    } catch (error) {
      console.error("Error deleting all menu items:", error);
      alert("削除中にエラーが発生しました。もう一度お試しください。");
    }
  };

  if (isLoading && user) {
    return (
      <Layout title="メニュー管理 | 管理者ページ">
        <div className="container py-8">
          <LoadingIndicator message="メニュー情報を読み込み中..." />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout title="アクセス権限エラー">
        <div className="container py-8">
          <NoticeBanner
            title="アクセス権限がありません"
            message="この機能を使用するには管理者としてログインする必要があります。"
            icon="⚠️"
          />
          <div className="flex justify-center mt-8">
            <Button href="/" variant="primary">
              ホームに戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="メニュー管理 | 管理者ページ">
      <div className="container py-8">
        <div className="admin-header">
          <div className="shop-info">
            <div className="back-link">
              <Link href="/admin/shops">← 店舗一覧に戻る</Link>
            </div>
            <h1 className="admin-title">
              {shopData?.name} - メニュー管理
            </h1>
            <p className="shop-type">{shopData?.type}</p>
          </div>
          <div className="admin-actions">
            <Button onClick={handleAddNew} variant="primary">
              新規メニューを追加
            </Button>
          </div>
        </div>

        <div className="admin-content">
          {/* メニュー一覧 */}
          <div className="menu-list">
            <div className="list-header">
              <h2 className="list-title">登録済みメニュー一覧</h2>
              {menuItems.length > 0 && (
                <button
                  onClick={handleDeleteAllMenu}
                  className="delete-all-button"
                >
                  すべて削除
                </button>
              )}
            </div>
            
            {menuItems.length === 0 ? (
              <div className="no-menu-message">
                登録されているメニューがありません。新規追加してください。
              </div>
            ) : (
              <div className="menu-items-grid">
                {menuItems.map(item => (
                  <div 
                    key={item.id}
                    className={`menu-item-card ${selectedItem?.id === item.id ? 'selected-card' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="menu-item-content">
                      <h3 className="menu-item-name">{item.name}</h3>
                      <div className="menu-item-price">¥{item.price.toLocaleString()}</div>
                      {item.category && <div className="menu-item-category">{item.category}</div>}
                      {item.description && <p className="menu-item-desc">{item.description}</p>}
                    </div>
                    <div className="menu-item-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="menu-delete-button"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 編集フォーム */}
          {(isEditing || isAdding) && (
            <div className="edit-form">
              <h2 className="form-title">
                {isAdding ? '新規メニューを追加' : 'メニュー情報を編集'}
              </h2>
              
              <div className="form-group">
                <label htmlFor="name">メニュー名 <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price">価格 (円) <span className="required">*</span></label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">カテゴリー</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="例: メイン、サイド、ドリンクなど"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image">画像URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="/images/menu1.jpg"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">説明文</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={4}
                  placeholder="メニューの説明や特徴を入力してください"
                />
              </div>
              
              <div className="form-actions">
                <Button onClick={handleCancel} variant="secondary">
                  キャンセル
                </Button>
                <Button onClick={handleSave} variant="primary">
                  保存する
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        
        .back-link {
          margin-bottom: 0.5rem;
        }
        
        .back-link a {
          color: #4b5563;
          font-size: 0.875rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .back-link a:hover {
          color: #1f2937;
          text-decoration: underline;
        }
        
        .admin-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .shop-type {
          color: #6b7280;
        }
        
        .admin-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        @media (min-width: 1024px) {
          .admin-content {
            grid-template-columns: 3fr 2fr;
            align-items: start;
          }
        }
        
        .menu-list {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .list-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .delete-all-button {
          background-color: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .delete-all-button:hover {
          background-color: #fecaca;
        }
        
        .menu-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .menu-item-card {
          background-color: #f9fafb;
          border-radius: 0.5rem;
          padding: 1rem;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
        }
        
        .menu-item-card:hover {
          background-color: #f3f4f6;
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .selected-card {
          background-color: #dbeafe;
          border-color: #93c5fd;
        }
        
        .menu-item-content {
          padding-right: 2rem;
        }
        
        .menu-item-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .menu-item-price {
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 0.5rem;
        }
        
        .menu-item-category {
          display: inline-block;
          background-color: #e0f2fe;
          color: #0284c7;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          margin-bottom: 0.5rem;
        }
        
        .menu-item-desc {
          font-size: 0.875rem;
          color: #6b7280;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .menu-item-actions {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
        }
        
        .menu-delete-button {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s;
        }
        
        .menu-delete-button:hover {
          color: #ef4444;
        }
        
        .no-menu-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        
        .edit-form {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .form-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        
        .required {
          color: #ef4444;
        }
        
        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #1f2937;
        }
        
        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </Layout>
  );
};

export default AdminMenuPage;