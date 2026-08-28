document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- Demo 1: for loop summing an array ---------------- */

  const stage = document.getElementById('loop-stage');
  const flowEl = document.getElementById('loop-flow');
  const codeEl = document.getElementById('loop-code');
  const playBtn = document.getElementById('loop-play-btn');
  const stepBtn = document.getElementById('loop-step-btn');
  const resetBtn = document.getElementById('loop-reset-btn');
  const statusEl = document.getElementById('loop-status');

  const values = [4, 9, 2, 7, 5];

  const codeLines = [
    '<span class="type">int</span> sum = 0;',
    '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; numbers.Length; i++)',
    '{',
    '    sum += numbers[i];',
    '}',
    '<span class="cmt">// sum now holds the total</span>',
  ];
  const highlight = codeBlock(codeEl, codeLines);

  const flowStages = ['start', 'condition', 'body', 'increment'];
  const flowBoxes = {};
  function renderFlow() {
    clearEl(flowEl);
    const labels = { start: 'i = 0', condition: 'i < Length?', body: 'sum += numbers[i]', increment: 'i++' };
    flowStages.forEach((key, idx) => {
      const box = el('div', 'flow-box', labels[key]);
      flowBoxes[key] = box;
      flowEl.appendChild(box);
      if (idx < flowStages.length - 1) flowEl.appendChild(el('span', 'flow-arrow', '→'));
    });
  }
  function setFlow(active) {
    flowStages.forEach((key) => flowBoxes[key].classList.toggle('active', key === active));
  }

  let cells = [];

  function build() {
    cells = renderArray(stage, values);
    renderFlow();
    highlight();
    let sum = 0;

    const steps = [];

    steps.push(async () => {
      highlight([0]);
      setFlow(null);
      player.setStatus('sum = 0', '');
    });

    for (let i = 0; i < values.length; i++) {
      steps.push(async () => {
        highlight([1]);
        setFlow('condition');
        clearPointers(cells);
        setPointer(cells[i], 'i');
        setCellState(cells[i], 'current');
        player.setStatus(`Check: i = ${i} < ${values.length} → true`, '');
      });
      steps.push(async () => {
        highlight([3]);
        setFlow('body');
        sum += values[i];
        player.setStatus(`sum += numbers[${i}] → sum = ${sum}`, '');
      });
      steps.push(async () => {
        setFlow('increment');
        setCellState(cells[i], '');
        highlight([1]);
      });
    }

    steps.push(async () => {
      highlight([1]);
      setFlow('condition');
      player.setStatus(`Check: i = ${values.length} < ${values.length} → false. Loop ends.`, '');
    });

    steps.push(async () => {
      highlight([5]);
      setFlow(null);
      clearPointers(cells);
      player.setStatus(`Done — total sum = ${sum}`, 'ok');
    });

    return steps;
  }

  const player = wireStepControls(
    { playBtn, stepBtn, resetBtn, statusEl },
    { build, onReset() { clearEl(stage); clearEl(flowEl); }, delay: 550 }
  );

  /* ---------------- Demo: the same sum, with a while loop ---------------- */

  const whileStage = document.getElementById('while-stage');
  const whileFlowEl = document.getElementById('while-flow');
  const whileCodeEl = document.getElementById('while-code');
  const whilePlayBtn = document.getElementById('while-play-btn');
  const whileStepBtn = document.getElementById('while-step-btn');
  const whileResetBtn = document.getElementById('while-reset-btn');
  const whileStatusEl = document.getElementById('while-status');

  const whileCodeLines = [
    '<span class="type">int</span> i = 0;',
    '<span class="type">int</span> sum = 0;',
    '<span class="kw">while</span> (i &lt; numbers.Length)',
    '{',
    '    sum += numbers[i];',
    '    i++;',
    '}',
    '<span class="cmt">// same result as the for loop — sum now holds the total</span>',
  ];
  const whileHighlight = codeBlock(whileCodeEl, whileCodeLines);

  const whileFlowStages = ['condition', 'body', 'increment'];
  const whileFlowBoxes = {};
  function renderWhileFlow() {
    clearEl(whileFlowEl);
    const labels = { condition: 'i < Length?', body: 'sum += numbers[i]', increment: 'i++' };
    whileFlowStages.forEach((key, idx) => {
      const box = el('div', 'flow-box', labels[key]);
      whileFlowBoxes[key] = box;
      whileFlowEl.appendChild(box);
      if (idx < whileFlowStages.length - 1) whileFlowEl.appendChild(el('span', 'flow-arrow', '→'));
    });
  }
  function setWhileFlow(active) {
    whileFlowStages.forEach((key) => whileFlowBoxes[key].classList.toggle('active', key === active));
  }

  let whileCells = [];

  function buildWhile() {
    whileCells = renderArray(whileStage, values);
    renderWhileFlow();
    whileHighlight();
    let sum = 0;

    const steps = [];

    steps.push(async () => {
      whileHighlight([0, 1]);
      whilePlayer.setStatus('i = 0, sum = 0 — both set up before the loop starts', '');
    });

    for (let i = 0; i < values.length; i++) {
      steps.push(async () => {
        whileHighlight([2]);
        setWhileFlow('condition');
        clearPointers(whileCells);
        setPointer(whileCells[i], 'i');
        setCellState(whileCells[i], 'current');
        whilePlayer.setStatus(`Check: i = ${i} < ${values.length} → true`, '');
      });
      steps.push(async () => {
        whileHighlight([4]);
        setWhileFlow('body');
        sum += values[i];
        whilePlayer.setStatus(`sum += numbers[${i}] → sum = ${sum}`, '');
      });
      steps.push(async () => {
        whileHighlight([5]);
        setWhileFlow('increment');
        setCellState(whileCells[i], '');
      });
    }

    steps.push(async () => {
      whileHighlight([2]);
      setWhileFlow('condition');
      whilePlayer.setStatus(`Check: i = ${values.length} < ${values.length} → false. Loop ends.`, '');
    });

    steps.push(async () => {
      whileHighlight([7]);
      setWhileFlow(null);
      clearPointers(whileCells);
      whilePlayer.setStatus(`Done — total sum = ${sum} (identical to the for loop).`, 'ok');
    });

    return steps;
  }

  const whilePlayer = wireStepControls(
    { playBtn: whilePlayBtn, stepBtn: whileStepBtn, resetBtn: whileResetBtn, statusEl: whileStatusEl },
    { build: buildWhile, onReset() { clearEl(whileStage); clearEl(whileFlowEl); }, delay: 550 }
  );

  /* ---------------- Demo: do-while runs at least once ---------------- */

  const doWhileConsole = document.getElementById('dowhile-console');
  const doWhileCodeEl = document.getElementById('dowhile-code');
  const doWhileStartInput = document.getElementById('dowhile-start');
  const doWhilePlayBtn = document.getElementById('dowhile-play-btn');
  const doWhileStepBtn = document.getElementById('dowhile-step-btn');
  const doWhileResetBtn = document.getElementById('dowhile-reset-btn');
  const doWhileStatusEl = document.getElementById('dowhile-status');

  const doWhileCodeLines = [
    '<span class="type">int</span> n = start;',
    '<span class="kw">do</span>',
    '{',
    '    Console.WriteLine(<span class="str">"n = "</span> + n);',
    '    n++;',
    '} <span class="kw">while</span> (n &lt; 3);',
    '<span class="cmt">// the condition is checked AFTER the body runs</span>',
  ];
  const doWhileHighlight = codeBlock(doWhileCodeEl, doWhileCodeLines);

  function consoleLine(container, cls) {
    const line = el('span', 'console-line' + (cls ? ' ' + cls : ''), '');
    container.appendChild(line);
    container.appendChild(document.createElement('br'));
    container.scrollTop = container.scrollHeight;
    return line;
  }

  function buildDoWhile() {
    const start = Math.max(-5, Math.min(6, parseInt(doWhileStartInput.value, 10) || 0));
    doWhileStartInput.value = start;
    clearEl(doWhileConsole);
    doWhileHighlight();

    const steps = [];
    steps.push(async () => {
      doWhileHighlight([0]);
      doWhilePlayer.setStatus(`n = ${start}`, '');
    });

    let n = start;
    let iterations = 0;
    do {
      const printedN = n;
      steps.push(async () => {
        doWhileHighlight([3]);
        consoleLine(doWhileConsole, 'plain').textContent = `n = ${printedN}`;
        doWhilePlayer.setStatus(`Body runs: print "n = ${printedN}"`, '');
      });
      n += 1;
      const afterIncrement = n;
      steps.push(async () => {
        doWhileHighlight([4]);
        doWhilePlayer.setStatus(`n++ → n = ${afterIncrement}`, '');
      });
      const condTrue = n < 3;
      steps.push(async () => {
        doWhileHighlight([5]);
        doWhilePlayer.setStatus(
          `Check (after the body): n < 3 → ${afterIncrement} < 3 → ${condTrue}`,
          condTrue ? '' : 'ok'
        );
      });
      iterations += 1;
    } while (n < 3 && iterations < 8);

    steps.push(async () => {
      const note = start >= 3 ? ' — the condition was already false, but the body still ran once!' : '';
      doWhilePlayer.setStatus(`Done — body ran ${iterations} time(s)${note}`, 'ok');
    });

    return steps;
  }

  const doWhilePlayer = wireStepControls(
    { playBtn: doWhilePlayBtn, stepBtn: doWhileStepBtn, resetBtn: doWhileResetBtn, statusEl: doWhileStatusEl },
    { build: buildDoWhile, onReset() { clearEl(doWhileConsole); }, delay: 550 }
  );

  doWhileStartInput.addEventListener('change', () => doWhilePlayer.restart());

  /* ---------------- Demo 2: nested for loops over a 2D array ---------------- */

  const nestedStage = document.getElementById('nested-grid-stage');
  const nestedCodeEl = document.getElementById('nested-code');
  const nestedPlayBtn = document.getElementById('nested-play-btn');
  const nestedStepBtn = document.getElementById('nested-step-btn');
  const nestedResetBtn = document.getElementById('nested-reset-btn');
  const nestedStatusEl = document.getElementById('nested-status');

  const grid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];

  const nestedCodeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> r = 0; r &lt; grid.GetLength(0); r++)',
    '{',
    '    <span class="kw">for</span> (<span class="type">int</span> c = 0; c &lt; grid.GetLength(1); c++)',
    '    {',
    '        Visit(grid[r, c]);',
    '    }',
    '}',
  ];
  const nestedHighlight = codeBlock(nestedCodeEl, nestedCodeLines);

  let nestedCells = [];

  function renderNestedGrid() {
    clearEl(nestedStage);
    nestedCells = grid.map((rowValues, r) => {
      const rowEl = el('div', 'grid-2d-row');
      const rowCells = rowValues.map((v, c) => {
        const wrap = makeCell(v, c, { showIndex: false, showPointer: false });
        rowEl.appendChild(wrap);
        return wrap;
      });
      nestedStage.appendChild(rowEl);
      return rowCells;
    });
  }

  function buildNested() {
    renderNestedGrid();
    nestedHighlight();
    const steps = [];
    for (let r = 0; r < grid.length; r++) {
      steps.push(async () => {
        nestedHighlight([0]);
        nestedPlayer.setStatus(`Outer loop: r = ${r}`, '');
      });
      for (let c = 0; c < grid[r].length; c++) {
        steps.push(async () => {
          nestedHighlight([2, 4]);
          nestedCells.forEach((row) => row.forEach((cell) => setCellState(cell, '')));
          setCellState(nestedCells[r][c], 'current');
          nestedPlayer.setStatus(`Inner loop: c = ${c} → visiting grid[${r}, ${c}] = ${grid[r][c]}`, '');
        });
      }
    }
    steps.push(async () => {
      nestedPlayer.setStatus('Done — every cell visited row by row.', 'ok');
    });
    return steps;
  }

  const nestedPlayer = wireStepControls(
    { playBtn: nestedPlayBtn, stepBtn: nestedStepBtn, resetBtn: nestedResetBtn, statusEl: nestedStatusEl },
    { build: buildNested, onReset() { clearEl(nestedStage); }, delay: 380 }
  );
});
