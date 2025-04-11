// components/ui/LoadingIndicator.tsx

type LoadingIndicatorProps = {
    message?: string;
  };
  
  export default function LoadingIndicator({ 
    message = '読み込み中...' 
  }: LoadingIndicatorProps) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="loading">
          <p>{message}</p>
        </div>
      </div>
    );
  }