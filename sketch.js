function setup() {
  let canvasSize = 0.92 * windowHeight;
  createCanvas(canvasSize, canvasSize);
  Text = createP("").style("color", "#FFF");
  Text.style("font-size", canvasSize / 36 + "px");
  Text.style("user-select", "none");
  Text.position(windowWidth / 2 - canvasSize / 2, 0.92 * windowHeight);
  modeButton = createButton("Mode", "Standard");
  modeButton.position(windowWidth / 2 + canvasSize / 2 - 48, canvasSize + 5);
  modeButton.mousePressed(buttonPress);
  whiteButton = createButton("Play White");
  whiteButton.position(windowWidth / 2 + canvasSize / 2 - 212, canvasSize + 5);
  whiteButton.mousePressed(whiteAutoplay);
  blackButton = createButton("Play Black");
  blackButton.position(windowWidth / 2 + canvasSize / 2 - 130, canvasSize + 5);
  blackButton.mousePressed(blackAutoplay);

  //creates the board background
  board = createGraphics(width, height);
  for (let i = 0; i < 8; i++) {
    for (j = 0; j < 8; j++) {
      board.noStroke();
      if ((i + j) % 2 == 1) {
        board.fill(86, 158, 73);
      } else {
        board.fill(235, 255, 235);
      }
      board.rect((i * width) / 8, (j * height) / 8, width / 8, height / 8);
      board.fill(0);
      //board.text(8 * j + i, (i * width) / 8, (j * height) / 8 + 10);
    }
  }

  //sets up board position
  pts = pointStages.early;
  pos = countPieces(pos);
  modes = modesList.Standard;
  while (modes[mode].nextModeCount >= pos[pieceCount_]) {
    mode++;
  }
  depth = modes[mode].depth;
  zobristInitialization();

  //creates the graphic for the pieces
  displayPieces(pos, false);
}

function draw() {
  image(board, 0, 0);
  image(piecesCanvas, 0, 0);
  if (modes[mode].nextModeCount >= pos[pieceCount_]) {
    mode++;
    depth = modes[mode].depth;
  }
  if (moveCount < 16) {
    pts = pointStages.early;
  } else {
    pts = pointStages.late;
  }
  if (whitePlays && blackPlays) {
    // if (pos[turn_] == -1) {
    //   modes = modesList.Standard;
    // } else {
    //   modes = modesList.Turbo;
    // }
    depth = modes[mode].depth;
    setTimeout(botPlay);
  } else if (
    (pos[turn_] == 1 && whitePlays) ||
    (pos[turn_] == -1 && blackPlays)
  ) {
    setTimeout(botPlay, 500);
  }
  noLoop();
}

//checks if an array of arrays contains a specific array
function contains(arrayOfArrays, specificArray) {
  for (count = 0; count < arrayOfArrays.length; count++) {
    if (arraysAreEqual(arrayOfArrays[count], specificArray)) {
      return true;
    }
  }
  return false;
}

//check if array1 equals array2
function arraysAreEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }
  for (count2 = 0; count2 < array1.length; count2++) {
    if (array1[count2] !== array2[count2]) {
      return false;
    }
  }
  return true;
}

// move pieces with mouse
function mousePressed() {
  if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
    const mX = flip * (mouseX - width / 2) + width / 2;
    const mY = flip * (mouseY - height / 2) + height / 2;
    const row = floor((mY / height) * 8);
    const col = floor((mX / width) * 8);
    let selectedPiece = pos[8 * row + col];
    selectedPiece = pos[turn_] * selectedPiece > 0;
    const unclick = row == tile[0] && col == tile[1];
    if (selectedPiece && !unclick) {
      tile = [];
      tile.push(row);
      tile.push(col);
      legalMoves = highlight(pos, tile, pos[8 * row + col]);
    } else if (unclick) {
      tile = [];
      displayPieces(pos, false);
    } else if (tile.length > 0 && contains(legalMoves, [row, col])) {
      const newTile = [row, col];
      lastPos = [...pos];
      playMove(pos, tile, newTile);
      tile = [];
      displayPieces(pos, false);
      moveCount++;
      //print(pos[kingSafe_]);
      //print("Count: " + pos[pieceCount_] + ", Eval: " + pos[eval_]);
    }
  }
}

function keyPressed() {
  //resets the board
  if (key == "r") {
    setup();

    //flips the board
  } else if (key == "f") {
    flip *= -1;
    displayPieces(pos, false);

    //prints the static evaluation
  } else if (key == "e") {
    let timer = millis();
    for (let i = 0; i < 10000; i++) {
      let eval = evaluation(pos);
    }
    timer = round((millis() - timer) / 10, 5);
    print("Static evaluation: " + evaluation(pos) + ", " + timer + "µs");

    //next engine move
  } else if (key == " ") {
    if (whitePlays || blackPlays) {
      whitePlays = false;
      blackPlays = false;
      newText = "Autoplay off";
      displayPieces(pos, false);
    } else {
      botPlay();
    }

    //prints number of child pos
  } else if (key == "c") {
    let timer = millis(),
      nextPos;
    for (let i = 0; i < 1000; i++) {
      nextPos = childPositions(pos);
    }
    timer = round((millis() - timer) / nextPos.length, 2);
    print(nextPos.length + " possible moves, " + timer + "µs/pos");

    //kingsafe test
  } else if (key == "k") {
    let timer = millis();
    for (let i = 0; i < 100000; i++) {
      kingSafe(pos);
    }
    timer = round((millis() - timer) / 100, 5);
    print("kingSafe: " + kingSafe(pos) + ", " + timer + "µs");
  } else if (key == "d") {
    let timer = millis();
    for (let i = 0; i < 10000; i++) {
      midGameEval(pos);
    }
    timer = round((millis() - timer) / 10, 5);
    print("midGameEval: " + midGameEval(pos) + ", " + timer + "µs");
    timer = millis();
    for (let i = 0; i < 10000; i++) {
      endGameEval(pos);
    }
    timer = round((millis() - timer) / 10, 5);
    print("endGameEval: " + endGameEval(pos) + ", " + timer + "µs");
  } else if (key == "t") {
    let timer = millis();
    for (let i = 0; i < 100000; i++) {
      zobristKey(pos);
    }
    timer = round((millis() - timer) / 100, 5);
    print("zobristKey: " + zobristKey(pos) + ", " + timer + "µs");
    //print("index: " + (zobristKey(pos)[0] & ttSize));
    let count = 0;
    for (let i = 0; i < ttSize; i++) {
      if (!isNaN(tt.hash1[i])) {
        count++;
      }
    }
    print(
      "tt: " +
        count +
        "/" +
        ttSize +
        " (" +
        round((100 * count) / ttSize) +
        "%)"
    );
  }
}

//changes the board by moving the piece of Tile to the NewTile
function playMove(pos, Tile, NewTile, kingSafety = true) {
  const I = 8 * NewTile[0] + NewTile[1];
  const Iold = 8 * Tile[0] + Tile[1];
  const selectedPiece = pos[Iold];
  const targetPiece = pos[I];
  const targetPoints = pts[6 - targetPiece];
  pos[moveScore_] = 0;
  pos[Iold] = 0;
  pos[I] = selectedPiece;
  pos[enPassant_] = false;
  //en passant
  if (abs(selectedPiece) == 1 && targetPiece == 0) {
    if (pos[turn_] == 1) {
      pos[I + 8] = 0;
      if (I < 24 && Iold !== I + 8) {
        pos[pieceCount_]--;
        pos[pawnStructureB_ + NewTile[1]]--;
        pos[eval_] += 1 - bestSquares[5][I + 8] / 100;
      }
    } else {
      pos[I - 8] = 0;
      if (I > 39 && Iold !== I - 8) {
        pos[pieceCount_]--;
        pos[pawnStructureW_ + NewTile[1]]--;
        pos[eval_] += -1 - bestSquares[7][I - 8] / 100;
      }
    }
  }
  if (kingSafety && abs(selectedPiece) % 6 !== 0) {
    if (kingSafe(pos, false, true)) {
      pos[kingSafe_] = true;
    } else {
      //CHANGE THIS
      pos[kingSafe_] = false;
      return pos;
    }
  }

  // WHITE MOVES
  if (pos[turn_] == 1) {
    if (selectedPiece !== 1 && targetPiece == 0) {
      if (pos[I - 9] == -1 || pos[I - 7] == -1) {
        pos[frontOfPawn_] = true;
        pos[moveScore_] -= 5;
      } else {
        pos[frontOfPawn_] = false;
      }
    }

    if (targetPiece < -1) {
      if (targetPiece == -4) {
        if (I == 7) {
          pos[65] = false;
        } else if (I == 0) {
          pos[66] = false;
        }
      }
      pos[pieceCount_] += targetPoints;
      pos[eval_] -= targetPoints + bestSquares[6 - targetPiece][I] / 100;
    } else if (targetPiece == -1) {
      pos[pawnStructureB_ + NewTile[1]]--;
      pos[pieceCount_] += targetPoints;
      pos[eval_] -= targetPoints + bestSquares[6 - targetPiece][I] / 100;
    }

    //move piece & capture
    if (selectedPiece == 1) {
      pos[frontOfPawn_] = false;
      if (I < 8) {
        //queen promotion
        pos[I] = 5;
        pos[pieceCount_] += 8;
        pos[eval_] += 8 + (bestSquares[1][I] - bestSquares[5][I]) / 100;
        pos[pawnStructureW_ + NewTile[1]]--;
      } else if (Iold - I == 16) {
        pos[enPassant_] = I % 8;
      }
      if (Tile[1] !== NewTile[1]) {
        pos[pawnStructureW_ + Tile[1]]--;
        pos[pawnStructureW_ + NewTile[1]]++;
      }
    } else if (selectedPiece == 6) {
      pos[kingPosW_] = I;
      //castle
      pos[67] = false;
      pos[68] = false;
      if (abs(I - Iold) == 2) {
        if (NewTile[1] == 6) {
          pos[I + 1] = 0;
          pos[I - 1] = 4;
        } else {
          pos[I - 2] = 0;
          pos[I + 1] = 4;
        }
      }
    } else if (selectedPiece == 4) {
      if (pos[63] !== 4) {
        pos[67] = false;
      } else if (pos[56] !== 4) {
        pos[68] = false;
      }
    }
    const lastCaptureIsImportant =
      -targetPiece <= selectedPiece ||
      (targetPiece == -2 && selectedPiece == 3) ||
      (targetPiece == -3 && selectedPiece == 2);
    pos[lastMove_] =
      targetPiece !== 0 &&
      selectedPiece !== 1 &&
      modes[mode].captureDepthIncrease &&
      lastCaptureIsImportant;
    pos[prevMove_] = NewTile[0] - Tile[0] < 0;
    pos[moveScore_] += 0.1 * (NewTile[0] - Tile[0]);
    pos[turn_] = -1;

    // BLACK MOVES
  } else {
    if (selectedPiece !== -1 && targetPiece == 0) {
      if (pos[I + 7] == 1 || pos[I + 9] == 1) {
        pos[frontOfPawn_] = true;
        pos[moveScore_] += 5;
      } else {
        pos[frontOfPawn_] = false;
      }
    }

    if (targetPiece > 1) {
      if (targetPiece == 4) {
        if (I == 63) {
          pos[67] = false;
        } else if (I == 56) {
          pos[68] = false;
        }
      }
      pos[pieceCount_] -= targetPoints;
      pos[eval_] -= targetPoints + bestSquares[6 - targetPiece][I] / 100;
    } else if (targetPiece == 1) {
      pos[pawnStructureW_ + NewTile[1]]--;
      pos[pieceCount_] -= targetPoints;
      pos[eval_] -= targetPoints + bestSquares[6 - targetPiece][I] / 100;
    }

    //move piece & capture
    if (selectedPiece == -1) {
      pos[frontOfPawn_] = false;
      if (I > 55) {
        //queen promotion
        pos[I] = -5;
        pos[pieceCount_] += 8;
        pos[eval_] += -8 + (bestSquares[11][I] - bestSquares[7][I]) / 100;
        pos[pawnStructureB_ + NewTile[1]]--;
      } else if (I - Iold == 16) {
        pos[enPassant_] = I % 8;
      }
      if (Tile[1] !== NewTile[1]) {
        pos[pawnStructureB_ + Tile[1]]--;
        pos[pawnStructureB_ + NewTile[1]]++;
      }
    } else if (selectedPiece == -6) {
      pos[kingPosB_] = I;
      //castle
      pos[65] = false;
      pos[66] = false;
      if (abs(I - Iold) == 2) {
        if (NewTile[1] == 6) {
          pos[I + 1] = 0;
          pos[I - 1] = -4;
        } else {
          pos[I - 2] = 0;
          pos[I + 1] = -4;
        }
      }
    } else if (selectedPiece == -4) {
      if (pos[7] !== -4) {
        pos[65] = false;
      } else if (pos[0] !== -4) {
        pos[66] = false;
      }
    }
    const lastCaptureIsImportant =
      targetPiece <= -selectedPiece ||
      (targetPiece == 2 && selectedPiece == -3) ||
      (targetPiece == 3 && selectedPiece == -2);
    pos[lastMove_] =
      targetPiece !== 0 &&
      selectedPiece !== -1 &&
      modes[mode].captureDepthIncrease &&
      lastCaptureIsImportant;
    pos[prevMove_] = NewTile[0] - Tile[0] > 0;
    pos[moveScore_] += 0.1 * (NewTile[0] - Tile[0]);
    pos[turn_] = 1;
  }

  // EVERYTHING ELSE
  pos[eval_] +=
    (bestSquares[6 - selectedPiece][I] - bestSquares[6 - selectedPiece][Iold]) /
    100;
  if (kingSafety && abs(selectedPiece) % 6 == 0) {
    pos[kingSafe_] = kingSafe(pos);
  }
  pos[moveScore_] += pos[eval_] + 0.15 * targetPoints - pts[6 - selectedPiece];

  return pos;
}

function countPieces(pos) {
  pos[kingSafe_] = kingSafe(pos);
  pos[pieceCount_] = 0;
  for (let I = 0; I < 64; I++) {
    if (pos[I] !== 0) {
      pos[pieceCount_] += abs(pts[6 - pos[I]]);
      pos[eval_] += pts[6 - pos[I]] + bestSquares[6 - pos[I]][I] / 100;
      if (pos[I] == 6) {
        pos[kingPosW_] = I;
      } else if (pos[I] == -6) {
        pos[kingPosB_] = I;
      } else if (pos[I] == 1) {
        pos[pawnStructureW_ + (I % 8)]++;
      } else if (pos[I] == -1) {
        pos[pawnStructureB_ + (I % 8)]++;
      }
    }
  }

  pos[pieceCount_] = round(pos[pieceCount_], 1);
  pos[eval_] = round(pos[eval_], 1);
  return pos;
}

class Mode {
  constructor(
    depth,
    captureDepthIncrease,
    winningNum = Infinity,
    losingNum = Infinity,
    nextModeCount = 0,
  ) {
    this.depth = depth;
    this.captureDepthIncrease = captureDepthIncrease;
    this.winningNum = winningNum;
    this.losingNum = losingNum;
    this.nextModeCount = nextModeCount;
  }
}

//FROM DISPLAY.JS FILE
function preload() {
  img = [
    loadImage("images/kingW.png"),
    loadImage("images/queenW.png"),
    loadImage("images/rookW.png"),
    loadImage("images/bishopW.png"),
    loadImage("images/knightW.png"),
    loadImage("images/pawnW.png"),
    0,
    loadImage("images/pawnB.png"),
    loadImage("images/knightB.png"),
    loadImage("images/bishopB.png"),
    loadImage("images/rookB.png"),
    loadImage("images/queenB.png"),
    loadImage("images/kingB.png"),
  ];
}

function displayPieces(pos, high) {
  piecesCanvas = createGraphics(width, height);
  let h = ((flip - 1) * height * -7) / 16;

  //displays highlights
  if (high !== false) {
    for (i = 0; i < high.length; i++) {
      let x = flip * high[i][1];
      let y = flip * high[i][0];
      x = (x * width) / 8 + width / 200 + h;
      y = (y * height) / 8 + height / 200 + h;
      let color = (high[i][0] + high[i][1]) % 2;
      piecesCanvas.noFill();
      piecesCanvas.strokeWeight(width / 100);
      if (i == 0) {
        piecesCanvas.stroke(255, 255, 0, 150);
      } else {
        piecesCanvas.stroke(150 + color * 65, 100);
      }
      piecesCanvas.square(x, y, width * 0.115, 15);
    }
  }

  //displays pieces
  let s = width / 8;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let x = flip * j * s + h;
      let y = flip * i * s + h;
      if (lastPos !== undefined && lastPos[8 * i + j] !== pos[8 * i + j]) {
        piecesCanvas.fill(255, 255, 0, 150);
        piecesCanvas.noStroke();
        piecesCanvas.square(x, y, s);
      }
      if (pos[8 * i + j] !== 0) {
        piecesCanvas.image(img[6 - pos[8 * i + j]], x, y, s, s);
      }
    }
  }
  if (pos[turn_] == 1) {
    textTurn = "White to move";
  } else {
    textTurn = "Black to move";
  }
  let finalText = textTurn + "<br>" + newText;
  Text.html(finalText);
  draw();
}

function highlight(pos, tile, selectedPiece) {
  let high = [tile];
  if (abs(selectedPiece) == 1) {
    high.push(...pawnMove(pos, tile[0], tile[1]));
  } else if (abs(selectedPiece) == 2) {
    high.push(...knightMove(pos, tile[0], tile[1]));
  } else if (abs(selectedPiece) == 3) {
    high.push(...bishopMove(pos, tile[0], tile[1]));
  } else if (abs(selectedPiece) == 4) {
    high.push(...rookMove(pos, tile[0], tile[1]));
  } else if (abs(selectedPiece) == 5) {
    high.push(...queenMove(pos, tile[0], tile[1]));
  } else if (abs(selectedPiece) == 6) {
    high.push(...kingMove(pos, tile[0], tile[1]));
  }
  displayPieces(pos, high);
  return high;
}

function timeAverage(nbPos, timeAdded) {
  if (nbPos == undefined) {
    let average = 0;
    for (let time of timeList) {
      average += time;
    }
    average /= timeList.length;
    return "Avg: " + round(average, 3) + "s";
  } else {
    timeList.push(timeAdded);
    let average = 0;
    for (let time of timeList) {
      average += time;
    }
    average /= timeList.length;
    return (
      round(nbPos / timeAdded / 1000) +
      "pos/ms | Avg: " +
      round(average, 3) +
      "s"
    );
  }
}

function buttonPress() {
  let buttons = ["Turbo", "Standard", "Advanced", "Expert"];
  let index = (buttons.indexOf(modeButton.value()) + 1) % 4;
  modeButton.value(buttons[index]);
  newText = "SigmaZero " + modeButton.value();
  displayPieces(pos, false);
  modes = modesList[modeButton.value()];
  mode = 0;
  depth = modes[mode].depth;
}

function printBoard(pos, row) {
  if (row !== undefined) {
    print(
      "(i = " + row + ") ",
      pos[8 * row],
      pos[8 * row + 1],
      pos[8 * row + 2],
      pos[8 * row + 3],
      pos[8 * row + 4],
      pos[8 * row + 5],
      pos[8 * row + 6],
      pos[8 * row + 7]
    );
  } else {
    for (let i = 0; i < 8; i++) {
      print(
        "(i = " + i + ") ",
        pos[8 * i],
        pos[8 * i + 1],
        pos[8 * i + 2],
        pos[8 * i + 3],
        pos[8 * i + 4],
        pos[8 * i + 5],
        pos[8 * i + 6],
        pos[8 * i + 7]
      );
    }
  }
}

function whiteAutoplay() {
  whitePlays = !whitePlays;
  if (whitePlays) {
    newText = "Autoplay on: bot plays WHITE";
  } else {
    newText = "Autoplay off: bot does not play WHITE";
  }
  displayPieces(pos, false);
}

function blackAutoplay() {
  blackPlays = !blackPlays;
  if (blackPlays) {
    newText = "Autoplay on: bot plays BLACK";
  } else {
    newText = "Autoplay off: bot does not play BLACK";
  }
  displayPieces(pos, false);
}

function botPlay() {
  print("w: " + whitePlays + ", b: " + blackPlays);
  const nextPos = childPositions(pos);
  tt.softReset();
  if (nextPos.length == 0) {
    if (kingSafe(pos, false, true)) {
      newText = "GAME DRAWN | " + timeAverage();
    } else if (pos[turn_] == 1) {
      newText = "BLACK WINS | " + timeAverage();
    } else {
      newText = "WHITE WINS | " + timeAverage();
    }
    whitePlays = false;
    blackPlays = false;
  } else {
    lastPos = [...pos];
    pos = bestMove(pos, nextPos);
  }
  displayPieces(pos, false);
  moveCount++;
}
