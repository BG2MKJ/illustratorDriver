var doc = app.documents.add(DocumentColorSpace.RGB, 300, 200);
var L = doc.layers[0];
var out = [];

// --- test 1: per-character superscript via size + baselineShift
try {
    var tf = L.textFrames.add();
    tf.contents = "10-9";
    tf.textRange.characterAttributes.size = 6;
    var ch = tf.textRange.characters;
    out.push("chars.len=" + ch.length);
    try { out.push("ch0=" + ch[0].contents); } catch (e) { out.push("ch0=ERR"); }
    try { out.push("ch1=" + ch[1].contents); } catch (e) { out.push("ch1=ERR"); }
    ch[2].characterAttributes.size = 4;
    ch[2].characterAttributes.baselineShift = 2.5;
    ch[3].characterAttributes.size = 4;
    ch[3].characterAttributes.baselineShift = 2.5;
    out.push("super=OK");
} catch (e) { out.push("super=FAIL:" + e.message); }

// --- test 2: rotate about center, check resulting bounds
try {
    var t2 = L.textFrames.add();
    t2.contents = "Normalised signal";
    t2.textRange.characterAttributes.size = 6.6;
    t2.position = [200, 100];
    var w = t2.width, h = t2.height;
    t2.position = [200 - w / 2, 100 + h / 2];
    t2.rotate(-90, true, true, true, true, Transformation.CENTER);
    out.push("rot=OK w=" + w.toFixed(1) + " h=" + h.toFixed(1) +
             " L=" + t2.left.toFixed(1) + " R=" + (t2.left + t2.width).toFixed(1) +
             " B=" + t2.top.toFixed(1));
} catch (e) { out.push("rot=FAIL:" + e.message); }

doc.close(SaveOptions.DONOTSAVECHANGES);
out.join(" | ");
