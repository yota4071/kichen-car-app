import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function OzDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('匿名ユーザー');

  const player = useRef({ x: 220, y: 580, size: 30 });
  const enemies = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const canvasWidth = 480;
  const canvasHeight = 640;
  const velocity = 10;

  // ハイスコア読み込み
  useEffect(() => {
    const savedHighScore = localStorage.getItem('ozDodgeHighScore');
    if (savedHighScore) setHighScore(Number(savedHighScore));
  }, []);

  // ゲームループ
  useEffect(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // プレイヤー
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(player.current.x, player.current.y, player.current.size, player.current.size);

      // 敵
      ctx.fillStyle = '#ef4444';
      enemies.current.forEach((enemy) => {
        enemy.y += enemy.speed;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

        // 当たり判定
        if (
          enemy.y + enemy.size > player.current.y &&
          enemy.y < player.current.y + player.current.size &&
          enemy.x + enemy.size > player.current.x &&
          enemy.x < player.current.x + player.current.size
        ) {
          gameOver();
        }
      });

      enemies.current = enemies.current.filter((e) => e.y < canvasHeight);

      // スコア表示
      ctx.fillStyle = '#fff';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${score}`, 20, 30);
      ctx.fillText(`BEST: ${highScore}`, 20, 60);

      requestAnimationFrame(draw);
    };

    draw();

    interval.current = setInterval(() => {
      enemies.current.push({
        x: Math.random() * (canvasWidth - 20),
        y: -20,
        size: 20,
        speed: 2 + Math.random() * 2,
      });
      setScore((prev) => prev + 1);
    }, 500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') player.current.x = Math.max(0, player.current.x - velocity);
      if (e.key === 'ArrowRight') player.current.x = Math.min(canvasWidth - player.current.size, player.current.x + velocity);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (interval.current) clearInterval(interval.current);
    };
  }, [isRunning]);

  const gameOver = async () => {
    setIsRunning(false);
    if (score > highScore) {
      localStorage.setItem('ozDodgeHighScore', score.toString());
      setHighScore(score);
    }
    await addDoc(collection(db, 'oz_dodge'), {
      name: playerName,
      score,
      createdAt: serverTimestamp(),
    });
  };

  const startGame = () => {
    setScore(0);
    enemies.current = [];
    player.current = { x: 220, y: 580, size: 30 };
    setIsRunning(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold text-blue-400 mb-4">OZ DODGE</h1>
      <p className="mb-2">スコア: {score} / ハイスコア: {highScore}</p>

      {!isRunning && (
        <>
          <input
            type="text"
            className="p-2 mb-2 text-black rounded"
            placeholder="名前を入力..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
            onClick={startGame}
          >
            ゲームスタート
          </button>
        </>
      )}

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="mt-4 border-4 border-blue-500 rounded-lg"
      ></canvas>
    </div>
  );
}