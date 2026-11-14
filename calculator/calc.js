(() => {
  const resultEl = document.getElementById('result');
  const historyEl = document.getElementById('history');
  let current = '0', prev = null, op = null, fresh = false;

  const fmt = (s) => {
    if (!isFinite(Number(s))) return 'Error';
    const [i, d] = String(s).split('.');
    const int = Number(i).toLocaleString('en-US');
    return (i === '-0' ? '-0' : int) + (d !== undefined ? '.' + d : '');
  };
  const render = () => {
    resultEl.textContent = fmt(current);
    historyEl.textContent = prev !== null && op ? `${fmt(prev)} ${op}` : '';
    document.querySelectorAll('.op').forEach(b => b.classList.toggle('active', fresh && b.dataset.op === op));
  };
  const compute = (a, b, o) => {
    a = Number(a); b = Number(b);
    const r = o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : b === 0 ? NaN : a / b;
    return String(parseFloat(r.toPrecision(12)));
  };
  const num = (n) => {
    if (current === 'Error' || fresh) { current = '0'; fresh = false; }
    if (current.replace('-', '').replace('.', '').length >= 12) return;
    current = current === '0' ? n : current + n;
  };
  const dot = () => {
    if (current === 'Error' || fresh) { current = '0'; fresh = false; }
    if (!current.includes('.')) current += '.';
  };
  const setOp = (o) => {
    if (current === 'Error') return;
    if (op && prev !== null && !fresh) { current = compute(prev, current, op); }
    prev = current; op = o; fresh = true;
  };
  const equals = () => {
    if (op === null || prev === null) return;
    const expr = `${fmt(prev)} ${op} ${fmt(current)} =`;
    current = compute(prev, current, op);
    historyEl.textContent = expr;
    prev = null; op = null; fresh = true;
    resultEl.textContent = fmt(current);
  };
  const act = {
    clear() { current = '0'; prev = null; op = null; fresh = false; },
    sign() { if (current !== 'Error' && current !== '0') current = current.startsWith('-') ? current.slice(1) : '-' + current; },
    percent() { if (current !== 'Error') current = String(parseFloat((Number(current) / 100).toPrecision(12))); },
    dot, equals
  };

  document.querySelector('.keys').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.num) num(b.dataset.num);
    else if (b.dataset.op) setOp(b.dataset.op);
    else act[b.dataset.action]();
    if (b.dataset.action === 'equals') return;
    render();
  });

  const keyMap = { '*': '×', '/': '÷', '-': '−', '+': '+' };
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/^\d$/.test(k)) num(k);
    else if (keyMap[k]) { e.preventDefault(); setOp(keyMap[k]); }
    else if (k === '.') dot();
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); return; }
    else if (k === 'Backspace') current = current.length > 1 && current !== 'Error' ? current.slice(0, -1) : '0';
    else if (k === 'Escape') act.clear();
    else if (k === '%') act.percent();
    else return;
    render();
  });
  render();
})();
