// [i][j] = [8i+j]
// i = floor(I/8)
// j = I % 8

// const P=1,p=-1,N=2,n=-2,B=3,b=-3,R=4,r=-4,Q=5,q=-5,K=6,k=-6;

const turn_ = 64,
      shortCastle_ = 66, //(-1 for scb, +1 for scw)
      longCastle_ = 67, //(-1 for lcb, +1 for lcw)
      lastMove_ = 69,
      moveScore_ = 70,  
      frontOfPawn_ = 71,
      prevMove_ = 72,
      enPassant_ = 73,
      kingSafe_ = 74,
      pieceCount_ = 75,
      kingPosW_ = 76,
      kingPosB_ = 77,
      pawnStructureW_ = 78,
      pawnStructureB_ = 86,
      eval_ = 94;

let pos = [
  -4, -2, -3, 0, -6, -3, -2, -4, //board
  -1, -1, -1, -1, -1, -1, -1, -1,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1,
  4, 2, 3, 5, 6, 3, 2, 4, 
  1, //turn (w=1, b=-1) #64
  true, true, true, true, //castle data (scb,lcb,scw,lcw) #65-68
  false, //lastMove #69
  0, //moveScore #71
  false, //frontOfPawn #72
  false, //prevMove #73
  false, //enPassant #74
  true, //kingSafe #75
  98.4, //pieceCount #76
  60, 4, //kingPos #77-78
  0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure white #79-86
  0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure black #87-94
  0 //eval #95
];

// let pos = [
//   0, 0, 0, 0, 0, 0, 0, 0, //board
//   0, 0, 0, -6, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 6, 5, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   1, //turn (w=1, b=-1) #64
//   false, false, false, false, //castle data (scb,lcb,scw,lcw) #65-68
//   false, //lastMove #69
//   0, //moveScore #71
//   false, //frontOfPawn #72
//   false, //prevMove #73
//   false, //enPassant #74
//   true, //kingSafe #75
//   98.4, //pieceCount #76
//   60, 4, //kingPos #77-78
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure white #79-86
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure black #87-94
//   0 //eval #95
// ];

// let pos = [
//   0, 0, 0, 0, 0, 0, 0, 0, //board
//   0, -1, 0, 0, 0, 0, 0, 0,
//   -1, 0, -1, 0, 0, -6, -1, 0,
//   0, 0, 1, 0, -1, 0, 0, -1,
//   0, 1, 0, 0, 1, 1, 0, 1,
//   1, 0, 0, 0, 0, 6, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   1, //turn (w=1, b=-1) #64
//   false, false, false, false, //castle data (scb,lcb,scw,lcw) #65-68
//   false, //lastMove #69
//   0, //moveScore #71
//   false, //frontOfPawn #72
//   false, //prevMove #73
//   false, //enPassant #74
//   true, //kingSafe #75
//   98.4, //pieceCount #76
//   60, 4, //kingPos #77-78
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure white #79-86
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure black #87-94
//   0 //eval #95
// ];

// let pos = [
//   -4, -2, 0, -5, -6, -3, 0, -4, //board
//   -1, -1, -1, 0, 0, -1, 0, 0,
//   0, 0, 0, 0, -3, 0, -1, -2,
//   0, 0, 0, 0, 5, 0, 0, 0,
//   0, 0, 3, 0, -1, 0, 0, 0,
//   0, 0, 0, 0, 0, 0, 0, 0,
//   1, 1, 1, 1, 0, 1, 1, 1,
//   4, 2, 3, 0, 6, 0, 0, 4,
//   1, //turn (w=1, b=-1) #64
//   true, true, true, true, //castle data (scb,lcb,scw,lcw) #65-68
//   false, //lastMove #69
//   false, //lastCapture #71
//   false, //frontOfPawn #72
//   false, //prevMove #73
//   false, //enPassant #74
//   true, //kingSafe #75
//   98.4, //pieceCount #76
//   60, 4, //kingPos #77-78
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure white #79-86
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure black #87-94
//   0 //eval #95
// ];

// let pos = [
//   -4, 0, 0, 0, -6, 0, 0, -4, //board
//   -1, 0, -1, -1, -5, -1, -3, 0,
//   -3, -2, 0, 0, -1, -2, -1, 0,
//   0, 0, 0, 1, 2, 0, 0, 0,
//   0, -1, 0, 0, 1, 0, 0, 0,
//   0, 0, 2, 0, 0, 5, 0, -1,
//   1, 1, 1, 3, 3, 1, 1, 1,
//   4, 0, 0, 0, 6, 0, 0, 4,
//   1, //turn (w=1, b=-1) #64
//   true, true, true, true, //castle data (scb,lcb,scw,lcw) #65-68
//   false, //lastMove #69
//   false, //lastCapture #71
//   false, //frontOfPawn #72
//   false, //prevMove #73
//   false, //enPassant #74
//   true, //kingSafe #75
//   98.4, //pieceCount #76
//   60, 4, //kingPos #77-78
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure white #79-86
//   0, 0, 0, 0, 0, 0, 0, 0, //pawnStructure black #87-94
//   0 //eval #95
// ];

let board,
  piecesCanvas,
  lastPos,
  tile = [],
  legalMoves,
  flip = 1,
  lastMove;

const modesList = {
  Turbo: [
    new Mode(3, true, Infinity, Infinity, 58),
    new Mode(4, false, Infinity, Infinity, 34),
    new Mode(5, false, Infinity, Infinity),
  ],
  Standard: [
    new Mode(4, true, Infinity, Infinity, 58),
    new Mode(5, false, Infinity, Infinity, 34),
    new Mode(6, false, Infinity, Infinity),
  ],
  Advanced: [
    new Mode(5, true, Infinity, Infinity, 58),
    new Mode(6, false, Infinity, Infinity, 34),
    new Mode(7, false, Infinity, Infinity),
  ],
  Expert: [
    new Mode(6, true, Infinity, Infinity, 58),
    new Mode(7, false, Infinity, Infinity, 34),
    new Mode(8, false, Infinity, Infinity),
  ]
}

let mode = 0;
let modes = modesList.Standard;

//  ~~~CLASSICAL (LIKE V1.1)~~~
// const modes = [
//   new Mode(2, true, 100000, 250000, 58),
//   new Mode(3, true, 100000, 250000),
// ];

const direction = {
  n: [
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
  ],
  b: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
  r: [
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ],
  k: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ],
};

const pointStages = {
    early: [10, 9, 4, 3.6, 3.5, 1, 0, -1, -3.5, -3.6, -4, -9, -10],
    late: [10, 9, 5, 3.1, 3, 1, 0, -1, -3, -3.1, -5, -9, -10],
  };
let pts;

let Text,
  newText = "",
  textTurn,
  img;

let modeButton,
    whiteButton,
    whitePlays = false,
    blackButton,
    blackPlays = false;

var depth,
  numPosEvaluated,
  timeList = [],
  moveCount = 0;

const bestSquares = [
  // WHITE KING
  [-30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, -20, -20, 0, 20, 20,
    20, 30, 10, -10, 0, -10, 30, 20],
  // WHITE QUEEN
  [-20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, 0, -5, -10, -10, -20],
  // WHITE ROOK
  [0, 5, 0, 0, 0, 0, 5, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0],
  // WHITE BISHOP
  [-20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, -25, 5, 10, 10, 5, -25, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, -5, -5, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20],
  // WHITE KNIGHT
  [-25, -15, -15, -15, -15, -15, -15, -25,
    -20, -10, 0, 0, 0, 0, -10, -20,
    -15, 0, 5, 8, 8, 5, 0, -15,
    -15, -10, 8, 10, 10, 8, -10, -15,
    -25, 0, 8, 10, 10, 8, 0, -25,
    -15, 3, 10, 8, 8, 10, 3, -15,
    -20, -10, 0, 3, 3, 0, -10, -20,
    -25, -15, -15, -15, -15, -15, -15, -25],
  //WHITE PAWN
  [0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, -5, 0, 25, 25, 0, -5, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0], 0,
  // BLACK PAWN
  [0, 0, 0, 0, 0, 0, 0, 0,
    -5, -10, -10, 20, 20, -10, -10, -5,
    -5, 5, 10, 0, 0, 10, 5, -5,
    0, 5, 0, -25, -25, 0, 5, 0,
    -5, -5, -10, -25, -25, -10, -5, -5,
    -10, -10, -20, -30, -30, -20, -10, -10,
    -50, -50, -50, -50, -50, -50, -50, -50,
    0, 0, 0, 0, 0, 0, 0, 0],
  // BLACK KNIGHT
  [25, 15, 15, 15, 15, 15, 15, 25,
    20, 10, 0, -3, -3, 0, 10, 20,
    15, -3, -10, -8, -8, -10, -3, 15,
    25, 0, -8, -10, -10, -8, 0, 25,
    15, 10, -8, -10, -10, -8, 10, 15,
    15, 0, -5, -8, -8, -5, 0, 15,
    20, 10, 0, 0, 0, 0, 10, 20,
    25, 20, 15, 15, 15, 15, 20, 25],
  // BLACK BISHOP
  [20, 10, 10, 10, 10, 10, 10, 20,
    10, -5, 0, 5, 5, 0, -5, 10,
    10, -10, -10, -10, -10, -10, -10, 10,
    10, 0, -10, -10, -10, -10, 0, 10,
    10, 25, -5, -10, -10, -5, 25, 10,
    10, 0, -5, -10, -10, -5, 0, 10,
    10, 0, 0, 0, 0, 0, 0, 10,
    20, 10, 10, 10, 10, 10, 10, 20],
  // BLACK ROOK
  [0, 0, 0, -5, -5, 0, 0, 0,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    -5, -10, -10, -10, -10, -10, -10, -5,
    0, 5, 0, 0, 0, 0, 5, 0],
  // BLACK QUEEN
  [20, 10, 10, 0, 5, 10, 10, 20,
    10, 0, -5, 0, 0, 0, 0, 10,
    10, -5, -5, -5, -5, -5, 0, 10,
    0, 0, -5, -5, -5, -5, 0, 5,
    5, 0, -5, -5, -5, -5, 0, 5,
    10, 0, -5, -5, -5, -5, 0, 10,
    10, 0, 0, 0, 0, 0, 0, 10,
    20, 10, 10, 5, 5, 10, 10, 20],
  // BLACK KING
  [-20, -30, -10, 10, 0, 10, -30, -20,
    -20, -20, 0, 20, 20, 0, -20, -20,
    10, 20, 20, 20, 20, 20, 20, 10,
    20, 30, 30, 40, 40, 30, 30, 20,
    30, 40, 40, 50, 50, 40, 40, 30,
    30, 40, 40, 50, 50, 40, 40, 30,
    30, 40, 40, 50, 50, 40, 40, 30,
    30, 40, 40, 50, 50, 40, 40, 30],
];

const bestSquaresEndgame = [
  // WHITE KING
  [-30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, -20, -20, 0, 20, 20,
    20, 30, 10, -10, 0, -10, 30, 20],
  // WHITE QUEEN
  [-20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, 0, -5, -10, -10, -20],
  // WHITE ROOK
  [0, 5, 0, 0, 0, 0, 5, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0],
  // WHITE BISHOP
  [-20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, -25, 5, 10, 10, 5, -25, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, -5, -5, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20],
  // WHITE KNIGHT
  [-25, -15, -15, -15, -15, -15, -15, -25,
    -20, -10, 0, 0, 0, 0, -10, -20,
    -15, 0, 5, 8, 8, 5, 0, -15,
    -15, -10, 8, 10, 10, 8, -10, -15,
    -25, 0, 8, 10, 10, 8, 0, -25,
    -15, 3, 10, 8, 8, 10, 3, -15,
    -20, -10, 0, 3, 3, 0, -10, -20,
    -25, -15, -15, -15, -15, -15, -15, -25],
  //WHITE PAWN
  [0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, -5, 0, 25, 25, 0, -5, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0], 0,
  // BLACK PAWN
  [0, 0, 0, 0, 0, 0, 0, 0,
    -5, -10, -10, 20, 20, -10, -10, -5,
    -5, 5, 10, 0, 0, 10, 5, -5,
    0, 5, 0, -25, -25, 0, 5, 0,
    -5, -5, -10, -25, -25, -10, -5, -5,
    -10, -10, -20, -30, -30, -20, -10, -10,
    -50, -50, -50, -50, -50, -50, -50, -50,
    0, 0, 0, 0, 0, 0, 0, 0],
  // BLACK KNIGHT
  [25, 15, 15, 15, 15, 15, 15, 25,
    20, 10, 0, -3, -3, 0, 10, 20,
    15, -3, -10, -8, -8, -10, -3, 15,
    25, 0, -8, -10, -10, -8, 0, 25,
    15, 10, -8, -10, -10, -8, 10, 15,
    15, 0, -5, -8, -8, -5, 0, 15,
    20, 10, 0, 0, 0, 0, 10, 20,
    25, 20, 15, 15, 15, 15, 20, 25],
  // BLACK BISHOP
  [20, 10, 10, 10, 10, 10, 10, 20,
    10, -5, 0, 5, 5, 0, -5, 10,
    10, -10, -10, -10, -10, -10, -10, 10,
    10, 0, -10, -10, -10, -10, 0, 10,
    10, 25, -5, -10, -10, -5, 25, 10,
    10, 0, -5, -10, -10, -5, 0, 10,
    10, 0, 0, 0, 0, 0, 0, 10,
    20, 10, 10, 10, 10, 10, 10, 20],
  // BLACK ROOK
  [0, 0, 0, -5, -5, 0, 0, 0,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    5, 0, 0, 0, 0, 0, 0, 5,
    -5, -10, -10, -10, -10, -10, -10, -5,
    0, 5, 0, 0, 0, 0, 5, 0],
  // BLACK QUEEN
  [20, 10, 10, 0, 5, 10, 10, 20,
    10, 0, -5, 0, 0, 0, 0, 10,
    10, -5, -5, -5, -5, -5, 0, 10,
    0, 0, -5, -5, -5, -5, 0, 5,
    5, 0, -5, -5, -5, -5, 0, 5,
    10, 0, -5, -5, -5, -5, 0, 10,
    10, 0, 0, 0, 0, 0, 0, 10,
    20, 10, 10, 5, 5, 10, 10, 20],
  // BLACK KING
  [-20, -30, -10, 10, 0, 10, -30, -20,
    -20, -20, 0, 20, 20, 0, -20, -20,
    10, 20, 20, 20, 20, 20, 20, 10,
    20, 30, 30, 40, 40, 30, 30, 20,
    30, 40, 40, 50, 50, 40, 40, 30,
    30, 40, 40, 50, 50, 40, 40, 30,
    30, 40, 40, 50, 50, 40, 40, 30,
    30, 40, 40, 50, 50, 40, 40, 30],
];