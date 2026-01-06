/***********************
 * TKU Foodie Match
 * Final Prototype (p5.js)
 ***********************/

// ===== 狀態管理 =====
let coverImg;
let bgImages = [];
let qrImg;
let mainBg;
let state = "intro";
let introStart;
// cover | swipe | store | payment | qr | finish | history

// ===== 餐點卡片資料（等待時間影響排序）=====
let cards = [
  { name: "照燒雞胸便當", calories: 550, protein: 35, wait: 5, green: true, price: 90, store: "校園健康餐坊" },
  { name: "蔬食咖哩飯", calories: 480, protein: 18, wait: 3, green: true, price: 80, store: "樂活蔬食" },
  { name: "炸雞腿便當", calories: 720, protein: 28, wait: 10, green: false, price: 95, store: "阿姨便當" },
  { name: "鮭鮪雙魚", calories: 650, protein: 50, wait: 8, green: true, price: 230, store: "波奇波奇" },
  { name: "黑胡椒嫩雞肉飯盒", calories: 541, protein: 36, wait: 6, green: true, price: 130, store: "淡水盒 x 活力餐廚" },
  { name: "CHOICE牛肋餐盒", calories: 610, protein: 56, wait: 12, green: true, price: 240, store: "補蛋計畫" },
  { name: "蒜香舒肥雞", calories: 450, protein: 40, wait: 7, green: true, price: 100, store: "校園健康餐坊" },
  { name: "鹽烤鯖魚飯", calories: 480, protein: 30, wait: 8, green: true, price: 95, store: "校園健康餐坊" },
  { name: "綜合野菇燉飯", calories: 420, protein: 15, wait: 4, green: true, price: 85, store: "樂活蔬食" },
  { name: "番茄蔬菜麵", calories: 380, protein: 12, wait: 5, green: true, price: 75, store: "樂活蔬食" },
  { name: "滷排骨便當", calories: 680, protein: 25, wait: 9, green: false, price: 90, store: "阿姨便當" },
  { name: "控肉便當", calories: 750, protein: 22, wait: 8, green: false, price: 95, store: "阿姨便當" },
  { name: "經典夏威夷", calories: 580, protein: 25, wait: 6, green: true, price: 180, store: "波奇波奇" },
  { name: "香辣鮪魚", calories: 520, protein: 28, wait: 7, green: true, price: 200, store: "波奇波奇" },
  { name: "舒肥牛排餐盒", calories: 600, protein: 45, wait: 10, green: true, price: 180, store: "淡水盒 x 活力餐廚" },
  { name: "香煎鮭魚餐盒", calories: 550, protein: 38, wait: 9, green: true, price: 160, store: "淡水盒 x 活力餐廚" },
  { name: "嫩煎雞腿排", calories: 500, protein: 35, wait: 8, green: true, price: 150, store: "補蛋計畫" },
  { name: "厚切豬排", calories: 700, protein: 32, wait: 10, green: false, price: 140, store: "補蛋計畫" }
];

// 等待時間越短 → 越前面
cards.sort((a, b) => a.wait - b.wait);

// ===== 店家資料 (多店家菜單) =====
let storesData = {
  "校園健康餐坊": [
    { name: "照燒雞胸便當", price: 90 },
    { name: "蒜香舒肥雞", price: 100 },
    { name: "鹽烤鯖魚飯", price: 95 }
  ],
  "樂活蔬食": [
    { name: "蔬食咖哩飯", price: 80 },
    { name: "綜合野菇燉飯", price: 85 },
    { name: "番茄蔬菜麵", price: 75 }
  ],
  "阿姨便當": [
    { name: "炸雞腿便當", price: 95 },
    { name: "滷排骨便當", price: 90 },
    { name: "控肉便當", price: 95 }
  ],
  "波奇波奇": [
    { name: "鮭鮪雙魚", price: 230 },
    { name: "經典夏威夷", price: 180 },
    { name: "香辣鮪魚", price: 200 }
  ],
  "淡水盒 x 活力餐廚": [
    { name: "黑胡椒嫩雞肉飯盒", price: 130 },
    { name: "舒肥牛排餐盒", price: 180 },
    { name: "香煎鮭魚餐盒", price: 160 }
  ],
  "補蛋計畫": [
    { name: "CHOICE牛肋餐盒", price: 240 },
    { name: "嫩煎雞腿排", price: 150 },
    { name: "厚切豬排", price: 140 }
  ]
};

// ===== 互動狀態 =====
let index = 0;
let x, y;
let dragging = false;
let animating = false;
let swipeDir = 0;
let showTutorial = false;
let confetti = [];
let celebrationPlayed = false;
let history = [];
try {
  // 嘗試讀取本地儲存的紀錄，如果沒有則使用空陣列
  history = JSON.parse(localStorage.getItem("foodie_history") || "[]");
} catch (e) {
  console.warn("無法讀取歷史紀錄");
}

let selectedPaymentIndex = 0;
let paymentMethods = ["現金", "LINE Pay", "信用卡"];
let paymentSuccessTime = 0;
let selectedMeal = null;

// ===== 初始化 =====
function preload() {
  coverImg = loadImage("圖/33.png");
  bgImages.push(loadImage("圖/111.png"));
  bgImages.push(loadImage("圖/222.png"));
  bgImages.push(loadImage("圖/333.png"));
  qrImg = loadImage("圖/QR.png");

  // ----- 載入餐點圖片 -----
  // 為了示範，這裡先暫時使用 coverImg 當作餐點圖
  // 實際使用時，請準備對應的照片並像這樣載入： card.img = loadImage("圖/chicken.png");
  cards.forEach(card => {
    if (card.name === "鮭鮪雙魚") {
      card.img = loadImage("食物圖/波奇1.png");
    } else if (card.name === "照燒雞胸便當") {
      card.img = loadImage("食物圖/照燒1.png");
    } else if (card.name === "黑胡椒嫩雞肉飯盒") {
      card.img = loadImage("食物圖/淡水盒1.png");
    } else if (card.name === "CHOICE牛肋餐盒") {
      card.img = loadImage("食物圖/補蛋1.png");
    } else if (card.name === "蔬食咖哩飯") {
      card.img = loadImage("食物圖/咖哩1.png");
    } else if (card.name === "炸雞腿便當") {
      card.img = loadImage("食物圖/雞腿1.png");
    } else if (card.name === "蒜香舒肥雞") {
      card.img = loadImage("食物圖/校園1.png");
    } else if (card.name === "鹽烤鯖魚飯") {
      card.img = loadImage("食物圖/校園2.png");
    } else if (card.name === "綜合野菇燉飯") {
      card.img = loadImage("食物圖/樂1.png");
    } else if (card.name === "番茄蔬菜麵") {
      card.img = loadImage("食物圖/樂2.png");
    } else if (card.name === "滷排骨便當") {
      card.img = loadImage("食物圖/阿姨1.png");
    } else if (card.name === "控肉便當") {
      card.img = loadImage("食物圖/阿姨2.png");
    } else if (card.name === "經典夏威夷") {
      card.img = loadImage("食物圖/波奇2.png");
    } else if (card.name === "香辣鮪魚") {
      card.img = loadImage("食物圖/波奇3.png");
    } else if (card.name === "舒肥牛排餐盒") {
      card.img = loadImage("食物圖/淡水盒2.png");
    } else if (card.name === "香煎鮭魚餐盒") {
      card.img = loadImage("食物圖/淡水盒3.png");
    } else if (card.name === "嫩煎雞腿排") {
      card.img = loadImage("食物圖/補蛋2.png");
    } else if (card.name === "厚切豬排") {
      card.img = loadImage("食物圖/補蛋3.png");
    } else {
      card.img = loadImage("圖/33.png");
    }
  });
}

function setup() {
  let canvas = createCanvas(360, 640); // 手機比例
  canvas.style("display", "block");
  canvas.style("margin", "auto"); // 桌機置中

  x = width / 2;
  y = height / 2;

  mainBg = random(bgImages);
  introStart = millis();
}

// ===== 主迴圈 =====
function draw() {
  background("#f4d35e");

  if (state === "intro") drawIntro();
  else if (state === "cover") drawCover();
  else if (state === "swipe") drawSwipe();
  else if (state === "store") drawStore();
  else if (state === "payment") drawPayment();
  else if (state === "qr") drawQR();
  else if (state === "finish") drawFinish();
  else if (state === "history") drawHistory();
}

// =====================
// 封面畫面
// =====================
function drawCover() {
  // 背景圖自動調整長寬符合畫面
  if (coverImg) {
    image(coverImg, 0, 0, width, height);
  }

  // 加上標題與提示文字 (加上黑邊確保在圖片上清晰可見)
  textAlign(CENTER, CENTER);

  noStroke();
  textSize(20);
  // 使用 sin 函數產生呼吸燈閃爍效果 (透明度在 60~255 之間變化)
  let alpha = map(sin(frameCount * 0.1), -1, 1, 60, 255);
  fill(255, alpha);
  text("點擊畫面開始", width / 2, height - 100);
}

function drawIntro() {
  let t = (millis() - introStart) / 1000;
  background("#f4d35e");

  // ===== 1. 左右卡片撞擊動畫 (0 ~ 1.2s) =====
  if (t < 1.2) {
    let alpha = 255;
    let leftX, rightX;
    let collisionTime = 0.6; // 加快撞擊節奏

    if (t < collisionTime) {
      // 加速撞擊 (Ease In Cubic) - 更有力道
      let p = Math.pow(t / collisionTime, 3);
      leftX = lerp(-150, width / 2 - 40, p);
      rightX = lerp(width + 150, width / 2 + 40, p);
    } else {
      // 撞擊後反彈擴散 (粒子效果 + 卡片回彈)
      let p = (t - collisionTime) / 0.6; // 0.0 ~ 1.0
      
      // 卡片輕微回彈
      let recoil = sin(p * PI) * 15; 
      leftX = width / 2 - 40 - recoil;
      rightX = width / 2 + 40 + recoil;
      
      alpha = map(p, 0, 0.8, 255, 0); // 快速淡出
      
      // 繪製撞擊粒子
      drawCollisionParticles(width / 2, height / 2, p);
    }
    drawMiniCard(leftX, height / 2, alpha);
    drawMiniCard(rightX, height / 2, alpha);
  }

  // ===== 2. Logo 彈性跳出 (0.9s ~ ) =====
  if (t > 0.9) {
    let p = constrain((t - 0.9) / 0.8, 0, 1);
    // 使用 Elastic Ease Out 讓 Logo 有 Q 彈感
    let scaleFactor = easeOutElastic(p); 
    let alpha = map(p, 0, 0.3, 0, 255);

    push();
    translate(width / 2, height / 2);
    scale(scaleFactor);

    // 餐盤
    noStroke();
    fill(255, alpha);
    ellipse(0, 0, 120);

    // 愛心
    fill(255, 120, 120, alpha);
    drawHeart(0, -5, 30);

    pop();
  }

  // ===== 3. 文字上浮淡入 (1.4s ~ ) =====
  if (t > 1.4) {
    let p = constrain((t - 1.4) / 0.8, 0, 1);
    let yOffset = map(easeOutCubic(p), 0, 1, 30, 0); // 從下方 30px 浮上來
    let alpha = map(p, 0, 1, 0, 255);
    
    fill(255, alpha);
    textAlign(CENTER, CENTER);
    textFont("Arial Rounded MT Bold, Microsoft JhengHei, sans-serif");
    textSize(42);
    text("食光配對", width / 2, height / 2 + 90 + yOffset);

    textSize(18);
    fill(255, alpha * 0.85);
    text("滑一滑，今天吃什麼", width / 2, height / 2 + 125 + yOffset);
  }

  if (t > 3.5) {
    state = "cover";
  }
}

// --- 動畫輔助函式 ---

function drawCollisionParticles(x, y, p) {
  if (p > 1) return;
  push();
  translate(x, y);
  noStroke();
  fill(255, 255 * (1 - p)); // 隨時間變透明
  
  let count = 8;
  for (let i = 0; i < count; i++) {
    let angle = TWO_PI / count * i;
    let dist = 40 + p * 80; // 向外擴散
    let size = 12 * (1 - p); // 變小
    ellipse(cos(angle) * dist, sin(angle) * dist, size, size);
  }
  pop();
}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}
function drawMiniCard(x, y, alpha = 255) {
  push();
  translate(x, y);
  rectMode(CENTER);
  fill(255, alpha);
  rect(0, 0, 90, 120, 12);
  fill(200, alpha);
  rect(0, -20, 60, 40, 8);
  pop();
}

function drawHeart(x, y, size) {
  push();
  translate(x, y);
  scale(size / 100);
  beginShape();
  vertex(0, 30);
  bezierVertex(-50, -20, -100, 40, 0, 120);
  bezierVertex(100, 40, 50, -20, 0, 30);
  endShape(CLOSE);
  pop();
}

// =====================
// 滑卡畫面
// =====================
function drawSwipe() {
  if (mainBg) {
    tint(255, 178); // 設定透明度為 70%
    image(mainBg, 0, 0, width, height);
    noTint(); // 重置 tint，避免影響其他圖片
  }

  // 歷史訂單按鈕 (左上角)
  push();
  rectMode(CORNER);
  noStroke();
  fill(255, 200);
  rect(15, 15, 110, 36, 18);
  fill(50);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("📜 歷史訂單", 15 + 55, 15 + 18);
  pop();

  let card = cards[index];

  if (!card) {
    // ===== 配對完成畫面 =====
    
    // 1. 觸發彩帶 (剛進入此畫面時爆發一次)
    if (!celebrationPlayed) {
      for (let i = 0; i < 100; i++) {
        confetti.push(createConfettiParticle(width / 2, height / 2));
      }
      celebrationPlayed = true;
    }

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(24);
    text("今日配對完成 🎉", width / 2, height / 2 - 50);

    // 探索更多按鈕
    let btnX = width / 2;
    let btnY = height / 2 + 30;
    
    // 陰影
    noStroke();
    fill(0, 20);
    rect(btnX + 3, btnY + 3, 240, 50, 25);

    // 按鈕本體
    fill(255);
    rect(btnX, btnY, 240, 50, 25);

    // 文字
    fill(255, 100, 80); // 暖色系文字 (珊瑚紅)
    textSize(18);
    text("🍴 探索更多美食 →", btnX, btnY);

    // 2. 繪製彩帶 (在最上層)
    updateAndDrawConfetti();
    
    return;
  } else {
    // 如果還有卡片，重置慶祝狀態 (以便下次測試或重置時能再次觸發)
    celebrationPlayed = false;
  }

  // 左右提示
  if (x > width / 2 + 40) {
    push();
    rectMode(CORNER);
    noStroke();
    fill(0, 255, 0, 153); // 60% 綠色背景 (255 * 0.6 = 153)
    rect(0, 0, width, height);
    pop();

    push();
    translate(width - 80, 80);
    scale(1 + sin(frameCount * 0.2) * 0.1); // 縮放動畫
    textAlign(CENTER, CENTER);
    stroke(255);
    strokeWeight(4);
    fill(0, 180, 0);
    textSize(32);
    text("LIKE ❤️", 0, 0);
    pop();
  } else if (x < width / 2 - 40) {
    push();
    rectMode(CORNER);
    noStroke();
    fill(255, 0, 0, 153); // 60% 紅色背景
    rect(0, 0, width, height);
    pop();

    push();
    translate(80, 80);
    scale(1 + sin(frameCount * 0.2) * 0.1); // 縮放動畫
    textAlign(CENTER, CENTER);
    stroke(255);
    strokeWeight(4);
    fill(200, 0, 0);
    textSize(32);
    text("SKIP ❌", 0, 0);
    pop();
  }

  // 滑出動畫
  if (animating) {
    x += swipeDir * 25;
    y += 5;

    if (x > width + 200 || x < -200) {
      animating = false;
      if (swipeDir === 1) {
        selectedMeal = card;
        state = "store";
      } else {
        nextCard();
      }
    }
  }

  drawCard(card);

  if (showTutorial) {
    drawTutorial();
  }
}

function drawCard(card) {
  push();
  translate(x, y);
  rotate((x - width / 2) * 0.002);

  rectMode(CENTER);
  fill(255);
  stroke(200);
  rect(0, 0, 300, 420, 20);

  // ----- 繪製餐點圖片 -----
  if (card.img) {
    imageMode(CENTER);
    // 將圖片繪製在卡片上半部 (y: -110)，設定大小為 260x160
    image(card.img, 0, -110, 260, 160);
  } else {
    // 如果沒有圖片，顯示灰色佔位框
    fill(240);
    noStroke();
    rect(0, -110, 260, 160, 10);
    fill(180);
    textAlign(CENTER, CENTER);
    text("餐點照片", 0, -110);
  }

  fill(0);
  textAlign(CENTER);
  textSize(20);
  text(card.name, 0, 0);

  fill(100);
  textSize(16);
  text(card.store, 0, 28);

  fill(0);
  textSize(14);
  text(`💰 $${card.price}`, 0, 55);
  text(` ${card.calories} kcal`, 0, 80);
  text(`💪 蛋白質 ${card.protein}g`, 0, 110);
  text(`⏱ 等待 ${card.wait} 分鐘`, 0, 140);

  if (card.green) {
    fill(0, 150, 0);
    text("🌱 綠色健康標章", 0, 180);
  }

  pop();
}

// =====================
// 彩帶特效函式
// =====================
function createConfettiParticle(x, y) {
  return {
    x: x,
    y: y,
    vx: random(-5, 5),     // 水平隨機擴散
    vy: random(-10, -2),   // 初始向上噴發
    size: random(6, 12),
    c: color(random(255), random(200), random(200)), // 隨機暖色調
    spin: random(TWO_PI),
    spinSpeed: random(-0.2, 0.2)
  };
}

function updateAndDrawConfetti() {
  for (let i = confetti.length - 1; i >= 0; i--) {
    let p = confetti[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3; // 重力
    p.spin += p.spinSpeed;
    
    push();
    translate(p.x, p.y);
    rotate(p.spin);
    fill(p.c);
    noStroke();
    rect(0, 0, p.size, p.size);
    pop();
    
    // 超出畫面底部則移除
    if (p.y > height) confetti.splice(i, 1);
  }
}

// =====================
// 店家與餐點頁
// =====================
function drawStore() {
  background("#FAFAFA"); // 1. 背景改為灰白色，更現代

  let currentStoreName = selectedMeal ? selectedMeal.store : "校園健康餐坊";
  let currentMenu = storesData[currentStoreName] || [];

  // ===========================
  // Header 區塊
  // ===========================
  push();
  fill(255);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 60); // 頂部導航列
  
  // 底部陰影線
  stroke(230);
  strokeWeight(1);
  line(0, 60, width, 60);
  
  // 返回按鈕 (Icon 風格)
  noStroke();
  fill(50);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("‹", 30, 30); // 簡約箭頭
  
  // 店家名稱
  fill(30);
  textStyle(BOLD);
  textSize(18);
  text(currentStoreName, width / 2, 30);
  pop();

  // ===========================
  // Hero 區塊 (已選餐點)
  // ===========================
  if (selectedMeal) {
    let heroY = 90;
    let heroH = 140;
    
    push();
    rectMode(CENTER);
    
    // 卡片陰影與背景
    noStroke();
    fill(0, 10); // 陰影
    rect(width / 2, heroY + heroH / 2 + 4, width - 40, heroH, 16);
    fill(255);   // 卡片本體
    rect(width / 2, heroY + heroH / 2, width - 40, heroH, 16);

    // 餐點圖片 (左側)
    if (selectedMeal.img) {
      imageMode(CENTER);
      let imgSize = 100;
      // 簡單裁切效果 (繪製圖片)
      image(selectedMeal.img, 40 + imgSize/2, heroY + heroH/2, imgSize, imgSize);
    } else {
      fill(240);
      rect(40 + 50, heroY + heroH/2, 100, 100, 8);
    }

    // 餐點資訊 (右側)
    textAlign(LEFT, TOP);
    fill(30);
    textSize(18);
    textStyle(BOLD);
    // 限制文字寬度避免重疊
    text(selectedMeal.name, 160, heroY + 25);
    
    textStyle(NORMAL);
    textSize(14);
    fill(100);
    text(`🔥 ${selectedMeal.calories} kcal`, 160, heroY + 55);
    text(`⏱ 等待 ${selectedMeal.wait} 分鐘`, 160, heroY + 75);
    
    fill(0, 150, 0); // 價格綠色
    textSize(18);
    textStyle(BOLD);
    text(`$${selectedMeal.price}`, 160, heroY + 100);
    pop();
  }

  // ===========================
  // 列表區塊 (其他餐點)
  // ===========================
  let listY = 260;
  
  push();
  textAlign(LEFT, BASELINE);
  fill(80);
  textSize(15);
  textStyle(BOLD);
  text("店家其他餐點", 25, listY - 10);
  
  let itemH = 70;
  for (let i = 0; i < currentMenu.length; i++) {
    let y = listY + i * itemH;
    
    // 選中狀態的高亮背景
    if (selectedMeal && currentMenu[i].name === selectedMeal.name) {
      fill(0, 180, 0, 15); // 淡綠色背景
      noStroke();
      rect(0, y, width, itemH);
    }

    // 分隔線
    stroke(240);
    strokeWeight(1);
    line(20, y + itemH, width - 20, y + itemH);
    noStroke();

    // 餐點名稱
    fill(30);
    textSize(16);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text(currentMenu[i].name, 25, y + itemH / 2);
    
    // 價格
    textAlign(RIGHT, CENTER);
    fill(30);
    text(`$${currentMenu[i].price}`, width - 50, y + itemH / 2);
    
    // 箭頭
    fill(200);
    textSize(20);
    text("›", width - 25, y + itemH / 2);
  }
  pop();

  // ===========================
  // CTA 按鈕 (底部固定)
  // ===========================
  push();
  rectMode(CENTER);
  
  // 按鈕陰影
  noStroke();
  fill(0, 180, 0, 50);
  rect(width / 2, height - 50 + 4, width - 60, 50, 25);
  
  // 按鈕本體
  fill(0, 180, 0);
  rect(width / 2, height - 50, width - 60, 50, 25);
  
  // 文字
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  text("選好餐點，前往付款", width / 2, height - 50);
  pop();
}

// =====================
// 付款方式頁
// =====================
function drawPayment() {
  background("#FAFAFA");

  // ===========================
  // Header 區塊
  // ===========================
  push();
  fill(255);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 60);
  
  stroke(230);
  strokeWeight(1);
  line(0, 60, width, 60);
  
  // 返回按鈕
  noStroke();
  fill(50);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("‹", 30, 30);
  
  // 標題
  fill(30);
  textStyle(BOLD);
  textSize(18);
  text("結帳", width / 2, 30);
  pop();

  // ===========================
  // 訂單摘要 (Hero)
  // ===========================
  if (selectedMeal) {
    let heroY = 90;
    let heroH = 100;
    
    push();
    rectMode(CENTER);
    // 陰影
    noStroke();
    fill(0, 10);
    rect(width / 2, heroY + heroH / 2 + 4, width - 40, heroH, 16);
    // 卡片
    fill(255);
    rect(width / 2, heroY + heroH / 2, width - 40, heroH, 16);
    
    // 內容
    textAlign(LEFT, TOP);
    fill(100);
    textSize(14);
    text("訂單摘要", 40, heroY + 20);
    
    fill(30);
    textSize(18);
    textStyle(BOLD);
    text(selectedMeal.name, 40, heroY + 50);
    
    textAlign(RIGHT, TOP);
    fill(0, 150, 0);
    text(`$${selectedMeal.price}`, width - 40, heroY + 50);
    pop();
  }

  // ===========================
  // 付款方式列表
  // ===========================
  let listY = 230;
  
  push();
  textAlign(LEFT, BASELINE);
  fill(80);
  textSize(15);
  textStyle(BOLD);
  text("付款方式", 25, listY - 10);
  
  let itemH = 60;
  for (let i = 0; i < paymentMethods.length; i++) {
    let y = listY + i * itemH;
    
    // 分隔線
    stroke(240);
    strokeWeight(1);
    line(20, y + itemH, width - 20, y + itemH);
    noStroke();

    // 文字
    fill(30);
    textSize(16);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text(paymentMethods[i], 40, y + itemH / 2);
    
    // Radio Button
    let rx = width - 40;
    let ry = y + itemH / 2;
    stroke(200);
    strokeWeight(2);
    noFill();
    ellipse(rx, ry, 20, 20);
    
    if (i === selectedPaymentIndex) {
      noStroke();
      fill(0, 180, 0);
      ellipse(rx, ry, 12, 12);
      stroke(0, 180, 0);
      noFill();
      ellipse(rx, ry, 20, 20);
    }
  }
  pop();

  // ===========================
  // CTA 按鈕 (底部固定)
  // ===========================
  push();
  rectMode(CENTER);
  
  // 陰影
  noStroke();
  fill(0, 180, 0, 50);
  rect(width / 2, height - 50 + 4, width - 60, 50, 25);
  
  // 按鈕
  fill(0, 180, 0);
  rect(width / 2, height - 50, width - 60, 50, 25);
  
  // 文字
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  let price = selectedMeal ? selectedMeal.price : 0;
  text(`確認付款 $${price}`, width / 2, height - 50);
  pop();

  // ===== 付款成功動畫 =====
  if (paymentSuccessTime > 0) {
    let t = (millis() - paymentSuccessTime) / 1000;

    // 動畫結束後跳轉 (1.5秒)
    if (t > 1.5) {
      state = "qr";
      paymentSuccessTime = 0;
      return;
    }

    // 半透明遮罩
    push();
    fill(0, 100);
    rectMode(CORNER);
    rect(0, 0, width, height);
    pop();

    drawCheckmarkAnimation(width / 2, height / 2, t);
  }
}

// =====================
// QR Code 頁
// =====================
function drawQR() {
  background("#FAFAFA");

  // ===========================
  // Header 區塊
  // ===========================
  push();
  fill(255);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 60);
  
  stroke(230);
  strokeWeight(1);
  line(0, 60, width, 60);
  
  // 標題
  fill(30);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text("取餐憑證", width / 2, 30);
  pop();

  // ===========================
  // 訂單狀態 (Hero)
  // ===========================
  if (selectedMeal) {
    let heroY = 90;
    let heroH = 100;
    
    push();
    rectMode(CENTER);
    // 陰影
    noStroke();
    fill(0, 10);
    rect(width / 2, heroY + heroH / 2 + 4, width - 40, heroH, 16);
    // 卡片
    fill(255);
    rect(width / 2, heroY + heroH / 2, width - 40, heroH, 16);
    
    // 內容
    textAlign(LEFT, TOP);
    fill(100);
    textSize(14);
    text("訂單編號 #20231027", 40, heroY + 20);
    
    fill(30);
    textSize(18);
    textStyle(BOLD);
    text(selectedMeal.name, 40, heroY + 50);
    
    // 狀態標籤
    textAlign(RIGHT, TOP);
    fill(0, 180, 0);
    textSize(14);
    text("● 已付款", width - 40, heroY + 20);
    
    fill(100);
    textSize(14);
    textStyle(NORMAL);
    text("等待取餐", width - 40, heroY + 54);
    pop();
  }

  // ===========================
  // QR Code 主視覺
  // ===========================
  let qrY = height / 2 + 20;
  let qrSize = 180;
  
  push();
  rectMode(CENTER);
  
  // QR Code 外框
  stroke(230);
  strokeWeight(1);
  fill(255);
  rect(width / 2, qrY, qrSize + 40, qrSize + 40, 12);
  
  // QR Code 圖片
  if (qrImg) {
    imageMode(CENTER);
    image(qrImg, width / 2, qrY, qrSize, qrSize);
  }

  // 說明文字
  fill(100);
  textAlign(CENTER, TOP);
  textSize(14);
  text("請向店家出示此 QR Code 取餐", width / 2, qrY + qrSize/2 + 35);
  pop();

  // ===========================
  // CTA 按鈕 (底部固定)
  // ===========================
  push();
  rectMode(CENTER);
  
  // 陰影
  noStroke();
  fill(0, 180, 0, 50);
  rect(width / 2, height - 50 + 4, width - 60, 50, 25);
  
  // 按鈕
  fill(0, 180, 0);
  rect(width / 2, height - 50, width - 60, 50, 25);
  
  // 文字
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  text("完成取餐", width / 2, height - 50);
  pop();
}

// =====================
// 取餐完成頁
// =====================
function drawFinish() {
  background("#FAFAFA");

  // ===========================
  // Header 區塊
  // ===========================
  push();
  fill(255);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 60);
  
  stroke(230);
  strokeWeight(1);
  line(0, 60, width, 60);
  
  // 標題
  fill(30);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text("完成", width / 2, 30);
  pop();

  // ===========================
  // 完成動畫與訊息
  // ===========================
  let cy = height / 2 - 40;
  
  push();
  translate(width / 2, cy - 60);
  
  // 呼吸光暈效果
  let glowSize = 120 + sin(frameCount * 0.05) * 10;
  noStroke();
  fill(0, 180, 0, 30);
  ellipse(0, 0, glowSize, glowSize);
  
  // 實心圓
  fill(0, 180, 0);
  ellipse(0, 0, 100, 100);
  
  // 勾勾圖示
  stroke(255);
  strokeWeight(8);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();
  beginShape();
  vertex(-20, 5);
  vertex(-5, 20);
  vertex(25, -25);
  endShape();
  pop();

  // 文字訊息
  textAlign(CENTER, TOP);
  fill(30);
  textSize(22);
  textStyle(BOLD);
  text("取餐完成", width / 2, cy + 20);
  
  textSize(18);
  text("祝你用餐愉快 🍽️", width / 2, cy + 55);

  fill(100);
  textSize(14);
  textStyle(NORMAL);
  text("感謝你選擇快速、友善環境的餐點", width / 2, cy + 90);

  // ===========================
  // CTA 按鈕 (底部固定)
  // ===========================
  push();
  rectMode(CENTER);
  
  // 陰影
  noStroke();
  fill(0, 180, 0, 50);
  rect(width / 2, height - 50 + 4, width - 60, 50, 25);
  
  // 按鈕
  fill(0, 180, 0);
  rect(width / 2, height - 50, width - 60, 50, 25);
  
  // 文字
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  textStyle(BOLD);
  text("返回首頁", width / 2, height - 50);
  pop();
}

// =====================
// 歷史訂單頁
// =====================
function drawHistory() {
  background("#FAFAFA");

  // Header
  push();
  fill(255);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, 60);
  stroke(230);
  strokeWeight(1);
  line(0, 60, width, 60);
  
  // Back
  noStroke();
  fill(50);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("‹", 30, 30);
  
  // Title
  fill(30);
  textStyle(BOLD);
  textSize(18);
  text("歷史訂單", width / 2, 30);

  // 清除按鈕 (右上角)
  if (history.length > 0) {
    fill(255, 80, 80); // 紅色文字表示刪除動作
    textSize(16);
    textAlign(RIGHT, CENTER);
    text("清除", width - 20, 30);
  }
  pop();

  // List
  let listY = 80;
  if (history.length === 0) {
    textAlign(CENTER, CENTER);
    fill(150);
    textSize(16);
    text("尚未有訂單紀錄", width / 2, height / 2);
  } else {
    // 顯示最近的訂單在上面
    for (let i = 0; i < history.length; i++) {
      let order = history[history.length - 1 - i];
      let y = listY + i * 85;
      
      push();
      // 日期
      fill(150);
      textSize(12);
      textAlign(LEFT, TOP);
      text(order.date, 20, y);
      
      // 餐點名稱
      fill(30);
      textSize(16);
      textStyle(BOLD);
      text(order.name, 20, y + 20);
      
      // 價格
      textAlign(RIGHT, TOP);
      fill(0, 150, 0);
      text("$" + order.price, width - 50, y + 20);

      // 垃圾桶圖示
      push();
      translate(width - 25, y + 28);
      noStroke();
      fill(180); // 淺灰色
      rectMode(CENTER);
      // 蓋子
      rect(0, -7, 14, 2);
      rect(0, -9, 6, 2);
      // 桶身
      rect(0, 1, 10, 12, 2);
      // 紋路
      stroke(255);
      strokeWeight(1);
      line(-2, -2, -2, 4);
      line(2, -2, 2, 4);
      pop();
      
      // 分隔線
      stroke(240);
      line(20, y + 60, width - 20, y + 60);
      pop();
    }
  }
}

// =====================
// 滑鼠 / 觸控
// =====================
function mousePressed() {
  dragging = true;
  if (state === "swipe") showTutorial = false;
}

function mouseDragged() {
  if (dragging && !animating && state === "swipe") {
    x = mouseX;
    y = mouseY;
  }
}

function mouseReleased() {
  dragging = false;

  if (state !== "swipe") return;

  if (x > width * 0.75) startSwipe(1);
  else if (x < width * 0.25) startSwipe(-1);
  else resetCard();
}

function mouseClicked() {
  if (state === "cover") {
    state = "swipe";
    showTutorial = true;
  } else if (state === "swipe") {
    // 歷史訂單按鈕 (左上角)
    if (mouseX < 130 && mouseY < 60) {
      state = "history";
      return;
    }

    // 如果卡片滑完，檢查是否點擊探索按鈕
    if (!cards[index]) {
      let btnX = width / 2;
      let btnY = height / 2 + 30;
      if (mouseX > btnX - 120 && mouseX < btnX + 120 && mouseY > btnY - 25 && mouseY < btnY + 25) {
        window.open("https://reurl.cc/aM8jW4", "_blank");
      }
    }
  } else if (state === "store") {
    // 返回按鈕 (Header 區域)
    if (mouseY < 60 && mouseX < 80) {
      state = "swipe";
      resetCard(); // 重置卡片位置，讓使用者可以重新滑動
    } 
    // 付款按鈕 (底部 CTA)
    // rect(width / 2, height - 50, width - 60, 50, 25);
    // Y range: height - 75 to height - 25
    // X range: 30 to width - 30
    else if (mouseY > height - 75 && mouseY < height - 25 &&
             mouseX > 30 && mouseX < width - 30) {
      state = "payment";
    }
    // 餐點列表點擊 (切換 Hero 顯示)
    else {
      let currentStoreName = selectedMeal ? selectedMeal.store : "校園健康餐坊";
      let currentMenu = storesData[currentStoreName] || [];
      let listY = 260;
      let itemH = 70;

      if (mouseY > listY && mouseY < listY + currentMenu.length * itemH) {
        let idx = floor((mouseY - listY) / itemH);
        if (idx >= 0 && idx < currentMenu.length) {
          let clickedItem = currentMenu[idx];
          
          // 嘗試從完整卡片資料中尋找 (為了取得圖片、熱量等詳細資訊)
          let fullCard = cards.find(c => c.name === clickedItem.name && c.store === currentStoreName);
          
          if (fullCard) {
            selectedMeal = fullCard;
          } else {
            // 若無完整資料，建立基本資料物件 (避免 Hero 區塊報錯)
            selectedMeal = {
              name: clickedItem.name,
              price: clickedItem.price,
              store: currentStoreName,
              calories: "---",
              protein: "--",
              wait: "--",
              green: false,
              img: null // Hero 區塊會顯示預設佔位圖
            };
          }
        }
      }
    }
  }
  else if (state === "payment") {
    // 返回按鈕
    if (mouseY < 60 && mouseX < 80) {
      state = "store";
    }
    
    // 選擇付款方式
    let listY = 230;
    let itemH = 60;
    if (mouseY > listY && mouseY < listY + paymentMethods.length * itemH) {
      selectedPaymentIndex = floor((mouseY - listY) / itemH);
    }

    // 確認付款按鈕
    if (mouseY > height - 75 && mouseY < height - 25 &&
        mouseX > 30 && mouseX < width - 30) {
      if (paymentSuccessTime === 0) {
        paymentSuccessTime = millis(); // 啟動動畫
      }
    }
  } 
  else if (state === "qr") {
    // 完成取餐按鈕
    if (mouseY > height - 75 && mouseY < height - 25 &&
        mouseX > 30 && mouseX < width - 30) {
      state = "finish";
    }
  }
  else if (state === "finish") {
    // 返回首頁按鈕
    if (mouseY > height - 75 && mouseY < height - 25 &&
        mouseX > 30 && mouseX < width - 30) {
      
      // 儲存到歷史紀錄
      if (selectedMeal) {
        history.push({
          name: selectedMeal.name,
          price: selectedMeal.price,
          date: new Date().toLocaleString() // 紀錄當下時間
        });
        // 更新本地儲存
        localStorage.setItem("foodie_history", JSON.stringify(history));
      }

      state = "cover";
      index = 0;
      selectedMeal = null;
      resetCard();
    }
  }
  else if (state === "history") {
    // 返回按鈕
    if (mouseY < 60 && mouseX < 80) {
      state = "swipe";
    }

    // 清除按鈕 (右上角)
    if (history.length > 0 && mouseY < 60 && mouseX > width - 80) {
      if (confirm("確定要清除所有歷史訂單嗎？")) {
        history = [];
        // 清除本地儲存
        localStorage.setItem("foodie_history", JSON.stringify(history));
      }
    }

    // 單筆刪除 (垃圾桶)
    let listY = 80;
    for (let i = 0; i < history.length; i++) {
      let y = listY + i * 85;
      // 判定點擊範圍 (垃圾桶周圍)
      if (mouseY > y + 10 && mouseY < y + 50 && mouseX > width - 50) {
        if (confirm("確定要刪除這筆訂單嗎？")) {
          history.splice(history.length - 1 - i, 1);
          // 更新本地儲存
          localStorage.setItem("foodie_history", JSON.stringify(history));
        }
        break;
      }
    }
  }
}

// =====================
// 工具函式
// =====================
function startSwipe(dir) {
  swipeDir = dir;
  animating = true;
}

function nextCard() {
  index++;
  resetCard();
}

function resetCard() {
  x = width / 2;
  y = height / 2;
}

// =====================
// 教學動畫
// =====================
function drawTutorial() {
  push();
  // 1. 半透明遮罩 (降低背景干擾)
  fill(0, 100);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height);

  // 2. 動畫時間計算 (3秒循環)
  let t = millis() % 3000; 
  let cx = width / 2;
  let cy = height / 2 + 100; // 手的位置在卡片下方
  let handX = cx;
  let alpha = 0;

  // 3. 動畫邏輯
  if (t < 1500) {
    // --- 階段一：向右滑 (LIKE) 0~1.5s ---
    let p = map(t, 200, 1200, 0, 1, true);
    let ease = easeInOutCubic(p);
    handX = lerp(cx, cx + 120, ease);
    
    // 淡入淡出
    if (t < 300) alpha = map(t, 0, 300, 0, 255);
    else if (t > 1200) alpha = map(t, 1200, 1400, 255, 0);
    else alpha = 255;

    if (alpha > 50) {
      fill(0, 255, 0, alpha);
      textSize(32);
      textAlign(CENTER);
      text("LIKE", cx + 80, cy - 60);
    }
  } else {
    // --- 階段二：向左滑 (SKIP) 1.5~3.0s ---
    let p = map(t, 1700, 2700, 0, 1, true);
    let ease = easeInOutCubic(p);
    handX = lerp(cx, cx - 120, ease);

    if (t < 1800) alpha = map(t, 1500, 1800, 0, 255);
    else if (t > 2700) alpha = map(t, 2700, 2900, 255, 0);
    else alpha = 255;

    if (alpha > 50) {
      fill(255, 0, 0, alpha);
      textSize(32);
      textAlign(CENTER);
      text("SKIP", cx - 80, cy - 60);
    }
  }

  // 4. 繪製手勢圖示 (扁平風格)
  translate(handX, cy);
  noStroke();
  fill(255, alpha * 0.6); // 約 60% 透明度
  
  // 指尖
  ellipse(0, 0, 40); 
  
  // 手指身體
  rotate(-PI / 6);
  rectMode(CENTER);
  rect(0, 25, 26, 50, 13);
  pop();
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// =====================
// 打勾動畫輔助函式
// =====================
function drawCheckmarkAnimation(x, y, t) {
  push();
  translate(x, y);

  // 1. 綠色圓圈彈出 (0 ~ 0.5s)
  let scaleVal = 0;
  if (t < 0.5) {
    let p = t / 0.5;
    // Back Out Easing
    let c1 = 1.70158;
    let c3 = c1 + 1;
    scaleVal = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  } else {
    scaleVal = 1;
  }

  scale(scaleVal);
  fill(0, 180, 0);
  noStroke();
  ellipse(0, 0, 120, 120);

  // 2. 白色勾勾繪製 (0.3s ~ 0.8s)
  if (t > 0.3) {
    let p = constrain((t - 0.3) / 0.5, 0, 1);
    
    noFill();
    stroke(255);
    strokeWeight(10);
    strokeCap(ROUND);
    strokeJoin(ROUND);

    beginShape();
    // 勾勾的三個點 (相對於圓心)
    let v1 = {x: -25, y: 5};
    let v2 = {x: -5, y: 25};
    let v3 = {x: 35, y: -30};

    // 分段繪製
    if (p < 0.4) {
      let segP = map(p, 0, 0.4, 0, 1);
      vertex(v1.x, v1.y);
      vertex(lerp(v1.x, v2.x, segP), lerp(v1.y, v2.y, segP));
    } else {
      let segP = map(p, 0.4, 1, 0, 1);
      vertex(v1.x, v1.y);
      vertex(v2.x, v2.y);
      vertex(lerp(v2.x, v3.x, segP), lerp(v2.y, v3.y, segP));
    }
    endShape();
  }

  // 3. 文字顯示 (0.6s ~ )
  if (t > 0.6) {
    let alpha = map(t, 0.6, 0.8, 0, 255);
    fill(255, alpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("付款成功", 0, 85);
  }

  pop();
}
