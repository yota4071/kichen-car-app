// components/shop/PRCard.tsx
import Link from 'next/link';
import { useEffect } from 'react';
import { useTextOverflow } from '../../hooks/useTextOverflow';

type PRCardProps = {
  id: string;
  name: string;
  location: string;
  image: string;
  prMessage: string;
  url: string;
};

export default function PRCard({ 
  id, 
  name, 
  location, 
  image, 
  prMessage,
  url
}: PRCardProps) {
  const {
    textRef: nameRef,
    checkOverflow: checkNameOverflow
  } = useTextOverflow<HTMLHeadingElement>();

  const {
    textRef: messageRef,
    checkOverflow: checkMessageOverflow
  } = useTextOverflow<HTMLDivElement>();

  // コンテンツ変更時に再チェック
  useEffect(() => {
    checkNameOverflow();
    checkMessageOverflow();
  }, [name, prMessage, checkNameOverflow, checkMessageOverflow]);

  return (
    <Link href={url} className="shop-card">
      <div className="shop-image-container">
        <img src={image} alt={name} className="shop-image" />
        <div className="shop-type">PR</div>
      </div>
      <div className="shop-details">
        <h3 
          ref={nameRef}
          className="shop-name"
          title={name}
        >
          {name}
        </h3>
        <div 
          ref={messageRef}
          className="pr-message"
          title={prMessage}
        >
          {prMessage}
        </div>
      </div>
    </Link>
  );
}