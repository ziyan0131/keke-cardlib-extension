克克卡库 1.5.0 · 原卡库服务器共享存储实验版

这版按“原来的卡库直接多端共用”改造，不增加单独仓库 UI。电脑和手机访问同一台 SillyTavern 时，原卡库的 IndexedDB 数据会在启动时与服务器快照合并，后续数据库事务会自动镜像到服务器。

安装前务必备份原扩展和浏览器数据。
1. 将本项目根目录作为原有克克卡库扩展安装/替换（manifest.json、keke-cardlib.js、kekekaku.html）。
2. 将 plugins/keke-cardlib-shared 整个文件夹复制到 D:\jiuguan\SillyTavern\plugins\keke-cardlib-shared\，确认里面有 index.js。
3. config.yaml 中启用 server plugins（enableServerPlugins: true，按当前 ST 版本配置为准），重启 SillyTavern。
4. 首次先在已有本地卡库数据的设备打开卡库，等待启动；随后在另一设备刷新原卡库检查是否出现卡片。

数据文件：data/default-user/keke-cardlib-shared-state.json。原浏览器 IndexedDB 不会删除。初次连接会将本地独有记录合并到服务器，ID 冲突时以更新时间较新的记录优先（没有更新时间时优先服务器记录）。

重要限制：这是实验版，尚未在用户 Windows / SillyTavern 1.19.0 环境做端到端测试；所有数据表以 JSON 快照镜像，卡库较大时可能遇到 Express 请求体大小限制或 80 MiB 存储上限。并发多设备同时编辑存在最后写入覆盖风险，先用测试卡验证。服务器端 API 依赖 SillyTavern 登录/部署环境的访问控制；不要将无认证酒馆管理接口暴露到公网。失败时本机数据仍保留，但不会多端互通。


1.5.1 CSRF 修复：前端写入共享接口前会从同一 SillyTavern 会话读取 /csrf-token，并通过 X-CSRF-Token 请求头提交；遇到 403 时会刷新 token 并重试一次。不需要关闭 CSRF 安全保护。此包仍需在用户环境中端到端测试。
