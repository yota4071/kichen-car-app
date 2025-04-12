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
      <h2 className="subcategory-title">{dishCategory}のジャンル</h2>
      <div className="subcategory-tabs">
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
    </div>
  );
}