// components/shop/MenuModal.tsx
import { useEffect } from 'react';
import styles from '../../styles/MenuModal.module.css';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  likes: number;
  userHasLiked?: boolean;
};

type MenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onLike?: (menuId: string) => Promise<boolean>;
};

export function MenuModal({ isOpen, onClose, menuItem, onLike }: MenuModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // モーダル表示時はボディのスクロールを無効化
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !menuItem) return null;

  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(menuItem.price);

  const handleLikeClick = async () => {
    if (onLike) {
      await onLike(menuItem.id);
    }
  };

  return (
    <div className={styles.menuModalOverlay} onClick={onClose}>
      <div className={styles.menuModalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.menuModalClose} onClick={onClose} aria-label="閉じる">
          ×
        </button>
        
        <div className={styles.menuModalBody}>
          {menuItem.image && (
            <div className={styles.menuModalImage}>
              <img src={menuItem.image} alt={menuItem.name} />
            </div>
          )}
          
          <div className={styles.menuModalDetails}>
            <div className={styles.menuModalHeader}>
              <h2 className={styles.menuModalTitle}>{menuItem.name}</h2>
              {menuItem.category && (
                <span className={styles.menuModalCategory}>{menuItem.category}</span>
              )}
            </div>
            
            <div className={styles.menuModalPrice}>{formattedPrice}</div>
            
            {menuItem.description && (
              <div className={styles.menuModalDescription}>
                <h3>商品説明</h3>
                <p>{menuItem.description}</p>
              </div>
            )}
            
            <div className={styles.menuModalFooter}>
              <button 
                className={`${styles.menuModalLikeButton} ${menuItem.userHasLiked ? styles.liked : ''}`}
                onClick={handleLikeClick}
              >
                {menuItem.userHasLiked ? '❤️' : '🤍'} 
                <span className={styles.likeCount}>{menuItem.likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}