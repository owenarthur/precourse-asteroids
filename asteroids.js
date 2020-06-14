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
  x : canvas.width / 2,
  y : canvas.height / 2,
  r : 20 / 2,
  size : 20,
  angle : 90 / 180 * Math.PI,
  rotation: 0,
  thrusting: false,
  brakes: false,
  thrust : {
    x : 0,
    y: 0,
  },
}

var thrusters = {
  r : 256,
  g : 200,
  b : 200,
  a : 0,
}


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
}

function drawLasers() {
  // for each laser in the array, draw it at its x and y position //
    //manage edge of canvas cases//
  // update x and y, and increase its distance variable //
  // if traveled max distance, splice it out of the array //
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

}

// calls the draw function//
setInterval(draw, 1000 / FPS);

