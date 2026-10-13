#target illustrator
// end-to-end smoke test: new doc -> shapes -> text -> export PNG
var doc = app.documents.add(DocumentColorSpace.RGB, 800, 600);
var layer = doc.layers[0];

var rect = layer.pathItems.rectangle(420, 80, 300, 200);
rect.filled = true;
var c = new RGBColor();
c.red = 66; c.green = 133; c.blue = 244;
rect.fillColor = c;
rect.stroked = false;

var tri = layer.pathItems.add();
tri.setEntirePath([[480, 380], [620, 380], [550, 250]]);
var c2 = new RGBColor();
c2.red = 240; c2.green = 90; c2.blue = 40;
tri.fillColor = c2;
tri.stroked = false;

var tf = layer.textFrames.add();
tf.contents = "hello from Claude";
tf.position = [80, 520];
tf.textRange.characterAttributes.size = 36;

var outFolder = new Folder("C:/Users/lhw15/ai_driver/out");
if (!outFolder.exists) outFolder.create();

var f = new File("C:/Users/lhw15/ai_driver/out/test.png");
var opts = new ExportOptionsPNG24();
opts.antiAliasing = true;
opts.transparency = false;
doc.exportFile(f, ExportType.PNG24, opts);

var pngExists = f.exists;
var pngLen = pngExists ? f.length : 0;
"OK | doc=" + doc.name + " | items=" + layer.pathItems.length + " | png=" + pngExists + " bytes=" + pngLen;
