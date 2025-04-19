// Маппинг BookId на имена книг (66 канонических книг)
const bookNames = {
    1: "Бытие", 2: "Исход", 3: "Левит", 4: "Числа", 5: "Второзаконие",
    6: "Иисус Навин", 7: "Судьи", 8: "Руфь", 9: "1 Царств", 10: "2 Царств",
    11: "3 Царств", 12: "4 Царств", 13: "1 Паралипоменон", 14: "2 Паралипоменон",
    15: "Ездра", 16: "Неемия", 17: "Есфирь", 18: "Иов", 19: "Псалтирь",
    20: "Притчи", 21: "Екклесиаст", 22: "Песня Песней", 23: "Исаия", 24: "Иеремия",
    25: "Плач Иеремии", 26: "Иезекииль", 27: "Даниил", 28: "Осия", 29: "Иоиль",
    30: "Амос", 31: "Авдий", 32: "Иона", 33: "Михей", 34: "Наум", 35: "Аввакум",
    36: "Софония", 37: "Аггей", 38: "Захария", 39: "Малахия", 40: "Матфея",
    41: "Марка", 42: "Луки", 43: "Иоанна", 44: "Деяния", 45: "Римлянам",
    46: "1 Коринфянам", 47: "2 Коринфянам", 48: "Галатам", 49: "Ефесянам",
    50: "Филиппийцам", 51: "Колоссянам", 52: "1 Фессалоникийцам", 53: "2 Фессалоникийцам",
    54: "1 Тимофею", 55: "2 Тимофею", 56: "Титу", 57: "Филимону", 58: "Евреям",
    59: "Иакова", 60: "1 Петра", 61: "2 Петра", 62: "1 Иоанна", 63: "2 Иоанна",
    64: "3 Иоанна", 65: "Иуда", 66: "Откровение"
};

// Функция для подготовки слова к поиску (удаляем только окружающую пунктуацию)
function prepareWord(word) {
    // Удаляем пунктуацию вокруг слова, но сохраняем внутреннюю (например, "мать-и-мачеха")
    return word.replace(/^[^а-яА-ЯёЁ]+/, '').replace(/[^а-яА-ЯёЁ]+$/, '');
}

// Функция для нормализации "ё" в "е" при сравнении (но сохраняем оригинал для вывода)
function normalizeForCompare(word) {
    return word.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
}

// Функция для проверки точного совпадения слова в стихе (с учетом ё/е)
function findExactWordInVerse(word, verseText) {
    const normalizedWord = normalizeForCompare(word);
    const words = verseText.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
        const verseWord = prepareWord(words[i]);
        if (verseWord && normalizeForCompare(verseWord) === normalizedWord) {
            return i + 1; // Возвращаем позицию (1-based)
        }
    }
    return 0;
}

// Функция для поиска слова в одной книге
function findWordInBook(word, book) {
    // Создаем перемешанный массив глав
    const chapters = [...book.Chapters].sort(() => Math.random() - 0.5);
    
    for (const chapter of chapters) {
        // Создаем перемешанный массив стихов
        const verses = [...chapter.Verses].sort(() => Math.random() - 0.5);
        
        for (const verse of verses) {
            const position = findExactWordInVerse(word, verse.Text);
            if (position > 0) {
                return {
                    book: book.BookId,
                    chapter: chapter.ChapterId,
                    verse: verse.VerseId,
                    position: position,
                    originalWord: word // Сохраняем оригинальное слово
                };
            }
        }
    }
    return null;
}

// Основная функция поиска слова в Библии
function findWordInBible(word, bible, usedBooks) {
    // Создаем перемешанный массив книг
    const shuffledBooks = [...bible].sort(() => Math.random() - 0.5);
    
    for (const book of shuffledBooks) {
        // Пропускаем уже использованные книги
        if (usedBooks.has(book.BookId)) continue;
        
        const result = findWordInBook(word, book);
        if (result) {
            usedBooks.add(book.BookId);
            return result;
        }
    }
    return null;
}

// Работа с модальным окном (без изменений)
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('instructionModal');
    const helpIcon = document.getElementById('helpIcon');
    const closeBtn = document.querySelector('.close');
    const dontShowAgainBtn = document.getElementById('dontShowAgain');

    if (!localStorage.getItem('dontShowInstructions')) {
        modal.style.display = 'block';
    }

    helpIcon.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    dontShowAgainBtn.addEventListener('click', function() {
        localStorage.setItem('dontShowInstructions', 'true');
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal || event.target.classList.contains('modal-background')) {
            modal.style.display = 'none';
        }
    });

    // Загрузка данных из bible.json
    fetch('bible.json')
        .then(response => {
            if (!response.ok) throw new Error('Файл bible.json не найден');
            return response.json();
        })
        .then(data => {
            const bible = data.Books;

            document.getElementById('searchButton').addEventListener('click', function () {
                const inputText = document.getElementById('inputText').value;
                // Разбиваем на слова, сохраняя разделители для составных слов
                const words = inputText.split(/(\s+|[-—])/).filter(w => w.trim().length > 0);
                const results = [];
                const usedBooks = new Set();
                let count = 1;

                words.forEach((word) => {
                    const cleanWord = prepareWord(word);
                    if (!cleanWord) return;
                    
                    const wordResult = findWordInBible(cleanWord, bible, usedBooks);
                    
                    if (wordResult) {
                        const miniBlock = `${count})\u00A0${bookNames[wordResult.book]}\u00A0${wordResult.chapter}:${wordResult.verse}\u00A0(${wordResult.position})`;
                        results.push(miniBlock);
                    } else {
                        const miniBlock = `${count})\u00A0Слово\u00A0"${word}"\u00A0не\u00A0найдено\u00A0в\u00A0Библии`;
                        results.push(miniBlock);
                    }
                    count++;
                });

                document.getElementById('results').innerHTML = results.join('; ');
                document.getElementById('downloadSection').style.display = 'block';
            });

            document.getElementById('downloadButton').addEventListener('click', function () {
                const copies = parseInt(document.getElementById('copies').value);
                const resultsText = document.getElementById('results').innerText;
                generateWordDocument(resultsText, copies);
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки файла Библии:', error);
            document.getElementById('results').innerHTML = 'Ошибка загрузки файла Библии. Проверьте консоль для подробностей.';
        });
});

// Функция для генерации Word-документа (без изменений)
function generateWordDocument(resultsText, copies) {
    fetch('template.docx')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const zip = new PizZip(buffer);
            const doc = new docxtemplater().loadZip(zip);

            const data = {
                blocks: Array.from({ length: copies }, () => ({
                    results: resultsText
                }))
            };

            doc.setData(data);

            try {
                doc.render();
            } catch (error) {
                console.error("Ошибка при генерации документа:", error);
                return;
            }

            const out = doc.getZip().generate({ type: 'blob' });
            saveAs(out, 'bible_search_results.docx');
        })
        .catch(error => {
            console.error("Ошибка при загрузке шаблона:", error);
        });
}