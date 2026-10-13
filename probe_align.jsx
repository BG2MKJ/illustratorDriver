#target illustrator
// Which vertical anchor actually centres the text ink on a line?
var doc = app.documents.add(DocumentColorSpace.RGB, 180, 200);
var L = doc.layers[0];
function col(h) { h = h.replace("#", ""); var c = new RGBColor();
    c.red = parseInt(h.substr(0, 2), 16); c.green = parseInt(h.substr(2, 2), 16);
    c.blue = parseInt(h.substr(4, 2), 16); return c; }
function hline(y) {
    var p = L.pathItems.add();
    p.setEntirePath([[20, y], [60, y]]);
    p.filled = false; p.stroked = true; p.strokeColor = col("#999999"); p.strokeWidth = 0.4;
}
function t(s, x, y, ha, va) {
    var tf = L.textFrames.add();
    tf.contents = s;
    var ca = tf.textRange.characterAttributes;
    ca.size = 5.6; ca.textFont = app.textFonts.getByName("ArialMT"); ca.fillColor = col("#000000");
    tf.position = [x, y];
    var w = tf.width, h = tf.height, dx = 0, dy = 0;
    if (ha === "center") dx = -w / 2; else if (ha === "right") dx = -w;
    if (va === "middle") dy = h / 2; else if (va === "bottom") dy = h;
    if (dx !== 0 || dy !== 0) tf.position = [x + dx, y + dy];
    return tf;
}
var rep = [];
var ct = t("Vehicle", 65, 40, "left", "top");
rep.push("top: h=" + ct.height.toFixed(2) + " frameCentreY=" + (ct.top - ct.height / 2).toFixed(2));
var cm = t("Vehicle", 65, 100, "left", "middle");
rep.push("mid: h=" + cm.height.toFixed(2) + " frameCentreY=" + (cm.top - cm.height / 2).toFixed(2));
var cb = t("Vehicle", 65, 160, "left", "bottom");
rep.push("bot: h=" + cb.height.toFixed(2) + " frameCentreY=" + (cb.top - cb.height / 2).toFixed(2));
hline(40); hline(100); hline(160);

var fo = new Folder("C:/Users/lhw15/ai_driver/out"); if (!fo.exists) fo.create();
var f = new File("C:/Users/lhw15/ai_driver/out/align.png");
var o = new ExportOptionsPNG24();
o.antiAliasing = true; o.transparency = false; o.artBoardClipping = true;
o.horizontalScale = 600; o.verticalScale = 600;
doc.exportFile(f, ExportType.PNG24, o);
doc.close(SaveOptions.DONOTSAVECHANGES);
rep.join(" | ");
