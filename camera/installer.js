
// Logic for Camera Module Installer

// --- Espruino Core Init ---
if (typeof window.Patches === 'undefined') {
    window.Patches = {};
}

// Initialize Espruino Core modules that are needed
if (!Espruino.Core.Notifications) {
    Espruino.Core.Notifications = {
        success: function (e) { console.log('✓', e); },
        error: function (e) { console.error('✗', e); },
        warning: function (e) { console.warn('⚠', e); },
        info: function (e) { console.log('ℹ', e); }
    };
}
if (!Espruino.Core.Status) {
    Espruino.Core.Status = {
        setStatus: function (e, len) { console.log('Status:', e); },
        hasProgress: function () { return false; },
        incrementProgress: function (amt) { }
    };
}

// --- Espruino File Protocol Helpers (Copied from patcher.js) ---
let packetAckResolve = null;
let packetAckReject = null;
let packetTimeout = null;

async function espruinoSendPacket(pkType, data, options = {}) {
    const timeout = options.timeout || 5000;

    const PKTYPES = {
        RESPONSE: 0,
        EVAL: 0x2000,
        EVENT: 0x4000,
        FILE_SEND: 0x6000,
        DATA: 0x8000,
        FILE_RECV: 0xA000
    };

    if (!(pkType in PKTYPES)) throw new Error(`Unknown packet type: ${pkType}`);
    if (data.length > 0x1FFF) throw new Error('Packet data too long');

    const flags = data.length | PKTYPES[pkType];
    const header = String.fromCharCode(16, 1, (flags >> 8) & 0xFF, flags & 0xFF);
    const packet = header + data;

    return new Promise((resolve, reject) => {
        Espruino.Core.Serial.setBinary(true);

        if (!options.noACK) {
            packetAckResolve = () => {
                Espruino.Core.Serial.setBinary(false);
                resolve();
            };
            packetAckReject = (err) => {
                Espruino.Core.Serial.setBinary(false);
                reject(err);
            };
            packetTimeout = setTimeout(() => {
                packetAckResolve = null;
                packetAckReject = null;
                packetTimeout = null;
                Espruino.Core.Serial.setBinary(false);
                reject(new Error(`Packet timeout (${timeout}ms)`));
            }, timeout);
        }

        Espruino.Core.Serial.write(packet, false, () => {
            if (options.noACK) {
                Espruino.Core.Serial.setBinary(false);
                resolve();
            }
        });
    });
}

async function espruinoSendFile(filename, data, options = {}) {
    if (typeof data !== 'string') throw new Error("'data' must be a String");

    const CHUNK = options.chunkSize || 1024;
    const progressHandler = options.progress || (() => { });
    const packetOptions = { noACK: !!options.noACK };

    const fileSendOptions = {
        fn: filename,
        s: data.length
    };
    if (options.fs) {
        fileSendOptions.fs = 1;
    }

    const packetTotal = Math.ceil(data.length / CHUNK) + 1;
    let packetCount = 0;

    console.log(`Sending file: ${filename} (${data.length} bytes, fs:${options.fs ? 1 : 0})`);
    progressHandler(0, packetTotal);

    await espruinoSendPacket('FILE_SEND', JSON.stringify(fileSendOptions));

    let offset = 0;
    while (offset < data.length) {
        const chunk = data.substring(offset, offset + CHUNK);
        offset += chunk.length;
        packetCount++;

        progressHandler(packetCount, packetTotal);
        await espruinoSendPacket('DATA', chunk, packetOptions);
    }

    console.log(`File sent: ${filename}`);
}

// --- Main Installer Logic ---

const installButton = document.getElementById('install-button');
const statusArea = document.getElementById('status-area');
let serialDataBuffer = '';

function log(msg, type = 'normal') {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = `> ${msg}`;
    statusArea.appendChild(div);
    statusArea.scrollTop = statusArea.scrollHeight;
    console.log(`[Installer] ${msg}`);
}

// 1. Connection & Setup
installButton.addEventListener('click', async () => {
    if (installButton.disabled) return;

    installButton.disabled = true;
    installButton.textContent = "CONNECTING...";
    log("Initializing connection protocol...");

    // Setup listener
    Espruino.Core.Serial.startListening(function (data) {
        const uint8Array = new Uint8Array(data);
        let str = '';
        for (let i = 0; i < uint8Array.length; i++) str += String.fromCharCode(uint8Array[i]);

        // ACK/NAK handling
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            if (ch === 0x06 && packetAckResolve) { // ACK
                if (packetTimeout) clearTimeout(packetTimeout);
                const resolve = packetAckResolve;
                packetAckResolve = null; packetAckReject = null; packetTimeout = null;
                resolve();
            } else if (ch === 0x15 && packetAckReject) { // NAK
                if (packetTimeout) clearTimeout(packetTimeout);
                const reject = packetAckReject;
                packetAckResolve = null; packetAckReject = null; packetTimeout = null;
                reject(new Error('NAK received'));
            }
        }
        serialDataBuffer += str;
    });

    Espruino.Core.Serial.getPorts(function (ports) {
        if (!ports || ports.length === 0) {
            log("ERROR: No ports found.", 'error');
            installButton.disabled = false;
            installButton.textContent = "RETRY CONNECTION";
            return;
        }

        const stm32Port = ports.find(p => p.usb && p.usb[0] === 0x0483);
        const selectedPort = stm32Port || ports[0];

        log(`Opening port: ${selectedPort.path}...`);

        Espruino.Core.Serial.open(selectedPort.path, function (cInfo) {
            if (cInfo && !cInfo.error) {
                log("Port opened successfully.", "success");

                // Disable slow write and give more time for initial chatter to settle
                setTimeout(() => {
                    Espruino.Core.Serial.setSlowWrite(false, true);
                    startInstallation();
                }, 1500);

            } else {
                log(`Connection failed: ${cInfo?.error || 'Unknown error'}`, 'error');
                installButton.disabled = false;
                installButton.textContent = "RETRY CONNECTION";
            }
        }, function (disconnectInfo) {
            log("Device disconnected.");
            installButton.disabled = false;
            installButton.textContent = "INITIALIZE CONNECTION & INSTALL";
        });
    });
});

async function writeCommand(cmd, showLog = false) {
    return new Promise((resolve) => {
        // Clear buffer before writing if we expect a specific response
        // but here we just append to buffer, handled by listener
        Espruino.Core.Serial.write(cmd, showLog, () => {
            resolve();
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 2. Read Version
async function startInstallation() {
    try {
        log("Resetting device to ensure clean state...");
        await writeCommand('\x10reset();\n');
        await delay(2000);
        await writeCommand('\x10echo(0);\n'); // Turn off echo
        await delay(500);

        log("Checking firmware version...");

        // Clear buffer (important to remove previous noise)
        serialDataBuffer = '';

        // Read VERSION variable directly
        await writeCommand(`\x10if(typeof VERSION!=="undefined") print("V:" + VERSION); else print("V:NONE");\n`);

        // Wait for response
        let version = null;
        let attempts = 0;
        const maxAttempts = 30; // 6 seconds total

        while (attempts < maxAttempts) {
            await delay(200);

            // Look for our specific tag
            if (serialDataBuffer.includes("V:")) {
                const match = serialDataBuffer.match(/V:([0-9\.]+)/);
                if (match) {
                    let rawVersion = match[1];
                    // Clean up version string
                    rawVersion = rawVersion.replace(/[^0-9\.]/g, '');

                    if (rawVersion && rawVersion !== "NONE") {
                        // If version has 3 parts (1.29.123), match only major.minor
                        const parts = rawVersion.split('.');
                        if (parts.length >= 2) {
                            version = `${parts[0]}.${parts[1]}`;
                        }
                    }
                    if (version) break;
                    if (rawVersion === "NONE") break; // explicitly missing
                }
            }
            attempts++;
        }

        if (!version) {
            log(`Raw buffer start: ${serialDataBuffer.substring(0, 50)}...`, 'warn');
            throw new Error("Could not read VERSION file or file missing. Is the SD card inserted?");
        }

        log(`Detected Firmware Version: ${version}`, "success");

        // 3. Matched Firmware?
        if (!FW_VERSIONS[version]) {
            throw new Error(`Unsupported firmware version: ${version}. Supported: ${Object.keys(FW_VERSIONS).join(', ')}`);
        }

        const fwInfo = FW_VERSIONS[version];
        log(`Target Firmware: ${fwInfo.file}`);

        // 4. Fetch Firmware & Patch
        log("Downloading base firmware...");
        const fwUrl = `../Firmware/${fwInfo.file}`;
        const response = await fetch(fwUrl);
        if (!response.ok) throw new Error(`Failed to download ${fwUrl}`);
        let firmwareContent = await response.text();

        log("Loading Camera Module patch...");
        const cameraPatchScript = document.createElement('script');
        cameraPatchScript.src = '../Patches/CameraModule.js';

        await new Promise((resolve, reject) => {
            cameraPatchScript.onload = resolve;
            cameraPatchScript.onerror = () => reject(new Error("Failed to load CameraModule.js"));
            document.body.appendChild(cameraPatchScript);
        });

        if (!window.Patches.CameraModule) throw new Error("CameraModule patch data not found after loading script.");

        // 5. Apply Patch
        log("Applying Camera Module patch...", "success");
        firmwareContent = applyPatch(firmwareContent, "CameraModule", window.Patches.CameraModule);

        // Minify
        log("Optimizing firmware...");
        if (window.Espruino && Espruino.Plugins && Espruino.Plugins.Minify) {
            // Config for minification
            if (Espruino.Config) {
                Espruino.Config.MINIFICATION_LEVEL = "ESPRIMA";
                Espruino.Config.MODULE_MINIFICATION_LEVEL = "ESPRIMA";
                Espruino.Config.MINIFICATION_Mangle = true;
                Espruino.Config.PRETOKENISE = 2;
            }

            // Check if preminify exists
            if (typeof Espruino.Plugins.Minify.preminify === 'function') {
                firmwareContent = Espruino.Plugins.Minify.preminify(firmwareContent) || firmwareContent;
                log("Minification complete.");
            } else {
                log("Minifier (preminify) not available - skipping optimization.", "warn");
            }
        } else {
            log("Espruino Minify plugin not loaded - skipping optimization.", "warn");
        }

        // Pretokenise
        if (window.Espruino && Espruino.Plugins && Espruino.Plugins.Pretokenise) {
            if (typeof Espruino.Plugins.Pretokenise.tokenise === 'function') {
                const t = Espruino.Plugins.Pretokenise.tokenise(firmwareContent);
                if (t) {
                    firmwareContent = t;
                    log("Tokenization complete.");
                }
            }
        }

        // 6. Upload
        log("Preparing to write patched firmware to Flash (.bootcde)...");

        await writeCommand('\x10g.clear();g.setFontMonofonto16().setColor(0,0.8,0).setFontAlign(0,0);\n');
        await delay(100);
        await writeCommand('\x10g.drawString("Flashing Camera Module...",240,160,true);\n');

        // Erase old .bootcde
        log("Erasing old firmware...");
        await writeCommand('\x10try{require("Storage").erase(".bootcde");}catch(e){}\n');
        await delay(500);

        log(`Writing .bootcde (${firmwareContent.length} bytes) to Flash...`);

        // fs: false for Internal Flash Storage
        await espruinoSendFile(".bootcde", firmwareContent, {
            fs: false,
            progress: (curr, total) => {
                const percent = Math.round((curr / total) * 100);
                if (curr % 5 === 0 || curr === total) {
                    log(`Flashing: ${percent}%`);
                }
            }
        });

        log("Flash write complete.", "success");

        // 7. Reboot
        log("Rebooting device...");
        await writeCommand('\x10g.clear();g.drawString("Rebooting...",240,160,true);\n');
        await delay(500);
        await writeCommand('\x10E.reboot();\n');

        log("Installation triggered! Device is rebooting.", "success");
        log("You can now close this page.");
        installButton.textContent = "INSTALLATION COMPLETE";

        // Cleanup
        setTimeout(() => {
            if (Espruino.Core.Serial.isConnected()) Espruino.Core.Serial.close();
        }, 2000);

    } catch (e) {
        log(`CRITICAL ERROR: ${e.message}`, 'error');
        installButton.disabled = false;
        installButton.textContent = "RETRY INSTALLATION";
    }
}

// --- Patching Logic (Simplified from patcher.js) ---

function applyPatch(content, patchKey, patchData) {
    let patched = content;

    // Apply Replacements
    if (patchData.replace) {
        for (const region in patchData.replace) {
            patched = applyReplacement(patched, patchKey, region, patchData.replace[region]);
        }
    }

    // Apply Insertions
    if (patchData.insert) {
        for (const marker in patchData.insert) {
            patched = applyInsertion(patched, patchKey, marker, patchData.insert[marker]);
        }
    }

    return patched;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyReplacement(content, patchKey, regionName, replacementCode) {
    const startMarkerSlashes = `//${patchKey}Begin_${regionName}`;
    const startMarkerStars = `/*${patchKey}Begin_${regionName}*/`;
    const endMarkerSlashes = `//${patchKey}End_${regionName}`;
    const endMarkerStars = `/*${patchKey}End_${regionName}*/`;

    const startIndexSlashes = content.indexOf(startMarkerSlashes);
    const startIndexStars = content.indexOf(startMarkerStars);

    let startIndex = -1;
    let startMarker = '';

    if (startIndexSlashes !== -1 && (startIndexStars === -1 || startIndexSlashes <= startIndexStars)) {
        startIndex = startIndexSlashes;
        startMarker = startMarkerSlashes;
    } else if (startIndexStars !== -1) {
        startIndex = startIndexStars;
        startMarker = startMarkerStars;
    }

    if (startIndex === -1) {
        console.warn(`Region ${regionName} start not found.`);
        return content;
    }

    const searchFrom = startIndex + startMarker.length;
    const endIndexSlashes = content.indexOf(endMarkerSlashes, searchFrom);
    const endIndexStars = content.indexOf(endMarkerStars, searchFrom);

    let endIndex = -1;
    let endMarker = '';

    if (endIndexSlashes !== -1 && (endIndexStars === -1 || endIndexSlashes <= endIndexStars)) {
        endIndex = endIndexSlashes;
        endMarker = endMarkerSlashes;
    } else if (endIndexStars !== -1) {
        endIndex = endIndexStars;
        endMarker = endMarkerStars;
    }

    if (endIndex === -1) {
        console.warn(`Region ${regionName} end not found.`);
        return content;
    }

    const contentBefore = content.substring(0, startIndex);
    const contentAfter = content.substring(endIndex + endMarker.length);
    const newBlock = `\n${replacementCode.trim()}\n`;

    return contentBefore + startMarker + newBlock + endMarker + contentAfter;
}

function applyInsertion(content, patchKey, markerName, insertionCode) {
    const markerSlashes = `//${patchKey}Insert_${markerName}`;
    const markerStars = `/*${patchKey}Insert_${markerName}*/`;

    const regex = new RegExp(`(${escapeRegExp(markerSlashes) + '(?![a-zA-Z0-9_])'})|(${escapeRegExp(markerStars)})`, 'g');

    let found = false;
    const cleanInsertionCode = insertionCode.trim();

    const newContent = content.replace(regex, (match) => {
        found = true;
        return `\n${cleanInsertionCode}\n${match}`;
    });

    if (!found) {
        console.warn(`Insertion marker ${markerName} not found.`);
        return content;
    }

    return newContent;
}
