#target illustrator
// ============================================================
//  Fig. 1  ProteinPS guidance framework   (Nature double column, 183 mm)
//
//  PROVENANCE
//  panel a : the two molecular renders are the ORIGINAL artwork,
//            extracted unchanged from Fig1_NMI_180mm_5protein_layout.ai
//            (assets/p1_x12009.png, assets/p1_x12988.png). Their blue
//            #006BD4 / orange #FFAC15 legend colours are the original
//            vector fills from that file.
//  panel b : redrawn as vector; every box caption and every formula is
//            taken verbatim from the text layer of the original .ai.
//  panel c : REAL data, read at run time from
//            data/fig1_energy/energy_trajectories.csv
//            (12 samples x 199 denoising steps, rc1 config).
//            y is log10 because the span is 123x (README of that set).
//  type/ink : same measured constants as fig2_hbond.jsx.
//  PURE ASCII ONLY (ExtendScript reads the file in the GBK codepage).
// ============================================================

var PT = 2.834645669;
var FIG_W = 183 * PT;                                  // 518.74 pt
var DIR  = "C:/Users/lhw15/Desktop/fig1/";
var ASSET = DIR + "assets/";
var CSV  = DIR + "data/fig1_energy/fig1_objective_terms.csv";

// ---- palette (from Desktop/Fig1_NMI_180mm_5protein_layout.ai) ----
var TEAL = "#158F8A", PURPLE = "#8662B8", AMBER = "#FFAC15";
var SLATE = "#718096", INK = "#17212B", GREY = "#344251", HAIR = "#C9D2D8";
var BLUEL = "#006BD4", ORANGEL = "#FFAC15";            // panel-a legend, original fills
var LTINT = "#F2EEF8";                                 // 15% tint of PURPLE

var SW_AX = 0.44, SW_THIN = 0.29, SW_EMPH = 0.69;
var FS_LAB = 5.1, FS_SMALL = 4.7, FS_TITLE = 6.2, FS_LETTER = 8.5, FS_PTITLE = 6.8;
var ARIAL = "ArialMT", ARIALB = "Arial-BoldMT", ARIALI = "Arial-ItalicMT";
var ANG = String.fromCharCode(0xC5), DEG = String.fromCharCode(0xB0);

// ---- layout -------------------------------------------------
var MX = 8, MT = 14, MB = 8, GX = 18, GY = 18;
var ROW1H = 205, ROW2H = 162, ROW3H = 158;
var INNER = FIG_W - 2 * MX;
var FIG_H = MT + ROW1H + GY + ROW2H + GY + ROW3H + MB;
var AW = 262, CW = INNER - AW - GX;
var PD = [MX, MB];
var PB = [MX, MB + ROW3H + GY];
var PA = [MX, MB + ROW3H + GY + ROW2H + GY];
var PC = [MX + AW + GX, PA[1]];

// ============================================================
//  data
// ============================================================
var SAMPLES = [];        // [{task,lig,hit,ce:{step:val},geo:[],clash:[],wg:[],wc:[],wt:[]}]
(function readCSV() {
    var f = new File(CSV);
    if (!f.exists) { return; }
    f.encoding = "UTF-8";
    f.open("r");
    var hdr = f.readln().split(",");
    var ix = {};
    for (var h = 0; h < hdr.length; h++) ix[hdr[h]] = h;
    var byId = {};
    while (!f.eof) {
        var line = f.readln();
        if (!line) continue;
        var c = line.split(",");
        if (c.length < 14) continue;
        var id = c[ix["sample"]];
        if (!(id in byId)) {
            byId[id] = SAMPLES.length;
            SAMPLES.push({ task: c[ix["task"]], lig: c[ix["ligand"]], hit: parseInt(c[ix["hit"]], 10),
                           ce: {}, geo: [], clash: [], wg: [], wc: [], wt: [] });
        }
        var S = SAMPLES[byId[id]], st = parseInt(c[ix["step"]], 10);
        var v = c[ix["L_type_sequence"]].replace(/\s/g, "");
        if (v !== "") S.ce[st] = parseFloat(v);
        S.geo.push(parseFloat(c[ix["E_geometry"]]));
        S.clash.push(parseFloat(c[ix["E_clash"]]));
        S.wg.push(parseFloat(c[ix["w_geometry"]]));
        S.wc.push(parseFloat(c[ix["w_clash"]]));
        S.wt.push(parseFloat(c[ix["w_type"]]));
    }
    f.close();
})();
var NHIT = 0, NMISS = 0, i2;
for (i2 = 0; i2 < SAMPLES.length; i2++) { if (SAMPLES[i2].hit) NHIT++; else NMISS++; }
function log10(v) { return Math.log(v) / Math.LN10; }
function smooth(a, w) {
    var out = [], n = a.length, h = Math.floor(w / 2);
    for (var i = 0; i < n; i++) {
        var lo = Math.max(0, i - h), hi = Math.min(n - 1, i + h), s = 0, c = 0;
        for (var j = lo; j <= hi; j++) { s += a[j]; c++; }
        out.push(s / c);
    }
    return out;
}

// ============================================================
//  document
// ============================================================
for (var d = app.documents.length - 1; d >= 0; d--) {
    if (app.documents[d].name.indexOf("fig1_proteinps") === 0) {
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
function head(letter, title, x0, y0, h) {
    var yb = y0 + h - 9;
    txt(letter, x0, yb, FS_LETTER, ARIALB, INK, "left", "bottom");
    txt(title, x0 + 12.5, yb, FS_PTITLE, ARIALB, INK, "left", "bottom");
    return yb;
}
function placeImg(fn, left, top, w) {
    var f = new File(ASSET + fn);
    if (!f.exists) return null;
    var pi = L.placedItems.add();
    pi.file = f;
    var r = pi.height / pi.width;
    pi.width = w; pi.height = w * r;
    pi.position = [left, top];
    try { pi.embed(); } catch (e) {}
    return pi;
}
function leader(x1, y1, x2, y2) {
    poly([[x1, y1], [x2, y2]], null, GREY, SW_THIN, false);
    dot(x2, y2, 0.7, GREY);
}
function dot(cx, cy, r, fill) {
    var p = L.pathItems.ellipse(cy + r, cx - r, 2 * r, 2 * r);
    p.filled = true; p.fillColor = col(fill); p.stroked = false;
    return p;
}
function arrow(x1, y, x2, colour) {
    poly([[x1, y], [x2 - 3, y]], null, colour || SLATE, SW_EMPH, false);
    poly([[x2, y], [x2 - 4.2, y + 1.9], [x2 - 4.2, y - 1.9]], colour || SLATE, colour || SLATE, 0, true);
}

// ============================================================
//  a  -  representative disulfide-design task
// ============================================================
(function panelA() {
    var x0 = PA[0], y0 = PA[1], w = AW, h = ROW1H;
    var yb = head("a", "Representative disulfide-design task", x0, y0, h);
    // legend: the original vector fills for these two swatches
    var lx = x0 + w - 4;
    var t2 = txt("target molecule", lx, yb + 3.4, FS_LAB, ARIAL, GREY, "right", "middle");
    var s2 = lx - t2.width - 3;
    rect(s2 - 8, yb + 1.1, 8, 4.6, ORANGEL);
    var t1 = txt("protein scaffold", s2 - 10, yb + 3.4, FS_LAB, ARIAL, GREY, "right", "middle");
    var s1 = s2 - 10 - t1.width - 3;
    rect(s1 - 8, yb + 1.1, 8, 4.6, BLUEL);

    var bandB = y0 + 12, bandT = y0 + h - 28;
    // molecule (square) on the left
    var mw = 66, mx = x0 + 8, my = bandB + (bandT - bandB - mw) / 2;
    placeImg("p1_x12988.png", mx, my + mw, mw);
    // arrow
    arrow(mx + mw + 8, my + mw / 2, mx + mw + 30, SLATE);
    // protein render on the right
    var pw = 132, ph = pw * 0.910, px = x0 + w - 6 - pw, py = bandB + (bandT - bandB - ph) / 2;
    placeImg("p1_x12009.png", px, py + ph, pw);

    // callouts, anchored on the real features of those two images
    var sx = mx + mw * 0.506, sy = (my + mw) - mw * 0.484;
    txt("Target S", sx + 6, my + mw + 8, FS_LAB, ARIAL, INK, "left", "bottom");
    leader(sx + 5, my + mw + 7, sx, sy);
    var gx = px + pw * 0.626, gy = (py + ph) - ph * 0.515;
    txt("Interaction region", gx - 2, py + ph + 5, FS_LAB, ARIAL, INK, "right", "bottom");
    leader(gx - 1, py + ph + 4, gx, gy + 3);
})();

// ============================================================
//  b  -  guidance workflow   (captions verbatim from the original)
// ============================================================
(function panelB() {
    var x0 = PB[0], y0 = PB[1], w = INNER, h = ROW2H;
    head("b", "ProteinPS guidance workflow", x0, y0, h);

    var bandB = y0 + 12, bandT = y0 + h - 26;
    var cy = (bandB + bandT) / 2;
    var bh = 26, gap = 8;
    // lines[i] = [ segmentsArray, optional font ]
    function box(x, yy, bw, bh2, lines, fillC, strokeC) {
        rect(x, yy - bh2 / 2, bw, bh2, fillC, strokeC, SW_AX);
        var n = lines.length;
        for (var i = 0; i < n; i++) {
            var s = lines[i];
            var yy2 = yy + (n - 1) * 3.1 - i * 6.2;
            rich(s[0], x + bw / 2, yy2, FS_LAB, s[1] || ARIAL, INK, "center", "middle");
        }
    }
    // ---- slot geometry
    var X = x0 + 2;
    var w1 = 54, w2 = 62, w3 = 56, w4 = 58, w5 = 62;
    var mw = 108;
    // 1 current state
    box(X, cy, w1, bh, [[[["Current", 0]]], [[["diffusion state", 0]]], [[["X", 0], ["t", 2]], ARIALI]]);
    poly([[X + w1, cy], [X + w1 + gap - 3, cy]], null, SLATE, SW_EMPH, false);
    poly([[X + w1 + gap, cy], [X + w1 + gap - 4.2, cy + 1.9], [X + w1 + gap - 4.2, cy - 1.9]], SLATE, SLATE, 0, true);
    var xr = X + w1 + gap;
    // 2 RFD3
    box(xr, cy, w2, bh, [[[["RFD3 diffusion", 0]]], [[["denoising", 0]]], [[["X", 0], ["0|t", 2]], ARIALI]]);
    poly([[xr + w2, cy], [xr + w2 + gap - 3, cy]], null, SLATE, SW_EMPH, false);
    poly([[xr + w2 + gap, cy], [xr + w2 + gap - 4.2, cy + 1.9], [xr + w2 + gap - 4.2, cy - 1.9]], SLATE, SLATE, 0, true);
    xr += w2 + gap;
    // 3 candidate sites
    box(xr, cy, w3, bh, [[[["Candidate", 0]]], [[["functional sites", 0]]]]);
    poly([[xr + w3, cy], [xr + w3 + gap - 3, cy]], null, SLATE, SW_EMPH, false);
    poly([[xr + w3 + gap, cy], [xr + w3 + gap - 4.2, cy + 1.9], [xr + w3 + gap - 4.2, cy - 1.9]], SLATE, SLATE, 0, true);
    xr += w3 + gap;
    // 4 dynamic site selection
    box(xr, cy, w4, bh, [[[["Dynamic", 0]]], [[["site selection", 0]]]]);
    var x4r = xr + w4;
    poly([[x4r, cy], [x4r + gap - 3, cy]], null, SLATE, SW_EMPH, false);
    poly([[x4r + gap, cy], [x4r + gap - 4.2, cy + 1.9], [x4r + gap - 4.2, cy - 1.9]], SLATE, SLATE, 0, true);
    xr += w4 + gap;

    // ---- dashed guidance module
    var modX = xr, modW = mw;
    rect(modX, bandB - 1, modW, (bandT - bandB) + 2, null, TEAL, SW_AX).strokeDashes = [2.2, 1.8];
    txt("ProteinPS guidance module", modX + modW / 2, bandT + 2.5, FS_SMALL, ARIAL, TEAL, "center", "bottom");
    var inX = modX + 6, inW = 48;
    var iy = cy + 13, ey = cy - 13;
    box(inX, iy, inW, 15, [[[["INT step", 0]]], [[["Interaction guidance", 0]]]], "#E6F1F0", TEAL);
    box(inX, ey, inW, 15, [[[["CE step", 0]]], [[["Residue-type guidance", 0]]]], "#E6F1F0", TEAL);
    // step schedule label
    txt("step", modX - 2, cy + 3.5, FS_SMALL, ARIAL, SHADE(), "right", "middle");
    // arrows out of INT / CE into bounded update
    var bx = inX + inW + 4, bw2 = modW - (bx - modX) - 5;
    poly([[inX + inW, iy], [bx - 1, iy], [bx - 1, cy]], null, TEAL, SW_THIN, false);
    poly([[inX + inW, ey], [bx - 1, ey], [bx - 1, cy]], null, TEAL, SW_THIN, false);
    box(bx, cy, bw2, 15, [[[["Bounded update", 0]]]], "#E6F1F0", TEAL);
    arrow(modX + modW, cy, modX + modW + gap, SLATE);
    // 5 diffusion sampling
    box(modX + modW + gap, cy, w5, bh, [[[["Diffusion sampling", 0]]],
        [[["X", 0], ["t-1", 2], [" = sample(X", 0], ["0|t", 2], [")", 0]], ARIALI]]);
    var x5r = modX + modW + gap + w5;
    // return loop
    poly([[x5r - w5 / 2, cy - bh / 2], [x5r - w5 / 2, bandB + 4], [X + w1 / 2, bandB + 4], [X + w1 / 2, cy - bh / 2]],
         null, GREY, SW_THIN, false);
    poly([[X + w1 / 2, cy - bh / 2], [X + w1 / 2 - 2.2, cy - bh / 2 - 4.2], [X + w1 / 2 + 2.2, cy - bh / 2 - 4.2]], GREY, GREY, 0, true);
    txt("repeat until t = 0", (X + w1 / 2 + x5r - w5 / 2) / 2, bandB + 6, FS_SMALL, ARIAL, GREY, "center", "bottom");
})();
function SHADE() { return "#536272"; }

// ============================================================
//  c  -  three tracked guidance objectives   (real data)
//  Per the data README: these are three TRACKED objectives, not
//  components of E_total; each is multiplied by a ramping schedule
//  weight, so the weight is drawn alongside; and CE is bimodal, so
//  individual curves are coloured by outcome and no median is drawn.
// ============================================================
(function panelC() {
    var x0 = PC[0], y0 = PC[1], w = CW, h = ROW1H;
    var yb = head("c", "Tracked guidance objectives", x0, y0, h);
    var bx = x0 + 34, pw = w - 34 - 26;
    var PLOTH = 40, GAP = 17;
    var TOP = y0 + h - 34;
    var XMAX = 198;
    function xp(v) { return bx + v / XMAX * pw; }

    var PLOT = [
        { key: "ce",    lab: [[["CE loss", 0]]],              wkey: "wt", ymin: -1.5, ymax: 2.5 },
        { key: "geo",   lab: [["log", 0], ["10", 2], [" E", 0], ["geom", 2]], wkey: "wg", ymin: 1.5, ymax: 5.5 },
        { key: "clash", lab: [["log", 0], ["10", 2], [" E", 0], ["clash", 2]], wkey: "wc", ymin: 0.0, ymax: 4.5 }
    ];
    for (var k = 0; k < 3; k++) {
        var P = PLOT[k];
        var pt = TOP - k * (PLOTH + GAP), pb = pt - PLOTH;
        function ylog(v) { return pb + (log10(v) - P.ymin) / (P.ymax - P.ymin) * PLOTH; }
        function yw(v) { return pb + v * PLOTH; }
        // frame
        poly([[bx, pb], [bx, pt]], null, INK, SW_AX, false);
        poly([[bx, pb], [bx + pw, pb]], null, INK, SW_AX, false);
        // schedule weight, dashed, on a 0-1 scale spanning the panel
        var wp = [];
        for (var i = 0; i <= XMAX; i++) {
            wp.push([xp(i), yw(weightAt(SAMPLES, P.wkey, i))]);
        }
        poly(wp, null, HAIR, 0.6, false).strokeDashes = [2, 1.8];
        // per-outcome median (the README forbids an OVERALL median because CE
        // is bimodal; a median within each outcome group is the recommended
        // alternative and gives the eye a trend to follow)
        for (var gI = 0; gI < 2; gI++) {
            var want = (gI === 0), gm = [];
            for (i = 0; i <= XMAX; i++) {
                var acc = [];
                for (j = 0; j < SAMPLES.length; j++) {
                    var Sj = SAMPLES[j];
                    if ((Sj.hit === 1) !== want) continue;
                    if (P.key === "ce") { if (i in Sj.ce) acc.push(log10(Sj.ce[i])); }
                    else {
                        var aj = (P.key === "geo") ? Sj.geo : Sj.clash;
                        if (i < aj.length) acc.push(log10(Math.max(1e-3, aj[i])));
                    }
                }
                if (!acc.length) { gm.push(null); continue; }
                acc.sort(function (a, b) { return a - b; });
                gm.push(acc[Math.floor(acc.length / 2)]);
            }
            var gmS = smoothSeries(gm, 31), pts2 = [];
            for (i = 0; i <= XMAX; i++) {
                if (gmS[i] === null) { if (pts2.length > 1) poly(pts2, null, want ? TEAL : AMBER, 0.9, false); pts2 = []; continue; }
                pts2.push([xp(i), pb + (gmS[i] - P.ymin) / (P.ymax - P.ymin) * PLOTH]);
            }
            if (pts2.length > 1) poly(pts2, null, want ? TEAL : AMBER, 0.9, false);
        }
        // individual samples, coloured by outcome
        for (var j = 0; j < SAMPLES.length; j++) {
            var S = SAMPLES[j], colr = S.hit ? TEAL : AMBER, pts = [];
            if (P.key === "ce") {
                for (i = 0; i <= XMAX; i += 2) {
                    if (!(i in S.ce)) continue;
                    pts.push([xp(i), ylog(S.ce[i])]);
                }
            } else {
                var arr = (P.key === "geo") ? S.geo : S.clash;
                for (i = 0; i <= XMAX; i++) pts.push([xp(i), ylog(Math.max(1e-3, arr[i]))]);
            }
            if (pts.length > 1) poly(pts, null, colr, SW_THIN, false).opacity = 34;
        }
        // ticks
        var ytv = (P.key === "ce") ? [-1, 0, 1, 2] : ((P.key === "geo") ? [2, 3, 4, 5] : [0, 1, 2, 3, 4]);
        for (i = 0; i < ytv.length; i++) {
            var py = pb + (ytv[i] - P.ymin) / (P.ymax - P.ymin) * PLOTH;
            poly([[bx, py], [bx - 2.4, py]], null, INK, SW_AX, false);
            txt(String(ytv[i]), bx - 4, py, FS_SMALL, ARIAL, INK, "right", "middle");
        }
        rich(P.lab, bx - 21, pb + PLOTH / 2, FS_LAB, ARIAL, INK, "center", "middle")
            .rotate(-90, true, true, true, true, Transformation.CENTER);
        if (k === 0) {
            txt("1", bx + pw + 4, pb + PLOTH, FS_SMALL, ARIAL, HAIR, "left", "middle");
            txt("0", bx + pw + 4, pb, FS_SMALL, ARIAL, HAIR, "left", "middle");
            poly([[bx + pw, pb], [bx + pw, pt]], null, HAIR, SW_THIN, false);
        }
        if (k === 2) {
            var xt = [0, 50, 100, 150, 198];
            for (i = 0; i < xt.length; i++) {
                poly([[xp(xt[i]), pb], [xp(xt[i]), pb - 2.4]], null, INK, SW_AX, false);
                txt(String(xt[i]), xp(xt[i]), pb - 4, FS_SMALL, ARIAL, INK, "center", "top");
            }
            txt("Reverse diffusion step", bx + pw / 2, pb - 14, FS_TITLE, ARIAL, INK, "center", "top");
        }
    }
    // legend
    var ly = yb - 8.5;
    var l3 = txt("schedule weight (0-1)", x0 + w - 2, ly, FS_SMALL, ARIAL, HAIR, "right", "middle");
    var x3 = x0 + w - 2 - l3.width - 3;
    poly([[x3 - 9, ly - 0.6], [x3, ly - 0.6]], null, HAIR, 0.6, false).strokeDashes = [2, 1.8];
    var l2b = txt("miss (n=" + NMISS + ")", x3 - 8, ly, FS_SMALL, ARIAL, AMBER, "right", "middle");
    var x2b = x3 - 8 - l2b.width - 3;
    poly([[x2b - 9, ly - 0.6], [x2b, ly - 0.6]], null, AMBER, SW_THIN, false);
    var l1 = txt("hit (n=" + NHIT + ")", x2b - 8, ly, FS_SMALL, ARIAL, TEAL, "right", "middle");
    var x1 = x2b - 8 - l1.width - 3;
    poly([[x1 - 9, ly - 0.6], [x1, ly - 0.6]], null, TEAL, SW_THIN, false);
})();

// per-step schedule weight for the weight dashed line
// centred moving average that tolerates nulls (used for the group medians)
function smoothSeries(a, w) {
    var out = [], n = a.length, h = Math.floor(w / 2);
    for (var i = 0; i < n; i++) {
        var lo = Math.max(0, i - h), hi = Math.min(n - 1, i + h), s = 0, c = 0;
        for (var j = lo; j <= hi; j++) if (a[j] !== null) { s += a[j]; c++; }
        out.push(c ? s / c : null);
    }
    return out;
}
function weightAt(S, key, i) {
    var s = 0, n = 0;
    for (var j = 0; j < S.length; j++) { var a = S[j][key]; if (a && i < a.length) { s += a[i]; n++; } }
    return n ? s / n : 0;
}

// ============================================================
//  export
// ============================================================
var folder = new Folder(DIR);
if (!folder.exists) folder.create();
var png = new File(DIR + "fig1_proteinps.png");
var po = new ExportOptionsPNG24();
po.antiAliasing = true; po.transparency = false; po.artBoardClipping = true;
po.horizontalScale = 300; po.verticalScale = 300;
doc.exportFile(png, ExportType.PNG24, po);
var svg = new File(DIR + "fig1_proteinps.svg");
var so = new ExportOptionsSVG(); so.coordinatePrecision = 3;
doc.exportFile(svg, ExportType.SVG, so);
var ai = new File(DIR + "fig1_proteinps.ai");
doc.saveAs(ai, new IllustratorSaveOptions());
"OK | " + Math.round(FIG_W) + "x" + Math.round(FIG_H) + "pt | samples=" + SAMPLES.length +
" steps=" + NSTEP + " | png=" + png.exists + " ai=" + ai.exists;
