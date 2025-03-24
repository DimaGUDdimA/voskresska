// Обработчик для кнопки "Сгенерировать лабиринт"
document.getElementById('generateButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    console.log('Введенный текст:', inputText); // Проверка ввода

    const maze = generateMaze(30, 30); // Генерация лабиринта 30x30
    console.log('Сгенерированный лабиринт:', maze); // Проверка лабиринта

    const path = findShortestPath(maze); // Находим кратчайший путь
    const mazeWithLetters = placeLetters(maze, inputText, path); // Размещение букв
    const mazeWithRandomLetters = addRandomLetters(mazeWithLetters, path); // Добавляем случайные буквы и цифры
    console.log('Лабиринт с буквами:', mazeWithRandomLetters); // Проверка букв

    renderMaze(mazeWithRandomLetters); // Отрисовка лабиринта
});

// Генерация лабиринта с использованием алгоритма Depth-First Search (DFS)
function generateMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(1)); // 1 = стена, 0 = проход

    // Делаем периметр стеной
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                maze[y][x] = 1; // Стена по периметру
            }
        }
    }

    // Открываем вход и выход
    maze[1][0] = 0; // Вход (левая стена, вторая строка)
    maze[height - 2][width - 1] = 0; // Выход (правая стена, предпоследняя строка)

    const stack = [];
    const start = { x: 1, y: 1 }; // Начальная точка (внутри лабиринта)
    maze[start.y][start.x] = 0; // Начальная точка
    stack.push(start);

    while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = getNeighbors(current, maze);

        if (neighbors.length > 0) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[next.y][next.x] = 0; // Проход
            maze[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0; // Убираем стену между клетками
            stack.push(next);
        }
    }

    // Добавляем больше стен для усложнения лабиринта
    for (let y = 2; y < height - 2; y += 2) {
        for (let x = 2; x < width - 2; x += 2) {
            if (Math.random() < 0.3) { // 30% chance to add a wall
                maze[y][x] = 1;
            }
        }
    }

    return maze;
}

// Поиск соседних клеток для генерации лабиринта
function getNeighbors(cell, maze) {
    const directions = [
        { x: 0, y: -2 }, // Вверх
        { x: 2, y: 0 },  // Вправо
        { x: 0, y: 2 },   // Вниз
        { x: -2, y: 0 }   // Влево
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

// Размещение букв вдоль кратчайшего пути
function placeLetters(maze, word, path) {
    const letters = word.split('');

    if (path.length < letters.length + 1) { // +1 для входа
        console.error('Путь слишком короткий для размещения всех букв');
        return maze;
    }

    const step = Math.floor((path.length - 1) / letters.length); // Шаг для равномерного размещения

    for (let i = 0; i < letters.length; i++) {
        const index = i * step + 1; // Пропускаем первую клетку (вход)
        const cell = path[index];

        // Проверяем, что клетка является частью основного пути
        if (maze[cell.y][cell.x] === 0) {
            maze[cell.y][cell.x] = letters[i]; // Заменяем проход на букву
        } else {
            console.error('Буква не может быть размещена на этой клетке');
        }
    }

    return maze;
}

// Поиск кратчайшего пути (BFS)
function findShortestPath(maze) {
    const start = { x: 0, y: 1 }; // Вход (левая стена, вторая строка)
    const end = { x: maze[0].length - 1, y: maze.length - 2 }; // Выход (правая стена, предпоследняя строка)
    const queue = [{ ...start, path: [start] }];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;

        if (current.x === end.x && current.y === end.y) {
            return current.path; // Возвращаем кратчайший путь
        }

        if (!visited.has(key)) {
            visited.add(key);

            // Добавляем соседей в очередь
            const neighbors = [
                { x: current.x, y: current.y - 1 }, // Вверх
                { x: current.x + 1, y: current.y }, // Вправо
                { x: current.x, y: current.y + 1 }, // Вниз
                { x: current.x - 1, y: current.y }  // Влево
            ];

            for (const neighbor of neighbors) {
                if (
                    neighbor.x >= 0 &&
                    neighbor.x < maze[0].length &&
                    neighbor.y >= 0 &&
                    neighbor.y < maze.length &&
                    maze[neighbor.y][neighbor.x] === 0 // Проверяем, что это проход
                ) {
                    queue.push({ ...neighbor, path: [...current.path, neighbor] });
                }
            }
        }
    }

    return []; // Если путь не найден
}

// Добавление случайных букв и цифр
function addRandomLetters(maze, path) {
    const randomChars = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789'; // Русские буквы и цифры
    let added = 0;

    while (added < 30) { // Добавляем 30 случайных символов
        const x = Math.floor(Math.random() * maze[0].length);
        const y = Math.floor(Math.random() * maze.length);

        // Проверяем, что клетка не на основном пути и не является стеной
        if (maze[y][x] === 0 && !path.some(cell => cell.x === x && cell.y === y)) {
            maze[y][x] = randomChars[Math.floor(Math.random() * randomChars.length)];
            added++;
        }
    }

    return maze;
}

// Отрисовка лабиринта на странице
function renderMaze(maze) {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';

    for (let y = 0; y < maze.length; y++) {
        const row = document.createElement('div');
        row.className = 'row';

        for (let x = 0; x < maze[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (maze[y][x] === 1) { // Стена
                cell.classList.add('wall');
            } else if (typeof maze[y][x] === 'string') { // Буква
                cell.classList.add('letter');
                cell.textContent = maze[y][x];
            } else if (x === 0 && y === 1) { // Начало пути (вход)
                cell.classList.add('start');
                cell.textContent = '➡️'; // Стрелка вправо
            } else if (x === maze[0].length - 1 && y === maze.length - 2) { // Конец пути (выход)
                cell.classList.add('end');
                cell.textContent = '🏁'; // Иконка выхода
            } else { // Проход
                cell.classList.add('path');
            }

            row.appendChild(cell);
        }

        mazeContainer.appendChild(row);
    }
}

// Скачивание лабиринта как изображения
document.getElementById('downloadButton').addEventListener('click', function () {
    const mazeContainer = document.getElementById('maze');

    html2canvas(mazeContainer).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'maze.png';
        link.click();
    });
});