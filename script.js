$(document).ready(function() {
    const rows = 15; // Number of rows in the game board
    const cols = 10; // Number of columns in the game board
    const colors = ['red', 'green', 'blue', 'yellow', 'purple']; // Available colors for the squares
    const gameBoard = $('#game-board'); // jQuery reference to the game board
    const gameOverMessage = $('#game-over'); // jQuery reference to the game over message
    const scoreElement = $('#score'); // jQuery reference to the score
    const timerElement = $('#timer'); // JQuery reference to the timer
    const levelElement = $('#level'); // JQuery reference to the level
    const scoreboardElement = $('#scoreboard'); // JQuery reference to the scoreboard
    const scoreListElement = $('#score-list'); // JQuery reference to the score list
    const scoreOverlayElement = $('#score-overlay'); // JQuery reference to the score overlay
    const scoreformElement = $('#score-form'); // JQuery reference to the score form
    const playerNameInput = $('#player-name'); // JQuery reference to player name
    const saveScoreButton = $('#save-score'); // JQuery reference to save score button
    let board = []; // 2D array representing the game board
    let gameOver = false; // Flag to check if the game is over
    let score = 0; // Variable to keep track of the score
    let level = 1; // Variable to keep track of the level
    let intervalId = null; // Variable to hold the interval timer
    let elapsedTime = 0; // Variable to keep track of elapsed time
    let timeUntilNewLine = 5; // Counter for adding a new line every 5 seconds

// Show the overlay and play button when the page is loaded
$('#overlay').show();

// Event listener for the play button
$('#play-button').on('click', function() {
    // Hide the overlay and play button
    $('#overlay').hide();
    playBGMusic();
});

// Function to play background music on loop
function playBGMusic() {
    const bgMusic = document.getElementById('bg-music');
    bgMusic.play();
}

// Function to pause background music
function pauseBGMusic() {
    const bgMusic = document.getElementById('bg-music');
    bgMusic.pause();
}

// Function to play game over sound
function playGameOverSound() {
    const gameOverSound = document.getElementById('gameover-sound');
    gameOverSound.play();
}

// Function to play game over sound
function playSquareDestroySound() {
    const squareDestroySound = document.getElementById('square-destroy-sound');
    squareDestroySound.currentTime = 0;
    squareDestroySound.play();
}

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

// Function to clear the game board and reset the game
function resetBoard() {
    board = []; //clear board
    gameOver = false;
    score = 0;
    elapsedTime = 0;
    level = 1;
    scoreElement.text(`Score: ${score}`); // reset score display
    timerElement.text(`Time: ${elapsedTime}s`); // reset timer
    levelElement.text(`Level: ${level}`); // reset level
    gameOverMessage.hide();
    if (intervalId) {
        clearInterval(intervalId); // Stop the interval timer if it's running
        intervalId = null;
    }
    createBoard();
    renderBoard();
}

// Function to start the interval timer for adding new lines
function startNewLineTimer() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    intervalId = setInterval(() => {
        elapsedTime++; // Increment elapsed time by 1 second
        timerElement.text(`Time: ${elapsedTime}s`); // update timer

        timeUntilNewLine--; //Decrement the time until new line is added
        if (timeUntilNewLine <= 0) {
            addNewLine();
            // Decrease interval between spawns based on level but ensure it doesn't go below 1 to avoid 0 second spawns
            timeUntilNewLine = Math.max(1, 5 - (level - 1));
        }
    }, 1000); // Update every second
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

    if (score >= level * 30) { // levelUp multiplier
        level++;
        levelElement.text(`Level: ${level}`); // update level display
        timeUntilNewLine--; //levelUp means less time between new line spawns
    }
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
            scoreOverlayElement.show();
            scoreformElement.show();
            clearInterval(intervalId); // Stop the interval timer if the game is over
            intervalId = null;
            pauseBGMusic();
            playGameOverSound();
            break;
        }
    }
}

// Event handler for clicking a square
gameBoard.on('click', '.square', function() {
    if (gameOver) return; // Do nothing if the game is over

    $(this).animate({opacity: "0.5"}, 100).animate({opacity: "1"}, 100);

    const row = $(this).data('row');
    const col = $(this).data('col');

    if (board[row][col] === null) return; // Prevent clicking on empty squares to gain points

    const group = getAdjacent(row, col); // Get the group of adjacent squares
    if (group.length > 0) {
        playSquareDestroySound();
        removeGroup(group); // Remove the group if it exists
        renderBoard(); // Re-render the game board

        // Start the new line timer if it's not running already
        if (!intervalId) {
            startNewLineTimer();
        }
    }
});

// Reset board button
$('#restart-btn').on('click', function() {
    playBGMusic();
    resetBoard(); // Clear board and reset game if clicked
});

// Save scores button
saveScoreButton.on('click', function() {
    const playerName = playerNameInput.val().trim(); //get player name
    if (playerName === '') {
        alert('Please enter your name.');
        return;
    }

    // save new score
    const newScore = {
        name: playerName,
        score: score,
        level: level,
        time: elapsedTime
    };

    // Get existing scores from localStorage
    const scores = JSON.parse(localStorage.getItem('scores')) || [];

    scores.push(newScore);

    // Sort scores array by score in descending order
    scores.sort((a,b) => b.score - a.score);

    // Update localStorage with the updated scores array
    localStorage.setItem('scores', JSON.stringify(scores));

    scoreformElement.hide();
    scoreOverlayElement.hide();
    displayScoreboard(scores);

});

function displayScoreboard(scores) {
    scoreListElement.empty(); // Clear existing scoreboard
    scores.slice(0, 10).forEach(score => {
        const listItem = $('<li></li>').text(`${score.name}: ${score.score} (Level: ${score.level}, Time: ${score.time}s)`);
        scoreListElement.append(listItem);
    });
    scoreboardElement.show();
}



//Display the scoreboard when the game loads
const scores = JSON.parse(localStorage.getItem('scores')) || [];
displayScoreboard(scores);

// reset board when the game loads
resetBoard();

});
