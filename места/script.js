// Маппинг BookId на имена книг
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

// Функция для нормализации текста (заменяет ё на е)
function normalizeText(text) {
    return text.replace(/ё/g, 'е').toLowerCase();
}

// Функция для поиска всех вхождений слова в Библии
function findAllWordInBible(word, bible) {
    const normalizedWord = normalizeText(word); // Нормализуем слово
    const results = [];

    for (const book of bible) {
        let foundInBook = false; // Флаг, чтобы не добавлять несколько вхождений из одной книги
        for (const chapter of book.Chapters) {
            for (const verse of chapter.Verses) {
                const wordsInVerse = verse.Text.split(/\s+/);
                for (let i = 0; i < wordsInVerse.length; i++) {
                    const normalizedVerseWord = normalizeText(wordsInVerse[i]);
                    if (normalizedVerseWord === normalizedWord && !foundInBook) {
                        results.push({
                            book: book.BookId,
                            chapter: chapter.ChapterId,
                            verse: verse.VerseId,
                            position: i + 1
                        });
                        foundInBook = true; // Помечаем, что слово найдено в этой книге
                        break; // Переходим к следующей книге
                    }
                }
                if (foundInBook) break; // Переходим к следующей книге
            }
            if (foundInBook) break; // Переходим к следующей книге
        }
    }
    return results;
}

// Загрузка данных из bible.json
fetch('bible.json')
    .then(response => {
        if (!response.ok) throw new Error('Файл bible.json не найден');
        return response.json();
    })
    .then(data => {
        const bible = data.Books;

        // Обработчик кнопки поиска
        document.getElementById('searchButton').addEventListener('click', function () {
            const inputText = document.getElementById('inputText').value;
            const words = inputText.split(/(\s+)/); // Сохраняем пробелы и знаки препинания
            const results = [];
            const usedBooks = new Set(); // Множество для отслеживания использованных книг
            let count = 1; // Переменная для последовательной нумерации

            words.forEach((word) => {
                if (!word.trim()) return; // Пропускаем пустые строки (пробелы)
                const wordResults = findAllWordInBible(word.replace(/[.,;!?]/g, ''), bible);

                // Фильтруем результаты, чтобы исключить повторяющиеся книги
                const filteredResults = wordResults.filter(result => !usedBooks.has(result.book));

                if (filteredResults.length > 0) {
                    // Выбираем случайный результат из отфильтрованных
                    const randomResult = filteredResults[Math.floor(Math.random() * filteredResults.length)];
                    usedBooks.add(randomResult.book); // Добавляем книгу в множество использованных

                    // Форматируем мини-блок с неразрывными пробелами
                    const miniBlock = `${count})\u00A0${bookNames[randomResult.book]}\u00A0${randomResult.chapter}:${randomResult.verse}\u00A0(${randomResult.position})`;
                    results.push(miniBlock);
                    count++; // Увеличиваем счетчик
                } else {
                    // Форматируем мини-блок с неразрывными пробелами
                    const miniBlock = `${count})\u00A0Слово\u00A0"${word}"\u00A0не\u00A0найдено\u00A0в\u00A0Библии`;
                    results.push(miniBlock);
                    count++; // Увеличиваем счетчик
                }
            });

            // Вывод результатов с обычными пробелами между мини-блоками
            document.getElementById('results').innerHTML = results.join('; ');
            document.getElementById('downloadSection').style.display = 'block';
        });

        // Обработчик кнопки скачивания
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

// Функция для генерации Word-документа
function generateWordDocument(resultsText, copies) {
    fetch('template.docx')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const zip = new PizZip(buffer);
            const doc = new docxtemplater().loadZip(zip);

            // Данные для шаблона
            const data = {
                blocks: Array.from({ length: copies }, () => ({
                    results: resultsText
                }))
            };

            // Заменяем плейсхолдеры
            doc.setData(data);

            try {
                doc.render();
            } catch (error) {
                console.error("Ошибка при генерации документа:", error);
                return;
            }

            // Скачиваем файл
            const out = doc.getZip().generate({ type: 'blob' });
            saveAs(out, 'bible_search_results.docx');
        })
        .catch(error => {
            console.error("Ошибка при загрузке шаблона:", error);
        });
}