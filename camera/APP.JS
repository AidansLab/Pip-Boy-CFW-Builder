(function () {
    if (!Pip.settings.camera) {
        Pip.settings.camera = {
            contrast: 0,
            brightness: 0,
            corruption: false
        };
    }
    global.camConnected = false;
    h.clear();
    try { require('fs').mkdir('IMGS'); } catch (e) { }

    let contrast = 0;
    let brightness = 0;

    let imageArray = null;

    function buildImageArray() {
        imageArray = fs.readdir("IMGS");
        imageArray.shift();
        imageArray.shift();
        //console.log(imageArray);
        fileCount = imageArray.length - 1;
        fileIndex = fileCount;
    }

    buildImageArray();

    let deleteSelect = false;
    let appMode = 0; // 0 = Take Picture, 1 = View Picture

    // let ThrobberInterval = null;
    // let ThrobberTimeout = null;
    /* let Throbbers = {
        open: "\\x64\\x64\\x81\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x7f\\xf0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x8f\\xff\\xf0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x71\\xff\\xff\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\x1f\\xff\\xff\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xe3\\xff\\xff\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xfe\\x3f\\xff\\xff\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x3f\\xc7\\xff\\xff\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x0f\\xf8\\xff\\xff\\xff\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xff\\x8f\\xff\\xff\\xff\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x3f\\xf1\\xff\\xff\\xff\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x07\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xfc\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\xc0\\x00\\x00\\x00\\x3f\\xfc\\x00\\x00\\x00\\x00\\x00\\x3f\\xf8\\x00\\x00\\x00\\x01\\xff\\xc0\\x00\\x00\\x00\\x00\\x07\\xff\\x80\\x00\\x00\\x00\\x1f\\xfe\\x00\\x00\\x00\\x00\\x00\\xff\\xf0\\x00\\x00\\x00\\x00\\xff\\xf0\\x00\\x00\\x00\\x00\\x0f\\xff\\x00\\x00\\x00\\x00\\x0f\\xff\\x00\\x00\\x00\\x00\\x01\\xff\\xe0\\x00\\x00\\x00\\x00\\x7f\\xf8\\x00\\x00\\x00\\x00\\x1f\\xfc\\x00\\x00\\x00\\x00\\x03\\xff\\x80\\x00\\x00\\x00\\x03\\xff\\xc0\\x00\\x00\\x00\\x00\\x3f\\xfc\\x00\\x00\\x00\\x00\\x3f\\xf8\\x00\\x00\\x00\\x00\\x01\\xff\\xc0\\x00\\x00\\x00\\x07\\xff\\x80\\x00\\x00\\x00\\x00\\x1f\\xfe\\x00\\x00\\x00\\x00\\x3f\\xf0\\x00\\x00\\x00\\x00\\x00\\xff\\xe0\\x00\\x00\\x00\\x01\\xfe\\x00\\x00\\x00\\x00\\x00\\x07\\xfe\\x00\\x00\\x00\\x00\\x1f\\xe0\\x00\\x00\\x00\\x00\\x00\\x7f\\xf0\\x00\\x00\\x00\\x08\\xfc\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\x00\\x00\\x00\\x00\\x8f\\xc0\\x00\\x00\\x00\\x00\\x00\\x3f\\xf0\\x00\\x00\\x00\\x0c\\x78\\x00\\x00\\x00\\x00\\x00\\x01\\xff\\x00\\x00\\x00\\x01\\xc7\\x80\\x00\\x00\\x00\\x00\\x00\\x1f\\xf8\\x00\\x00\\x00\\x1e\\x30\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\x80\\x00\\x00\\x01\\xe1\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xf8\\x00\\x00\\x00\\x1f\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x7f\\x80\\x00\\x00\\x01\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x03\\xf8\\x00\\x00\\x00\\x1f\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\x3f\\x80\\x00\\x00\\x01\\xfc\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xf8\\x00\\x00\\x00\\x1f\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\x80\\x00\\x00\\x01\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xf8\\x00\\x00\\x00\\x1f\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\xc7\\x80\\x00\\x00\\x01\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x0c\\x78\\x00\\x00\\x00\\x1f\\xf8\\x00\\x00\\x00\\x00\\x00\\x01\\xe3\\x80\\x00\\x00\\x00\\xff\\x80\\x00\\x00\\x00\\x00\\x00\\x1e\\x30\\x00\\x00\\x00\\x0f\\xfc\\x00\\x00\\x00\\x00\\x00\\x03\\xf1\\x00\\x00\\x00\\x00\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x3f\\x00\\x00\\x00\\x00\\x0f\\xfe\\x00\\x00\\x00\\x00\\x00\\x07\\xf8\\x00\\x00\\x00\\x00\\x7f\\xe0\\x00\\x00\\x00\\x00\\x00\\xff\\xc0\\x00\\x00\\x00\\x07\\xff\\x00\\x00\\x00\\x00\\x00\\x0f\\xfc\\x00\\x00\\x00\\x00\\x7f\\xf8\\x00\\x00\\x00\\x00\\x01\\xff\\xe0\\x00\\x00\\x00\\x03\\xff\\x80\\x00\\x00\\x00\\x00\\x1f\\xfc\\x00\\x00\\x00\\x00\\x3f\\xfc\\x00\\x00\\x00\\x00\\x03\\xff\\xc0\\x00\\x00\\x00\\x01\\xff\\xc0\\x00\\x00\\x00\\x00\\x3f\\xf8\\x00\\x00\\x00\\x00\\x1f\\xfe\\x00\\x00\\x00\\x00\\x07\\xff\\x80\\x00\\x00\\x00\\x00\\xff\\xf0\\x00\\x00\\x00\\x00\\xff\\xf0\\x00\\x00\\x00\\x00\\x0f\\xff\\x00\\x00\\x00\\x00\\x0f\\xff\\x00\\x00\\x00\\x00\\x00\\x7f\\xf8\\x00\\x00\\x00\\x01\\xff\\xe0\\x00\\x00\\x00\\x00\\x03\\xff\\x80\\x00\\x00\\x00\\x1f\\xfc\\x00\\x00\\x00\\x00\\x00\\x3f\\xfc\\x00\\x00\\x00\\x03\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x3f\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\xe0\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\xff\\xff\\xff\\x8f\\xfc\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xff\\xff\\xff\\xf1\\xff\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\xff\\xff\\xff\\x1f\\xf0\\x00\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\xff\\xff\\xe3\\xfc\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xff\\xff\\xfc\\x7f\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x7f\\xff\\xff\\xc7\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xff\\xff\\xf8\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xff\\xff\\x8e\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x0f\\xff\\xf1\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x0f\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00",
        closed: "\\x64\\x64\\x81\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x7f\\xf0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x8f\\xff\\xf0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x71\\xff\\xff\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\x1f\\xff\\xff\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xe3\\xff\\xff\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xfe\\x3f\\xff\\xff\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x3f\\xc7\\xff\\xff\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x0f\\xf8\\xff\\xff\\xff\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xff\\x8f\\xff\\xff\\xff\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x3f\\xf1\\xff\\xff\\xff\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x07\\xff\\x1f\\xff\\xff\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\xf1\\xff\\xff\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xff\\x1f\\xff\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\xf1\\xff\\xff\\xe1\\xff\\xfc\\x00\\x00\\x00\\x00\\x00\\x3f\\xff\\x1f\\xff\\xfc\\x7f\\xff\\xc0\\x00\\x00\\x00\\x00\\x07\\xff\\xf1\\xff\\xff\\x8f\\xff\\xfe\\x00\\x00\\x00\\x00\\x00\\xff\\xff\\x1f\\xff\\xf1\\xff\\xff\\xf0\\x00\\x00\\x00\\x00\\x0f\\xff\\xf9\\xff\\xfe\\x3f\\xff\\xff\\x00\\x00\\x00\\x00\\x01\\xff\\xff\\x8f\\xff\\xc7\\xff\\xff\\xf8\\x00\\x00\\x00\\x00\\x1f\\xff\\xf8\\xff\\xf8\\x7f\\xff\\xff\\x80\\x00\\x00\\x00\\x03\\xff\\xff\\x8f\\xff\\x8f\\xff\\xff\\xfc\\x00\\x00\\x00\\x00\\x3f\\xff\\xfc\\x7f\\xf1\\xff\\xff\\xff\\xc0\\x00\\x00\\x00\\x07\\xff\\xff\\xc7\\xfe\\x1f\\xff\\xff\\xfe\\x00\\x00\\x00\\x00\\x3f\\xff\\xfc\\x3f\\xe3\\xff\\xff\\xff\\xe0\\x00\\x00\\x00\\x01\\xff\\xff\\xe3\\xfc\\x7f\\xff\\xff\\xfe\\x00\\x00\\x00\\x00\\x1f\\xff\\xfe\\x1f\\xc7\\xff\\xff\\xff\\xf0\\x00\\x00\\x00\\x00\\xff\\xff\\xf1\\xf8\\xff\\xff\\xff\\xff\\x00\\x00\\x00\\x00\\x8f\\xff\\xff\\x0f\\x8f\\xff\\xff\\xff\\xf0\\x00\\x00\\x00\\x0c\\x7f\\xff\\xf8\\xf9\\xff\\xff\\xff\\xff\\x00\\x00\\x00\\x01\\xc7\\xff\\xff\\xc7\\x9f\\xff\\xff\\xff\\xf8\\x00\\x00\\x00\\x1e\\x3f\\xff\\xfe\\x31\\xe0\\x00\\xff\\xff\\x80\\x00\\x00\\x01\\xe1\\xff\\xff\\xe1\\x20\\x00\\x00\\xff\\xf8\\x00\\x00\\x00\\x1f\\x1f\\xff\\xff\\x10\\x00\\x00\\x01\\xff\\x80\\x00\\x00\\x01\\xf8\\xff\\xff\\xf8\\x07\\xff\\xf8\\x07\\xf8\\x00\\x00\\x00\\x1f\\x87\\xff\\xff\\xc0\\x7f\\xff\\xf8\\x3f\\x80\\x00\\x00\\x01\\xfc\\x07\\xff\\xfe\\x03\\xff\\xff\\xe1\\xf8\\x00\\x00\\x00\\x1f\\xf0\\x03\\xfc\\x00\\x8f\\xff\\xff\\x1f\\x80\\x00\\x00\\x01\\xff\\xc0\\x00\\x00\\xc8\\xff\\xff\\xf8\\xf8\\x00\\x00\\x00\\x1f\\xff\\xc0\\x00\\x78\\xc7\\xff\\xff\\x87\\x80\\x00\\x00\\x01\\xff\\xff\\xf9\\xff\\x9e\\x3f\\xff\\xfc\\x78\\x00\\x00\\x00\\x1f\\xff\\xff\\xff\\xf9\\xf1\\xff\\xff\\xe3\\x80\\x00\\x00\\x00\\xff\\xff\\xff\\xff\\x1f\\x1f\\xff\\xfe\\x30\\x00\\x00\\x00\\x0f\\xff\\xff\\xff\\xf3\\xf8\\xff\\xff\\xf1\\x00\\x00\\x00\\x00\\xff\\xff\\xff\\xfe\\x3f\\x8f\\xff\\xff\\x00\\x00\\x00\\x00\\x0f\\xff\\xff\\xff\\xe3\\xfc\\x7f\\xff\\xf8\\x00\\x00\\x00\\x00\\x7f\\xff\\xff\\xfc\\x7f\\xc7\\xff\\xff\\xc0\\x00\\x00\\x00\\x07\\xff\\xff\\xff\\xc7\\xfe\\x3f\\xff\\xfc\\x00\\x00\\x00\\x00\\x7f\\xff\\xff\\xf8\\xff\\xe3\\xff\\xff\\xe0\\x00\\x00\\x00\\x03\\xff\\xff\\xff\\x0f\\xff\\x1f\\xff\\xfc\\x00\\x00\\x00\\x00\\x3f\\xff\\xff\\xf1\\xff\\xf1\\xff\\xff\\xc0\\x00\\x00\\x00\\x01\\xff\\xff\\xfe\\x3f\\xff\\x1f\\xff\\xf8\\x00\\x00\\x00\\x00\\x1f\\xff\\xff\\xc3\\xff\\xf9\\xff\\xff\\x80\\x00\\x00\\x00\\x00\\xff\\xff\\xf8\\x7f\\xff\\x8f\\xff\\xf0\\x00\\x00\\x00\\x00\\x0f\\xff\\xff\\x0f\\xff\\xf8\\xff\\xff\\x00\\x00\\x00\\x00\\x00\\x7f\\xff\\xe1\\xff\\xff\\x8f\\xff\\xe0\\x00\\x00\\x00\\x00\\x03\\xff\\xfc\\x3f\\xff\\xf8\\xff\\xfc\\x00\\x00\\x00\\x00\\x00\\x3f\\xff\\x87\\xff\\xff\\xcf\\xff\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\xff\\xfc\\xff\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xff\\xff\\xcf\\xff\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xff\\xff\\xf8\\xff\\xe0\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\xff\\xff\\xff\\x8f\\xfc\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xff\\xff\\xff\\xf1\\xff\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\xff\\xff\\xff\\xff\\x1f\\xf0\\x00\\x00\\x00\\x00\\x00\\x00\\x03\\xff\\xff\\xff\\xe3\\xfc\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\xff\\xff\\xfc\\x7f\\x80\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x7f\\xff\\xff\\xc7\\xe0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x01\\xff\\xff\\xf8\\xf8\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x07\\xff\\xff\\x8e\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x0f\\xff\\xf1\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x0f\\xfe\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00"
    }; */

    let picStart = null;

    let busy = 0; //State is either 0 not busy, 1 busy, 2 managing pics.

    let palBuffer = new Uint16Array(16);
    let cR = 0, cG = 1, cB = 0; // Default to Green if settings are missing

    if (Pip.settings.theme) {
        // Extract RGB from theme color value
        cR = ((Pip.settings.theme >> 16) & 0xFF) / 255;
        cG = ((Pip.settings.theme >> 8) & 0xFF) / 255;
        cB = (Pip.settings.theme & 0xFF) / 255;
    }

    // Populate the 16-color palette
    for (let i = 0; i < 16; i++) {
        // Map index 0-15 to 0.0-1.0 intensity
        let intensity = i / 15;

        // Create color using the system theme ratios
        palBuffer[i] = h.toColor(intensity * cR, intensity * cG, intensity * cB);
    }

    // Assign the generated palette to sysPalette
    const sysPalette = palBuffer;

    function drawPicture() {
        h.clearRect(0, 51, 480, 290);

        if (imageArray.length == 0) {
            h.setFontMonofonto18().setFontAlign(0, 0).drawString("NO IMAGES", h.getWidth() / 2, h.getHeight() / 2);
            busy = 0;
            return;
        }

        // Open the file
        const f = E.openFile("IMGS/" + imageArray[fileIndex], "r");

        if (!f) {
            //console.log("Image not found");
            busy = 0;
            return;
        }

        if (fs.statSync("IMGS/" + imageArray[fileIndex]).size < 20000) {
            h.setFontMonofonto18().setFontAlign(0, 0).drawString("Image corrupt, try reconverting", h.getWidth() / 2, h.getHeight() / 2);
            f.close();
            busy = 0;
            return;
        }

        // Read Header (8 bytes)
        const hdr = f.read(8);
        if (!hdr) { f.close(); return; }

        const header = E.toUint8Array(hdr);
        const imgW = header[0] | (header[1] << 8);
        const imgH = header[2] | (header[3] << 8);
        const bpp = header[4];

        // Generate a proper RGB565 grayscale palette for h.drawImage to map to system colors
        const palSize = 1 << bpp;
        let sysPalette = new Uint16Array(palSize);

        // Apply a gamma curve to fix 3000a darkness
        const gamma = 0.42;

        for (let i = 0; i < palSize; i++) {
            // Apply gamma curve to boost brightness/detail
            let intensity = Math.pow(i / (palSize - 1), gamma);
            let val = Math.floor(intensity * 255);
            // Convert to RGB565 (R: 5 bits, G: 6 bits, B: 5 bits)
            sysPalette[i] = ((val >> 3) << 11) | ((val >> 2) << 5) | (val >> 3);
        }

        const screenW = h.getWidth();
        const screenH = h.getHeight() + 4;

        const startX = Math.floor((screenW - imgW) / 2);
        const startY = Math.floor((screenH - imgH) / 2);

        const bytesPerRow = Math.ceil(imgW * bpp / 8);

        let lineImg = {
            width: imgW,
            height: 1,
            bpp: bpp,
            buffer: new ArrayBuffer(bytesPerRow),
            palette: sysPalette
        };
        let lineView = new Uint8Array(lineImg.buffer);

        let y = 0;

        let drawingInterval = setInterval(function () {
            for (let i = 0; i < 15; i++) {
                if (y >= imgH) {
                    clearInterval(drawingInterval);
                    drawingInterval = null;
                    f.close();
                    busy = 0;
                    lineView = undefined;
                    lineImg = undefined;
                    process.memory(true);
                    return;
                }

                let chunk = f.read(bytesPerRow);
                if (chunk) {
                    if (startY + y >= 0 && startY + y < screenH) {
                        lineView.set(E.toUint8Array(chunk));
                        h.drawImage(lineImg, startX, startY + y);
                    }
                }
                y++;
            }
        }, 10);
    }

    //function bCCleanup() {
    //    process.memory(true);
    //    E.defrag();
    //}

    function updateImage() {
        busy = 1;
        //clearInterval(ThrobberInterval);
        //ThrobberInterval = null;
        //clearTimeout(ThrobberTimeout);
        //ThrobberTimeout = null;
        drawPicture();
    }

    function updateImageFromCam() {
        buildImageArray();
        updateImage();
    }

    /*
    function clearThrobberArea() {
        h.clearRect(190, 110, 290, 210);
    }

    function startThrobber() {
        picStart = Date.now();
        ThrobberInterval = setInterval(function () {
            clearThrobberArea();
            h.drawImage(Throbbers.open, 190, 110);
            ThrobberTimeout = setTimeout(function () {
                clearThrobberArea();
                h.drawImage(Throbbers.closed, 190, 110);
            }, 400);

            if (Date.now() - picStart > 5000) {
                clearInterval(ThrobberInterval);
                ThrobberInterval = null;
                clearTimeout(ThrobberTimeout);
                ThrobberTimeout = null;
                busy = 0;
                h.clearRect(0, 51, 480, 290);
                h.setFontMonofonto18().setFontAlign(0, 0);
                h.drawString("ERROR TAKING PICTURE", h.getWidth() / 2, (h.getHeight() / 2) - 10);
                h.drawString("EXIT AND REOPEN APP AND TRY AGAIN", h.getWidth() / 2, (h.getHeight() / 2) + 10);
            }
        }, 800);
    }
    */

    function saveSettings() {
        fs.writeFileSync('SETTINGS/DEVICE.JSON', JSON.stringify(Pip.settings));
    }

    function handleLeftKnob(dir) {
        if (busy == 1 || busy == 2) return;
        if (dir == 0) {
            if (imageArray.length == 0 || !camConnected) return;
            busy = 1;
            console.log("Reconvert," + Pip.settings.camera.brightness + "," + Pip.settings.camera.contrast + "\n");
            h.clearRect(0, 51, 480, 290);
            //startThrobber();
        } else {
            CBupdate(0, dir);
        }
    }

    function handleRightKnob(dir) {
        if (busy == 1 || busy == 2) return;
        CBupdate(1, dir);
    }

    function handleTopButton() {
        if (busy == 1 || busy == 2 || !camConnected) return;

        if (fs.getFree().freeSectors - 92 < 3) {
            h.clearRect(0, 51, 480, 290);
            h.setFontMonofonto18().setFontAlign(0, 0).drawString("NOT ENOUGH FREE SPACE ON SD", h.getWidth() / 2, h.getHeight() / 2);
            return;
        } else
            if (process.memory(false).free - 6 < 600) {
                h.clearRect(0, 51, 480, 290);
                h.setFontMonofonto18().setFontAlign(0, 0).drawString("NOT ENOUGH MEMORY", h.getWidth() / 2, h.getHeight() / 2);
                return;
            }

        busy = 1;
        saveSettings();
        console.log("TakePic," + Pip.settings.camera.brightness + "," + Pip.settings.camera.contrast + "," + Pip.settings.camera.corruption + "\n");
        h.clearRect(0, 51, 480, 290);
        //startThrobber();
    }

    function handleTuneUp() {
        if (busy == 1) return;

        if (busy == 2) {
            deleteSelect = !deleteSelect;
            deleteHighlight();
            return;
        }

        if ((fileIndex + 1) <= fileCount) {
            fileIndex++;
            updateImage();
        }
    }

    function handleTuneDown() {
        if (busy == 1) return;

        if (busy == 2) {
            deleteSelect = !deleteSelect;
            deleteHighlight();
            return;
        }

        if ((fileIndex - 1) >= 0) {
            fileIndex--;
            updateImage();
        }
    }

    function handleTuneButton() {
        if (imageArray.length == 0 || busy == 1) return;

        if (busy == 2) {
            if (deleteSelect) {
                deleteImage();
            } else {
                drawPicture();
            }
            busy = 0;
            return;
        }

        busy = 2;
        deleteHighlight();
    }

    function deleteImage() {
        const success = fs.unlink("IMGS/" + imageArray[fileIndex]);
        if (!success) return;

        const lastIndex = fileIndex;
        buildImageArray();

        if (lastIndex <= fileCount) {
            fileIndex = lastIndex;
        }
        drawPicture();
    }

    function deleteHighlight() {
        if (deleteSelect) {
            h.setFontMonofonto28().setFontAlign(-1, 0);
            h.setColor(3);
            h.clearRect(40, (h.getHeight() / 2) - 14, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70);
            h.drawString("Delete Image", 50, (h.getHeight() / 2) - 36);
            h.drawRect(41, (h.getHeight() / 2) - 14, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70);
            h.drawRect(40, (h.getHeight() / 2) - 14 - 1, 56 + h.stringWidth("Delete Image"), h.getFontHeight() + 71);

            h.clearRect(40, (h.getHeight() / 2) - 14 + 60, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70 + 60);
            h.drawString("Keep Image", 50, (h.getHeight() / 2) - 36 + 60);
            h.setColor(0);
            h.drawRect(41, (h.getHeight() / 2) - 14 + 60 - 1, 56 + h.stringWidth("Delete Image"), h.getFontHeight() + 70 + 61);
            h.drawRect(40, (h.getHeight() / 2) - 14 + 60 - 1, 56 + h.stringWidth("Delete Image"), h.getFontHeight() + 70 + 61);
            h.setColor(3);
        } else {
            h.setFontMonofonto28().setFontAlign(-1, 0);
            h.setColor(3);
            h.clearRect(40, (h.getHeight() / 2) - 14, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70);
            h.drawString("Delete Image", 50, (h.getHeight() / 2) - 36);
            h.setColor(0);
            h.drawRect(41, (h.getHeight() / 2) - 14, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70);
            h.drawRect(40, (h.getHeight() / 2) - 14 - 1, 56 + h.stringWidth("Delete Image"), h.getFontHeight() + 71);

            h.setColor(3);
            h.clearRect(40, (h.getHeight() / 2) - 14 + 60, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70 + 60);
            h.drawString("Keep Image", 50, (h.getHeight() / 2) - 36 + 60);
            h.drawRect(41, (h.getHeight() / 2) - 14 + 60, 55 + h.stringWidth("Delete Image"), h.getFontHeight() + 70 + 60);
            h.drawRect(40, (h.getHeight() / 2) - 14 + 60 - 1, 56 + h.stringWidth("Delete Image"), h.getFontHeight() + 70 + 61);
        }
    }

    function CBupdate(knob, dir) {
        if (knob == 0) // Brightness
        {
            h.setFontMonofonto28().setFontAlign(-1, -1).setColor(13);
            h.clearRect(48, 5, 110, 45);
            Pip.settings.camera.brightness += dir;
            h.drawString(Pip.settings.camera.brightness, 48, 10);
        } else if (knob == 1) // Contrast
        {
            h.setFontMonofonto28().setFontAlign(1, -1).setColor(13);
            h.clearRect(370, 5, 432, 45);
            Pip.settings.camera.contrast += -dir;
            h.drawString(Pip.settings.camera.contrast, 432, 10);
        }
    }

    function DisplaySetup() {
        h.clear();
        h.setFontMonofonto36().setFontAlign(0, -1).setColor(13);
        h.drawString("PIP-CAM", h.getWidth() / 2, 0);

        if (appMode == 0) {
            h.setFontMonofonto28().setFontAlign(-1, -1).setColor(13);
            h.drawString("B:" + Pip.settings.camera.brightness, 20, 10);
            h.setFontMonofonto28().setFontAlign(1, -1).setColor(13);
            h.drawString(Pip.settings.camera.contrast + ":C", 460, 10);
        }

        drawFooter();
    }

    function drawFooter() {
        h.setFontMonofonto18().setFontAlign(0, -1).setColor(9);
        h.drawString("Press Any Button to Exit", h.getWidth() / 2, 290);
        h.setFontAlign(1, -1);
        h.clearRect(h.getWidth() - 20, 290, h.getWidth() - 70, 310)

        //Gary Gary Gary Gary Gary (Handshake code to detect Pip-Cam)
        if (VUSB_PRESENT.read()) {
            USB.flush();

            if (camConnected) {
                h.drawString("Ready", h.getWidth() - 20, 290);
            } else {
                console.log("Gary!" + "\n");
                h.drawString("Off", h.getWidth() - 20, 290);
            }
        } else {
            camConnected = false;
            h.drawString("Off", h.getWidth() - 20, 290);
        }
    }

    function switchMode() {
        appMode = appMode == 0 ? 1 : 0;
        busy = 0;
        deleteSelect = false;
        fileIndex = fileCount;
        DisplaySetup();
        drawPicture();
    }

    // Knob1: turn = brightness (take) / scroll menu (view), click = reconvert (take) / delete menu (view), long click = switch mode
    function onKnob1(dir, long) {
        if (dir == 0 && long == 1) {
            switchMode();
            return;
        }

        if (appMode == 0) {
            if (dir == 0) {
                handleLeftKnob(0);
            } else {
                handleLeftKnob(-dir);
            }
        } else if (appMode == 1) {
            if (busy == 2) {
                if (dir == 0) {
                    handleTuneButton();
                } else {
                    deleteSelect = !deleteSelect;
                    deleteHighlight();
                }
            } else {
                if (dir == 0) {
                    handleTuneButton();
                }
            }
        }
    }

    // Knob2: turn = contrast (take) / next/prev (view)
    function onKnob2(dir) {
        if (dir == 0) return;

        if (appMode == 0) {
            handleRightKnob(dir);
        } else if (appMode == 1 && busy != 2) {
            if (dir > 0) {
                handleTuneUp();
            } else {
                handleTuneDown();
            }
        }
    }

    // Setup events
    Pip.onExclusive('knob1', onKnob1);
    Pip.onExclusive('knob2', onKnob2);
    let camWatch = setWatch(() => {
        drawFooter()
    }, VUSB_PRESENT, {
        repeat: true, edge: "both", debounce: 100
    });

    Pip.on('updateImg', updateImageFromCam);
    Pip.on('takeFromCam', handleTopButton);
    Pip.on('drawFooter', drawFooter);

    DisplaySetup();
    process.memory(true);
    drawPicture();

    return {
        id: "PIP-CAM",
        notDefault: !0,
        fullscreen: !0,
        remove: function () {
            h.clear();
            Pip.removeListener('knob1', onKnob1);
            Pip.removeListener('knob2', onKnob2);
            Pip.removeAllListeners('updateImg');
            Pip.removeAllListeners('takeFromCam');
            Pip.removeAllListeners('drawFooter');
            clearWatch(camWatch);

            process.memory(true);
            //if (ThrobberInterval) clearInterval(ThrobberInterval);
            //if (ThrobberTimeout) clearTimeout(ThrobberTimeout);
        },
    };
});