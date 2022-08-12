const controlPanel = document.querySelector('.control-panel');
const towerLevelCheckbox = controlPanel.querySelector('#tower-level');
const confirmButton = controlPanel.querySelector('confirm-turn');
const cancelButton = controlPanel.querySelector('cancel-turn');

towerLevelCheckbox.addEventListener('change', (e) => {
  if (e.target.checked) {
    cells.forEach((cell, index) => {
      const num = boardInfo.spaces[Math.floor(index / 5)][index % 5];
      cell.innerHTML += `<span class="tower-level">${num ? num : ''}</span>`;
    });
  } else {
    cells.forEach((cell) => cell.removeChild(cell.querySelector('.tower-level')));
  }
});

// document.addEventListener('keyup', function (event) {
//   console.log('Key: ', event.key);
// });
