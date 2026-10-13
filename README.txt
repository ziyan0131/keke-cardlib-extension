克克卡库 · SillyTavern 桌面互通开发版

文件：manifest.json、keke-cardlib.js、kekekaku.html（必须放在同一仓库根目录）

安装：SillyTavern → 扩展 → 安装扩展 → 粘贴 GitHub 仓库地址。仓库必须直接包含 manifest.json。

桌面浏览器互通：设置 → Local Tavern。默认使用当前酒馆地址；点击“测试连接”后，可拉取/推送角色卡，以及导入/推送全局世界书。

注意：此开发版的角色卡与全局世界书网络同步基于当前 SillyTavern API。推送世界书会更新酒馆中同名文件，请先备份。卡库内置主题/美化风格是卡库自身 UI 样式，不会自动修改酒馆全局 CSS；酒馆主题、用户 CSS、第三方扩展配置仍需单独适配。

状态：代码已做静态检查，尚未在你的本地酒馆实例中完成端到端验证。请先在测试角色/世界书上验证，勿直接覆盖重要数据。

【手机/电脑共享卡库（新增实验功能）】
1. 在电脑的 SillyTavern 根目录创建 plugins/keke-cardlib-sync/ 文件夹。
2. 将本仓库 server-plugin/keke-cardlib-sync.js 复制到该文件夹并重命名为 index.js。
3. 在 SillyTavern 的 config.yaml 中确认 enableServerPlugins: true，然后重启酒馆。
4. 首次请在电脑浏览器打开克克卡库，点击“上传并合并到共享卡库”；之后在手机卡库点击“合并共享卡库到本机”。两端可重复合并。
5. 共享文件默认保存在 data/default-user/keke-cardlib-shared.json。该文件包含卡库原始文件数据，请勿公开分享或放进公开仓库。

重要限制：
- Server Plugin 是服务端代码，拥有文件系统访问能力，只应安装你信任的代码；仅在自己的酒馆实例启用。
- 此共享功能为实验版，当前采用整库 JSON 写入；超大卡库可能受 SillyTavern 请求体大小限制影响。同步前请保留独立备份。
- 同一张卡的 ID 冲突时，下载合并以服务器版本为准；独有卡片会保留。不会自动删除卡片。
- 角色卡导入/导出和世界书互通已有前端功能；预设、正则、美化主题的完整酒馆原生导入/导出尚未完成，不能视为本版已支持。
