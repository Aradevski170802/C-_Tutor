document.addEventListener('DOMContentLoaded', () => {
  function clamp(n, min, max) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  /* ---------------- Demo 1: max / min ---------------- */

  const mmStage = document.getElementById('mm-stage');
  const mmBestBox = document.getElementById('mm-best-box');
  const mmCodeEl = document.getElementById('mm-code');
  const mmModeSelect = document.getElementById('mm-mode');
  const mmPlayBtn = document.getElementById('mm-play-btn');
  const mmStepBtn = document.getElementById('mm-step-btn');
  const mmResetBtn = document.getElementById('mm-reset-btn');
  const mmStatusEl = document.getElementById('mm-status');

  const mmValues = [7, 2, 9, 4, 1, 8];

  function mmCodeLines(mode) {
    const varName = mode === 'max' ? 'max' : 'min';
    const op = mode === 'max' ? '&gt;' : '&lt;';
    return [
      `<span class="type">int</span> ${varName} = numbers[0];`,
      `<span class="kw">for</span> (<span class="type">int</span> i = 1; i &lt; numbers.Length; i++)`,
      '{',
      `    <span class="kw">if</span> (numbers[i] ${op} ${varName})`,
      `        ${varName} = numbers[i];`,
      '}',
      `<span class="cmt">// ${varName} now holds the ${mode === 'max' ? 'largest' : 'smallest'} value</span>`,
    ];
  }

  let mmCells = [];

  function buildMm() {
    const mode = mmModeSelect.value;
    const mmHighlight = codeBlock(mmCodeEl, mmCodeLines(mode));
    mmCells = renderArray(mmStage, mmValues, { showIndex: false });
    let best = mmValues[0];
    mmBestBox.textContent = `best = ${best}`;
    mmBestBox.classList.remove('active');

    const steps = [];
    steps.push(async () => {
      mmHighlight([0]);
      setCellState(mmCells[0], 'current');
      mmPlayer.setStatus(`Start by assuming numbers[0] = ${best} is the answer.`, '');
    });

    for (let i = 1; i < mmValues.length; i++) {
      steps.push(async () => {
        mmHighlight([1, 3]);
        mmCells.forEach((c) => setCellState(c, ''));
        setCellState(mmCells[i], 'compare');
        setPointer(mmCells[i], 'i');
        const better = mode === 'max' ? mmValues[i] > best : mmValues[i] < best;
        mmPlayer.setStatus(
          `Compare numbers[${i}] = ${mmValues[i]} ${mode === 'max' ? '>' : '<'} ${best}? ${better ? 'yes' : 'no'}`,
          ''
        );
        await sleep(300);
        if (better) {
          mmHighlight([4]);
          best = mmValues[i];
          mmBestBox.textContent = `best = ${best}`;
          mmBestBox.classList.add('active');
          setCellState(mmCells[i], 'inserted');
        }
      });
    }

    steps.push(async () => {
      mmHighlight([6]);
      mmCells.forEach((c) => setCellState(c, ''));
      const finalIndex = mmValues.indexOf(best);
      setCellState(mmCells[finalIndex], 'found');
      clearPointers(mmCells);
      mmBestBox.classList.remove('active');
      mmPlayer.setStatus(`Done — ${mode} = ${best}.`, 'ok');
    });

    return steps;
  }

  const mmPlayer = wireStepControls(
    { playBtn: mmPlayBtn, stepBtn: mmStepBtn, resetBtn: mmResetBtn, statusEl: mmStatusEl },
    { build: buildMm, onReset() { clearEl(mmStage); }, delay: 550 }
  );

  mmModeSelect.addEventListener('change', () => mmPlayer.restart());

  /* ---------------- Demo 2: counting ---------------- */

  const countStage = document.getElementById('count-stage');
  const countBox = document.getElementById('count-box');
  const countCodeEl = document.getElementById('count-code');
  const countThresholdInput = document.getElementById('count-threshold');
  const countPlayBtn = document.getElementById('count-play-btn');
  const countStepBtn = document.getElementById('count-step-btn');
  const countResetBtn = document.getElementById('count-reset-btn');
  const countStatusEl = document.getElementById('count-status');

  const countValues = [3, 8, 15, 6, 21, 9, 4];

  function countCodeLines(threshold) {
    return [
      `<span class="type">int</span> threshold = ${threshold};`,
      '<span class="type">int</span> count = 0;',
      '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; numbers.Length; i++)',
      '{',
      '    <span class="kw">if</span> (numbers[i] &gt; threshold)',
      '        count++;',
      '}',
      '<span class="cmt">// count now holds how many were greater than threshold</span>',
    ];
  }

  let countCells = [];

  function buildCount() {
    const threshold = clamp(parseInt(countThresholdInput.value, 10) || 0, -99, 99);
    countThresholdInput.value = threshold;
    const countHighlight = codeBlock(countCodeEl, countCodeLines(threshold));
    countCells = renderArray(countStage, countValues, { showIndex: false });
    countBox.textContent = 'count = 0';
    countBox.classList.remove('active');
    let count = 0;

    const steps = [];
    steps.push(async () => {
      countHighlight([0, 1]);
    });

    for (let i = 0; i < countValues.length; i++) {
      steps.push(async () => {
        countHighlight([2, 4]);
        countCells.forEach((c) => setCellState(c, ''));
        setCellState(countCells[i], 'compare');
        setPointer(countCells[i], 'i');
        const matches = countValues[i] > threshold;
        countPlayer.setStatus(
          `numbers[${i}] = ${countValues[i]} > ${threshold}? ${matches ? 'yes → count++' : 'no'}`,
          ''
        );
        await sleep(300);
        if (matches) {
          countHighlight([5]);
          count += 1;
          countBox.textContent = `count = ${count}`;
          countBox.classList.add('active');
          setCellState(countCells[i], 'found');
        }
      });
    }

    steps.push(async () => {
      countHighlight([7]);
      clearPointers(countCells);
      countBox.classList.remove('active');
      countPlayer.setStatus(`Done — count = ${count} value(s) greater than ${threshold}.`, 'ok');
    });

    return steps;
  }

  const countPlayer = wireStepControls(
    { playBtn: countPlayBtn, stepBtn: countStepBtn, resetBtn: countResetBtn, statusEl: countStatusEl },
    { build: buildCount, onReset() { clearEl(countStage); }, delay: 480 }
  );

  countThresholdInput.addEventListener('change', () => countPlayer.restart());

  /* ---------------- Demo 3: bubble sort ---------------- */

  const sortStage = document.getElementById('sort-stage');
  const sortCodeEl = document.getElementById('sort-code');
  const sortPlayBtn = document.getElementById('sort-play-btn');
  const sortStepBtn = document.getElementById('sort-step-btn');
  const sortResetBtn = document.getElementById('sort-reset-btn');
  const sortStatusEl = document.getElementById('sort-status');

  const sortBase = [5, 2, 8, 1, 9, 3];

  const sortCodeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; numbers.Length - 1; i++)',
    '{',
    '    <span class="kw">for</span> (<span class="type">int</span> j = 0; j &lt; numbers.Length - 1 - i; j++)',
    '    {',
    '        <span class="kw">if</span> (numbers[j] &gt; numbers[j + 1])',
    '        {',
    '            <span class="type">int</span> temp = numbers[j];',
    '            numbers[j] = numbers[j + 1];',
    '            numbers[j + 1] = temp;',
    '        }',
    '    }',
    '}',
  ];
  const sortHighlight = codeBlock(sortCodeEl, sortCodeLines);

  let sortCells = [];

  function buildSort() {
    const values = [...sortBase];
    sortCells = renderArray(sortStage, values, { showIndex: false });
    sortHighlight();

    const steps = [];
    const n = values.length;

    // Each (i, j) pair gets exactly one step that both compares AND decides
    // whether to swap — the decision has to happen when the step actually
    // runs (after every earlier swap has already mutated `values`), not
    // while building the step list, or every comparison after the first
    // would be judging stale, pre-sort data.
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1 - i; j++) {
        steps.push(async () => {
          sortHighlight([2, 4]);
          sortCells.forEach((c) => {
            if (!c.cell.classList.contains('found')) setCellState(c, '');
          });
          setCellState(sortCells[j], 'compare');
          setCellState(sortCells[j + 1], 'compare');
          setPointer(sortCells[j], 'j');
          setPointer(sortCells[j + 1], 'j+1');
          sortPlayer.setStatus(`Compare numbers[${j}] = ${values[j]} and numbers[${j + 1}] = ${values[j + 1]}`, '');
          await sleep(280);

          if (values[j] > values[j + 1]) {
            sortHighlight([6, 7, 8]);
            const tmp = values[j];
            values[j] = values[j + 1];
            values[j + 1] = tmp;
            sortCells[j].cell.textContent = values[j];
            sortCells[j + 1].cell.textContent = values[j + 1];
            setCellState(sortCells[j], 'shift');
            setCellState(sortCells[j + 1], 'shift');
            sortPlayer.setStatus(`${values[j + 1]} > ${values[j]} → swapped.`, '');
          } else {
            sortPlayer.setStatus('Already in order — no swap needed.', '');
          }
        });
      }

      steps.push(async () => {
        clearPointers(sortCells);
        const lockedIndex = n - 1 - i;
        setCellState(sortCells[lockedIndex], 'found');
        sortPlayer.setStatus(
          `Pass ${i + 1} complete — ${values[lockedIndex]} is locked into its final position.`,
          ''
        );
      });
    }

    steps.push(async () => {
      sortCells.forEach((c) => setCellState(c, 'found'));
      clearPointers(sortCells);
      sortPlayer.setStatus(`Done — sorted array: [${values.join(', ')}]`, 'ok');
    });

    return steps;
  }

  const sortPlayer = wireStepControls(
    { playBtn: sortPlayBtn, stepBtn: sortStepBtn, resetBtn: sortResetBtn, statusEl: sortStatusEl },
    { build: buildSort, onReset() { clearEl(sortStage); }, delay: 420 }
  );
});
