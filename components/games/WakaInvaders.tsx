// components/games/WakaInvaders.tsx
import React, { useEffect, useRef, useState } from 'react';

type WakaInvadersProps = {
  isMobile?: boolean;
};

// 様々な敵タイプの定義
const ENEMY_TYPES = [
  { color: '#ef4444', points: 40, shootChance: 0.001, health: 1 }, // 赤 (一番上の列)
  { color: '#f97316', points: 30, shootChance: 0.002, health: 1 }, // オレンジ (2列目)
  { color: '#84cc16', points: 20, shootChance: 0.003, health: 1 }, // 緑 (3列目)
  { color: '#06b6d4', points: 10, shootChance: 0.004, health: 1 }, // 水色 (一番下の列)
  { color: '#8b5cf6', points: 100, shootChance: 0.006, health: 2 }, // 紫 (ボス)
];

// ステージの定義
const STAGE_CONFIGS = [
  { rows: 4, cols: 8, speed: 1.0, enemyMoveInterval: 1000 }, // ステージ1
  { rows: 4, cols: 9, speed: 1.2, enemyMoveInterval: 900 },  // ステージ2
  { rows: 5, cols: 9, speed: 1.3, enemyMoveInterval: 800 },  // ステージ3
  { rows: 5, cols: 10, speed: 1.4, enemyMoveInterval: 700 }, // ステージ4
  { rows: 6, cols: 10, speed: 1.5, enemyMoveInterval: 600 }, // ステージ5 (ボス含む)
];

// プレイヤー型
type Player = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  lives: number;
  isInvulnerable: boolean;
  invulnerableUntil: number;
};

// 弾型
type Bullet = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  isEnemy: boolean;
};

// 敵型
type Enemy = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: number;
  points: number;
  shootChance: number;
  health: number;
  isBoss?: boolean;
};

// 爆発エフェクト型
type Explosion = {
  x: number; 
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
};

// パワーアップ型
type PowerUp = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'speed' | 'shield' | 'multiShot';
  color: string;
  speed: number;
};

// ゲーム状態型
type GameState = {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  explosions: Explosion[];
  powerUps: PowerUp[];
  stage: number;
  enemyDirection: number;
  enemyMoveSpeed: number;
  enemyMoveInterval: number;
  lastEnemyMove: number;
  lastEnemyShot: number;
  enemyShotInterval: number;
  lastShot: number;
  shotInterval: number;
  canvasWidth: number;
  canvasHeight: number;
  touchStartX: number;
  isPaused: boolean;
  stageCleared: boolean;
  gameCompleted: boolean;
  hasMultiShot: boolean;
  multiShotUntil: number;
  score: number;
  highScore: number;
  animationFrameId: number | null;
};

const WakaInvaders: React.FC<WakaInvadersProps> = ({ isMobile = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stage, setStage] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [stageCleared, setStageCleared] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  // ゲーム状態
  const gameState = useRef<GameState>({
    canvas: null,
    ctx: null,
    player: {
      x: 0, 
      y: 0, 
      width: 30, 
      height: 15, 
      speed: 5, 
      color: '#3b82f6',
      isMovingLeft: false,
      isMovingRight: false,
      lives: 3,
      isInvulnerable: false,
      invulnerableUntil: 0
    },
    bullets: [],
    enemies: [],
    explosions: [],
    powerUps: [],
    stage: 1,
    enemyDirection: 1,
    enemyMoveSpeed: 10,
    enemyMoveInterval: 1000,
    lastEnemyMove: 0,
    lastEnemyShot: 0,
    enemyShotInterval: 1000,
    lastShot: 0,
    shotInterval: 300,
    canvasWidth: 0,
    canvasHeight: 0,
    touchStartX: 0,
    isPaused: false,
    stageCleared: false,
    gameCompleted: false,
    hasMultiShot: false,
    multiShotUntil: 0,
    score: 0,
    highScore: 0,
    animationFrameId: null
  });

  // ローカルストレージからハイスコアを読み込み
  useEffect(() => {
    const savedHighScore = localStorage.getItem('wakaInvadersHighScore');
    if (savedHighScore) {
      const parsedScore = parseInt(savedHighScore, 10);
      setHighScore(parsedScore);
      gameState.current.highScore = parsedScore;
    }
  }, []);

  // ゲームの初期化
  const initGame = (stageNumber = 1) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスサイズを設定
    const parentWidth = canvas.parentElement?.clientWidth || 800;
    const parentHeight = Math.min(600, window.innerHeight - 200);
    
    canvas.width = parentWidth;
    canvas.height = parentHeight;
    
    const state = gameState.current;
    state.canvas = canvas;
    state.ctx = ctx;
    state.canvasWidth = parentWidth;
    state.canvasHeight = parentHeight;
    state.stage = stageNumber;
    state.isPaused = false;
    state.stageCleared = false;
    state.gameCompleted = false;
    
    // プレイヤーの位置を設定
    state.player.x = parentWidth / 2 - state.player.width / 2;
    state.player.y = parentHeight - 40;
    state.player.lives = lives;
    state.player.isInvulnerable = false;
    state.player.invulnerableUntil = 0;
    
    // ステージ設定を取得
    const stageConfig = STAGE_CONFIGS[stageNumber - 1];
    const { rows, cols, speed, enemyMoveInterval } = stageConfig;
    
    // 敵を配置
    state.enemies = [];
    const enemyWidth = 30;
    const enemyHeight = 20;
    const padding = Math.min(20, (parentWidth - (cols * enemyWidth)) / (cols + 1));
    const startX = (parentWidth - (cols * (enemyWidth + padding))) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 最終ステージの中央上部にボスを配置
        const isBoss = stageNumber === 5 && row === 0 && col === Math.floor(cols / 2);
        const enemyType = isBoss ? 4 : row % 4; // ボスは紫、それ以外は行ごとに色分け
        
        const enemy: Enemy = {
          x: startX + col * (enemyWidth + padding),
          y: 50 + row * (enemyHeight + padding),
          width: isBoss ? enemyWidth * 1.5 : enemyWidth,
          height: isBoss ? enemyHeight * 1.5 : enemyHeight,
          color: ENEMY_TYPES[enemyType].color,
          type: enemyType,
          points: ENEMY_TYPES[enemyType].points,
          shootChance: ENEMY_TYPES[enemyType].shootChance,
          health: isBoss ? ENEMY_TYPES[enemyType].health * 5 : ENEMY_TYPES[enemyType].health,
          isBoss
        };
        
        state.enemies.push(enemy);
      }
    }
    
    // ステージに応じた敵の動きの速さを設定
    state.enemyMoveSpeed = 10 * speed;
    state.enemyMoveInterval = enemyMoveInterval;
    state.enemyDirection = 1;
    
    // 弾と爆発をリセット
    state.bullets = [];
    state.explosions = [];
    state.powerUps = [];
    state.hasMultiShot = false;
    state.multiShotUntil = 0;
    
    // スコアを継続
    state.score = score;
    state.highScore = highScore;
    
    setGameOver(false);
    setStageCleared(false);
    setGameCompleted(false);
    setGameStarted(true);
    setStage(stageNumber);
    setIsPaused(false);
  };

  // ゲームループ
  const gameLoop = (timestamp: number) => {
    const state = gameState.current;
    if (!state.ctx || !state.canvas || state.isPaused) {
      state.animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }
    
    const { ctx, canvas, canvasWidth, canvasHeight } = state;
    
    // 背景をクリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 星空背景の描画
    drawStarfield(ctx, canvasWidth, canvasHeight, timestamp);
    
    // プレイヤーの移動
    if (state.player.isMovingLeft && state.player.x > 0) {
      state.player.x -= state.player.speed;
    }
    if (state.player.isMovingRight && state.player.x < canvasWidth - state.player.width) {
      state.player.x += state.player.speed;
    }
    
    // プレイヤーの描画（無敵時は点滅）
    const currentTime = timestamp;
    if (!state.player.isInvulnerable || (currentTime % 200) < 100) {
      ctx.fillStyle = state.player.color;
      ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      
      // プレイヤーの砲台部分
      ctx.fillRect(state.player.x + state.player.width / 2 - 2, state.player.y - 8, 4, 8);
    }
    
    // マルチショット状態の表示
    if (state.hasMultiShot) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(
        state.player.x + state.player.width / 2,
        state.player.y + state.player.height / 2,
        state.player.width * 0.8,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // 無敵時間の更新
    if (state.player.isInvulnerable && currentTime > state.player.invulnerableUntil) {
      state.player.isInvulnerable = false;
    }
    
    // マルチショットの更新
    if (state.hasMultiShot && currentTime > state.multiShotUntil) {
      state.hasMultiShot = false;
    }
    
    // 弾の移動と描画
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i];
      bullet.y -= bullet.speed;
      
      // 画面外に出た弾を削除
      if ((bullet.isEnemy && bullet.y > canvasHeight) || (!bullet.isEnemy && bullet.y < 0)) {
        state.bullets.splice(i, 1);
        continue;
      }
      
      // 弾の描画
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      
      if (!bullet.isEnemy) {
        // プレイヤーの弾と敵の衝突判定
        for (let j = state.enemies.length - 1; j >= 0; j--) {
          const enemy = state.enemies[j];
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            // 敵にダメージ
            enemy.health--;
            
            // 弾を削除
            state.bullets.splice(i, 1);
            
            // 敵がまだ生きている場合は爆発なし
            if (enemy.health > 0) {
              // ダメージエフェクト（小さな爆発）
              state.explosions.push({
                x: bullet.x,
                y: bullet.y,
                radius: 5,
                maxRadius: 10,
                color: '#ffff00',
                alpha: 1
              });
              break;
            }
            
            // 敵が倒されたらスコア加算
            const newScore = score + enemy.points;
            setScore(newScore);
            state.score = newScore;
            
            // ハイスコア更新
            if (newScore > state.highScore) {
              state.highScore = newScore;
              setHighScore(newScore);
              localStorage.setItem('wakaInvadersHighScore', newScore.toString());
            }
            
            // 爆発エフェクト
            state.explosions.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              radius: 10,
              maxRadius: enemy.isBoss ? 60 : 30,
              color: enemy.color,
              alpha: 1
            });
            
            // 敵を削除
            state.enemies.splice(j, 1);
            
            // パワーアップの確率でドロップ（ボスは100%）
            if (enemy.isBoss || Math.random() < 0.1) {
              const powerUpType = Math.random() < 0.33 ? 'speed' : Math.random() < 0.66 ? 'shield' : 'multiShot';
              const powerUpColor = powerUpType === 'speed' 
                ? '#22c55e' // 緑
                : powerUpType === 'shield' 
                  ? '#60a5fa' // 青
                  : '#fbbf24'; // 黄色（マルチショット）
              
              state.powerUps.push({
                x: enemy.x + enemy.width / 2 - 10,
                y: enemy.y + enemy.height / 2 - 10,
                width: 20,
                height: 20,
                type: powerUpType,
                color: powerUpColor,
                speed: 1
              });
            }
            
            break;
          }
        }
      } else {
        // 敵の弾とプレイヤーの衝突判定
        if (
          !state.player.isInvulnerable &&
          bullet.x < state.player.x + state.player.width &&
          bullet.x + bullet.width > state.player.x &&
          bullet.y < state.player.y + state.player.height &&
          bullet.y + bullet.height > state.player.y
        ) {
          // 弾を削除
          state.bullets.splice(i, 1);
          
          // プレイヤーにダメージ
          const newLives = lives - 1;
          setLives(newLives);
          state.player.lives = newLives;
          
          // 爆発エフェクト
          state.explosions.push({
            x: state.player.x + state.player.width / 2,
            y: state.player.y + state.player.height / 2,
            radius: 10,
            maxRadius: 30,
            color: '#ff4444',
            alpha: 1
          });
          
          // 無敵時間を設定
          state.player.isInvulnerable = true;
          state.player.invulnerableUntil = currentTime + 2000;
          
          // ゲームオーバー判定
          if (newLives <= 0) {
            setGameOver(true);
            break;
          }
        }
      }
    }
    
    // パワーアップの移動と描画
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
      const powerUp = state.powerUps[i];
      powerUp.y += powerUp.speed;
      
      // 画面外に出たパワーアップを削除
      if (powerUp.y > canvasHeight) {
        state.powerUps.splice(i, 1);
        continue;
      }
      
      // パワーアップの描画
      ctx.fillStyle = powerUp.color;
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      
      // 文字を描画
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      const symbol = powerUp.type === 'speed' ? 'S' : powerUp.type === 'shield' ? 'I' : 'M';
      ctx.fillText(symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 5);
      
      // プレイヤーとの衝突判定
      if (
        powerUp.x < state.player.x + state.player.width &&
        powerUp.x + powerUp.width > state.player.x &&
        powerUp.y < state.player.y + state.player.height &&
        powerUp.y + powerUp.height > state.player.y
      ) {
        // パワーアップを適用
        if (powerUp.type === 'speed') {
          state.player.speed = Math.min(state.player.speed + 1, 10); // 最大10まで
        } else if (powerUp.type === 'shield') {
          state.player.isInvulnerable = true;
          state.player.invulnerableUntil = currentTime + 5000; // 5秒間無敵
        } else if (powerUp.type === 'multiShot') {
          state.hasMultiShot = true;
          state.multiShotUntil = currentTime + 10000; // 10秒間マルチショット
        }
        
        // エフェクト
        state.explosions.push({
          x: powerUp.x + powerUp.width / 2,
          y: powerUp.y + powerUp.height / 2,
          radius: 10,
          maxRadius: 30,
          color: powerUp.color,
          alpha: 1
        });
        
        // パワーアップを削除
        state.powerUps.splice(i, 1);
      }
    }
    
    // 敵の移動と描画
    if (state.enemies.length > 0 && timestamp - state.lastEnemyMove > state.enemyMoveInterval) {
      let shouldChangeDirection = false;
      let lowestEnemy = 0;
      
      state.enemies.forEach(enemy => {
        enemy.x += state.enemyDirection * state.enemyMoveSpeed;
        
        // 画面端に到達したかチェック
        if (
          (state.enemyDirection > 0 && enemy.x + enemy.width > canvasWidth) ||
          (state.enemyDirection < 0 && enemy.x < 0)
        ) {
          shouldChangeDirection = true;
        }
        
        // 一番下の敵の位置を記録
        if (enemy.y + enemy.height > lowestEnemy) {
          lowestEnemy = enemy.y + enemy.height;
        }
      });
      
      // 方向転換が必要な場合
      if (shouldChangeDirection) {
        state.enemyDirection *= -1;
        state.enemies.forEach(enemy => {
          enemy.y += 20; // 下に移動
        });
      }
      
      state.lastEnemyMove = timestamp;
      
      // 敵がプレイヤーに到達したらゲームオーバー
      if (lowestEnemy >= state.player.y) {
        setLives(0);
        state.player.lives = 0;
        setGameOver(true);
      }
    }
    
    // 敵の描画と弾発射
    state.enemies.forEach(enemy => {
      // 敵を描画
      ctx.fillStyle = enemy.color;
      
      // ボスの場合は特別な描画
      if (enemy.isBoss) {
        drawBossEnemy(ctx, enemy);
      } else {
        drawNormalEnemy(ctx, enemy);
      }
      
      // 敵の弾発射
      if (Math.random() < enemy.shootChance) {
        // 最後の敵の弾発射からの経過時間をチェック
        if (timestamp - state.lastEnemyShot > state.enemyShotInterval) {
          const bullet: Bullet = {
            x: enemy.x + enemy.width / 2 - 1,
            y: enemy.y + enemy.height,
            width: enemy.isBoss ? 4 : 2,
            height: enemy.isBoss ? 10 : 5,
            speed: enemy.isBoss ? -4 : -3, // 負の値で下に移動
            color: enemy.isBoss ? '#ff00ff' : '#ff4444',
            isEnemy: true
          };
          state.bullets.push(bullet);
          state.lastEnemyShot = timestamp;
        }
      }
    });
    
    // 爆発エフェクトの更新と描画
    for (let i = state.explosions.length - 1; i >= 0; i--) {
      const explosion = state.explosions[i];
      explosion.radius += 1;
      explosion.alpha -= 0.05;
      
      if (explosion.alpha <= 0 || explosion.radius >= explosion.maxRadius) {
        state.explosions.splice(i, 1);
        continue;
      }
      
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(explosion.color)}, ${explosion.alpha})`;
      ctx.fill();
    }
    
    // ステージクリア判定
    if (state.enemies.length === 0 && !state.stageCleared) {
      state.stageCleared = true;
      setStageCleared(true);
      
      // 最終ステージだった場合はゲームクリア
      if (state.stage >= STAGE_CONFIGS.length) {
        state.gameCompleted = true;
        setGameCompleted(true);
      }
    }
    
    // UI描画
    drawUI(ctx, state);
    
    // ステージクリア画面
    if (state.stageCleared) {
      drawStageCleared(ctx, state);
    }
    
    // ゲームオーバー画面
    if (gameOver) {
      drawGameOver(ctx, state);
    }
    
    // 次のフレームを要求（ゲームオーバーでない場合）
    if (!gameOver) {
      state.animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

  // 星空背景の描画
  const drawStarfield = (ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => {
    // 星の位置と明るさをシミュレート
    const numStars = 100;
    const timeOffset = timestamp / 10000;
    
    for (let i = 0; i < numStars; i++) {
      const x = (Math.sin(i * 573.4 + timeOffset) + 1) * width / 2;
      const y = (Math.cos(i * 364.2 + timeOffset) + 1) * height / 2;
      const brightness = (Math.sin(i * 0.1 + timeOffset) + 1) / 2;
      const radius = brightness * 1.5;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.fill();
    }
  };

  // 通常の敵の描画
  const drawNormalEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // 目と口
    ctx.fillStyle = '#000';
    const eyeWidth = enemy.width / 5;
    const eyeHeight = enemy.height / 3;
    ctx.fillRect(enemy.x + eyeWidth, enemy.y + eyeHeight, eyeWidth, eyeHeight);
    ctx.fillRect(enemy.x + enemy.width - eyeWidth * 2, enemy.y + eyeHeight, eyeWidth, eyeHeight);
    
    // 口
    ctx.fillRect(enemy.x + enemy.width / 4, enemy.y + enemy.height - eyeHeight - 2, enemy.width / 2, eyeHeight / 2);
  };

  // ボス敵の描画
  const drawBossEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    // ボディ
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y + enemy.height / 2);
    ctx.lineTo(enemy.x + enemy.width / 4, enemy.y);
    ctx.lineTo(enemy.x + enemy.width * 3/4, enemy.y);
    ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
    ctx.lineTo(enemy.x + enemy.width * 3/4, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width / 4, enemy.y + enemy.height);
    ctx.closePath();
    ctx.fill();
    
    // 目 (赤く光る)
    ctx.fillStyle = '#ff0000';
    const eyeWidth = enemy.width / 8;
    const eyeHeight = enemy.height / 6;
    ctx.fillRect(enemy.x + enemy.width / 4 - eyeWidth / 2, enemy.y + enemy.height / 3, eyeWidth, eyeHeight);
    ctx.fillRect(enemy.x + enemy.width * 3/4 - eyeWidth / 2, enemy.y + enemy.height / 3, eyeWidth, eyeHeight);
    
    // ボスの体力ゲージ
    const healthPercentage = enemy.health / (ENEMY_TYPES[4].health * 5);
    const barWidth = enemy.width;
    const barHeight = 4;
    
    // 背景（グレー）
    ctx.fillStyle = '#666';
    ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
    
    // 体力（赤から緑までグラデーション）
    const healthColor = getHealthColor(healthPercentage);
    ctx.fillStyle = healthColor;
    ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercentage, barHeight);
  };

  // 体力表示の色を計算
  const getHealthColor = (percentage: number): string => {
    const r = Math.floor(255 * (1 - percentage));
    const g = Math.floor(255 * percentage);
    return `rgb(${r}, ${g}, 0)`;
  };

  // ゲームUI描画（続き）
  const drawUI = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // スコア表示
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${state.score}`, 20, 30);
    
    // ハイスコア表示
    ctx.textAlign = 'center';
    ctx.fillText(`HIGH SCORE: ${state.highScore}`, state.canvasWidth / 2, 30);
    
    // ステージ表示
    ctx.textAlign = 'right';
    ctx.fillText(`STAGE: ${state.stage}`, state.canvasWidth - 20, 30);
    
    // 残機表示
    ctx.textAlign = 'left';
    ctx.fillText(`LIVES: `, 20, state.canvasHeight - 20);
    
    // 残機アイコン
    for (let i = 0; i < state.player.lives; i++) {
      ctx.fillStyle = state.player.color;
      const iconX = 120 + i * 40;
      const iconY = state.canvasHeight - 25;
      ctx.fillRect(iconX, iconY, 15, 8);
      ctx.fillRect(iconX + 7, iconY - 4, 2, 4);
    }
    
    // パワーアップ状態表示
    let statusText = '';
    let statusColor = '';
    
    if (state.player.isInvulnerable) {
      statusText = 'SHIELD ACTIVE';
      statusColor = '#60a5fa';
    } else if (state.hasMultiShot) {
      statusText = 'MULTI-SHOT ACTIVE';
      statusColor = '#fbbf24';
    }
    
    if (statusText) {
      ctx.textAlign = 'right';
      ctx.fillStyle = statusColor;
      ctx.fillText(statusText, state.canvasWidth - 20, state.canvasHeight - 20);
    }
    
    // ポーズ表示
    if (state.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
      
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.fillText('PAUSED', state.canvasWidth / 2, state.canvasHeight / 2 - 40);
      
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('Press SPACE to continue', state.canvasWidth / 2, state.canvasHeight / 2 + 20);
    }
  };

  // ステージクリア画面
  const drawStageCleared = (ctx: CanvasRenderingContext2D, state: GameState) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
    
    ctx.textAlign = 'center';
    
    if (state.gameCompleted) {
      // ゲームクリア表示
      ctx.fillStyle = '#fbbf24'; // 金色
      ctx.font = '28px "Press Start 2P", monospace';
      ctx.fillText('CONGRATULATIONS!', state.canvasWidth / 2, state.canvasHeight / 2 - 60);
      
      ctx.fillStyle = '#fff';
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.fillText('YOU COMPLETED ALL STAGES!', state.canvasWidth / 2, state.canvasHeight / 2);
      
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(`FINAL SCORE: ${state.score}`, state.canvasWidth / 2, state.canvasHeight / 2 + 40);
      
      if (state.score >= state.highScore) {
        ctx.fillStyle = '#fbbf24'; // 金色
        ctx.fillText('NEW HIGH SCORE!', state.canvasWidth / 2, state.canvasHeight / 2 + 70);
      }
      
      ctx.fillStyle = '#fff';
      ctx.fillText('Press SPACE to play again', state.canvasWidth / 2, state.canvasHeight / 2 + 120);
    } else {
      // ステージクリア表示
      ctx.fillStyle = '#22c55e'; // 緑
      ctx.font = '28px "Press Start 2P", monospace';
      ctx.fillText(`STAGE ${state.stage} CLEARED!`, state.canvasWidth / 2, state.canvasHeight / 2 - 40);
      
      ctx.fillStyle = '#fff';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${state.score}`, state.canvasWidth / 2, state.canvasHeight / 2 + 20);
      
      ctx.fillText('Press SPACE for next stage', state.canvasWidth / 2, state.canvasHeight / 2 + 80);
    }
  };

  // ゲームオーバー画面
  const drawGameOver = (ctx: CanvasRenderingContext2D, state: GameState) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444'; // 赤
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', state.canvasWidth / 2, state.canvasHeight / 2 - 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${state.score}`, state.canvasWidth / 2, state.canvasHeight / 2 + 20);
    
    if (state.score >= state.highScore) {
      ctx.fillStyle = '#fbbf24'; // 金色
      ctx.fillText('NEW HIGH SCORE!', state.canvasWidth / 2, state.canvasHeight / 2 + 50);
    }
    
    ctx.fillStyle = '#fff';
    ctx.fillText('Press SPACE to play again', state.canvasWidth / 2, state.canvasHeight / 2 + 100);
  };

  // ヘルパー関数：HEX色をRGBに変換
  const hexToRgb = (hex: string): string => {
    // #を取り除く
    hex = hex.replace('#', '');
    
    // hexを分解
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  };

  // ショット発射
  const shoot = () => {
    const state = gameState.current;
    const now = Date.now();
    
    // ショット間隔のチェック
    if (now - state.lastShot < state.shotInterval) return;
    
    // 通常ショット
    const mainBullet: Bullet = {
      x: state.player.x + state.player.width / 2 - 1,
      y: state.player.y - 5,
      width: 2,
      height: 8,
      speed: 7,
      color: '#60a5fa',
      isEnemy: false
    };
    
    state.bullets.push(mainBullet);
    
    // マルチショットの場合、追加の弾を発射
    if (state.hasMultiShot) {
      const leftBullet: Bullet = {
        x: state.player.x + state.player.width / 4 - 1,
        y: state.player.y - 5,
        width: 2,
        height: 8,
        speed: 7,
        color: '#60a5fa',
        isEnemy: false
      };
      
      const rightBullet: Bullet = {
        x: state.player.x + state.player.width * 3/4 - 1,
        y: state.player.y - 5,
        width: 2,
        height: 8,
        speed: 7,
        color: '#60a5fa',
        isEnemy: false
      };
      
      state.bullets.push(leftBullet, rightBullet);
    }
    
    state.lastShot = now;
  };

  // ゲーム開始/再開
  // 改良版のstartGame関数を修正
const startGame = () => {
  // 既存のアニメーションをキャンセル
  if (gameState.current.animationFrameId) {
    cancelAnimationFrame(gameState.current.animationFrameId);
    gameState.current.animationFrameId = null;
  }
  
  // 状態をリセット
  setScore(0);
  setStage(1);
  setLives(3);
  setGameOver(false);
  setStageCleared(false);
  setGameCompleted(false);
  setGameStarted(true); // ここで先にゲーム開始状態にする
  
  // DOMの更新を待ってから初期化（重要）
  setTimeout(() => {
    console.log('Initializing game after DOM update');
    initGame(1);
    gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
  }, 0);
};

  // 次のステージに進む
  const nextStage = () => {
    const nextStageNum = stage + 1;
    
    // 最大ステージを超えないようにチェック
    if (nextStageNum <= STAGE_CONFIGS.length) {
      setStage(nextStageNum);
      initGame(nextStageNum);
      gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

  // ポーズ切り替え
  const togglePause = () => {
    const isPaused = !gameState.current.isPaused;
    gameState.current.isPaused = isPaused;
    setIsPaused(isPaused);
  };

  // キーボード操作のイベントリスナー
  useEffect(() => {
    if (!gameStarted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameState.current;
      
      // ゲームオーバー、またはステージクリア時はスペースキーで再開
      if (gameOver || stageCleared) {
        if (e.key === ' ' || e.code === 'Space') {
          if (gameOver || gameCompleted) {
            startGame();
          } else if (stageCleared) {
            nextStage();
          }
        }
        return;
      }
      
      // ポーズ中はスペースキーのみ受け付ける
      if (state.isPaused) {
        if (e.key === ' ' || e.code === 'Space') {
          togglePause();
        }
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          state.player.isMovingLeft = true;
          break;
        case 'ArrowRight':
          state.player.isMovingRight = true;
          break;
        case ' ':
        case 'Space':
          shoot();
          e.preventDefault(); // スペースキーによるスクロールを防止
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameState.current;
      
      switch (e.key) {
        case 'ArrowLeft':
          state.player.isMovingLeft = false;
          break;
        case 'ArrowRight':
          state.player.isMovingRight = false;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, stageCleared, gameCompleted]);

  // タッチ操作のイベントリスナー（モバイル用）
  useEffect(() => {
    if (!isMobile || !gameStarted || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const state = gameState.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // デフォルトのタッチ動作を防止
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      // ゲームオーバー、またはステージクリア時はタップで再開
      if (gameOver || stageCleared) {
        if (gameOver || gameCompleted) {
          startGame();
        } else if (stageCleared) {
          nextStage();
        }
        return;
      }
      
      // ポーズ中はタップでポーズ解除
      if (state.isPaused) {
        togglePause();
        return;
      }
      
      state.touchStartX = touchX;
      
      // 画面上部1/3タップでショット
      if (touchY < rect.height / 3) {
        shoot();
      }
      // 画面下部1/3のタップでコントロール
      else if (touchY > rect.height * 2/3) {
        if (touchX < rect.width / 2) {
          state.player.isMovingLeft = true;
          state.player.isMovingRight = false;
        } else {
          state.player.isMovingLeft = false;
          state.player.isMovingRight = true;
        }
      }
      // 画面中央タップでポーズ切り替え
      else {
        togglePause();
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      
      // 左右の移動
      if (touchX < rect.width / 3) {
        state.player.isMovingLeft = true;
        state.player.isMovingRight = false;
      } else if (touchX > rect.width * 2/3) {
        state.player.isMovingLeft = false;
        state.player.isMovingRight = true;
      } else {
        state.player.isMovingLeft = false;
        state.player.isMovingRight = false;
      }
    };
    
    const handleTouchEnd = () => {
      state.player.isMovingLeft = false;
      state.player.isMovingRight = false;
    };
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, gameStarted, gameOver, stageCleared, gameCompleted]);

  // ゲーム開始
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // キャンバスのサイズをウィンドウに合わせる
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const parentWidth = canvas.parentElement?.clientWidth || 800;
      const parentHeight = Math.min(600, window.innerHeight - 200);
      
      canvas.width = parentWidth;
      canvas.height = parentHeight;
      
      gameState.current.canvasWidth = parentWidth;
      gameState.current.canvasHeight = parentHeight;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // アニメーションフレームをクリア
      if (gameState.current.animationFrameId) {
        cancelAnimationFrame(gameState.current.animationFrameId);
      }
    };
  }, []);

  // モバイル向けのコントロールレイアウト
  const renderMobileControls = () => {
    if (!isMobile) return null;
    
    return (
      <div className="mobile-controls">
        <div className="mobile-instruction">
          上部タップ: ショット | 下部タップ: 移動 | 中央タップ: ポーズ
        </div>
      </div>
    );
  };

  return (
    <div className="game-component">
      {!gameStarted ? (
        <div className="start-screen">
          <div className="game-logo">
            <h2>WAKA</h2>
            <h2>INVADERS</h2>
          </div>
          <div className="game-intro">
            <p>5ステージの戦いが待っている！</p>
            <p>最高のスコアを目指せ！</p>
          </div>
          <button onClick={startGame} className="start-button">
            ゲームスタート
          </button>
          <div className="controls-info">
            {isMobile ? (
              <ul>
                <li>上部タップ: ショット発射</li>
                <li>下部タップ: 左右移動</li>
                <li>中央タップ: ポーズ</li>
              </ul>
            ) : (
              <ul>
                <li>← → : 左右移動</li>
                <li>SPACE : ショット発射</li>
                <li>P : ポーズ</li>
              </ul>
            )}
          </div>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="game-canvas"
          />
          {renderMobileControls()}
        </>
      )}
      <style jsx>{`
        .game-component {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background-color: #000;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }
        
        .game-canvas {
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
        }
        
        .start-screen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #000;
          color: white;
          text-align: center;
          padding: 20px;
          background: radial-gradient(circle at center, #1e3a8a 0%, #000 100%);
        }
        
        .game-logo {
          margin-bottom: 30px;
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        .game-logo h2 {
          font-family: 'Press Start 2P', monospace;
          font-size: 2.5rem;
          color: #3b82f6;
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
          margin: 0;
        }
        
        .game-intro {
          margin-bottom: 30px;
        }
        
        .game-intro p {
          font-family: 'Press Start 2P', monospace;
          font-size: 1rem;
          margin: 10px 0;
          color: #e2e8f0;
        }
        
        .start-button {
          margin-top: 20px;
          padding: 15px 30px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-family: 'Press Start 2P', monospace;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.5);
        }
        
        .start-button:hover {
          background-color: #2563eb;
          transform: translateY(-3px);
          box-shadow: 0 6px 10px rgba(59, 130, 246, 0.7);
        }
        
        .start-button:active {
          transform: translateY(1px);
        }
        
        .controls-info {
          margin-top: 30px;
          font-family: monospace;
          background-color: rgba(30, 58, 138, 0.3);
          padding: 15px 20px;
          border-radius: 8px;
          max-width: 80%;
        }
        
        .controls-info ul {
          list-style-type: none;
          padding: 0;
          text-align: left;
        }
        
        .controls-info li {
          margin: 10px 0;
          color: #cbd5e1;
        }
        
        .mobile-controls {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 100%;
          text-align: center;
          pointer-events: none;
        }
        
        .mobile-instruction {
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 0.75rem;
          padding: 8px;
          border-radius: 4px;
        }
        
        @keyframes glow {
          from {
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
          }
          to {
            text-shadow: 0 0 20px rgba(59, 130, 246, 1), 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
        
        @font-face {
          font-family: 'Press Start 2P';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2) format('woff2');
        }
      `}</style>
    </div>
  );
};

export default WakaInvaders;