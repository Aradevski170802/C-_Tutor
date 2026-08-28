document.addEventListener('DOMContentLoaded', () => {
  function renderChars(container, text, opts = {}) {
    clearEl(container);
    return text.split('').map((ch, i) => {
      const wrap = el('div', 'array-cell-wrap');
      const pointer = el('div', 'pointer');
      const cell = el('div', 'char-cell');
      cell.textContent = ch === ' ' ? '␣' : ch;
      const indexLabel = el('div', 'array-index', opts.showIndex === false ? '' : String(i));
      wrap.appendChild(pointer);
      wrap.appendChild(cell);
      wrap.appendChild(indexLabel);
      wrap.cell = cell;
      wrap.pointer = pointer;
      container.appendChild(wrap);
      return wrap;
    });
  }

  /* ---------------- Demo 1: indexing + foreach ---------------- */

  const stage = document.getElementById('string-stage');
  const codeEl = document.getElementById('string-code');
  const playBtn = document.getElementById('string-play-btn');
  const stepBtn = document.getElementById('string-step-btn');
  const resetBtn = document.getElementById('string-reset-btn');
  const statusEl = document.getElementById('string-status');

  const text = 'Hello!';

  const codeLines = [
    '<span class="type">string</span> word = <span class="str">"Hello!"</span>;',
    '',
    '<span class="cmt">// index access</span>',
    'Console.WriteLine(word[1]); <span class="cmt">// "e"</span>',
    '',
    '<span class="cmt">// visit every character in order</span>',
    '<span class="kw">foreach</span> (<span class="type">char</span> c <span class="kw">in</span> word)',
    '{',
    '    Console.WriteLine(c);',
    '}',
  ];
  const highlight = codeBlock(codeEl, codeLines);

  let cells = [];

  function build() {
    cells = renderChars(stage, text);
    highlight();

    const steps = [];
    steps.push(async () => {
      highlight([0]);
    });
    steps.push(async () => {
      highlight([3]);
      setPointer(cells[1], 'word[1]');
      setCellState(cells[1], 'current');
      player.setStatus(`word[1] is '${text[1]}'`, 'ok');
    });
    steps.push(async () => {
      resetCellStates(cells);
      clearPointers(cells);
      highlight([6]);
    });
    for (let i = 0; i < text.length; i++) {
      steps.push(async () => {
        highlight([8]);
        resetCellStates(cells);
        clearPointers(cells);
        setPointer(cells[i], 'c');
        setCellState(cells[i], 'current');
        player.setStatus(`c = '${text[i]}'`, '');
      });
    }
    steps.push(async () => {
      resetCellStates(cells);
      clearPointers(cells);
      player.setStatus('Loop finished — every character visited once.', 'ok');
    });
    return steps;
  }

  function setCellState(handle, state) {
    handle.cell.className = 'char-cell' + (state ? ' ' + state : '');
  }
  function resetCellStates(handles) {
    handles.forEach((h) => setCellState(h, ''));
  }

  const player = wireStepControls(
    { playBtn, stepBtn, resetBtn, statusEl },
    { build, onReset() { clearEl(stage); }, delay: 500 }
  );

  /* ---------------- Demo 2: immutability ---------------- */

  const immStage = document.getElementById('immutable-stage');
  const immCodeEl = document.getElementById('immutable-code');
  const immPlayBtn = document.getElementById('immutable-play-btn');
  const immStepBtn = document.getElementById('immutable-step-btn');
  const immResetBtn = document.getElementById('immutable-reset-btn');
  const immStatusEl = document.getElementById('immutable-status');

  const immCodeLines = [
    '<span class="type">string</span> greeting = <span class="str">"Hello"</span>;',
    '<span class="type">string</span> result = greeting + <span class="str">" World"</span>;',
    '',
    '<span class="cmt">// greeting is untouched — result points at a NEW string</span>',
    'Console.WriteLine(greeting); <span class="cmt">// "Hello"</span>',
    'Console.WriteLine(result);   <span class="cmt">// "Hello World"</span>',
  ];
  const immHighlight = codeBlock(immCodeEl, immCodeLines);

  function makeVarRow(name) {
    const row = el('div', '', '');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '12px';
    const label = el('div', '', name);
    label.style.fontFamily = 'var(--font-mono)';
    label.style.fontWeight = '700';
    label.style.color = 'var(--text-muted)';
    label.style.width = '70px';
    label.style.textAlign = 'right';
    const arrow = el('span', 'flow-arrow', '→');
    const box = el('div', 'flow-box', '');
    row.appendChild(label);
    row.appendChild(arrow);
    row.appendChild(box);
    return { row, box };
  }

  function buildImmutable() {
    clearEl(immStage);
    immHighlight();
    const greetingRow = makeVarRow('greeting');
    immStage.appendChild(greetingRow.row);

    const steps = [];
    steps.push(async () => {
      immHighlight([0]);
      greetingRow.box.textContent = '"Hello"';
      greetingRow.box.classList.add('active');
    });
    steps.push(async () => {
      immHighlight([1]);
      greetingRow.box.classList.remove('active');
    });
    steps.push(async () => {
      const resultRow = makeVarRow('result');
      immStage.appendChild(resultRow.row);
      resultRow.box.textContent = '"Hello World"';
      resultRow.box.style.borderColor = 'var(--accent)';
      resultRow.box.style.animation = 'pop-in 0.4s ease';
      immPlayer.setStatus('A brand new string was created for "result".', '');
    });
    steps.push(async () => {
      immHighlight([3, 4, 5]);
      immPlayer.setStatus('greeting is still "Hello" — completely unchanged.', 'ok');
    });
    return steps;
  }

  const immPlayer = wireStepControls(
    { playBtn: immPlayBtn, stepBtn: immStepBtn, resetBtn: immResetBtn, statusEl: immStatusEl },
    { build: buildImmutable, onReset() { clearEl(immStage); }, delay: 700 }
  );

  /* ---------------- Demo 3: method playground ---------------- */

  const beforeEl = document.getElementById('method-before');
  const afterEl = document.getElementById('method-after');
  const methodSelect = document.getElementById('method-select');
  const methodRunBtn = document.getElementById('method-run-btn');
  const methodCodeEl = document.getElementById('method-code');
  const methodStatusEl = document.getElementById('method-status');

  const sample = 'Hello World';

  const methodCode = {
    upper: 'result = text.ToUpper();',
    lower: 'result = text.ToLower();',
    substr: 'result = text.Substring(0, 5);',
    replace: 'result = text.Replace("World", "C#");',
    trim: 'result = "  Hello World  ".Trim();',
    split: 'string[] words = text.Split(\' \');',
    indexof: 'int index = text.IndexOf("World");',
    startswith: 'bool starts = text.StartsWith("Hello");',
    contains: 'bool has = text.Contains("lo W");',
    length: 'int len = text.Length;',
  };

  function applyMethod(key) {
    switch (key) {
      case 'upper':
        return sample.toUpperCase();
      case 'lower':
        return sample.toLowerCase();
      case 'substr':
        return sample.substring(0, 5);
      case 'replace':
        return sample.replace('World', 'C#');
      case 'trim':
        return sample.trim();
      case 'split':
        return sample.split(' ');
      case 'indexof':
        return sample.indexOf('World');
      case 'startswith':
        return sample.startsWith('Hello');
      case 'contains':
        return sample.includes('lo W');
      case 'length':
        return sample.length;
      default:
        return sample;
    }
  }

  function runMethod() {
    renderChars(beforeEl, sample, { showIndex: false });
    const result = applyMethod(methodSelect.value);
    codeBlock(methodCodeEl, [
      '<span class="type">string</span> text = <span class="str">"Hello World"</span>;',
      methodCode[methodSelect.value].replace(
        /\.([A-Za-z]+)(\(|;)/,
        '.<span class="fn">$1</span>$2'
      ),
    ]);
    clearEl(afterEl);
    if (Array.isArray(result)) {
      afterEl.className = 'array-row';
      const cells = renderArray(afterEl, result, { showIndex: false, showPointer: false });
      cells.forEach((c) => c.cell.classList.add('inserted'));
      methodStatusEl.textContent = `text is unchanged — words = [${result.map((w) => '"' + w + '"').join(', ')}]`;
    } else if (typeof result === 'string') {
      afterEl.className = 'string-row';
      const cells = renderChars(afterEl, result || ' ', { showIndex: false });
      cells.forEach((c) => c.cell.classList.add('inserted'));
      methodStatusEl.textContent = `text is still "${sample}" — result is a new string: "${result}"`;
    } else {
      afterEl.className = 'flow-diagram';
      const box = el('div', 'flow-box active', String(result));
      afterEl.appendChild(box);
      methodStatusEl.textContent = `text is unchanged — result = ${result}`;
    }
    methodStatusEl.className = 'status-line ok';
  }

  methodRunBtn.addEventListener('click', runMethod);
  methodSelect.addEventListener('change', runMethod);
  runMethod();
});
