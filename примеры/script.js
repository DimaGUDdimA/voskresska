let difficulty = 'easy';

document.getElementById('easyButton').addEventListener('click', () => {
  difficulty = 'easy';
  generateExamples();
});

document.getElementById('mediumButton').addEventListener('click', () => {
  difficulty = 'medium';
  generateExamples();
});

function generateExamples() {
  const inputText = document.getElementById('inputText');
  const outputDiv = document.getElementById('output');

  if (!inputText || !outputDiv) return;

  const text = inputText.value;
  outputDiv.innerHTML = '';

  if (!text.trim()) {
    outputDiv.textContent = 'Введите текст!';
    return;
  }

  const originalWords = text.split(/\s+/).filter(word => word.length > 0);
  const shuffledWords = shuffleArray([...originalWords]);

  const shuffledTextElement = document.createElement('p');
  shuffledTextElement.textContent = `Перемешанный текст: ${shuffledWords.join(' ')}`;
  outputDiv.appendChild(shuffledTextElement);

  originalWords.forEach((word, originalIndex) => {
    const shuffledIndex = shuffledWords.indexOf(word) + 1;
    let example;
    let isValid = false;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      example = generateExample(shuffledIndex, difficulty);
      isValid = validateExample(example, shuffledIndex);
      attempts++;
    } while (!isValid && attempts < maxAttempts);

    if (!isValid) {
      example = `Не удалось сгенерировать пример для ${shuffledIndex}`;
    }

    const p = document.createElement('p');
    p.style.whiteSpace = 'nowrap';
    p.style.margin = '5px 0';
    p.innerHTML = `
      ${originalIndex + 1})&nbsp;
      ${formatExampleWithNbsp(example)}
      &nbsp;=&nbsp;${'_'.repeat(20)}
    `.replace(/\s+/g, ' ').trim();
    outputDiv.appendChild(p);
  });

  document.getElementById('downloadSection').style.display = 'block';
}

function formatExampleWithNbsp(example) {
  return example
    .replace(/(\d+|\))\s*([+\-*/])\s*(\d+|\(|\))/g, '$1&nbsp;$2&nbsp;$3')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateExample(example, result) {
  try {
    const calculatedResult = calculateExample(example.replace(/&nbsp;/g, ' '));
    return (
      calculatedResult === result &&
      !example.includes(' 0') &&
      !example.includes('(0') &&
      !example.includes('/ 1') &&
      !example.includes('* 1')
    );
  } catch (e) {
    return false;
  }
}

function generateExample(result, difficulty) {
  switch (difficulty) {
    case 'easy': return generateEasyExample(result);
    case 'medium': return generateMediumExample(result);
    default: return generateEasyExample(result);
  }
}

function generateEasyExample(result) {
  const operations = ['+', '-', '*', '/'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  switch (operation) {
    case '+':
      const a = getRandomNumber(1, result - 1);
      const b = result - a;
      return `${a} + ${b}`;

    case '-':
      const c = getRandomNumber(result + 1, result + 40);
      const d = c - result;
      return `${c} - ${d}`;

    case '*':
      const divisorsMultiply = getDivisors(result).filter(x => x !== 0 && x !== 1);
      const e = divisorsMultiply[Math.floor(Math.random() * divisorsMultiply.length)];
      const f = result / e;
      return `${e} * ${f}`;

    case '/':
      const divisorsDivide = getDivisors(result).filter(x => x !== 1 && x !== result);
      if (divisorsDivide.length === 0) return generateEasyExample(result);
      const g = divisorsDivide[Math.floor(Math.random() * divisorsDivide.length)];
      const h = result * g;
      return `${h} / ${g}`;

    default:
      return `1 + ${result - 1}`;
  }
}

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
  let a, b, c;
  let isValid = false;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    switch (variant) {
      case '(a / b) - c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10) * b;
        c = a / b - result;
        break;
      case '(a * b) - c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10);
        c = a * b - result;
        break;
      case '(a / b) + c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10) * b;
        c = result - a / b;
        break;
      case '(a * b) + c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10);
        c = result - a * b;
        break;
      case '(a / b) * c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10) * b;
        c = result / (a / b);
        break;
      case '(a * b) * c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10);
        c = result / (a * b);
        break;
      case '(a / b) / c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10) * b;
        c = (a / b) / result;
        break;
      case '(a * b) / c':
        b = getRandomNumber(2, 10);
        a = getRandomNumber(1, 10);
        c = (a * b) / result;
        break;
    }

    isValid = Number.isInteger(c) && c !== 0;
    attempts++;
  } while (!isValid && attempts < maxAttempts);

  if (!isValid) return `Не удалось сгенерировать пример для ${result}`;

  let correctedVariant = variant;
  if (c < 0) {
    if (variant.includes('+')) {
      correctedVariant = variant.replace('+', '-');
      c = Math.abs(c);
    } else if (variant.includes('-')) {
      correctedVariant = variant.replace('-', '+');
      c = Math.abs(c);
    }
  }

  return correctedVariant
    .replace('a', a)
    .replace('b', b)
    .replace('c', c);
}

function calculateExample(example) {
  try {
    return eval(example);
  } catch (e) {
    return NaN;
  }
}

function getDivisors(number) {
  const divisors = [];
  for (let i = 1; i <= number; i++) {
    if (number % i === 0) divisors.push(i);
  }
  return divisors;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.getElementById('downloadButton').addEventListener('click', function() {
  const copies = parseInt(document.getElementById('copies').value);
  const outputText = document.getElementById('output').innerText;
  generateWordDocument(outputText, copies);
});

function generateWordDocument(outputText, copies) {
  fetch('template.docx')
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const zip = new PizZip(buffer);
      const doc = new docxtemplater().loadZip(zip);
      doc.setData({
        blocks: Array.from({ length: copies }, () => ({
          results: outputText
        }))
      });
      try {
        doc.render();
        const out = doc.getZip().generate({ type: 'blob' });
        saveAs(out, 'generated_examples.docx');
      } catch (error) {
        console.error("Ошибка при генерации документа:", error);
      }
    })
    .catch(error => {
      console.error("Ошибка при загрузке шаблона:", error);
    });
}