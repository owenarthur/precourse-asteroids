// canvas and context //

var canvas = document.getElementById("asteroidscanvas");
var ctx = canvas.getContext("2d");

document.fonts.load('10pt "Press Start 2P"').then(startGame);


// audio elements //
var thrusterAudio = document.getElementById("thruster");

// establishing constants (stashing them up here for easy modification) //

const FONT_NAME = 'Press Start 2P';

const FPS = 60;
const FRICTION = .5;

const SHIP_ACCELERATION = 5;
const SHIP_TURN_SPEED = 360;

const ASTEROID_TURN_SPEED = 10;
const FIRST_ASTEROID_SIZE = 175;
const SECOND_ASTEROID_SIZE = 125;
const THIRD_ASTEROID_SIZE = 75;

// establishing global variables //

// var gameStates = {
//   start : true,
//   playing : false,
//   paused : false,
//   over : true,
// }

var gameStart = true;
var gamePlaying = false;
var gamePaused = false;
var gameOver = false;
var newGame = false;

var spaceColor = 'black';
var shipColor = 'white';
var laserColor = 'white';
var asteroidColor = 'gray';

var score = 0;
var lives = 3;
var level = 1;
var AsteroidCount = level + 2;

var asteroids = [];
var lasers = [];

var ship = {
  x : canvas.width / 2, // starting x locaiton //
  y : canvas.height / 2, // starting y location //
  size : 20, // arbitrary size //
  r : 20 / 2, // easy variable for half the size //
  angle : 90 / 180 * Math.PI, // tracks angle //
  rotation: 0, // tracks rotation //
  thrusting: false, // if up key is pressed //
  brakes: false, // if down key is pressed //
  thrust : {
    x : 0,
    y: 0,
  }, // controls movement //
}

var thrusters = {
  r : 256,
  g : 200,
  b : 200,
  a : 0,
} // manages slight red of the thrusters //


// establishing keys (space and arrow keys) //

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch(ev.keyCode) {
    case 32:
      fireLaser();
      if (gameStart) {
        gameStart = !gameStart;
        gamePlaying = !gamePlaying;
      }
      if (gameOver) {
        gameOver = !gameOver;
        gamePlaying = !gamePlaying;
      }
      break;
    case 37:
      ship.rotation = SHIP_TURN_SPEED / 180 * Math.PI / FPS;
      break;
    case 38:
      ship.thrusting = true;
      thrusterAudio.play();
      break;
    case 39:
      ship.rotation = -SHIP_TURN_SPEED / 180 * Math.PI / FPS;
      break;
    case 40:
      ship.brakes = true;
      break;
    case 80:
      gamePlaying = !gamePlaying;
      gamePaused = !gamePaused;
      break;
  }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
  switch(ev.keyCode) {
    case 37:
      ship.rotation = 0;
      break;
    case 38:
      ship.thrusting = false;
      setTimeout(resetThrusterAudio, 175);
      break;
    case 39:
      ship.rotation = 0;
      break;
    case 40:
      ship.brakes = false;
      break;
  }
}

// F U N C T I O N S //

// draw the canvas //
function drawSpace() {
  ctx.fillStyle = spaceColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// draws score and lives //
function drawScoreAndLives() {
  ctx.fillStyle = 'white'
  ctx.font = `12px "${FONT_NAME}"`
  ctx.fillText('score: ' + score.pad(7), 100, 25)
  ctx.fillText('lives: ' + lives, 725, 25)
}

// move the ship around the canvas //
function moveShip() {
  ship.angle += ship.rotation;
  if (ship.thrusting) {
    // the ship's thrust variables are calculated with some trigonometry //
    ship.thrust.x += SHIP_ACCELERATION * Math.cos(ship.angle) / FPS;
    ship.thrust.y -= SHIP_ACCELERATION * Math.sin(ship.angle) / FPS;
  } else {
    // calculating some friction //
    ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
    ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
  }
  if(ship.brakes) {
    // i don't believe the original game had brakes, but i like them //
    ship.thrust.x -= (FRICTION + .2) * ship.thrust.x / FPS;
    ship.thrust.y -= (FRICTION + .2) * ship.thrust.y / FPS;
  }
  // these move the ships by the calculated amounts //
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;
  // these handle the ship exiting the canvas //
  if (ship.x > canvas.width) {
    ship.x -= canvas.width;
  }
  if (ship.x < 0) {
    ship.x += canvas.width;
  }
  if (ship.y > canvas.height) {
    ship.y -= canvas.height;
  }
  if (ship.y < 0) {
    ship.y += canvas.height;
  }
}

// this headache of a function draws the ship itself //
function drawShip() {
  ctx.strokeStyle = shipColor;
  ctx.lineWidth = ship.size / 20;
  ctx.beginPath();
  ctx.moveTo(
    ship.x + 1.3 * ship.r * Math.cos(ship.angle),
    ship.y - 1.3 * ship.r * Math.sin(ship.angle)
  );
  ctx.lineTo( // rear left //
    ship.x - ship.r * (Math.cos(ship.angle) + Math.sin(ship.angle)),
    ship.y + ship.r * (Math.sin(ship.angle) - Math.cos(ship.angle))
  );
  ctx.lineTo( // boosters indent //
    ship.x - .3 * ship.r * Math.cos(ship.angle),
    ship.y + .3 * ship.r * Math.sin(ship.angle)
  );
  ctx.lineTo( // rear right //
    ship.x - ship.r * (Math.cos(ship.angle) - Math.sin(ship.angle)),
    ship.y + ship.r * (Math.sin(ship.angle) + Math.cos(ship.angle))
  );
  ctx.closePath();
  ctx.stroke();
}

// this draws the thrusters (some experimental color changes have been commented out) //
// a little flame out the back would be preferable! but the trig for drawing is c h a l l e n g i n g  //
function drawThrusters() {
  if (ship.thrusting) {
    if (thrusters.a < 1) {
      thrusters.a += .05;
    }
    // if (thrusters.a >= 1) {
    //   thrusters.g -= 2;
    //   thrusters.b -= 2;
    // }
  } else {
    if (thrusters.a > 0) {
      thrusters.a -= .05;
    }
    // if (thrusters.g < 256) {
    //   thrusters.g += 5;
    // }
    // if (thrusters.b < 256) {
    //   thrusters.b += 5;
    // }
  }
  if (thrusters.a === 0) {
    return;
  }
    var thrustersColor = "rgb(" + thrusters.r + "," + thrusters.g + "," + thrusters.b + "," + thrusters.a + ")";
    ctx.strokeStyle = thrustersColor;
    ctx.lineWidth = ship.size / 10;
    ctx.beginPath();
    ctx.moveTo( // rear left //
      ship.x - 1.2 * (ship.r * (Math.cos(ship.angle) + Math.sin(ship.angle))),
      ship.y + 1.2 * (ship.r * (Math.sin(ship.angle) - Math.cos(ship.angle)))
    );
    ctx.lineTo( // boosters //
      ship.x - 1 / 3 * ship.r * Math.cos(ship.angle),
      ship.y + 1 / 3 * ship.r * Math.sin(ship.angle)
    );
    ctx.lineTo( // rear right //
      ship.x - 1.2 * ship.r * (Math.cos(ship.angle) - Math.sin(ship.angle)),
      ship.y + 1.2 * ship.r * (Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    // ctx.closePath();
    ctx.stroke();
}

// toggles thruster audio

function resetThrusterAudio() {
    thrusterAudio.pause();
    thrusterAudio.currentTime = 0;
}



// draws the lasers //

function fireLaser() {
  // push to laser array objects with necessary data: starting x, starting y, x speed, y speed, and distance traveled //
  lasers.push({
    x : ship.x + 1.3 * ship.r * Math.cos(ship.angle),
    y : ship.y - 1.3 * ship.r * Math.sin(ship.angle),
    xv : 500 * Math.cos(ship.angle) / FPS,
    yv : -500 * Math.sin(ship.angle) / FPS,
    distance: 0,
  })
  // create new instance of laser sound and play
  var pew = new Audio('assets/pew.m4a');
  pew.play();
}

function drawLasers() {
  lasers.forEach((currentLaser) => {
    // for each laser in the array, draw it at its x and y position //
    ctx.fillStyle = laserColor;
    ctx.beginPath();
    ctx.arc(currentLaser.x, currentLaser.y, ship.size / 15, 0, Math.PI * 2, false);
    ctx.fill();
    // update x and y //
    currentLaser.x += currentLaser.xv;
    currentLaser.y += currentLaser.yv;
    // updates distance and dissolves laser //
    currentLaser.distance += 1;
    if (currentLaser.distance > 65) {
      lasers.splice(currentLaser, 1)
    }
    // handles edge of canvas //
    if (currentLaser.x > canvas.width) {
      currentLaser.x -= canvas.width;
    }
    if (currentLaser.x < 0) {
      currentLaser.x += canvas.width;
    }
    if (currentLaser.y > canvas.height) {
      currentLaser.y -= canvas.height;
    }
    if (currentLaser.y < 0) {
      currentLaser.y += canvas.height;
    }
  })
}

// asteroids //

function buildAsteroids(x, y, count, size) {

  // places the initial asteroids away from the ship //
  for (let i = 0; i < count; i++) {
    if (size === FIRST_ASTEROID_SIZE) {
      do {
        x = Math.floor(Math.random() * canvas.width);
        y = Math.floor(Math.random() * canvas.height);
      } while (distanceBetweenPoints(ship.x, ship.y, x, y) < 100);
    }
    // rotates the asteroid a varied amount //
    let randomizedTurnSpeedMultiplier = Math.random() < 0.5 ? -1 : 1;
    let randomizedTurnSpeed = randomizedTurnSpeedMultiplier * Math.floor(Math.random() * (10 - 1) + 1)
    // pushes an asteroid to the array //
    asteroids.push({
      x : x,
      y : y,
      xv: Math.random() * 75 / FPS * (Math.random() < 0.5 ? 1 : -1),
      yv: Math.random() * 75 / FPS * (Math.random() < 0.5 ? 1 : -1),
      size: size,
      r : size / 2.5,
      rotation : ASTEROID_TURN_SPEED / 180 * Math.PI / FPS,
      anglev: 1,
      randomScalars : [...Array(16)].map(() => Math.random())
    })
  }
}

function moveAsteroids() {
  // moves and rotates each asteroid the calculated amount //
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].x += asteroids[i].xv;
    asteroids[i].y += asteroids[i].yv;
    asteroids[i].angle += asteroids[i].rotation;

    if (asteroids[i].x > canvas.width) {
      asteroids[i].x -= canvas.width;
    }
    if (asteroids[i].x < 0) {
      asteroids[i].x += canvas.width;
    }
    if (asteroids[i].y > canvas.height) {
      asteroids[i].y -= canvas.height;
    }
    if (asteroids[i].y < 0) {
      asteroids[i].y += canvas.height;
    }
  }
}

function drawAsteroids() {
  ctx.strokeStyle = asteroidColor;
  ctx.lineWidth = ship.size / 15;
  for (let i = 0; i < asteroids.length; i++) {
    var x = asteroids[i].x;
    var y = asteroids[i].y;
    var r = asteroids[i].r;
    var pi = Math.PI;
    var scalars = asteroids[i].randomScalars;

    ctx.beginPath();
    ctx.moveTo(
      x + r * Math.cos(0) - (r * scalars[0]),
      y + r * Math.sin(0) - (r * scalars[0])
    );
    ctx.lineTo(
      x + r * Math.cos(pi / 6) - (r * scalars[1]),
      y + r * Math.sin(pi / 6) - (r * scalars[1])
    );
    ctx.lineTo(
      x + r * Math.cos(pi / 4) - (r * scalars[2]),
      y + r * Math.sin(pi / 4) - (r * scalars[2])
    );
    ctx.lineTo(
      x + r * Math.cos(pi / 3) - (r * scalars[3]),
      y + r * Math.sin(pi / 3) - (r * scalars[3])
    );


    ctx.lineTo(
      x + r * Math.cos(pi / 2) - (r * scalars[4]),
      y + r * Math.sin(pi / 2) - (r * scalars[4])
    );
    ctx.lineTo(
      x + r * Math.cos((2 * pi) / 3) - (r * scalars[5]),
      y + r * Math.sin((2 * pi) / 3) - (r * scalars[5])
    );
    ctx.lineTo(
      x + r * Math.cos((3 * pi) / 4) - (r * scalars[6]),
      y + r * Math.sin((3 * pi) / 4) - (r * scalars[6])
    );
    ctx.lineTo(
      x + r * Math.cos((5 * pi) / 6) - (r * scalars[7]),
      y + r * Math.sin((5 * pi) / 6) - (r * scalars[7])
    );


    ctx.lineTo(
      x + r * Math.cos(pi) - (r * scalars[8]),
      y + r * Math.sin(pi) - (r * scalars[8])
    );
    ctx.lineTo(
      x + r * Math.cos((7 * pi) / 6) - (r * scalars[9]),
      y + r * Math.sin((7 * pi) / 6) - (r * scalars[9])
    );
    ctx.lineTo(
      x + r * Math.cos((5 * pi) / 4) - (r * scalars[10]),
      y + r * Math.sin((5 * pi) / 4) - (r * scalars[10])
    );
    ctx.lineTo(
      x + r * Math.cos((4 * pi) / 3) - (r * scalars[11]),
      y + r * Math.sin((4 * pi) / 3) - (r * scalars[11])
    );

    ctx.lineTo(
      x + r * Math.cos((3 * pi) / 2) - (r * scalars[12]),
      y + r * Math.sin((3 * pi) / 2) - (r * scalars[12])
    );
    ctx.lineTo(
      x + r * Math.cos((5 * pi) / 3) - (r * scalars[13]),
      y + r * Math.sin((5 * pi) / 3) - (r * scalars[13])
    );
    ctx.lineTo(
      x + r * Math.cos((7 * pi) / 4) - (r * scalars[14]),
      y + r * Math.sin((7 * pi) / 4) - (r * scalars[14])
    );
    ctx.lineTo(
      x + r * Math.cos((11 * pi) / 6) - (r * scalars[15]),
      y + r * Math.sin((11 * pi) / 6) - (r * scalars[15])
    );

    ctx.closePath();
    ctx.stroke();
  }
}

function detonateAsteroid(x, y) {
  // reduces big asteroid to medium //
  buildAsteroids(x, y, 2, SECOND_ASTEROID_SIZE)
}

function doubleDetonateAsteroid(x, y) {
  // reduces medium to small //
  buildAsteroids(x, y, 2, THIRD_ASTEROID_SIZE)
}

function detectAsteroidCollision() {
  // checks each laser to see if it is within asteroid.r of the asteroid //
  // if so, either detonates or removes the asteroid //
  for (let i = 0; i < lasers.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      if (distanceBetweenPoints(lasers[i].x, lasers[i].y, asteroids[j].x, asteroids[j].y) < asteroids[j].r) {
        if (asteroids[j].size === FIRST_ASTEROID_SIZE) {
          score += 10;
          detonateAsteroid(asteroids[j].x, asteroids[j].y);
        }
        if (asteroids[j].size === SECOND_ASTEROID_SIZE) {
          score += 25;
          doubleDetonateAsteroid(asteroids[j].x, asteroids[j].y);
        }
        if (asteroids[j].size === THIRD_ASTEROID_SIZE) {
          score += 50;
        }
        asteroids.splice(j, 1);
        lasers.splice(i, 1);
      }
    }
  }
}

function detectShipCollision() {
  // checks to see if the ship is touching an asteroid //
  for (let i = 0; i < asteroids.length; i++) {
    if (distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
      loseALife();
    }
  }
}

function resetShipPosition() {
  // resets the ship's movement variables //
  ship.x = canvas.width / 2;
  ship.y = canvas.height / 2;
  ship.angle = 90 / 180 * Math.PI;
  ship.rotation = 0;
  ship.thrusting = false;
  ship.brakes = false;
  ship.thrust.x = 0;
  ship.thrust.y = 0;
}

function loseALife() {
  // resets the ship and deducts a life //
  lives --;
  if (lives === 0) {
    gameOver = true;
    newGame = true;
  }
  resetShipPosition();
}

function levelUp () {
  // manages level change functionality //
  level++;
  score += 500;
  resetShipPosition();
  AsteroidCount++;
  buildAsteroids(0, 0, AsteroidCount, FIRST_ASTEROID_SIZE)
}

// utility functions //

// pads a number with set number of zeros //
Number.prototype.pad = function(size) {
  let s = String(this);
  while (s.length < (size || 10)) {s = "0" + s;}
  return s;
};

// calculates distance between points //
function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// game states //

function startGame() {
  ctx.fillStyle = spaceColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `36px "${FONT_NAME}"`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('welcome to asteroids', 400, 300);
  ctx.font = `24px "${FONT_NAME}"`
  ctx.fillText('arrows to move', 400, 400);
  ctx.fillText('space to fire', 400, 450);
  setInterval(function() {
    ctx.fillStyle = spaceColor;
  }, 50)
  ctx.fillText('p to pause space to start', 400, 500)
}

function pauseGame() {
  if (gamePaused) {
    ctx.font = `48px "${FONT_NAME}"`;
    ctx.fillStyle = 'white'
    ctx.fillText('paused', 400, 350)
  }
  if (!gamePaused) {
    gamePlaying = true;
    loop();
  }
}

// ends the game //
function endGame () {
  gamePlaying = false;
  ctx.fillStyle = spaceColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `48px "${FONT_NAME}"`;
  ctx.fillStyle = 'white'
  ctx.fillText('game over', 400, 350)
  ctx.font = `24px "${FONT_NAME}"`;
  ctx.fillText('space to relaunch', 400, 450);
  resetStats();
}

function resetStats() {
  score = 0;
  lives = 3;
  level = 1;
  AsteroidCount = level + 2;
  resetShipPosition();
  asteroids = [];
  lasers = [];
  buildAsteroids(10, 10, AsteroidCount, FIRST_ASTEROID_SIZE);
  newGame = !newGame;
}


buildAsteroids(10, 10, AsteroidCount, FIRST_ASTEROID_SIZE);

// the central draw function //
function draw() {
  if (asteroids.length === 0) {
    levelUp();
  }
  drawSpace();
  drawScoreAndLives();
  moveShip();
  drawShip();
  drawThrusters();
  drawLasers();
  moveAsteroids();
  drawAsteroids();
  detectShipCollision();
  detectAsteroidCollision();
  if (gameOver) {
    endGame();
  }
}

// calls the draw function//
function loop() {
  if (gameStart) {
    startGame();
  }
  if (gamePaused) {
    pauseGame();
  }
  if (gamePlaying) {
    if (newGame) {
      resetStats();
    }
    draw();
  }
  if (gameOver) {
    endGame();
  }
}
function call() {
  setInterval(loop, 1000 / FPS);
}

 call();