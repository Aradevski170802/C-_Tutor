// Shared helpers used by every lesson's visualization script.
// Keeps each lesson file focused on "what happens" rather than DOM plumbing.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function clearEl(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Renders a syntax-highlighted, line-numbered code block into `container`.
 * `lines` is an array of HTML strings (already containing <span class="kw">...</span> markup).
 * Returns a `highlight(lineIndexes)` function — pass a number, an array of numbers, or
 * nothing/-1 to clear all highlights.
 */
function codeBlock(container, lines) {
  clearEl(container);
  container.classList.add('code-block');
  const lineEls = lines.map((html, i) => {
    const lineEl = el('div', 'line');
    lineEl.dataset.line = String(i);
    lineEl.innerHTML = html || '&nbsp;';
    container.appendChild(lineEl);
    return lineEl;
  });

  return function highlight(indexes) {
    const set = new Set(
      indexes === undefined || indexes === -1
        ? []
        : Array.isArray(indexes)
        ? indexes
        : [indexes]
    );
    lineEls.forEach((lineEl, i) => {
      lineEl.classList.toggle('active', set.has(i));
    });
  };
}

/** Builds one array-cell (value box + index label + optional pointer row). */
function makeCell(value, index, { empty = false, showIndex = true, showPointer = true } = {}) {
  const wrap = el('div', 'array-cell-wrap');
  const pointer = el('div', 'pointer');
  const cell = el('div', 'array-cell' + (empty ? ' empty' : ''));
  cell.textContent = empty ? '' : String(value);
  const indexLabel = el('div', 'array-index', showIndex ? String(index) : '');
  if (showPointer) wrap.appendChild(pointer);
  wrap.appendChild(cell);
  if (showIndex) wrap.appendChild(indexLabel);
  wrap.cell = cell;
  wrap.pointer = pointer;
  return wrap;
}

/**
 * Renders a 1D array of values into `container` (a .array-row element).
 * Returns an array of { wrap, cell, pointer } handles indexed like the array.
 */
function renderArray(container, values, opts = {}) {
  clearEl(container);
  return values.map((v, i) => {
    const wrap = makeCell(v, i, opts);
    container.appendChild(wrap);
    return wrap;
  });
}

/** Sets a pointer label (e.g. "i") visible under a given cell handle. */
function setPointer(cellHandle, label) {
  cellHandle.pointer.textContent = label || '';
  cellHandle.pointer.classList.toggle('show', !!label);
}

function clearPointers(cellHandles) {
  cellHandles.forEach((h) => setPointer(h, ''));
}

function setCellState(cellHandle, state) {
  cellHandle.cell.className = 'array-cell' + (state ? ' ' + state : '');
}

function resetCellStates(cellHandles) {
  cellHandles.forEach((h) => setCellState(h, ''));
}

/**
 * A simple sequential step player. `steps` is an array of (async) functions.
 * Each call to next() runs one step. play() auto-advances with a delay between steps.
 */
function createStepPlayer(steps, { delay = 850, onStep, onDone, onPlayState } = {}) {
  let index = -1;
  let playing = false;
  let timer = null;

  async function step() {
    if (index + 1 >= steps.length) return false;
    index += 1;
    await steps[index]();
    if (onStep) onStep(index, steps.length);
    if (index >= steps.length - 1 && onDone) onDone();
    return true;
  }

  async function loop() {
    if (!playing) return;
    const advanced = await step();
    if (!advanced || index >= steps.length - 1) {
      playing = false;
      if (onPlayState) onPlayState(false);
      return;
    }
    timer = setTimeout(loop, delay);
  }

  return {
    step,
    play() {
      if (playing || index >= steps.length - 1) return;
      playing = true;
      if (onPlayState) onPlayState(true);
      loop();
    },
    pause() {
      playing = false;
      clearTimeout(timer);
      if (onPlayState) onPlayState(false);
    },
    isPlaying: () => playing,
    isDone: () => index >= steps.length - 1,
    get index() {
      return index;
    },
    setDelay(ms) {
      delay = ms;
    },
  };
}

/**
 * Wires a standard Play / Step / Reset control row to a lesson.
 * `build` is a function that returns a fresh `steps` array (called on init + reset).
 * `onReset` runs before rebuilding (clear DOM state).
 */
function wireStepControls({ playBtn, stepBtn, resetBtn, statusEl }, { build, onReset, delay }) {
  let player = null;

  function setStatus(text, cls) {
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.className = 'status-line' + (cls ? ' ' + cls : '');
  }

  function init() {
    if (onReset) onReset();
    const steps = build();
    player = createStepPlayer(steps, {
      delay,
      onPlayState(isPlaying) {
        playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
      },
      onDone() {
        stepBtn.disabled = true;
        playBtn.disabled = true;
      },
    });
    stepBtn.disabled = false;
    playBtn.disabled = false;
    playBtn.textContent = '▶ Play';
  }

  playBtn.addEventListener('click', () => {
    if (player.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
  });

  stepBtn.addEventListener('click', () => {
    player.step();
  });

  resetBtn.addEventListener('click', () => {
    player.pause();
    init();
  });

  init();
  return { setStatus, restart: init };
}
