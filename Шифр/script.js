document.getElementById('encryptButton').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    const encryptedText = encryptText(inputText);
    document.getElementById('encryptedText').textContent = encryptedText;
    generateSymbolTable();
});

document.getElementById('createCopiesButton').addEventListener('click', function () {
    const copies = parseInt(document.getElementById('copies').value);
    const encryptedText = document.getElementById('encryptedText').textContent;
    const symbolTable = generateSymbolTableText();

    // Генерируем Word-документ
    generateWordDocument(encryptedText, symbolTable, copies);
});

function encryptText(text) {
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const symbols = '★☆♡♢♤♧⚛⚔⚖⚡☀☁☂☃☄☾☽☿♀♁♂♃♄♅♆♇⚹⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏';
    let encryptedText = '';
    let symbolMap = {};

    // Создаем карту соответствия символов
    for (let i = 0; i < alphabet.length; i++) {
        symbolMap[alphabet[i]] = symbols[i % symbols.length];
    }

    // Шифруем текст
    for (let char of text.toLowerCase()) {
        if (char === ' ') {
            encryptedText += ' '; // Пробел остается пробелом
        } else if (/[.,!?;:]/.test(char)) {
            encryptedText += char; // Сохраняем знаки препинания
        } else {
            encryptedText += symbolMap[char] || char; // Заменяем буквы символами
        }
    }

    return encryptedText.trim(); // Убираем лишний пробел в конце
}

function generateSymbolTable() {
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const symbols = '★☆♡♢♤♧⚛⚔⚖⚡☀☁☂☃☄☾☽☿♀♁♂♃♄♅♆♇⚹⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏';
    const table = document.getElementById('symbolTable');
    table.innerHTML = '';

    // Создаем таблицу в формате "А-★; Б-☆; ..."
    let tableContent = '';
    for (let i = 0; i < alphabet.length; i++) {
        tableContent += `${alphabet[i].toUpperCase()}-${symbols[i % symbols.length]}; `;
    }

    const tableRow = document.createElement('div');
    tableRow.className = 'row';
    tableRow.textContent = tableContent.trim();
    table.appendChild(tableRow);
}

function generateSymbolTableText() {
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const symbols = '★☆♡♢♤♧⚛⚔⚖⚡☀☁☂☃☄☾☽☿♀♁♂♃♄♅♆♇⚹⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏';

    // Создаем текстовое представление таблицы
    let tableText = '';
    for (let i = 0; i < alphabet.length; i++) {
        tableText += `${alphabet[i].toUpperCase()}-${symbols[i % symbols.length]}; `;
    }

    return tableText.trim();
}

function generateWordDocument(encryptedText, symbolTable, copies) {
    // Загружаем шаблон
    fetch('template.docx')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const zip = new PizZip(buffer);
            const doc = new docxtemplater().loadZip(zip);

            // Создаем данные для шаблона
            const data = {
                blocks: Array.from({ length: copies }, () => ({
                    encryptedText: encryptedText,
                    symbolTable: symbolTable
                }))
            };

            // Заменяем плейсхолдеры в шаблоне
            doc.setData(data);

            try {
                doc.render();
            } catch (error) {
                console.error("Ошибка при генерации документа:", error);
                return;
            }

            // Генерируем и скачиваем файл
            const out = doc.getZip().generate({ type: 'blob' });
            saveAs(out, 'output.docx');
        })
        .catch(error => {
            console.error("Ошибка при загрузке шаблона:", error);
        });
}