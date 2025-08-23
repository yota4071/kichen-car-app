// pages/admin/pr-cards.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import NoticeBanner from '@/components/NoticeBanner';
import { checkIsAdmin } from '@/lib/admin';

// PRカードの型定義
interface PRCard {
  id: string;
  name: string;
  location: string;
  image: string;
  prMessage: string;
  url: string;
  isActive: boolean;
  displayLocation: string[];
  startDate: string;
  endDate: string;
  priority: number;
  createdAt: string;
}

// 表示場所の選択肢
const DISPLAY_LOCATIONS = [
  { value: 'today', label: '今日のキッチンカー' },
  { value: 'main', label: 'メイン' },
  { value: 'categories', label: 'カテゴリー' }
];

const AdminPRCardsPage = () => {
  const [prCards, setPRCards] = useState<PRCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PRCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    image: '',
    prMessage: '',
    url: '',
    isActive: true,
    displayLocation: [] as string[],
    startDate: '',
    endDate: '',
    priority: 1
  });
  const [isImporting, setIsImporting] = useState(false);

  const router = useRouter();

  // 認証状態監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const isUserAdmin = await checkIsAdmin(user);
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // PRカードデータを取得
  useEffect(() => {
    const fetchPRCards = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      try {
        const prCardsRef = collection(db, "pr-cards");
        const querySnapshot = await getDocs(prCardsRef);
        
        const cards: PRCard[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "",
          location: doc.data().location || "",
          image: doc.data().image || "",
          prMessage: doc.data().prMessage || "",
          url: doc.data().url || "",
          isActive: doc.data().isActive ?? true,
          displayLocation: doc.data().displayLocation || [],
          startDate: doc.data().startDate || "",
          endDate: doc.data().endDate || "",
          priority: doc.data().priority || 1,
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
        }));
        
        // クライアントサイドで優先度とcreatedAtでソート
        cards.sort((a, b) => {
          const priorityA = a.priority ?? 999;
          const priorityB = b.priority ?? 999;
          if (priorityA !== priorityB) {
            return priorityA - priorityB; // 優先度昇順（低い値が高優先度）
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(); // 作成日降順
        });
        
        setPRCards(cards);
      } catch (error) {
        console.error("PRカード取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchPRCards();
    }
  }, [isAdmin]);

  // 入力フォーム変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'displayLocation') {
        const locations = formData.displayLocation.includes(value)
          ? formData.displayLocation.filter(loc => loc !== value)
          : [...formData.displayLocation, value];
        setFormData(prev => ({
          ...prev,
          displayLocation: locations
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  // PRカード選択処理
  const handleSelectCard = (card: PRCard) => {
    setSelectedCard(card);
    setFormData({
      name: card.name,
      location: card.location,
      image: card.image,
      prMessage: card.prMessage,
      url: card.url,
      isActive: card.isActive,
      displayLocation: card.displayLocation,
      startDate: card.startDate.split('T')[0],
      endDate: card.endDate.split('T')[0],
      priority: card.priority
    });
    setIsEditing(true);
  };

  // 新規追加モード
  const handleAddNew = () => {
    setSelectedCard(null);
    setFormData({
      name: '',
      location: '',
      image: '',
      prMessage: '',
      url: '',
      isActive: true,
      displayLocation: [],
      startDate: '',
      endDate: '',
      priority: 1
    });
    setIsAdding(true);
    setShowModal(true);
  };

  // キャンセル処理
  const handleCancel = () => {
    setSelectedCard(null);
    setIsEditing(false);
    setIsAdding(false);
    setShowModal(false);
  };

  // 保存処理
  const handleSave = async () => {
    if (!user) return;
    
    try {
      // 入力チェック
      if (!formData.name || !formData.prMessage || !formData.startDate || !formData.endDate) {
        alert("タイトル、PRメッセージ、開始日、終了日は必須項目です。");
        return;
      }

      if (formData.displayLocation.length === 0) {
        alert("表示場所を少なくとも1つ選択してください。");
        return;
      }

      const cardData = {
        name: formData.name,
        location: formData.location,
        image: formData.image,
        prMessage: formData.prMessage,
        url: formData.url,
        isActive: formData.isActive,
        displayLocation: formData.displayLocation,
        startDate: `${formData.startDate}T00:00:00Z`,
        endDate: `${formData.endDate}T23:59:59Z`,
        priority: formData.priority,
        updatedAt: serverTimestamp()
      };

      if (isAdding) {
        // 新規追加
        await addDoc(collection(db, "pr-cards"), {
          ...cardData,
          createdAt: serverTimestamp()
        });
        alert("新しいPRカードを追加しました。");
      } else {
        // 更新
        await updateDoc(doc(db, "pr-cards", selectedCard!.id), cardData);
        alert("PRカードを更新しました。");
      }

      // データを再取得
      const prCardsRef = collection(db, "pr-cards");
      const querySnapshot = await getDocs(prCardsRef);
      
      const cards: PRCard[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "",
        location: doc.data().location || "",
        image: doc.data().image || "",
        prMessage: doc.data().prMessage || "",
        url: doc.data().url || "",
        isActive: doc.data().isActive ?? true,
        displayLocation: doc.data().displayLocation || [],
        startDate: doc.data().startDate || "",
        endDate: doc.data().endDate || "",
        priority: doc.data().priority || 1,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
      }));
      
      // クライアントサイドでソート
      cards.sort((a, b) => {
        const priorityA = a.priority ?? 999;
        const priorityB = b.priority ?? 999;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setPRCards(cards);
      handleCancel();
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // 削除処理
  const handleDelete = async (cardId: string) => {
    if (!confirm("このPRカードを削除してもよろしいですか？")) return;
    
    try {
      // Firestoreから削除
      await deleteDoc(doc(db, "pr-cards", cardId));
      
      // ローカル状態を更新
      setPRCards(prCards.filter(card => card.id !== cardId));
      
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard(null);
        setIsEditing(false);
      }
      
      alert("PRカードが削除されました。");
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // 初期データインポート処理
  const handleImportInitialData = async () => {
    if (!confirm("JSONファイルからPRカードの初期データをインポートしますか？\n既存のデータは削除されます。")) return;
    
    setIsImporting(true);
    try {
      // JSONファイルからデータを取得
      const response = await fetch('/data/pr-cards.json');
      if (!response.ok) {
        throw new Error('JSONファイルの読み込みに失敗しました');
      }
      
      const jsonData = await response.json();
      
      // 既存のPRカードを全て削除
      const existingCardsRef = collection(db, "pr-cards");
      const existingCardsSnapshot = await getDocs(existingCardsRef);
      
      const deletePromises = existingCardsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // 新しいデータを追加
      const addPromises = jsonData.map((card: any) => 
        addDoc(collection(db, "pr-cards"), {
          name: card.name || "",
          location: card.location || "",
          image: card.image || "",
          prMessage: card.prMessage || "",
          url: card.url || "",
          isActive: card.isActive ?? true,
          displayLocation: card.displayLocation || [],
          startDate: card.startDate || "",
          endDate: card.endDate || "",
          priority: card.priority || 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(addPromises);
      
      // データを再取得
      const prCardsRef = collection(db, "pr-cards");
      const querySnapshot = await getDocs(prCardsRef);
      
      const cards: PRCard[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || "",
        location: doc.data().location || "",
        image: doc.data().image || "",
        prMessage: doc.data().prMessage || "",
        url: doc.data().url || "",
        isActive: doc.data().isActive ?? true,
        displayLocation: doc.data().displayLocation || [],
        startDate: doc.data().startDate || "",
        endDate: doc.data().endDate || "",
        priority: doc.data().priority || 1,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
      }));
      
      setPRCards(cards);
      alert(`${jsonData.length}件のPRカードをインポートしました。`);
    } catch (error) {
      console.error("インポートエラー:", error);
      alert("インポート中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading && user) {
    return (
      <Layout title="PRカード管理 | 管理者ページ">
        <div className="container py-8">
          <LoadingIndicator message="PRカード情報を読み込み中..." />
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
    <Layout title="PRカード管理 | 管理者ページ">
      <div className="admin-page-container py-8">
        <div className="admin-header">
          <h1 className="admin-title">PRカード管理</h1>
          <div className="admin-actions">
            <Button href="/admin" variant="secondary" className="mr-2">
              🏠 ダッシュボード
            </Button>
            <Button href="/admin/shops" variant="secondary" className="mr-2">
              店舗管理へ
            </Button>
            <Button href="/admin/calendar" variant="secondary" className="mr-2">
              カレンダー管理へ
            </Button>
            <Button 
              onClick={handleImportInitialData} 
              variant="secondary" 
              className="mr-2"
              disabled={isImporting}
            >
              {isImporting ? "インポート中..." : "初期データをインポート"}
            </Button>
            <Button onClick={handleAddNew} variant="primary">
              新規PRカードを追加
            </Button>
          </div>
        </div>

        <div className="admin-content">
          {/* PRカード一覧 */}
          <div className="cards-list">
            <h2 className="list-title">登録済みPRカード一覧</h2>
            
            {prCards.length === 0 ? (
              <div className="no-cards-message">
                登録されているPRカードがありません。新規追加してください。
              </div>
            ) : (
              <div className="cards-table-container">
                <table className="cards-table">
                  <thead>
                    <tr>
                      <th className="w-1/6">タイトル</th>
                      <th className="w-1/4">PRメッセージ</th>
                      <th className="w-1/6">表示場所</th>
                      <th className="w-1/8">状態</th>
                      <th className="w-1/8">優先度</th>
                      <th className="w-1/8">期間</th>
                      <th className="w-1/6">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prCards.map(card => (
                      <tr key={card.id} className={selectedCard?.id === card.id ? 'selected-row' : ''}>
                        <td>{card.name}</td>
                        <td className="message-cell">{card.prMessage}</td>
                        <td>
                          <div className="location-tags">
                            {card.displayLocation.map(loc => (
                              <span key={loc} className="location-tag">
                                {DISPLAY_LOCATIONS.find(l => l.value === loc)?.label || loc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${card.isActive ? 'active' : 'inactive'}`}>
                            {card.isActive ? 'アクティブ' : '非アクティブ'}
                          </span>
                        </td>
                        <td>{card.priority}</td>
                        <td className="date-cell">
                          <div>{card.startDate.split('T')[0]}</div>
                          <div>{card.endDate.split('T')[0]}</div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleSelectCard(card)} 
                              className="action-button edit-button"
                              title="編集"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(card.id)} 
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

        {/* 編集フォーム */}
        {isEditing && (
          <div className="edit-form-section">
            <div className="edit-form">
              <h2 className="form-title">PRカードを編集</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">タイトル <span className="required">*</span></label>
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
                  <label htmlFor="location">場所</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="image">画像URL</label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">リンクURL</label>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="prMessage">PRメッセージ <span className="required">*</span></label>
                <textarea
                  id="prMessage"
                  name="prMessage"
                  value={formData.prMessage}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">開始日 <span className="required">*</span></label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">終了日 <span className="required">*</span></label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">優先度</label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    max="10"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    アクティブ
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>表示場所 <span className="required">*</span></label>
                <div className="checkbox-group">
                  {DISPLAY_LOCATIONS.map(location => (
                    <label key={location.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        name="displayLocation"
                        value={location.value}
                        checked={formData.displayLocation.includes(location.value)}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      {location.label}
                    </label>
                  ))}
                </div>
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
          </div>
        )}

        {/* モーダル - 新規PRカード追加用 */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">新規PRカードを追加</h2>
                <button className="modal-close" onClick={handleCancel}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-name">タイトル <span className="required">*</span></label>
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
                    <label htmlFor="modal-location">場所</label>
                    <input
                      type="text"
                      id="modal-location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-image">画像URL</label>
                    <input
                      type="text"
                      id="modal-image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-url">リンクURL</label>
                    <input
                      type="text"
                      id="modal-url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-prMessage">PRメッセージ <span className="required">*</span></label>
                  <textarea
                    id="modal-prMessage"
                    name="prMessage"
                    value={formData.prMessage}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-startDate">開始日 <span className="required">*</span></label>
                    <input
                      type="date"
                      id="modal-startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-endDate">終了日 <span className="required">*</span></label>
                    <input
                      type="date"
                      id="modal-endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-priority">優先度</label>
                    <input
                      type="number"
                      id="modal-priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-input"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      アクティブ
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>表示場所 <span className="required">*</span></label>
                  <div className="checkbox-group">
                    {DISPLAY_LOCATIONS.map(location => (
                      <label key={location.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="displayLocation"
                          value={location.value}
                          checked={formData.displayLocation.includes(location.value)}
                          onChange={handleInputChange}
                          className="form-checkbox"
                        />
                        {location.label}
                      </label>
                    ))}
                  </div>
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
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .admin-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
        }
        
        .admin-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
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
        
        .cards-list {
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
        
        .cards-table-container {
          overflow-x: auto;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .cards-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        
        .cards-table th {
          text-align: left;
          font-weight: 600;
          color: #4b5563;
          padding: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .cards-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          vertical-align: top;
        }
        
        .selected-row {
          background-color: #f3f4f6;
        }
        
        .message-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .date-cell {
          font-size: 0.875rem;
          line-height: 1.25;
        }
        
        .location-tags {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .location-tag {
          background-color: #dbeafe;
          color: #1e40af;
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
        }
        
        .status-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
        }
        
        .status-badge.active {
          background-color: #dcfce7;
          color: #16a34a;
        }
        
        .status-badge.inactive {
          background-color: #fee2e2;
          color: #dc2626;
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
        
        .delete-button {
          background-color: #fee2e2;
        }
        
        .delete-button:hover {
          background-color: #fecaca;
        }
        
        .no-cards-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        
        .edit-form-section {
          margin-top: 2rem;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .edit-form {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          border: 1px solid #e5e7eb;
        }
        
        .form-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
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
        
        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .form-checkbox {
          margin: 0;
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
          max-width: 800px;
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
          
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .admin-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AdminPRCardsPage;