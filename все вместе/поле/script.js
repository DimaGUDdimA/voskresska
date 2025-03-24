document.addEventListener('DOMContentLoaded', function() {
    const MAX_SYMBOLS = 100;
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const inputText = document.getElementById('inputText');
    const errorMessage = document.getElementById('errorMessage');
    const resultContainer = document.getElementById('resultContainer');
    const resultColumn1 = document.getElementById('resultColumn1');
    const resultColumn2 = document.getElementById('resultColumn2');
    const downloadSection = document.getElementById('downloadSection');

    generateBtn.addEventListener('click', generateTask);
    downloadBtn.addEventListener('click', downloadTask);

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        inputText.style.borderColor = '#e74c3c';
    }

    function hideError() {
        errorMessage.style.display = 'none';
        inputText.style.borderColor = '#ddd';
    }

    function generateTask() {
        const text = inputText.value.trim();
        
        if (!text) {
            showError('Пожалуйста, введите текст!');
            return;
        }

        if (text.length > MAX_SYMBOLS) {
            showError('Ух ты! Так много букв! Давайте сделаем поменьше. Пожалейте детей)');
            return;
        }

        hideError();
        resultColumn1.innerHTML = '';
        resultColumn2.innerHTML = '';
        
        const letters = [];
        let currentNumber = 1;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (/[а-яА-ЯёЁa-zA-Z\s]/.test(char)) {
                letters.push({
                    number: currentNumber++,
                    char: char
                });
            } 
            else if (/[,.!?;:]/.test(char) && letters.length > 0) {
                letters[letters.length - 1].char += char;
            }
        }

        const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);

        function fillColumn(column, letters) {
            if (letters.length === 0) return;
            
            const optimalSize = calculateOptimalSize(letters.length);
            
            letters.forEach(letter => {
                const card = document.createElement('div');
                card.className = 'letter-card';
                card.style.width = `${optimalSize}px`;
                card.style.height = `${optimalSize}px`;
                card.innerHTML = `
                    <div class="letter-number">${letter.number}</div>
                    <div class="letter-char">${letter.char}</div>
                `;
                column.appendChild(card);
            });
        }

        function calculateOptimalSize(lettersCount) {
            const minSize = 40;
            const maxSize = 80;
            const columns = Math.ceil(Math.sqrt(lettersCount));
            const availableWidth = resultColumn1.clientWidth - 30;
            return Math.min(maxSize, Math.max(minSize, Math.floor(availableWidth / columns)));
        }

        fillColumn(resultColumn1, shuffledLetters);
        fillColumn(resultColumn2, shuffledLetters);

        document.querySelectorAll('.writing-lines').forEach(container => {
            container.innerHTML = `
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            `;
        });

        resultContainer.style.display = 'block';
        downloadBtn.disabled = false;
        downloadBtn.classList.add('active');
    }

    function downloadTask() {
        if (!this.classList.contains('active')) return;
        
        // Скрываем кнопку перед созданием изображения
        downloadSection.style.display = 'none';
        
        html2canvas(resultContainer, {
            scale: 2,
            width: 794,
            height: 1123,
            logging: false,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: 'white'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'детское-задание.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Показываем кнопку обратно после скачивания
            downloadSection.style.display = 'flex';
        }).catch(err => {
            console.error('Error:', err);
            downloadSection.style.display = 'flex';
            alert('Ошибка при создании изображения. Попробуйте снова.');
        });
    }

    inputText.addEventListener('input', function() {
        if (this.value.length > MAX_SYMBOLS) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#ddd';
            hideError();
        }
    });
});