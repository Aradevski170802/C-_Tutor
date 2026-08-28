document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- Demo 1: linear search in a 1D array ---------------- */

  const stage = document.getElementById('search-stage');
  const codeEl = document.getElementById('search-code');
  const targetInput = document.getElementById('search-target');
  const playBtn = document.getElementById('search-play-btn');
  const stepBtn = document.getElementById('search-step-btn');
  const resetBtn = document.getElementById('search-reset-btn');
  const statusEl = document.getElementById('search-status');

  const values = [8, 15, 30, 42, 4, 23, 16];

  const codeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> i = 0; i &lt; numbers.Length; i++)',
    '{',
    '    <span class="kw">if</span> (numbers[i] == target)',
    '    {',
    '        <span class="kw">return</span> i; <span class="cmt">// found it</span>',
    '    }',
    '}',
    '<span class="kw">return</span> -1; <span class="cmt">// not found</span>',
  ];
  const highlight = codeBlock(codeEl, codeLines);

  let cells = [];

  function build() {
    const target = parseInt(targetInput.value, 10);
    cells = renderArray(stage, values);
    highlight();

    const steps = [];
    for (let i = 0; i < values.length; i++) {
      steps.push(async () => {
        highlight([0]);
        setPointer(cells[i], 'i');
        setCellState(cells[i], 'compare');
      });
      steps.push(async () => {
        highlight([2]);
        await sleep(250);
        if (values[i] === target) {
          highlight([4]);
          setCellState(cells[i], 'found');
          player.setStatus(`Found ${target} at index ${i}.`, 'ok');
        } else {
          setCellState(cells[i], '');
          setPointer(cells[i], '');
        }
      });
      if (values[i] === target) break;
    }
    if (!values.includes(target)) {
      steps.push(async () => {
        highlight([7]);
        player.setStatus(`${target} was not found in the array.`, 'bad');
      });
    }
    return steps;
  }

  const player = wireStepControls(
    { playBtn, stepBtn, resetBtn, statusEl },
    { build, onReset() { clearEl(stage); }, delay: 550 }
  );

  targetInput.addEventListener('change', () => player.restart());

  /* ---------------- Demo 2: search a 2D grid ---------------- */

  const gridStage = document.getElementById('search-grid-stage');
  const gridCodeEl = document.getElementById('grid-search-code');
  const gridTargetInput = document.getElementById('grid-search-target');
  const gridPlayBtn = document.getElementById('grid-search-play-btn');
  const gridStepBtn = document.getElementById('grid-search-step-btn');
  const gridResetBtn = document.getElementById('grid-search-reset-btn');
  const gridStatusEl = document.getElementById('grid-search-status');

  const grid = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
  ];

  const gridCodeLines = [
    '<span class="kw">for</span> (<span class="type">int</span> r = 0; r &lt; grid.GetLength(0); r++)',
    '{',
    '    <span class="kw">for</span> (<span class="type">int</span> c = 0; c &lt; grid.GetLength(1); c++)',
    '    {',
    '        <span class="kw">if</span> (grid[r, c] == target)',
    '            <span class="kw">return</span> (r, c); <span class="cmt">// found it</span>',
    '    }',
    '}',
  ];
  const gridHighlight = codeBlock(gridCodeEl, gridCodeLines);

  let gridCells = [];

  function renderGrid() {
    clearEl(gridStage);
    gridCells = grid.map((rowValues, r) => {
      const rowEl = el('div', 'grid-2d-row');
      const rowCells = rowValues.map((v, c) => {
        const wrap = makeCell(v, c, { showIndex: false, showPointer: false });
        rowEl.appendChild(wrap);
        return wrap;
      });
      gridStage.appendChild(rowEl);
      return rowCells;
    });
  }

  function buildGrid() {
    const target = parseInt(gridTargetInput.value, 10);
    renderGrid();
    gridHighlight();

    const steps = [];
    let found = false;
    outer: for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        steps.push(async () => {
          gridHighlight([0, 2]);
          setCellState(gridCells[r][c], 'compare');
        });
        steps.push(async () => {
          gridHighlight([4]);
          await sleep(220);
          if (grid[r][c] === target) {
            gridHighlight([5]);
            setCellState(gridCells[r][c], 'found');
            gridPlayer.setStatus(`Found ${target} at grid[${r}, ${c}].`, 'ok');
            found = true;
          } else {
            setCellState(gridCells[r][c], '');
          }
        });
        if (grid[r][c] === target) {
          found = true;
          break outer;
        }
      }
    }
    if (!found) {
      steps.push(async () => {
        gridPlayer.setStatus(`${target} was not found in the grid.`, 'bad');
      });
    }
    return steps;
  }

  const gridPlayer = wireStepControls(
    { playBtn: gridPlayBtn, stepBtn: gridStepBtn, resetBtn: gridResetBtn, statusEl: gridStatusEl },
    { build: buildGrid, onReset() { clearEl(gridStage); }, delay: 450 }
  );

  gridTargetInput.addEventListener('change', () => gridPlayer.restart());
});
