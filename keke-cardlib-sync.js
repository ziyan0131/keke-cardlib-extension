'use strict';
/**
 * 克克卡库共享存储（SillyTavern Server Plugin）
 * 仅供本机/可信局域网中的已登录 SillyTavern 会话使用。
 * 共享文件位于 data/default-user/keke-cardlib-shared.json。
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const MAX_CARDS = 50000;
const MAX_BYTES = 100 * 1024 * 1024;
const DATA_FILE = path.join(process.cwd(), 'data', 'default-user', 'keke-cardlib-shared.json');
let writeQueue = Promise.resolve();

async function readState() {
    try {
        const stat = await fs.stat(DATA_FILE);
        if (stat.size > MAX_BYTES) throw new Error('共享卡库文件超过 100 MB 安全上限');
        const parsed = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
        return { schema: 1, updatedAt: parsed.updatedAt || 0, cards: Array.isArray(parsed.cards) ? parsed.cards : [], sections: Array.isArray(parsed.sections) ? parsed.sections : [] };
    } catch (error) {
        if (error.code === 'ENOENT') return { schema: 1, updatedAt: 0, cards: [], sections: [] };
        throw error;
    }
}
async function writeState(state) {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    const temp = DATA_FILE + '.tmp';
    const content = JSON.stringify({ schema: 1, updatedAt: Date.now(), cards: state.cards, sections: state.sections }, null, 0);
    if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) throw new Error('共享卡库超过 100 MB 安全上限');
    await fs.writeFile(temp, content, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temp, DATA_FILE);
}
async function init(router) {
    router.get('/library', async (_req, res) => {
        try { res.json(await readState()); }
        catch (error) { console.error('[keke-cardlib-sync] read failed', error); res.status(500).json({ error: '读取共享卡库失败' }); }
    });
    router.post('/library', async (req, res) => {
        try {
            const body = req.body;
            if (!body || !Array.isArray(body.cards) || body.cards.length > MAX_CARDS) return res.status(400).json({ error: '请求数据格式错误或卡片数量超限' });
            if (!body.cards.every(card => card && typeof card.id === 'string')) return res.status(400).json({ error: '卡片记录缺少有效 ID' });
            const next = { cards: body.cards, sections: Array.isArray(body.sections) ? body.sections.filter(x => typeof x === 'string').slice(0, 500) : [] };
            writeQueue = writeQueue.then(() => writeState(next));
            await writeQueue;
            res.json({ ok: true, cardCount: next.cards.length, updatedAt: Date.now() });
        } catch (error) { console.error('[keke-cardlib-sync] write failed', error); res.status(500).json({ error: '写入共享卡库失败：请检查请求体大小限制与磁盘空间' }); }
    });
    console.log('[keke-cardlib-sync] Shared library endpoint ready');
}
module.exports = { init, info: { id: 'keke-cardlib-sync', name: 'Keke Card Library Sync', description: 'Shared card-library storage for trusted SillyTavern clients' } };
