#target illustrator
// ============================================================
//  Showcase sheet - five FAD-binding design candidates
//
//  Layout follows protein-ps FIG Fig.2B / Fig.3B exactly:
//    - one panel letter + title for the whole block
//    - cells labelled "Case N" in bold with a green italic "(success)"
//    - the overview render is NOT framed; only zoom insets are
//    - distance / angle live INSIDE the render (ChimeraX "distance"),
//      not as a caption line
//  All labels come from CASES, generated from manifest.json.
//  Style constants are the measured ones used in fig2_hbond.jsx,
//  palette read from Desktop/Fig1_NMI_180mm_5protein_layout.ai.
//  PURE ASCII ONLY.
// ============================================================
var PT = 2.834645669;
var FIG_W = 183 * PT;
var OUT = "C:/Users/lhw15/Desktop/";
var IMG = "C:/Users/lhw15/Desktop/\u5c55\u793a\u5019\u9009_20261008/images_asc/";

var INK = "#17212B", GREY = "#344251", GREEN = "#148420";
var FS_LAB = 5.1, FS_TITLE = 6.2, FS_LETTER = 8.5, FS_PTITLE = 6.8;
var ARIAL = "ArialMT", ARIALB = "Arial-BoldMT", ARIALI = "Arial-ItalicMT";
var ARIALBI = ARIALI;
(function () {
    try { app.textFonts.getByName("Arial-BoldItalicMT"); ARIALBI = "Arial-BoldItalicMT"; } catch (e) {}
})();

var CASES = [
    { img: "fad_021.png", name: "fad_021", pair: "SER:OG -> FAD:O4" },
    { img: "fad_007.png", name: "fad_007", pair: "SER:OG -> FAD:O2" },
    { img: "fad_033.png", name: "fad_033", pair: "ASN:ND2 -> FAD:N1A" },
    { img: "fad_008.png", name: "fad_008", pair: "TYR:OH -> FAD:N10" },
    { img: "fad_000.png", name: "fad_000", pair: "SER:OG -> FAD:N1A" }
];

var MX = 8, MT = 14, MB = 8, GX = 16, GY = 22;
var TITLEH = 16, HEADH = 10, LABH = 12;
var INNER = FIG_W - 2 * MX;
var COLW = (INNER - 2 * GX) / 3;
var IMGH = COLW * 0.75;
var ROWH = HEADH + IMGH + LABH;
var NROW = Math.ceil(CASES.length / 3);
var FIG_H = MT + TITLEH + NROW * ROWH + (NROW - 1) * GY + MB;

for (var d = app.documents.length - 1; d >= 0; d--) {
    if (app.documents[d].name.indexOf("showcase_fad") === 0) {
        app.documents[d].close(SaveOptions.DONOTSAVECHANGES);
    }
}
var doc = app.documents.add(DocumentColorSpace.RGB, FIG_W, FIG_H);
var L = doc.layers[0]; L.name = "figure";

function col(h) {
    h = h.replace("#", "");
    var c = new RGBColor();
    c.red = parseInt(h.substr(0, 2), 16);
    c.green = parseInt(h.substr(2, 2), 16);
    c.blue = parseInt(h.substr(4, 2), 16);
    return c;
}
function place(tf, x, y, ha, va) {
    tf.position = [x, y];
    var w = tf.width, h = tf.height, dx = 0, dy = 0;
    if (ha === "center") dx = -w / 2; else if (ha === "right") dx = -w;
    if (va === "middle") dy = h / 2; else if (va === "bottom") dy = h;
    if (dx !== 0 || dy !== 0) tf.position = [x + dx, y + dy];
}
function txt(s, x, y, size, font, hex, ha, va) {
    var tf = L.textFrames.add();
    tf.contents = s;
    var ca = tf.textRange.characterAttributes;
    ca.size = size;
    ca.textFont = app.textFonts.getByName(font || ARIAL);
    ca.fillColor = col(hex || INK);
    place(tf, x, y, ha, va);
    return tf;
}
// bold black "Case N" + bold italic green "(success)"   (Fig.3B)
function caseLabel(cx, y, label) {
    var a = txt(label, 0, y, FS_LAB, ARIALB, INK, "left", "bottom"); var w1 = a.width;
    var b = txt("(success)", 0, y, FS_LAB, ARIALBI, GREEN, "left", "bottom"); var w2 = b.width;
    var left = cx - (w1 + 3 + w2) / 2;
    a.position = [left, a.position[1]];
    b.position = [left + w1 + 3, b.position[1]];
}
function placeImg(fn, left, top, w) {
    var f = new File(IMG + fn);
    if (!f.exists) return null;
    var pi = L.placedItems.add();
    pi.file = f;
    var r = pi.height / pi.width;
    pi.width = w; pi.height = w * r;
    pi.position = [left, top];
    try { pi.embed(); } catch (e) {}
    return pi;
}

// ---- block header: one panel letter + title (Fig.2B / Fig.3B) ----
txt("a", MX, FIG_H - MT - 8.5, FS_LETTER, ARIALB, INK, "left", "bottom");
txt("Representative FAD-binding designs", MX + 12.5, FIG_H - MT - 8.5,
    FS_PTITLE, ARIALB, INK, "left", "bottom");

var TOP0 = FIG_H - MT - TITLEH;
for (var i = 0; i < CASES.length; i++) {
    var r = Math.floor(i / 3), c = i % 3;
    var x = MX + c * (COLW + GX);
    var top = TOP0 - r * (ROWH + GY);

    caseLabel(x + COLW / 2, top - 1, "Case " + (i + 1));
    placeImg(CASES[i].img, x, top - HEADH, COLW);
    txt(CASES[i].pair, x + COLW / 2, top - HEADH - IMGH - 5,
        FS_LAB, ARIAL, GREY, "center", "top");
}

var folder = new Folder(OUT);
if (!folder.exists) folder.create();
var png = new File(OUT + "showcase_fad.png");
var po = new ExportOptionsPNG24();
po.antiAliasing = true; po.transparency = false; po.artBoardClipping = true;
po.horizontalScale = 300; po.verticalScale = 300;
doc.exportFile(png, ExportType.PNG24, po);
var svg = new File(OUT + "showcase_fad.svg");
var so = new ExportOptionsSVG(); so.coordinatePrecision = 3;
doc.exportFile(svg, ExportType.SVG, so);
var ai = new File(OUT + "showcase_fad.ai");
doc.saveAs(ai, new IllustratorSaveOptions());
"OK | " + Math.round(FIG_W) + "x" + Math.round(FIG_H) + "pt | png=" + png.exists + " ai=" + ai.exists;
