// components/shop/ShopSchedule.tsx
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ShopScheduleProps = {
  shopId: string;
};

type ScheduleItem = {
  id: string;
  date: Date;
  spotId: string;
  spotName: string;
};

export default function ShopSchedule({ shopId }: ShopScheduleProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!shopId) return;

      setIsLoading(true);
      try {
        // 今日の日付を取得
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 2週間後の日付を取得（期間を制限）
        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(today.getDate() + 14);
        
        const todayTimestamp = Timestamp.fromDate(today);
        const twoWeeksLaterTimestamp = Timestamp.fromDate(twoWeeksLater);
        
        // 今後の出店予定を取得
        const schedulesRef = collection(db, "schedules");
        const q = query(
          schedulesRef,
          where("kitchenId", "==", shopId),
          where("date", ">=", todayTimestamp),
          where("date", "<=", twoWeeksLaterTimestamp),
          orderBy("date", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        
        // スケジュールデータをScheduleItemに変換
        const scheduleItems: ScheduleItem[] = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // スポット情報を取得（ここでは簡易的に固定の情報を使用）
          let spotName = "不明";
          if (data.spotId === "plaza") spotName = "空のプラザ";
          else if (data.spotId === "terrace") spotName = "TERRACE GATE前";
          else if (data.spotId === "central-square") spotName = "セントラルアーク";
          else if (data.spotId === "west-wing") spotName = "ウェストウィング";
          else if (data.spotId === "promenade") spotName = "プロムナード";
          else if (data.spotId === "front-gate") spotName = "正門前";
          else if (data.spotId === "cafeteria") spotName = "食堂裏";
          else if (data.spotId === "garden") spotName = "中庭";
          
          scheduleItems.push({
            id: doc.id,
            date: data.date.toDate(),
            spotId: data.spotId,
            spotName: spotName
          });
        }
        
        setSchedules(scheduleItems);
      } catch (error) {
        console.error("Error fetching shop schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [shopId]);

  // 日付のフォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  if (isLoading) {
    return <div className="shop-schedule-loading">読み込み中...</div>;
  }

  if (schedules.length === 0) {
    return (
      <div className="shop-schedule-empty">
        <p>今後2週間の出店予定はありません</p>
      </div>
    );
  }

  return (
    <div className="shop-schedule">
      <h3 className="schedule-title">今後の出店予定</h3>
      <ul className="schedule-list">
        {schedules.map((schedule) => (
          <li key={schedule.id} className="schedule-item">
            <div className="schedule-date">{formatDate(schedule.date)}</div>
            <div className="schedule-location">{schedule.spotName}</div>
          </li>
        ))}
      </ul>
      
      <style jsx>{`
        .shop-schedule {
          margin-top: 1.5rem;
          background-color: #f8fafc;
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .schedule-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #2d3748;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        
        .schedule-list {
          list-style: none;
          padding: 0;
        }
        
        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #edf2f7;
        }
        
        .schedule-item:last-child {
          border-bottom: none;
        }
        
        .schedule-date {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .schedule-location {
          color: #4a5568;
        }
        
        .shop-schedule-loading {
          text-align: center;
          padding: 1rem;
          color: #718096;
        }
        
        .shop-schedule-empty {
          text-align: center;
          padding: 1.5rem;
          color: #718096;
          background-color: #f8fafc;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
}