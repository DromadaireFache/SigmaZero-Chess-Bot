function bestMove(pos, nextPos) {
  const timeStart = millis();
  let bestEval,
    posBestEval,
    maxDepth = depth,
    evalOffset;
  numPosEvaluated = 0;
  if (moveCount < 16) {
    evalOffset = 0;
  } else {
    evalOffset = 0.1;
  }

  //print(nextPos.length + " moves possible");
  //pre-computes good moves
  let preEvalList = [],
    preEvalBest = -pos[turn_] * Infinity;
  for (p = 0; p < nextPos.length; p++) {
    preEvalList.push(minimax(nextPos[p], 2, -Infinity, Infinity, false, depth));
    if (pos[turn_] == 1) {
      preEvalBest = max(preEvalBest, preEvalList[p]);
    } else {
      preEvalBest = min(preEvalBest, preEvalList[p]);
    }
  }
  print(preEvalList);
  print("Pre Evaluation Best: " + preEvalBest);
  print(printBoard(nextPos[3]));
  for (p = 0; p < nextPos.length; p++) {
    if (
      (pos[turn_] == 1 && preEvalBest >= preEvalList[p] + 4) ||
      (pos[turn_] == -1 && preEvalBest <= preEvalList[p] - 4)
    ) {
      continue;
    }
    let numDelta = numPosEvaluated;
    Eval = minimax(nextPos[p], depth, -Infinity, Infinity, false, depth);

    numDelta = numPosEvaluated - numDelta;
    print("Pos delta: " + numDelta + ", eval: " + Eval);
    if (bestEval == undefined) {
      bestEval = Eval;
      posBestEval = [p];
    } else if (pos[turn_] == 1 && Eval > bestEval) {
      bestEval = Eval;
      posBestEval = [p];
    } else if (pos[turn_] == -1 && Eval < bestEval) {
      bestEval = Eval;
      posBestEval = [p];
    } else if (pos[turn_] == 1 && Eval + evalOffset >= bestEval) {
      posBestEval.push(p);
    } else if (pos[turn_] == -1 && Eval - evalOffset <= bestEval) {
      posBestEval.push(p);
    }
    if (
      numPosEvaluated > modes[mode].winningNum &&
      bestEval * pos[turn_] > -1
    ) {
      break;
    } else if (numPosEvaluated > modes[mode].losingNum) {
      break;
    }
  }
  //print(posBestEval);
  if (posBestEval !== undefined) {
    if (moveCount < 16) {
      posBestEval = random(posBestEval);
      posBestEval = nextPos[posBestEval];
    } else {
      if (posBestEval.length == 1) {
        posBestEval = nextPos[posBestEval[0]];
      } else {
        tt.softReset();
        maxDepth++;
        let numDelta = numPosEvaluated;
        bestEval = undefined;
        let selectionArray = [...posBestEval];
        for (let p = 0; p < selectionArray.length; p++) {
          Eval = minimax(
            nextPos[selectionArray[p]],
            maxDepth,
            -Infinity,
            Infinity,
            pos[turn_] == 1,
            false,
            maxDepth
          );
          if (bestEval == undefined) {
            bestEval = Eval;
            posBestEval = [selectionArray[p]];
          } else if (Eval == bestEval) {
            posBestEval.push(selectionArray[p]);
          } else if (pos[turn_] == 1 && Eval > bestEval) {
            bestEval = Eval;
            posBestEval = [selectionArray[p]];
          } else if (pos[turn_] == -1 && Eval < bestEval) {
            bestEval = Eval;
            posBestEval = [selectionArray[p]];
          }
        }
        print(numPosEvaluated - numDelta + " more pos");
        print(
          "Best Eval: " + bestEval + " from " + selectionArray.length + " moves"
        );
        posBestEval = random(posBestEval);
        posBestEval = nextPos[posBestEval];
      }
    }
    let time = round((millis() - timeStart) / 1000, 3);
    if (bestEval == pos[turn_] * 1000 * (maxDepth + 1)) {
      if (bestEval > 0) {
        newText = "WHITE WINS | " + timeAverage(numPosEvaluated, time);
      } else {
        newText = "BLACK WINS | " + timeAverage(numPosEvaluated, time);
      }
    } else {
      newText =
        numPosEvaluated +
        " pos in " +
        time +
        "s | " +
        timeAverage(numPosEvaluated, time) +
        " | Eval: " +
        round(bestEval, 2) +
        " | Depth = " +
        maxDepth +
        " | Count = " +
        round(pos[pieceCount_]);
    }
  }
  //printBoard(nextPos[2]);
  return posBestEval;
}

function minimax(pos, depth, alph, beta, deep, ogDepth) {
  if (depth == 0) {
    if (pos[lastMove_]) {
      depth++;
    } else {
      numPosEvaluated++;
      if (pos[pieceCount_] < 58) {
        const zKey = zobristKey(pos);
        const index = zKey[0] & (ttSize - 1);
        if (tt.hash1[index] == zKey[0] && tt.hash2[index] == zKey[1]) {
          return tt.eval[index];
        }
        const eval = endGameEval(pos);
        tt.add(zKey, index, eval, 0);
        return eval;
      } else if (deep) {
        const zKey = zobristKey(pos);
        const index = zKey[0] & (ttSize - 1);
        if (tt.hash1[index] == zKey[0] && tt.hash2[index] == zKey[1]) {
          return tt.eval[index];
        }
        const eval = midGameEval(pos);
        tt.add(zKey, index, eval, 0);
        return eval;
      } else {
        return evaluation(pos);
      }
    }
  }

  const zKey = zobristKey(pos);
  const index = zKey[0] & (ttSize - 1);
  if (
    tt.hash1[index] == zKey[0] &&
    tt.hash2[index] == zKey[1] &&
    tt.depth[index] >= depth
  ) {
    return tt.eval[index];
  }

  const childPos = childPositions(pos);
  //mates and stalemates
  if (childPos.length == 0) {
    if (kingSafe(pos, false, true)) {
      return 0;
    } else if (pos[turn_] == 1) {
      return -1000 * (depth + 1);
    } else {
      return 1000 * (depth + 1);
    }
  }

  if (pos[turn_] == 1) {
    var maxEval = -Infinity;
    for (let child of childPos) {
      maxEval = max(
        maxEval,
        minimax(child, depth - 1, alph, beta, deep, ogDepth)
      );
      alph = max(alph, maxEval);
      if (beta <= maxEval) {
        break;
      }
    }
    if (ogDepth - depth > 1) {
      tt.add(zKey, index, maxEval, depth);
    }
    return maxEval;
  } else {
    var minEval = +Infinity;
    for (let child of childPos) {
      minEval = min(
        minEval,
        minimax(child, depth - 1, alph, beta, deep, ogDepth)
      );
      beta = min(beta, minEval);
      if (minEval <= alph) {
        break;
      }
    }
    if (ogDepth - depth > 1) {
      tt.add(zKey, index, minEval, depth);
    }
    return minEval;
  }
}
