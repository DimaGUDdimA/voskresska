// Управление модальным окном
function shouldShowModal() {
    return localStorage.getItem('dontShowInstructions') !== 'true';
}

function showModal() {
    if (shouldShowModal()) {
        document.getElementById('instructionModal').style.display = 'block';
    }
}

function hideModal() {
    document.getElementById('instructionModal').style.display = 'none';
}

function setDontShowAgain() {
    localStorage.setItem('dontShowInstructions', 'true');
    hideModal();
}

function restoreHelp() {
    localStorage.removeItem('dontShowInstructions');
    showModal();
}

// Основная логика
document.addEventListener('DOMContentLoaded', function() {
    // Модальное окно
    showModal();
    document.querySelector('.close-modal').addEventListener('click', hideModal);
    document.querySelector('.dont-show').addEventListener('click', setDontShowAgain);
    document.querySelector('.help-button').addEventListener('click', restoreHelp);

    // Генерация лабиринта
    document.getElementById('generateButton').addEventListener('click', function() {
        const inputText = document.getElementById('inputText').value;
        if (!inputText.trim()) {
            alert('Пожалуйста, введите ссылку на стих');
            return;
        }
        
        const maze = generateMaze(30, 30);
        const path = findShortestPath(maze);
        const mazeWithLetters = placeLetters(maze, inputText, path);
        const mazeWithRandomLetters = addRandomLetters(mazeWithLetters, path);
        renderMaze(mazeWithRandomLetters);
    });

    // Скачивание лабиринта
    document.getElementById('downloadButton').addEventListener('click', function() {
        const mazeContainer = document.getElementById('maze');
        if (!mazeContainer.innerHTML.trim()) {
            alert('Сначала сгенерируйте лабиринт');
            return;
        }
        
        html2canvas(mazeContainer).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'bible_maze.png';
            link.click();
        });
    });
});

// Функции генерации лабиринта (без изменений)
function generateMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(1));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                maze[y][x] = 1;
            }
        }
    }

    maze[1][0] = 0;
    maze[height - 2][width - 1] = 0;

    const stack = [];
    const start = { x: 1, y: 1 };
    maze[start.y][start.x] = 0;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = getNeighbors(current, maze);

        if (neighbors.length > 0) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[next.y][next.x] = 0;
            maze[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
            stack.push(next);
        }
    }

    for (let y = 2; y < height - 2; y += 2) {
        for (let x = 2; x < width - 2; x += 2) {
            if (Math.random() < 0.3) {
                maze[y][x] = 1;
            }
        }
    }

    return maze;
}

function getNeighbors(cell, maze) {
    const directions = [
        { x: 0, y: -2 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: -2, y: 0 }
    ];
    const neighbors = [];

    for (const dir of directions) {
        const x = cell.x + dir.x;
        const y = cell.y + dir.y;

        if (x >= 0 && x < maze[0].length && y >= 0 && y < maze.length && maze[y][x] === 1) {
            neighbors.push({ x, y });
        }
    }

    return neighbors;
}

function placeLetters(maze, word, path) {
    const letters = word.split('');

    if (path.length < letters.length + 1) {
        console.error('Путь слишком короткий');
        return maze;
    }

    const step = Math.floor((path.length - 1) / letters.length);

    for (let i = 0; i < letters.length; i++) {
        const index = i * step + 1;
        const cell = path[index];

        if (maze[cell.y][cell.x] === 0) {
            maze[cell.y][cell.x] = letters[i];
        } else {
            console.error('Буква не может быть размещена');
        }
    }

    return maze;
}

function findShortestPath(maze) {
    const start = { x: 0, y: 1 };
    const end = { x: maze[0].length - 1, y: maze.length - 2 };
    const queue = [{ ...start, path: [start] }];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;

        if (current.x === end.x && current.y === end.y) {
            return current.path;
        }

        if (!visited.has(key)) {
            visited.add(key);

            const neighbors = [
                { x: current.x, y: current.y - 1 },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y }
            ];

            for (const neighbor of neighbors) {
                if (
                    neighbor.x >= 0 &&
                    neighbor.x < maze[0].length &&
                    neighbor.y >= 0 &&
                    neighbor.y < maze.length &&
                    maze[neighbor.y][neighbor.x] === 0
                ) {
                    queue.push({ ...neighbor, path: [...current.path, neighbor] });
                }
            }
        }
    }

    return [];
}

function addRandomLetters(maze, path) {
    const randomChars = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789';
    let added = 0;

    while (added < 30) {
        const x = Math.floor(Math.random() * maze[0].length);
        const y = Math.floor(Math.random() * maze.length);

        if (maze[y][x] === 0 && !path.some(cell => cell.x === x && cell.y === y)) {
            maze[y][x] = randomChars[Math.floor(Math.random() * randomChars.length)];
            added++;
        }
    }

    return maze;
}

function renderMaze(maze) {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';

    for (let y = 0; y < maze.length; y++) {
        const row = document.createElement('div');
        row.className = 'row';

        for (let x = 0; x < maze[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (maze[y][x] === 1) {
                cell.classList.add('wall');
            } else if (typeof maze[y][x] === 'string') {
                cell.classList.add('letter');
                cell.textContent = maze[y][x];
            } else if (x === 0 && y === 1) {
                cell.classList.add('start');
                cell.textContent = '➡️';
            } else if (x === maze[0].length - 1 && y === maze.length - 2) {
                cell.classList.add('end');
                cell.textContent = '🏁';
            } else {
                cell.classList.add('path');
            }

            row.appendChild(cell);
        }

        mazeContainer.appendChild(row);
    }
}