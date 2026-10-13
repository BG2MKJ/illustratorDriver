# Illustrator COM Driver

用命令行驱动本机已安装的 Adobe Illustrator 画矢量图并导出，**零依赖**——
不需要 MCP、不需要 pywin32、不需要装任何包。原理就是 PowerShell 调
`Illustrator.Application` 这个 COM 对象，把一段 ExtendScript（`.jsx`）送进去执行。

## 环境

- Windows + 已安装 Adobe Illustrator（本仓库在 Illustrator 2026 / 30.6 上验证）
- PowerShell（系统自带）
- Illustrator 不在默认位置时不用配 PATH，脚本用 COM 拿实例；只有需要手动启动时才要知道路径
  （本机是 `D:\APPS\AI2026\...\Illustrator.exe`，`HKLM\SOFTWARE\Adobe` 下没登记，
  只有 Photoshop，所以别靠注册表判断"没装"）

## 文件

| 文件 | 作用 |
|---|---|
| `run.ps1` | 把 `.jsx` 送进 Illustrator 执行，回显脚本最后一个表达式的值 |
| `crop.ps1` | 从导出的 PNG 里裁一块放大，用来盯小字号排版 |
| `measure.ps1` | 量 PNG 里的墨迹行/文本行范围，逐个换算成 pt，检查基线对齐 |
| `probe.ps1` / `probe_*.jsx` | 探针：列字体、量 `va="middle"` 的实际偏移等 |
| `test.jsx` | 最小可跑示例 |
| `nature_fig.jsx` | 参考成品：四联图（剂量-效应 / 柱状+散点 / 时序 / 热图） |
| `fig1_layout.jsx` | 实例：六面板图，含排版、流程图、从 CSV 读数据出图 |
| `fig2_hbond.jsx` | 实例：Nature 双栏图，含嵌入位图、单个数据源同时生成图与图注 |
| `showcase_fad.jsx` | 实例：候选案例网格图 |
| `fig1_keep_ab6.jsx` | 实例：批量删画板（只留一个）+ 按 bounds 删图元 |

## 用法

```powershell
cd <本目录>
powershell -NoProfile -ExecutionPolicy Bypass -File run.ps1 my_figure.jsx
```

`run.ps1` 会打印 `RESULT: <脚本最后一行表达式的值>`，所以脚本末尾写一句

```js
"OK | " + Math.round(FIG_W) + "x" + Math.round(FIG_H) + "pt | png=" + png.exists;
```

就能一眼看到有没有跑成功、导出了没有。

导出三件套（矢量 + 位图 + 可编辑源文件）：

```js
var po = new ExportOptionsPNG24();
po.antiAliasing = true; po.transparency = false; po.artBoardClipping = true;
po.horizontalScale = 300; po.verticalScale = 300;     // 300% 预览
doc.exportFile(png, ExportType.PNG24, po);

var so = new ExportOptionsSVG(); so.coordinatePrecision = 3;
doc.exportFile(svg, ExportType.SVG, so);

doc.saveAs(new File(OUT + "fig.ai"), new IllustratorSaveOptions());
```

## 踩过的坑（按重要性排）

1. **`.jsx` 必须是纯 ASCII。** 中文 Windows 的 ExtendScript 按系统代码页（GBK）读文件，
   源码里任何一个 UTF-8 多字节字符——**连中文注释、破折号 `—` 都算**——都会让解析崩掉，
   报错信息还很误导（`JavaScript code was missing`）。字符串里的希腊字母、上下标一律写成
   `\u03B1` 转义，或者用 `String.fromCharCode(0xC5)` 这种（更稳，见第 2 条）。
   写完自检：`LC_ALL=C tr -d '\000-\177' < x.jsx | wc -c` 必须是 0。

2. **别在 shell 里用 `\\uXXXX` 拼脚本。** heredoc / JSON 传输会把 `\\` 折成 `\`，
   于是 Python 把 `\uXXXX` 当真转义吃掉了，反过来又可能写进一个裸 CR。要动态生成脚本时，
   用 `String.fromCharCode()`，或者直接用工具写文件、别走 shell 字符串。

3. **`native` 是 ExtendScript 的保留字**，连当对象键都会报
   `非法使用保留字"native"`。`var native = ...` 和 `{ native: 1 }` 都不行，改叫 `nat`。

4. **`app.textFonts.getByName(name)` 找不到字体会抛异常**，而且抛出来会让**整条脚本中止**。
   用之前先试：`try { app.textFonts.getByName("Arial-BoldItalicMT"); ... } catch (e) {}`。
   另外传给 `textFont` 的位置参数一旦错位（比如漏传一个参数）就会报
   `No such element`，很不好查——写 text helper 时参数个数要数清楚。

5. **`app.open()` 会被弹窗挡住**（缺链接警告等），脚本会收到
   `the operation was cancelled`。开文件前先关交互：
   ```js
   app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;   // 注意没有 DONOT 那个拼法
   ```
   枚举名写错会报 `Invalid enumeration value`。

6. **坐标系是 y 向上的**（原点在画板左下）。`pathItems.rectangle(top, left, w, h)`——
   **top 在前**；`setEntirePath` 传 `[[x,y],...]`，默认全是角点。

7. **位图（placedItem）的宽高比要在改宽度之前读**：
   ```js
   var r = pi.height / pi.width;    // 先读
   pi.width = w; pi.height = w * r; // 再改，否则比例是从新宽度算出来的
   pi.position = [left, top];       // position 是左上角
   ```
   想让它不随外部文件移动而断链就 `pi.embed()`。

8. **文本定位**：`textFrame.position` 是左上角，要按 `ha/va` 自己算偏移。
   `va="middle"` 实测让字墨中心落在锚点下方约 0.5pt，做图例色块严格对齐时把横线画在 `y-0.6`。
   旋转的 y 轴标题：先 `ha="center", va="middle"` 把框中心放到目标点，再
   `tf.rotate(-90, true,true,true,true, Transformation.CENTER)`；按"左上角锚点"定位再旋转，
   长标签的中心会跑偏压到坐标轴上。

9. **ArialMT 没有 ⁻⁹ ⁵₀ 这些上下标字形**，直接写 U+207B/U+2085 会渲染成方框。
   要做真上下标：先设整段字号，再逐字符改 `characters[i].characterAttributes.size` +
   `baselineShift`（正=上标，负=下标）。`characters` 集合是 **0 基**的。

10. **删画板 ≠ 删内容。** `doc.artboards.remove(i)` 只是去掉页面区域，
    图元还在画布上。要真的清掉某一版，得遍历 `layer.pageItems`，按
    `geometricBounds` 的**中心点**是否落在该画板的 `artboardRect` 里来判断并 `remove()`。
    删多个画板时下标从大到小走，否则会错位。动手前**务必备份**。

11. **脚本里一条命令报错会中止后面所有命令。** `--silent` 下还看不到原因。
    调不通时先去掉 `--silent` 看输出；日志命令 `log file <path>` 也不一定落盘，
    别指望靠它 debug。

12. `p.filled = false` 的路径再设 `fillColor` **不会显示**，得先给个占位填充色或把 `filled = true`。

## 排版基线（Nature 双栏 183mm）

`FONT` 用 ArialMT；正文/刻度 5.1pt、轴标题 6.2pt、面板字母 8.5pt 粗体、面板标题 6.8pt 粗体。
线宽：坐标轴 0.44、数据线 0.69、细线 0.29。只画左/下坐标轴、刻度朝外、不要网格线。
留白要**紧**：GX/GY 约 18–22pt。

## License

GPL-3.0（见 `LICENSE`）。
