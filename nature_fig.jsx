#target illustrator
// ============================================================
//  Nature-style 4-panel figure  (183 x 130 mm)
//  a dose-response | b bars+dots | c time course+bands | d heatmap
//  NOTE: keep this file pure ASCII - ExtendScript reads it in the
//  system codepage (GBK here), so any UTF-8 byte outside ASCII
//  corrupts parsing. Use \uXXXX escapes inside strings.
// ============================================================

var FIG_W = 518.74, FIG_H = 368.50;          // 183mm x 130mm in pt
var OUT = "C:/Users/lhw15/ai_driver/out/";

var INK = "#1A1A1A", GREY = "#6E6E6E", FAINT = "#E2E2E2";
var BLUE = "#3A6EA5", ORANGE = "#D9734A", GREEN = "#4E9F6B",
    RED = "#B8424A", PURPLE = "#7E6BAD";
var ARIAL = "ArialMT", ARIALB = "Arial-BoldMT", ARIALI = "Arial-ItalicMT";

for (var d = app.documents.length - 1; d >= 0; d--) {
    if (app.documents[d].name.indexOf("nature_style") === 0) {
        app.documents[d].close(SaveOptions.DONOTSAVECHANGES);
    }
}

var doc = app.documents.add(DocumentColorSpace.RGB, FIG_W, FIG_H);
var L = doc.layers[0];
L.name = "figure";

// ============================================================
//  primitives
// ============================================================
function col(h) {
    h = h.replace("#", "");
    var c = new RGBColor();
    c.red = parseInt(h.substr(0, 2), 16);
    c.green = parseInt(h.substr(2, 2), 16);
    c.blue = parseInt(h.substr(4, 2), 16);
    return c;
}
function lerpCol(a, b, t) {
    var ca = col(a), cb = col(b), c = new RGBColor();
    c.red = ca.red + (cb.red - ca.red) * t;
    c.green = ca.green + (cb.green - ca.green) * t;
    c.blue = ca.blue + (cb.blue - ca.blue) * t;
    return c;
}
function viridis(t) {
    t = Math.max(0, Math.min(1, t));
    var s = ["#440154", "#414487", "#2A788E", "#22A884", "#7AD151", "#FDE725"];
    var n = s.length - 1, i = Math.min(Math.floor(t * n), n - 1);
    return lerpCol(s[i], s[i + 1], t * n - i);
}

function poly(pts, fill, stroke, sw, closed) {
    var p = L.pathItems.add();
    p.setEntirePath(pts);
    p.closed = (closed !== false);
    if (fill) { p.filled = true; p.fillColor = col(fill); } else { p.filled = false; }
    if (stroke) {
        p.stroked = true; p.strokeColor = col(stroke);
        p.strokeWidth = (sw == null ? 0.5 : sw);
    } else { p.stroked = false; }
    return p;
}
function rect(x, y, w, h, fill, stroke, sw) {
    var p = L.pathItems.rectangle(y + h, x, w, h);
    if (fill) { p.filled = true; p.fillColor = col(fill); } else { p.filled = false; }
    if (stroke) {
        p.stroked = true; p.strokeColor = col(stroke);
        p.strokeWidth = (sw == null ? 0.5 : sw);
    } else { p.stroked = false; }
    return p;
}
function dot(cx, cy, r, fill, stroke, sw) {
    var p = L.pathItems.ellipse(cy + r, cx - r, 2 * r, 2 * r);
    p.filled = true; p.fillColor = col(fill);
    if (stroke) {
        p.stroked = true; p.strokeColor = col(stroke);
        p.strokeWidth = (sw == null ? 0.4 : sw);
    } else { p.stroked = false; }
    return p;
}

// rich text: segs = [[text, mode], ...]  mode 0=normal 1=superscript 2=subscript
// (ArialMT has no U+207B / U+2080 glyphs, so real baseline shifts are used)
function rich(segs, x, y, size, font, colorHex, ha, va) {
    var full = "";
    for (var i = 0; i < segs.length; i++) full += segs[i][0];
    var tf = L.textFrames.add();
    tf.contents = full;
    var ca = tf.textRange.characterAttributes;
    ca.size = size;
    ca.textFont = app.textFonts.getByName(font || ARIAL);
    ca.fillColor = col(colorHex || INK);
    var pos = 0, chars = tf.textRange.characters;
    for (var s = 0; s < segs.length; s++) {
        var mode = segs[s][1] || 0, len = segs[s][0].length;
        if (mode !== 0) {
            for (var c = 0; c < len; c++) {
                var a = chars[pos + c].characterAttributes;
                a.size = size * 0.62;
                a.baselineShift = (mode === 1) ? size * 0.38 : -size * 0.20;
            }
        }
        pos += len;
    }
    place(tf, x, y, ha, va);
    return tf;
}
function place(tf, x, y, ha, va) {
    tf.position = [x, y];
    var w = tf.width, h = tf.height, dx = 0, dy = 0;
    if (ha === "center") dx = -w / 2; else if (ha === "right") dx = -w;
    if (va === "middle") dy = h / 2; else if (va === "bottom") dy = h;
    if (dx !== 0 || dy !== 0) tf.position = [x + dx, y + dy];
}
function txt(s, x, y, size, font, colorHex, ha, va) {
    return rich([[s, 0]], x, y, size, font, colorHex, ha, va);
}

// ============================================================
//  axes
// ============================================================
var TICK = 3.2;
function axes(bx, by, pw, ph, xMin, xMax, yMin, yMax, xt, yt, xTitle, yTitle, xDrop) {
    poly([[bx, by], [bx, by + ph]], null, INK, 0.6, false);
    poly([[bx, by], [bx + pw, by]], null, INK, 0.6, false);
    var i, px, py;
    for (i = 0; i < xt.length; i++) {
        px = bx + (xt[i][0] - xMin) / (xMax - xMin) * pw;
        poly([[px, by], [px, by - TICK]], null, INK, 0.6, false);
        var lab = xt[i][1];
        if (typeof lab === "string") lab = [[lab, 0]];
        rich(lab, px, by - TICK - 1.6, 5.6, ARIAL, INK, "center", "top");
    }
    for (i = 0; i < yt.length; i++) {
        py = by + (yt[i][0] - yMin) / (yMax - yMin) * ph;
        poly([[bx, py], [bx - TICK, py]], null, INK, 0.6, false);
        txt(yt[i][1], bx - TICK - 1.8, py, 5.6, ARIAL, INK, "right", "middle");
    }
    if (xDrop == null) xDrop = 12;
    if (xTitle) txt(xTitle, bx + pw / 2, by - TICK - xDrop, 6.6, ARIAL, INK, "center", "top");
    if (yTitle) {
        if (typeof yTitle === "string") yTitle = [[yTitle, 0]];
        // anchor via centre so the post-rotation band stays where we put it
        var t = rich(yTitle, bx - 23, by + ph / 2, 6.6, ARIAL, INK, "center", "middle");
        t.rotate(-90, true, true, true, true, Transformation.CENTER);
    }
}
function panelLetter(s, x, y) { txt(s, x, y, 8.5, ARIALB, INK, "left", "bottom"); }
function panelTitle(s, x, y) { txt(s, x, y, 6.8, ARIALB, INK, "left", "bottom"); }
// significance bracket: up, across, down, with a label above the bar
function sig(x1, x2, y, label) {
    poly([[x1, y - 1.6], [x1, y], [x2, y], [x2, y - 1.6]], null, INK, 0.5, false);
    txt(label, (x1 + x2) / 2, y + 0.9, 5.6, ARIAL, INK, "center", "bottom");
}

// ============================================================
//  layout  2 x 2
// ============================================================
var ML = 46, MR = 34, MT = 26, MB = 20, GX = 22, GY = 22;
var cW = FIG_W - ML - MR, cH = FIG_H - MT - MB;
var PW = (cW - GX) / 2, PH = (cH - GY) / 2;

var PA = [ML, FIG_H - MT - PH];
var PB = [ML + PW + GX, FIG_H - MT - PH];
var PC = [ML, FIG_H - MT - PH - GY - PH];
var PD = [ML + PW + GX, FIG_H - MT - PH - GY - PH];

var P_BOT = 32, P_H = PH - 44, P_DROP = 20;   // plot box, shared by all four panels
var TITLE_Y = PH - 7;

// ============================================================
//  panel a - dose-response
// ============================================================
(function panelA() {
    var x0 = PA[0], y0 = PA[1];
    var bx = x0 + 30, by = y0 + P_BOT, pw = PW - 36, ph = P_H;
    panelLetter("a", x0, y0 + TITLE_Y);
    panelTitle("Dose-response", x0 + 16, y0 + TITLE_Y);

    var XMIN = -9.5, XMAX = -2.5, YMIN = 0, YMAX = 105;
    function xp(v) { return bx + (v - XMIN) / (XMAX - XMIN) * pw; }
    function yp(v) { return by + (v - YMIN) / (YMAX - YMIN) * ph; }

    var BOT = 4, TOP = 100, EC50 = -6.25, HILL = 1.15;
    var pts = [], N = 160;
    for (var i = 0; i <= N; i++) {
        var xv = XMIN + (XMAX - XMIN) * i / N;
        pts.push([xp(xv), yp(BOT + (TOP - BOT) / (1 + Math.pow(10, (EC50 - xv) * HILL)))]);
    }
    poly(pts, null, RED, 1.1, false);

    var data = [[-9, 4, 1.6], [-8, 8, 2.4], [-7, 19, 4.1], [-6.2, 47, 6.8],
                [-5.4, 78, 5.9], [-4.5, 93, 3.7], [-3.2, 97, 2.2]];
    for (var k = 0; k < data.length; k++) {
        var cx = xp(data[k][0]), yv2 = data[k][1], e = data[k][2];
        poly([[cx, yp(yv2 - e)], [cx, yp(yv2 + e)]], null, RED, 0.6, false);
        poly([[cx - 1.9, yp(yv2 - e)], [cx + 1.9, yp(yv2 - e)]], null, RED, 0.6, false);
        poly([[cx - 1.9, yp(yv2 + e)], [cx + 1.9, yp(yv2 + e)]], null, RED, 0.6, false);
        dot(cx, yp(yv2), 1.75, RED, "#FFFFFF", 0.4);
    }
    poly([[xp(EC50), by], [xp(EC50), by + ph]], null, GREY, 0.4, false).strokeDashes = [1.5, 1.5];
    rich([["EC", 0], ["50", 2]], xp(EC50) - 2.5, by + ph - 3, 5.6, ARIALI, GREY, "right", "top");

    axes(bx, by, pw, ph, XMIN, XMAX, YMIN, YMAX,
        [[-9, [["10", 0], ["-9", 1]]], [-7, [["10", 0], ["-7", 1]]],
         [-5, [["10", 0], ["-5", 1]]], [-3, [["10", 0], ["-3", 1]]]],
        [[0, "0"], [25, "25"], [50, "50"], [75, "75"], [100, "100"]],
        "log[agonist] (M)", "Response (%)", P_DROP);
})();

// ============================================================
//  panel b - bars + individual points
// ============================================================
(function panelB() {
    var x0 = PB[0], y0 = PB[1];
    var bx = x0 + 30, by = y0 + P_BOT, pw = PW - 36, ph = P_H;
    panelLetter("b", x0, y0 + TITLE_Y);
    panelTitle("Cytokine release", x0 + 16, y0 + TITLE_Y);

    var cats = [
        [["Ctrl", 0]],
        [["LPS", 0]],
        [["LPS\n+IL-10", 0]],
        [["LPS\n+Dex", 0]],
        [["LPS\n+TGF-\u03B2", 0], ["1", 2]]
    ];
    var mean = [1.0, 4.0, 2.25, 1.65, 2.55];
    var sem = [0.18, 0.42, 0.30, 0.24, 0.34];
    var jit = [-0.30, -0.21, -0.13, -0.05, 0.05, 0.13, 0.21, 0.30];
    var dev = [-1.35, -0.75, -0.35, -0.10, 0.15, 0.45, 0.85, 1.45];
    var YMAX = 5.6, YMIN = 0;
    function yp(v) { return by + (v - YMIN) / (YMAX - YMIN) * ph; }

    var slot = pw / mean.length, bw = 22;
    for (var i = 0; i < mean.length; i++) {
        var cx = bx + slot * (i + 0.5);
        var c = (i === 1) ? RED : (i === 0 ? GREY : BLUE);
        var m = mean[i], s = sem[i];
        rect(cx - bw / 2, by, bw, yp(m) - by, c).opacity = 78;
        poly([[cx, yp(m - s)], [cx, yp(m + s)]], null, INK, 0.6, false);
        poly([[cx - 3, yp(m - s)], [cx + 3, yp(m - s)]], null, INK, 0.6, false);
        poly([[cx - 3, yp(m + s)], [cx + 3, yp(m + s)]], null, INK, 0.6, false);
        for (var j = 0; j < 8; j++) {
            dot(cx + jit[j] * 26, yp(Math.max(0.06, m + dev[j] * s * 1.15)), 1.25, "#FFFFFF", c, 0.55);
        }
        rich(cats[i], cx, by - TICK - 1.6, 5.6, ARIAL, INK, "center", "top");
    }
    var sy = by + ph * 0.90;
    sig(bx + slot * 0.5, bx + slot * 1.5, sy, "***");
    sig(bx + slot * 1.5, bx + slot * 2.5, sy, "**");
    axes(bx, by, pw, ph, 0, mean.length, YMIN, YMAX, [],
        [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"]],
        "Stimulus",
        [["TNF-\u03B1 (ng ml", 0], ["-1", 1], [")", 0]], P_DROP);
})();

// ============================================================
//  panel c - time course with shaded error bands
// ============================================================
(function panelC() {
    var x0 = PC[0], y0 = PC[1];
    var bx = x0 + 30, by = y0 + P_BOT, pw = PW - 36, ph = P_H;
    panelLetter("c", x0, y0 + TITLE_Y);
    panelTitle("Quadratic functions", x0 + 16, y0 + TITLE_Y);

    var XMIN = -5.5, XMAX = 5.5, YMIN = -1.5, YMAX = 9;
    function xp(v) { return bx + (v - XMIN) / (XMAX - XMIN) * pw; }
    function yp(v) { return by + (v - YMIN) / (YMAX - YMIN) * ph; }

    // axis of symmetry: both parabolas share the vertex at the origin
    poly([[xp(0), by], [xp(0), by + ph]], null, GREY, 0.4, false).strokeDashes = [1.5, 1.5];

    var series = [
        { c: BLUE, a: 0.12 },
        { c: ORANGE, a: 0.28 }
    ];
    var N = 160;
    for (var s = 0; s < series.length; s++) {
        var a = series[s].a, up = [], lo = [], mid = [];
        for (var i = 0; i <= N; i++) {
            var xv = XMIN + (XMAX - XMIN) * i / N;
            // a fitted parabola is least certain far from its vertex
            var bd = 0.08 + 0.025 * xv * xv, yv = a * xv * xv;
            up.push([xp(xv), yp(yv + bd)]);
            lo.push([xp(xv), yp(yv - bd)]);
            mid.push([xp(xv), yp(yv)]);
        }
        var back = [];
        for (var j = lo.length - 1; j >= 0; j--) back.push(lo[j]);
        poly(up.concat(back), series[s].c, null, 0, true).opacity = 16;
        poly(mid, null, series[s].c, 1.1, false);
        // label straight onto the curve, in the gap between the two
        rich([["y = " + a.toFixed(2) + "x", 0], ["2", 1]],
             xp(3.3), yp(a * 10.89 + 0.5), 5.6, ARIAL, series[s].c, "left", "bottom");
    }
    dot(xp(0), yp(0), 2.4, INK, "#FFFFFF", 0.6);
    txt("V(0, 0)", xp(0) - 3, yp(0) - 3.5, 5.6, ARIAL, INK, "right", "top");

    axes(bx, by, pw, ph, XMIN, XMAX, YMIN, YMAX,
        [[-4, "-4"], [-2, "-2"], [0, "0"], [2, "2"], [4, "4"]],
        [[0, "0"], [2, "2"], [4, "4"], [6, "6"], [8, "8"]],
        "x", "y", P_DROP);
})();

// ============================================================
//  panel d - heatmap + colour bar
// ============================================================
(function panelD() {
    var x0 = PD[0], y0 = PD[1];
    var bx = x0 + 30, by = y0 + P_BOT, ph = P_H;
    var CBW = 9, CBGAP = 5, CBLAB = 16;
    var pw = PW - 30 - CBW - CBGAP - CBLAB;
    panelLetter("d", x0, y0 + TITLE_Y);
    panelTitle("Response matrix", x0 + 16, y0 + TITLE_Y);

    var NC = 9, NR = 6, cw = pw / NC, ch = ph / NR;
    for (var r = 0; r < NR; r++) {
        for (var c = 0; c < NC; c++) {
            var v = 0.5
                + 0.30 * Math.sin((r + 1) * 0.85) * Math.cos((c + 1) * 0.62)
                + 0.08 * Math.sin((r + c) * 1.9)
                + 0.08 * Math.cos((r * 2 + c) * 1.3);
            rect(bx + c * cw, by + (NR - 1 - r) * ch, cw + 0.2, ch + 0.2, "#000000").fillColor = viridis(v);
        }
    }
    rect(bx, by, pw, ph, null, INK, 0.5);
    for (var c2 = 0; c2 < NC; c2++) {
        txt(String(c2 + 1), bx + cw * (c2 + 0.5), by - 4.5, 5.2, ARIAL, GREY, "center", "top");
    }
    for (var r2 = 0; r2 < NR; r2++) {
        txt(String.fromCharCode(65 + r2), bx - 5, by + ch * (NR - 1 - r2 + 0.5), 5.2, ARIAL, GREY, "right", "middle");
    }
    txt("Cluster", bx + pw / 2, by - TICK - P_DROP, 6.6, ARIAL, INK, "center", "top");

    var cbx = bx + pw + CBGAP, STEPS = 140;
    for (var s = 0; s < STEPS; s++) {
        rect(cbx, by + ph * s / STEPS, CBW, ph / STEPS + 0.25, "#000000")
            .fillColor = viridis(s / (STEPS - 1));
    }
    rect(cbx, by, CBW, ph, null, INK, 0.4);
    var ticks = [0, 0.25, 0.5, 0.75, 1];
    for (var k = 0; k < ticks.length; k++) {
        var ty = by + ph * ticks[k];
        poly([[cbx + CBW, ty], [cbx + CBW + 2.5, ty]], null, INK, 0.5, false);
        txt(ticks[k].toFixed(2), cbx + CBW + 4, ty, 5.2, ARIAL, INK, "left", "middle");
    }
    txt("z-score", cbx + CBW / 2, by + ph + 4, 6.2, ARIAL, INK, "center", "bottom");
})();

// ============================================================
//  export
// ============================================================
var folder = new Folder(OUT);
if (!folder.exists) folder.create();

var png = new File(OUT + "nature_style.png");
var po = new ExportOptionsPNG24();
po.antiAliasing = true;
po.transparency = false;
po.artBoardClipping = true;
po.horizontalScale = 300;
po.verticalScale = 300;
doc.exportFile(png, ExportType.PNG24, po);

var svg = new File(OUT + "nature_style.svg");
var so = new ExportOptionsSVG();
so.coordinatePrecision = 3;
doc.exportFile(svg, ExportType.SVG, so);

var ai = new File(OUT + "nature_style.ai");
doc.saveAs(ai, new IllustratorSaveOptions());

"OK | png=" + png.exists + " (" + png.length + "B) | svg=" + svg.exists + " | ai=" + ai.exists;
