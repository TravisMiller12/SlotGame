/*
    Hello and welcome to your 1 523'rd work assignment!

    Today we are going to make a 3 reel slot that starts, spins and stops.
    And if we are lucky enough to land the same symbol on all 3 reels, we win! WOHO!

    * Reels should start, spin and stop on random positions/symbols
    * If all 3 reels stops on the same symbol, play a win celebration.
    * You can use the WinsweepBox[00-25] sequence for win animation.
    * All available symbols can be found within assets.json

    The assignment will be judged with the following points in mind:
    * Creativity
    * Structure
    * Complexity
    * Look'n'feel

    Spritesheets can be created from https://www.codeandweb.com/tp-online
    Example on how to get started with sprites can be found in the run() method.

    If you have any questions, feel free to contact us at devlead@jaderabbitstudio.com
*/



////////////////



const app = new PIXI.Application({
  width: 750,
  height: 675,
  backgroundColor: 0x1099bb,
  antialias: true,
  transparent: false,
  resolution: 1,
});

const symbolMatrix = [
  ["Coin.png", "High1.png", "High1.png", "High1.png", "High1.png", "Low1.png", "High1.png", "Low4.png", "High4.png", "Low2.png", "Low3.png"],
  ["High3.png", "High1.png", "High1.png", "Coin.png", "High1.png", "Low4.png", "High1.png", "High1.png", "High1.png", "High1.png", "High1.png"],
  ["Low4.png", "High1.png", "High1.png", "High1.png", "High1.png", "High1.png", "High1.png", "High1.png", "High1.png", "Wild.png", "Low2.png"]
];
/*
const symbolMatrix = [
  ["Coin.png", "High1.png", "Wild.png", "Bonus.png", "High2.png", "Low1.png", "High3.png", "Low4.png", "High4.png", "Low2.png", "Low3.png"],
  ["High3.png", "High4.png", "Bonus.png", "Coin.png", "Low2.png", "Low4.png", "High1.png", "Wild.png", "Low1.png", "High2.png", "Low3.png"],
  ["Low4.png", "High2.png", "Low1.png", "Bonus.png", "High1.png", "Coin.png", "High4.png", "Low3.png", "High3.png", "Wild.png", "Low2.png"]
];
*/

const offset = 0.5;

window.addEventListener("load", async () => {
  await loadAssets();
  document.body.appendChild(app.view);
  await setupReels();
  setupSpinButton(); // Call the function to set up the spin button
});

async function loadAssets() {
  const assetPromises = [];
  assetPromises.push(PIXI.Assets.load("assets.json"));
  await Promise.all(assetPromises);
}

async function setupReels() {
  const symbolHeight = 225; // Adjust this value based on your sprite dimensions
  const symbolWidth = 250; // Adjust this value based on your sprite dimensions

  const symbolScale = Math.min(
    app.screen.width / (3 * symbolWidth),
    app.screen.height / (3 * symbolHeight)
  );

  // Calculate total height occupied by symbols
  const totalSymbolHeight = symbolMatrix[0].length * symbolHeight; // Assuming all reels have the same number of symbols

  // Calculate initial Y position with padding
  const availableVerticalSpace = app.screen.height;
  const initialYPosition = symbolHeight * offset;
  
  // Create and position sprites based on predefined symbol order
  for (let j = 0; j < 3; j++) {
    const xPosition = (app.screen.width / 3) * (j + 0.5); // Adjust spacing between reels
    const symbols = symbolMatrix[j];
    for (let i = 0; i < symbols.length; i++) {
      const yPosition = initialYPosition + i * symbolHeight;
      const texture = PIXI.Texture.from(symbols[i]);
      const symbolSprite = new PIXI.Sprite(texture);
      symbolSprite.scale.set(1); // No scaling
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
    startSpin(); // Call startSpin() function when the button is clicked
  });
}

async function startSpin() {
  const symbolHeight = 225; // Adjust this value based on your sprite dimensions
  const spinAnimationDuration = 3000; // Adjust the spinning duration as needed
  const spinDelay = 500; // Adjust the delay before starting each reel's spinning animation

  // Start spinning all reels simultaneously
  const spinningPromises = [];
  for (let i = 0; i < 3; i++) {
    spinningPromises.push(spinReel(i, symbolHeight, spinAnimationDuration, spinDelay * i)); // Introduce delay for starting each reel's spinning animation
  }

  await Promise.all(spinningPromises); // Wait for all reels to finish spinning

  // After spinning animation completes, check if three symbols match on the middle row
  //checkForMatch();
  check();
}

async function spinReel(reelIndex, symbolHeight, spinAnimationDuration, startDelay) {
  await new Promise(resolve => setTimeout(resolve, startDelay)); // Delay before starting the spinning animation for this reel

  const reelSprites = app.stage.children.filter(
    (child) => child.x === (app.screen.width / 3) * (reelIndex + 0.5)
  );

  const spinDistance = symbolHeight * reelSprites.length; // Total distance to spin
  const spinSpeed = spinDistance / spinAnimationDuration; // Speed to cover the distance in the given time

  const startTime = Date.now();
  let currentTime = Date.now();
  while (currentTime - startTime < spinAnimationDuration) {
    currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const deltaY = spinSpeed * elapsedTime; // Calculate distance to move based on elapsed time
    reelSprites.forEach((sprite) => {
      sprite.y += deltaY; // Move each symbol downwards
    });

    // Check if any symbols are off the window and adjust their positions
    reelSprites.forEach((sprite) => {
      if (sprite.y > app.screen.height + symbolHeight) {
        // Move the symbol back up to the top and adjust its position
        sprite.y = sprite.y - reelSprites.length * symbolHeight;
      }
    });

    await new Promise((resolve) => requestAnimationFrame(resolve)); // Pause briefly before updating position
  }

  // Calculate the final position to ensure symbols are aligned correctly without being cut off
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

function check (){
  let sym1 = 0;
  let sym2 = 0;
  let sym3 = 0;
  for (let i=0; i < matches.length; i++){
    for(let j=0; j < matches[i].length; j++ ){
      for(let k=0; k < matches[i][j].length; k++){
        if(matches[i][j][k] == 1 && reels[i][j][k] == 1){
          sym1++;
          if(sym1 == 3){
            sym1 = 0;
            console.log("It's a match!");
            return 0;
          }
        }
        if(matches[i][j][k] == 1 && reels[i][j][k] == 2){
          sym2++;
          if(sym2 == 3){
            sym2 = 0;
            console.log("It's a match!");
            return 0;
          }
        }
        if(matches[i][j][k] == 1 && reels[i][j][k] == 3){
          sym3++;
          if(sym3 == 3){
            sym3 = 0;
            console.log("It's a match!");
            return 0;
          }
        }
      }

    }
    sym1 = 0;
    sym2 = 0;
    sym3 = 0;
  }
}

check();




/*
function checkForMatch() {
  console.log("Checking for match...");

  // Count occurrences of each symbol on the visible stage
  const symbolCounts = {};
  const visibleBounds = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
  app.stage.children.forEach((symbol) => {
    if (visibleBounds.contains(symbol.x, symbol.y)) {
      const symbolName = symbol.texture.textureCacheIds[0];
      if (!symbolCounts[symbolName]) {
        symbolCounts[symbolName] = 1;
      } else {
        symbolCounts[symbolName]++;
      }
    }
  });

  // Check if any symbol occurs three times
  let winSymbol = null;
  for (const symbolName in symbolCounts) {
    if (symbolCounts.hasOwnProperty(symbolName) && symbolCounts[symbolName] >= 3) {
      winSymbol = symbolName;
      break;
    }
  }

  // If a win symbol is found, log "Win Win Win!"
  if (winSymbol) {
    console.log(`Win Win Win! Symbol: ${winSymbol}`);
  } else {
    console.log("No match found.");
  }
}
*/
