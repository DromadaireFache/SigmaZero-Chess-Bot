const ttSize = 0x1000000;

class transpositionTable {
  constructor() {
    this.hash1 = [];
    this.hash2 = [];
    this.eval = [];
    this.depth = [];
    for (let i = 0; i < ttSize; i++) {
      this.hash1.push(NaN);
      this.hash2.push(NaN);
      this.eval.push(NaN);
      this.depth.push(NaN);
    }
  }
  reset() {
    for (let i = 0; i < ttSize; i++) {
      this.hash1[i] = NaN;
      this.hash2[i] = NaN;
      this.eval[i] = NaN;
      this.depth[i] = NaN;
    }
  }
  add(zKey, index, evaluation, depth) {
    if (isNaN(this.hash1[index]) || depth > this.depth[index]) {
      this.hash1[index] = zKey[0];
      this.hash2[index] = zKey[1];
      this.eval[index] = evaluation;
      this.depth[index] = depth;
    }
  }
  softReset() {
    for (let i = 0; i < ttSize; i++) {
      if (this.depth[i] == 0) {
        this.hash1[i] = NaN;
        this.hash2[i] = NaN;
        this.eval[i] = NaN;
        this.depth[i] = NaN;
      } else if (!isNaN(this.hash1[i])) {
        this.depth[i]--;
      }
    }
  }
}

let hashValues1 = [],
  hashValues2 = [],
  tt = new transpositionTable();

const hashValueIndex = [
  0,
  64,
  128,
  192,
  256,
  320,
  0,
  384,
  448,
  512,
  576,
  640,
  704,
];

function zobristInitialization() {
  //randomSeed(1);
  for (let i = 0; i < 783; i++) {
    hashValues1.push(random(0xffffffff));
    hashValues2.push(random(0xffffffff));
  }
}

function zobristKey(pos) {
  let hash1 = 0,
    hash2 = 0;
  for (let i = 0; i < 64; i++) {
    if (pos[i] == 0) {
      hash1 ^= hashValues1[768];
      hash2 ^= hashValues2[768];
    } else {
      hash1 ^= hashValues1[hashValueIndex[6 - pos[i]] + i];
      hash2 ^= hashValues2[hashValueIndex[6 - pos[i]] + i];
    }
  }
  hash1 ^=
    ((pos[turn_] == -1) * hashValues1[769]) ^
    (pos[65] * hashValues1[770]) ^
    (pos[66] * hashValues1[771]) ^
    (pos[67] * hashValues1[772]) ^
    (pos[68] * hashValues1[773]) ^
    hashValues1[774 + pos[enPassant_]];
  hash2 ^=
    ((pos[turn_] == -1) * hashValues2[769]) ^
    (pos[65] * hashValues2[770]) ^
    (pos[66] * hashValues2[771]) ^
    (pos[67] * hashValues2[772]) ^
    (pos[68] * hashValues2[773]) ^
    hashValues2[774 + pos[enPassant_]];
  return [hash1, hash2];
}
