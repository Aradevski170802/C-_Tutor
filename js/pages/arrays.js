document.addEventListener('DOMContentLoaded', () => {
  function clamp(n, min, max) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  /* ---------------- Demo 1: insert by building a bigger array ---------------- */

  const codeEl = document.getElementById('code');
  const stageRow = document.getElementById('array-stage');
  const indexInput = document.getElementById('insert-index');
  const valueInput = document.getElementById('insert-value');
  const playBtn = document.getElementById('play-btn');
  const stepBtn = document.getElementById('step-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusEl = document.getElementById('status');

  const baseValues = [10, 20, 30, 40, 50];

  const codeLines = [
    '<span class="type">int</span>[] numbers = { 10, 20, 30, 40, 50 };',
    '<span class="type">int</span>[] bigger = <span class="kw">new</span> <span class="type">int</span>[numbers.Length + 1];',
    '',
    '<span class="cmt">// copy everything into the new array first</span>',
    '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; numbers.Length; i++)',
    '    bigger[i] = numbers[i];',
    '',
    '<span class="cmt">// then shift everything from "index" onward, one slot right</span>',
    '<span class="kw">for</span> (<span class="type">int</span> i = bigger.Length - 1; i &gt; index; i--)',
    '    bigger[i] = bigger[i - 1];',
    '',
    'bigger[index] = value;',
    'numbers = bigger;',
  ];
  const highlight = codeBlock(codeEl, codeLines);

  let cells = [];

  function build() {
    const index = clamp(parseInt(indexInput.value, 10), 0, baseValues.length);
    indexInput.value = index;
    const value = clamp(parseInt(valueInput.value, 10) || 0, -999, 999);
    valueInput.value = value;

    const values = [...baseValues];
    cells = renderArray(stageRow, values);
    highlight();

    const steps = [];

    steps.push(async () => {
      highlight([0, 1]);
    });

    steps.push(async () => {
      highlight([4, 5]);
      values.push(null);
      const grown = renderArray(stageRow, values.map((v) => (v === null ? '' : v)));
      grown.forEach((c, i) => {
        if (values[i] === null) c.cell.classList.add('empty');
      });
      cells = grown;
      player.setStatus('Copied every value from "numbers" into the new "bigger" array.', '');
    });

    // values.length is still the pre-growth count here — the push(null) above
    // only happens when that step actually runs, so the final index is
    // values.length (not values.length - 1).
    for (let i = values.length; i > index; i--) {
      const from = i - 1;
      const to = i;
      steps.push(async () => {
        highlight([8, 9]);
        setPointer(cells[from], 'i-1');
        setPointer(cells[to], 'i');
        setCellState(cells[from], 'compare');
        setCellState(cells[to], 'compare');
        await sleep(350);
        values[to] = values[from];
        cells[to].cell.textContent = values[to];
        cells[to].cell.classList.remove('empty');
        setCellState(cells[to], 'shift');
      });
    }

    steps.push(async () => {
      highlight([11, 12]);
      clearPointers(cells);
      resetCellStates(cells);
      values[index] = value;
      cells[index].cell.textContent = value;
      cells[index].cell.classList.remove('empty');
      setCellState(cells[index], 'inserted');
      setPointer(cells[index], 'index');
      player.setStatus(`bigger[${index}] = ${value}, then numbers = bigger — a brand new array.`, 'ok');
    });

    return steps;
  }

  const player = wireStepControls(
    { playBtn, stepBtn, resetBtn, statusEl },
    {
      build,
      onReset() {
        clearEl(stageRow);
      },
      delay: 700,
    }
  );

  [indexInput, valueInput].forEach((input) =>
    input.addEventListener('change', () => player.restart())
  );

  /* ---------------- Demo 2: removing an element (shift left) ---------------- */

  const removeCodeEl = document.getElementById('remove-code');
  const removeStage = document.getElementById('remove-stage');
  const removeIndexInput = document.getElementById('remove-index');
  const removePlayBtn = document.getElementById('remove-play-btn');
  const removeStepBtn = document.getElementById('remove-step-btn');
  const removeResetBtn = document.getElementById('remove-reset-btn');
  const removeStatusEl = document.getElementById('remove-status');

  const removeBase = [10, 20, 30, 40, 50];

  const removeCodeLines = [
    '<span class="type">int</span>[] numbers = { 10, 20, 30, 40, 50 };',
    '',
    '<span class="kw">for</span> (<span class="type">int</span> i = removeIndex; i &lt; numbers.Length - 1; i++)',
    '    numbers[i] = numbers[i + 1];',
    '',
    'numbers[numbers.Length - 1] = 0; <span class="cmt">// last slot is now unused</span>',
    '<span class="cmt">// numbers is still length 5 — an array never shrinks</span>',
  ];
  const removeHighlight = codeBlock(removeCodeEl, removeCodeLines);

  let removeCells = [];

  function buildRemove() {
    const index = clamp(parseInt(removeIndexInput.value, 10), 0, removeBase.length - 1);
    removeIndexInput.value = index;

    const values = [...removeBase];
    removeCells = renderArray(removeStage, values);
    removeHighlight();

    const steps = [];

    steps.push(async () => {
      removeHighlight([0]);
    });

    for (let i = index; i < values.length - 1; i++) {
      const from = i + 1;
      const to = i;
      steps.push(async () => {
        removeHighlight([2, 3]);
        setPointer(removeCells[from], 'i+1');
        setPointer(removeCells[to], 'i');
        setCellState(removeCells[from], 'compare');
        setCellState(removeCells[to], 'compare');
        await sleep(350);
        values[to] = values[from];
        removeCells[to].cell.textContent = values[to];
        setCellState(removeCells[to], 'shift');
      });
    }

    steps.push(async () => {
      removeHighlight([5, 6]);
      clearPointers(removeCells);
      resetCellStates(removeCells);
      const last = values.length - 1;
      values[last] = 0;
      removeCells[last].cell.textContent = '0';
      setCellState(removeCells[last], 'notfound');
      removePlayer.setStatus(
        `Removed index ${index} — everything after it shifted left. Slot ${last} is now unused.`,
        'ok'
      );
    });

    return steps;
  }

  const removePlayer = wireStepControls(
    { playBtn: removePlayBtn, stepBtn: removeStepBtn, resetBtn: removeResetBtn, statusEl: removeStatusEl },
    { build: buildRemove, onReset() { clearEl(removeStage); }, delay: 550 }
  );

  removeIndexInput.addEventListener('change', () => removePlayer.restart());

  /* ---------------- Demo 3: a few built-in array helpers ---------------- */

  const methodBeforeEl = document.getElementById('method-before');
  const methodResultEl = document.getElementById('method-result');
  const methodSelect = document.getElementById('method-select');
  const methodRunBtn = document.getElementById('method-run-btn');
  const methodCodeEl = document.getElementById('method-code');
  const methodStatusEl = document.getElementById('method-status');

  const sample = [5, 3, 8, 1, 9];

  const methodDefs = {
    indexof: {
      code: '<span class="type">int</span> index = <span class="type">Array</span>.<span class="fn">IndexOf</span>(numbers, 8);',
      run: (arr) => ({ kind: 'value', label: 'index', value: arr.indexOf(8) }),
    },
    'sort-asc': {
      code: '<span class="type">Array</span>.<span class="fn">Sort</span>(numbers); <span class="cmt">// ascending</span>',
      run: (arr) => ({ kind: 'array', value: [...arr].sort((a, b) => a - b) }),
    },
    'sort-desc': {
      code: [
        '<span class="type">Array</span>.<span class="fn">Sort</span>(numbers); <span class="cmt">// sort ascending first...</span>',
        '<span class="type">Array</span>.<span class="fn">Reverse</span>(numbers); <span class="cmt">// ...then flip it — descending</span>',
      ],
      run: (arr) => ({ kind: 'array', value: [...arr].sort((a, b) => a - b).reverse() }),
    },
    reverse: {
      code: '<span class="type">Array</span>.<span class="fn">Reverse</span>(numbers);',
      run: (arr) => ({ kind: 'array', value: [...arr].reverse() }),
    },
    length: {
      code: '<span class="type">int</span> count = numbers.<span class="fn">Length</span>;',
      run: (arr) => ({ kind: 'value', label: 'count', value: arr.length }),
    },
  };

  function runMethodDemo() {
    renderArray(methodBeforeEl, sample, { showIndex: false, showPointer: false });
    const def = methodDefs[methodSelect.value];
    const result = def.run(sample);

    codeBlock(methodCodeEl, [
      '<span class="type">int</span>[] numbers = { 5, 3, 8, 1, 9 };',
      '',
      ...(Array.isArray(def.code) ? def.code : [def.code]),
    ]);

    clearEl(methodResultEl);
    if (result.kind === 'array') {
      methodResultEl.className = 'array-row';
      const cells = renderArray(methodResultEl, result.value, { showIndex: false, showPointer: false });
      cells.forEach((c) => c.cell.classList.add('inserted'));
      methodStatusEl.textContent = `numbers is now [${result.value.join(', ')}] — Array.Sort/Reverse change it in place`;
    } else {
      methodResultEl.className = 'flow-diagram';
      const box = el('div', 'flow-box active', `${result.label} = ${result.value}`);
      methodResultEl.appendChild(box);
      methodStatusEl.textContent = `numbers is unchanged — ${result.label} = ${result.value}`;
    }
    methodStatusEl.className = 'status-line ok';
  }

  methodRunBtn.addEventListener('click', runMethodDemo);
  methodSelect.addEventListener('change', runMethodDemo);
  runMethodDemo();
});
