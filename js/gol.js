var GameOfLife = function(cellSize, canvasWidth, canvasHeight) {
  this.cellSize = cellSize;
  this.cols = Math.floor((canvasWidth)/cellSize);
  this.rows = Math.floor((canvasHeight-100)/cellSize);
  this.board = this.initBoard();
};

GameOfLife.prototype.initBoard = function() {
  var board = [];
  for(var x = 0; x < this.cols; x++) {
    board[x] = (!board[x]) ? [] : board[x];
    for(var y = 0; y < this.rows; y++) {
      board[x][y] = (Math.random() > 0.5) ? 0 : 1;
    }
  }
  return board;
};

GameOfLife.prototype.spawn = function() {
  var game = this;
  var child = this.board.map(function(col, x) {
    return col.map(function(cell, y) {
      var neighborCount = game.getNeighborCount(x, y);
      return game.getChild(cell, neighborCount);
    });
  });
  this.board = child;
};

GameOfLife.prototype.getNeighborCount = function(x, y) {
  var neighborCount = 0;
  var col, row;
  for(var i = -1; i <= 1; i++) {
    for(var p = -1; p <= 1; p++) {
      col = i + x;
      row = p + y;

      //dont count self.
      if(i === 0 && p === 0) { continue; }

      //with wrap around cells.
      if(col === -1) { col = this.board.length -1; }
      else if (col === this.board.length) { col = 0; }

      if(row === -1) { row = this.board[0].length -1; }
      else if (row === this.board[0].length) { row = 0; }

      neighborCount += this.board[col][row];
    }
  }
  return neighborCount;
};

GameOfLife.prototype.getChild = function(currentState, neighborCount) {
  if(currentState === 1 && neighborCount < 2) { return 0; }
  if(currentState === 1 && neighborCount > 3) { return 0; }
  if(currentState === 0 && neighborCount === 3) { return 1; }
  return currentState;
};
