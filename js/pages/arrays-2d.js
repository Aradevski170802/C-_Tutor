document.addEventListener('DOMContentLoaded', () => {
  function clamp(n, min, max) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  /* ---------------- Demo: declaring and filling a grid ---------------- */

  const fillStage = document.getElementById('fill-stage');
  const fillValueBox = document.getElementById('fill-value-box');
  const fillCodeEl = document.getElementById('fill-code');
  const fillPlayBtn = document.getElementById('fill-play-btn');
  const fillStepBtn = document.getElementById('fill-step-btn');
  const fillResetBtn = document.getElementById('fill-reset-btn');
  const fillStatusEl = document.getElementById('fill-status');

  const fillDims = { rows: 3, cols: 4 };

  const fillCodeLines = [
    '<span class="type">int</span>[,] grid = <span class="kw">new</span> <span class="type">int</span>[3, 4]; <span class="cmt">// every cell starts at 0</span>',
    '',
    '<span class="type">int</span> value = 1;',
    '<span class="kw">for</span> (<span class="type">int</span> r = 0; r &lt; 3; r++)',
    '{',
    '    <span class="kw">for</span> (<span class="type">int</span> c = 0; c &lt; 4; c++)',
    '    {',
    '        grid[r, c] = value;',
    '        value++;',
    '    }',
    '}',
  ];
  const fillHighlight = codeBlock(fillCodeEl, fillCodeLines);

  let fillCells = [];

  function renderFillGrid() {
    clearEl(fillStage);
    fillCells = [];
    for (let r = 0; r < fillDims.rows; r++) {
      const rowEl = el('div', 'grid-2d-row');
      const rowCells = [];
      for (let c = 0; c < fillDims.cols; c++) {
        const wrap = makeCell(0, c, { showIndex: false, showPointer: false });
        rowEl.appendChild(wrap);
        rowCells.push(wrap);
      }
      fillStage.appendChild(rowEl);
      fillCells.push(rowCells);
    }
  }

  function buildFill() {
    renderFillGrid();
    fillHighlight();
    fillValueBox.textContent = 'value = 1';
    fillValueBox.classList.remove('active');

    const steps = [];
    let value = 1;

    steps.push(async () => {
      fillHighlight([0]);
    });
    steps.push(async () => {
      fillHighlight([2]);
    });

    for (let r = 0; r < fillDims.rows; r++) {
      for (let c = 0; c < fillDims.cols; c++) {
        steps.push(async () => {
          fillHighlight([7, 8]);
          setCellState(fillCells[r][c], 'current');
          fillValueBox.classList.add('active');
          await sleep(160);
          fillCells[r][c].cell.textContent = value;
          setCellState(fillCells[r][c], 'found');
          fillPlayer.setStatus(`grid[${r}, ${c}] = ${value}`, '');
          value += 1;
          fillValueBox.textContent = `value = ${value}`;
        });
      }
    }

    steps.push(async () => {
      fillValueBox.classList.remove('active');
      fillPlayer.setStatus('Done — grid filled 1 to 12, row by row.', 'ok');
    });

    return steps;
  }

  const fillPlayer = wireStepControls(
    { playBtn: fillPlayBtn, stepBtn: fillStepBtn, resetBtn: fillResetBtn, statusEl: fillStatusEl },
    { build: buildFill, onReset() { clearEl(fillStage); }, delay: 260 }
  );

  /* ---------------- Demo 0: GetLength(0) and GetLength(1) ---------------- */

  const glStage = document.getElementById('getlength-stage');
  const glResultEl = document.getElementById('getlength-result');
  const glCodeEl = document.getElementById('getlength-code');
  const glPlayBtn = document.getElementById('getlength-play-btn');
  const glStepBtn = document.getElementById('getlength-step-btn');
  const glResetBtn = document.getElementById('getlength-reset-btn');
  const glStatusEl = document.getElementById('getlength-status');

  const glGrid = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
  ];

  const glCodeLines = [
    '<span class="type">int</span>[,] grid = <span class="kw">new</span> <span class="type">int</span>[3, 5] { <span class="cmt">/* ... */</span> };',
    '',
    '<span class="type">int</span> rows = grid.<span class="fn">GetLength</span>(0); <span class="cmt">// counts rows</span>',
    '<span class="type">int</span> cols = grid.<span class="fn">GetLength</span>(1); <span class="cmt">// counts columns</span>',
    '',
    'Console.WriteLine($<span class="str">"{rows} rows, {cols} columns"</span>);',
  ];
  const glHighlight = codeBlock(glCodeEl, glCodeLines);

  let glCells = [];

  function renderGlGrid() {
    clearEl(glStage);
    glCells = glGrid.map((rowValues, r) => {
      const rowEl = el('div', 'grid-2d-row');
      const rowCells = rowValues.map((v, c) => {
        const wrap = makeCell(v, c, { showIndex: false, showPointer: false });
        rowEl.appendChild(wrap);
        return wrap;
      });
      glStage.appendChild(rowEl);
      return rowCells;
    });
  }

  function renderGlResult() {
    clearEl(glResultEl);
    const rowsBox = el('div', 'flow-box', 'rows = ?');
    const colsBox = el('div', 'flow-box', 'cols = ?');
    glResultEl.appendChild(rowsBox);
    glResultEl.appendChild(el('span', 'flow-arrow', ' '));
    glResultEl.appendChild(colsBox);
    return { rowsBox, colsBox };
  }

  function buildGetLength() {
    renderGlGrid();
    glHighlight();
    const { rowsBox, colsBox } = renderGlResult();
    const steps = [];

    steps.push(async () => {
      glHighlight([0]);
    });

    for (let r = 0; r < glGrid.length; r++) {
      steps.push(async () => {
        glHighlight([2]);
        glCells.forEach((row) => row.forEach((c) => setCellState(c, '')));
        for (let rr = 0; rr <= r; rr++) glCells[rr].forEach((c) => setCellState(c, 'found'));
        glCells[r].forEach((c) => setCellState(c, 'compare'));
        rowsBox.textContent = `rows = ${r + 1}`;
        rowsBox.classList.add('active');
        glPlayer.setStatus(`Counting rows: row ${r} exists → ${r + 1} so far`, '');
        await sleep(280);
      });
    }

    steps.push(async () => {
      glCells.forEach((row) => row.forEach((c) => setCellState(c, 'found')));
      rowsBox.classList.remove('active');
      glPlayer.setStatus(`GetLength(0) = ${glGrid.length} rows`, 'ok');
    });

    steps.push(async () => {
      glHighlight([3]);
      glCells.forEach((row) => row.forEach((c) => setCellState(c, '')));
    });

    for (let c = 0; c < glGrid[0].length; c++) {
      steps.push(async () => {
        glCells[0].forEach((cell) => setCellState(cell, ''));
        for (let cc = 0; cc <= c; cc++) setCellState(glCells[0][cc], 'found');
        setCellState(glCells[0][c], 'compare');
        colsBox.textContent = `cols = ${c + 1}`;
        colsBox.classList.add('active');
        glPlayer.setStatus(`Counting columns in row 0: column ${c} exists → ${c + 1} so far`, '');
        await sleep(280);
      });
    }

    steps.push(async () => {
      colsBox.classList.remove('active');
      glPlayer.setStatus(`GetLength(1) = ${glGrid[0].length} columns`, 'ok');
    });

    steps.push(async () => {
      glHighlight([5]);
      glPlayer.setStatus(`Output: "${glGrid.length} rows, ${glGrid[0].length} columns"`, 'ok');
    });

    return steps;
  }

  const glPlayer = wireStepControls(
    { playBtn: glPlayBtn, stepBtn: glStepBtn, resetBtn: glResetBtn, statusEl: glStatusEl },
    { build: buildGetLength, onReset() { clearEl(glStage); clearEl(glResultEl); }, delay: 450 }
  );

  /* ---------------- Demo 1: grid[row, col] = value ---------------- */

  const gridStage = document.getElementById('grid-stage');
  const gridCodeEl = document.getElementById('grid-code');
  const rowInput = document.getElementById('grid-row');
  const colInput = document.getElementById('grid-col');
  const gridValueInput = document.getElementById('grid-value');
  const gridPlayBtn = document.getElementById('grid-play-btn');
  const gridStepBtn = document.getElementById('grid-step-btn');
  const gridResetBtn = document.getElementById('grid-reset-btn');
  const gridStatusEl = document.getElementById('grid-status');

  const baseGrid = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
  ];

  const gridCodeLines = [
    '<span class="type">int</span>[,] grid = <span class="kw">new</span> <span class="type">int</span>[3, 5]',
    '{',
    '    { 1, 2, 3, 4, 5 },',
    '    { 6, 7, 8, 9, 10 },',
    '    { 11, 12, 13, 14, 15 },',
    '};',
    '',
    '<span class="cmt">// row first, then column</span>',
    'grid[row, col] = value;',
  ];
  const gridHighlight = codeBlock(gridCodeEl, gridCodeLines);

  let gridCells = [];

  function renderGrid(values) {
    clearEl(gridStage);
    gridCells = values.map((rowValues, r) => {
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

  function buildGridSteps() {
    const targetRow = clamp(parseInt(rowInput.value, 10), 0, baseGrid.length - 1);
    rowInput.value = targetRow;
    const targetCol = clamp(parseInt(colInput.value, 10), 0, baseGrid[0].length - 1);
    colInput.value = targetCol;
    const value = clamp(parseInt(gridValueInput.value, 10) || 0, -999, 999);
    gridValueInput.value = value;

    const values = baseGrid.map((row) => [...row]);
    renderGrid(values);
    gridHighlight();

    const steps = [];

    steps.push(async () => {
      gridHighlight([0]);
    });

    steps.push(async () => {
      gridHighlight([8]);
      gridCells[targetRow].forEach((c) => setCellState(c, 'compare'));
      await sleep(300);
    });

    steps.push(async () => {
      gridCells.forEach((row) => row.forEach((c) => setCellState(c, '')));
      gridCells.forEach((row) => setCellState(row[targetCol], 'compare'));
      await sleep(300);
    });

    steps.push(async () => {
      gridCells.forEach((row) => row.forEach((c) => setCellState(c, '')));
      const target = gridCells[targetRow][targetCol];
      target.cell.textContent = value;
      setCellState(target, 'inserted');
      player1.setStatus(`grid[${targetRow}, ${targetCol}] = ${value}`, 'ok');
    });

    return steps;
  }

  const player1 = wireStepControls(
    { playBtn: gridPlayBtn, stepBtn: gridStepBtn, resetBtn: gridResetBtn, statusEl: gridStatusEl },
    { build: buildGridSteps, onReset() { clearEl(gridStage); }, delay: 650 }
  );

  [rowInput, colInput, gridValueInput].forEach((input) =>
    input.addEventListener('change', () => player1.restart())
  );

  /* ---------------- Demo: row totals with a nested loop ---------------- */

  const rowsumStage = document.getElementById('rowsum-stage');
  const rowsumSumBox = document.getElementById('rowsum-sum-box');
  const rowsumTotalsStage = document.getElementById('rowsum-totals-stage');
  const rowsumCodeEl = document.getElementById('rowsum-code');
  const rowsumPlayBtn = document.getElementById('rowsum-play-btn');
  const rowsumStepBtn = document.getElementById('rowsum-step-btn');
  const rowsumResetBtn = document.getElementById('rowsum-reset-btn');
  const rowsumStatusEl = document.getElementById('rowsum-status');

  const rowsumGrid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];

  const rowsumCodeLines = [
    '<span class="type">int</span>[] rowTotals = <span class="kw">new</span> <span class="type">int</span>[grid.GetLength(0)];',
    '',
    '<span class="kw">for</span> (<span class="type">int</span> r = 0; r &lt; grid.GetLength(0); r++)',
    '{',
    '    <span class="type">int</span> sum = 0;',
    '    <span class="kw">for</span> (<span class="type">int</span> c = 0; c &lt; grid.GetLength(1); c++)',
    '    {',
    '        sum += grid[r, c];',
    '    }',
    '    rowTotals[r] = sum;',
    '}',
  ];
  const rowsumHighlight = codeBlock(rowsumCodeEl, rowsumCodeLines);

  let rowsumCells = [];
  let rowsumTotalCells = [];

  function renderRowsumGrid() {
    clearEl(rowsumStage);
    rowsumCells = rowsumGrid.map((rowValues, r) => {
      const rowEl = el('div', 'grid-2d-row');
      const rowCells = rowValues.map((v, c) => {
        const wrap = makeCell(v, c, { showIndex: false, showPointer: false });
        rowEl.appendChild(wrap);
        return wrap;
      });
      rowsumStage.appendChild(rowEl);
      return rowCells;
    });
  }

  function buildRowsum() {
    renderRowsumGrid();
    rowsumHighlight();
    rowsumTotalCells = renderArray(rowsumTotalsStage, new Array(rowsumGrid.length).fill(''), { showIndex: true });
    rowsumTotalCells.forEach((c) => c.cell.classList.add('empty'));
    rowsumSumBox.textContent = 'sum = 0';
    rowsumSumBox.classList.remove('active');

    const steps = [];

    steps.push(async () => {
      rowsumHighlight([0]);
    });

    for (let r = 0; r < rowsumGrid.length; r++) {
      let sum = 0;
      steps.push(async () => {
        rowsumHighlight([4]);
        rowsumCells.forEach((row) => row.forEach((c) => setCellState(c, '')));
        sum = 0;
        rowsumSumBox.textContent = 'sum = 0';
        rowsumSumBox.classList.remove('active');
        rowsumPlayer.setStatus(`Starting row ${r}: sum reset to 0.`, '');
      });

      for (let c = 0; c < rowsumGrid[r].length; c++) {
        steps.push(async () => {
          rowsumHighlight([7]);
          setCellState(rowsumCells[r][c], 'compare');
          sum += rowsumGrid[r][c];
          rowsumSumBox.textContent = `sum = ${sum}`;
          rowsumSumBox.classList.add('active');
          rowsumPlayer.setStatus(`sum += grid[${r}, ${c}] = ${rowsumGrid[r][c]} → sum = ${sum}`, '');
        });
      }

      steps.push(async () => {
        rowsumHighlight([9]);
        rowsumCells[r].forEach((c) => setCellState(c, 'found'));
        rowsumSumBox.classList.remove('active');
        rowsumTotalCells[r].cell.textContent = sum;
        rowsumTotalCells[r].cell.classList.remove('empty');
        setCellState(rowsumTotalCells[r], 'inserted');
        rowsumPlayer.setStatus(`rowTotals[${r}] = ${sum}`, '');
      });
    }

    steps.push(async () => {
      const totals = rowsumGrid.map((row) => row.reduce((a, b) => a + b, 0));
      rowsumPlayer.setStatus(`Done — rowTotals = [${totals.join(', ')}]`, 'ok');
    });

    return steps;
  }

  const rowsumPlayer = wireStepControls(
    { playBtn: rowsumPlayBtn, stepBtn: rowsumStepBtn, resetBtn: rowsumResetBtn, statusEl: rowsumStatusEl },
    { build: buildRowsum, onReset() { clearEl(rowsumStage); clearEl(rowsumTotalsStage); }, delay: 420 }
  );

  /* ---------------- Demo 2: shift values within one row (in place) ---------------- */

  const rowStage = document.getElementById('row-stage');
  const rowCodeEl = document.getElementById('row-code');
  const rowIndexInput = document.getElementById('row-index');
  const rowValueInput = document.getElementById('row-value');
  const rowPlayBtn = document.getElementById('row-play-btn');
  const rowStepBtn = document.getElementById('row-step-btn');
  const rowResetBtn = document.getElementById('row-reset-btn');
  const rowStatusEl = document.getElementById('row-status');

  const baseRow = [6, 7, 8, 9, 10];

  const rowCodeLines = [
    '<span class="cmt">// row 1, pulled out on its own — still just an int[]</span>',
    '<span class="type">int</span>[] row = { 6, 7, 8, 9, 10 };',
    '',
    '<span class="kw">for</span> (<span class="type">int</span> i = row.Length - 1; i &gt; col; i--)',
    '    row[i] = row[i - 1];',
    '',
    'row[col] = value;',
    '<span class="cmt">// the old last value has been overwritten — the row can\'t grow</span>',
  ];
  const rowHighlight = codeBlock(rowCodeEl, rowCodeLines);

  let rowCells = [];

  function buildRowSteps() {
    const index = clamp(parseInt(rowIndexInput.value, 10), 0, baseRow.length - 1);
    rowIndexInput.value = index;
    const value = clamp(parseInt(rowValueInput.value, 10) || 0, -999, 999);
    rowValueInput.value = value;

    const values = [...baseRow];
    rowCells = renderArray(rowStage, values);
    rowHighlight();

    const steps = [];

    steps.push(async () => {
      rowHighlight([1]);
    });

    for (let i = values.length - 1; i > index; i--) {
      const from = i - 1;
      const to = i;
      steps.push(async () => {
        rowHighlight([3, 4]);
        setPointer(rowCells[from], 'i-1');
        setPointer(rowCells[to], 'i');
        setCellState(rowCells[from], 'compare');
        setCellState(rowCells[to], 'compare');
        await sleep(350);
        values[to] = values[from];
        rowCells[to].cell.textContent = values[to];
        setCellState(rowCells[to], 'shift');
      });
    }

    steps.push(async () => {
      rowHighlight([6, 7]);
      clearPointers(rowCells);
      resetCellStates(rowCells);
      values[index] = value;
      rowCells[index].cell.textContent = value;
      setCellState(rowCells[index], 'inserted');
      player2.setStatus(`row[${index}] = ${value} — row is now [${values.join(', ')}], last value lost`, 'ok');
    });

    return steps;
  }

  const player2 = wireStepControls(
    { playBtn: rowPlayBtn, stepBtn: rowStepBtn, resetBtn: rowResetBtn, statusEl: rowStatusEl },
    { build: buildRowSteps, onReset() { clearEl(rowStage); }, delay: 550 }
  );

  [rowIndexInput, rowValueInput].forEach((input) =>
    input.addEventListener('change', () => player2.restart())
  );

  /* ---------------- Demo: jagged arrays ---------------- */

  const jaggedStage = document.getElementById('jagged-stage');
  const jaggedCodeEl = document.getElementById('jagged-code');
  const jaggedPlayBtn = document.getElementById('jagged-play-btn');
  const jaggedStepBtn = document.getElementById('jagged-step-btn');
  const jaggedResetBtn = document.getElementById('jagged-reset-btn');
  const jaggedStatusEl = document.getElementById('jagged-status');
  const jaggedRowCheckInput = document.getElementById('jagged-row-check');
  const jaggedLengthStatusEl = document.getElementById('jagged-length-status');

  const triangleRows = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];

  const jaggedCodeLines = [
    '<span class="type">int</span>[][] triangle = <span class="kw">new</span> <span class="type">int</span>[4][];',
    'triangle[0] = <span class="kw">new</span> <span class="type">int</span>[] { 1 };',
    'triangle[1] = <span class="kw">new</span> <span class="type">int</span>[] { 1, 1 };',
    'triangle[2] = <span class="kw">new</span> <span class="type">int</span>[] { 1, 2, 1 };',
    'triangle[3] = <span class="kw">new</span> <span class="type">int</span>[] { 1, 3, 3, 1 };',
  ];
  const jaggedHighlight = codeBlock(jaggedCodeEl, jaggedCodeLines);

  function buildJagged() {
    clearEl(jaggedStage);
    jaggedHighlight();

    const steps = [];
    steps.push(async () => {
      jaggedHighlight([0]);
    });

    triangleRows.forEach((rowValues, r) => {
      steps.push(async () => {
        jaggedHighlight([r + 1]);
        const rowEl = el('div', 'grid-2d-row');
        rowValues.forEach((v, c) => {
          const wrap = makeCell(v, c, { showIndex: false, showPointer: false });
          wrap.cell.classList.add('inserted');
          rowEl.appendChild(wrap);
        });
        jaggedStage.appendChild(rowEl);
        jaggedPlayer.setStatus(`triangle[${r}] has ${rowValues.length} value(s).`, '');
      });
    });

    steps.push(async () => {
      jaggedPlayer.setStatus('Done — 4 rows, each its own independently-sized array.', 'ok');
    });

    return steps;
  }

  const jaggedPlayer = wireStepControls(
    { playBtn: jaggedPlayBtn, stepBtn: jaggedStepBtn, resetBtn: jaggedResetBtn, statusEl: jaggedStatusEl },
    { build: buildJagged, onReset() { clearEl(jaggedStage); }, delay: 500 }
  );

  function updateJaggedLengthCheck() {
    const row = clamp(parseInt(jaggedRowCheckInput.value, 10), 0, triangleRows.length - 1);
    jaggedRowCheckInput.value = row;
    jaggedLengthStatusEl.textContent = `triangle[${row}].Length = ${triangleRows[row].length}`;
    jaggedLengthStatusEl.className = 'status-line ok';
  }

  jaggedRowCheckInput.addEventListener('input', updateJaggedLengthCheck);
  updateJaggedLengthCheck();
});
