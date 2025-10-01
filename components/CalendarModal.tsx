// components/CalendarModal.tsx
import { useEffect } from 'react';
import Link from 'next/link';

type CalendarEvent = {
  id: string;
  date: Date;
  kitchenId: string;
  kitchenName: string;
  kitchenImage: string;
  spotId: string;
  spotName: string;
};

type CalendarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  events: CalendarEvent[];
};

export function CalendarModal({ isOpen, onClose, selectedDate, events }: CalendarModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !selectedDate) return null;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getDayOfWeek = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="閉じる">
          ×
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">
            {formatDate(selectedDate)} ({getDayOfWeek(selectedDate)})
          </h2>
          <p className="modal-subtitle">この日のキッチンカー出店予定</p>
        </div>
        
        <div className="modal-body">
          {events.length === 0 ? (
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <p>この日はキッチンカーの出店予定がありません</p>
            </div>
          ) : (
            <div className="events-list">
              {events.map((event, index) => (
                <Link href={`/shop/${event.kitchenId}`} key={event.id} className="event-card">
                  <div className="event-image">
                    {event.kitchenImage ? (
                      <img src={event.kitchenImage} alt={event.kitchenName} />
                    ) : (
                      <div className="event-image-placeholder">🚛</div>
                    )}
                  </div>
                  
                  <div className="event-details">
                    <h3 className="event-name">{event.kitchenName}</h3>
                    <div className="event-location">
                      <span className="location-icon">📍</span>
                      {event.spotName}
                    </div>
                    <div className="event-time">
                      <span className="time-icon">⏰</span>
                      10:30 - 15:30
                    </div>
                  </div>
                  
                  <div className="event-arrow">→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <p className="modal-note">※ 店舗をクリックすると詳細ページに移動します</p>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
          z-index: 10;
        }
        
        .modal-close:hover {
          background: #e5e7eb;
          color: #374151;
          transform: scale(1.05);
        }
        
        .modal-header {
          text-align: center;
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .modal-subtitle {
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .modal-body {
          padding: 1.5rem 2rem;
        }
        
        .no-events {
          text-align: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }
        
        .no-events-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .event-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        
        .event-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        
        .event-image {
          width: 4rem;
          height: 4rem;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        
        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .event-image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.5rem;
        }
        
        .event-details {
          flex: 1;
        }
        
        .event-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .event-location,
        .event-time {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
        .location-icon,
        .time-icon {
          margin-right: 0.5rem;
        }
        
        .event-arrow {
          font-size: 1.25rem;
          color: #9ca3af;
          margin-left: 1rem;
          transition: all 0.2s;
        }
        
        .event-card:hover .event-arrow {
          color: #3b82f6;
          transform: translateX(0.25rem);
        }
        
        .modal-footer {
          padding: 1rem 2rem 2rem;
          text-align: center;
        }
        
        .modal-note {
          font-size: 0.8rem;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .modal-content {
            margin: 0.5rem;
            max-height: 95vh;
          }
          
          .modal-header {
            padding: 1.5rem 1rem 1rem;
          }
          
          .modal-title {
            font-size: 1.25rem;
          }
          
          .modal-body {
            padding: 1rem;
          }
          
          .modal-footer {
            padding: 1rem;
          }
          
          .event-card {
            padding: 0.75rem;
          }
          
          .event-image {
            width: 3rem;
            height: 3rem;
            margin-right: 0.75rem;
          }
          
          .event-name {
            font-size: 1rem;
          }
          
          .event-location,
          .event-time {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}