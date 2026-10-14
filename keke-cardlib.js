// 克克卡库 · 酒馆扩展
// 在酒馆里全屏打开完整的克克卡库（kekekaku.html 与插件放在同一文件夹，数据存在本机浏览器）
(function () {
  const me = [...document.querySelectorAll('script[src]')].find(s => s.src.includes('keke-cardlib.js'));
  const BASE = me ? me.src.replace(/[^/]*$/, '') : '/scripts/extensions/third-party/keke-cardlib/';
  const PAGE = BASE + 'kekekaku.html';

  const css = document.createElement('style');
  css.textContent = `
  #kkc-btn{position:fixed;right:14px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:2147483000;width:46px;height:46px;border-radius:50%;border:1px solid #2a2018;background:#2a2018;color:#fdfbf6;font-size:20px;line-height:1;padding:0;box-shadow:0 2px 10px rgba(0,0,0,.3);cursor:pointer}
  #kkc-ov{padding:0;border:0;margin:0;position:fixed;left:0;top:0;width:100%;height:100%;max-width:none;max-height:none;background:#fdfbf6;color:#2a2018;overflow:hidden}
  #kkc-ov[open]{display:flex;flex-direction:column}
  #kkc-ov::backdrop{background:#fdfbf6}
  #kkc-ov .kkc-bar{display:flex;align-items:center;justify-content:space-between;padding:calc(8px + env(safe-area-inset-top,0px)) 12px 8px;background:#2a2018;color:#fdfbf6;font-size:15px}
  #kkc-ov .kkc-x{border:1px solid #fdfbf6;background:transparent;color:#fdfbf6;border-radius:8px;padding:6px 12px;font-size:14px;cursor:pointer}
  #kkc-ov iframe{flex:1;width:100%;border:0;background:#fdfbf6}`;
  document.head.appendChild(css);

  let ov = null;
  function ensure() {
    if (ov) return;
    ov = document.createElement('dialog');
    ov.id = 'kkc-ov';
    ov.innerHTML = '<div class="kkc-bar"><b>克克卡库</b><button type="button" class="kkc-x">✕ 关闭</button></div>';
    const f = document.createElement('iframe');
    f.setAttribute('allow', 'clipboard-read; clipboard-write; web-share');
    f.src = PAGE;
    ov.appendChild(f);
    document.body.appendChild(ov);
    ov.querySelector('.kkc-x').onclick = close;
    ov.addEventListener('cancel', e => { e.preventDefault(); close(); });
  }
  function fit() { if (ov && ov.getBoundingClientRect().height < window.innerHeight - 4) { ov.style.height = window.innerHeight + 'px'; } }
  function open() {
    ensure();
    if (!ov.open) { if (typeof ov.showModal === 'function') ov.showModal(); else ov.setAttribute('open', ''); }
    fit();
    try { const w = ov.querySelector('iframe').contentWindow; if (w && typeof w.ksPoll === 'function') w.ksPoll(); } catch (e) {}
  }
  function close() { if (ov && ov.open) { if (typeof ov.close === 'function') ov.close(); else ov.removeAttribute('open'); } }
  window.addEventListener('resize', fit);

  const btn = document.createElement('button');
  btn.id = 'kkc-btn'; btn.type = 'button'; btn.textContent = '📚'; btn.title = '克克卡库';
  btn.onclick = open;
  document.documentElement.appendChild(btn);

  let tries = 0;
  const t = setInterval(() => {
    const m = document.getElementById('extensionsMenu');
    if (m && !document.getElementById('kkc-menu')) {
      const d = document.createElement('div');
      d.id = 'kkc-menu';
      d.className = 'list-group-item flex-container flexGap5';
      d.innerHTML = '<div class="fa-solid fa-book extensionsMenuExtensionButton"></div>克克卡库';
      d.onclick = open;
      m.appendChild(d);
      clearInterval(t);
    } else if (++tries > 40) clearInterval(t);
  }, 1000);

  try { window.toastr && window.toastr.success('克克卡库已加载：点右下角 📚，或魔法棒菜单里的“克克卡库”', '', { timeOut: 4000 }); } catch (e) {}
})();
