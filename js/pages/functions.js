document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- Demo 1: call flow ---------------- */

  const flowEl = document.getElementById('call-flow');
  const codeEl = document.getElementById('call-code');
  const playBtn = document.getElementById('call-play-btn');
  const stepBtn = document.getElementById('call-step-btn');
  const resetBtn = document.getElementById('call-reset-btn');
  const statusEl = document.getElementById('call-status');

  const codeLines = [
    '<span class="kw">static</span> <span class="type">int</span> <span class="fn">Add</span>(<span class="type">int</span> a, <span class="type">int</span> b)',
    '{',
    '    <span class="kw">return</span> a + b;',
    '}',
    '',
    '<span class="type">int</span> result = <span class="fn">Add</span>(3, 4); <span class="cmt">// call site</span>',
  ];
  const highlight = codeBlock(codeEl, codeLines);

  const flowStepsDef = [
    { key: 'call', label: 'Add(3, 4)' },
    { key: 'params', label: 'a = 3, b = 4' },
    { key: 'body', label: 'return a + b;' },
    { key: 'return', label: 'returns 7' },
    { key: 'assign', label: 'result = 7' },
  ];
  let flowBoxes = {};

  function renderFlow() {
    clearEl(flowEl);
    flowBoxes = {};
    flowStepsDef.forEach((s, i) => {
      const box = el('div', 'flow-box', s.label);
      flowBoxes[s.key] = box;
      flowEl.appendChild(box);
      if (i < flowStepsDef.length - 1) flowEl.appendChild(el('span', 'flow-arrow', '→'));
    });
  }

  function setActive(key) {
    Object.entries(flowBoxes).forEach(([k, box]) => box.classList.toggle('active', k === key));
  }

  function build() {
    renderFlow();
    highlight();
    const steps = [
      async () => {
        highlight([5]);
        setActive('call');
        player.setStatus('The caller invokes Add(3, 4).', '');
      },
      async () => {
        highlight([0]);
        setActive('params');
        player.setStatus('3 and 4 are copied into parameters a and b.', '');
      },
      async () => {
        highlight([2]);
        setActive('body');
        player.setStatus('The method body runs: a + b = 7.', '');
      },
      async () => {
        highlight([2]);
        setActive('return');
        player.setStatus('7 is sent back to wherever Add() was called.', '');
      },
      async () => {
        highlight([5]);
        setActive('assign');
        player.setStatus('result now holds 7.', 'ok');
      },
    ];
    return steps;
  }

  const player = wireStepControls(
    { playBtn, stepBtn, resetBtn, statusEl },
    { build, onReset() { clearEl(flowEl); }, delay: 750 }
  );

  /* ---------------- Demo 2: call stack via recursion ---------------- */

  const stackWrap = document.getElementById('stack-wrap');
  const stackCodeEl = document.getElementById('stack-code');
  const stackPlayBtn = document.getElementById('stack-play-btn');
  const stackStepBtn = document.getElementById('stack-step-btn');
  const stackResetBtn = document.getElementById('stack-reset-btn');
  const stackStatusEl = document.getElementById('stack-status');

  const stackCodeLines = [
    '<span class="type">int</span> <span class="fn">Factorial</span>(<span class="type">int</span> n)',
    '{',
    '    <span class="kw">if</span> (n &lt;= 1)',
    '        <span class="kw">return</span> 1; <span class="cmt">// base case</span>',
    '',
    '    <span class="kw">return</span> n * <span class="fn">Factorial</span>(n - 1);',
    '}',
  ];
  const stackHighlight = codeBlock(stackCodeEl, stackCodeLines);

  const N = 4;

  function buildStack() {
    clearEl(stackWrap);
    stackHighlight();
    const frames = {};
    const steps = [];

    for (let n = N; n >= 1; n--) {
      steps.push(async () => {
        stackHighlight(n <= 1 ? [2, 3] : [0]);
        const frame = el('div', 'stack-frame');
        frame.innerHTML = `<span class="fname">Factorial(${n})</span>`;
        frames[n] = frame;
        stackWrap.appendChild(frame);
        stackPlayer.setStatus(`Calling Factorial(${n}) — a new frame is pushed.`, '');
      });
      if (n > 1) {
        steps.push(async () => {
          stackHighlight([5]);
          stackPlayer.setStatus(`Factorial(${n}) needs Factorial(${n - 1}) before it can finish.`, '');
        });
      }
    }

    for (let n = 1; n <= N; n++) {
      steps.push(async () => {
        let value;
        if (n === 1) {
          value = 1;
          stackHighlight([2, 3]);
        } else {
          value = n * factorial(n - 1);
          stackHighlight([5]);
        }
        frames[n].innerHTML = `<span class="fname">Factorial(${n})</span> <span class="ret">→ ${value}</span>`;
        stackPlayer.setStatus(`Factorial(${n}) returns ${value}.`, n === N ? 'ok' : '');
        if (n < N) {
          await sleep(500);
          frames[n].remove();
        }
      });
    }

    steps.push(async () => {
      stackPlayer.setStatus(`Done — Factorial(${N}) = ${factorial(N)}.`, 'ok');
    });

    return steps;
  }

  function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
  }

  const stackPlayer = wireStepControls(
    { playBtn: stackPlayBtn, stepBtn: stackStepBtn, resetBtn: stackResetBtn, statusEl: stackStatusEl },
    { build: buildStack, onReset() { clearEl(stackWrap); }, delay: 750 }
  );
});
