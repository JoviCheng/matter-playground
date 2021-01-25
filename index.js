const element = document.querySelector(".canvas");
const scoreLabel = document.querySelector(".score");
const width = element.clientWidth;
const height = element.clientHeight;

// module aliases
const {
  Engine,
  Events,
  Render,
  World,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
  Vertices,
} = Matter;

const engine = Engine.create();

engine.timing.timeScale = 1.2;
const render = Render.create({
  element,
  engine,
  options: {
    width,
    height,
    wireframes: false,
    background: "#292d28",
  },
});

// bodies
const s = document.body.clientHeight * 0.055; // base scale of the rendering
const leftOffset = document.body.clientWidth / 2 - s * 4.5;
const topOffset = 2 * s;
// 网格点
const pegs = [];
for (let row = 0; row < 13; row++) {
  const cols = row % 2 ? 7 : 8;
  const offset = row % 2 ? s / 2 : 0;
  const y = topOffset + s * row;
  for (let col = 0; col < cols; col++) {
    const x = leftOffset + s * col + offset;
    pegs.push(
      Bodies.circle(x, y, s / 12, {
        isStatic: true,
        isPegs: true,
        render: { fillStyle: "#CCC" },
      })
    );
  }
}

const leftSidePoints = [0, 0, s / 2, 0, s, s, s / 2, 2 * s, 0, 2 * s];
const leftSides = [],
  rightSides = [];
for (let i = 0; i < 6; i++) {
  // left sides
  leftSides.push(
    Bodies.fromVertices(
      document.body.clientWidth / 2 - s * 5.75,
      s + 2 * s * (i + 1),
      Vertices.fromPath(leftSidePoints.join(" ")),
      {
        render: { fillStyle: "#CCC" },
      }
    )
  );

  // right sides
  rightSides.push(
    Bodies.fromVertices(
      document.body.clientWidth / 2 + s * 3.75,
      s + 2 * s * (i + 1),
      Vertices.fromPath(leftSidePoints.join(" ")),
      {
        render: { fillStyle: "#CCC" },
      }
    )
  );
}

const leftSide = Body.create({
  parts: leftSides,
  isStatic: true,
});
const rightSide = Body.create({
  parts: rightSides,
  isStatic: true,
});
Body.rotate(rightSide, Math.PI);

const bottom = [
  Bodies.rectangle(
    document.body.clientWidth / 2,
    16.2 * s,
    12.28 * s,
    2.5 * s,
    {
      // bottom
      isStatic: true,
      render: { fillStyle: "#CCC" },
    }
  ),
  Bodies.rectangle(
    document.body.clientWidth / 2 - s * 5.89,
    14.5 * s,
    s / 2,
    s,
    {
      // bottom left
      isStatic: true,
      render: { fillStyle: "#CCC" },
    }
  ),
  Bodies.rectangle(
    document.body.clientWidth / 2 + s * 3.89,
    14.5 * s,
    s / 2,
    s,
    {
      // bottom right
      isStatic: true,
      render: { fillStyle: "#CCC" },
    }
  ),
];
for (let i = 0; i < 8; i++) {
  // bottom separators
  bottom.push(
    Bodies.rectangle(leftOffset + s * i, 14.8 * s, s / 15, s / 2, {
      isStatic: true,
      render: { fillStyle: "#CCC" },
    })
  );
}

const sensors = [];
for (let i = 0; i < 9; i++) {
  const sensor = Bodies.rectangle(
    leftOffset - s / 2 + s * i,
    14.6 * s,
    s * 0.8,
    s * 0.7,
    {
      isSensor: true,
      isStatic: true,
      render: { fillStyle: "orange", opacity: 1.0 },
    }
  );
  sensor.__data__ = i;
  sensors.push(sensor);
}

const walls = [
  Bodies.rectangle(width / 2, -1, width, 1, { isStatic: true,render: { fillStyle: "orange"} }), // top
  Bodies.rectangle(-1, height / 2, 1, height, { isStatic: true,render: { fillStyle: "orange" }}), // left
  Bodies.rectangle(width + 1, height / 2, 1, height, { isStatic: true,render: { fillStyle: "orange" }}), // right
  Bodies.rectangle(width / 2, height + 1, width, 1, { isStatic: true,render: { fillStyle: "orange" }}), // bottom
];
const disc = Bodies.circle(
  document.body.clientWidth / 2 - 5.8 * s,
  s * 1.64,
  s * 0.357,
  {
    restitution: 0.9,
    render: {
      fillStyle: "#1497FF",
    },
  }
);

// mouse
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: {
    stiffness: 1,
    render: {
      visible: false,
    },
  },
});
render.mouse = mouse;

// sensor events
Events.on(engine, "collisionStart", function (event) {
  var pairs = event.pairs;
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    if (pair.bodyA.isPegs) {
      console.log("🚀 ~ file: index.js ~ line 191 ~ pair", pair)
      pair.bodyA.render.fillStyle = "red";
      console.log(pair.bodyA.__data__, "was hit!");
      // pickWinner(pair.bodyA.__data__);
      addPoints()
    } else if (pair.bodyB.isPegs) {
      console.log("🚀 ~ file: index.js ~ line 191 ~ pair", pair)
      pair.bodyB.render.fillStyle = "red";
      console.log(pair.bodyB.__data__, "was hit!");
      // pickWinner(pair.bodyB.__data__);
      addPoints()
    }
  }
  // for (let index = 0, length = pairs.length; index != length; index++) {
  //   const pair = pairs[i];
  //   if (pair.bodyA.isPegs) {
  //     pair.bodyA.render.fillStyle = "red";
  //     console.log(pair.bodyA.__data__, "was hit!");
  //     pickWinner(pair.bodyA.__data__);
  //   } else if (pair.bodyB.isPegs) {
  //     pair.bodyB.render.fillStyle = "red";
  //     console.log(pair.bodyB.__data__, "was hit!");
  //     pickWinner(pair.bodyB.__data__);
  //   }
  // }
});

Events.on(engine, "collisionEnd", function (event) {
  var pairs = event.pairs;
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];
    if (pair.bodyA.isSensor) {
      pair.bodyA.render.fillStyle = "orange";
      clearWinner(pair.bodyA.__data__);
    } else if (pair.bodyB.isSensor) {
      pair.bodyB.render.fillStyle = "orange";
      clearWinner(pair.bodyB.__data__);
    }
  }
});

World.add(engine.world, [
  ...pegs,
  leftSide,
  rightSide,
  ...bottom,
  ...sensors,
  disc,
  ...walls,
  mouseConstraint,
]);
Engine.run(engine);
Render.run(render);

// names as HTML since Matter can't render text
// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
const availableNames = shuffle([
  "Asim",
  "Bradley",
  "Brett",
  "Bryan",
  "Chris",
  "Drew",
  "Dom",
  "G",
  "Gregory",
  "Jesse",
  "John",
  "Jordan",
  "Megan",
  "Rich",
  "Tyler",
  "Ytalo",
]);
const names = availableNames.slice(0, 9).map((n, i) => {
  const div = document.createElement("div");
  div.classList.add("name");
  div.style.position = "absolute";
  div.style.left = leftOffset - s * 1.525 + s * i + "px";
  div.style.top = 15.8 * s + "px";
  div.style.height = s * 0.325 + "px";
  div.style.width = 1.6 * s + "px";
  div.style.fontSize = s / 3 + "px";
  div.style.padding = s / 4.5 + "px";
  div.innerHTML = n;
  document.body.append(div);
  return div;
});

function clearWinner(i) {
  names[i].classList.remove("winner");
}
function pickWinner(i) {
  names[i].classList.add("winner");
}

function addPoints(i){
  scoreLabel.innerHTML = String(Number(scoreLabel.innerHTML) + 1)
}
