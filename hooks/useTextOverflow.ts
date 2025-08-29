import { useEffect, useRef, useState } from 'react';

export function useTextOverflow<T extends HTMLElement = HTMLElement>() {
  const textRef = useRef<T>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    if (!textRef.current) return;

    const element = textRef.current;
    
    // 現在の制約された高さを取得
    const constrainedHeight = element.clientHeight;
    
    // 方法1: テキストの実際の幅で判定
    const textContent = element.textContent || '';
    const computedStyle = window.getComputedStyle(element);
    
    // 一時的なspan要素でテキストの実際の幅を測定
    const testSpan = document.createElement('span');
    testSpan.style.font = computedStyle.font;
    testSpan.style.fontSize = computedStyle.fontSize;
    testSpan.style.fontWeight = computedStyle.fontWeight;
    testSpan.style.fontFamily = computedStyle.fontFamily;
    testSpan.style.letterSpacing = computedStyle.letterSpacing;
    testSpan.style.position = 'absolute';
    testSpan.style.visibility = 'hidden';
    testSpan.style.whiteSpace = 'nowrap';
    testSpan.textContent = textContent;
    
    document.body.appendChild(testSpan);
    const textWidth = testSpan.offsetWidth;
    document.body.removeChild(testSpan);
    
    const availableWidth = element.offsetWidth;
    const isWidthOverflowing = textWidth > availableWidth;
    
    // 方法2: 複数行表示での実際の高さを測定
    const clone = element.cloneNode(true) as HTMLElement;
    
    // 全てのスタイルを強制的にリセット
    clone.style.cssText = '';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.visibility = 'hidden';
    clone.style.width = element.offsetWidth + 'px';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.minHeight = '0';
    clone.style.display = 'block';
    clone.style.overflow = 'visible';
    clone.style.whiteSpace = 'normal';
    clone.style.wordWrap = 'break-word';
    clone.style.overflowWrap = 'break-word';
    clone.style.lineHeight = computedStyle.lineHeight;
    clone.style.fontSize = computedStyle.fontSize;
    clone.style.fontFamily = computedStyle.fontFamily;
    clone.style.fontWeight = computedStyle.fontWeight;
    clone.style.padding = computedStyle.padding;
    clone.style.margin = '0';
    clone.style.border = 'none';
    
    // webkit-line-clamp関連を完全に無効化
    clone.style.webkitLineClamp = 'unset';
    clone.style.webkitBoxOrient = 'unset';
    clone.className = ''; // クラス名も削除
    
    document.body.appendChild(clone);
    const multilineHeight = clone.offsetHeight;
    document.body.removeChild(clone);

    // 最大表示可能高さを計算（shop-nameの場合は3行、pr-messageの場合は4行）
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
    const isShopName = element.className.includes('shop-name');
    const isPRMessage = element.className.includes('pr-message');
    
    let maxDisplayHeight;
    if (isShopName) {
      maxDisplayHeight = lineHeight * 3; // 3行分
    } else if (isPRMessage) {
      maxDisplayHeight = lineHeight * 4; // 4行分
    } else {
      maxDisplayHeight = constrainedHeight; // フォールバック
    }

    // 複数行表示が必要かどうかの判定（幅ベース）
    const needsMultiline = isWidthOverflowing;
    
    // スクロールが必要かどうかの判定（複数行でも収まらない場合）
    const needsScrolling = multilineHeight > maxDisplayHeight;
    
    // 複数行表示またはスクロールが必要な場合はオーバーフロー状態
    const isTextOverflowing = needsMultiline || needsScrolling;
    
    
    setIsOverflowing(isTextOverflowing);
    
    // オーバーフローしている場合は適切なクラスを適用
    if (isTextOverflowing) {
      // 複数行表示が必要な場合
      if (needsMultiline) {
        element.classList.add('multiline');
      }
      
      // さらにスクロールが必要な場合
      if (needsScrolling) {
        element.classList.add('scrolling');
      } else {
        element.classList.remove('scrolling');
      }
    } else {
      element.classList.remove('multiline', 'scrolling');
    }
  };

  useEffect(() => {
    // 複数回チェックして確実にキャッチ
    const timers: NodeJS.Timeout[] = [];
    
    // 即座にチェック
    checkOverflow();
    
    // 100ms後にもチェック
    timers.push(setTimeout(() => {
      checkOverflow();
    }, 100));
    
    // 300ms後にもチェック（レイアウト完成後）
    timers.push(setTimeout(() => {
      checkOverflow();
    }, 300));
    
    // 500ms後にもチェック（最終確認）
    timers.push(setTimeout(() => {
      checkOverflow();
    }, 500));
    
    // リサイズ時に再チェック
    const handleResize = () => {
      setTimeout(checkOverflow, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // フォントが読み込まれた後にもチェック
    document.fonts?.ready?.then(() => {
      setTimeout(checkOverflow, 200);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    textRef,
    isOverflowing,
    checkOverflow, // 外部から再チェックを可能にする
  };
}