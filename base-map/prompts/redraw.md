# Base-map Redraw Prompt — English

## Full prompt

Redraw the site structure in Image A as a light-colored top-down site plan suitable for engineering proposal slides and equipment overlays. Image A determines building outlines, roads, greenery, water, sports grounds, parking areas, their count, and relative positions. Image B determines visual style only.

Preserve Image A's aspect ratio, crop and overall spatial layout. Do not expand the site, add buildings or roads, move major spaces, infer unknown uses, or invent hidden structures. Use a true orthographic top-down view with pale blue-gray/off-white roofs, light gray roads, soft green vegetation, pale blue water and subtle consistent shadows. Avoid satellite textures, realistic materials, strong perspective and high contrast. This must be a redraw, not a filter.

Omit map labels, map UI, dimensions, numbering and unrelated text or marks. Do not add equipment, icons or a legend. Keep the background clean and legible for later annotations.

## Negative prompt

Satellite texture, photorealism, dark roofs, heavy shadows, high contrast, noisy or blurry textures, map labels, watermark, UI elements, dramatic 3D rendering, perspective view, oversaturated colors, poster styling.

## Parameterized template

- `{source_type}`: map screenshot / satellite image / oblique aerial image / CAD plan.
- `{site_type}`: campus / industrial park / factory / residential area / public building.
- `{must_keep}`: specific buildings, roads, greenery, water and other essential structures.
- `{style_ref}`: the selected default or hand-drawn style image; select one.

Task: redraw Image A as a light site-plan base map.
Input: {source_type}. Site: {site_type}.
Structure reference: Image A. Style reference: Image B ({style_ref}).
Keep: {must_keep}, original crop, ratio, building counts and relative layout.
Output: a clean, bright, low-saturation PNG for engineering annotations, with no added text, icons or legend.

Use either language version as appropriate for the image tool; do not concatenate conflicting prompts. Structural fidelity takes precedence over stylistic similarity.

---

# 提示词模板与约束

## 1. 主提示词（中文）
请基于 Image A 的场地结构，重新绘制一张适合方案汇报 PPT 使用的淡色总平底图。
Image A 用于提供建筑、道路、绿地、水体、操场、停车区等空间结构与相对位置。
Image B 用于提供目标风格。
输出结果必须是正上方俯视的、清新明亮、低饱和、专业现代的咨询方案风总平底图。
严格保留原图的总体布局、建筑轮廓、道路走向、绿化分布和主要场地关系。
不要保留卫星图或航拍图的真实纹理，不要做简单滤镜效果，而是进行重绘。
建筑使用浅灰白和浅蓝灰，道路使用浅灰，绿地使用柔和浅绿，水体使用很浅的蓝色，阴影轻微统一。
删除文字、水印、地图 UI、尺寸、编号及无关信息。
保持整体干净、统一、适合后续叠加图标、标签和图例。

---

## 2. 英文补充提示词
redraw the site plan instead of simply recoloring the source image, top-down orthographic site plan, consulting presentation style, clean campus masterplan, light and airy, low saturation, pale blue gray, soft green, off-white buildings, minimal texture, soft shadows, no labels, no map UI, no watermark, suitable as a presentation background for overlays

---

## 3. 强约束补充
- This must be a redraw, not a photo filter effect.
- Preserve layout accuracy from Image A.
- Do not invent new buildings or move major spaces.
- Do not output a satellite image look.
- Do not use strong shadows, dark roofs, or realistic textures.
- Keep the result clean, flat, bright, and presentation-ready.
- No text, no labels, no legend, no icons in the base map.

---

## 4. Negative Prompt
satellite photo, aerial photo texture, photorealistic, realistic texture, dark roof, strong shadow, high contrast, noisy image, blurry image, map labels, watermark, UI elements, dramatic 3d rendering, perspective view, oversaturated colors, poster style

---

## 5. 变量化模板（适合 Skill）
### 输入变量
- `{source_type}`：地图截图 / 卫星图 / 鸟瞰图 / CAD 平面图
- `{site_type}`：校园 / 园区 / 厂区 / 社区 / 公共建筑
- `{must_keep}`：建筑、道路、绿地、水体等重点结构
- `{style_ref}`：固定风格参考图

### 模板
任务：将 Image A 重绘为淡色总平底图。
输入类型：{source_type}
场地类型：{site_type}
结构参考：Image A
风格参考：Image B
输出用途：PPT 方案叠加底图

必须保留：
- {must_keep}
- 原图整体布局关系与俯视结构

目标风格：
- 咨询方案风
- 清新明亮
- 低饱和
- 浅灰蓝、浅灰、米白、浅绿
- 正上方俯视
- 干净、统一、专业

必须避免：
- 卫星图质感
- 真实材质
- 强阴影
- 高饱和
- 杂乱文字与水印
- 透视感过强
