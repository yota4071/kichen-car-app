// pages/admin/shops.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  collection, getDocs, doc, getDoc, setDoc, addDoc, 
  deleteDoc, serverTimestamp, updateDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, Shop } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import NoticeBanner from '@/components/NoticeBanner';
import { checkIsAdmin } from '@/lib/admin'; // 追加

// 管理者ユーザーID（実際の環境に合わせて設定）
const ADMIN_USER_IDS = [
  '1',  // ここに実際の管理者ユーザーIDを追加
  '2',
];

// カテゴリーリスト
const DISH_CATEGORIES = [
  "和食", "洋食", "中華", "アジア料理", "スイーツ", "ドリンク", "その他"
];

const AdminShopsPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    image: '',
    type: '',
    dish: '',
    subDish: '',
    description: ''
  });
  
  const router = useRouter();

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal]);

  // 認証状態監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 管理者チェックを新しい関数に置き換え
        const isUserAdmin = await checkIsAdmin(user);
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
    const fetchShops = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      try {
        const shopRef = collection(db, "kitchens");
        const shopSnap = await getDocs(shopRef);
        
        const shopsList = shopSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "",
          location: doc.data().location || "",
          image: doc.data().image || "",
          type: doc.data().type || "",
          dish: doc.data().dish || "",
          subDish: doc.data().subDish || "",
          description: doc.data().description || ""
        }));
        
        setShops(shopsList);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchShops();
    }
  }, [isAdmin]);

  // 入力フォーム変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 店舗選択処理
  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      location: shop.location,
      image: shop.image,
      type: shop.type,
      dish: shop.dish || '',
      subDish: shop.subDish || '',
      description: shop.description || ''
    });
    setIsEditing(true);
    setShowModal(true); // モーダルを表示
  };

  // 新規追加モード
  const handleAddNew = () => {
    setSelectedShop(null);
    setFormData({
      name: '',
      location: '',
      image: '',
      type: '',
      dish: '',
      subDish: '',
      description: ''
    });
    setIsAdding(true);
    setShowModal(true);
  };

  // キャンセル処理
  const handleCancel = () => {
    setSelectedShop(null);
    setIsEditing(false);
    setIsAdding(false);
    setShowModal(false);
  };

  // 保存処理（新規追加 or 更新）
  const handleSave = async () => {
    if (!user) return;
    
    try {
      // 入力チェック
      if (!formData.name || !formData.type) {
        alert("店舗名、料理タイプは必須項目です。");
        return;
      }
      
      if (isAdding) {
        // 新規追加の場合
        await addDoc(collection(db, "kitchens"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        alert("新しい店舗を登録しました。");
      } else if (isEditing && selectedShop) {
        // 更新の場合
        await updateDoc(doc(db, "kitchens", selectedShop.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        
        alert("店舗情報を更新しました。");
      }
      
      // 状態をリセットして再読み込み
      setSelectedShop(null);
      setIsEditing(false);
      setIsAdding(false);
      setShowModal(false);
      
      // 店舗一覧を再取得
      const shopRef = collection(db, "kitchens");
      const shopSnap = await getDocs(shopRef);
      
      const shopsList = shopSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "",
        location: doc.data().location || "",
        image: doc.data().image || "",
        type: doc.data().type || "",
        dish: doc.data().dish || "",
        subDish: doc.data().subDish || "",
        description: doc.data().description || ""
      }));
      
      setShops(shopsList);
    } catch (error) {
      console.error("Error saving shop:", error);
      alert("保存中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // 削除処理
  const handleDelete = async (shopId: string) => {
    if (!confirm("この店舗情報を削除してもよろしいですか？メニューやスケジュールも削除される可能性があります。")) return;
    
    try {
      // Firestoreから削除
      await deleteDoc(doc(db, "kitchens", shopId));
      
      // 表示を更新
      setShops(shops.filter(shop => shop.id !== shopId));
      
      if (selectedShop && selectedShop.id === shopId) {
        setSelectedShop(null);
        setIsEditing(false);
      }
      
      alert("店舗情報が削除されました。");
    } catch (error) {
      console.error("Error deleting shop:", error);
      alert("削除中にエラーが発生しました😭もう一度お試しください。");
    }
  };

  // メニュー管理ページへ移動
  const handleManageMenu = (shopId: string) => {
    router.push(`/admin/menu/${shopId}`);
  };

  if (isLoading && user) {
    return (
      <Layout title="店舗管理 | 管理者ページ">
        <div className="container py-8">
          <LoadingIndicator message="店舗情報を読み込み中..." />
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
    <Layout title="店舗管理 | 管理者ページ">
      <div className="admin-page-container py-8">
        <div className="admin-header">
          <h1 className="admin-title">キッチンカー店舗管理</h1>
          <div className="admin-actions">
            <Button href="/admin" variant="secondary" className="mr-2">
              🏠 ダッシュボード
            </Button>
            <Button href="/admin/reported-reviews" variant="secondary" className="mr-2">
              報告レビュー管理へ
            </Button>
            <Button href="/admin/pr-cards" variant="secondary" className="mr-2">
              PRカード管理へ
            </Button>
            <Button href="/admin/calendar" variant="secondary" className="mr-2">
              カレンダー管理へ
            </Button>
            <Button onClick={handleAddNew} variant="primary">
              新規店舗を追加
            </Button>
          </div>
        </div>

        <div className="admin-content">
          {/* 店舗一覧 */}
          <div className="shops-list">
            <h2 className="list-title">登録済み店舗一覧</h2>
            
            {shops.length === 0 ? (
              <div className="no-shops-message">
                登録されている店舗がありません。新規追加してください。
              </div>
            ) : (
              <div className="shops-table-container">
                <table className="shops-table">
                  <thead>
                    <tr>
                      <th className="w-1/4">店舗名</th>
                      <th className="w-1/4">場所</th>
                      <th className="w-1/6">タイプ</th>
                      <th className="w-1/6">カテゴリ</th>
                      <th className="w-1/6">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map(shop => (
                      <tr key={shop.id} className={selectedShop?.id === shop.id ? 'selected-row' : ''}>
                        <td>{shop.name}</td>
                        <td>{shop.location}</td>
                        <td>{shop.type}</td>
                        <td>{shop.dish || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleSelectShop(shop)} 
                              className="action-button edit-button"
                              title="編集"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleManageMenu(shop.id)} 
                              className="action-button menu-button"
                              title="メニュー管理"
                            >
                              🍔
                            </button>
                            <button 
                              onClick={() => handleDelete(shop.id)} 
                              className="action-button delete-button"
                              title="削除"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>


        {/* モーダル - 店舗追加・編集用 */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">{isEditing ? '店舗情報を編集' : '新規店舗を追加'}</h2>
                <button className="modal-close" onClick={handleCancel}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="modal-name">店舗名 <span className="required">*</span></label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="modal-location">出店場所</label>
                  <input
                    type="text"
                    id="modal-location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="modal-type">料理タイプ <span className="required">*</span></label>
                  <input
                    type="text"
                    id="modal-type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="例: アサイーボウル、ハンバーガー"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="modal-dish">カテゴリー</label>
                  <select
                    id="modal-dish"
                    name="dish"
                    value={formData.dish}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">選択してください</option>
                    {DISH_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="modal-subDish">サブカテゴリー</label>
                  <input
                    type="text"
                    id="modal-subDish"
                    name="subDish"
                    value={formData.subDish}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="例: ラーメン、サンドイッチ"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="modal-image">画像URL</label>
                  <input
                    type="text"
                    id="modal-image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="/images/shop1.jpg"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="modal-description">説明文</label>
                  <textarea
                    id="modal-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={4}
                    placeholder="店舗の説明や特徴を入力してください"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <Button onClick={handleCancel} variant="secondary">
                  キャンセル
                </Button>
                <Button onClick={handleSave} variant="primary">
                  保存する
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .admin-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
        }
        
        .admin-page-container {
          width: 100%;
          max-width: none;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .admin-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        @media (min-width: 1024px) {
          .admin-content {
            grid-template-columns: 1fr;
          }
          
          .admin-page-container {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
        
        @media (min-width: 1280px) {
          .admin-page-container {
            padding-left: 3rem;
            padding-right: 3rem;
          }
        }
        
        .shops-list {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .list-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }
        
        .shops-table-container {
          overflow-x: auto;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .shops-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        
        .shops-table th {
          text-align: left;
          font-weight: 600;
          color: #4b5563;
          padding: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .shops-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }
        
        .selected-row {
          background-color: #f3f4f6;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-button {
          width: 28px;
          height: 28px;
          border-radius: 0.25rem;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .edit-button {
          background-color: #dbeafe;
        }
        
        .edit-button:hover {
          background-color: #bfdbfe;
        }
        
        .menu-button {
          background-color: #fef3c7;
        }
        
        .menu-button:hover {
          background-color: #fde68a;
        }
        
        .delete-button {
          background-color: #fee2e2;
        }
        
        .delete-button:hover {
          background-color: #fecaca;
        }
        
        .no-shops-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0.5rem;
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
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #1f2937;
        }
        
        .form-input:focus,
        .form-select:focus,
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

        /* モーダルスタイル */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background-color: #f3f4f6;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.5rem;
          line-height: 1;
        }

        .modal-close:hover {
          background-color: #e5e7eb;
          color: #374151;
          transform: scale(1.05);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 2rem 1.5rem 2rem;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-content {
            max-width: 100%;
            max-height: 95vh;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AdminShopsPage;