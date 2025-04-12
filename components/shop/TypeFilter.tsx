// components/shop/TypeFilter.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type TypeFilterProps = {
  selectedType: string;
  onTypeChange: (type: string) => void;
  dishCategory?: string; // dishカテゴリー（和食、洋食など）
};

export default function TypeFilter({ 
  selectedType, 
  onTypeChange,
  dishCategory 
}: TypeFilterProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      setIsLoading(true);
      try {
        // Firestoreからkitchensコレクションを取得
        const kitchensRef = collection(db, "kitchens");
        const kitchensSnapshot = await getDocs(kitchensRef);
        
        // typeフィールドを抽出して重複を排除
        const typeSet = new Set<string>();
        
        kitchensSnapshot.docs.forEach(doc => {
          const data = doc.data();
          
          // dishCategoryが指定されている場合は、そのdishに合致するものだけを取得
          if (dishCategory && data.dish !== dishCategory) {
            return;
          }
          
          if (data.type) {
            typeSet.add(data.type);
          }
        });
        
        // Setから配列に変換してソート
        const typeArray = Array.from(typeSet).sort();
        setTypes(typeArray);
      } catch (error) {
        console.error("Error fetching types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypes();
  }, [dishCategory]);

  if (isLoading) {
    return <div>タイプを読み込み中...</div>;
  }

  return (
    <div className="type-filter">
      <h3 className="filter-title">料理タイプ</h3>
      <div className="filter-options">
        <button
          className={`filter-option ${selectedType === "" ? "active" : ""}`}
          onClick={() => onTypeChange("")}
        >
          すべて
        </button>
        {types.map((type) => (
          <button
            key={type}
            className={`filter-option ${selectedType === type ? "active" : ""}`}
            onClick={() => onTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .type-filter {
          margin-bottom: 1.5rem;
        }
        
        .filter-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #4b5563;
        }
        
        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .filter-option {
          padding: 0.5rem 1rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          font-size: 0.875rem;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-option:hover {
          background-color: #f3f4f6;
        }
        
        .filter-option.active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}