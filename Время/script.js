document.addEventListener('DOMContentLoaded', function() {
    // Основные элементы
    const elements = {
        inputText: document.getElementById('inputText'),
        generateBtn: document.getElementById('generateBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        errorMessage: document.getElementById('errorMessage'),
        resultContainer: document.getElementById('resultContainer'),
        keyDisplay: document.getElementById('keyDisplay'),
        clocksContainer: document.getElementById('clocksContainer'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        helpButton: document.getElementById('helpButton'),
        homeButton: document.getElementById('homeButton'),
        modalOverlay: document.getElementById('modalOverlay'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),
        disableHelpButton: document.getElementById('disableHelpButton')
    };

    // Проверка библиотек
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
        showError('Библиотеки не загрузились. Обновите страницу.');
        return;
    }

    const { jsPDF } = window.jspdf;

    // Инициализация модального окна
    const helpModal = {
        showOnLoad: localStorage.getItem('showHelp') !== 'false',
        init: function() {
            if (this.showOnLoad) {
                this.show();
            }
        },
        show: function() {
            elements.modalOverlay.classList.remove('hidden');
        },
        hide: function() {
            elements.modalOverlay.classList.add('hidden');
        },
        disable: function() {
            localStorage.setItem('showHelp', 'false');
            this.hide();
        }
    };

    // Универсальная функция для навигации
    function navigateToHome() {
        // Для GitHub Pages
        if (window.location.host.includes('github.io')) {
            const pathParts = window.location.pathname.split('/');
            const repoName = pathParts[1];
            window.location.href = `/${repoName}/index.html`;
        } 
        // Для локального использования
        else {
            window.location.href = '../index.html';
        }
    }

    // Обработчики событий
    elements.generateBtn.addEventListener('click', generateCipher);
    elements.downloadBtn.addEventListener('click', downloadResult);
    elements.helpButton.addEventListener('click', helpModal.show);
    elements.homeButton.addEventListener('click', navigateToHome);
    elements.modalCloseBtn.addEventListener('click', helpModal.hide);
    elements.disableHelpButton.addEventListener('click', () => {
        helpModal.disable();
        helpModal.hide();
    });

    // Инициализация
    helpModal.init();

    function generateRandomTime() {
        const hours = Math.floor(Math.random() * 12);
        const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(Math.random() * 12)];
        return {
            hours: hours === 0 ? 12 : hours,
            minutes: minutes,
            string: `${hours}:${minutes.toString().padStart(2, '0')}`
        };
    }

    function generateCipher() {
        resetUI();
        
        const text = elements.inputText.value.trim();
        if (!validateInput(text)) return;
        
        const normalizedText = normalizeText(text);
        const { charMap, fragment } = processText(normalizedText);
        
        displayResults(charMap, fragment);
    }
    
    function resetUI() {
        elements.errorMessage.style.display = 'none';
        elements.clocksContainer.innerHTML = '';
        elements.keyDisplay.innerHTML = '';
        elements.downloadBtn.classList.add('hidden');
    }
    
    function validateInput(text) {
        if (!text) {
            showError('Введите текст для шифровки');
            return false;
        }
        
        if (text.length > 55) {
            showError('Слишком длинный текст. Введите до 55 символов.');
            return false;
        }
        
        return true;
    }
    
    function normalizeText(text) {
        return text.normalize('NFC')
            .replace(/ё/g, 'е')
            .replace(/Ё/g, 'Е');
    }
    
    function processText(text) {
        const charMap = new Map();
        const fragment = document.createDocumentFragment();
        
        for (const char of text) {
            if (/[а-яА-Я]/.test(char)) {
                processLetter(char, charMap, fragment);
            } else {
                fragment.appendChild(createPunctuationElement(char));
            }
        }
        
        return { charMap, fragment };
    }
    
    function processLetter(char, charMap, fragment) {
        const lowerChar = char.toLowerCase();
        if (!charMap.has(lowerChar)) {
            charMap.set(lowerChar, generateRandomTime());
        }
        fragment.appendChild(createClockElement(charMap.get(lowerChar)));
    }
    
    function displayResults(charMap, fragment) {
        displayKey(charMap);
        elements.clocksContainer.appendChild(fragment);
        elements.resultContainer.style.display = 'block';
        elements.downloadBtn.classList.remove('hidden');
    }
    
    function displayKey(charMap) {
        const shuffledEntries = Array.from(charMap.entries()).sort(() => Math.random() - 0.5);
        
        const keyItems = shuffledEntries.map(([char, time]) => {
            return `${char}: ${time.string}; `;
        }).join('');
        
        elements.keyDisplay.textContent = keyItems;
    }
    
    function createClockElement(time) {
        const clockContainer = document.createElement('div');
        clockContainer.className = 'clock-container';
        
        const clockFace = document.createElement('div');
        clockFace.className = 'clock-face';
        
        for (let i = 0; i < 12; i++) {
            const mark = document.createElement('div');
            mark.className = 'clock-mark';
            mark.style.transform = `rotate(${i * 30}deg)`;
            clockFace.appendChild(mark);
        }
        
        const numbers = [
            { value: 12, className: 'clock-number-12' },
            { value: 3, className: 'clock-number-3' },
            { value: 6, className: 'clock-number-6' },
            { value: 9, className: 'clock-number-9' }
        ];
        
        numbers.forEach(num => {
            const number = document.createElement('div');
            number.className = `clock-number ${num.className}`;
            number.textContent = num.value;
            clockFace.appendChild(number);
        });
        
        const hourAngle = (time.hours * 30) + (time.minutes * 0.5);
        const minuteAngle = time.minutes * 6;
        
        const hourHand = document.createElement('div');
        hourHand.className = 'hour-hand';
        hourHand.style.transform = `rotate(${hourAngle}deg)`;
        
        const minuteHand = document.createElement('div');
        minuteHand.className = 'minute-hand';
        minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        
        const centerDot = document.createElement('div');
        centerDot.className = 'center-dot';
        
        clockFace.appendChild(hourHand);
        clockFace.appendChild(minuteHand);
        clockFace.appendChild(centerDot);
        
        clockContainer.appendChild(clockFace);
        return clockContainer;
    }
    
    function createPunctuationElement(char) {
        const punct = document.createElement('span');
        punct.className = 'punctuation-display';
        punct.textContent = char;
        return punct;
    }
    
    function downloadResult() {
        elements.loadingIndicator.classList.remove('hidden');
        elements.downloadBtn.disabled = true;
        
        const originalStyles = {
            container: document.querySelector('.result-container').style.cssText,
            clocks: Array.from(document.querySelectorAll('.clock-face')).map(el => el.style.cssText),
            hands: Array.from(document.querySelectorAll('.hour-hand, .minute-hand')).map(el => el.style.cssText)
        };

        document.querySelector('.result-container').style.background = '#FFFFFF';
        document.querySelectorAll('.clock-face').forEach(el => {
            el.style.border = '3px solid #000';
            el.style.boxShadow = '0 0 8px rgba(0,0,0,0.8)';
        });
        document.querySelectorAll('.hour-hand, .minute-hand, .center-dot').forEach(el => {
            el.style.backgroundColor = '#000';
        });

        setTimeout(() => {
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                hotfixes: ["px_scaling"]
            });
            
            const options = {
                scale: 3,
                logging: true,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                allowTaint: true,
                letterRendering: true,
                quality: 1,
                removeContainer: true
            };
            
            html2canvas(document.querySelector('.result-container'), options)
                .then(canvas => {
                    const imgData = canvas.toDataURL('image/png', 1.0);
                    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
                    pdf.save('шифровка_временем.pdf');
                })
                .catch(error => {
                    console.error("Ошибка генерации PDF:", error);
                    showError('Ошибка при создании PDF: ' + error.message);
                })
                .finally(() => {
                    document.querySelector('.result-container').style.cssText = originalStyles.container;
                    document.querySelectorAll('.clock-face').forEach((el, i) => {
                        el.style.cssText = originalStyles.clocks[i] || '';
                    });
                    document.querySelectorAll('.hour-hand, .minute-hand').forEach((el, i) => {
                        el.style.cssText = originalStyles.hands[i] || '';
                    });

                    elements.loadingIndicator.classList.add('hidden');
                    elements.downloadBtn.disabled = false;
                });
        }, 300);
    }
    
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
    }
});