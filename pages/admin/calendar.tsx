// pages/admin/calendar.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    Timestamp,
    serverTimestamp,
    DocumentReference,
    DocumentData,
    QueryDocumentSnapshot
  } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import NoticeBanner from '@/components/NoticeBanner';
import { checkIsAdmin } from '@/lib/admin'; // 追加



// 型定義
type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
};

type CampusSpot = {
  id: string;
  campusId: string;
  name: string;
};

type CalendarEvent = {
  id: string;
  date: Date;
  kitchenId: string;
  kitchenName: string;
  spotId: string;
  spotName: string;
};

type CalendarDay = {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

// JSONインポート関連の型
type ImportStatus = 'new' | 'duplicate_skip' | 'duplicate_overwrite' | 'error_shop' | 'error_spot' | 'error_date';

type ImportPreviewRow = {
  rawDate: string;
  rawKitchenName: string;
  rawSpotName: string;
  resolvedKitchenId: string | null;
  resolvedSpotId: string | null;
  resolvedDate: Date | null;
  existingScheduleId: string | null;
  status: ImportStatus;
  errorMessage?: string;
};

// 管理者ユーザーID
const ADMIN_USER_IDS = [
  '1',  // ここに実際の管理者ユーザーIDを追加
  'ad2',
  // 他の管理者IDも追加可能
];

const AdminCalendarPage = () => {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [spots, setSpots] = useState<CampusSpot[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [selectedSpot, setSelectedSpot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [shopSearchTerm, setShopSearchTerm] = useState<string>('');
  const [spotSearchTerm, setSpotSearchTerm] = useState<string>('');
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showSpotDropdown, setShowSpotDropdown] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // JSONインポート関連のstate
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonParseError, setJsonParseError] = useState('');
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'overwrite'>('skip');

  const router = useRouter();
  
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const weekDayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // フィルタリング用の関数
  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
    shop.type.toLowerCase().includes(shopSearchTerm.toLowerCase())
  );

  const filteredSpots = spots.filter(spot => 
    spot.name.toLowerCase().includes(spotSearchTerm.toLowerCase()) ||
    spot.campusId.toLowerCase().includes(spotSearchTerm.toLowerCase())
  );

  // 選択されたアイテムの名前を取得
  const selectedShopName = shops.find(shop => shop.id === selectedShop)?.name || '';
  const selectedSpotName = spots.find(spot => spot.id === selectedSpot)?.name || '';

  // 外部クリック検知でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.searchable-select')) {
        setShowShopDropdown(false);
        setShowSpotDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 前の月へ
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // 次の月へ
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // 今月へ
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // 店舗データを取得
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopRef = collection(db, "kitchens");
        const shopSnap = await getDocs(shopRef);
        
        const shopsList = shopSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || "名称不明",
          location: doc.data().location || "",
          image: doc.data().image || "",
          type: doc.data().type || ""
        }));
        
        setShops(shopsList);
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };
    
    fetchShops();
  }, []);

  // スポットデータを作成（実際はFirestoreから取得するべき）
  useEffect(() => {
    // 仮のスポットデータ
    const spotsList: CampusSpot[] = [
      { id: 'plaza', campusId: 'oic', name: '空のプラザ' },
      { id: 'terrace', campusId: 'oic', name: 'TERRACE GATE前' },
      { id: 'central-square', campusId: 'bkc', name: 'セントラルアーク' },
      { id: 'west-wing', campusId: 'bkc', name: 'ウェストウィング' },
      { id: 'promenade', campusId: 'bkc', name: 'プロムナード' },
      { id: 'front-gate', campusId: 'kinugasa', name: '正門前' },
      { id: 'cafeteria', campusId: 'kinugasa', name: '食堂裏' },
      { id: 'garden', campusId: 'kinugasa', name: '中庭' },
    ];
    
    setSpots(spotsList);
  }, []);

  // カレンダーデータを生成
  useEffect(() => {
    // fetchCalendarDataの実装
const fetchCalendarData = async () => {
    if (!user || !isAdmin) return;
    
    setIsLoading(true);
    try {
      // 月の初日と最終日を取得
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // カレンダー表示用の日付範囲を計算
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      const endDate = new Date(lastDayOfMonth);
      const daysToAdd = 6 - endDate.getDay();
      endDate.setDate(endDate.getDate() + daysToAdd);
      
      // Firestoreからスケジュールデータを取得
      const schedulesRef = collection(db, "schedules");
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const q = query(
        schedulesRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp),
        orderBy("date", "asc")
      );
      
      const schedulesSnapshot = await getDocs(q);
      
      // スケジュールデータをCalendarEventに変換
      const events: CalendarEvent[] = [];
      
      for (const docSnapshot of schedulesSnapshot.docs) {
        // ここで明示的に型を指定
        const data = docSnapshot.data() as DocumentData;
        
        // 店舗情報を取得
        const kitchenRef = doc(db, "kitchens", data.kitchenId as string);
        const kitchenDoc = await getDoc(kitchenRef);
        let kitchenName = "名称不明";
        if (kitchenDoc.exists()) {
          kitchenName = kitchenDoc.data().name || "名称不明";
        }
        
        // スポット情報を取得
        let spotName = "不明";
        const matchingSpot = spots.find(spot => spot.id === data.spotId);
        if (matchingSpot) {
          spotName = matchingSpot.name;
        }
        
        events.push({
          id: docSnapshot.id,
          date: data.date.toDate(),
          kitchenId: data.kitchenId,
          kitchenName: kitchenName,
          spotId: data.spotId,
          spotName: spotName
        });
      }
      
      // カレンダー日付配列を生成
      const days: CalendarDay[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === currentDate.getDate() &&
                 eventDate.getMonth() === currentDate.getMonth() &&
                 eventDate.getFullYear() === currentDate.getFullYear();
        });
        
        days.push({
          date: new Date(currentDate),
          events: dayEvents,
          isCurrentMonth: currentDate.getMonth() === currentMonth.getMonth(),
          isToday: currentDate.getTime() === today.getTime()
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setCalendarDays(days);
      setActiveMonth(`${currentMonth.getFullYear()}年${monthNames[currentMonth.getMonth()]}`);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };
    
    if (user && isAdmin) {
      fetchCalendarData();
    }
  }, [currentMonth, user, isAdmin, spots]);

  // 日付クリック処理
  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  // イベント追加処理
  const handleAddEvent = async () => {
    if (!selectedDate || !selectedShop || !selectedSpot || !user) return;
    
    setIsAdding(true);
    try {
      // 日付をTimeStampに変換
      const eventDate = new Date(selectedDate);
      eventDate.setHours(0, 0, 0, 0);
      const dateTimestamp = Timestamp.fromDate(eventDate);
      
      // すでに同じ日に同じ店舗が登録されていないかチェック
      const schedulesRef = collection(db, "schedules");
      const q = query(
        schedulesRef,
        where("date", "==", dateTimestamp),
        where("kitchenId", "==", selectedShop)
      );
      const existingSchedules = await getDocs(q);
      
      if (!existingSchedules.empty) {
        alert("選択した日付に同じ店舗がすでに登録されています。");
        setIsAdding(false);
        return;
      }
      
      // スケジュールをFirestoreに追加
      await addDoc(collection(db, "schedules"), {
        date: dateTimestamp,
        kitchenId: selectedShop,
        spotId: selectedSpot,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      // 表示を更新
      const newCalendarDays = [...calendarDays];
      const selectedShopData = shops.find(shop => shop.id === selectedShop);
      const selectedSpotData = spots.find(spot => spot.id === selectedSpot);
      
      for (const day of newCalendarDays) {
        if (day.date.getTime() === selectedDate.getTime()) {
          day.events.push({
            id: 'temp-id', // 一時的なID
            date: selectedDate,
            kitchenId: selectedShop,
            kitchenName: selectedShopData?.name || "名称不明",
            spotId: selectedSpot,
            spotName: selectedSpotData?.name || "不明"
          });
          break;
        }
      }
      
      setCalendarDays(newCalendarDays);
      
      // 選択をリセット
      setSelectedDate(null);
      setSelectedShop('');
      setSelectedSpot('');
      setShopSearchTerm('');
      setSpotSearchTerm('');
      setShowShopDropdown(false);
      setShowSpotDropdown(false);
      
      alert("出店情報が正常に登録されました。");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("出店情報の登録に失敗しました。もう一度お試しください。");
    } finally {
      setIsAdding(false);
    }
  };

  // イベント削除処理
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("この出店予定を削除してもよろしいですか？")) return;
    
    try {
      // Firestoreから削除
      await deleteDoc(doc(db, "schedules", eventId));
      
      // 表示を更新
      const newCalendarDays = calendarDays.map(day => {
        return {
          ...day,
          events: day.events.filter(event => event.id !== eventId)
        };
      });
      
      setCalendarDays(newCalendarDays);
      
      alert("出店予定が削除されました。");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("出店予定の削除に失敗しました。もう一度お試しください。");
    }
  };

  // ---- JSONインポート関連の関数 ----

  const handleCloseJsonModal = () => {
    setShowJsonModal(false);
    setJsonInput('');
    setJsonParseError('');
    setImportPreview([]);
    setDuplicateMode('skip');
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonInput(ev.target?.result as string);
      setImportPreview([]);
      setJsonParseError('');
    };
    reader.readAsText(file, 'utf-8');
    // ファイル選択をリセット（同じファイルの再選択を可能にする）
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const template = [
      { date: '2026-06-01', kitchenName: 'キッチンカー名（例：タコス太郎）', spotName: '空のプラザ' },
      { date: '2026-06-02', kitchenName: 'キッチンカー名2', spotName: 'TERRACE GATE前' },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar-import-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSONを解析してプレビューを生成（重複チェック含む）
  const handleJsonParse = async () => {
    setJsonParseError('');
    setImportPreview([]);
    setIsParsing(true);

    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonInput);
      } catch {
        throw new Error('JSONの形式が正しくありません。文法エラーを確認してください。');
      }

      const items: Record<string, string>[] = Array.isArray(parsed) ? parsed : [parsed as Record<string, string>];
      if (items.length === 0) throw new Error('JSONに1件以上のデータが必要です。');

      // Firestoreから全スケジュールを取得（重複チェック用）
      const allSchedulesSnap = await getDocs(collection(db, 'schedules'));
      const allSchedules = allSchedulesSnap.docs.map(d => ({
        id: d.id,
        kitchenId: d.data().kitchenId as string,
        date: (d.data().date as Timestamp).toDate(),
      }));

      const rows: ImportPreviewRow[] = await Promise.all(items.map(async (item, i) => {
        const rawDate = String(item.date || '');
        const rawKitchenName = String(item.kitchenName || item.kitchenId || '');
        const rawSpotName = String(item.spotName || item.spotId || '');

        // 日付のパース
        let resolvedDate: Date | null = null;
        if (!rawDate) {
          return { rawDate, rawKitchenName, rawSpotName, resolvedKitchenId: null, resolvedSpotId: null, resolvedDate: null, existingScheduleId: null, status: 'error_date' as ImportStatus, errorMessage: '"date" が未入力です' };
        }
        const parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime())) {
          return { rawDate, rawKitchenName, rawSpotName, resolvedKitchenId: null, resolvedSpotId: null, resolvedDate: null, existingScheduleId: null, status: 'error_date' as ImportStatus, errorMessage: `日付の形式が不正です（例: 2026-06-01）` };
        }
        parsedDate.setHours(0, 0, 0, 0);
        resolvedDate = parsedDate;

        // キッチンカーのID解決（名前 or ID）
        let resolvedKitchenId: string | null = null;
        if (item.kitchenId) {
          // IDで直接指定されている場合
          const match = shops.find(s => s.id === item.kitchenId);
          if (match) resolvedKitchenId = match.id;
        }
        if (!resolvedKitchenId && item.kitchenName) {
          // 名前で検索（完全一致 → 部分一致の順）
          const exact = shops.find(s => s.name === item.kitchenName);
          if (exact) {
            resolvedKitchenId = exact.id;
          } else {
            const partial = shops.find(s => s.name.includes(String(item.kitchenName)) || String(item.kitchenName).includes(s.name));
            if (partial) resolvedKitchenId = partial.id;
          }
        }
        if (!resolvedKitchenId) {
          return { rawDate, rawKitchenName, rawSpotName, resolvedKitchenId: null, resolvedSpotId: null, resolvedDate, existingScheduleId: null, status: 'error_shop' as ImportStatus, errorMessage: `"${rawKitchenName}" が店舗一覧に見つかりません` };
        }

        // スポットのID解決（名前 or ID）
        let resolvedSpotId: string | null = null;
        if (item.spotId) {
          const match = spots.find(s => s.id === item.spotId);
          if (match) resolvedSpotId = match.id;
        }
        if (!resolvedSpotId && item.spotName) {
          const exact = spots.find(s => s.name === item.spotName);
          if (exact) {
            resolvedSpotId = exact.id;
          } else {
            const partial = spots.find(s => s.name.includes(String(item.spotName)) || String(item.spotName).includes(s.name));
            if (partial) resolvedSpotId = partial.id;
          }
        }
        if (!resolvedSpotId) {
          return { rawDate, rawKitchenName, rawSpotName, resolvedKitchenId, resolvedSpotId: null, resolvedDate, existingScheduleId: null, status: 'error_spot' as ImportStatus, errorMessage: `"${rawSpotName}" が場所一覧に見つかりません` };
        }

        // 重複チェック（同日 × 同店舗）
        const existing = allSchedules.find(s =>
          s.kitchenId === resolvedKitchenId &&
          s.date.getFullYear() === resolvedDate!.getFullYear() &&
          s.date.getMonth() === resolvedDate!.getMonth() &&
          s.date.getDate() === resolvedDate!.getDate()
        );

        return {
          rawDate,
          rawKitchenName,
          rawSpotName,
          resolvedKitchenId,
          resolvedSpotId,
          resolvedDate,
          existingScheduleId: existing ? existing.id : null,
          status: existing ? 'duplicate_skip' as ImportStatus : 'new' as ImportStatus,
        };
      }));

      setImportPreview(rows);
    } catch (e: unknown) {
      setJsonParseError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsParsing(false);
    }
  };

  // 重複モード変更時にプレビューのステータスを更新
  const handleDuplicateModeChange = (mode: 'skip' | 'overwrite') => {
    setDuplicateMode(mode);
    setImportPreview(prev => prev.map(row => {
      if (row.existingScheduleId !== null) {
        return { ...row, status: mode === 'overwrite' ? 'duplicate_overwrite' : 'duplicate_skip' };
      }
      return row;
    }));
  };

  // 一括インポート実行
  const handleJsonImport = async () => {
    if (!user || importPreview.length === 0) return;

    const actionableRows = importPreview.filter(row =>
      row.status === 'new' || row.status === 'duplicate_overwrite'
    );

    if (actionableRows.length === 0) {
      alert('登録対象のデータがありません。');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let overwriteCount = 0;
    const errors: string[] = [];

    try {
      for (const row of actionableRows) {
        try {
          if (row.status === 'duplicate_overwrite' && row.existingScheduleId) {
            // 既存を削除してから新規追加
            await deleteDoc(doc(db, 'schedules', row.existingScheduleId));
            overwriteCount++;
          }
          await addDoc(collection(db, 'schedules'), {
            date: Timestamp.fromDate(row.resolvedDate!),
            kitchenId: row.resolvedKitchenId,
            spotId: row.resolvedSpotId,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
          });
          successCount++;
        } catch (e) {
          errors.push(`${row.rawDate} / ${row.rawKitchenName}: 登録失敗`);
        }
      }

      let message = `${successCount}件を登録しました。`;
      if (overwriteCount > 0) message += `（${overwriteCount}件は上書き）`;
      if (errors.length > 0) message += `\n失敗: ${errors.join(', ')}`;
      alert(message);
      handleCloseJsonModal();

      // カレンダーを再読み込み（currentMonthを再トリガー）
      setCurrentMonth(prev => new Date(prev));
    } catch (e) {
      console.error('Import error:', e);
      alert('インポート中にエラーが発生しました。');
    } finally {
      setIsImporting(false);
    }
  };

  // ---- JSONインポート関連の関数 ここまで ----

  if (isLoading && user) {
    return (
      <Layout title="管理者用カレンダー | キッチンカー管理">
        <div className="container py-8">
          <LoadingIndicator message="カレンダー情報を読み込み中..." />
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
    <Layout title="管理者用カレンダー | キッチンカー管理">
      <div className="container-fluid py-8">
        <div className="admin-header">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-title">キッチンカー管理カレンダー</h1>
              <p className="admin-subtitle">出店予定を登録・管理できます</p>
            </div>
            <div className="admin-actions">
              <Button href="/admin" variant="secondary" className="mr-2">
                🏠 ダッシュボード
              </Button>
              <Button href="/admin/pr-cards" variant="secondary" className="mr-2">
                PRカード管理へ
              </Button>
              <Button href="/admin/shops" variant="secondary" className="mr-2">
                店舗管理へ
              </Button>
              <Button onClick={() => setShowJsonModal(true)} variant="primary">
                JSONで一括登録
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="calendar-navigation">
            <Button onClick={goToPreviousMonth} variant="secondary" className="nav-button">
              前月
            </Button>
            <h2 className="current-month">{activeMonth}</h2>
            <div className="nav-buttons">
              <Button onClick={goToCurrentMonth} variant="secondary" className="today-button">
                今月
              </Button>
              <Button onClick={goToNextMonth} variant="secondary" className="nav-button">
                翌月
              </Button>
            </div>
          </div>
          
          <div className="admin-content">
            <div className="calendar-section">
              <div className="calendar-grid">
                {/* 曜日のヘッダー */}
                {weekDayNames.map((day, index) => (
                  <div key={`header-${index}`} className="calendar-header-cell">
                    {day}
                  </div>
                ))}
                
                {/* カレンダー日付 */}
                {calendarDays.map((day, index) => {
                  const eventCount = day.events.length;
                  const dynamicHeight = eventCount > 0 ? 
                    `clamp(${100 + eventCount * 25}px, ${15 + eventCount * 3}vh, ${180 + eventCount * 20}px)` : 
                    'clamp(100px, 15vh, 180px)';
                  
                  return (
                    <div 
                      key={`day-${index}`} 
                      className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${selectedDate && selectedDate.getTime() === day.date.getTime() ? 'selected' : ''}`}
                      onClick={() => handleDateClick(day)}
                      style={{ minHeight: dynamicHeight }}
                    >
                      <div className="day-number">{day.date.getDate()}</div>
                      
                      {day.events.length > 0 && (
                        <div className="day-events">
                          {day.events.map((event, eventIndex) => (
                            <div 
                              key={`event-${eventIndex}`} 
                              className="event-item"
                              onMouseEnter={() => setHoveredEvent(event.id)}
                              onMouseLeave={() => setHoveredEvent(null)}
                            >
                              <div className="event-dot" style={{ backgroundColor: getEventColor(eventIndex) }}></div>
                              <div className="event-content">
                                <div className="event-name">{event.kitchenName}</div>
                                <div className="event-location">{event.spotName}</div>
                              </div>
                              <button 
                                className="event-delete" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                title="この出店予定を削除"
                              >
                                ×
                              </button>
                              
                              {hoveredEvent === event.id && (
                                <div className="event-tooltip">
                                  <div className="tooltip-content">
                                    <div className="tooltip-title">{event.kitchenName}</div>
                                    <div className="tooltip-location">📍 {event.spotName}</div>
                                    <div className="tooltip-time">⏰ 10:30 - 15:30</div>
                                    <div className="tooltip-date">
                                      📅 {event.date.getFullYear()}年{event.date.getMonth() + 1}月{event.date.getDate()}日
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="control-panel">
              <h3 className="control-title">出店予定を登録</h3>
              
              {selectedDate ? (
                <div className="selected-date">
                  選択日: {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                </div>
              ) : (
                <div className="panel-instruction">
                  カレンダーから日付を選択してください
                </div>
              )}
              
              <div className="control-form">
                <div className="form-group">
                  <label htmlFor="shop-select">キッチンカー</label>
                  <div className="searchable-select">
                    <input
                      type="text"
                      placeholder="キッチンカーを検索..."
                      value={selectedShop ? selectedShopName : shopSearchTerm}
                      onChange={(e) => {
                        setShopSearchTerm(e.target.value);
                        setSelectedShop('');
                        setShowShopDropdown(true);
                      }}
                      onFocus={() => setShowShopDropdown(true)}
                      disabled={!selectedDate}
                    />
                    {showShopDropdown && (
                      <div className="dropdown-list">
                        {filteredShops.length === 0 ? (
                          <div className="dropdown-item no-results">該当する店舗がありません</div>
                        ) : (
                          filteredShops.map(shop => (
                            <div
                              key={shop.id}
                              className="dropdown-item"
                              onClick={() => {
                                setSelectedShop(shop.id);
                                setShopSearchTerm('');
                                setShowShopDropdown(false);
                              }}
                            >
                              <strong>{shop.name}</strong> ({shop.type})
                              {shop.location && <div className="item-location">{shop.location}</div>}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="spot-select">出店場所</label>
                  <div className="searchable-select">
                    <input
                      type="text"
                      placeholder="出店場所を検索..."
                      value={selectedSpot ? selectedSpotName : spotSearchTerm}
                      onChange={(e) => {
                        setSpotSearchTerm(e.target.value);
                        setSelectedSpot('');
                        setShowSpotDropdown(true);
                      }}
                      onFocus={() => setShowSpotDropdown(true)}
                      disabled={!selectedDate}
                    />
                    {showSpotDropdown && (
                      <div className="dropdown-list">
                        {filteredSpots.length === 0 ? (
                          <div className="dropdown-item no-results">該当する場所がありません</div>
                        ) : (
                          filteredSpots.map(spot => (
                            <div
                              key={spot.id}
                              className="dropdown-item"
                              onClick={() => {
                                setSelectedSpot(spot.id);
                                setSpotSearchTerm('');
                                setShowSpotDropdown(false);
                              }}
                            >
                              <strong>{spot.name}</strong>
                              <div className="item-campus">キャンパス: {spot.campusId.toUpperCase()}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-actions">
                  <Button 
                    variant="secondary" 
                    onClick={() => setSelectedDate(null)}
                    disabled={!selectedDate || isAdding}
                  >
                    キャンセル
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleAddEvent}
                    disabled={!selectedDate || !selectedShop || !selectedSpot || isAdding}
                  >
                    {isAdding ? '登録中...' : '登録する'}
                  </Button>
                </div>
              </div>
              
              <div className="panel-note">
                <p>※ 出店時間は10:30-15:30で固定されます</p>
                <p>※ 同じ日に同じ店舗は登録できません</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSONインポートモーダル */}
      {showJsonModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseJsonModal(); }}
        >
          <div style={{
            backgroundColor: 'white', borderRadius: '1rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '100%',
            maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            {/* ヘッダー */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>JSONでカレンダーを一括登録</h2>
              <button onClick={handleCloseJsonModal} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* ボディ */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>

              {/* 使い方 */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#1e40af' }}>
                <strong>JSONフォーマット：</strong>
                <code style={{ display: 'block', marginTop: '0.25rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`[ { "date": "2026-06-01", "kitchenName": "タコス太郎", "spotName": "空のプラザ" } ]`}
                </code>
                <div style={{ marginTop: '0.4rem' }}>キッチンカー名・場所名は登録済みのデータと部分一致でも解決します。</div>
              </div>

              {/* ファイルアップロード */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>JSONファイルをアップロード</label>
                  <button onClick={handleDownloadTemplate} style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    テンプレートをダウンロード
                  </button>
                </div>
                <input type="file" accept=".json,application/json" onChange={handleJsonFileUpload}
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }} />
              </div>

              {/* テキスト入力 */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: '0.4rem' }}>またはJSONを直接貼り付け</label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => { setJsonInput(e.target.value); setImportPreview([]); setJsonParseError(''); }}
                  rows={5}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder={'[\n  { "date": "2026-06-01", "kitchenName": "タコス太郎", "spotName": "空のプラザ" }\n]'}
                />
              </div>

              {/* 重複ハンドリング */}
              <div style={{ marginBottom: '1rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem' }}>同日・同店舗の重複があった場合</div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="radio" name="duplicateMode" value="skip" checked={duplicateMode === 'skip'}
                      onChange={() => handleDuplicateModeChange('skip')} />
                    スキップ（既存データを保持）
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="radio" name="duplicateMode" value="overwrite" checked={duplicateMode === 'overwrite'}
                      onChange={() => handleDuplicateModeChange('overwrite')} />
                    上書き（既存を削除して新規登録）
                  </label>
                </div>
              </div>

              {/* パースボタン */}
              <button
                onClick={handleJsonParse}
                disabled={!jsonInput.trim() || isParsing}
                style={{
                  backgroundColor: '#6366f1', color: 'white', padding: '0.6rem 1.25rem',
                  borderRadius: '0.375rem', border: 'none', cursor: (!jsonInput.trim() || isParsing) ? 'not-allowed' : 'pointer',
                  opacity: (!jsonInput.trim() || isParsing) ? 0.5 : 1, fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem'
                }}
              >
                {isParsing ? '解析中...' : 'プレビューを確認'}
              </button>

              {/* エラー表示 */}
              {jsonParseError && (
                <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {jsonParseError}
                </div>
              )}

              {/* プレビューテーブル */}
              {importPreview.length > 0 && (() => {
                const newCount = importPreview.filter(r => r.status === 'new').length;
                const skipCount = importPreview.filter(r => r.status === 'duplicate_skip').length;
                const overwriteCount = importPreview.filter(r => r.status === 'duplicate_overwrite').length;
                const errorCount = importPreview.filter(r => r.status.startsWith('error')).length;

                return (
                  <div>
                    {/* サマリー */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>新規 {newCount}件</span>
                      {skipCount > 0 && <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>スキップ {skipCount}件</span>}
                      {overwriteCount > 0 && <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>上書き {overwriteCount}件</span>}
                      {errorCount > 0 && <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>エラー {errorCount}件</span>}
                    </div>

                    {/* テーブル */}
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'auto', maxHeight: '220px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '550px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0 }}>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: '#374151' }}>日付</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: '#374151' }}>キッチンカー</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: '#374151' }}>場所</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: '#374151' }}>ステータス</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, i) => {
                            const statusConfig: Record<ImportStatus, { label: string; bg: string; color: string }> = {
                              new: { label: '新規登録', bg: '#dcfce7', color: '#166534' },
                              duplicate_skip: { label: '重複・スキップ', bg: '#fef9c3', color: '#854d0e' },
                              duplicate_overwrite: { label: '重複・上書き', bg: '#fed7aa', color: '#9a3412' },
                              error_shop: { label: '店舗不明', bg: '#fee2e2', color: '#991b1b' },
                              error_spot: { label: '場所不明', bg: '#fee2e2', color: '#991b1b' },
                              error_date: { label: '日付エラー', bg: '#fee2e2', color: '#991b1b' },
                            };
                            const cfg = statusConfig[row.status];
                            const resolvedShopName = shops.find(s => s.id === row.resolvedKitchenId)?.name || row.rawKitchenName;
                            const resolvedSpotName = spots.find(s => s.id === row.resolvedSpotId)?.name || row.rawSpotName;

                            return (
                              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '0.5rem 0.75rem' }}>{row.rawDate}</td>
                                <td style={{ padding: '0.5rem 0.75rem' }} title={row.errorMessage}>
                                  {resolvedShopName}
                                  {row.status === 'error_shop' && <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>{row.errorMessage}</div>}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem' }}>
                                  {resolvedSpotName}
                                  {row.status === 'error_spot' && <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>{row.errorMessage}</div>}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem' }}>
                                  <span style={{ backgroundColor: cfg.bg, color: cfg.color, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    {cfg.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* フッター */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 2rem 1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', borderRadius: '0 0 1rem 1rem' }}>
              <button onClick={handleCloseJsonModal} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 600 }}>
                キャンセル
              </button>
              <button
                onClick={handleJsonImport}
                disabled={importPreview.length === 0 || isImporting || importPreview.every(r => r.status === 'duplicate_skip' || r.status.startsWith('error'))}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: 'none',
                  background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600,
                  opacity: (importPreview.length === 0 || isImporting || importPreview.every(r => r.status === 'duplicate_skip' || r.status.startsWith('error'))) ? 0.5 : 1
                }}
              >
                {isImporting ? '登録中...' : (() => {
                  const count = importPreview.filter(r => r.status === 'new' || r.status === 'duplicate_overwrite').length;
                  return count > 0 ? `${count}件を登録する` : '登録対象なし';
                })()}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container-fluid {
          max-width: 95vw;
          margin: 0 auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .admin-header {
          margin-bottom: 2rem;
        }

        .admin-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .admin-header-content {
            flex-direction: column;
            align-items: center;
          }
        }

        .admin-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .admin-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .admin-subtitle {
          font-size: 1rem;
          color: #6b7280;
        }
        
        .admin-panel {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .calendar-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .current-month {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .nav-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .admin-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: none;
        }
        
        @media (min-width: 1200px) {
          .admin-content {
            grid-template-columns: 3fr 1fr;
            gap: 2.5rem;
          }
        }
        
        @media (min-width: 1024px) and (max-width: 1199px) {
          .admin-content {
            grid-template-columns: 2.5fr 1fr;
            gap: 2rem;
          }
        }
        
        .calendar-section {
          overflow-x: auto;
          padding: 0.5rem;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #e5e7eb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .calendar-header-cell {
          background-color: #1f2937;
          color: white;
          padding: 0.75rem 0.25rem;
          text-align: center;
          font-weight: 700;
          font-size: clamp(0.7rem, 2vw, 0.9rem);
          letter-spacing: 0.05em;
        }
        
        .calendar-day {
          min-height: clamp(100px, 15vh, 180px);
          background-color: white;
          padding: clamp(0.25rem, 1vw, 0.5rem);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        
        .calendar-day:hover {
          background-color: #f9fafb;
        }
        
        .other-month {
          background-color: #f9fafb;
          color: #9ca3af;
        }
        
        .today {
          background-color: #eff6ff;
        }
        
        .selected {
          background-color: #dbeafe;
          border: 2px solid #3b82f6;
        }
        
        .day-number {
          font-weight: 600;
          margin-bottom: clamp(0.25rem, 1vw, 0.5rem);
          font-size: clamp(0.8rem, 2.5vw, 1rem);
        }
        
        .today .day-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(20px, 4vw, 28px);
          height: clamp(20px, 4vw, 28px);
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
        }
        
        .day-events {
          display: flex;
          flex-direction: column;
          gap: clamp(0.125rem, 0.5vw, 0.25rem);
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }
        
        .event-item {
          display: flex;
          align-items: flex-start;
          padding: clamp(0.375rem, 1vw, 0.625rem);
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: clamp(0.7rem, 2vw, 0.8rem);
          color: #1e293b;
          transition: all 0.2s;
          margin-bottom: clamp(0.25rem, 0.8vw, 0.375rem);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          position: relative;
          min-height: clamp(45px, 8vw, 60px);
        }
        
        .event-item:hover {
          background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .event-dot {
          width: clamp(6px, 1.2vw, 10px);
          height: clamp(6px, 1.2vw, 10px);
          border-radius: 50%;
          margin-right: clamp(0.25rem, 0.8vw, 0.5rem);
          flex-shrink: 0;
        }
        
        .event-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 0;
        }
        
        .event-name {
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 0.125rem;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .event-location {
          font-size: clamp(0.6rem, 1.5vw, 0.65rem);
          color: #6b7280;
          font-weight: 500;
          line-height: 1.1;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .event-delete {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(18px, 3.5vw, 24px);
          height: clamp(18px, 3.5vw, 24px);
          background-color: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          border: none;
          font-size: clamp(0.75rem, 1.8vw, 0.9rem);
          cursor: pointer;
          transition: all 0.2s;
          margin-left: clamp(0.25rem, 0.8vw, 0.5rem);
          flex-shrink: 0;
          align-self: flex-start;
          margin-top: 2px;
        }
        
        .event-delete:hover {
          background-color: #fecaca;
          transform: scale(1.1);
        }

        .event-tooltip {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%) translateY(-100%);
          z-index: 1000;
          opacity: 1;
          animation: fadeIn 0.2s ease-out;
        }

        .tooltip-content {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          font-size: 0.8rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .tooltip-content::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #1f2937;
        }

        .tooltip-title {
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
          color: #f8fafc;
        }

        .tooltip-location,
        .tooltip-time,
        .tooltip-date {
          font-size: 0.75rem;
          color: #cbd5e1;
          margin-bottom: 0.125rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .tooltip-date {
          margin-bottom: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-90%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%);
          }
        }
        
        .control-panel {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: calc(100px + 2rem);
          height: fit-content;
          max-height: calc(100vh - 100px - 4rem);
          overflow-y: auto;
        }
        
        .control-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .selected-date {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .panel-instruction {
          text-align: center;
          color: #6b7280;
          margin-bottom: 1rem;
          padding: 1rem;
          background-color: #f3f4f6;
          border-radius: 0.25rem;
        }
        
        .control-form {
          margin-bottom: 1.5rem;
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
        
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          background-color: white;
          color: #1f2937;
        }
        
        .form-group select:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .searchable-select {
          position: relative;
        }

        .searchable-select input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          background-color: white;
          color: #1f2937;
        }

        .searchable-select input:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .dropdown-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 0.25rem 0.25rem;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .dropdown-item {
          padding: 0.75rem;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s;
        }

        .dropdown-item:hover {
          background-color: #f9fafb;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item.no-results {
          color: #6b7280;
          text-align: center;
          cursor: default;
        }

        .dropdown-item.no-results:hover {
          background-color: transparent;
        }

        .item-location,
        .item-campus {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        
        .panel-note {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 1rem;
        }

        /* タブレット対応 */
        @media (max-width: 1024px) {
          .admin-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .control-panel {
            position: sticky;
            top: calc(80px + 1rem);
            margin-top: 1rem;
            max-height: calc(100vh - 80px - 2rem);
          }
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .container {
            padding: 1rem 0.5rem;
          }
          
          .admin-panel {
            padding: 1rem;
          }
          
          .calendar-navigation {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .nav-buttons {
            justify-content: center;
            gap: 0.5rem;
          }
          
          .calendar-section {
            padding: 0;
            margin: 0 -0.5rem;
          }

          .tooltip-content {
            font-size: 0.75rem;
            padding: 0.5rem 0.75rem;
            max-width: 200px;
            white-space: normal;
            word-wrap: break-word;
          }

          .tooltip-title {
            font-size: 0.8rem;
          }

          .tooltip-location,
          .tooltip-time,
          .tooltip-date {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .admin-title {
            font-size: 1.5rem;
          }
          
          .admin-subtitle {
            font-size: 0.9rem;
          }
          
          .current-month {
            font-size: 1.25rem;
          }
          
          .control-panel {
            padding: 1rem;
            position: sticky;
            top: calc(70px + 0.5rem);
            max-height: calc(100vh - 70px - 1rem);
          }
          
          .nav-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        /* 極小画面対応 */
        @media (max-width: 320px) {
          .calendar-section {
            margin: 0 -1rem;
          }
        }

        /* アクセシビリティの改善 */
        .calendar-day:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }
        
        .dropdown-item:focus {
          background-color: #dbeafe;
          outline: none;
        }
        
        .searchable-select input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }
      `}</style>
    </Layout>
  );
};

// イベントの色を取得する関数
function getEventColor(index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
  ];
  
  return colors[index % colors.length];
}

export default AdminCalendarPage;