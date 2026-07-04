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

    const gamma = 0.7; // <1 boosts midtone brightness of rendered photos

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

    let busy = 0; //State is either 0 not busy, 1 busy, 2 managing pics.

    let cR = 0, cG = 1, cB = 0; // Default to Green if settings are missing

    if (Pip.settings.theme) {
        // Extract RGB from theme color value
        cR = ((Pip.settings.theme >> 16) & 0xFF) / 255;
        cG = ((Pip.settings.theme >> 8) & 0xFF) / 255;
        cB = (Pip.settings.theme & 0xFF) / 255;
    }

    function drawPicture() {
        h.clearRect(0, 51, 480, 290);

        if (imageArray.length == 0) {
            h.setFontMonofonto18().setFontAlign(0, 0).drawString("NO IMAGES", h.getWidth() / 2, h.getHeight() / 2).setColor(3);
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
            h.setFontMonofonto18().setFontAlign(0, 0).drawString("Image corrupt, try reconverting", h.getWidth() / 2, h.getHeight() / 2).setColor(3);
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
        drawPicture();
    }

    function updateImageFromCam() {
        buildImageArray();
        updateImage();
    }

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
            h.setFontMonofonto18().setFontAlign(0, 0).drawString("NOT ENOUGH FREE SPACE ON SD", h.getWidth() / 2, h.getHeight() / 2).setColor(3);
            return;
        } else
            if (process.memory(false).free - 6 < 600) {
                h.clearRect(0, 51, 480, 290);
                h.setFontMonofonto18().setFontAlign(0, 0).drawString("NOT ENOUGH MEMORY", h.getWidth() / 2, h.getHeight() / 2).setColor(3);
                return;
            }

        busy = 1;
        saveSettings();
        console.log("TakePic," + Pip.settings.camera.brightness + "," + Pip.settings.camera.contrast + "," + Pip.settings.camera.corruption + "\n");
        h.clearRect(0, 51, 480, 290);
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
            h.setFontMonofonto28().setFontAlign(-1, -1).setColor(3);
            h.clearRect(48, 5, 110, 45);
            Pip.settings.camera.brightness += dir;
            h.drawString(Pip.settings.camera.brightness, 48, 10);
        } else if (knob == 1) // Contrast
        {
            h.setFontMonofonto28().setFontAlign(1, -1).setColor(3);
            h.clearRect(370, 5, 432, 45);
            Pip.settings.camera.contrast += -dir;
            h.drawString(Pip.settings.camera.contrast, 432, 10);
        }
    }

    function DisplaySetup() {
        h.clear();

        if (appMode == 0) {
            h.setFontMonofonto36().setFontAlign(0, -1).setColor(3);
            h.drawString("PIP-CAM", h.getWidth() / 2, 0);
            h.setFontMonofonto28().setFontAlign(-1, -1).setColor(3);
            h.drawString("B:" + Pip.settings.camera.brightness, 20, 10);
            h.setFontMonofonto28().setFontAlign(1, -1).setColor(3);
            h.drawString(Pip.settings.camera.contrast + ":C", 460, 10);
        }
        else if (appMode == 1) {
            h.setFontMonofonto36().setFontAlign(0, -1).setColor(3);
            h.drawString("PIP-CAM PHOTOS", h.getWidth() / 2, 0);
        }

        drawFooter();
    }

    function drawFooter() {
        h.setFontMonofonto18().setFontAlign(0, -1).setColor(2);
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
        },
    };
});