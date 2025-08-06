// components/shop/DynamicSubCategoryFilter.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type SubCategoryFilterProps = {
  selectedSubCategory: string;
  onSubCategoryChange: (subCategory: string) => void;
  dishCategory: string; // 親カテゴリー(dish)
};

export default function DynamicSubCategoryFilter({ 
  selectedSubCategory, 
  onSubCategoryChange,
  dishCategory
}: SubCategoryFilterProps) {
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // デフォルトで縮小状態

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!dishCategory || dishCategory === "すべて") {
        setSubCategories([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Firestoreからkitchensコレクションを取得
        const kitchensRef = collection(db, "kitchens");
        const kitchensSnapshot = await getDocs(kitchensRef);
        
        // subDishフィールドを抽出して、指定されたdishCategoryに属するものだけを抽出
        const subCategorySet = new Set<string>();
        
        kitchensSnapshot.docs.forEach(doc => {
          const data = doc.data();
          
          // 指定されたdishCategoryに属するデータのみを処理
          if (data.dish === dishCategory && data.subDish) {
            subCategorySet.add(data.subDish);
          }
        });
        
        // Setから配列に変換してソート
        const subCategoryArray = Array.from(subCategorySet).sort();
        setSubCategories(subCategoryArray);
      } catch (error) {
        console.error("Error fetching sub-categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubCategories();
  }, [dishCategory]);

  if (isLoading) {
    return <div>サブカテゴリーを読み込み中...</div>;
  }

  // サブカテゴリーがない場合は何も表示しない
  if (subCategories.length === 0) {
    return null;
  }

  return (
    <div className="subcategory-filter">
      <div 
        className="filter-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="subcategory-title">
          <span className="filter-icon">🍳</span>
          {dishCategory}のジャンル
          <span className="filter-count">({subCategories.length + 1}件)</span>
        </h2>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>
      
      <div className={`subcategory-tabs ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <button
          onClick={() => onSubCategoryChange("")}
          className={`subcategory-tab ${selectedSubCategory === "" ? 'active-subcategory-tab' : ''}`}
        >
          すべて
        </button>
        {subCategories.map((subCategory) => (
          <button
            key={subCategory}
            onClick={() => onSubCategoryChange(subCategory)}
            className={`subcategory-tab ${selectedSubCategory === subCategory ? 'active-subcategory-tab' : ''}`}
          >
            {subCategory}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .subcategory-filter {
          margin-bottom: 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          background-color: white;
          transition: background-color 0.2s;
          user-select: none;
        }
        
        .filter-header:hover {
          background-color: #f8fafc;
        }
        
        .subcategory-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-icon {
          font-size: 0.875rem;
        }
        
        .filter-count {
          font-size: 0.75rem;
          font-weight: 400;
          color: #6b7280;
          margin-left: 0.25rem;
        }
        
        .expand-icon {
          font-size: 0.75rem;
          color: #6b7280;
          transition: transform 0.3s ease;
        }
        
        .expand-icon.expanded {
          transform: rotate(180deg);
        }
        
        .subcategory-tabs {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .subcategory-tabs.collapsed {
          max-height: 0;
          opacity: 0;
        }
        
        .subcategory-tabs.expanded {
          max-height: 300px;
          opacity: 1;
          padding: 0 1rem 1rem 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .subcategory-tab {
          padding: 0.5rem 0.875rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .subcategory-tab:hover {
          background-color: #f3f4f6;
          transform: translateY(-1px);
        }
        
        .active-subcategory-tab {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
          .subcategory-tabs.expanded {
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .subcategory-tabs.expanded::-webkit-scrollbar {
            display: none;
          }
          
          .subcategory-tab {
            flex-shrink: 0;
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}