# Scene Schema v1 — English

The bilingual example below is illustrative: src must contain real base64 image data and IDs must be actual generated values. Property names remain unchanged across languages.

- x/y: normalized map coordinates in [0,1], anchored at the icon center.
- Logical canvas width: 1000. Map origin: (20,20), width: 740; height follows the image ratio.
- size: 24–64; fontSize: 12–28. Labels wrap at 16 characters.
- labelSide: left/right/top/bottom, attached gap: 2. There are no independent label_x/label_y fields.
- color sets the circular background; SVG strokes are white.
- legend is fixed to {"position":"right-center"}; x=780, y=(canvas height−legend height)/2. Legacy free legend coordinates are ignored while equipment positions and parameters are preserved.
- background.overlayOpacity: 0–1, defaults to 0 for older JSON. The white overlay affects the map only.
- Legend rows are deduplicated by kind and named from the icon registry. name is the map label, including power or other parameters. The first occurrence supplies the representative color; mixed colors trigger a local warning.
- Manual changes create a new revision. Images are embedded PNG/JPEG/WebP, with at most 200 annotations.
- allowLeader is a user-controlled permission; leader can only be enabled when it is true. leaderDistance is 12–80.

## Browser API

- `EngineeringAnnotator.getScene()`: a copy of the current scene.
- `EngineeringAnnotator.setScene(scene)`: validates and restores it, including actual image dimensions.
- `EngineeringAnnotator.inspect()`: local rule findings.
- `EngineeringAnnotator.exportPNG()`: Promise<Blob>, default 3840-pixel long edge. It generates the image; the button handles saving.

There is no AI review/patch/preview/apply API. Saved v1 scene JSON remains supported; review or patch documents are not scene files.

---

# Scene 标注文件协议 v1

## Scene
```json
{
  "version": 1,
  "revision": "由页面生成的版本ID",
  "background": {
    "name": "base.png",
    "src": "data:image/png;base64,这里是完整图片编码",
    "width": 1204,
    "height": 1306,
    "overlayOpacity": 0
  },
  "annotations": [{
    "id": "页面生成的标注ID",
    "kind": "energy/solar-panel",
    "name": "屋顶光伏",
    "color": "#386E94",
    "x": 0.4,
    "y": 0.3,
    "size": 40,
    "fontSize": 17,
    "labelSide": "right",
    "labelVisible": true,
    "allowLeader": false,
    "leader": false,
    "leaderDistance": 40
  }],
  "legend": {"position": "right-center"}
}
```

以上 src 和 ID 为说明占位；实际文件必须包含完整图片与页面生成的 ID。

- x/y 是相对地图本身的 0–1 坐标，以圆形 SVG 中心为锚点。
- 画布逻辑宽度 1000；地图从 (20,20) 起，宽度 740，按原图比例计算高度。
- size 24–64，fontSize 12–28；标签分行显示，每行最多 16 字符。
- labelSide 为 left/right/top/bottom；紧贴间距 2。没有 label_x/label_y。
- 图标圆形背景使用 color，SVG 白色。
- legend 固定为 {"position":"right-center"}。位置由画布计算，x=780，y=(画布高度-说明栏高度)/2。旧 JSON 的自由位置会忽略，点位与参数完整保留。
- background.overlayOpacity 为 0–1，默认 0；在地图上覆盖白色层，不作用于标注。旧 JSON 缺此字段时补 0。
- 说明栏只按 kind 去重，名称从图标库读取；name 仅为地图标签，可为功率或参数。不同颜色的同类图标使用首项颜色作为说明栏代表色，本地检查给出同类多色提示。
- 手工编辑后生成新的 revision。
- JSON 内嵌底图，仅支持 PNG/JPEG/WebP；最大 200 个标注。

## 页面内部接口
- `EngineeringAnnotator.getScene()`：返回当前场景副本。
- `EngineeringAnnotator.setScene(scene)`：校验并恢复项目，包括底图实际尺寸。
- `EngineeringAnnotator.inspect()`：返回本地规则检查结果。
- `EngineeringAnnotator.exportPNG()`：返回 Promise<Blob>，默认长边 3840；该接口只生成图片，另存为由页面按钮处理。

不再提供 AI 检查、patch 导入、预览或应用接口。旧版正常保存的 scene.json 仍可导入；visual-review.json 和 visual-patch.json 不是项目文件。
