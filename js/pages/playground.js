document.addEventListener('DOMContentLoaded', () => {
  // Change this to whichever address should receive student submissions.
  const TEACHER_EMAIL = 'frogo5183@gmail.com';

  const STARTER_TEMPLATE = `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, C#!");
    }
}
`;

  const editor = document.getElementById('code-editor');
  const resetBtn = document.getElementById('reset-template-btn');
  const copyTestBtn = document.getElementById('copy-test-btn');
  const copyStatusEl = document.getElementById('copy-status');
  const nameInput = document.getElementById('student-name');
  const exerciseInput = document.getElementById('exercise-name');
  const submitBtn = document.getElementById('submit-btn');
  const submitStatusEl = document.getElementById('submit-status');

  function setStatus(el, text, cls) {
    el.textContent = text || '';
    el.className = 'status-line' + (cls ? ' ' + cls : '');
  }

  function loadTemplate() {
    editor.value = STARTER_TEMPLATE;
  }

  const saved = localStorage.getItem('playground-code');
  editor.value = saved || STARTER_TEMPLATE;

  editor.addEventListener('input', () => {
    try {
      localStorage.setItem('playground-code', editor.value);
    } catch (e) {
      // storage unavailable (private browsing, quota, etc.) — not critical here
    }
  });

  resetBtn.addEventListener('click', () => {
    loadTemplate();
    try {
      localStorage.removeItem('playground-code');
    } catch (e) {}
    setStatus(copyStatusEl, '', '');
  });

  copyTestBtn.addEventListener('click', async () => {
    const code = editor.value;
    try {
      await navigator.clipboard.writeText(code);
      setStatus(copyStatusEl, 'Copied! Opening dotnetfiddle.net — press Ctrl+V (or Cmd+V) there.', 'ok');
    } catch (err) {
      setStatus(
        copyStatusEl,
        "Couldn't copy automatically — select all the code above and copy it manually (Ctrl+C), then paste it on the site that just opened.",
        'bad'
      );
    }
    window.open('https://dotnetfiddle.net/', '_blank', 'noopener');
  });

  submitBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const exercise = exerciseInput.value.trim();
    const code = editor.value.trim();

    if (!name) {
      setStatus(submitStatusEl, 'Type your name first, so your teacher knows who this is from.', 'bad');
      nameInput.focus();
      return;
    }
    if (!code) {
      setStatus(submitStatusEl, 'The code box is empty — write something first!', 'bad');
      return;
    }

    const subject = `C# submission — ${exercise || 'exercise'} — ${name}`;
    const body =
      `Student: ${name}\n` +
      `Exercise: ${exercise || '(not specified)'}\n\n` +
      `--- Code ---\n\n${code}`;

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(TEACHER_EMAIL)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, '_blank', 'noopener');
    setStatus(
      submitStatusEl,
      'Opening Gmail with everything filled in — sign in if it asks, then just hit send.',
      'ok'
    );
  });
});
