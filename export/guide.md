# Save and Export — English

## Editing

Place equipment and labels manually. Local rules flag overlaps, bounds, hidden labels, low contrast and mixed colors within a category without changing the scene. Save JSON to keep the complete image and annotations; reopen it to continue. PNG exports the map and labels at a 3840-pixel long edge, excluding controls and selection highlights.

## PNG Save As

- Prefer `showSaveFilePicker`, opened before rendering to preserve click activation. The browser may remember a directory; the initial directory is not guaranteed to be the project folder.
- If unavailable or denied, the local server opens a Tk Save As dialog in the standalone project folder. This requires Python tkinter and a desktop environment. The user selects the path/name and confirms overwrite.
- Cancellation keeps annotations and never starts a fallback download. Report write failures accurately.
- Direct file-mode HTML still supports editing; PNG fallback needs the local server when a browser picker is unavailable. Verify native dialogs on the actual platform.

## JSON

Use the browser file picker when supported; otherwise prompt for a filename and use the configured download location. JSON has no native-server dialog fallback.

## Server and upgrades

Run `python scripts/local-server.py --port 8766` using an available port. The server listens only on 127.0.0.1, serves project files and PNG saving, and does not invoke a model or Codex CLI. `GET /api/export-config` supplies a session token; `POST /api/export-png` checks origin and token before opening the dialog. The destination is selected only in that dialog.

Updating the skill affects newly created projects, not existing copies. Save JSON before refreshing or migrating. To use an updated template, restore JSON into a new project. The initial start.html is not automatically rewritten with later edits. Older projects keep their original directory layout and runtime files.

---

# 保存与导出

## 用户操作
1. 手工选择设备图标、点位和标签；本地检查自动提示重叠、越界、隐藏标签、低对比及同类多色，不修改画面。
2. “保存 JSON…”保存含完整底图的项目；下次“打开 JSON”继续编辑。
3. “导出 PNG…”弹出另存为窗口，选择目录和文件名。导出长边 3840，不含工具栏及选中框。

## PNG 另存为
- 优先使用浏览器 `showSaveFilePicker`；在生成 PNG 前打开选择器，保留点击触发权限。选择器按浏览器规则记住目录，不保证首次定位当前项目。
- 浏览器不支持或不允许该接口时，通过项目本地服务打开 Tk 系统另存为窗口，默认目录为当前独立项目。需要 Python tkinter；窗口由用户选择路径、名称，并确认重名覆盖。
- 用户取消时保留标注，不自动下载。写入失败须显示错误，不声称已保存。
- 离线直接打开 HTML 仍可编辑；不支持浏览器选择器时，PNG 另存为需要本地服务。系统窗口兼容性须按实际环境验证。

## JSON 保存
支持浏览器文件选择器时可选目录与名称；否则提示输入名称，目录由浏览器下载设置控制。JSON 暂未接入本地系统窗口，不要声称所有浏览器都能选择目录。

## 本地服务
运行 `python scripts/local-server.py --port 8766`，端口占用就换空闲端口。服务只监听 127.0.0.1，提供静态页面和 PNG 另存为，不调用模型、Codex CLI 或网络检查。
`GET /api/export-config` 返回本次服务令牌；`POST /api/export-png` 验证同源和令牌后，接收 PNG 并打开系统窗口。保存路径仅由系统窗口决定。

## 更新已有项目
模板更新只影响之后新建的项目，不覆盖已有用户项目。已有页面刷新前先保存 JSON，刷新后重新打开，避免丢失未保存标注。
