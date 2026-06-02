const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const aiFirstCheckbox = document.getElementById('ai-first');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let aiPlayer = 'O';
let humanPlayer = 'X';

const winningConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

function createBoard() {
    boardElement.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
}

function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);

    if (
        board[index] !== '' ||
        !gameActive ||
        currentPlayer !== humanPlayer
    ) {
        return;
    }

    makeMove(index, humanPlayer);
}

function makeMove(index, player) {
    board[index] = player;

    const cells = boardElement.children;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());

    if (checkWin(player)) {
        statusElement.textContent =
            player === humanPlayer
                ? "🎉 You Win!"
                : "🤖 AI Wins!";

        gameActive = false;
        return;
    }

    if (board.every(cell => cell !== '')) {
        statusElement.textContent = "🤝 It's a Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = player === 'X' ? 'O' : 'X';

    statusElement.textContent =
        currentPlayer === humanPlayer
            ? `Your turn (${humanPlayer})`
            : `AI thinking...`;

    if (currentPlayer === aiPlayer && gameActive) {
        setTimeout(aiMove, 350);
    }
}

function aiMove() {
    if (!gameActive || currentPlayer !== aiPlayer) return;

    const bestMove = minimax(board, aiPlayer).index;
    makeMove(bestMove, aiPlayer);
}

function minimax(newBoard, player, alpha = -Infinity, beta = Infinity) {

    const availSpots = newBoard.reduce(
        (acc, val, idx) =>
            val === '' ? acc.concat(idx) : acc,
        []
    );

    if (checkWinForBoard(newBoard, humanPlayer))
        return { score: -10 };

    if (checkWinForBoard(newBoard, aiPlayer))
        return { score: 10 };

    if (availSpots.length === 0)
        return { score: 0 };

    let bestMove =
        player === aiPlayer
            ? { score: -Infinity }
            : { score: Infinity };

    for (let i of availSpots) {

        newBoard[i] = player;

        const result = minimax(
            newBoard,
            player === aiPlayer
                ? humanPlayer
                : aiPlayer,
            alpha,
            beta
        );

        newBoard[i] = '';

        if (player === aiPlayer) {

            if (result.score > bestMove.score) {
                bestMove.score = result.score;
                bestMove.index = i;
            }

            alpha = Math.max(alpha, result.score);

        } else {

            if (result.score < bestMove.score) {
                bestMove.score = result.score;
                bestMove.index = i;
            }

            beta = Math.min(beta, result.score);
        }

        if (beta <= alpha) break;
    }

    return bestMove;
}

function checkWinForBoard(boardState, player) {
    return winningConditions.some(condition =>
        condition.every(index =>
            boardState[index] === player
        )
    );
}

function checkWin(player) {
    return checkWinForBoard(board, player);
}

function resetGame() {

    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    humanPlayer = 'X';
    aiPlayer = 'O';

    createBoard();

    if (aiFirstCheckbox.checked) {

        currentPlayer = aiPlayer;
        statusElement.textContent = 'AI thinking...';

        setTimeout(aiMove, 400);

    } else {

        currentPlayer = humanPlayer;
        statusElement.textContent =
            `Your turn (${humanPlayer})`;
    }
}

resetBtn.addEventListener('click', resetGame);
aiFirstCheckbox.addEventListener('change', resetGame);

resetGame();
