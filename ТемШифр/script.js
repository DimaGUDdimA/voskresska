document.addEventListener('DOMContentLoaded', function() {
    const keyTextArea = document.getElementById('keyText');
    const verseTextArea = document.getElementById('verseText');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const lettersContainer = document.getElementById('lettersContainer');
    const encryptedVerse = document.getElementById('encryptedVerse');
    const errorMessage = document.getElementById('errorMessage');
    const copiesInput = document.getElementById('copies');

    generateBtn.addEventListener('click', generateCipher);
    downloadBtn.addEventListener('click', downloadResult);

    function toSuperscript(num) {
        const superscripts = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
        return num.toString().split('').map(d => superscripts[d]).join('');
    }

    function generateCipher() {
        errorMessage.style.display = 'none';
        
        const keyText = keyTextArea.value.trim();
        const verseText = verseTextArea.value.trim();
        
        if (!keyText || !verseText) {
            showError('Заполните оба поля');
            return;
        }
        
        if (keyText.length < 5) {
            showError('Ключевой текст должен содержать минимум 5 символов');
            return;
        }
        
        const { letterMap, orderedLetters } = processKeyText(keyText);
        displayLetters(orderedLetters, letterMap);
        encryptVerse(verseText, letterMap);
        
        resultContainer.style.display = 'block';
    }
    
    function processKeyText(text) {
        const letterMap = new Map();
        const orderedLetters = [];
        let counter = 1;
        
        const normalizedText = text.toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/Ё/g, 'Е');
        
        for (const char of normalizedText) {
            if (char === ' ') {
                orderedLetters.push({ char: ' ', isSpace: true });
                continue;
            }
            
            if (/[^а-яa-z]/.test(char)) {
                orderedLetters.push({ char, isPunctuation: true });
                continue;
            }
            
            if (!letterMap.has(char)) {
                letterMap.set(char, counter++);
                orderedLetters.push({ 
                    char, 
                    isLetter: true, 
                    isFirst: true, 
                    number: letterMap.get(char),
                    originalCase: /[А-ЯЁ]/.test(char) ? 'upper' : 'lower'
                });
            } else {
                orderedLetters.push({ 
                    char, 
                    isLetter: true, 
                    isFirst: false,
                    originalCase: /[А-ЯЁ]/.test(char) ? 'upper' : 'lower'
                });
            }
        }
        
        return { letterMap, orderedLetters };
    }
    
    function displayLetters(letters) {
        lettersContainer.innerHTML = '';
        
        letters.forEach(item => {
            if (item.isSpace) {
                const space = document.createElement('span');
                space.className = 'triple-space';
                space.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                lettersContainer.appendChild(space);
                return;
            }
            
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter-box';
            
            if (item.isPunctuation) {
                letterSpan.textContent = item.char;
            } else if (item.isFirst) {
                const displayChar = item.originalCase === 'upper' 
                    ? item.char.toUpperCase() 
                    : item.char;
                letterSpan.innerHTML = `${displayChar}<span class="superscript">${toSuperscript(item.number)}</span>`;
            } else {
                letterSpan.textContent = item.originalCase === 'upper' 
                    ? item.char.toUpperCase() 
                    : item.char;
            }
            
            lettersContainer.appendChild(letterSpan);
        });
    }
    
    function encryptVerse(text, letterMap) {
        let result = '';
        const normalizedText = text.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
        let lastWasNumber = false;
        
        for (const char of normalizedText) {
            if (char === ' ') {
                result += '<span class="triple-space">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
                lastWasNumber = false;
                continue;
            }
            
            if (/[.,\/#!$%\^&\*;:{}=\-_`~()]/.test(char)) {
                result += char;
                lastWasNumber = false;
                continue;
            }
            
            if (/[а-яА-Яa-zA-Z]/.test(char)) {
                const lowerChar = char.toLowerCase();
                if (letterMap.has(lowerChar)) {
                    if (lastWasNumber) {
                        result += '/';
                    }
                    result += `<span class="encrypted-number">${letterMap.get(lowerChar)}</span>`;
                    lastWasNumber = true;
                } else {
                    result += char;
                    lastWasNumber = false;
                }
            } else {
                result += char;
                lastWasNumber = false;
            }
        }
        
        encryptedVerse.innerHTML = result;
    }
    
    function downloadResult() {
        const keyText = keyTextArea.value.trim();
        const verseText = verseTextArea.value.trim();
        const copies = parseInt(copiesInput.value) || 1;
        
        const ovalsContent = generateOvalsContent(keyText);
        const encryptedContent = generateEncryptedContentForDocx(keyText, verseText);
        
        const data = {
            blocks: Array.from({ length: copies }, () => ({
                ovals: ovalsContent,
                encryptedText: encryptedContent
            }))
        };

        fetch('template.docx')
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const zip = new PizZip(buffer);
                const doc = new docxtemplater().loadZip(zip);
                
                doc.setData(data);
                
                try {
                    doc.render();
                    const out = doc.getZip().generate({ type: 'blob' });
                    saveAs(out, `Библейский_шифр_${copies}копий.docx`);
                } catch (error) {
                    console.error("Ошибка:", error);
                    showError('Ошибка при создании файла');
                }
            })
            .catch(error => {
                console.error("Ошибка:", error);
                showError('Шаблон не найден');
            });
    }
    
    function generateOvalsContent(keyText) {
        const { orderedLetters } = processKeyText(keyText);
        let result = '';
        
        orderedLetters.forEach(item => {
            if (item.isSpace) {
                result += '      '; // 6 пробелов
                return;
            }
            
            if (item.isPunctuation) {
                result += item.char;
                return;
            }
            
            const displayChar = item.originalCase === 'upper' 
                ? item.char.toUpperCase() 
                : item.char;
            
            if (item.isFirst) {
                result += `${displayChar}${toSuperscript(item.number)}`;
            } else {
                result += displayChar;
            }
        });
        
        return result;
    }
    
    function generateEncryptedContentForDocx(keyText, verseText) {
        const { letterMap } = processKeyText(keyText);
        let result = '';
        const normalizedText = verseText.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
        let lastWasNumber = false;
        
        for (const char of normalizedText) {
            if (char === ' ') {
                result += '      '; // 6 пробелов
                lastWasNumber = false;
                continue;
            }
            
            if (/[.,\/#!$%\^&\*;:{}=\-_`~()]/.test(char)) {
                result += char;
                lastWasNumber = false;
                continue;
            }
            
            if (/[а-яА-Яa-zA-Z]/.test(char)) {
                const lowerChar = char.toLowerCase();
                if (letterMap.has(lowerChar)) {
                    if (lastWasNumber) {
                        result += '/';
                    }
                    result += letterMap.get(lowerChar);
                    lastWasNumber = true;
                } else {
                    result += char;
                    lastWasNumber = false;
                }
            } else {
                result += char;
                lastWasNumber = false;
            }
        }
        
        return result;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});