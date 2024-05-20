$(document).ready(function() {
    const rows = 15; // Number of rows in the game board
    const cols = 10; // Number of columns in the game board
    const colors = ['red', 'green', 'blue', 'yellow', 'purple']; // Available colors for the squares
    const gameBoard = $('#game-board'); // jQuery reference to the game board element
    const gameOverMessage = $('#game-over'); // jQuery reference to the game over message element
    const scoreElement = $('#score'); // jQuery reference to the score element
    let board = []; // 2D array representing the game board
    let gameOver = false; // Flag to check if the game is over
    let score = 0; // Variable to keep track of the score

    // Function to initialize the game board
    function createBoard() {
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
    if (i < Math.floor(rows / 2)) {
        row.push(null); // Top half of the board is empty
    } else {
        const color = colors[Math.floor(Math.random() * colors.length)];
        row.push(color); // Bottom half of the board is filled with squares
    }
}
board.push(row);
}
}

// Function to render the game board in the HTML
function renderBoard() {
    gameBoard.empty(); // Clear the existing squares
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const square = $('<div class="square"></div>'); // Create a new div for each square
            if (board[i][j] !== null) {
                square.addClass(board[i][j]); // Add the color class if the square is not empty
            }
            square.data('row', i).data('col', j); // Store the row and column in the square's data
            gameBoard.append(square); // Append the square to the game board
        }
    }
}

// Function to find all adjacent squares of the same color
function getAdjacent(row, col) {
    const color = board[row][col];
    const stack = [[row, col]];
    const visited = {};
    const group = [];

    while (stack.length) {
        const [r, c] = stack.pop();
        const key = `${r},${c}`;
        if (visited[key] || r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== color) {
            continue;
        }
        visited[key] = true;
        group.push([r, c]);
        stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
    }

    return group.length >= 3 ? group : []; // Return the group if it has 3 or more squares
}

// Function to remove a group of squares and shift the remaining squares down
function removeGroup(group) {
    group.forEach(([r, c]) => {
        board[r][c] = null; // Remove the square by setting it to null
    });

    for (let c = 0; c < cols; c++) {
        let emptySpaces = 0;
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][c] === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                board[r + emptySpaces][c] = board[r][c];
                board[r][c] = null;
            }
        }
    }

    // Update the score
    score += group.length;
    scoreElement.text(`Score: ${score}`);
}

// Function to add a new line of squares at the bottom
function addNewLine() {
    if (gameOver) return; // Do nothing if the game is over

    // Move all rows up by one
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols; c++) {
            board[r][c] = board[r + 1][c];
        }
    }

    // Add a new line of squares at the bottom
    for (let c = 0; c < cols; c++) {
        board[rows - 1][c] = colors[Math.floor(Math.random() * colors.length)];
    }
    renderBoard(); // Re-render the game board

    // Check for game over condition
    for (let c = 0; c < cols; c++) {
        if (board[0][c] !== null) {
            gameOver = true;
            gameOverMessage.show();
            break;
        }
    }
}

// Event handler for clicking a square
gameBoard.on('click', '.square', function() {
    if (gameOver) return; // Do nothing if the game is over

    const row = $(this).data('row');
    const col = $(this).data('col');
    const group = getAdjacent(row, col); // Get the group of adjacent squares
    if (group.length > 0) {
        removeGroup(group); // Remove the group if it exists
        renderBoard(); // Re-render the game board
    }
});

createBoard(); // Initialize the game board
renderBoard(); // Render the initial game board

setInterval(addNewLine, 5000); // Add a new line every 5 seconds
});
