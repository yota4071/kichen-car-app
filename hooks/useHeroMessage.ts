// hooks/useHeroMessage.ts
import { useState, useEffect } from 'react';

type HeroMessage = {
  title: string;
  subtitle: string;
};

type SpecialEvent = {
  name: string;
  start_date: string;
  end_date: string;
  priority: 'high' | 'medium' | 'low';
  display_mode: 'fixed' | 'random';
  messages: HeroMessage[];
};

type SeasonalMessage = {
  season: string;
  start_date: string;
  end_date: string;
  messages: HeroMessage[];
};

type HeroMessagesConfig = {
  special_events: SpecialEvent[];
  seasonal_messages: SeasonalMessage[];
  default_messages: HeroMessage[];
};

export const useHeroMessage = () => {
  const [heroMessage, setHeroMessage] = useState<HeroMessage>({
    title: "あなたの近くの美味しい\nキッチンカーを見つけよう",
    subtitle: "立命館大学で人気のキッチンカーを検索して、新しい味の発見を楽しみましょう"
  });
  const [isLoading, setIsLoading] = useState(true);

  // 日付の比較用関数（MM-DD形式）
  const isDateInRange = (currentDate: Date, startDate: string, endDate: string): boolean => {
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const currentStr = `${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    
    // 年をまたぐ場合（例：12-20 から 01-07）
    if (startDate > endDate) {
      return currentStr >= startDate || currentStr <= endDate;
    }
    
    return currentStr >= startDate && currentStr <= endDate;
  };

  // 配列からランダムに1つ選択
  const getRandomMessage = (messages: HeroMessage[]): HeroMessage => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // メッセージを決定
  const determineHeroMessage = (config: HeroMessagesConfig): HeroMessage => {
    const now = new Date();
    
    // 1. 高優先度の特別イベントをチェック
    const highPriorityEvents = config.special_events.filter(event => 
      event.priority === 'high' && isDateInRange(now, event.start_date, event.end_date)
    );
    
    if (highPriorityEvents.length > 0) {
      const event = highPriorityEvents[0]; // 複数ある場合は最初の1つ
      return event.display_mode === 'fixed' 
        ? event.messages[0] 
        : getRandomMessage(event.messages);
    }
    
    // 2. 中優先度の特別イベントをチェック
    const mediumPriorityEvents = config.special_events.filter(event => 
      event.priority === 'medium' && isDateInRange(now, event.start_date, event.end_date)
    );
    
    if (mediumPriorityEvents.length > 0) {
      const event = mediumPriorityEvents[0];
      return event.display_mode === 'fixed' 
        ? event.messages[0] 
        : getRandomMessage(event.messages);
    }
    
    // 3. 季節のメッセージをチェック
    const seasonalMessage = config.seasonal_messages.find(season => 
      isDateInRange(now, season.start_date, season.end_date)
    );
    
    if (seasonalMessage) {
      return getRandomMessage(seasonalMessage.messages);
    }
    
    // 4. デフォルトメッセージからランダム選択
    return getRandomMessage(config.default_messages);
  };

  useEffect(() => {
    const loadHeroMessage = async () => {
      try {
        setIsLoading(true);
        
        // 静的JSONファイルを読み込み
        const response = await fetch('/data/hero-messages.json');
        if (!response.ok) {
          throw new Error('Failed to load hero messages');
        }
        
        const config: HeroMessagesConfig = await response.json();
        const selectedMessage = determineHeroMessage(config);
        
        setHeroMessage(selectedMessage);
      } catch (error) {
        console.error('Error loading hero message:', error);
        // エラー時はデフォルトメッセージを使用
        setHeroMessage({
          title: "あなたの近くの美味しい\nキッチンカーを見つけよう",
          subtitle: "立命館大学で人気のキッチンカーを検索して、新しい味の発見を楽しみましょう"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHeroMessage();
  }, []);

  return { heroMessage, isLoading };
};