// pages/calendar.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Layout from '@/components/Layout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { CalendarModal } from '@/components/CalendarModal';

// 型定義
type CalendarEvent = {
  id: string;
  date: Date;
  kitchenId: string;
  kitchenName: string;
  kitchenImage: string;
  spotId: string;
  spotName: string;
};

type CalendarDay = {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

const Calendar = () => {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const weekDayNames = ['日', '月', '火', '水', '木', '金', '土'];

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

  // 日付クリック処理
  const handleDateClick = (day: CalendarDay) => {
    if (day.events.length > 0) {
      setSelectedDate(day.date);
      setSelectedEvents(day.events);
      setIsModalOpen(true);
    }
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  // カレンダーデータを生成
  useEffect(() => {
    const fetchCalendarData = async () => {
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
        
        for (const doc of schedulesSnapshot.docs) {
          const data = doc.data();
          
          // 店舗情報を取得
          const kitchenRef = collection(db, "kitchens");
          const kitchenQuery = query(kitchenRef, where("__name__", "==", data.kitchenId));
          const kitchenSnap = await getDocs(kitchenQuery);
          
          if (!kitchenSnap.empty) {
            const kitchenData = kitchenSnap.docs[0].data();
            
            // スポット情報を取得（本来はcamp_spotsコレクションから取得するが、簡略化）
            let spotName = "不明";
            if (data.spotId === "plaza") spotName = "空のプラザ";
            else if (data.spotId === "terrace") spotName = "TERRACE GATE前";
            else if (data.spotId === "central-square") spotName = "セントラルアーク";
            else if (data.spotId === "west-wing") spotName = "ウェストウィング";
            else if (data.spotId === "promenade") spotName = "プロムナード";
            else if (data.spotId === "front-gate") spotName = "正門前";
            else if (data.spotId === "cafeteria") spotName = "食堂裏";
            else if (data.spotId === "garden") spotName = "中庭";
            
            events.push({
              id: doc.id,
              date: data.date.toDate(),
              kitchenId: data.kitchenId,
              kitchenName: kitchenData.name || "名称不明",
              kitchenImage: kitchenData.image || "",
              spotId: data.spotId,
              spotName: spotName
            });
          }
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
    
    fetchCalendarData();
  }, [currentMonth]);

  if (isLoading) {
    return (
      <Layout title="出店カレンダー | キッチンカー探し">
        <div className="container py-8">
          <LoadingIndicator message="カレンダー情報を読み込み中..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="出店カレンダー | キッチンカー探し">
      <div className="container py-8">
        <div className="calendar-header">
          <h1 className="calendar-title">キッチンカー出店カレンダー</h1>
          <p className="calendar-subtitle">各キャンパスのキッチンカー出店予定を確認できます</p>
        </div>
        
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
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.events.length > 0 ? 'has-events' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              
              {day.events.length > 0 && (
                <div className="day-events">
                  {day.events.slice(0, 3).map((event, eventIndex) => (
                    <div key={`event-${eventIndex}`} className="event-item">
                      <div className="event-dot" style={{ backgroundColor: getEventColor(eventIndex) }}></div>
                      <div className="event-content">
                        <div className="event-name">{event.kitchenName}</div>
                        <div className="event-location">{event.spotName}</div>
                      </div>
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <div className="more-events">
                      +{day.events.length - 3}件
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="calendar-info">
          <p>※ 出店時間は10:30-15:30です</p>
          <p>※ 出店情報は予告なく変更される場合があります</p>
          <p>※ 日付をクリックすると詳細を表示できます</p>
        </div>
      </div>
      
      <CalendarModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDate}
        events={selectedEvents}
      />
      
      <style jsx>{`
        .calendar-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .calendar-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .calendar-subtitle {
          font-size: 1rem;
          color: #6b7280;
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
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #e5e7eb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .calendar-header-cell {
          background-color: #f3f4f6;
          padding: 0.75rem;
          text-align: center;
          font-weight: 600;
          color: #4b5563;
        }
        
        .calendar-day {
          min-height: clamp(80px, 12vh, 120px);
          background-color: white;
          padding: clamp(0.25rem, 1vw, 0.5rem);
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
        }
        
        .calendar-day.has-events {
          cursor: pointer;
        }
        
        .calendar-day.has-events:hover {
          background-color: #f3f4f6;
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .other-month {
          background-color: #f9fafb;
          color: #9ca3af;
        }
        
        .today {
          background-color: #eff6ff;
        }
        
        .day-number {
          font-weight: 600;
          margin-bottom: clamp(0.125rem, 0.8vw, 0.25rem);
          font-size: clamp(0.75rem, 2.5vw, 0.9rem);
        }
        
        .today .day-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(18px, 3.5vw, 24px);
          height: clamp(18px, 3.5vw, 24px);
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
        }
        
        .day-events {
          display: flex;
          flex-direction: column;
          gap: clamp(0.125rem, 0.5vw, 0.25rem);
          overflow-y: auto;
          max-height: clamp(80px, 8vh, 100px);
          flex: 1;
        }
        
        .event-item {
          display: flex;
          align-items: flex-start;
          padding: clamp(0.125rem, 0.8vw, 0.25rem) clamp(0.25rem, 1vw, 0.375rem);
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          font-size: clamp(0.6rem, 1.8vw, 0.7rem);
          color: #4b5563;
          transition: all 0.2s;
          text-decoration: none;
          margin-bottom: clamp(0.0625rem, 0.3vw, 0.125rem);
          line-height: 1.2;
          min-height: clamp(18px, 3vh, 24px);
        }
        
        .more-events {
          padding: clamp(0.125rem, 0.5vw, 0.25rem) clamp(0.25rem, 1vw, 0.375rem);
          background-color: #e5e7eb;
          border-radius: 0.25rem;
          font-size: clamp(0.55rem, 1.5vw, 0.65rem);
          color: #6b7280;
          text-align: center;
          font-weight: 500;
          margin-top: clamp(0.125rem, 0.5vw, 0.25rem);
          line-height: 1.1;
        }
        
        .event-dot {
          width: clamp(4px, 1vw, 6px);
          height: clamp(4px, 1vw, 6px);
          border-radius: 50%;
          margin-right: clamp(0.125rem, 0.5vw, 0.25rem);
          flex-shrink: 0;
          margin-top: 1px;
        }
        
        .event-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        
        .event-name {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        
        .event-location {
          font-size: clamp(0.55rem, 1.4vw, 0.6rem);
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
          line-height: 1.1;
        }
        
        .calendar-info {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            gap: 0.5px;
          }
          
          .calendar-day {
            min-height: clamp(70px, 10vh, 90px);
            padding: clamp(0.125rem, 0.8vw, 0.25rem);
          }
          
          .day-events {
            max-height: clamp(60px, 7vh, 80px);
          }
          
          .event-item {
            padding: clamp(0.0625rem, 0.5vw, 0.125rem) clamp(0.125rem, 0.8vw, 0.25rem);
            font-size: clamp(0.55rem, 1.6vw, 0.65rem);
            min-height: clamp(16px, 2.5vh, 20px);
          }
          
          .event-dot {
            width: clamp(3px, 0.8vw, 5px);
            height: clamp(3px, 0.8vw, 5px);
          }
          
          .event-location {
            font-size: clamp(0.5rem, 1.2vw, 0.55rem);
          }
          
          .more-events {
            font-size: clamp(0.5rem, 1.3vw, 0.6rem);
            padding: clamp(0.0625rem, 0.4vw, 0.125rem) clamp(0.125rem, 0.8vw, 0.25rem);
          }
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

export default Calendar;