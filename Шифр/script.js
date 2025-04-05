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

    // Шифрование
    document.getElementById('encryptButton').addEventListener('click', function() {
        const inputText = document.getElementById('inputText').value;
        if (!inputText.trim()) {
            alert('Пожалуйста, введите текст для шифрования');
            return;
        }
        
        const encryptedText = encryptText(inputText);
        document.getElementById('encryptedText').textContent = encryptedText;
        generateSymbolTable();
    });

    // Генерация документа
    document.getElementById('createCopiesButton').addEventListener('click', function() {
        const encryptedText = document.getElementById('encryptedText').textContent;
        if (!encryptedText.trim()) {
            alert('Сначала зашифруйте текст');
            return;
        }
        
        const copies = parseInt(document.getElementById('copies').value) || 1;
        const symbolTable = generateSymbolTableText();
        generateWordDocument(encryptedText, symbolTable, copies);
    });
});

function encryptText(text) {
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const symbols = '★☆♡♢♤♧⚛⚔⚖⚡☀☁☂☃☄☾☽☿♀♁♂♃♄♅♆♇⚹⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏';
    let encryptedText = '';
    let symbolMap = {};

    for (let i = 0; i < alphabet.length; i++) {
        symbolMap[alphabet[i]] = symbols[i % symbols.length];
    }

    for (let char of text.toLowerCase()) {
        if (char === ' ') {
            encryptedText += ' ';
        } else if (/[.,!?;:]/.test(char)) {
            encryptedText += char;
        } else {
            encryptedText += symbolMap[char] || char;
        }
    }

    return encryptedText.trim();
}

function generateSymbolTable() {
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const symbols = '★☆♡♢♤♧⚛⚔⚖⚡☀☁☂☃☄☾☽☿♀♁♂♃♄♅♆♇⚹⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏';
    const table = document.getElementById('symbolTable');
    table.innerHTML = '';

    let tableContent = '';
    for (let i = 0; i < alphabet.length; i++) {
        tableContent += `${alphabet[i].toUpperCase()}-${symbols[i % symbols.length]}; `;
        if ((i + 1) % 8 === 0) tableContent += '<br>';
    }

    const tableRow = document.createElement('div');
    tableRow.className = 'row';
    tableRow.innerHTML = tableContent.trim();
    table.appendChild(tableRow);
}

function generateSymbolTableText() {
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const symbols = '★☆♡♢♤♧⚛⚔⚖⚡☀☁☂☃☄☾☽☿♀♁♂♃♄♅♆♇⚹⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏';

    let tableText = 'Таблица замены символов:\n';
    for (let i = 0; i < alphabet.length; i++) {
        tableText += `${alphabet[i].toUpperCase()}-${symbols[i % symbols.length]}${(i + 1) % 8 === 0 ? '\n' : '  '}`;
    }

    return tableText.trim();
}

function generateWordDocument(encryptedText, symbolTable, copies) {
    fetch('template.docx')
        .then(response => {
            if (!response.ok) throw new Error('Шаблон не найден');
            return response.arrayBuffer();
        })
        .then(buffer => {
            const zip = new PizZip(buffer);
            const doc = new docxtemplater().loadZip(zip);

            const data = {
                blocks: Array.from({ length: copies }, () => ({
                    encryptedText: encryptedText,
                    symbolTable: symbolTable
                }))
            };

            doc.setData(data);

            try {
                doc.render();
            } catch (error) {
                console.error("Ошибка рендеринга:", error);
                throw error;
            }

            const out = doc.getZip().generate({ type: 'blob' });
            saveAs(out, 'зашифрованный_текст.docx');
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert('Ошибка при создании документа: ' + error.message);
        });
}