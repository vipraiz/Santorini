let gameState = 0;

const gameBoard = document.querySelector('.game-board');
const stat = document.querySelector('.game-info__status');
const turnCounter = document.querySelector('.game-info__turn-counter');
const cells = [...gameBoard.querySelectorAll('TD')];
let activePlayer = 1;

const boardInfo = {
  workers: [
    [-1, -1],
    [-1, -1],
    [-1, -1],
    [-1, -1],
  ],
  spaces: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  turn: 0,
};

function highlightActivePlayer() {
  for (let i = 0; i < 2; i++) {
    const worker = (activePlayer - 1) * 2 + i;
    cells[boardInfo.workers[worker][0] * 5 + boardInfo.workers[worker][1]].querySelector(`.game-board__player-${activePlayer}`).classList.add('player-active');
  }
  const nonActivePlayer = activePlayer === 1 ? 2 : 1;
  for (let i = 0; i < 2; i++) {
    const worker = (nonActivePlayer - 1) * 2 + i;
    cells[boardInfo.workers[worker][0] * 5 + boardInfo.workers[worker][1]].querySelector(`.game-board__player-${nonActivePlayer}`).classList.remove('player-active');
  }
}

let chosenWorker = -1;

function changeStatus(text) {
  stat.textContent = text;
}

function changeTurnCounter() {
  turnCounter.querySelector('span').textContent = ++boardInfo.turn;
}

const gameBoardListener = (e) => {
  if (e.target.tagName !== 'TD') return;
  const index = cells.indexOf(e.target);
  let x = Math.floor(index / 5),
    y = index % 5;
  switch (gameState) {
    case 0:
      setWorker(x, y);
      break;
    case 1:
      chooseWorker(x, y);
      break;
    case 2:
      if (moveToCell(x, y)) {
        changeStatus(`${activePlayer === 1 ? 'Первый' : 'Второй'} игрок думает где построить`);
        highlightActivePlayer();
      }
      break;
    case 3:
      if (buildLevel(x, y)) {
        changeStatus(`${activePlayer === 1 ? 'Первый' : 'Второй'} игрок думает куда пойти`);
      }
      break;
  }
};
gameBoard.addEventListener('click', gameBoardListener);

let workerNum = 0;
function setWorker(x, y) {
  // пропуск, если клетка занята рабочим
  for (let i = 0; i < boardInfo.workers.length; i++) {
    if (boardInfo.workers[i][0] === x && boardInfo.workers[i][1] === y) return false;
  }
  boardInfo.workers[workerNum] = [x, y];
  cells[x * 5 + y].innerHTML += `<span class="game-board__player-${workerNum < 2 ? '1' : '2'}"></span>`;
  if (workerNum === 1) {
    activePlayer = 2;
    changeStatus(`${activePlayer === 1 ? 'Первый' : 'Второй'} игрок расставляет рабочих`);
  }
  if (workerNum === 3) {
    activePlayer = 1;
    changeStatus(`${activePlayer === 1 ? 'Первый' : 'Второй'} игрок думает куда пойти`);
    highlightActivePlayer();
    changeTurnCounter();
    gameState = 1;
  } else workerNum++;
  return true;
}

function chooseWorker(x, y) {
  for (let i = 0; i < 2; i++) {
    const work = (activePlayer - 1) * 2;
    if (boardInfo.workers[i + work][0] === x && boardInfo.workers[i + work][1] === y) {
      cells[x * 5 + y].querySelector(`.game-board__player-${activePlayer}`).classList.add('worker-selected');
      gameState = 2;
      chosenWorker = i + work;
      return true;
    }
  }
  return false;
}

function isCellFree(x, y) {
  for (let i = 0; i < boardInfo.workers.length; i++) {
    if (boardInfo.workers[i][0] === x && boardInfo.workers[i][1] === y) return false;
  }
  return boardInfo.spaces[x][y] !== 4; // пропуск, если стоит купол
}

function isNeighbor(x, y) {
  const cords = boardInfo.workers[chosenWorker];
  if (cords[0] === x && cords[1] === y) return false;
  return Math.abs(cords[0] - x) < 2 && Math.abs(cords[1] - y) < 2;
}

function moveToCell(x, y) {
  const workerCords = boardInfo.workers[chosenWorker];
  if (workerCords[0] === x && workerCords[1] === y) {
    cells[workerCords[0] * 5 + workerCords[1]].querySelector('.worker-selected').classList.remove('worker-selected');
    gameState = 1;
  }
  const isTooHigh = () => {
    return boardInfo.spaces[x][y] - boardInfo.spaces[workerCords[0]][workerCords[1]] > 1;
  };
  if (!isCellFree(x, y) || !isNeighbor(x, y) || isTooHigh()) return false;
  // переносим рабочего в новое место
  cells[workerCords[0] * 5 + workerCords[1]].removeChild(gameBoard.querySelector('.worker-selected'));
  cells[x * 5 + y].innerHTML += `<span class="game-board__player-${activePlayer} worker-selected"></span>`;
  boardInfo.workers[chosenWorker] = [x, y];

  if (boardInfo.spaces[x][y] === 3) return endGame();

  gameState = 3;
  return true;
}

function buildLevel(x, y) {
  if (!isCellFree(x, y) || !isNeighbor(x, y)) return false;
  // переносим рабочего в новое место
  boardInfo.spaces[x][y] += 1;
  cells[x * 5 + y].innerHTML += `<span class="game-board__level-${boardInfo.spaces[x][y]}"></span>`;
  if (towerLevelCheckbox.checked) {
    cells[x * 5 + y].querySelector('.tower-level').textContent = boardInfo.spaces[x][y].toString();
  }

  const workerCords = boardInfo.workers[chosenWorker];
  cells[workerCords[0] * 5 + workerCords[1]].querySelector(`.game-board__player-${activePlayer}`).classList.remove('worker-selected');

  activePlayer = activePlayer === 1 ? 2 : 1;
  highlightActivePlayer();
  changeTurnCounter();
  gameState = 1;
  return true;
}

function endGame() {
  gameBoard.removeEventListener('click', gameBoardListener);
  changeStatus(`Победил ${activePlayer === 1 ? 'первый' : 'второй'} игрок!`);
}

function startGame() {
  changeStatus('Первый игрок расставляет рабочих');
}
startGame();
