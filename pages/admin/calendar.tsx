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

// 管理者ユーザーID
const ADMIN_USER_IDS = [
  'ZoBOb8slRfTCOOknolAWZk7kX6P2',  // ここに実際の管理者ユーザーIDを追加
  'adminUserId2',
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
  
  const router = useRouter();
  
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const weekDayNames = ['日', '月', '火', '水', '木', '金', '土'];

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
      <div className="container py-8">
        <div className="admin-header">
          <h1 className="admin-title">キッチンカー管理カレンダー</h1>
          <p className="admin-subtitle">出店予定を登録・管理できます</p>
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
                {calendarDays.map((day, index) => (
                  <div 
                    key={`day-${index}`} 
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${selectedDate && selectedDate.getTime() === day.date.getTime() ? 'selected' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="day-number">{day.date.getDate()}</div>
                    
                    {day.events.length > 0 && (
                      <div className="day-events">
                        {day.events.map((event, eventIndex) => (
                          <div key={`event-${eventIndex}`} className="event-item">
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
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
                  <select 
                    id="shop-select" 
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    disabled={!selectedDate}
                  >
                    <option value="">選択してください</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} ({shop.type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="spot-select">出店場所</label>
                  <select 
                    id="spot-select" 
                    value={selectedSpot}
                    onChange={(e) => setSelectedSpot(e.target.value)}
                    disabled={!selectedDate}
                  >
                    <option value="">選択してください</option>
                    {spots.map(spot => (
                      <option key={spot.id} value={spot.id}>
                        {spot.name} ({spot.campusId.toUpperCase()})
                      </option>
                    ))}
                  </select>
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
      
      <style jsx>{`
        .admin-header {
          text-align: center;
          margin-bottom: 2rem;
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
          gap: 1.5rem;
        }
        
        @media (min-width: 1024px) {
          .admin-content {
            grid-template-columns: 2fr 1fr;
          }
        }
        
        .calendar-section {
          overflow-x: auto;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #e5e7eb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          min-width: 700px;
        }
        
        .calendar-header-cell {
          background-color: #f3f4f6;
          padding: 0.75rem;
          text-align: center;
          font-weight: 600;
          color: #4b5563;
        }
        
        .calendar-day {
          min-height: 100px;
          background-color: white;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
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
          margin-bottom: 0.5rem;
        }
        
        .today .day-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
        }
        
        .day-events {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
          max-height: 120px;
        }
        
        .event-item {
          display: flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #4b5563;
          transition: all 0.2s;
        }
        
        .event-item:hover {
          background-color: #e5e7eb;
        }
        
        .event-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        
        .event-content {
          flex: 1;
          overflow: hidden;
        }
        
        .event-name {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .event-location {
          font-size: 0.7rem;
          color: #6b7280;
        }
        
        .event-delete {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background-color: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          border: none;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 0.5rem;
        }
        
        .event-delete:hover {
          background-color: #fecaca;
          transform: scale(1.1);
        }
        
        .control-panel {
          background-color: #f9fafb;
          border-radius: 0.5rem;
          padding: 1.5rem;
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
          background-color: #dbeafe;
          color: #1d4ed8;
          padding: 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
          font-weight: 600;
          text-align: center;
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