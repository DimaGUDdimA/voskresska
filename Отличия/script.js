document.addEventListener('DOMContentLoaded', function() {
    // Константы
    const MAX_SYMBOLS = 55;
    const GRID_SIZE = 12;
    const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const COLUMN_LETTERS = RUSSIAN_ALPHABET.slice(0, GRID_SIZE).split('');

    // Элементы
    const encryptBtn = document.getElementById('encryptBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const inputText = document.getElementById('inputText');
    const errorMessage = document.getElementById('errorMessage');
    const gridContainer1 = document.getElementById('gridContainer1');
    const gridContainer2 = document.getElementById('gridContainer2');
    const pdfGridContainer1 = document.getElementById('pdfGridContainer1');
    const pdfGridContainer2 = document.getElementById('pdfGridContainer2');
    const pdfGridContainer3 = document.getElementById('pdfGridContainer3');
    const pdfGridContainer4 = document.getElementById('pdfGridContainer4');
    const pdfGridContainer5 = document.getElementById('pdfGridContainer5');
    const pdfGridContainer6 = document.getElementById('pdfGridContainer6');
    const pdfContainer = document.getElementById('pdfContainer');

    // Модальное окно
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('instructionModal').style.display = 'none';
    });
    
    document.querySelector('.dont-show').addEventListener('click', function() {
        localStorage.setItem('dontShowInstructions', 'true');
        document.getElementById('instructionModal').style.display = 'none';
    });
    
    document.querySelector('.help-button').addEventListener('click', function() {
        document.getElementById('instructionModal').style.display = 'block';
    });
    
    if (localStorage.getItem('dontShowInstructions') !== 'true') {
        document.getElementById('instructionModal').style.display = 'block';
    }

    // Шифрование
    encryptBtn.addEventListener('click', function() {
        const text = inputText.value.trim().toUpperCase().replace(/Ё/g, 'Е');
        const letterCount = text.split('').filter(char => RUSSIAN_ALPHABET.includes(char)).length;
        
        if (!text) {
            showError('Пожалуйста, введите текст!');
            return;
        }
        
        if (letterCount > MAX_SYMBOLS) {
            showError(`Превышен лимит символов! Максимум — ${MAX_SYMBOLS} букв.`);
            return;
        }
        
        hideError();
        clearContainers();
        
        const lettersWithPunctuation = extractLettersWithPunctuation(text);
        const gridData = createTwoGrids(lettersWithPunctuation);
        
        displayGrids(gridData);
        downloadBtn.style.display = 'block';
    });

    // Скачивание PDF
    downloadBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создаем PDF...';
        
        try {
            // Показываем контейнер для PDF
            pdfContainer.style.display = 'flex';
            
            // Ждем немного, чтобы контейнер успел отрендериться
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Создаем PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            });
            
            // Конвертируем в изображение
            const canvas = await html2canvas(pdfContainer, {
                scale: 3,
                logging: false,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: '#ffffff',
                windowWidth: pdfContainer.scrollWidth,
                windowHeight: pdfContainer.scrollHeight
            });
            
            // Добавляем изображение в PDF
            const imgData = canvas.toDataURL('image/png');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Рассчитываем размеры изображения для полного заполнения страницы
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            doc.save('шифровка_найди_отличия.pdf');
            
        } catch (error) {
            console.error('Ошибка при создании PDF:', error);
            showError('Произошла ошибка при создании PDF. Попробуйте еще раз.');
        } finally {
            // Всегда скрываем контейнер и восстанавливаем кнопку
            pdfContainer.style.display = 'none';
            downloadBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Скачать PDF';
            downloadBtn.disabled = false;
        }
    });

    // Вспомогательные функции
    function extractLettersWithPunctuation(text) {
        const result = [];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (RUSSIAN_ALPHABET.includes(char)) {
                let punctuation = /[,.!?;:]/.test(text[i+1]) ? text[++i] : '';
                result.push({ letter: char, punctuation });
            }
        }
        return result;
    }

    function createTwoGrids(letters) {
        const grid1 = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
        const grid2 = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
        let letterIndex = 0;
        let currentRow = 0, currentCol = 0;

        while (letterIndex < letters.length && currentRow < GRID_SIZE) {
            grid1[currentRow][currentCol] = {
                letter: letters[letterIndex].letter,
                punctuation: letters[letterIndex].punctuation,
                isOriginal: true
            };
            
            let randomLetter;
            do {
                randomLetter = RUSSIAN_ALPHABET[Math.floor(Math.random() * RUSSIAN_ALPHABET.length)];
            } while (randomLetter === letters[letterIndex].letter);
            
            grid2[currentRow][currentCol] = {
                letter: randomLetter,
                punctuation: letters[letterIndex].punctuation,
                isOriginal: false
            };
            
            letterIndex++;
            currentCol++;
            
            if (letterIndex < letters.length) {
                const gapSize = Math.min(Math.floor(Math.random() * 3) + 1, GRID_SIZE - currentCol);
                for (let i = 0; i < gapSize && currentCol < GRID_SIZE; i++) {
                    const randomLetter = RUSSIAN_ALPHABET[Math.floor(Math.random() * RUSSIAN_ALPHABET.length)];
                    const randomPunctuation = Math.random() < 0.1 ? 
                        [',', '.', '!', '?', ';', ':'][Math.floor(Math.random() * 6)] : '';
                    
                    grid1[currentRow][currentCol] = {
                        letter: randomLetter,
                        punctuation: randomPunctuation,
                        isOriginal: false
                    };
                    
                    grid2[currentRow][currentCol] = {
                        letter: randomLetter,
                        punctuation: randomPunctuation,
                        isOriginal: false
                    };
                    
                    currentCol++;
                }
            }
            
            if (currentCol >= GRID_SIZE) {
                currentRow++;
                currentCol = 0;
            }
        }

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (!grid1[row][col]) {
                    const randomLetter = RUSSIAN_ALPHABET[Math.floor(Math.random() * RUSSIAN_ALPHABET.length)];
                    const randomPunctuation = Math.random() < 0.1 ? 
                        [',', '.', '!', '?', ';', ':'][Math.floor(Math.random() * 6)] : '';
                    
                    grid1[row][col] = {
                        letter: randomLetter,
                        punctuation: randomPunctuation,
                        isOriginal: false
                    };
                    
                    grid2[row][col] = {
                        letter: randomLetter,
                        punctuation: randomPunctuation,
                        isOriginal: false
                    };
                }
            }
        }
        
        return { grid1, grid2 };
    }

    function clearContainers() {
        gridContainer1.innerHTML = '';
        gridContainer2.innerHTML = '';
        pdfGridContainer1.innerHTML = '';
        pdfGridContainer2.innerHTML = '';
        pdfGridContainer3.innerHTML = '';
        pdfGridContainer4.innerHTML = '';
        pdfGridContainer5.innerHTML = '';
        pdfGridContainer6.innerHTML = '';
    }

    function displayGrids(gridData) {
        displayGrid(gridContainer1, gridData.grid1);
        displayGrid(gridContainer2, gridData.grid2);
        displayGrid(pdfGridContainer1, gridData.grid1);
        displayGrid(pdfGridContainer2, gridData.grid2);
        displayGrid(pdfGridContainer3, gridData.grid1);
        displayGrid(pdfGridContainer4, gridData.grid2);
        displayGrid(pdfGridContainer5, gridData.grid1);
        displayGrid(pdfGridContainer6, gridData.grid2);
    }

    function displayGrid(container, grid) {
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'grid-row';
        
        const cornerCell = document.createElement('div');
        cornerCell.className = 'grid-cell grid-header';
        columnHeaders.appendChild(cornerCell);
        
        COLUMN_LETTERS.forEach(letter => {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-cell grid-header';
            headerCell.textContent = letter;
            columnHeaders.appendChild(headerCell);
        });
        
        container.appendChild(columnHeaders);
        
        for (let row = 0; row < GRID_SIZE; row++) {
            const gridRow = document.createElement('div');
            gridRow.className = 'grid-row';
            
            const rowHeader = document.createElement('div');
            rowHeader.className = 'grid-cell grid-header';
            rowHeader.textContent = row + 1;
            gridRow.appendChild(rowHeader);
            
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = grid[row][col].letter + grid[row][col].punctuation;
                gridRow.appendChild(cell);
            }
            
            container.appendChild(gridRow);
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        inputText.style.borderColor = '#e74c3c';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
        inputText.style.borderColor = '#e1c699';
    }
    
    inputText.addEventListener('input', function() {
        if (this.value.length > MAX_SYMBOLS) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1c699';
            hideError();
        }
    });
});