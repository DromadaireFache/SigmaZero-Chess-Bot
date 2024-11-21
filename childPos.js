function childPositions(pos) {
  let child = [], i;
  for (let v = 0; v < 8; v++) {
    for (let j = 0; j < 8; j++) {
      if (pos[turn_] == 1) {
        i = v;
      } else {
        i = 7 - v;
      }
      let selectedPiece = pos[8 * i + j];
      if (selectedPiece * pos[turn_] > 0) {
        selectedPiece = abs(selectedPiece);
        if (selectedPiece == 1) {
          //pawn movement
          child.push(...pawnMove(pos, i, j, true));
        } else if (selectedPiece == 2) {
          //knight movement
          child.push(...knightMove(pos, i, j, true));
        } else if (selectedPiece == 3) {
          //bishop movement
          child.push(...bishopMove(pos, i, j, true));
        } else if (selectedPiece == 4) {
          //rook movement
          child.push(...rookMove(pos, i, j, true));
        } else if (selectedPiece == 5) {
          //queen movement
          child.push(...queenMove(pos, i, j, true));
        } else {
          //king movement
          child.push(...kingMove(pos, i, j, true));
        }
      }
    }
  }
  if (pos[turn_] == 1) {
    return child.sort((a, b) => b[moveScore_] - a[moveScore_]);
  } else {
    return child.sort((a, b) => a[moveScore_] - b[moveScore_]);
  }
}

function isLegal(pos, i, j, iNew, jNew, type) {
  if (iNew < 0 || jNew < 0 || iNew > 7 || jNew > 7) {
    return false;
  }
  let targetPiece = pos[8 * iNew + jNew];
  if (pos[turn_] * targetPiece > 0) {
    return false;
  } else if (type == 1 && !pawnMoveLegal(pos, j, iNew, jNew, targetPiece)) {
    return false;
  }
  if (type == 4 || type == 3) {
    return true;
  } else {
    let posCopy = playMove([...pos], [i, j], [iNew, jNew]);
    if (posCopy[kingSafe_]) {
      return posCopy;
    } else {
      return false;
    }
  }
}

function pawnMove(pos, i, j, returnPos = false) {
  let thisMove = [];
  let iNew;

  //one step foward
  if (pos[turn_] == 1) {
    iNew = i - 1;
  } else {
    iNew = i + 1;
  }
  let legal = isLegal(pos, i, j, iNew, j, 1);
  if (legal) {
    if (returnPos) {
      thisMove.push(legal);
    } else {
      thisMove.push([iNew, j]);
    }
  }

  //captures
  jNew = j + 1;
  legal = isLegal(pos, i, j, iNew, jNew, 1);
  if (legal) {
    if (returnPos) {
      thisMove.push(legal);
    } else {
      thisMove.push([iNew, jNew]);
    }
  }
  jNew = j - 1;
  legal = isLegal(pos, i, j, iNew, jNew, 1);
  if (legal) {
    if (returnPos) {
      thisMove.push(legal);
    } else {
      thisMove.push([iNew, jNew]);
    }
  }

  //double step foward
  if (i == 3.5 + 2.5 * pos[turn_] && pos[8 * iNew + j] == 0) {
    iNew -= pos[turn_];
    legal = isLegal(pos, i, j, iNew, j, 1);
    if (legal) {
      if (returnPos) {
        thisMove.push(legal);
      } else {
        thisMove.push([iNew, j]);
      }
    }
  }

  return thisMove;
}

function knightMove(pos, i, j, returnPos = false) {
  let thisMove = [];
  for (dir = 0; dir < 8; dir++) {
    let iNew = i + direction.n[dir][0];
    let jNew = j + direction.n[dir][1];
    let capture = false;
    let legal = isLegal(pos, i, j, iNew, jNew);
    if (legal && !capture) {
      if (returnPos) {
        thisMove.push(legal);
      } else {
        thisMove.push([iNew, jNew]);
      }
    }
  }

  return thisMove;
}

function bishopMove(pos, i, j, returnPos = false) {
  let thisMove = [];
  for (let dir = 0; dir < 4; dir++) {
    let dx = direction.b[dir][0];
    let dy = direction.b[dir][1];
    let iNew = i + dx;
    let jNew = j + dy;
    let capture = true;
    while (isLegal(pos, i, j, iNew, jNew, 3) && capture) {
      let posCopy = playMove([...pos], [i, j], [iNew, jNew]);
      if (posCopy[kingSafe_]) {
        if (returnPos) {
          thisMove.push(posCopy);
        } else {
          thisMove.push([iNew, jNew]);
        }
      }
      capture = pos[8 * iNew + jNew] == 0;
      iNew += dx;
      jNew += dy;
    }
  }
  return thisMove;
}

function rookMove(pos, i, j, returnPos = false) {
  let thisMove = [];
  for (let dir = 0; dir < 4; dir++) {
    let dx = direction.r[dir][0];
    let dy = direction.r[dir][1];
    let iNew = i + dx;
    let jNew = j + dy;
    let capture = true;
    while (isLegal(pos, i, j, iNew, jNew, 4) && capture) {
      let posCopy = playMove([...pos], [i, j], [iNew, jNew]);
      if (posCopy[kingSafe_]) {
        if (returnPos) {
          thisMove.push(posCopy);
        } else {
          thisMove.push([iNew, jNew]);
        }
      }
      capture = pos[8 * iNew + jNew] == 0;
      iNew += dx;
      jNew += dy;
    }
  }
  return thisMove;
}

function queenMove(pos, i, j, returnPos = false) {
  let thisMove = bishopMove(pos, i, j, returnPos);
  thisMove.push(...rookMove(pos, i, j, returnPos));
  return thisMove;
}

function kingMove(pos, i, j, returnPos = false) {
  let thisMove = [];
  for (let dir = 0; dir < 8; dir++) {
    let iNew = i + direction.k[dir][0];
    let jNew = j + direction.k[dir][1];
    let legal = isLegal(pos, i, j, iNew, jNew);
    if (legal) {
      if (returnPos) {
        thisMove.push(legal);
      } else {
        thisMove.push([iNew, jNew]);
      }
    }
  }

  //short castle
  let clear = pos[8 * i + 5] == 0 && pos[8 * i + 6] == 0;
  if (pos[shortCastle_ + pos[turn_]] && clear) {
    let jNew = j + 2;
    if (kingSafe(pos, 4)) {
      if (kingSafe(pos, 5)) {
        if (kingSafe(pos, 6)) {
          if (returnPos) {
            thisMove.push(playMove([...pos], [i, j], [i, jNew], false));
          } else {
            thisMove.push([i, jNew]);
          }
        }
      }
    }
  }

  //long castle
  clear = pos[8 * i + 3] == 0 && pos[8 * i + 2] == 0 && pos[8 * i + 1] == 0;
  if (pos[longCastle_ + pos[turn_]] && clear) {
    let jNew = j - 2;
    if (kingSafe(pos, 4)) {
      if (kingSafe(pos, 3)) {
        if (kingSafe(pos, 2)) {
          if (returnPos) {
            thisMove.push(playMove([...pos], [i, j], [i, jNew], false));
          } else {
            thisMove.push([i, jNew]);
          }
        }
      }
    }
  }

  return thisMove;
}

function kingSafe(pos, j = false, myKing = false) {
  let iKing, jKing, iSee, jSee, isSeeing, turn;
  if (j == false) {
    if (!myKing) {
      if (pos[turn_] == 1) {
        turn = 1;
        iKing = floor(pos[kingPosB_] / 8);
        jKing = pos[kingPosB_] % 8;
      } else {
        turn = -1;
        iKing = floor(pos[kingPosW_] / 8);
        jKing = pos[kingPosW_] % 8;
      }
    } else {
      if (pos[turn_] == 1) {
        turn = -1;
        iKing = floor(pos[kingPosW_] / 8);
        jKing = pos[kingPosW_] % 8;
      } else {
        turn = 1;
        iKing = floor(pos[kingPosB_] / 8);
        jKing = pos[kingPosB_] % 8;
      }
    }
  } else {
    if (pos[turn_] == 1) {
      iKing = 7;
      turn = -1;
    } else {
      iKing = 0;
      turn = 1;
    }
    jKing = j;
  }

  //check attacks from bishop and queen
  for (let see = 0; see < 4; see++) {
    let dx = direction.b[see][0];
    let dy = direction.b[see][1];
    iSee = iKing + dx;
    jSee = jKing + dy;
    isSeeing = 0;
    while (isSeeing == 0 && iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
      isSeeing = pos[8 * iSee + jSee] * turn;
      if (isSeeing == 5 || isSeeing == 3) {
        return false;
      }
      iSee += dx;
      jSee += dy;
    }
  }

  //check attacks from rook and queen
  for (let see = 0; see < 4; see++) {
    let dx = direction.r[see][0];
    let dy = direction.r[see][1];
    iSee = iKing + dx;
    jSee = jKing + dy;
    isSeeing = 0;
    while (isSeeing == 0 && iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
      isSeeing = pos[8 * iSee + jSee] * turn;
      if (isSeeing == 4 || isSeeing == 5) {
        return false;
      }
      iSee += dx;
      jSee += dy;
    }
  }

  //check attacks from other king
  if (turn == -1) {
    if (
      (iKing - floor(pos[kingPosB_] / 8)) ** 2 +
        (jKing - (pos[kingPosB_] % 8)) ** 2 <=
      2
    ) {
      return false;
    }
  } else {
    if (
      (iKing - floor(pos[kingPosW_] / 8)) ** 2 +
        (jKing - (pos[kingPosW_] % 8)) ** 2 <=
      2
    ) {
      return false;
    }
  }

  //check attacks from knights
  for (let see = 0; see < 8; see++) {
    iSee = iKing + direction.n[see][0];
    jSee = jKing + direction.n[see][1];
    if (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
      if (pos[8 * iSee + jSee] * turn == 2) {
        return false;
      }
    }
  }

  //check attacks from pawns
  iSee = iKing + turn;
  for (let see = -1; see < 2; see += 2) {
    jSee = jKing + see;
    if (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
      if (pos[8 * iSee + jSee] * turn == 1) {
        return false;
      }
    }
  }

  return true;
}

function pawnMoveLegal(pos, j, iNew, jNew, targetPiece) {
  if (targetPiece * pos[turn_] < 0 && j == jNew) {
    return false;
  } else if (targetPiece == 0 && j !== jNew) {
    if (
      pos[enPassant_] !== false &&
      jNew == pos[enPassant_] &&
      iNew == 3.5 - 1.5 * pos[turn_]
    ) {
      return true;
    } else {
      return false;
    }
  }
  return true;
}
