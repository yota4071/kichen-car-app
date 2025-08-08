// pages/admin/notices.tsx
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

// Noticeの型定義
interface Notice {
  id: string;
  title: string;
  link?: string;
  isExternal: boolean;
  color: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  priority: number;
  createdAt: string;
}

// カラーの選択肢
const COLOR_OPTIONS = [
  { value: 'blue', label: '青' },
  { value: 'green', label: '緑' },
  { value: 'orange', label: 'オレンジ' },
  { value: 'red', label: '赤' },
  { value: 'purple', label: '紫' }
];

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    isExternal: false,
    color: 'blue',
    isActive: true,
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

  // Noticeデータを取得
  useEffect(() => {
    const fetchNotices = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      try {
        const noticesRef = collection(db, "notices");
        const querySnapshot = await getDocs(noticesRef);
        
        const noticesList: Notice[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || "",
          link: doc.data().link || "",
          isExternal: doc.data().isExternal ?? false,
          color: doc.data().color || "blue",
          isActive: doc.data().isActive ?? true,
          startDate: doc.data().startDate || "",
          endDate: doc.data().endDate || "",
          priority: doc.data().priority || 1,
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
        }));
        
        // クライアントサイドで優先度とcreatedAtでソート
        noticesList.sort((a, b) => {
          const priorityA = a.priority ?? 999;
          const priorityB = b.priority ?? 999;
          if (priorityA !== priorityB) {
            return priorityA - priorityB; // 優先度昇順（低い値が高優先度）
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(); // 作成日降順
        });
        
        setNotices(noticesList);
      } catch (error) {
        console.error("お知らせ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchNotices();
    }
  }, [isAdmin]);

  // 入力フォーム変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  // Notice選択処理
  const handleSelectNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      link: notice.link || '',
      isExternal: notice.isExternal,
      color: notice.color,
      isActive: notice.isActive,
      startDate: notice.startDate.split('T')[0],
      endDate: notice.endDate.split('T')[0],
      priority: notice.priority
    });
    setIsEditing(true);
  };

  // 新規追加モード
  const handleAddNew = () => {
    setSelectedNotice(null);
    setFormData({
      title: '',
      link: '',
      isExternal: false,
      color: 'blue',
      isActive: true,
      startDate: '',
      endDate: '',
      priority: 1
    });
    setIsAdding(true);
    setShowModal(true);
  };

  // キャンセル処理
  const handleCancel = () => {
    setSelectedNotice(null);
    setIsEditing(false);
    setIsAdding(false);
    setShowModal(false);
  };

  // 保存処理
  const handleSave = async () => {
    if (!user) return;
    
    try {
      // 入力チェック
      if (!formData.title || !formData.startDate || !formData.endDate) {
        alert("タイトル、開始日、終了日は必須項目です。");
        return;
      }

      const noticeData = {
        title: formData.title,
        link: formData.link || null,
        isExternal: formData.isExternal,
        color: formData.color,
        isActive: formData.isActive,
        startDate: `${formData.startDate}T00:00:00Z`,
        endDate: `${formData.endDate}T23:59:59Z`,
        priority: formData.priority,
        updatedAt: serverTimestamp()
      };

      if (isAdding) {
        // 新規追加
        await addDoc(collection(db, "notices"), {
          ...noticeData,
          createdAt: serverTimestamp()
        });
        alert("新しいお知らせを追加しました。");
      } else {
        // 更新
        await updateDoc(doc(db, "notices", selectedNotice!.id), noticeData);
        alert("お知らせを更新しました。");
      }

      // データを再取得
      const noticesRef = collection(db, "notices");
      const querySnapshot = await getDocs(noticesRef);
      
      const noticesList: Notice[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || "",
        link: doc.data().link || "",
        isExternal: doc.data().isExternal ?? false,
        color: doc.data().color || "blue",
        isActive: doc.data().isActive ?? true,
        startDate: doc.data().startDate || "",
        endDate: doc.data().endDate || "",
        priority: doc.data().priority || 1,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
      }));
      
      // クライアントサイドでソート
      noticesList.sort((a, b) => {
        const priorityA = a.priority ?? 999;
        const priorityB = b.priority ?? 999;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      setNotices(noticesList);
      handleCancel();
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // 削除処理
  const handleDelete = async (noticeId: string) => {
    if (!confirm("このお知らせを削除してもよろしいですか？")) return;
    
    try {
      // Firestoreから削除
      await deleteDoc(doc(db, "notices", noticeId));
      
      // ローカル状態を更新
      setNotices(notices.filter(notice => notice.id !== noticeId));
      
      if (selectedNotice && selectedNotice.id === noticeId) {
        setSelectedNotice(null);
        setIsEditing(false);
      }
      
      alert("お知らせが削除されました。");
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除中にエラーが発生しました。もう一度お試しください。");
    }
  };

  // 初期データインポート処理
  const handleImportInitialData = async () => {
    if (!confirm("JSONファイルからお知らせの初期データをインポートしますか？\n既存のデータは削除されます。")) return;
    
    setIsImporting(true);
    try {
      // JSONファイルからデータを取得
      const response = await fetch('/data/Notice.json');
      if (!response.ok) {
        throw new Error('JSONファイルの読み込みに失敗しました');
      }
      
      const jsonData = await response.json();
      
      // 既存のお知らせを全て削除
      const existingNoticesRef = collection(db, "notices");
      const existingNoticesSnapshot = await getDocs(existingNoticesRef);
      
      const deletePromises = existingNoticesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // 新しいデータを追加
      const addPromises = jsonData.notices.map((notice: any) => 
        addDoc(collection(db, "notices"), {
          title: notice.title || "",
          link: notice.link || null,
          isExternal: notice.isExternal ?? false,
          color: notice.color || "blue",
          isActive: notice.isActive ?? true,
          startDate: notice.startDate || "",
          endDate: notice.endDate || "",
          priority: notice.priority || 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(addPromises);
      
      // データを再取得
      const noticesRef = collection(db, "notices");
      const querySnapshot = await getDocs(noticesRef);
      
      const noticesList: Notice[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || "",
        link: doc.data().link || "",
        isExternal: doc.data().isExternal ?? false,
        color: doc.data().color || "blue",
        isActive: doc.data().isActive ?? true,
        startDate: doc.data().startDate || "",
        endDate: doc.data().endDate || "",
        priority: doc.data().priority || 1,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString()
      }));
      
      setNotices(noticesList);
      alert(`${jsonData.notices.length}件のお知らせをインポートしました。`);
    } catch (error) {
      console.error("インポートエラー:", error);
      alert("インポート中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading && user) {
    return (
      <Layout title="お知らせ管理 | 管理者ページ">
        <div className="container py-8">
          <LoadingIndicator message="お知らせ情報を読み込み中..." />
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
    <Layout title="お知らせ管理 | 管理者ページ">
      <div className="admin-page-container py-8">
        <div className="admin-header">
          <h1 className="admin-title">お知らせ管理</h1>
          <div className="admin-actions">
            <Button href="/admin/shops" variant="secondary" className="mr-2">
              店舗管理へ
            </Button>
            <Button href="/admin/calendar" variant="secondary" className="mr-2">
              カレンダー管理へ
            </Button>
            <Button href="/admin/pr-cards" variant="secondary" className="mr-2">
              PRカード管理へ
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
              新規お知らせを追加
            </Button>
          </div>
        </div>

        <div className="admin-content">
          {/* お知らせ一覧 */}
          <div className="notices-list">
            <h2 className="list-title">登録済みお知らせ一覧</h2>
            
            {notices.length === 0 ? (
              <div className="no-notices-message">
                登録されているお知らせがありません。新規追加してください。
              </div>
            ) : (
              <div className="notices-table-container">
                <table className="notices-table">
                  <thead>
                    <tr>
                      <th className="w-1/4">タイトル</th>
                      <th className="w-1/6">リンク</th>
                      <th className="w-1/8">カラー</th>
                      <th className="w-1/8">状態</th>
                      <th className="w-1/8">優先度</th>
                      <th className="w-1/8">期間</th>
                      <th className="w-1/6">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map(notice => (
                      <tr key={notice.id} className={selectedNotice?.id === notice.id ? 'selected-row' : ''}>
                        <td>{notice.title}</td>
                        <td className="link-cell">
                          {notice.link ? (
                            <span className={`link-badge ${notice.isExternal ? 'external' : 'internal'}`}>
                              {notice.isExternal ? '外部' : '内部'}
                            </span>
                          ) : (
                            <span className="link-badge none">なし</span>
                          )}
                        </td>
                        <td>
                          <div className={`color-indicator color-${notice.color}`}>
                            {COLOR_OPTIONS.find(c => c.value === notice.color)?.label || notice.color}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${notice.isActive ? 'active' : 'inactive'}`}>
                            {notice.isActive ? 'アクティブ' : '非アクティブ'}
                          </span>
                        </td>
                        <td>{notice.priority}</td>
                        <td className="date-cell">
                          <div>{notice.startDate.split('T')[0]}</div>
                          <div>{notice.endDate.split('T')[0]}</div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleSelectNotice(notice)} 
                              className="action-button edit-button"
                              title="編集"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(notice.id)} 
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
              <h2 className="form-title">お知らせを編集</h2>
              
              <div className="form-group">
                <label htmlFor="title">タイトル <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="link">リンクURL</label>
                  <input
                    type="text"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com または /page-path"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color">カラー</label>
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {COLOR_OPTIONS.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    min="0"
                    max="10"
                  />
                </div>

                <div className="form-group checkbox-group-container">
                  <label>
                    <input
                      type="checkbox"
                      name="isExternal"
                      checked={formData.isExternal}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    外部リンク
                  </label>
                  
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

        {/* モーダル - 新規お知らせ追加用 */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">新規お知らせを追加</h2>
                <button className="modal-close" onClick={handleCancel}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="modal-title">タイトル <span className="required">*</span></label>
                  <input
                    type="text"
                    id="modal-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-link">リンクURL</label>
                    <input
                      type="text"
                      id="modal-link"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com または /page-path"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-color">カラー</label>
                    <select
                      id="modal-color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {COLOR_OPTIONS.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      min="0"
                      max="10"
                    />
                  </div>

                  <div className="form-group checkbox-group-container">
                    <label>
                      <input
                        type="checkbox"
                        name="isExternal"
                        checked={formData.isExternal}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      外部リンク
                    </label>
                    
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
        
        .notices-list {
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
        
        .notices-table-container {
          overflow-x: auto;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .notices-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        
        .notices-table th {
          text-align: left;
          font-weight: 600;
          color: #4b5563;
          padding: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .notices-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
          vertical-align: top;
        }
        
        .selected-row {
          background-color: #f3f4f6;
        }
        
        .link-cell {
          text-align: center;
        }
        
        .link-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
        }
        
        .link-badge.external {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .link-badge.internal {
          background-color: #dcfce7;
          color: #16a34a;
        }
        
        .link-badge.none {
          background-color: #f3f4f6;
          color: #6b7280;
        }
        
        .color-indicator {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
          text-align: center;
          min-width: 40px;
        }
        
        .color-indicator.color-blue {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .color-indicator.color-green {
          background-color: #dcfce7;
          color: #16a34a;
        }
        
        .color-indicator.color-orange {
          background-color: #fed7aa;
          color: #ea580c;
        }
        
        .color-indicator.color-red {
          background-color: #fee2e2;
          color: #dc2626;
        }
        
        .color-indicator.color-purple {
          background-color: #e9d5ff;
          color: #7c3aed;
        }
        
        .date-cell {
          font-size: 0.875rem;
          line-height: 1.25;
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
        
        .no-notices-message {
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
        
        .checkbox-group-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .checkbox-group-container label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: normal;
          margin-bottom: 0;
        }
        
        .required {
          color: #ef4444;
        }
        
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #1f2937;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
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

export default AdminNoticesPage;