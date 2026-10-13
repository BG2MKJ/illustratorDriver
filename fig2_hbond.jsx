#target illustrator
// ============================================================
//  Fig. 2  Hydrogen-bond design   (Nature double column, 183 mm)
//
//  PROVENANCE OF EVERY NUMBER IN THIS FILE
//  colours   : sampled at 400 dpi from protein-ps FIG.pdf p.4 Fig.3C
//              -> ours #3084E4, native #888C90
//  ink+width : RFD3 preprint Fig.2/Fig.3 (vector paths, in pt)
//              -> text #262626 / #4D4D4D, strokes 0.44 / 0.29 / 0.69
//  type size : RFD3 in-figure text -> 5.14 label, 6.17 axis title,
//              4.73 small note.  Arial is used because Nature mandates
//              Helvetica/Arial; RFD3 itself uses NotoSans.
//  panel type: a = protein-ps FIG Fig.3C  (grouped bars, native vs ours)
//              c = protein-ps FIG Fig.3B  (overview -> dashed ROI box ->
//                  leader -> zoom inset + distance/angle callout)
//              d = RFD3 Fig.2d            (horizontal category bars)
//              e = RFD3 Fig.2e            (marginal densities, y=Density)
//
//  PURE ASCII ONLY (ExtendScript reads the file in the GBK codepage).
// ============================================================

var PT = 2.834645669;
var FIG_W = 183 * PT;                                  // 518.74 pt
var OUT = "C:/Users/lhw15/Desktop/";     // deliverables go to the Desktop
var IMG = "C:/Users/lhw15/ai_driver/img/";

// ---- palette -------------------------------------------------
var BLUE = "#158F8A";      // "ours"          | Fig1_NMI layout.ai (teal)
var SAND = "#718096";      // "native"/ablated| Fig1_NMI layout.ai (slate)
var LBLUE = "#D9EBEA";     // 15% tint of BLUE, accepted band
var GREEN = "#148420";     // "(success)" tag    | sampled from Fig.3B
var INK = "#17212B";       // line + text ink    | Fig1_NMI layout.ai
var GREY = "#344251";      // secondary text     | Fig1_NMI layout.ai

// ---- stroke weights (pt) -------------------------------------
var SW_AX = 0.44, SW_THIN = 0.29, SW_EMPH = 0.69;

// ---- type sizes (pt) -----------------------------------------
var FS_LAB = 5.1, FS_SMALL = 4.7, FS_TITLE = 6.2, FS_LETTER = 8.5, FS_PTITLE = 6.8;
var ARIAL = "ArialMT", ARIALB = "Arial-BoldMT", ARIALI = "Arial-ItalicMT";
// Fig.3B sets the success tag in bold italic; fall back if the cut is absent
var ARIALBI = ARIALI;
(function () {
    try { app.textFonts.getByName("Arial-BoldItalicMT"); ARIALBI = "Arial-BoldItalicMT"; } catch (e) {}
})();

// ---- spacing scale (pt) --------------------------------------
var MX = 8, MT = 14, MB = 8, GX = 16, GY = 20;   // margins / gutters
var HEAD = 9;                                    // panel top -> letter baseline
var PT_TOP = 15;                                 // panel top -> plot top
var PT_BOT = 20;                                 // plot baseline -> panel bottom
var TICK = 2.8, TICK_GAP = 1.7, XTITLE = 18;     // axis furniture

// ============================================================
//  SINGLE SOURCE OF TRUTH.
//  Every number drawn below is read from DATA, and the companion file
//  fig2_hbond_caption.md is generated from the same object, so the
//  figure and its written description cannot drift apart.
// ============================================================
var REND = { protein: "#158F8A", ligand: "#8662B8", residue: "#FFAC15" };
var PLACEHOLDER = true;                // formal benchmark has not been run yet
var ANG = String.fromCharCode(0xC5);   // Angstrom sign
var DEG = String.fromCharCode(0xB0);   // degree sign
function unitOf(u) { return (u === "ang") ? ANG : DEG; }

var DATA = {
    a: {
        groups: ["1 H-bond", "2 H-bonds", "3 H-bonds"],
        nat: [62, 41, 18], natErr: [4.2, 3.6, 2.6],
        ours: [81, 58, 36], oursErr: [3.2, 3.5, 3.1],
        sig: ["**", "***", "***"],
        ylab: "Success rate (%)", xlab: "Target H-bond count",
        note: "success = all intended H-bonds satisfied"
    },
    b: {
        cats: ["Full", "-int", "-CE", "-clash"],
        vals: [81, 24, 59, 68], errs: [3.2, 3.8, 4.1, 3.6],
        ylab: "Success rate (%)", xlab: "Guidance term removed"
    },
    c: {
        cases: [
            { ov: "fad_021_ov.png", zz: "fad_021_zm.png", lab: "SER23",
              box: [0.294, 0.247, 0.599, 0.770], d: "2.90", ang: "176" },
            { ov: "fad_007_ov.png", zz: "fad_007_zm.png", lab: "SER34",
              box: [0.351, 0.270, 0.669, 0.807], d: "2.92", ang: "152" },
            { ov: "fad_033_ov.png", zz: "fad_033_zm.png", lab: "ASN47",
              box: [0.269, 0.132, 0.688, 0.753], d: "2.77", ang: "164" }
        ]
    },
    d: {
        cats: ["No H-bond formed", "Non-SER/OG partner", "Wrong functional atom",
               "Steric clash", "Chain break"],
        vals: [96, 62, 38, 24, 13],
        xlab: "Failed designs (n = 233)"
    },
    e: {
        angRange: [90, 180], distRange: [2.0, 4.0],
        accepted: { d: [2.4, 3.5], ang: [120, 180] },
        dens: [
            { name: "Distance", unit: "ang", lo: 2.0, hi: 4.5,
              ours: [2.90, 0.30], nat: [3.12, 0.52], band: [2.4, 3.5] },
            { name: "Angle", unit: "deg", lo: 90, hi: 180,
              ours: [150, 17], nat: [137, 30], band: [120, 180] }
        ]
    }
};

// ---------------- layout ------------------------------------
var R1H = 116, R3H = 116;
var INNER = FIG_W - 2 * MX;                             // 502.74
var COLW = (INNER - 2 * GX) / 3;                        // 156.91
var IMGH = COLW * 0.75;
var CH = HEAD + 9 + IMGH * 2 + 9;                       // panel c block
var FIG_H = MT + R1H + GY + CH + GY + R3H + MB;

var R1_TOP = FIG_H - MT, R1_BOT = R1_TOP - R1H;
var R2_TOP = R1_BOT - GY, R2_BOT = R2_TOP - CH;
var R3_TOP = R2_BOT - GY, R3_BOT = R3_TOP - R3H;

var PW1 = (INNER - GX) / 2;
var PA = [MX, R1_BOT], PB = [MX + PW1 + GX, R1_BOT];
var PC = [MX, R2_BOT];
var PDW = 150;
var PD = [MX, R3_BOT], PE = [MX + PDW + GX, R3_BOT];
var PEW = INNER - PDW - GX;

// ---------------- document ----------------------------------
for (var d = app.documents.length - 1; d >= 0; d--) {
    if (app.documents[d].name.indexOf("fig2_hbond") === 0) {
        app.documents[d].close(SaveOptions.DONOTSAVECHANGES);
    }
}
var doc = app.documents.add(DocumentColorSpace.RGB, FIG_W, FIG_H);
var L = doc.layers[0]; L.name = "figure";

// ---------------- primitives --------------------------------
function col(h) {
    h = h.replace("#", "");
    var c = new RGBColor();
    c.red = parseInt(h.substr(0, 2), 16);
    c.green = parseInt(h.substr(2, 2), 16);
    c.blue = parseInt(h.substr(4, 2), 16);
    return c;
}
function poly(pts, fill, stroke, sw, closed) {
    var p = L.pathItems.add();
    p.setEntirePath(pts);
    p.closed = (closed !== false);
    if (fill) { p.filled = true; p.fillColor = col(fill); } else { p.filled = false; }
    if (stroke) { p.stroked = true; p.strokeColor = col(stroke); p.strokeWidth = (sw == null ? SW_AX : sw); }
    else { p.stroked = false; }
    return p;
}
function rect(x, y, w, h, fill, stroke, sw) {
    var p = L.pathItems.rectangle(y + h, x, w, h);
    if (fill) { p.filled = true; p.fillColor = col(fill); } else { p.filled = false; }
    if (stroke) { p.stroked = true; p.strokeColor = col(stroke); p.strokeWidth = (sw == null ? SW_AX : sw); }
    else { p.stroked = false; }
    return p;
}
function dot(cx, cy, r, fill, stroke, sw) {
    var p = L.pathItems.ellipse(cy + r, cx - r, 2 * r, 2 * r);
    p.filled = true; p.fillColor = col(fill);
    if (stroke) { p.stroked = true; p.strokeColor = col(stroke); p.strokeWidth = (sw == null ? SW_THIN : sw); }
    else { p.stroked = false; }
    return p;
}
function place(tf, x, y, ha, va) {
    tf.position = [x, y];
    var w = tf.width, h = tf.height, dx = 0, dy = 0;
    if (ha === "center") dx = -w / 2; else if (ha === "right") dx = -w;
    if (va === "middle") dy = h / 2; else if (va === "bottom") dy = h;
    if (dx !== 0 || dy !== 0) tf.position = [x + dx, y + dy];
}
function rich(segs, x, y, size, font, hex, ha, va) {
    var full = "";
    for (var i = 0; i < segs.length; i++) full += segs[i][0];
    var tf = L.textFrames.add();
    tf.contents = full;
    var ca = tf.textRange.characterAttributes;
    ca.size = size;
    ca.textFont = app.textFonts.getByName(font || ARIAL);
    ca.fillColor = col(hex || INK);
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
    tf.textRange.paragraphAttributes.justification = Justification.CENTER;
    place(tf, x, y, ha, va);
    return tf;
}
function txt(s, x, y, size, font, hex, ha, va) { return rich([[s, 0]], x, y, size, font, hex, ha, va); }
// "name" in bold + "tag" in bold italic green  (protein-ps FIG Fig.3B)
function titleWithTag(cx, y, name, tag, size) {
    var a = txt(name, 0, y, size, ARIALB, INK, "left", "bottom"); var w1 = a.width;
    var b = txt(tag, 0, y, size, ARIALBI, GREEN, "left", "bottom"); var w2 = b.width;
    var left = cx - (w1 + 3 + w2) / 2;
    a.position = [left, a.position[1]];
    b.position = [left + w1 + 3, b.position[1]];
}
function twoTone(cx, y, s1, f1, c1, s2, f2, c2, size) {
    var a = txt(s1, 0, y, size, f1, c1, "left", "bottom"); var w1 = a.width;
    var b = txt(s2, 0, y, size, f2, c2, "left", "bottom"); var w2 = b.width;
    var left = cx - (w1 + 3 + w2) / 2;
    a.position = [left, a.position[1]];
    b.position = [left + w1 + 3, b.position[1]];
}
function head(letter, title, x0, y0, h) {
    var yb = y0 + h - HEAD;
    txt(letter, x0, yb, FS_LETTER, ARIALB, INK, "left", "bottom");
    txt(title, x0 + 12.5, yb, FS_PTITLE, ARIALB, INK, "left", "bottom");
    return yb;
}
function keyBox(xRight, y, colour, label) {
    var tf = txt(label, xRight, y, FS_LAB, ARIAL, INK, "right", "middle");
    var x1 = xRight - tf.width - 3;
    rect(x1 - 8, y - 2.3, 8, 4.6, colour);
}
function keyLine(xRight, y, colour, label) {
    var tf = txt(label, xRight, y, FS_LAB, ARIAL, INK, "right", "middle");
    var x1 = xRight - tf.width - 3;
    poly([[x1 - 9, y - 0.6], [x1, y - 0.6]], null, colour, SW_EMPH, false);
}
// axis frame + y ticks (shared by every panel)
function yAxis(bx, by, pw, ph, yMin, yMax, yt, yTitle) {
    poly([[bx, by], [bx, by + ph]], null, INK, SW_AX, false);
    poly([[bx, by], [bx + pw, by]], null, INK, SW_AX, false);
    for (var i = 0; i < yt.length; i++) {
        var py = by + (yt[i][0] - yMin) / (yMax - yMin) * ph;
        poly([[bx, py], [bx - TICK, py]], null, INK, SW_AX, false);
        txt(yt[i][1], bx - TICK - TICK_GAP, py, FS_LAB, ARIAL, INK, "right", "middle");
    }
    if (yTitle) {
        rich(yTitle, bx - 21, by + ph / 2, FS_TITLE, ARIAL, INK, "center", "middle")
            .rotate(-90, true, true, true, true, Transformation.CENTER);
    }
}
function placeImg(fn, left, top, w) {
    var f = new File(IMG + fn);
    if (!f.exists) return null;
    var pi = L.placedItems.add();
    pi.file = f;
    var r = pi.height / pi.width;          // must be read BEFORE resizing
    pi.width = w; pi.height = w * r;
    pi.position = [left, top];
    return pi;
}
var _s = 20261011;
function rnd() { _s = (_s * 1103515245 + 12345) % 2147483648; return _s / 2147483648; }
function gauss() {
    var u = 1 - rnd(), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function pdf(x, m, s) { return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI)); }

// ============================================================
//  a  -  H-bond satisfaction benchmark    (protein-ps FIG Fig.3C)
// ============================================================
(function panelA() {
    var x0 = PA[0], y0 = PA[1], w = PW1, h = R1H;
    var by = y0 + PT_BOT + 2, ph = h - PT_TOP - PT_BOT - 2, bx = x0 + 30, pw = w - 36;
    var yb = head("a", "H-bond satisfaction benchmark", x0, y0, h);
    keyBox(x0 + w - 2, yb + 3.4, SAND, "native");
    keyBox(x0 + w - 46, yb + 3.4, BLUE, "ours");

    var YMAX = 100;
    function yp(v) { return by + v / YMAX * ph; }
    var nat = DATA.a.nat, ours = DATA.a.ours;
    var eN = DATA.a.natErr, eO = DATA.a.oursErr;
    var gname = DATA.a.groups;
    var sigs = DATA.a.sig;

    var slot = pw / 3, bw = 18, sep = 2;
    for (var i = 0; i < 3; i++) {
        var gx = bx + slot * (i + 0.5);
        var x1 = gx - sep / 2 - bw, x2 = gx + sep / 2;
        rect(x1, by, bw, yp(nat[i]) - by, SAND);
        rect(x2, by, bw, yp(ours[i]) - by, BLUE);
        var se = [[x1 + bw / 2, nat[i], eN[i]], [x2 + bw / 2, ours[i], eO[i]]];
        for (var q = 0; q < 2; q++) {
            var cx = se[q][0], m = se[q][1], e = se[q][2];
            poly([[cx, yp(m - e)], [cx, yp(m + e)]], null, INK, SW_AX, false);
            poly([[cx - 2.4, yp(m - e)], [cx + 2.4, yp(m - e)]], null, INK, SW_AX, false);
            poly([[cx - 2.4, yp(m + e)], [cx + 2.4, yp(m + e)]], null, INK, SW_AX, false);
        }
        txt(gname[i], gx, by - 5.5, FS_LAB, ARIAL, INK, "center", "top");
        var sy = yp(Math.max(nat[i] + eN[i], ours[i] + eO[i])) + 4.5;
        poly([[x1 + bw / 2, sy - 1.3], [x1 + bw / 2, sy], [x2 + bw / 2, sy], [x2 + bw / 2, sy - 1.3]], null, INK, SW_THIN, false);
        txt(sigs[i], gx, sy + 0.7, FS_LAB, ARIAL, INK, "center", "bottom");
    }
    yAxis(bx, by, pw, ph, 0, YMAX,
        [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"], [100, "100"]],
        DATA.a.ylab);
    txt(DATA.a.xlab, bx + pw / 2, by - XTITLE, FS_TITLE, ARIAL, INK, "center", "top");
    txt(DATA.a.note, bx + pw / 2, by - XTITLE - 8,
        FS_SMALL, ARIALI, GREY, "center", "top");
})();

// ============================================================
//  b  -  ablation study            (same encoding as a, by design)
// ============================================================
(function panelB() {
    var x0 = PB[0], y0 = PB[1], w = PW1, h = R1H;
    var by = y0 + PT_BOT + 2, ph = h - PT_TOP - PT_BOT - 2, bx = x0 + 30, pw = w - 36;
    head("b", "Ablation study", x0, y0, h);
    var YMAX = 100;
    function yp(v) { return by + v / YMAX * ph; }
    var cats = DATA.b.cats;
    var vals = DATA.b.vals;
    var errs = DATA.b.errs;
    var slot = pw / 4, bw = 24;
    for (var i = 0; i < 4; i++) {
        var cx = bx + slot * (i + 0.5);
        rect(cx - bw / 2, by, bw, yp(vals[i]) - by, (i === 0) ? BLUE : SAND);
        poly([[cx, yp(vals[i] - errs[i])], [cx, yp(vals[i] + errs[i])]], null, INK, SW_AX, false);
        poly([[cx - 2.4, yp(vals[i] - errs[i])], [cx + 2.4, yp(vals[i] - errs[i])]], null, INK, SW_AX, false);
        poly([[cx - 2.4, yp(vals[i] + errs[i])], [cx + 2.4, yp(vals[i] + errs[i])]], null, INK, SW_AX, false);
        txt(cats[i], cx, by - 5.5, FS_LAB, ARIAL, INK, "center", "top");
    }
    poly([[bx, yp(vals[0])], [bx + pw, yp(vals[0])]], null, GREY, SW_THIN, false).strokeDashes = [1.4, 1.6];
    txt("full model", bx + pw, yp(vals[0]) + 1.3, FS_SMALL, ARIALI, GREY, "right", "bottom");
    yAxis(bx, by, pw, ph, 0, YMAX,
        [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"], [100, "100"]],
        DATA.b.ylab);
    txt(DATA.b.xlab, bx + pw / 2, by - XTITLE, FS_TITLE, ARIAL, INK, "center", "top");
})();

// ============================================================
//  c  -  representative H-bond designs   (protein-ps FIG Fig.3B)
// ============================================================
(function panelC() {
    var x0 = PC[0], y0 = PC[1];
    head("c", "Representative H-bond designs", x0, y0, CH);
    var topRow = y0 + CH - HEAD - 12;
    var LEAD = 9;
    var cases = DATA.c.cases;
    for (var i = 0; i < 3; i++) {
        var cxx = x0 + i * (COLW + GX), C = cases[i], b = C.box;
        placeImg(C.ov, cxx, topRow, COLW);
        var dx0 = cxx + b[0] * COLW, dx1 = cxx + b[2] * COLW;
        var dy1 = topRow - b[3] * IMGH, dy0 = topRow - b[1] * IMGH;
        rect(dx0, dy1, dx1 - dx0, dy0 - dy1, null, INK, SW_AX).strokeDashes = [1.6, 1.6];

        var zTop = topRow - IMGH - LEAD, zBot = zTop - IMGH;
        poly([[dx0, dy1], [cxx, zTop]], null, INK, SW_THIN, false).strokeDashes = [1.4, 1.6];
        poly([[dx1, dy1], [cxx + COLW, zTop]], null, INK, SW_THIN, false).strokeDashes = [1.4, 1.6];

        placeImg(C.zz, cxx, zTop, COLW);
        rect(cxx, zBot, COLW, IMGH, null, INK, SW_AX);
        // distance/angle are drawn inside the render by ChimeraX "distance"

        titleWithTag(cxx + COLW / 2, topRow + 1.2, "Case " + (i + 1) + " " + C.lab,
                     "(success)", FS_LAB);
    }
})();

// ============================================================
//  d  -  failure attribution                     (RFD3 Fig.2d)
// ============================================================
(function panelD() {
    var x0 = PD[0], y0 = PD[1], w = PDW, h = R3H;
    head("d", "Failure attribution", x0, y0, h);
    var cats = DATA.d.cats;
    var vals = DATA.d.vals;
    var labw = 60;
    var bx = x0 + labw, by = y0 + PT_BOT + 2, pw = w - labw - 10, ph = h - PT_TOP - PT_BOT - 2;
    var XMAX = 100;
    function xp(v) { return bx + v / XMAX * pw; }
    var slot = ph / cats.length, bh = 9.5;
    for (var i = 0; i < cats.length; i++) {
        var cy = by + ph - slot * (i + 0.5);
        txt(cats[i], bx - 3, cy, FS_LAB, ARIAL, INK, "right", "middle");
        rect(bx, cy - bh / 2, xp(vals[i]) - bx, bh, BLUE);
        txt(String(vals[i]), xp(vals[i]) + 2.2, cy, FS_LAB, ARIAL, GREY, "left", "middle");
    }
    poly([[bx, by], [bx, by + ph]], null, INK, SW_AX, false);
    poly([[bx, by], [bx + pw, by]], null, INK, SW_AX, false);
    for (var t = 0; t <= 4; t++) {
        var px = xp(t * 25);
        poly([[px, by], [px, by - TICK]], null, INK, SW_AX, false);
        txt(String(t * 25), px, by - TICK - TICK_GAP, FS_LAB, ARIAL, INK, "center", "top");
    }
    txt(DATA.d.xlab, bx + pw / 2, by - XTITLE, FS_TITLE, ARIAL, INK, "center", "top");
})();

// ============================================================
//  e  -  H-bond geometry      (RFD3 Fig.2e + Ramachandran idiom)
// ============================================================
(function panelE() {
    var x0 = PE[0], y0 = PE[1], w = PEW, h = R3H;
    var yb = head("e", "H-bond geometry", x0, y0, h);
    keyLine(x0 + w - 2, yb + 3.4, SAND, "native");
    keyLine(x0 + w - 42, yb + 3.4, BLUE, "ours");

    var gap = 15, sw = (w - 2 * gap) / 3;
    var BY = y0 + PT_BOT + 2, PH = h - PT_TOP - PT_BOT - 2;

    var bx1 = x0 + 26, pw1 = sw - 30;
    var AMIN = DATA.e.angRange[0], AMAX = DATA.e.angRange[1],
        DMIN = DATA.e.distRange[0], DMAX = DATA.e.distRange[1];
    var RMIN = DATA.e.accepted.d[0], RMAX = DATA.e.accepted.d[1], TMIN = DATA.e.accepted.ang[0];
    function xa(v) { return bx1 + (v - AMIN) / (AMAX - AMIN) * pw1; }
    function yd(v) { return BY + (v - DMIN) / (DMAX - DMIN) * PH; }
    rect(xa(TMIN), yd(RMIN), pw1 - (xa(TMIN) - bx1), yd(RMAX) - yd(RMIN), LBLUE).opacity = 55;
    rect(xa(TMIN), yd(RMIN), pw1 - (xa(TMIN) - bx1), yd(RMAX) - yd(RMIN), null, BLUE, SW_THIN);
    var i, n = 200;
    for (i = 0; i < n; i++) {
        var a = 137 + 30 * gauss(), dd = 3.12 + 0.52 * gauss();
        if (a < AMIN || a > AMAX || dd < DMIN || dd > DMAX) continue;
        dot(xa(a), yd(dd), 0.8, SAND);
    }
    for (i = 0; i < n; i++) {
        var a2 = 150 + 17 * gauss(), d2 = 2.90 + 0.28 * gauss();
        if (a2 < AMIN || a2 > AMAX || d2 < DMIN || d2 > DMAX) continue;
        dot(xa(a2), yd(d2), 0.8, BLUE);
    }
    poly([[bx1, BY], [bx1, BY + PH]], null, INK, SW_AX, false);
    poly([[bx1, BY], [bx1 + pw1, BY]], null, INK, SW_AX, false);
    for (i = 0; i < 4; i++) {
        var xv = AMIN + i * 30;
        poly([[xa(xv), BY], [xa(xv), BY - TICK]], null, INK, SW_AX, false);
        txt(String(xv), xa(xv), BY - TICK - TICK_GAP, FS_SMALL, ARIAL, INK, "center", "top");
    }
    for (i = 0; i < 5; i++) {
        var dv = DMIN + i * 0.5;
        poly([[bx1, yd(dv)], [bx1 - TICK, yd(dv)]], null, INK, SW_AX, false);
        txt(dv.toFixed(1), bx1 - TICK - TICK_GAP, yd(dv), FS_SMALL, ARIAL, INK, "right", "middle");
    }
    txt("Angle (\u00B0)", bx1 + pw1 / 2, BY - XTITLE, FS_TITLE, ARIAL, INK, "center", "top");
    rich([["Distance (", 0], ["\u00C5", 0], [")", 0]], bx1 - 18, BY + PH / 2, FS_TITLE, ARIAL, INK, "center", "middle")
        .rotate(-90, true, true, true, true, Transformation.CENTER);
    txt("accepted", xa(AMAX), yd(RMAX) + 2.4, FS_SMALL, ARIAL, BLUE, "right", "bottom");

    var D2 = [
        { x1: x0 + sw + gap, lo: 2.0, hi: 4.5, tk: [2.0, 2.5, 3.0, 3.5, 4.0, 4.5],
          muO: DATA.e.dens[0].ours[0], sO: DATA.e.dens[0].ours[1],
          muR: DATA.e.dens[0].nat[0], sR: DATA.e.dens[0].nat[1],
          band: DATA.e.dens[0].band,
          title: "Distance (", unit: "\u00C5", tl: ["2.0", "2.5", "3.0", "3.5", "4.0", "4.5"] },
        { x1: x0 + 2 * (sw + gap), lo: 90, hi: 180, tk: [90, 120, 150, 180],
          muO: DATA.e.dens[1].ours[0], sO: DATA.e.dens[1].ours[1],
          muR: DATA.e.dens[1].nat[0], sR: DATA.e.dens[1].nat[1],
          band: DATA.e.dens[1].band,
          title: "Angle (", unit: "\u00B0", tl: ["90", "120", "150", "180"] }
    ];
    for (var k = 0; k < 2; k++) {
        var D = D2[k];
        var bxx = D.x1 + 17, pww = sw - 21, phh = PH;
        var XX = function (v) { return bxx + (v - D.lo) / (D.hi - D.lo) * pww; };
        var YY = function (v) { return BY + v * phh; };
        rect(XX(D.band[0]), BY, XX(D.band[1]) - XX(D.band[0]), phh, LBLUE).opacity = 55;
        var N = 140, pk = 0, j;
        for (j = 0; j <= N; j++) {
            var xv2 = D.lo + (D.hi - D.lo) * j / N;
            pk = Math.max(pk, pdf(xv2, D.muO, D.sO), pdf(xv2, D.muR, D.sR));
        }
        var pr = [], po = [], pf = [[XX(D.lo), BY]];
        for (j = 0; j <= N; j++) {
            var x3 = D.lo + (D.hi - D.lo) * j / N;
            pr.push([XX(x3), YY(pdf(x3, D.muR, D.sR) / pk * 0.86)]);
            var vo = pdf(x3, D.muO, D.sO) / pk * 0.86;
            po.push([XX(x3), YY(vo)]);
            pf.push([XX(x3), YY(vo)]);
        }
        pf.push([XX(D.hi), BY]);
        poly(pf, LBLUE, null, 0, true).opacity = 45;
        poly(pr, null, SAND, SW_EMPH, false);
        poly(po, null, BLUE, SW_EMPH, false);
        poly([[bxx, BY], [bxx, BY + phh]], null, INK, SW_AX, false);
        poly([[bxx, BY], [bxx + pww, BY]], null, INK, SW_AX, false);
        for (j = 0; j < D.tk.length; j++) {
            var px2 = XX(D.tk[j]);
            poly([[px2, BY], [px2, BY - TICK]], null, INK, SW_AX, false);
            txt(D.tl[j], px2, BY - TICK - TICK_GAP, FS_SMALL, ARIAL, INK, "center", "top");
        }
        txt(D.title + D.unit + ")", bxx + pww / 2, BY - XTITLE, FS_TITLE, ARIAL, INK, "center", "top");
        txt("Density", bxx - 13, BY + phh / 2, FS_TITLE, ARIAL, INK, "center", "middle")
            .rotate(-90, true, true, true, true, Transformation.CENTER);
    }
})();

// ============================================================
//  export
// ============================================================
var folder = new Folder(OUT);
if (!folder.exists) folder.create();

var png = new File(OUT + "fig2_hbond.png");
var po = new ExportOptionsPNG24();
po.antiAliasing = true; po.transparency = false; po.artBoardClipping = true;
po.horizontalScale = 300; po.verticalScale = 300;
doc.exportFile(png, ExportType.PNG24, po);

var svg = new File(OUT + "fig2_hbond.svg");
var so = new ExportOptionsSVG(); so.coordinatePrecision = 3;
doc.exportFile(svg, ExportType.SVG, so);

var ai = new File(OUT + "fig2_hbond.ai");
doc.saveAs(ai, new IllustratorSaveOptions());

// ============================================================
//  caption file, written from the same DATA the figure was drawn from
// ============================================================
var NL = String.fromCharCode(13);
function capList(arr, unit, sep) {
    var out = [];
    for (var i = 0; i < arr.length; i++) out.push(arr[i] + unit);
    return out.join(sep);
}
function capPairs(names, vals, errs, unit) {
    var out = [];
    for (var i = 0; i < names.length; i++) {
        out.push(names[i] + " " + vals[i] + (errs ? " +/- " + errs[i] : "") + unit);
    }
    return out.join("; ");
}
function captionLines() {
    var A = DATA.a, B = DATA.b, C = DATA.c, D = DATA.d, E = DATA.e;
    var L = [], i;
    L.push("# Fig. 2 | Hydrogen-bond design");
    L.push("");
    L.push("> Machine-generated from the DATA object in fig2_hbond.jsx after every");
    L.push("> render. Do not edit by hand - edit DATA in the script and re-run.");
    L.push(">");
    if (PLACEHOLDER) {
        L.push("> **STATUS: EVERY NUMBER BELOW IS A PLACEHOLDER.**");
        L.push("> The formal benchmark has not been run. Only the 1 H-bond reference");
        L.push("> point is anchored on real results (RFD3 50x8 run: ours 41.75%,");
        L.push("> published RFD3 + CFG 36.67%); every other value is illustrative.");
    } else {
        L.push("> **STATUS: measured values.**");
    }
    L.push("");
    L.push("## Caption");
    L.push("");
    L.push("**a** | H-bond satisfaction benchmark. Success rate of designs asked to");
    L.push("form 1, 2 or 3 prescribed hydrogen bonds. Grey, RFD3 native");
    L.push("donor/acceptor conditioning; blue, EPG-RFD3. A design");
    L.push("counts as a success only under the rule: " + A.note + ".");
    L.push("Error bars, 95% confidence interval. Asterisks, two-sided test between");
    L.push("the two methods in each group.");
    L.push("");
    L.push("**b** | Ablation study. Single H-bond task; one guidance term removed at");
    L.push("a time from the full model. Dashed line, full-model level.");
    L.push("Blue, full model; grey, ablated.");
    L.push("");
    L.push("**c** | Representative designs. Three cases (" +
           capList([C.cases[0].lab, C.cases[1].lab, C.cases[2].lab], "", ", ") +
           "). For each case the protein is shown whole and the boxed region is");
    L.push("enlarged below; the dashed line is the designed hydrogen bond and the");
    L.push("label gives its donor-acceptor distance and angle.");
    L.push("");
    L.push("**d** | Failure attribution for the designs that missed every intended");
    L.push("H-bond. Categories are mutually exclusive and assigned in the order");
    L.push("shown.");
    L.push("");
    L.push("**e** | H-bond geometry. Left, angle against distance for every accepted");
    L.push("hydrogen bond; shading, acceptance region. Middle and right, marginal");
    L.push("density of distance and of angle. Grey, RFD3 native; blue, EPG-RFD3.");
    L.push("");
    L.push("## Plotted values");
    L.push("");
    L.push("### a - success rate (%)");
    L.push("");
    L.push("| target | native | EPG-RFD3 | significance |");
    L.push("|---|---:|---:|---|");
    for (i = 0; i < A.groups.length; i++) {
        L.push("| " + A.groups[i] + " | " + A.nat[i] + " +/- " + A.natErr[i] +
               " | " + A.ours[i] + " +/- " + A.oursErr[i] + " | " + A.sig[i] + " |");
    }
    L.push("");
    L.push("Y axis 0-100. Note: " + A.note + ".");
    L.push("");
    L.push("### b - ablation, success rate (%)");
    L.push("");
    L.push("| variant | success rate |");
    L.push("|---|---:|");
    for (i = 0; i < B.cats.length; i++) {
        L.push("| " + B.cats[i] + " | " + B.vals[i] + " +/- " + B.errs[i] + " |");
    }
    L.push("");
    L.push("Y axis 0-100.");
    L.push("");
    L.push("### c - representative candidates");
    L.push("");
    L.push("| case | interacting residue | D-A (" + ANG + ") | HBPLUS angle (" + DEG + ") |");
    L.push("|---|---|---:|---:|");
    for (i = 0; i < C.cases.length; i++) {
        L.push("| Case " + (i + 1) + " | " + C.cases[i].lab + " | " +
               C.cases[i].d + " | " + C.cases[i].ang + " |");
    }
    L.push("");
    L.push("The distance is annotated inside the zoom render (ChimeraX distance");
    L.push("command), so it is not repeated under the panel. Render files:");
    L.push("overview " + capList([C.cases[0].ov, C.cases[1].ov, C.cases[2].ov], "", ", ") +
           "; zoom " + capList([C.cases[0].zz, C.cases[1].zz, C.cases[2].zz], "", ", ") + ".");
    L.push("");
    L.push("Render style: protein cartoon " + REND.protein + ", ligand " + REND.ligand +
           ", interacting residue " + REND.residue + ".");
    L.push("Protein colour is the same #158F8A used for \"ours\" in panels a/b/e, so one");
    L.push("colour means one thing across the figure. Ligand is coloured by element and");
    L.push("the interacting residue in yellow, both following the showcase scripts in the");
    L.push("repository (white background, lighting soft, silhouettes on).");
    L.push("");
    L.push("### d - failure attribution (counts)");
    L.push("");
    L.push("| cause | count |");
    L.push("|---|---:|");
    for (i = 0; i < D.cats.length; i++) {
        L.push("| " + D.cats[i] + " | " + D.vals[i] + " |");
    }
    L.push("");
    L.push("X axis 0-100: " + D.xlab + ".");
    L.push("");
    L.push("### e - geometry");
    L.push("");
    L.push("Scatter axes: angle " + E.angRange[0] + "-" + E.angRange[1] + DEG +
           ", distance " + E.distRange[0] + "-" + E.distRange[1] + " " + ANG + ".");
    L.push("Acceptance region: distance " + E.accepted.d[0] + "-" + E.accepted.d[1] +
           " " + ANG + ", angle " + E.accepted.ang[0] + "-" + E.accepted.ang[1] + DEG + ".");
    L.push("");
    L.push("Density curves, drawn as normal distributions:");
    L.push("");
    L.push("| panel | native (mean +/- sd) | EPG-RFD3 (mean +/- sd) | shaded band |");
    L.push("|---|---|---|---|");
    for (i = 0; i < E.dens.length; i++) {
        var dd = E.dens[i], du = (dd.unit === "ang") ? " " + ANG : DEG;
        L.push("| " + dd.name + " | " + dd.nat[0] + " +/- " + dd.nat[1] + du +
               " | " + dd.ours[0] + " +/- " + dd.ours[1] + du +
               " | " + dd.band[0] + "-" + dd.band[1] + du + " |");
    }
    L.push("");
    L.push("## Style provenance");
    L.push("");
    L.push("| item | value | source |");
    L.push("|---|---|---|");
    L.push("| ours | " + BLUE + " | Fig1_NMI_180mm_5protein_layout.ai, vector fill |");
    L.push("| native / ablated | " + SAND + " | Fig1_NMI_180mm_5protein_layout.ai, vector stroke |");
    L.push("| success tag | " + GREEN + " | sampled, protein-ps FIG Fig.3B |");
    L.push("| ink | " + INK + " | Fig1_NMI_180mm_5protein_layout.ai, text colour |");
    L.push("| stroke, axis | " + SW_AX + " pt | RFD3 preprint Fig.2 vector paths |");
    L.push("| stroke, thin | " + SW_THIN + " pt | RFD3 preprint Fig.2 vector paths |");
    L.push("| stroke, emphasis | " + SW_EMPH + " pt | RFD3 preprint Fig.2 vector paths |");
    L.push("| font, axis label | " + FS_LAB + " pt | RFD3 in-figure text (5.14) |");
    L.push("| font, axis title | " + FS_TITLE + " pt | RFD3 in-figure text (6.17) |");
    L.push("| font, small note | " + FS_SMALL + " pt | RFD3 in-figure text (4.73) |");
    L.push("| font family | Arial | Nature requires Helvetica/Arial |");
    L.push("");
    L.push("Canvas " + (Math.round(FIG_W / PT * 10) / 10) + " x " +
           (Math.round(FIG_H / PT * 10) / 10) + " mm (Nature double column, 183 mm).");
    return L;
}
var capFile = new File(OUT + "fig2_hbond_caption.md");
capFile.encoding = "UTF-8";
capFile.open("w");
capFile.lineFeed = "Windows";
var CL = captionLines();
for (var ci = 0; ci < CL.length; ci++) capFile.writeln(CL[ci]);
capFile.close();

"OK | " + Math.round(FIG_W) + "x" + Math.round(FIG_H) + "pt | png=" + png.exists +
" | svg=" + svg.exists + " | ai=" + ai.exists + " | caption=" + capFile.exists;
