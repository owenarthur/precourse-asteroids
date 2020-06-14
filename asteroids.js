// canvas and context //

var canvas = document.getElementById("asteroidscanvas");
var ctx = canvas.getContext("2d");

// establishing constants (stashing them up here for easy modification) //

const FPS = 60;
const FRICTION = .5;

const SHIP_ACCELERATION = 5;
const SHIP_TURN_SPEED = 360;

// establishing global variables //

var spaceColor = 'black';
var shipColor = 'white';
var laserColor = 'white';
var asteroidColor = 'gray';

var asteroids = [];
var lasers = [];

var level = {
  1 : {
    asteroidCount : 3
  },
  2 : {
    asteroidCount : 4
  },
  3 : {
    asteroidCount : 5
  }
}

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
      break;
    case 37:
      ship.rotation = SHIP_TURN_SPEED / 180 * Math.PI / FPS;
      break;
    case 38:
      ship.thrusting = true;
      break;
    case 39:
      ship.rotation = -SHIP_TURN_SPEED / 180 * Math.PI / FPS;
      break;
    case 40:
      ship.brakes = true;
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
// a little flame out the back would be preferable! but is time-consuming  //
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

// draws the lasers //

function fireLaser() {
  // push to laser array objects with necessary data: starting x, starting y, x speed, y speed, maybe distance traveled? //
  lasers.push({
    x : ship.x + 1.3 * ship.r * Math.cos(ship.angle),
    y : ship.y - 1.3 * ship.r * Math.sin(ship.angle),
    xv : 500 * Math.cos(ship.angle) / FPS,
    yv : -500 * Math.sin(ship.angle) / FPS,
    distance: 0,
  })
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

function buildAsteroid() {
  // can we randomly generate their shapes, or should we draw five or six and select randomly from them? //
  // push to asteroids array objects with necessary data: starting x, starting y (not too close to ship?), x speed, y speed, direction //
}

function drawAsteroids() {
  // for each asteroid in the asteroids array, draw it //
  // update its position //
    // manage edge cases //
}

function detectAsteroidCollision() {
  // check if laser coordinates are within any asteroid coordinates //
  // render two smaller asteroids, maybe build asteroid takes in a size variable? //
}

function detectShipCollision() {
  // check if ship coordinates are within any asteroid coordinates //
  // draw the explosion of the ship //
}

function gameOver () {
  //end of game screen
}

function levelUp () {
  // when asteroids array is empty, return ship to middle of screen, re-draw asteroids //
}

// the central draw function //
function draw() {
  drawSpace();
  moveShip();
  drawShip();
  drawThrusters();
  drawLasers();

}

// calls the draw function//
setInterval(draw, 1000 / FPS);

