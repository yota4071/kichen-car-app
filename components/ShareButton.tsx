// components/ShareButton.tsx
import { useState } from 'react';

type ShareButtonProps = {
  title: string;
  url?: string;
  className?: string;
};

export default function ShareButton({ title, url, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // 共有するURL（指定がなければhttps://nomnom-eats.com/）
  const shareUrl = url || 'https://nomnom-eats.com/';

  // Web Share APIを使った共有（モバイルやサポートしているブラウザのみ）
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        console.log('共有に成功しました');
      } catch (error) {
        console.log('共有に失敗しました', error);
        // Web Share APIが失敗したらオプションを表示
        setShowOptions(true);
      }
    } else {
      // Web Share APIをサポートしていない場合はオプションを表示
      setShowOptions(true);
    }
  };

  // クリップボードにURLをコピー
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Twitter共有リンク
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
  
  // Facebook共有リンク
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  
  // LINE共有リンク
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="share-button-container">
      <button 
        onClick={handleShare}
        className={`share-button ${className}`}
        aria-label="シェアする"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
        </svg>
        <span>シェアする</span>
      </button>

      {showOptions && (
        <div className="share-options">
          <div className="share-options-arrow"></div>
          <div className="share-options-content">
            <a 
              href={twitterShareUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="share-option"
            >
              <span className="share-icon twitter-icon">𝕏</span>
              X (Twitter)
            </a>
            <a 
              href={facebookShareUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="share-option"
            >
              <span className="share-icon facebook-icon">f</span>
              Facebook
            </a>
            <a 
              href={lineShareUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="share-option"
            >
              <span className="share-icon line-icon">L</span>
              LINE
            </a>
            <button onClick={copyToClipboard} className="share-option copy-option">
              <span className="share-icon copy-icon">📋</span>
              {copied ? 'コピーしました！' : 'URLをコピー'}
            </button>
            <button 
              onClick={() => setShowOptions(false)} 
              className="share-option-close"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}