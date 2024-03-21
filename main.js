const app = new PIXI.Application({
  width: 750,
  height: 675,
  backgroundColor: 0x1099bb,
  antialias: true,
  transparent: false,
  resolution: 1,
});




const symbolMatrix = [
  ["Coin.png", "High1.png", "Wild.png", "Bonus.png", "High2.png", "Low1.png", "High3.png", "Low4.png", "High4.png", "Low2.png", "Low3.png"],
  ["High3.png", "High4.png", "Bonus.png", "Coin.png", "Low2.png", "Low4.png", "High1.png", "Wild.png", "Low1.png", "High2.png", "Low3.png"],
  ["Low4.png", "High2.png", "Low1.png", "Bonus.png", "High1.png", "Coin.png", "High4.png", "Low3.png", "High3.png", "Wild.png", "Low2.png"]
];

const offset = 0.5;
let winsweepAnimationFrames;
let winsweepAnimation;

window.addEventListener("load", async () => {
  await loadAssets();
  document.body.appendChild(app.view);
  await setupReels();
  setupSpinButton();
});

async function loadAssets() {
  const assetPromises = [];
  assetPromises.push(PIXI.Assets.load("assets.json"));
  await Promise.all(assetPromises);
}

async function setupReels() {
  const symbolHeight = 225;
  const symbolWidth = 250;
  const symbolScale = Math.min(
    app.screen.width / (3 * symbolWidth),
    app.screen.height / (3 * symbolHeight)
  );

  const totalSymbolHeight = symbolMatrix[0].length * symbolHeight;
  const availableVerticalSpace = app.screen.height;
  const initialYPosition = symbolHeight * offset;
  
  for (let j = 0; j < 3; j++) {
    const xPosition = (app.screen.width / 3) * (j + 0.5);
    const symbols = symbolMatrix[j];
    for (let i = 0; i < symbols.length; i++) {
      const yPosition = initialYPosition + i * symbolHeight;
      const texture = PIXI.Texture.from(symbols[i]);
      const symbolSprite = new PIXI.Sprite(texture);
      symbolSprite.anchor.set(0.5);
      symbolSprite.x = xPosition;
      symbolSprite.y = yPosition;
      app.stage.addChild(symbolSprite);
    }
  }
}

function setupSpinButton() {
  const spinButton = document.getElementById('spinButton');
  spinButton.addEventListener('click', () => {
    startSpin();
  });
}

const visibleBoundsRow1 = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height / 3);
const visibleBoundsRow2 = new PIXI.Rectangle(0, 250, app.screen.width, app.screen.height / 3);
const visibleBoundsRow3 = new PIXI.Rectangle(0, 500, app.screen.width, app.screen.height / 3);

async function startSpin() {
  const symbolHeight = 225;
  const spinAnimationDuration = 3000;
  const spinDelay = 500;

  const spinningPromises = [];
  for (let i = 0; i < 3; i++) {
    spinningPromises.push(spinReel(i, symbolHeight, spinAnimationDuration, spinDelay * i));
  }

  await Promise.all(spinningPromises);

  checkForMatch();
}

async function spinReel(reelIndex, symbolHeight, spinAnimationDuration, startDelay) {
  await new Promise(resolve => setTimeout(resolve, startDelay));

  const reelSprites = app.stage.children.filter(
    (child) => child.x === (app.screen.width / 3) * (reelIndex + 0.5)
  );

  const spinDistance = symbolHeight * reelSprites.length;
  const spinSpeed = spinDistance / spinAnimationDuration;

  const startTime = Date.now();
  let currentTime = Date.now();
  while (currentTime - startTime < spinAnimationDuration) {
    currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const deltaY = spinSpeed * elapsedTime;
    reelSprites.forEach((sprite) => {
      sprite.y += deltaY;
    });

    reelSprites.forEach((sprite) => {
      if (sprite.y > app.screen.height + symbolHeight) {
        sprite.y = sprite.y - reelSprites.length * symbolHeight;
      }
    });

    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  const finalPosition = Math.round(reelSprites[0].y / symbolHeight) * symbolHeight + (symbolHeight / 2);
  const offset = finalPosition - reelSprites[0].y;
  reelSprites.forEach((sprite) => {
    sprite.y += offset;
  });
}

var matches = [
  [
    [1,1,1],
    [0,0,0],
    [0,0,0]
  ],
  [
    [0,0,0],
    [1,1,1],
    [0,0,0]
  ],
  [
    [0,0,0],
    [0,0,0],
    [1,1,1]
  ]
]

var reels = [
  [0,0,0],
  [0,0,0],
  [0,0,0]
];

function init() {
  for(let i =0; i < reels.length; i++){
    for(let j = 0; j < reels.length; j++){
      let box = app.screen;
      box.column = i;
      box.row = j;
    }
  }
}

init();

async function checkForMatch() {
  console.log("Checking for match...");
  let win1 = 0;
  let win2 = 0;
  let win3 = 0;

  const symbols = app.stage.children;

  // Remove existing winbox animated sprites
  app.stage.children.forEach(child => {
    if (child instanceof PIXI.AnimatedSprite && child.animationName === "Winbox") {
      app.stage.removeChild(child);
    }
  });

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const visibleBounds = i === 0 ? visibleBoundsRow1 : i === 1 ? visibleBoundsRow2 : visibleBoundsRow3;

    // Filter symbols within visible bounds
    const symbolsInRow = symbols.filter(symbol => visibleBounds.contains(symbol.x, symbol.y));

    console.log(`Symbols in row ${i + 1}:`, symbolsInRow.map(symbol => symbol.texture.textureCacheIds[0]));

    // Extract the first symbol name from the symbols in the row
    const firstSymbolName = symbolsInRow[0].texture.textureCacheIds[0];

    console.log(`Expected symbol in row ${i + 1}:`, match[i][0]);

    // Check if all symbols in the row match the first symbol
    const isWin = symbolsInRow.every(symbol => symbol.texture.textureCacheIds[0] === firstSymbolName);

    // Increment wins based on the row and log the win
    if (isWin) {
      if (i === 0) win1++;
      else if (i === 1) win2++;
      else if (i === 2) win3++;
      console.log(`Match at row ${i + 1}! All symbols are the same.`);
      
      // Play winbox animations over each winning symbol
      await playWinboxAnimations(symbolsInRow);
    }
  }

  console.log(`Total wins: Row 1 - ${win1}, Row 2 - ${win2}, Row 3 - ${win3}`);
}


async function playWinboxAnimations(winningSymbols) {
  const animationPromises = [];

  winningSymbols.forEach(winningSymbol => {
    const winboxTextureArray = [];
    // Assuming 'WinsweepBox' is the prefix for winbox animation frames
    for (let i = 0; i < 26; i++) {
      const texture = PIXI.Texture.from(`WinsweepBox${i.toString().padStart(2, '0')}.png`);
      winboxTextureArray.push(texture);
    }

    const winboxAnimatedSprite = new PIXI.AnimatedSprite(winboxTextureArray);
    winboxAnimatedSprite.anchor.set(0.5);
    winboxAnimatedSprite.animationSpeed = 0.5;
    winboxAnimatedSprite.loop = false; // Set loop to false
    winboxAnimatedSprite.scale.set(winningSymbol.scale.x + 0.4, winningSymbol.scale.y + 0.4); // Increase scale by 0.4
    winboxAnimatedSprite.position.set(winningSymbol.x, winningSymbol.y); // Position winbox over winning symbol
    winboxAnimatedSprite.animationName = "Winbox"; // Add a custom property to identify winbox animated sprites
    
    // Set blending mode
    winboxAnimatedSprite.blendMode = PIXI.BLEND_MODES.ADD; // Change to the desired blending mode
    
    app.stage.addChild(winboxAnimatedSprite);

    const animationPromise = new Promise(resolve => {
      winboxAnimatedSprite.onComplete = () => {
        app.stage.removeChild(winboxAnimatedSprite); // Remove winbox animation sprite after animation completes
        resolve();
      };
      winboxAnimatedSprite.play(); // Play winbox animation
    });

    animationPromises.push(animationPromise);
  });

  await Promise.all(animationPromises);
}
