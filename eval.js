function evaluation(pos) {
  const mult = pos[turn_];

  let eval = pos[eval_] + mult * (pos[frontOfPawn_] + 0.2 * !pos[prevMove_]);
  //avoid blocking in rook w king in corner
  if (
    (pos[kingPosW_] == 62 && pos[63] == 4) ||
    (pos[kingPosW_] == 57 && pos[56] == 4)
  ) {
    eval -= 0.5;
  }
  if (
    (pos[kingPosB_] == 6 && pos[7] == -4) ||
    (pos[kingPosB_] == 1 && pos[0] == -4)
  ) {
    eval += 0.5;
  }

  //avoid moving queen in opening
  if (moveCount < 6) {
    if (pos[3] !== -5) {
      eval += 0.25;
    }
    if (pos[59] !== 5) {
      eval -= 0.25;
    }
  }

  //avoid bad pawn structure
  if (
    (pos[79] == 0 && pos[kingPosW_] == 57) ||
    (pos[84] == 0 && pos[kingPosW_] == 62)
  ) {
    eval -= 0.5;
  }
  if (
    (pos[87] == 0 && pos[kingPosB_] == 1) ||
    (pos[92] == 0 && pos[kingPosB_] == 6)
  ) {
    eval += 0.5;
  }
  for (let i = 0; i < 8; i++) {
    if (pos[pawnStructureW_ + i] > 1) {
      eval -= pos[pawnStructureW_ + i] / 16;
    }
    if (pos[pawnStructureB_ + i] > 1) {
      eval += pos[pawnStructureB_ + i] / 16;
    }
    if (i % 7 !== 0) {
      if (
        pos[pawnStructureW_ + i] !== 0 &&
        pos[77 + i] == 0 &&
        pos[79 + i] == 0
      ) {
        eval -= 0.3 * pos[pawnStructureW_ + i];
      }
      if (
        pos[pawnStructureB_ + i] !== 0 &&
        pos[85 + i] == 0 &&
        pos[87 + i] == 0
      ) {
        eval += 0.3 * pos[pawnStructureW_ + i];
      }
    }
  }

  if (!kingSafe(pos, false, true)) {
    eval -= mult * 0.3;
  }

  return round(eval, 3);
}

function midGameEval(pos) {
  //attacks
  //pawns on opposite squares as bishop
  let eval = 0,
    controlW = 0,
    controlB = 0,
    nbPieceW = 0,
    nbPieceB = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const I = 8 * i + j;
      const piece = pos[I];
      if (piece !== 0) {
        eval += pts[6 - piece] + bestSquares[6 - piece][I] / 100;
        if (piece > 0) {
          nbPieceW += 1;
        } else {
          nbPieceB += 1;
        }
        if (piece == 1) {
          //pass pawn
          if (
            pos[pawnStructureB_ + j] == 0 &&
            pos[pawnStructureB_ + j - 1] == 0 &&
            pos[pawnStructureB_ + j + 1] == 0
          ) {
            eval += (6 - i) ** 2 * 0.1;
          }
          //doubled pawn
          if (pos[pawnStructureW_ + j] > 1) {
            eval -= 0.15;
          }
          //isolated pawn
          if (j == 0 && pos[pawnStructureW_ + 1] == 0) {
            eval -= 0.3;
          } else if (j == 7 && pos[pawnStructureW_ + 6] == 0) {
            eval -= 0.3;
          } else if (
            pos[pawnStructureW_ + j + 1] == 0 &&
            pos[pawnStructureW_ + j - 1] == 0
          ) {
            eval -= 0.3;
          }
        } else if (piece == -1) {
          //pass pawn
          if (
            pos[pawnStructureW_ + j] == 0 &&
            pos[pawnStructureW_ + j - 1] == 0 &&
            pos[pawnStructureW_ + j + 1] == 0
          ) {
            eval -= (i - 1) ** 2 * 0.1;
          }
          //doubled pawn
          if (pos[pawnStructureB_ + j] > 1) {
            eval += 0.15;
          }
          //isolated pawn
          if (j == 0 && pos[pawnStructureB_ + 1] == 0) {
            eval += 0.3;
          } else if (j == 7 && pos[pawnStructureB_ + 6] == 0) {
            eval += 0.3;
          } else if (
            pos[pawnStructureB_ + j + 1] == 0 &&
            pos[pawnStructureB_ + j - 1] == 0
          ) {
            eval += 0.3;
          }
        } else if (abs(piece) == 2) {
          for (let see = 0; see < 8; see++) {
            iSee = i + direction.n[see][0];
            jSee = j + direction.n[see][1];
            if (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0) {
                controlW += ((8 - i) * 2) / 9;
              } else {
                controlB += ((i + 1) * 2) / 9;
              }
            }
          }
        } else if (abs(piece) == 3) {
          for (let see = 0; see < 4; see++) {
            const dx = direction.b[see][0];
            const dy = direction.b[see][1];
            iSee = i + dx;
            jSee = j + dy;
            while (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0) {
                controlW += ((8 - i) * 2) / 9;
              } else {
                controlB += ((i + 1) * 2) / 9;
              }
              if (pos[8 * iSee + jSee] !== 0) {
                break;
              }
              iSee += dx;
              jSee += dy;
            }
          }
        } else if (abs(piece) == 4) {
          for (let see = 0; see < 4; see++) {
            const dx = direction.r[see][0];
            const dy = direction.r[see][1];
            iSee = i + dx;
            jSee = j + dy;
            while (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0) {
                controlW += 0.5;
              } else {
                controlB += 0.5;
              }
              if (pos[8 * iSee + jSee] !== 0) {
                break;
              }
              iSee += dx;
              jSee += dy;
            }
          }
        } else if (abs(piece) == 6) {
          for (let see = 0; see < 4; see++) {
            let dx = direction.r[see][0];
            let dy = direction.r[see][1];
            iSee = i + dx;
            jSee = j + dy;
            while (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0 && iSee < 5) {
                eval -= 0.05 * (5 - iSee);
              } else if (piece < 0 && iSee > 2) {
                eval += 0.05 * (iSee - 2);
              }
              if (pos[8 * iSee + jSee] !== 0) {
                break;
              }
              iSee += dx;
              jSee += dy;
            }
            dx = direction.b[see][0];
            dy = direction.b[see][1];
            iSee = i + dx;
            jSee = j + dy;
            while (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0 && iSee < 5) {
                eval -= 0.05 * (5 - iSee);
              } else if (piece < 0 && iSee > 2) {
                eval += 0.05 * (iSee - 2);
              }
              if (pos[8 * iSee + jSee] !== 0) {
                break;
              }
              iSee += dx;
              jSee += dy;
            }
          }
        }
      }
    }
  }
  eval += (controlW / nbPieceW - controlB / nbPieceB) / 2;
  
  //dont expose the king when castled
  if (
    (pos[79] == 0 && pos[kingPosW_] == 57) ||
    (pos[84] == 0 && pos[kingPosW_] == 62)
  ) {
    eval -= 0.5;
  }
  if (
    (pos[87] == 0 && pos[kingPosB_] == 1) ||
    (pos[92] == 0 && pos[kingPosB_] == 6)
  ) {
    eval += 0.5;
  }
  if (!kingSafe(pos, false, true)) {
    eval -= pos[turn_] * 0.3;
  }

  return round(eval, 3);
}

function endGameEval(pos) {
  let eval = 0,
    controlW = 0,
    controlB = 0,
    nbPieceW = 0,
    nbPieceB = 0,
    pawnSum = 0,
    dW,
    dB;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = pos[8 * i + j];
      if (piece !== 0) {
        eval += pts[6 - piece];
        if (piece > 0) {
          nbPieceW += 1;
        } else {
          nbPieceB += 1;
        }
        if (piece == 1) {
          pawnSum++;
          eval += (7 - i) / 8;
          //pass pawn
          if (
            pos[pawnStructureB_ + j] == 0 &&
            pos[pawnStructureB_ + j - 1] == 0 &&
            pos[pawnStructureB_ + j + 1] == 0
          ) {
            eval += (6 - i) ** 2 * 0.1;
          }
          //doubled pawn
          if (pos[pawnStructureW_ + j] > 1) {
            eval -= 0.15;
          }
          //isolated pawn
          if (j == 0 && pos[pawnStructureW_ + 1] == 0) {
            eval -= 0.3;
          } else if (j == 7 && pos[pawnStructureW_ + 6] == 0) {
            eval -= 0.3;
          } else if (
            pos[pawnStructureW_ + j + 1] == 0 &&
            pos[pawnStructureW_ + j - 1] == 0
          ) {
            eval -= 0.3;
          }
          //the square
          if (abs((pos[kingPosB_] % 8) - j) > i || floor(pos[kingPosB_]) > i) {
            //eval += (7 - i) / 20;
            eval += 0.1;
          }
        } else if (piece == 6) {
          eval += (7 - i) / 20;
          dW = (i - 3.5) ** 2 + (j - 3.5) ** 2;
        } else if (piece == -1) {
          pawnSum++;
          eval -= i / 8;
          //pass pawn
          if (
            pos[pawnStructureW_ + j] == 0 &&
            pos[pawnStructureW_ + j - 1] == 0 &&
            pos[pawnStructureW_ + j + 1] == 0
          ) {
            eval -= (i - 1) ** 2 * 0.1;
          }
          //doubled pawn
          if (pos[pawnStructureB_ + j] > 1) {
            eval += 0.15;
          }
          //isolated pawn
          if (j == 0 && pos[pawnStructureB_ + 1] == 0) {
            eval += 0.3;
          } else if (j == 7 && pos[pawnStructureB_ + 6] == 0) {
            eval += 0.3;
          } else if (
            pos[pawnStructureB_ + j + 1] == 0 &&
            pos[pawnStructureB_ + j - 1] == 0
          ) {
            eval += 0.3;
          }
          //the square
          if (
            abs((pos[kingPosW_] % 8) - j) > 7 - i ||
            floor(pos[kingPosW_]) < i
          ) {
            //eval -= i / 20;
            eval -= 0.1;
          }
        } else if (piece == -6) {
          eval -= i / 20;
          dB = (i - 3.5) ** 2 + (j - 3.5) ** 2;
        } else if (abs(piece) == 2) {
          for (let see = 0; see < 8; see++) {
            iSee = i + direction.n[see][0];
            jSee = j + direction.n[see][1];
            if (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0) {
                controlW += ((8 - i) * 2) / 9;
              } else {
                controlB += ((i + 1) * 2) / 9;
              }
            }
          }
        } else if (abs(piece) == 3) {
          for (let see = 0; see < 4; see++) {
            const dx = direction.b[see][0];
            const dy = direction.b[see][1];
            iSee = i + dx;
            jSee = j + dy;
            while (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0) {
                controlW += ((8 - i) * 2) / 9;
              } else {
                controlB += ((i + 1) * 2) / 9;
              }
              if (pos[8 * iSee + jSee] !== 0) {
                break;
              }
              iSee += dx;
              jSee += dy;
            }
          }
        } else if (abs(piece) == 4) {
          for (let see = 0; see < 4; see++) {
            const dx = direction.r[see][0];
            const dy = direction.r[see][1];
            iSee = i + dx;
            jSee = j + dy;
            while (iSee >= 0 && jSee >= 0 && iSee <= 7 && jSee <= 7) {
              if (piece > 0) {
                controlW += 0.5;
              } else {
                controlB += 0.5;
              }
              if (pos[8 * iSee + jSee] !== 0) {
                break;
              }
              iSee += dx;
              jSee += dy;
            }
          }
        }
      }
    }
  }
  //check dead position
  if (pawnSum == 0 && pos[pieceCount_] < 24) {
    return 0;
  }
  eval += (controlW / nbPieceW - controlB / nbPieceB) / 2;
  if (eval > 4) {
    eval += dB / 20;
  } else if (eval < -4) {
    eval -= dW / 20;
  }
  if (!kingSafe(pos, false, true)) {
    eval -= pos[turn_] * 0.3;
  }
  return round(eval, 3);
}
