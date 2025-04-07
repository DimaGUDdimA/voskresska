document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const encryptBtn = document.getElementById('encryptBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const inputText = document.getElementById('inputText');
    const errorMessage = document.getElementById('errorMessage');
    const keyContainer = document.getElementById('keyContainer');
    const gridContainer = document.getElementById('gridContainer');
    const pdfGridContainer = document.getElementById('pdfGridContainer');
    const pdfGridContainerCopy = document.getElementById('pdfGridContainerCopy');
    const pdfKeyContainer = document.getElementById('pdfKeyContainer');
    const pdfKeyContainerCopy = document.getElementById('pdfKeyContainerCopy');
    const resultContainer = document.getElementById('resultContainer');
    
    // Константы
    const MAX_SYMBOLS = 40;
    const GRID_SIZE = 12;
    const RUSSIAN_ALPHABET = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const COLUMN_LETTERS = RUSSIAN_ALPHABET.slice(0, GRID_SIZE).split('');
    
    // Модальное окно
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
    
    // Инициализация модального окна
    showModal();
    document.querySelector('.close-modal').addEventListener('click', hideModal);
    document.querySelector('.dont-show').addEventListener('click', setDontShowAgain);
    document.querySelector('.help-button').addEventListener('click', restoreHelp);
    
    // Основная функция шифрования
    function encryptText() {
        const text = inputText.value.trim().toUpperCase();
    
        // Валидация: считаем ТОЛЬКО буквы (без пробелов и знаков препинания)
        const letterCount = text.split('').filter(char => RUSSIAN_ALPHABET.includes(char)).length;
        
        if (!text) {
            showError('Пожалуйста, введите текст!');
            return;
        }
        
        if (letterCount > MAX_SYMBOLS) {
            showError(`Превышен лимит символов! Максимум — ${MAX_SYMBOLS} букв (без учета пробелов и знаков препинания).`);
            return;
        }
        
        // Очистка предыдущих результатов
        hideError();
        keyContainer.innerHTML = '';
        gridContainer.innerHTML = '';
        pdfGridContainer.innerHTML = '';
        pdfGridContainerCopy.innerHTML = '';
        pdfKeyContainer.innerHTML = '';
        pdfKeyContainerCopy.innerHTML = '';
        
        // Извлечение букв с знаками препинания
        const lettersWithPunctuation = [];
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (RUSSIAN_ALPHABET.includes(char)) {
                let punctuation = '';
                if (i + 1 < text.length && /[,.!?;:]/.test(text[i+1])) {
                    punctuation = text[i+1];
                    i++;
                }
                lettersWithPunctuation.push({
                    letter: char,
                    punctuation: punctuation
                });
            }
        }
        
        // Создание сетки
        const gridData = createGrid(lettersWithPunctuation);
        
        // Отображение ключа и сетки
        displayKey(keyContainer, gridData.key);
        displayKey(pdfKeyContainer, gridData.key);
        displayKey(pdfKeyContainerCopy, gridData.key);
        displayGrid(gridContainer, gridData.grid);
        displayGrid(pdfGridContainer, gridData.grid);
        displayGrid(pdfGridContainerCopy, gridData.grid);
        
        // Добавление линий для письма
        addWritingLines();
        
        // Показ результатов
        resultContainer.style.display = 'block';
        downloadBtn.style.display = 'block';
    }
    
    // Создание сетки и ключа
    function createGrid(letters) {
        const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
        const usedPositions = new Set();
        const key = [];
        
        // Заполнение букв текста
        letters.forEach((item, index) => {
            let row, col;
            do {
                row = Math.floor(Math.random() * GRID_SIZE);
                col = Math.floor(Math.random() * GRID_SIZE);
            } while (usedPositions.has(`${row},${col}`));
            
            usedPositions.add(`${row},${col}`);
            grid[row][col] = {
                letter: item.letter,
                punctuation: item.punctuation
            };
            
            key.push(`${COLUMN_LETTERS[col]}-${row + 1}`);
        });
        
        // Заполнение оставшихся ячеек
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (!grid[row][col]) {
                    const randomLetter = RUSSIAN_ALPHABET[Math.floor(Math.random() * RUSSIAN_ALPHABET.length)];
                    const randomPunctuation = Math.random() < 0.1 ? 
                        [',', '.', '!', '?', ';', ':'][Math.floor(Math.random() * 6)] : '';
                    grid[row][col] = {
                        letter: randomLetter,
                        punctuation: randomPunctuation
                    };
                }
            }
        }
        
        return { grid, key };
    }
    
    // Отображение ключа
    function displayKey(container, key) {
        container.style.display = 'block';
        const keyTitle = document.createElement('h3');
        keyTitle.textContent = 'Ключ:';
        container.appendChild(keyTitle);
        
        const keyList = document.createElement('div');
        keyList.className = 'key-list';
        
        key.forEach((item, index) => {
            const keyItem = document.createElement('div');
            keyItem.className = 'key-item';
            keyItem.textContent = `${index + 1}) ${item}`;
            keyList.appendChild(keyItem);
        });
        
        container.appendChild(keyList);
    }
    
    // Отображение сетки
    function displayGrid(container, grid) {
        // Заголовки столбцов
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'grid-row';
        
        // Пустая ячейка в углу
        const cornerCell = document.createElement('div');
        cornerCell.className = 'grid-cell grid-header';
        columnHeaders.appendChild(cornerCell);
        
        // Буквы столбцов
        COLUMN_LETTERS.forEach(letter => {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-cell grid-header';
            headerCell.textContent = letter;
            columnHeaders.appendChild(headerCell);
        });
        
        container.appendChild(columnHeaders);
        
        // Строки сетки
        for (let row = 0; row < GRID_SIZE; row++) {
            const gridRow = document.createElement('div');
            gridRow.className = 'grid-row';
            
            // Номер строки
            const rowHeader = document.createElement('div');
            rowHeader.className = 'grid-cell grid-header';
            rowHeader.textContent = row + 1;
            gridRow.appendChild(rowHeader);
            
            // Ячейки строки
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = grid[row][col].letter + grid[row][col].punctuation;
                gridRow.appendChild(cell);
            }
            
            container.appendChild(gridRow);
        }
    }
    
    // Добавление линий для письма
    function addWritingLines() {
        const writingLines = document.querySelectorAll('.writing-lines');
        
        writingLines.forEach(container => {
            for (let i = 0; i < 5; i++) {
                const line = document.createElement('div');
                line.className = 'line';
                container.appendChild(line);
            }
        });
    }
    
    // Скачивание PDF
    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4'
        });
        
        // Устанавливаем минимальные поля
        doc.setPage(1);
        doc.deletePage(1);
        doc.addPage([210, 297], 'p');
        
        html2canvas(resultContainer, {
            scale: 2,
            logging: false,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: null
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
            doc.save('шифровка-морской-бой.pdf');
        });
    }
    
    // Вспомогательные функции
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        inputText.style.borderColor = '#e74c3c';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
        inputText.style.borderColor = '#ddd';
    }
    
    // Обработчики событий
    encryptBtn.addEventListener('click', encryptText);
    downloadBtn.addEventListener('click', downloadPDF);
    
    inputText.addEventListener('input', function() {
        if (this.value.length > MAX_SYMBOLS) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#ddd';
            hideError();
        }
    });
});