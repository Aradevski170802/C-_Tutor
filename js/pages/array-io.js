document.addEventListener('DOMContentLoaded', () => {
  function consoleLine(container, cls) {
    const line = el('span', 'console-line' + (cls ? ' ' + cls : ''), '');
    container.appendChild(line);
    container.appendChild(document.createElement('br'));
    container.scrollTop = container.scrollHeight;
    return line;
  }

  /* ---------------- Demo 1: reading a whole array from one line ---------------- */

  const inputConsole = document.getElementById('io-input-console');
  const partsStage = document.getElementById('io-parts-stage');
  const numbersStage = document.getElementById('io-numbers-stage');
  const ioCodeEl = document.getElementById('io-code');
  const ioPlayBtn = document.getElementById('io-play-btn');
  const ioStepBtn = document.getElementById('io-step-btn');
  const ioResetBtn = document.getElementById('io-reset-btn');
  const ioStatusEl = document.getElementById('io-status');

  const inputTokens = ['10', '20', '30', '40', '50'];

  const ioCodeLines = [
    '<span class="type">string</span> line = Console.<span class="fn">ReadLine</span>();',
    '<span class="cmt">// user types: 10 20 30 40 50</span>',
    '<span class="type">string</span>[] parts = line.<span class="fn">Split</span>(\' \');',
    '',
    '<span class="type">int</span>[] numbers = <span class="kw">new</span> <span class="type">int</span>[parts.Length];',
    '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; parts.Length; i++)',
    '    numbers[i] = <span class="type">int</span>.<span class="fn">Parse</span>(parts[i]);',
  ];
  const ioHighlight = codeBlock(ioCodeEl, ioCodeLines);

  let partsCells = [];
  let numbersCells = [];

  function buildIo() {
    clearEl(inputConsole);
    clearEl(partsStage);
    clearEl(numbersStage);
    ioHighlight();

    const steps = [];

    steps.push(async () => {
      ioHighlight([0, 1]);
      consoleLine(inputConsole, 'plain').textContent = '> 10 20 30 40 50';
    });

    steps.push(async () => {
      ioHighlight([2]);
      partsCells = renderArray(partsStage, inputTokens, { showIndex: false });
      partsCells.forEach((c) => c.cell.classList.add('shift'));
      ioPlayer.setStatus('line.Split(\' \') → 5 text pieces: "10", "20", "30", "40", "50"', '');
    });

    steps.push(async () => {
      ioHighlight([4]);
      numbersCells = renderArray(numbersStage, new Array(inputTokens.length).fill(''));
      numbersCells.forEach((c) => c.cell.classList.add('empty'));
    });

    for (let i = 0; i < inputTokens.length; i++) {
      steps.push(async () => {
        ioHighlight([5, 6]);
        setPointer(partsCells[i], 'i');
        setPointer(numbersCells[i], 'i');
        setCellState(partsCells[i], 'compare');
        setCellState(numbersCells[i], 'compare');
        await sleep(320);
        numbersCells[i].cell.textContent = parseInt(inputTokens[i], 10);
        numbersCells[i].cell.classList.remove('empty');
        setCellState(numbersCells[i], 'inserted');
        setCellState(partsCells[i], 'shift');
        ioPlayer.setStatus(`numbers[${i}] = int.Parse("${inputTokens[i]}") = ${inputTokens[i]}`, '');
      });
    }

    steps.push(async () => {
      clearPointers(partsCells);
      clearPointers(numbersCells);
      ioPlayer.setStatus(`Done — numbers is now [${inputTokens.join(', ')}], all parsed from one line.`, 'ok');
    });

    return steps;
  }

  const ioPlayer = wireStepControls(
    { playBtn: ioPlayBtn, stepBtn: ioStepBtn, resetBtn: ioResetBtn, statusEl: ioStatusEl },
    { build: buildIo, onReset() { clearEl(inputConsole); clearEl(partsStage); clearEl(numbersStage); }, delay: 550 }
  );

  /* ---------------- Demo 2: printing a 1D array ---------------- */

  const printStage = document.getElementById('print-stage');
  const printConsole = document.getElementById('print-console');
  const printCodeEl = document.getElementById('print-code');
  const printPlayBtn = document.getElementById('print-play-btn');
  const printStepBtn = document.getElementById('print-step-btn');
  const printResetBtn = document.getElementById('print-reset-btn');
  const printStatusEl = document.getElementById('print-status');

  const printValues = [10, 20, 30, 40, 50];

  const printCodeLines = [
    '<span class="type">int</span>[] numbers = { 10, 20, 30, 40, 50 };',
    '',
    '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; numbers.Length; i++)',
    '{',
    '    Console.Write(numbers[i] + <span class="str">" "</span>);',
    '}',
    'Console.WriteLine();',
  ];
  const printHighlight = codeBlock(printCodeEl, printCodeLines);

  let printCells = [];

  function buildPrint() {
    printCells = renderArray(printStage, printValues, { showIndex: false });
    clearEl(printConsole);
    printHighlight();
    const line = consoleLine(printConsole, 'plain');

    const steps = [];
    steps.push(async () => {
      printHighlight([0]);
    });
    for (let i = 0; i < printValues.length; i++) {
      steps.push(async () => {
        printHighlight([2]);
        printCells.forEach((c) => setCellState(c, ''));
        setCellState(printCells[i], 'current');
        printPlayer.setStatus(`i = ${i}`, '');
      });
      steps.push(async () => {
        printHighlight([4]);
        line.textContent += printValues[i] + ' ';
        printConsole.scrollTop = printConsole.scrollHeight;
      });
    }
    steps.push(async () => {
      printHighlight([6]);
      printCells.forEach((c) => setCellState(c, ''));
      printPlayer.setStatus('Done — printed on one line, ending with a newline.', 'ok');
    });
    return steps;
  }

  const printPlayer = wireStepControls(
    { playBtn: printPlayBtn, stepBtn: printStepBtn, resetBtn: printResetBtn, statusEl: printStatusEl },
    { build: buildPrint, onReset() { clearEl(printStage); clearEl(printConsole); }, delay: 380 }
  );

  /* ---------------- Demo 3: printing a matrix ---------------- */

  const print2dStage = document.getElementById('print2d-stage');
  const print2dConsole = document.getElementById('print2d-console');
  const print2dCodeEl = document.getElementById('print2d-code');
  const print2dPlayBtn = document.getElementById('print2d-play-btn');
  const print2dStepBtn = document.getElementById('print2d-step-btn');
  const print2dResetBtn = document.getElementById('print2d-reset-btn');
  const print2dStatusEl = document.getElementById('print2d-status');

  const printGrid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];

  const print2dCodeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> r = 0; r &lt; grid.GetLength(0); r++)',
    '{',
    '    <span class="kw">for</span> (<span class="type">int</span> c = 0; c &lt; grid.GetLength(1); c++)',
    '    {',
    '        Console.Write(grid[r, c] + <span class="str">"\\t"</span>);',
    '    }',
    '    Console.WriteLine();',
    '}',
  ];
  const print2dHighlight = codeBlock(print2dCodeEl, print2dCodeLines);

  let print2dCells = [];

  function renderPrintGrid() {
    clearEl(print2dStage);
    print2dCells = printGrid.map((rowValues, r) => {
      const rowEl = el('div', 'grid-2d-row');
      const rowCells = rowValues.map((v, c) => {
        const wrap = makeCell(v, c, { showIndex: false, showPointer: false });
        rowEl.appendChild(wrap);
        return wrap;
      });
      print2dStage.appendChild(rowEl);
      return rowCells;
    });
  }

  function buildPrint2d() {
    renderPrintGrid();
    clearEl(print2dConsole);
    print2dHighlight();

    const steps = [];
    for (let r = 0; r < printGrid.length; r++) {
      steps.push(async () => {
        print2dHighlight([0]);
        print2dPlayer.setStatus(`Outer loop: r = ${r}`, '');
      });
      const line = consoleLine(print2dConsole, 'plain');
      for (let c = 0; c < printGrid[r].length; c++) {
        steps.push(async () => {
          print2dHighlight([2, 4]);
          print2dCells.forEach((row) => row.forEach((cell) => setCellState(cell, '')));
          setCellState(print2dCells[r][c], 'current');
          line.textContent += printGrid[r][c] + '\t';
          print2dConsole.scrollTop = print2dConsole.scrollHeight;
        });
      }
      steps.push(async () => {
        print2dHighlight([6]);
        print2dPlayer.setStatus(`Row ${r} done — Console.WriteLine() moves to the next line.`, '');
      });
    }
    steps.push(async () => {
      print2dCells.forEach((row) => row.forEach((cell) => setCellState(cell, '')));
      print2dPlayer.setStatus('Done — the whole grid printed row by row.', 'ok');
    });
    return steps;
  }

  const print2dPlayer = wireStepControls(
    { playBtn: print2dPlayBtn, stepBtn: print2dStepBtn, resetBtn: print2dResetBtn, statusEl: print2dStatusEl },
    { build: buildPrint2d, onReset() { clearEl(print2dStage); clearEl(print2dConsole); }, delay: 350 }
  );
});
