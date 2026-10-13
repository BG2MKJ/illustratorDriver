var want = ["ArialMT", "Arial-BoldMT", "Arial-ItalicMT", "Arial", "Arial-Bold",
            "Helvetica", "Helvetica-Bold", "HelveticaNeue", "HelveticaNeue-Bold",
            "Times-Roman", "MinionPro-Regular", "ArialNarrow"];
var out = [];
for (var i = 0; i < want.length; i++) {
    try { app.textFonts.getByName(want[i]); out.push(want[i] + "=OK"); }
    catch (e) { out.push(want[i] + "=no"); }
}
var total = app.textFonts.length;
var hits = [];
for (var j = 0; j < total; j++) {
    var n = app.textFonts[j].name;
    if (/helvet|arial/i.test(n)) hits.push(n);
}
out.join(",") + "  ||totalFonts=" + total + "  ||helv/arial matches: " + hits.slice(0, 40).join(",");
