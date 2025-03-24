let difficulty = 'easy'; // По умолчанию уровень "Просто"

// Обработчики для кнопок выбора уровня сложности
document.getElementById('easyButton').addEventListener('click', () => {
  console.log('Нажата кнопка "Легкий уровень"'); // Отладочное сообщение
  difficulty = 'easy';
  generateExamples();
});

document.getElementById('mediumButton').addEventListener('click', () => {
  console.log('Нажата кнопка "Средний уровень"'); // Отладочное сообщение
  difficulty = 'medium';
  generateExamples();
});

// Основная функция генерации примеров
function generateExamples() {
  console.log('Запущена функция generateExamples'); // Отладочное сообщение

  const inputText = document.getElementById('inputText');
  const outputDiv = document.getElementById('output');

  // Проверка, что элементы существуют
  if (!inputText || !outputDiv) {
    console.error('Элементы inputText или output не найдены в DOM'); // Отладочное сообщение
    return;
  }

  const text = inputText.value;
  outputDiv.innerHTML = ''; // Очищаем предыдущий вывод

  if (!text.trim()) {
    outputDiv.textContent = 'Введите текст!';
    return;
  }

  console.log('Входной текст:', text); // Отладочное сообщение

  // Разбиваем текст на слова
  const originalWords = text.split(/\s+/).filter(word => word.length > 0);
  console.log('Оригинальные слова:', originalWords); // Отладочное сообщение

  // Перемешиваем слова
  const shuffledWords = shuffleArray([...originalWords]);
  console.log('Перемешанные слова:', shuffledWords); // Отладочное сообщение

  // Выводим перемешанный текст
  const shuffledTextElement = document.createElement('p');
  shuffledTextElement.textContent = `Перемешанный текст: ${shuffledWords.join(' ')}`;
  outputDiv.appendChild(shuffledTextElement);

  // Генерация примеров
  originalWords.forEach((word, originalIndex) => {
    // Находим позицию слова в перемешанном тексте
    const shuffledIndex = shuffledWords.indexOf(word) + 1;
    console.log(`Слово: ${word}, Позиция: ${shuffledIndex}`); // Отладочное сообщение

    // Генерация примера в зависимости от уровня сложности
    let example;
    let isValid = false;
    let attempts = 0;
    const maxAttempts = 100; // Максимальное количество попыток

    do {
      example = generateExample(shuffledIndex, difficulty);
      console.log(`Попытка ${attempts + 1}: Пример: ${example}`); // Отладочное сообщение
      isValid = validateExample(example, shuffledIndex);
      attempts++;
    } while (!isValid && attempts < maxAttempts); // Перегенерируем, если пример некорректен

    if (!isValid) {
      example = `Не удалось сгенерировать пример для ${shuffledIndex}`;
      console.log(`Не удалось сгенерировать пример для ${shuffledIndex}`); // Отладочное сообщение
    }

    const p = document.createElement('p');
    p.textContent = `${originalIndex + 1})\u00A0${example}=${'_'.repeat(20)}`; // Добавляем неразрывный пробел
    outputDiv.appendChild(p);
  });

  // Показываем блок скачивания
  document.getElementById('downloadSection').style.display = 'block';
}

// Функция для проверки корректности примера
function validateExample(example, result) {
  try {
    const calculatedResult = calculateExample(example);
    console.log(`Пример: ${example}, Ожидаемый результат: ${result}, Полученный результат: ${calculatedResult}`); // Отладочное сообщение
    return (
      calculatedResult === result &&
      !example.includes(' 0') && // Исключаем нули
      !example.includes('(0') && // Исключаем нули в скобках
      !example.includes('/ 1') && // Исключаем деление на 1
      !example.includes('* 1') // Исключаем умножение на 1
    );
  } catch (e) {
    console.error(`Ошибка вычисления примера: ${example}`); // Отладочное сообщение
    return false;
  }
}

// Функция для генерации примера с заданным результатом и уровнем сложности
function generateExample(result, difficulty) {
  console.log(`Генерация примера для результата: ${result}, Уровень сложности: ${difficulty}`); // Отладочное сообщение
  switch (difficulty) {
    case 'easy':
      return generateEasyExample(result);
    case 'medium':
      return generateMediumExample(result);
    default:
      return generateEasyExample(result);
  }
}

// Генерация простого примера (одно действие)
function generateEasyExample(result) {
  const operations = ['+', '-', '*', '/'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  console.log(`Легкий уровень: Операция: ${operation}`); // Отладочное сообщение

  switch (operation) {
    case '+':
      const a = getRandomNumber(1, result - 1); // a от 1 до result - 1
      const b = result - a;
      return `${a}\u00A0+\u00A0${b}`; // Неразрывные пробелы

    case '-':
      const c = getRandomNumber(result + 1, result + 40); // c от result + 1 до result + 40
      const d = c - result;
      return `${c}\u00A0-\u00A0${d}`; // Неразрывные пробелы

    case '*':
      const divisorsMultiply = getDivisors(result).filter(x => x !== 0 && x !== 1); // Исключаем 0 и 1
      const e = divisorsMultiply[Math.floor(Math.random() * divisorsMultiply.length)];
      const f = result / e;
      return `${e}\u00A0*\u00A0${f}`; // Неразрывные пробелы

    case '/':
      const divisorsDivide = getDivisors(result).filter(x => x !== 1 && x !== result); // Исключаем 1 и само число
      if (divisorsDivide.length === 0) {
        return generateEasyExample(result); // Если нет подходящих делителей, генерируем другой пример
      }
      const g = divisorsDivide[Math.floor(Math.random() * divisorsDivide.length)];
      const h = result * g;
      return `${h}\u00A0/\u00A0${g}`; // Неразрывные пробелы

    default:
      return `1\u00A0+\u00A0${result - 1}`; // Неразрывные пробелы
  }
}

// Генерация примера средней сложности (два действия)
function generateMediumExample(result) {
  const variants = [
    '(a / b) - c',
    '(a * b) - c',
    '(a / b) + c',
    '(a * b) + c',
    '(a / b) * c',
    '(a * b) * c',
    '(a / b) / c',
    '(a * b) / c',
  ];

  const variant = variants[Math.floor(Math.random() * variants.length)];
  console.log(`Средний уровень: Вариант: ${variant}`); // Отладочное сообщение

  let a, b, c;
  let isValid = false;
  let attempts = 0;
  const maxAttempts = 100; // Максимальное количество попыток

  do {
    switch (variant) {
      case '(a / b) - c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10) * b; // a кратно b
        c = a / b - result;
        break;

      case '(a * b) - c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10);
        c = a * b - result;
        break;

      case '(a / b) + c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10) * b; // a кратно b
        c = result - a / b;
        break;

      case '(a * b) + c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10);
        c = result - a * b;
        break;

      case '(a / b) * c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10) * b; // a кратно b
        c = result / (a / b);
        break;

      case '(a * b) * c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10);
        c = result / (a * b);
        break;

      case '(a / b) / c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10) * b; // a кратно b
        c = (a / b) / result;
        break;

      case '(a * b) / c':
        b = getRandomNumber(2, 10); // b от 2 до 10
        a = getRandomNumber(1, 10);
        c = (a * b) / result;
        break;
    }

    // Проверяем, что c — целое число и не равно нулю
    isValid = Number.isInteger(c) && c !== 0;
    attempts++;
  } while (!isValid && attempts < maxAttempts); // Перегенерируем, если пример некорректен

  if (!isValid) {
    return `Не удалось сгенерировать пример для ${result}`;
  }

  // Корректируем знак, если c отрицательное
  let correctedVariant = variant;
  if (c < 0) {
    if (variant.includes('+')) {
      correctedVariant = variant.replace('+', '-'); // Заменяем + на -
      c = Math.abs(c); // Делаем c положительным
    } else if (variant.includes('-')) {
      correctedVariant = variant.replace('-', '+'); // Заменяем - на +
      c = Math.abs(c); // Делаем c положительным
    }
  }

  return correctedVariant
    .replace('a', a)
    .replace('b', b)
    .replace('c', c);
}

// Функция для вычисления результата примера
function calculateExample(example) {
  try {
    return eval(example); // Вычисляем пример
  } catch (e) {
    console.error(`Ошибка вычисления примера: ${example}`); // Отладочное сообщение
    return NaN;
  }
}

// Функция для получения делителей числа
function getDivisors(number) {
  const divisors = [];
  for (let i = 1; i <= number; i++) {
    if (number % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
}

// Функция для генерации случайного числа в диапазоне [min, max]
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для перемешивания массива
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Добавляем обработчик для кнопки скачивания
document.getElementById('downloadButton').addEventListener('click', function () {
  const copies = parseInt(document.getElementById('copies').value);
  const outputText = document.getElementById('output').innerText;
  generateWordDocument(outputText, copies);
});

// Функция для генерации Word-документа
function generateWordDocument(outputText, copies) {
  fetch('template.docx')
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const zip = new PizZip(buffer);
      const doc = new docxtemplater().loadZip(zip);

      // Данные для шаблона
      const data = {
        blocks: Array.from({ length: copies }, () => ({
          results: outputText
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
      saveAs(out, 'generated_examples.docx');
    })
    .catch(error => {
      console.error("Ошибка при загрузке шаблона:", error);
    });
}