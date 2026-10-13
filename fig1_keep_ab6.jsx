#target illustrator
// ============================================================
//  Keep only artboard 6 of Fig1_NMI_180mm_5protein_layout.ai
//  (1-based artboard 6 = the real Fig. 1, 180 x 232 mm).
//  Everything else - artwork and artboard - is removed.
//  A full backup was taken beforehand: ...BACKUP_all9boards.ai
//  PURE ASCII ONLY.
// ============================================================
var SRC  = "C:/Users/lhw15/Desktop/fig1/Fig1_NMI_180mm_5protein_layout.ai";
var KEEP = 5;                       // 0-based index of the artboard to keep

var prevLevel = app.userInteractionLevel;
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
var doc = app.open(new File(SRC));
var before = doc.artboards.length;

// ---- rects of every artboard we are about to clear
var rects = [];
for (var i = 0; i < doc.artboards.length; i++) {
    if (i === KEEP) continue;
    var r = doc.artboards[i].artboardRect;          // [left, top, right, bottom]
    rects.push([Math.min(r[0], r[2]), Math.min(r[1], r[3]),
                Math.max(r[0], r[2]), Math.max(r[1], r[3])]);
}
function doomed(gb) {                               // centre test
    var cx = (gb[0] + gb[2]) / 2, cy = (gb[1] + gb[3]) / 2;
    for (var k = 0; k < rects.length; k++) {
        var r = rects[k];
        if (cx >= r[0] && cx <= r[2] && cy >= r[1] && cy <= r[3]) return true;
    }
    return false;
}

// ---- delete the artwork that lives in those artboards
var killed = 0;
for (var L = 0; L < doc.layers.length; L++) {
    var items = doc.layers[L].pageItems;
    for (var j = items.length - 1; j >= 0; j--) {
        var it = items[j];
        try {
            if (doomed(it.geometricBounds)) { it.remove(); killed++; }
        } catch (e) {}
    }
}

// ---- drop the artboards themselves (walk downwards so indices stay valid)
var removedBoards = 0;
for (var b = doc.artboards.length - 1; b >= 0; b--) {
    if (b === KEEP) continue;
    try { doc.artboards.remove(b); removedBoards++; } catch (e) {}
}
doc.artboards.setActiveArtboardIndex(0);

// ---- save
var opts = new IllustratorSaveOptions();
opts.pdfCompatible = true;
opts.embedLinkedFiles = true;
doc.saveAs(new File(SRC), opts);

app.userInteractionLevel = prevLevel;
"OK | artboards " + before + " -> " + doc.artboards.length +
" | pageItems removed=" + killed + " | artboards removed=" + removedBoards;
