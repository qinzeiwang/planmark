---
name: planmark
description: Redraw satellite images and site plans into light base maps for manual SVG equipment annotation and JSON/PNG export. 将卫星图重绘为淡色底图，手工标注设备和参数；不自动确定点位或提供 AI 标注检查。
---

# PlanMark — English

Use the user's language for conversation. Documentation is bilingual; the current browser UI and equipment names are Simplified Chinese.

Workflow: source image → light base-map redraw → user confirmation → manual annotation and local checks → JSON / PNG.

All resource paths are relative to this skill. Store user inputs and generated projects in the user's working directory, never in the installed skill. Use the supplied inputs directly; do not add project-history searches.

## 1. Redraw

- Check actual session capabilities: image understanding, an image-editing tool accepting both structure and style references, and a real downloadable PNG output. Image recognition or a text prompt alone is insufficient. If unavailable or failed, report the limitation, do not pretend to have generated an image, and do not retry indefinitely. Provide the prompt and reference for external generation, then continue after the user supplies and confirms a PNG. A confirmed base map or saved JSON skips generation.
- Inspect the original and [default reference](base-map/references/default.png). Use the [alternative](base-map/references/hand-drawn.png) only when stronger hand-drawn styling is requested. Select exactly one style reference.
- Follow the tool's image-reading and reference instructions. The original is structure reference A; the selected image is style reference B. Follow the [bilingual prompt](base-map/prompts/redraw.md), preserving crop, aspect ratio, building outlines, roads, and major spaces. No equipment, text, or legend in the base map.
- Do not expand the scene, invent hidden buildings, add roads, or infer unknown land uses. Oblique views may require a better top-down source.
- Apply the [acceptance criteria](base-map/acceptance.md): structural errors cannot be offset by style scores. Show the image and wait for the user's acceptance.

## 2. Prepare the editor

1. Run `python "<skill>/scripts/prepare-project.py" --image "<confirmed.png>" --output "<workdir>/<new-project>"`. To resume, replace --image with `--scene "<saved.json>"`.
2. Use a new output directory; never overwrite a saved project. The script embeds the image in scene.json and preloads `editor/start.html` without adding equipment.
3. Run `python "<new-project>/scripts/local-server.py" --port <free-port>`. Try 8766; if occupied, choose another port without terminating another service. Hide background terminal windows on Windows.
4. Open `http://127.0.0.1:<port>/editor/start.html`. Prepare and open the project for the user rather than requiring manual file assembly.

## 3. Annotate and check locally

- The 55 SVGs use colored circular backgrounds and white strokes. Users choose category, location, and name/power/parameter labels.
- Drag icon and label together. Labels attach to one of four sides or can be hidden; never drag labels independently.
- The legend is fixed at the right-center, deduplicated by kind, and uses category names from the registry. Map label name does not replace the category.
- White map overlay defaults to 0% and does not fade annotations.
- Local checks only report overlap, bounds, hidden labels, low contrast, and inconsistent colors within a category. They do not change content or validate engineering locations.
- Do not offer AI review, automatic rearrangement, patch import, preview/apply flows, or invoke a model/CLI during annotation. Never guess equipment locations. Leaders are manually enabled only after trying four-side label placement.

## 4. Save and export

- JSON embeds the base image and restores positions and parameters. Where supported, use the browser picker for name/location; otherwise prompt for a filename and let browser download settings choose the folder.
- PNG has a 3840-pixel long edge with the map, annotations, and fixed legend, without toolbar or selection outlines. Prefer browser Save As; otherwise the local server opens a native dialog at the project directory. Cancel does not download; the dialog confirms overwrites.
- Inspect text, SVGs, clipping, legend, and obstruction. Do not claim mocked dialog tests are real desktop verification.
- See [save details](export/guide.md) and [scene schema](export/scene-schema.md). Do not generate slide decks, area boundaries, or engineering designs.

# PlanMark — 中文


# PlanMark 工程平面示意图

照片 → 重绘淡色底图 → 用户确认 → 手工标注与本地检查 → 保存 JSON / 另存 PNG。

所有资源路径相对于本技能目录。输入由本次请求提供，不额外建立项目历史检索。原图、底图、标注项目和输出保存在用户工作目录，不写入技能安装目录。不依赖历史调试目录。

## 1. 重绘底图
- 开始前确认当前会话能读取图片，并有支持原图与风格参考的图像编辑工具，且能交付实际 PNG；仅能看图或输出提示词不够。没有工具或调用失败时明确报告，不假装已重绘、不自动反复重试；提供提示词与参考图供外部生成，等用户提供并确认底图后继续。已确认底图或保存的 JSON 无需生图。
- 先查看用户原图及[默认风格参考](base-map/references/default.png)：浅色、轻阴影，适合叠加工程标注。
- 用户要求更强手绘感时，改用[备选风格参考](base-map/references/hand-drawn.png)。每次只选一张风格参考，不同时混用；建筑、道路与场地布局始终以用户原图为准。
- 用可用图像生成/编辑工具，原图为结构参考 A，固定图为风格参考 B；遵循工具的图片读取与引用要求。
- 采用[底图提示词](base-map/prompts/redraw.md)，保留比例、取景、建筑轮廓、道路及主要场地关系，输出淡色俯视底图，不附加设备、文字或图例。
- 不扩图、不新增建筑道路；不推定无法识别区域的用途，不补造隐藏结构。斜视照片无法提供不可见区域的精确平面，必要时请用户补充俯视资料。
- 按[验收标准](base-map/acceptance.md)对照原图检查；建筑增删、道路错位属于结构错误，不能用风格分抵消。
- 展示底图，用户接受后进入标注；已确认底图或已保存 JSON 可直接进入对应步骤。

## 2. 准备独立标注项目
1. 执行 `python "<技能目录>/scripts/prepare-project.py" --image "<确认后的底图.png>" --output "<工作目录>/<新项目名>"`；恢复 JSON 时用 `--scene "<用户文件.json>"` 替代 --image。
2. 输出目录必须是新目录，不覆盖旧项目。脚本复制运行文件，生成内嵌底图的 scene.json 和已加载场景的 `editor/start.html`，不自动添加设备。
3. 启动 `python "<新项目>/scripts/local-server.py" --port <空闲端口>`，默认尝试 8766；被占用时换端口，不终止其他服务。Windows 后台启动隐藏终端窗口。
4. 打开 `http://127.0.0.1:<端口>/editor/start.html`。助手完成准备与打开，不让用户手工拼装文件。

## 3. 手工标注与本地检查
- 55 个 SVG 图标统一采用圆形彩色背景与白色线条。
- 用户选设备类型、点位及标签名称/功率/参数；图标和标签整体拖动。标签可在上、下、左、右四侧或隐藏，不能独立拖动。
- 图标说明固定在右侧垂直居中，仅按 kind 去重，从图标库读取种类；地图标签 name 不替代种类说明。
- “底图淡化”通过白色覆盖层调整底图，默认 0%，不影响图标与标签。
- 本地检查只提示重叠、越界、隐藏标签、对比及同类多色，不修改内容、不判断工程点位正确性。
- 不提供 AI 检查、自动整理、建议导入、预览或应用修改，也不启动模型或 Codex CLI。
- 不根据原图猜测设备点位；引线由用户手工开启，先尝试四向标签调整。

## 4. 保存与输出
- JSON 内嵌底图，打开后恢复点位与参数。支持浏览器文件选择器时可选择名称和目录；否则输入名称，目录由浏览器下载设置控制。
- PNG 长边 3840，包含地图、图标、紧贴标签和右侧种类说明；不包含工具栏和选中框。
- PNG 优先使用浏览器另存为；不支持时由本地服务打开系统另存为，默认定位当前独立项目目录。取消不自动下载，重名由保存窗口确认。
- 交付前检查中文、SVG、图例、裁切与遮挡；不能把模拟测试当作真实系统窗口验证。
- [保存与导出说明](export/guide.md)列出浏览器差异与服务边界；[Scene 协议](export/scene-schema.md)用于恢复及兼容性检查。
- 不生成整套 PPT、不画区域范围、不自动设计工程方案。
