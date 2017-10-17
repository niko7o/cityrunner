(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var PLAYERNAME = prompt('What is your name');

// if(canPlay == false){
//   while(PLAYERNAME.length > 10){
//     canPlay == false;
//     PLAYERNAME = prompt('Sorry, use a 10 letter nickname or shorter.');
//     if(PLAYERNAME.length < 10){
//       canPlay = true;
//       break;
//     }
//   }
// }

var canvas = document.getElementById("game"),
  ctx = canvas.getContext("2d"),
  width = 320,
  height = 200,
  player = {
    x: 30,
    y: height - 15,
    width: 30,
    height: 30,
    speed: 3,
    velX: 0,
    velocityY: 0,
    jumping: false,
    grounded: false,
    score: 0,
  },
  keys = [],
  friction = 0.68,
  gravity = 0.25;

var boxes = [];
var skyscraper = [];
var number = 1;
//var bg = new Image();

skyscraper.push({
  x: width * random(1, 3),
  y: 500 - randomHeight(10, 40),
  width: 20,
  height: 40,
});

boxes.push({
  x: 0,
  y: height - 0.1,
  width: width,
  height: 0
});

canvas.width = width;
canvas.height = height;

function random(min, max) {
  number = Math.random() * (max - min) + min;
  console.log('Incoming block: ' + number);
  return number;
}

function boundaries() {
  if (player.x <= 0) {
    player.x = 0;
  }
  if (player.x + player.width >= canvas.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y >= height - player.height) {
    player.y = height - player.height;
  }
}

function randomHeight(min, max) {
  h = Math.random() * (max - min) + min;
  console.log('Skyscraper height: ' + h);
  return h;
}

function drawUpperTexts() {
  ctx.fill();
  ctx.fillStyle = "#a42e2e"; // change color
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.font = "11px sans-serif";
  ctx.fillStyle = "black";
  ctx.fillText(PLAYERNAME + ": " + player.score, 12, 20);
}

function arrows() {
  if (keys[38] || keys[32] || keys[87]) {
    // up arrow or space
    if (!player.jumping && player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.velocityY = -player.speed * 2;
    }
  }
  if (keys[39] || keys[68]) {
    // right arrow
    if (player.velX < player.speed) {
      player.velX++;
    }
  }
  if (keys[37] || keys[65]) {
    // left arrow
    if (player.velX > -player.speed) {
      player.velX--;
    }
  }
  //down arrow
  if (keys[40]) {
    if (player.grounded) {
      player.y = canvas.height - 20;
      player.height = 20;
    } else {
      player.y = canvas.height - 40;
      player.height = 40;
    }
  }
}

function update() {
  arrows();
  boundaries();

  player.grounded = false;
  player.velX *= friction;
  player.velocityY += gravity;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black";
  ctx.beginPath();

  //ctx.drawImage(bg, 0, 0);
  //bg.src = '';

  for (var i = 0; i < boxes.length; i++) {
    ctx.fillStyle = "black";
    ctx.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);

    ctx.fillStyle = "white";
    ctx.fillRect(skyscraper[i].x, skyscraper[i].y, skyscraper[i].width + 10,
      skyscraper[i].height);

    player.score += 1;
    skyscraper[i].x -= 3; // Dino speed

    if (skyscraper[i].x + skyscraper[i].width + 5 <= 0) { // Dino passed, new nbr
      skyscraper[i].x = width * random(1, 3);
      skyscraper[i].y = height - randomHeight(10, 70);
    }

    var dir = collision(player, boxes[i]);
    var dir2 = collision(player, skyscraper[i]);

    if (dir2 === "l" || dir2 === "r") { //dino collision
      player.score = 0;
    } else if (dir2 === "b") {
      player.score = 0;
      player.grounded = true;
      player.jumping = false;
    }

    if (dir === "l" || dir === "r") { //box collision
      player.velX = 0;
      player.jumping = false;
    } else if (dir === "b") {
      player.grounded = true;
      player.jumping = false;
    } else if (dir === "t") {
      player.velocityY *= -1;
    }
  }

  if (player.grounded) {
    player.velocityY = 0;
  }

  player.x += player.velX;
  player.y += player.velocityY;

  drawUpperTexts();
  requestAnimationFrame(update);
}

function collision(shapeA, shapeB) {
  // get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
    vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
    // add the half widths and half heights of the objects
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
    colDirection = null;

  // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
      oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
      if (vY > 0) {
        colDirection = "t";
        shapeA.y += oY;
      } else {
        colDirection = "b";
        shapeA.y -= oY;
      }
    } else {
      if (vX > 0) {
        colDirection = "l";
        shapeA.x += oX;
      } else {
        colDirection = "r";
        shapeA.x -= oX;
      }
    }
  }
  return colDirection;
}

document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;

});

document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});


window.addEventListener("load", function() {
  update();
});
