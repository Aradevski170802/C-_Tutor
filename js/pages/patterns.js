document.addEventListener('DOMContentLoaded', () => {
  function clamp(n, min, max) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function consoleLine(container, cls) {
    const line = el('span', 'console-line' + (cls ? ' ' + cls : ''), '');
    container.appendChild(line);
    container.appendChild(document.createElement('br'));
    container.scrollTop = container.scrollHeight;
    return line;
  }

  /* ---------------- Demo 1: sum of 1 to N ---------------- */

  const sumStage = document.getElementById('sum-stage');
  const sumTotalBox = document.getElementById('sum-total-box');
  const sumCodeEl = document.getElementById('sum-code');
  const sumNInput = document.getElementById('sum-n');
  const sumPlayBtn = document.getElementById('sum-play-btn');
  const sumStepBtn = document.getElementById('sum-step-btn');
  const sumResetBtn = document.getElementById('sum-reset-btn');
  const sumStatusEl = document.getElementById('sum-status');

  const sumCodeLines = [
    '<span class="type">int</span> n = 5;',
    '<span class="type">int</span> sum = 0;',
    '<span class="kw">for</span> (<span class="type">int</span> i = 1; i &lt;= n; i++)',
    '{',
    '    sum += i;',
    '}',
    '<span class="cmt">// sum now holds 1 + 2 + ... + n</span>',
  ];
  const sumHighlight = codeBlock(sumCodeEl, sumCodeLines);

  let sumCells = [];

  function buildSum() {
    const n = clamp(parseInt(sumNInput.value, 10), 1, 8);
    sumNInput.value = n;
    const values = Array.from({ length: n }, (_, i) => i + 1);
    sumCells = renderArray(sumStage, values, { showIndex: false });
    sumHighlight();
    sumTotalBox.textContent = 'sum = 0';
    sumTotalBox.classList.remove('active');

    const steps = [];
    let total = 0;

    steps.push(async () => {
      sumHighlight([0, 1]);
    });

    for (let i = 1; i <= n; i++) {
      steps.push(async () => {
        sumHighlight([2]);
        clearPointers(sumCells);
        setPointer(sumCells[i - 1], 'i');
        setCellState(sumCells[i - 1], 'current');
        sumPlayer.setStatus(`Check: i = ${i} <= ${n} → true`, '');
      });
      steps.push(async () => {
        sumHighlight([4]);
        total += i;
        sumTotalBox.textContent = `sum = ${total}`;
        sumTotalBox.classList.add('active');
        sumPlayer.setStatus(`sum += ${i} → sum = ${total}`, '');
      });
    }

    steps.push(async () => {
      sumHighlight([2]);
      clearPointers(sumCells);
      resetCellStates(sumCells);
      sumTotalBox.classList.remove('active');
      sumPlayer.setStatus(`Check: i = ${n + 1} <= ${n} → false. Loop ends.`, '');
    });

    steps.push(async () => {
      sumHighlight([6]);
      const formula = (n * (n + 1)) / 2;
      sumPlayer.setStatus(`Done — sum = ${total} (matches n(n+1)/2 = ${formula})`, 'ok');
    });

    return steps;
  }

  const sumPlayer = wireStepControls(
    { playBtn: sumPlayBtn, stepBtn: sumStepBtn, resetBtn: sumResetBtn, statusEl: sumStatusEl },
    { build: buildSum, onReset() { clearEl(sumStage); }, delay: 550 }
  );

  sumNInput.addEventListener('change', () => sumPlayer.restart());

  /* ---------------- Demo 2: FizzBuzz ---------------- */

  const fbStage = document.getElementById('fizzbuzz-stage');
  const fbConsole = document.getElementById('fizzbuzz-console');
  const fbCodeEl = document.getElementById('fizzbuzz-code');
  const fbNInput = document.getElementById('fizzbuzz-n');
  const fbPlayBtn = document.getElementById('fizzbuzz-play-btn');
  const fbStepBtn = document.getElementById('fizzbuzz-step-btn');
  const fbResetBtn = document.getElementById('fizzbuzz-reset-btn');
  const fbStatusEl = document.getElementById('fizzbuzz-status');

  const fbCodeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> i = 1; i &lt;= n; i++)',
    '{',
    '    <span class="kw">if</span> (i % 15 == 0)',
    '        Console.WriteLine(<span class="str">"FizzBuzz"</span>);',
    '    <span class="kw">else if</span> (i % 3 == 0)',
    '        Console.WriteLine(<span class="str">"Fizz"</span>);',
    '    <span class="kw">else if</span> (i % 5 == 0)',
    '        Console.WriteLine(<span class="str">"Buzz"</span>);',
    '    <span class="kw">else</span>',
    '        Console.WriteLine(i);',
    '}',
  ];
  const fbHighlight = codeBlock(fbCodeEl, fbCodeLines);

  let fbCells = [];

  function buildFizzBuzz() {
    const n = clamp(parseInt(fbNInput.value, 10), 1, 20);
    fbNInput.value = n;
    const values = Array.from({ length: n }, (_, i) => i + 1);
    fbCells = renderArray(fbStage, values, { showIndex: false });
    clearEl(fbConsole);
    fbHighlight();

    const steps = [];
    for (let i = 1; i <= n; i++) {
      steps.push(async () => {
        fbHighlight([0]);
        fbCells.forEach((c) => setCellState(c, ''));
        setCellState(fbCells[i - 1], 'current');
        fbPlayer.setStatus(`i = ${i}`, '');
      });

      if (i % 15 === 0) {
        steps.push(async () => {
          fbHighlight([2, 3]);
          setCellState(fbCells[i - 1], 'inserted');
          consoleLine(fbConsole, 'fizzbuzz').textContent = 'FizzBuzz';
        });
      } else if (i % 3 === 0) {
        steps.push(async () => {
          fbHighlight([4, 5]);
          setCellState(fbCells[i - 1], 'shift');
          consoleLine(fbConsole, 'fizz').textContent = 'Fizz';
        });
      } else if (i % 5 === 0) {
        steps.push(async () => {
          fbHighlight([6, 7]);
          setCellState(fbCells[i - 1], 'compare');
          consoleLine(fbConsole, 'buzz').textContent = 'Buzz';
        });
      } else {
        steps.push(async () => {
          fbHighlight([8, 9]);
          consoleLine(fbConsole, 'plain').textContent = String(i);
        });
      }
    }
    steps.push(async () => {
      fbCells.forEach((c) => setCellState(c, ''));
      fbPlayer.setStatus('Done.', 'ok');
    });
    return steps;
  }

  const fbPlayer = wireStepControls(
    { playBtn: fbPlayBtn, stepBtn: fbStepBtn, resetBtn: fbResetBtn, statusEl: fbStatusEl },
    { build: buildFizzBuzz, onReset() { clearEl(fbStage); clearEl(fbConsole); }, delay: 380 }
  );

  fbNInput.addEventListener('change', () => fbPlayer.restart());

  /* ---------------- Demo 3: triangle of stars ---------------- */

  const triConsole = document.getElementById('triangle-console');
  const triCodeEl = document.getElementById('triangle-code');
  const triNInput = document.getElementById('triangle-n');
  const triPlayBtn = document.getElementById('triangle-play-btn');
  const triStepBtn = document.getElementById('triangle-step-btn');
  const triResetBtn = document.getElementById('triangle-reset-btn');
  const triStatusEl = document.getElementById('triangle-status');

  const triCodeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> row = 1; row &lt;= n; row++)',
    '{',
    '    <span class="kw">for</span> (<span class="type">int</span> col = 1; col &lt;= row; col++)',
    '    {',
    '        Console.Write(<span class="str">"*"</span>);',
    '    }',
    '    Console.WriteLine();',
    '}',
  ];
  const triHighlight = codeBlock(triCodeEl, triCodeLines);

  function buildTriangle() {
    const n = clamp(parseInt(triNInput.value, 10), 1, 8);
    triNInput.value = n;
    clearEl(triConsole);
    triHighlight();

    const steps = [];
    for (let row = 1; row <= n; row++) {
      steps.push(async () => {
        triHighlight([0]);
        triPlayer.setStatus(`Outer loop: row = ${row}`, '');
      });
      const line = consoleLine(triConsole, 'plain');
      for (let col = 1; col <= row; col++) {
        steps.push(async () => {
          triHighlight([2, 4]);
          line.textContent += '*';
          triConsole.scrollTop = triConsole.scrollHeight;
          triPlayer.setStatus(`Inner loop: col = ${col} → print "*"`, '');
        });
      }
      steps.push(async () => {
        triHighlight([6]);
        triPlayer.setStatus(`Row ${row} done — move to a new line`, '');
      });
    }
    steps.push(async () => {
      triPlayer.setStatus(`Done — printed a triangle of ${n} rows.`, 'ok');
    });
    return steps;
  }

  const triPlayer = wireStepControls(
    { playBtn: triPlayBtn, stepBtn: triStepBtn, resetBtn: triResetBtn, statusEl: triStatusEl },
    { build: buildTriangle, onReset() { clearEl(triConsole); }, delay: 160 }
  );

  triNInput.addEventListener('change', () => triPlayer.restart());
});
