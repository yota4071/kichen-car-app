// components/shop/MenuList.tsx
import { useState, useMemo } from 'react';
import { MenuItem } from './MenuItem';

type MenuItemType = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  likes: number;
  userLiked?: boolean;
};

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'most-liked';
type CategoryFilter = string | 'all';

type MenuListProps = {
  menuItems: MenuItemType[];
  onLikeMenuItem: (menuId: string) => Promise<boolean>;
  displayLimit?: number;
  categories?: string[];
};

export function MenuList({
  menuItems,
  onLikeMenuItem,
  displayLimit = 10,
  categories = []
}: MenuListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showAll, setShowAll] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(displayLimit);

  // カテゴリーを重複なく抽出
  const uniqueCategories = useMemo(() => {
    return categories.length > 0 
      ? categories 
      : Array.from(new Set(menuItems.map(item => item.category).filter(Boolean))) as string[];
  }, [menuItems, categories]);

  // フィルターとソートを適用したメニューアイテムを取得
  const getFilteredAndSortedMenuItems = () => {
    // カテゴリーフィルタリング
    let filteredItems = menuItems;
    if (categoryFilter !== 'all') {
      filteredItems = menuItems.filter(item => item.category === categoryFilter);
    }
    
    // ソート
    const sortedItems = [...filteredItems];
    switch (sortBy) {
      case 'price-asc':
        return sortedItems.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedItems.sort((a, b) => b.price - a.price);
      case 'most-liked':
        return sortedItems.sort((a, b) => b.likes - a.likes);
      case 'default':
      default:
        return sortedItems;
    }
  };

  const filteredAndSortedMenuItems = getFilteredAndSortedMenuItems();
  const displayedMenuItems = showAll 
    ? filteredAndSortedMenuItems 
    : filteredAndSortedMenuItems.slice(0, currentLimit);

  // 表示件数を増やす
  const handleShowMore = () => {
    setCurrentLimit(prev => prev + displayLimit);
    if (currentLimit + displayLimit >= filteredAndSortedMenuItems.length) {
      setShowAll(true);
    }
  };

  // 表示をリセット
  const handleShowLess = () => {
    setCurrentLimit(displayLimit);
    setShowAll(false);
  };

  // メニューがない場合
  if (menuItems.length === 0) {
    return (
      <div className="no-menu">
        メニュー情報がありません。
      </div>
    );
  }

  return (
    <div className="menu-container">
      <div className="menu-controls">
        {/* カテゴリーフィルター */}
        {uniqueCategories.length > 0 && (
          <div className="menu-filter">
            <span className="filter-label">カテゴリー:</span>
            <div className="filter-options">
              <button
                className={`filter-option ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                すべて
              </button>
              {uniqueCategories.map(category => (
                <button
                  key={category}
                  className={`filter-option ${categoryFilter === category ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ソートオプション */}
        <div className="menu-sort">
          <span className="sort-label">並び替え:</span>
          <div className="sort-options">
            <button
              className={`sort-option ${sortBy === 'default' ? 'active' : ''}`}
              onClick={() => setSortBy('default')}
            >
              標準
            </button>
            <button
              className={`sort-option ${sortBy === 'price-asc' ? 'active' : ''}`}
              onClick={() => setSortBy('price-asc')}
            >
              価格（安い順）
            </button>
            <button
              className={`sort-option ${sortBy === 'price-desc' ? 'active' : ''}`}
              onClick={() => setSortBy('price-desc')}
            >
              価格（高い順）
            </button>
            <button
              className={`sort-option ${sortBy === 'most-liked' ? 'active' : ''}`}
              onClick={() => setSortBy('most-liked')}
            >
              人気順
            </button>
          </div>
        </div>
      </div>

      {/* 表示件数情報 */}
      <div className="menu-info">
        <div className="menu-count">
          {categoryFilter === 'all' 
            ? `全${menuItems.length}件中 ${displayedMenuItems.length}件を表示中`
            : `「${categoryFilter}」カテゴリー: ${filteredAndSortedMenuItems.length}件中 ${displayedMenuItems.length}件を表示中`}
        </div>
      </div>

      {/* メニューリスト */}
      <div className="menu-list">
        {displayedMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            description={item.description}
            image={item.image}
            category={item.category}
            likes={item.likes}
            onLike={onLikeMenuItem}
            userHasLiked={item.userLiked}
          />
        ))}
      </div>

      {/* もっと見るボタン */}
      {!showAll && filteredAndSortedMenuItems.length > currentLimit && (
        <div className="menu-load-more">
          <button
            className="load-more-button"
            onClick={handleShowMore}
          >
            さらに{Math.min(displayLimit, filteredAndSortedMenuItems.length - currentLimit)}件表示
          </button>
        </div>
      )}

      {/* 表示を減らすボタン */}
      {showAll && currentLimit > displayLimit && (
        <div className="menu-load-more">
          <button
            className="load-less-button"
            onClick={handleShowLess}
          >
            表示を減らす
          </button>
        </div>
      )}
    </div>
  );
}