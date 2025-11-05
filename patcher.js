document.addEventListener('DOMContentLoaded', () => {
    const fwSelect = document.getElementById('fw-select');     // Select dropdown
    const patchListDiv = document.getElementById('patch-list');
    const patchButton = document.getElementById('patch-button');
    const downloadLink = document.getElementById('download-link');
    const writeSDButton = document.getElementById('write-sd-button');
    const writeFlashButton = document.getElementById('write-flash-button');

    let baseFileContent = null;
    let selectedFileName = 'FW_patched.js'; // Default download name
    let patchScriptsLoaded = 0;
    let generatedFirmware = null; // Store the generated firmware for SD card writing
    let firmwareVersion = null; // Store the selected firmware version
    // Check if PATCH_MANIFEST exists and is defined before getting keys
    const totalPatches = (typeof PATCH_MANIFEST !== 'undefined' && PATCH_MANIFEST) ? Object.keys(PATCH_MANIFEST).length : 0;

    // --- 1. Populate FW Dropdown ---
    // Check if FW_VERSIONS exists and is defined
    if (typeof FW_VERSIONS === 'undefined' || !FW_VERSIONS || Object.keys(FW_VERSIONS).length === 0) {
        console.error("FW_VERSIONS manifest not found, is undefined, or is empty.");
        fwSelect.innerHTML = '<option value="">Error loading versions</option>';
        fwSelect.disabled = true;
        patchButton.disabled = true; // Disable patch button if FW versions fail
    } else {
        for (const versionKey in FW_VERSIONS) {
            const versionInfo = FW_VERSIONS[versionKey];
            const option = document.createElement('option');
            option.value = "Firmware/" + versionInfo.file; // Use filename as value for fetching
            option.textContent = versionInfo.name || `Version ${versionKey}`;
            fwSelect.appendChild(option);
        }
    }

    // --- 2. Patch Loading and UI Population ---
    if (totalPatches === 0) {
        patchListDiv.innerHTML = '<p>No patches found in manifest (PATCH_MANIFEST).</p>';
        // Don't completely disable if FW might load later, just note no patches
        if (!baseFileContent) patchButton.disabled = true;
    } else {
        // Clear the "Loading..." text
        patchListDiv.innerHTML = '';

        // Loop through the manifest and dynamically load each patch script
        for (const patchKey in PATCH_MANIFEST) {
            const patchInfo = PATCH_MANIFEST[patchKey];
            // Basic check if patchInfo is valid
            if (!patchInfo || !patchInfo.file) {
                console.error(`Invalid patch info for key "${patchKey}" in PATCH_MANIFEST.`);
                patchScriptsLoaded++; // Increment counter even for errors to avoid blocking UI
                const errorDiv = document.createElement('div');
                errorDiv.className = 'patch-item';
                errorDiv.style.color = 'red';
                errorDiv.innerHTML = `<label style="text-decoration: line-through;">${patchInfo?.name || patchKey}</label><p>Invalid manifest entry. Check console.</p>`;
                patchListDiv.appendChild(errorDiv);
                continue; // Skip to next patch
            }

            const script = document.createElement('script');
            script.src = patchInfo.file;
            script.async = false; // Load scripts sequentially to help ensure dependencies if needed

            script.onload = () => {
                patchScriptsLoaded++;
                // Check if the patch data was actually added by the script
                if (window.Patches && window.Patches[patchKey]) {
                    createPatchCheckbox(patchKey, patchInfo);
                    console.log(`Successfully loaded and processed patch: ${patchKey} from ${patchInfo.file}`);
                } else {
                    console.error(`Patch script ${patchInfo.file} loaded, but window.Patches.${patchKey} is undefined. Check the script content.`);
                     // Display an error in the UI for this patch
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'patch-item';
                    errorDiv.style.color = 'red';
                    errorDiv.innerHTML = `<label style="text-decoration: line-through;">${patchInfo.name}</label><p>Error loading patch data. Check script content & console.</p>`;
                    patchListDiv.appendChild(errorDiv);
                }

                // If all patch scripts have finished attempting to load
                if (patchScriptsLoaded === totalPatches) {
                    console.log(`All ${totalPatches} patch scripts processed.`);
                }
            };

            script.onerror = (event) => {
                console.error(`Failed to load patch script file: ${patchInfo.file}`, event);
                patchScriptsLoaded++;
                 // Display an error in the UI for this patch
                 const errorDiv = document.createElement('div');
                 errorDiv.className = 'patch-item';
                 errorDiv.style.color = 'red';
                 errorDiv.innerHTML = `<label style="text-decoration: line-through;">${patchInfo.name}</label><p>Failed to load script file (${patchInfo.file}). Check path & console.</p>`;
                 patchListDiv.appendChild(errorDiv);

                 if (patchScriptsLoaded === totalPatches) {
                    console.log(`All ${totalPatches} patch scripts processed (with errors).`);
                }
            };

            document.body.appendChild(script);
        }
    }

    /**
     * Creates and adds a checkbox item to the patch list div.
     * This version builds DOM elements to prevent event bubbling.
     */
    function createPatchCheckbox(patchKey, patchInfo) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'patch-item';

        const checkboxId = `patch-${patchKey}`;

        // Create Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.dataset.patchKey = patchKey;
        
        // Create Label
        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = patchInfo.name;

        // Add checkbox and label
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);

        // --- Handle Text Input ---
        if (patchInfo.inputType === 'text') {
            const inputId = `patch-input-${patchKey}`;
            const placeholder = patchInfo.placeholder || '';

            // Add <br>
            itemDiv.appendChild(document.createElement('br'));

            // Create Text Input
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = inputId;
            textInput.placeholder = placeholder;
            textInput.className = 'patch-text-input';
            textInput.style.marginLeft = '20px';
            textInput.style.marginTop = '5px';

            // *** FIX: Stop click events from bubbling up to the label ***
            textInput.addEventListener('click', (event) => {
                event.stopPropagation();
            });

            itemDiv.appendChild(textInput);
        }
        // --- End Text Input ---

        // Create Description
        const description = document.createElement('p');
        description.textContent = patchInfo.description;
        itemDiv.appendChild(description);

        // Add the completed item to the list
        patchListDiv.appendChild(itemDiv);
    }


    // --- 3. Firmware Selection Handling ---
    fwSelect.addEventListener('change', async (event) => {
        const selectedFile = event.target.value;
        patchButton.disabled = true; // Disable while loading
        patchButton.textContent = 'Loading FW...';
        baseFileContent = null;
        downloadLink.style.display = 'none'; // Hide download link

        if (!selectedFile) {
            patchButton.textContent = '1. Select FW Version';
            return;
        }

        try {
            console.log(`Fetching FW: ${selectedFile}`);
            const response = await fetch(selectedFile);
            if (!response.ok) {
                // More specific error for common GitHub Pages 404
                if(response.status === 404 && window.location.hostname.endsWith('github.io')){
                     throw new Error(`HTTP 404: File not found. Make sure '${selectedFile}' exists in the repository and the filename/path in fw_manifest.js is correct (case-sensitive).`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status} loading ${selectedFile}`);
                }
            }
            // Read as text using UTF-8 explicitly
            baseFileContent = await response.text();
            selectedFileName = selectedFile.replace('.js', '_patched.js'); // Update download name
            
            // Extract firmware version from the selected file
            // Look for VERSION constant in the file content
            const versionMatch = baseFileContent.match(/const\s+VERSION\s*=\s*["']([0-9.]+)["']/);
            if (versionMatch && versionMatch[1]) {
                firmwareVersion = versionMatch[1];
                console.log(`Detected firmware version: ${firmwareVersion}`);
            } else {
                // Fallback: try to extract from filename (e.g., FW_1.29.js -> 1.29)
                const fileVersionMatch = selectedFile.match(/FW_([0-9.]+)\.js/);
                firmwareVersion = fileVersionMatch ? fileVersionMatch[1] : 'unknown';
                console.log(`Using version from filename: ${firmwareVersion}`);
            }
            
            patchButton.disabled = false; // Re-enable button
            patchButton.textContent = 'Patch File';
            console.log(`${selectedFile} loaded successfully.`);
        } catch (error) {
            console.error('Error fetching firmware file:', error);
            alert(`Failed to load ${selectedFile}.\nError: ${error.message}`);
            patchButton.textContent = 'Error Loading FW';
            event.target.value = ''; // Reset dropdown
        }
    });


    // --- 4. Patching Logic ---
    patchButton.addEventListener('click', () => {
        if (!baseFileContent) {
            alert('Please select a base FW version from the dropdown first.');
            return;
        }

        downloadLink.download = selectedFileName; // Set download name based on selected FW

        let patchedContent = baseFileContent;
        const selectedPatches = patchListDiv.querySelectorAll('input[type="checkbox"]:checked');

        if (selectedPatches.length === 0) {
            alert('No patches selected. Click Download to get the selected base FW file.');
            // Minify the base firmware even if no patches are selected
            let minifiedContent = patchedContent;
            try {
                if (window.Espruino && Espruino.Plugins && Espruino.Plugins.Minify && typeof Espruino.Plugins.Minify.preminify === 'function') {
                    const m = Espruino.Plugins.Minify.preminify(patchedContent);
                    if (m) minifiedContent = m;
                }
            } catch (e) {
                console.warn('Minification failed or Minify plugin not available, using original content.', e);
            }

            // Allow downloading the base file if no patches selected
            createDownloadLink(minifiedContent, selectedFileName.replace('_patched.js', '.js')); // Use original name
            return;
        }

        console.log("Starting patching process...");

        try {
            selectedPatches.forEach(checkbox => {
                const patchKey = checkbox.dataset.patchKey;
                console.log(`Applying patch: ${patchKey}`);
                const patchData = window.Patches[patchKey];

                // Robust check for patch data
                if (!patchData || typeof patchData !== 'object') {
                    const patchManifestInfo = PATCH_MANIFEST[patchKey];
                    const scriptSrc = patchManifestInfo ? patchManifestInfo.file : 'Unknown script';
                    throw new Error(`Patch data object for "${patchKey}" (from ${scriptSrc}) is missing or invalid. Check the patch script file and browser console for loading errors.`);
                }


                // Process Replacements first
                if (patchData.replace && typeof patchData.replace === 'object') {
                    console.log(` -> Processing replacements for ${patchKey}`);
                    for (const regionName in patchData.replace) {
                        console.log(`    - Replacing region: ${regionName}`);
                        patchedContent = applyReplacement(patchedContent, patchKey, regionName, patchData.replace[regionName]);
                    }
                } else {
                     console.log(` -> No valid 'replace' object found for ${patchKey}`);
                }

                // Process Insertions
                if (patchData.insert && typeof patchData.insert === 'object') {
                     console.log(` -> Processing insertions for ${patchKey}`);
                    for (const markerName in patchData.insert) {
                        const fullMarker = `//${patchKey}Insert_${markerName}`; // Construct the full marker string

                        console.log(`    - Inserting at marker: ${markerName}`);
                        const insertionCode = patchData.insert[markerName];
                        const originalLength = patchedContent.length; // Store length before insertion
                        patchedContent = applyInsertion(patchedContent, patchKey, markerName, insertionCode);

                        if (patchedContent.length > originalLength) {
                             console.log(`    - Successfully inserted at ${fullMarker}`);
                        }
                    }
                } else {
                     console.log(` -> No valid 'insert' object found for ${patchKey}`);
                }
                
                // Process Find/Replace Array
                if (patchData.find && Array.isArray(patchData.find)) {
                    console.log(` -> Processing find/replace array for ${patchKey}`);

                    // Loop through each find/replace job in the patch's 'find' array
                    patchData.find.forEach(job => {
                        if (!job || typeof job.string !== 'string') {
                            console.warn(`    - Invalid job in find array for ${patchKey}. Skipping.`);
                            return; // skip to next job
                        }

                        let replacementString = '';
                        const stringToFind = job.string;

                        // Check if this job uses the text input
                        if (job.useInput === true) {
                            const inputElement = document.getElementById(`patch-input-${patchKey}`);
                            if (!inputElement) {
                                console.warn(`    - Job for "${stringToFind}" needs text input, but none found for ${patchKey}. Skipping.`);
                                return;
                            }
                            
                            let newName = inputElement.value;
                            if (!newName || newName.trim() === '') {
                                console.log(`    - No new name provided in text box for "${stringToFind}". Skipping.`);
                                return;
                            }
                            // Format as a JS string literal, wrapping in quotes
                            replacementString = '"' + newName.trim().replace(/"/g, '\\"') + '"';

                        } 
                        // Check if it's a hard-coded replacement
                        else if (typeof job.replace === 'string') {
                            replacementString = job.replace;
                        } 
                        // If no replacement is defined, skip
                        else {
                            console.warn(`    - Job for "${stringToFind}" has no 'useInput' or 'replace' value. Skipping.`);
                            return;
                        }

                        // 5. Create a global regex and replace all instances
                        console.log(`    - Replacing all instances of ${stringToFind} with ${replacementString}`);
                        const findRegex = new RegExp(escapeRegExp(stringToFind), 'g');
                        const originalLength = patchedContent.length;
                        
                        patchedContent = patchedContent.replace(findRegex, replacementString);

                        if (patchedContent.length === originalLength) {
                            console.warn(`    - String ${stringToFind} was not found in the file.`);
                        } else {
                            console.log(`    - Successfully replaced ${stringToFind}.`);
                        }
                    }); // End of find.forEach
                }

                 console.log(` -> Finished patch: ${patchKey}`);
            }); // --- END of selectedPatches.forEach ---
			
            // --- Post-Patching Combination Checks ---
			console.log("Checking for patch combinations...");
            // Create an array of the keys of the selected patches
            const selectedKeys = Array.from(selectedPatches).map(cb => cb.dataset.patchKey);

            // Check if both 'SpecialPatch' and 'PerksPatch' are in the array
            const hasSpecialPatch = selectedKeys.includes('SpecialPatch');
            const hasPerksPatch = selectedKeys.includes('PerksPatch');

            // If both patches were selected, apply the special replacement
            if (hasSpecialPatch && hasPerksPatch) {
                console.log(" -> Applying SpecialPatch + PerksPatch combination replacement.");
                const comboPatchKey = 'SpecialPerksCombo'; // Our virtual key
                const comboRegionName = 'StatMenuItems';    // Matches markers added to base FW
                const comboReplacementCode = `
            CONN: submenuConnect,
            DIAG: submenuDiagnostics`; // The new code to insert

                // Use the existing applyReplacement function
                patchedContent = applyReplacement(patchedContent, comboPatchKey, comboRegionName, comboReplacementCode);
            } else {
                 console.log(" -> Special/Perks combination conditions not met.");
            }
            // --- END Combination Checks ---

            console.log("Patching process complete.");

            // --- 5. Append epoch digits to VERSION ---
            patchedContent = appendEpochToVersion(patchedContent);

            // --- 6. Create Download ---
            createDownloadLink(patchedContent, selectedFileName);


        } catch (error) {
             console.error("Error during patching loop:", error); // Log specific error
            alert(`An error occurred during patching:\n${error.message}\nCheck the console (F12) for more details.`);
            downloadLink.style.display = 'none'; // Hide link on error
        }
    }); // End of patchButton listener

    /**
     * Creates the download link.
     */
     function createDownloadLink(content, filename) {
        console.log(`Creating download Blob for ${filename}...`);

        // Ensure Espruino config matches requested behavior:
        // - Minification: Esprima
        // - Module Minification: Esprima
        // - Esprima: Mangle = true
        // - Pretokenise: yes (2)
        try {
            if (window.Espruino && Espruino.Config) {
                Espruino.Config.MINIFICATION_LEVEL = "ESPRIMA";
                Espruino.Config.MODULE_MINIFICATION_LEVEL = "ESPRIMA";
                Espruino.Config.MINIFICATION_Mangle = true;
                Espruino.Config.PRETOKENISE = 2; // 'Yes (always tokenise everything)'
                console.log('Espruino config set: MINIFICATION_LEVEL=ESPRIMA, MODULE_MINIFICATION_LEVEL=ESPRIMA, MINIFICATION_Mangle=true, PRETOKENISE=2');
            }
        } catch (e) {
            console.warn('Could not set Espruino.Config defaults before minify/tokenise', e);
        }

        // Minify the content before creating the blob
        const minifiedContent = Espruino.Plugins.Minify.preminify(content);
        
         // Use minified content if successful, otherwise use original
        let finalContent = minifiedContent || content;

            // If Pretokenise is available, tokenise the final content the same way
            // EspruinoWebIDE does (use tokenise() if present and content is not
            // already tokenised). This will make the file suitable for Espruino
            // interpreter pretokenised uploads.
            try {
                if (window.Espruino && Espruino.Plugins && Espruino.Plugins.Pretokenise && typeof Espruino.Plugins.Pretokenise.tokenise === 'function') {
                    const t = Espruino.Plugins.Pretokenise.tokenise(finalContent);
                    if (t) {
                        // tokenise returns the transformed code; use it
                        finalContent = t;
                        console.log('Pretokenise: content tokenised for download.');
                    }
                }
            } catch (e) {
                console.warn('Pretokenise failed or unavailable; proceeding with original content.', e);
            }

            // Convert finalContent to ANSI (single-byte) bytes and create a Blob from those bytes.
            // We map each JS 16-bit code unit to a single byte by taking the low 8 bits.
            // This matches Espruino's expectation for pretokenised binary-like files.
            try {
                const buf = new Uint8Array(finalContent.length);
                for (let i = 0; i < finalContent.length; i++) {
                    const code = finalContent.charCodeAt(i);
                    buf[i] = code & 0xFF; // ANSI single-byte mapping
                }
                var blob = new Blob([buf], { type: 'text/javascript' });
            } catch (e) {
                console.warn('Failed to create ANSI blob, falling back to UTF-8 blob', e);
                var blob = new Blob([finalContent], { type: 'text/javascript;charset=utf-8' });
            }
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = filename; // Use the provided filename
        downloadLink.style.display = 'block';
        console.log("Download link created.");
        
        // Store the generated firmware and enable the Write buttons
        generatedFirmware = finalContent;
        writeSDButton.disabled = false;
        writeSDButton.textContent = 'WRITE TO SD CARD';
        writeFlashButton.disabled = false;
        writeFlashButton.textContent = 'WRITE TO FLASH';
        
        alert('File ready! Click the download link below, write to SD card, or write to flash.');
     }

    // --- Function to append epoch digits to VERSION ---
    function appendEpochToVersion(content) {
        const epochLast3 = Math.floor(Date.now() / 1000) % 1000;
        const versionRegex = /(const\s+VERSION\s*=\s*["'])([0-9.]+)(["'])/g;
        
        const updatedContent = content.replace(versionRegex, (match, prefix, version, suffix) => {
            const newVersion = `${version}.${epochLast3}`;
            console.log(`Updated VERSION from ${version} to ${newVersion}`);
            return `${prefix}${newVersion}${suffix}`;
        });
        
        return updatedContent;
    }

    // --- Write to SD Card Function ---
    async function writeToSDCard() {
        if (!generatedFirmware) {
            alert('Please generate patched firmware first!');
            return;
        }

        writeSDButton.disabled = true;
        writeSDButton.textContent = 'CONNECTING...';

        try {
            // Check if Web Serial is available
            if (!navigator.serial) {
                throw new Error('Web Serial API not supported in this browser. Please use Chrome, Edge, or Opera.');
            }

            console.log('Requesting serial port...');
            const port = await navigator.serial.requestPort({
                filters: [{ usbVendorId: 0x0483 }] // STM32 vendor ID
            });

            console.log('Opening serial port...');
            await port.open({ baudRate: 9600 });

            writeSDButton.textContent = 'CONNECTED';

            // Set up reader and writer
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();
            
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            const writer = textEncoder.writable.getWriter();

            // Helper to write commands
            async function writeCommand(cmd) {
                await writer.write(cmd);
                console.log('Sent:', cmd.replace(/\n/g, '\\n').replace(/\x10/g, '\\x10'));
            }

            // Helper to wait
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            console.log('Resetting device...');
            writeSDButton.textContent = 'RESETTING...';
            await writeCommand('\x10reset()\n');
            await delay(3000);

            // Clear the screen and display status
            console.log('Displaying status on Pip-Boy screen...');
            writeSDButton.textContent = 'PREPARING...';
            await writeCommand('\x10g.setFontMonofonto16().clearRect(0,173,478,319).setColor(0,0.8,0).setFontAlign(0,0);\n');
            await delay(100);
            await writeCommand('\x10g.drawString("Installing Custom Firmware...",240,220,true);\n');
            await delay(100);

            // Check if SD card is accessible and try to mount it
            console.log('Checking SD card...');
            writeSDButton.textContent = 'CHECKING SD...';
            await writeCommand('\x10g.drawString("Checking SD card...",240,260,true);\n');
            await delay(100);
            
            // Try to read Storage to ensure it's available
            await writeCommand('\x10try{var l=require("Storage").list();g.drawString("SD Ready: "+l.length+" files",240,280,true);}catch(e){g.drawString("SD Error: "+e,240,280,true);}\n');
            await delay(500);

            // Erase old FW.js if it exists using fs.unlink
            console.log('Erasing old FW.js if present...');
            writeSDButton.textContent = 'ERASING OLD FW...';
            await writeCommand('\x10g.drawString("Erasing old FW.js...",240,260,true);\n');
            await delay(100);
            await writeCommand('\x10try{require("fs").unlink("FW.js");}catch(e){}\n');
            await delay(500);

            // Write firmware to SD card as FW.js using E.openFile
            console.log('Writing firmware to SD card...');
            writeSDButton.textContent = 'WRITING FW.JS...';
            await writeCommand('\x10g.drawString("Opening file for write...",240,260,true);\n');
            await delay(100);
            
            // Open file for writing
            await writeCommand('\x10var fw=E.openFile("FW.js","w");\n');
            await delay(300);
            
            const CHUNK_SIZE = 512; // Smaller chunks for more reliable writing
            const totalChunks = Math.ceil(generatedFirmware.length / CHUNK_SIZE);
            
            for (let i = 0; i < generatedFirmware.length; i += CHUNK_SIZE) {
                const chunk = generatedFirmware.substr(i, CHUNK_SIZE);
                const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
                
                // Update progress
                writeSDButton.textContent = `WRITING ${chunkNum}/${totalChunks}`;
                if (chunkNum % 10 === 1 || chunkNum === totalChunks) {
                    // Update screen every 10 chunks to reduce overhead
                    await writeCommand(`\x10g.drawString("Writing ${chunkNum}/${totalChunks}     ",240,260,true);\n`);
                    await delay(50);
                }
                
                // Write chunk using file handle with error handling
                // Convert to base64 to safely transmit binary data
                const cmd = `\x10try{fw.write(atob(${JSON.stringify(btoa(chunk))}));}catch(e){g.drawString("Err: "+e.message,240,280,true);}\n`;
                await writeCommand(cmd);
                
                // Small delay between chunks
                await delay(20);
                
                console.log(`Wrote chunk ${chunkNum}/${totalChunks}`);
            }
            
            // Close the file
            console.log('Closing file...');
            writeSDButton.textContent = 'FINALIZING...';
            await writeCommand('\x10g.drawString("Closing file...",240,260,true);\n');
            await delay(100);
            await writeCommand('\x10fw.close();\n');
            await delay(500);

            // Write VERSION file
            console.log('Writing VERSION file...');
            writeSDButton.textContent = 'WRITING VERSION...';
            await writeCommand('\x10g.drawString("Writing VERSION file...",240,260,true);\n');
            await delay(100);
            
            // Delete old VERSION file if it exists
            await writeCommand('\x10try{require("fs").unlink("VERSION");}catch(e){}\n');
            await delay(300);
            
            // Create version string with epoch suffix
            const epochLast3 = Math.floor(Date.now() / 1000) % 1000;
            const versionString = firmwareVersion ? `${firmwareVersion}.${epochLast3}` : `unknown.${epochLast3}`;
            console.log(`Writing VERSION file with content: ${versionString}`);
            
            // Write VERSION file using E.openFile
            await writeCommand('\x10var vf=E.openFile("VERSION","w");\n');
            await delay(300);
            await writeCommand(`\x10vf.write(${JSON.stringify(versionString)});\n`);
            await delay(200);
            await writeCommand('\x10vf.close();\n');
            await delay(500);

            console.log('Firmware written successfully!');
            writeSDButton.textContent = 'COMPLETING...';
            
            // Display success message on Pip-Boy
            await writeCommand('\x10g.clearRect(0,173,478,319);\n');
            await delay(100);
            await writeCommand('\x10g.drawString("Custom Firmware Installed!",240,220,true);\n');
            await delay(100);
            await writeCommand(`\x10g.drawString("Version: ${versionString}",240,240,true);\n`);
            await delay(100);
            await writeCommand('\x10g.drawString("Rebooting in 3 seconds...",240,260,true);\n');
            await delay(3000);

            // Reboot
            await writeCommand('\x10E.reboot();\n');

            // Clean up
            reader.releaseLock();
            writer.releaseLock();
            await readableStreamClosed.catch(() => {});
            await writableStreamClosed.catch(() => {});
            await port.close();

            writeSDButton.textContent = 'WRITE COMPLETE!';
            alert('Custom firmware successfully written to SD card! The Pip-Boy will now reboot.');
            
            setTimeout(() => {
                writeSDButton.textContent = 'WRITE TO SD CARD';
                writeSDButton.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Error writing to SD card:', error);
            alert(`Failed to write to SD card:\n${error.message}`);
            writeSDButton.textContent = 'WRITE FAILED';
            setTimeout(() => {
                writeSDButton.textContent = 'WRITE TO SD CARD';
                writeSDButton.disabled = false;
            }, 3000);
        }
    }

    // Add event listener for Write to SD button
    if (writeSDButton) {
        writeSDButton.addEventListener('click', writeToSDCard);
    }

    // --- Write to Flash Function ---
    async function writeToFlash() {
        if (!generatedFirmware) {
            alert('Please generate patched firmware first!');
            return;
        }

        writeFlashButton.disabled = true;
        writeFlashButton.textContent = 'CONNECTING...';

        try {
            // Check if Web Serial is available
            if (!navigator.serial) {
                throw new Error('Web Serial API not supported in this browser. Please use Chrome, Edge, or Opera.');
            }

            console.log('Requesting serial port...');
            const port = await navigator.serial.requestPort({
                filters: [{ usbVendorId: 0x0483 }] // STM32 vendor ID
            });

            console.log('Opening serial port...');
            await port.open({ baudRate: 9600 });

            writeFlashButton.textContent = 'CONNECTED';

            // Set up reader and writer
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();
            
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            const writer = textEncoder.writable.getWriter();

            // Helper to write commands
            async function writeCommand(cmd) {
                await writer.write(cmd);
                console.log('Sent:', cmd.replace(/\n/g, '\\n').replace(/\x10/g, '\\x10'));
            }

            // Helper to wait
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            console.log('Resetting device...');
            writeFlashButton.textContent = 'RESETTING...';
            await writeCommand('\x10reset()\n');
            await delay(3000);

            // Clear the screen and display status
            console.log('Displaying status on Pip-Boy screen...');
            writeFlashButton.textContent = 'PREPARING...';
            await writeCommand('\x10g.setFontMonofonto16().clearRect(0,173,478,319).setColor(0,0.8,0).setFontAlign(0,0);\n');
            await delay(100);
            await writeCommand('\x10g.drawString("Writing to Flash...",240,220,true);\n');
            await delay(100);

            // Erase old .bootcde if it exists
            console.log('Erasing old .bootcde if present...');
            writeFlashButton.textContent = 'ERASING OLD...';
            await writeCommand('\x10g.drawString("Erasing old .bootcde...",240,260,true);\n');
            await delay(100);
            await writeCommand('\x10try{require("Storage").erase(".bootcde");}catch(e){}\n');
            await delay(500);

            // Write firmware to flash as .bootcde using Storage.write in chunks
            console.log('Writing firmware to flash...');
            writeFlashButton.textContent = 'WRITING TO FLASH...';
            await writeCommand('\x10g.drawString("Writing to flash...",240,260,true);\n');
            await delay(100);
            
            const CHUNK_SIZE = 1024;
            const fileName = '.bootcde';
            const totalChunks = Math.ceil(generatedFirmware.length / CHUNK_SIZE);
            
            for (let i = 0; i < generatedFirmware.length; i += CHUNK_SIZE) {
                const chunk = generatedFirmware.substr(i, CHUNK_SIZE);
                const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
                const sizeParam = (i === 0) ? `,${generatedFirmware.length}` : '';
                
                // Update progress
                writeFlashButton.textContent = `WRITING ${chunkNum}/${totalChunks}`;
                if (chunkNum % 10 === 1 || chunkNum === totalChunks) {
                    // Update screen every 10 chunks to reduce overhead
                    await writeCommand(`\x10g.drawString("Writing ${chunkNum}/${totalChunks}     ",240,280,true);\n`);
                    await delay(50);
                }
                
                // Write chunk to Storage with error handling
                const cmd = `\x10try{require("Storage").write(${JSON.stringify(fileName)},atob(${JSON.stringify(btoa(chunk))}),${i}${sizeParam});}catch(e){g.drawString("Error: "+e,240,300,true);}\n`;
                await writeCommand(cmd);
                
                // Delay between chunks to avoid overwhelming the device
                await delay(100);
                
                console.log(`Wrote chunk ${chunkNum}/${totalChunks} to flash`);
            }

            console.log('Firmware written to flash successfully!');
            writeFlashButton.textContent = 'COMPLETING...';
            
            // Display success message on Pip-Boy
            await writeCommand('\x10g.clearRect(0,173,478,319);\n');
            await delay(100);
            await writeCommand('\x10g.drawString("Flash Write Complete!",240,220,true);\n');
            await delay(100);
            await writeCommand('\x10g.drawString("Firmware in .bootcde",240,240,true);\n');
            await delay(100);
            await writeCommand('\x10g.drawString("Rebooting in 3 seconds...",240,260,true);\n');
            await delay(3000);

            // Reboot to load from flash
            await writeCommand('\x10load()\n');
            await delay(100);

            // Clean up
            reader.releaseLock();
            writer.releaseLock();
            await readableStreamClosed.catch(() => {});
            await writableStreamClosed.catch(() => {});
            await port.close();

            writeFlashButton.textContent = 'WRITE COMPLETE!';
            alert('Custom firmware successfully written to flash (.bootcde)! The Pip-Boy will now load it.');
            
            setTimeout(() => {
                writeFlashButton.textContent = 'WRITE TO FLASH';
                writeFlashButton.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Error writing to flash:', error);
            alert(`Failed to write to flash:\n${error.message}`);
            writeFlashButton.textContent = 'WRITE FAILED';
            setTimeout(() => {
                writeFlashButton.textContent = 'WRITE TO FLASH';
                writeFlashButton.disabled = false;
            }, 3000);
        }
    }

    // Add event listener for Write to Flash button
    if (writeFlashButton) {
        writeFlashButton.addEventListener('click', writeToFlash);
    }

    function applyReplacement(content, patchKey, regionName, replacementCode) {
        // Define all 4 marker styles
        const startMarkerSlashes = `//${patchKey}Begin_${regionName}`;
        const endMarkerSlashes = `//${patchKey}End_${regionName}`;
        const startMarkerStars = `/*${patchKey}Begin_${regionName}*/`;
        const endMarkerStars = `/*${patchKey}End_${regionName}*/`;

        // Ensure replacementCode is a string
        if (typeof replacementCode !== 'string') {
             console.warn(`Replacement code for "${regionName}" in patch "${patchKey}" is not a string. Skipping.`);
             return content;
        }

        // --- Find the first valid start marker ---
        const startIndexSlashes = content.indexOf(startMarkerSlashes);
        const startIndexStars = content.indexOf(startMarkerStars);
        let startIndex = -1;
        let startMarker = '';

        // Pick the marker that appears first (and is not -1)
        if (startIndexSlashes !== -1 && (startIndexStars === -1 || startIndexSlashes <= startIndexStars)) {
            startIndex = startIndexSlashes;
            startMarker = startMarkerSlashes;
        } else if (startIndexStars !== -1) {
            startIndex = startIndexStars;
            startMarker = startMarkerStars;
        }

        if (startIndex === -1) {
            console.warn(`Replacement start marker "${startMarkerSlashes}" OR "${startMarkerStars}" not found in file. Skipping region "${regionName}".`);
            return content;
        }

        // --- Find the first valid end marker *after* the start marker ---
        const searchFrom = startIndex + startMarker.length;
        const endIndexSlashes = content.indexOf(endMarkerSlashes, searchFrom);
        const endIndexStars = content.indexOf(endMarkerStars, searchFrom);
        let endIndex = -1;
        let endMarker = '';

        // Pick the marker that appears first (and is not -1)
        if (endIndexSlashes !== -1 && (endIndexStars === -1 || endIndexSlashes <= endIndexStars)) {
            endIndex = endIndexSlashes;
            endMarker = endMarkerSlashes;
        } else if (endIndexStars !== -1) {
            endIndex = endIndexStars;
            endMarker = endMarkerStars;
        }

        if (endIndex === -1) {
            console.warn(`Replacement end marker "${endMarkerSlashes}" OR "${endMarkerStars}" not found after start marker in file. Skipping region "${regionName}".`);
            return content;
        }

        // Construct the new content: part before + start marker + new code + end marker + part after
        const contentBefore = content.substring(0, startIndex);
        const contentAfter = content.substring(endIndex + endMarker.length);

        // Ensure newlines around the inserted code and markers for clarity
        const cleanReplacementCode = replacementCode.trim(); // Remove leading/trailing whitespace just in case
        const newBlock = `\n${cleanReplacementCode}\n`;

        console.log(`    - Successfully replaced content between ${startMarker} and ${endMarker}`);
        // Use the *actual* markers that were found
        return contentBefore + startMarker + newBlock + endMarker + contentAfter;
    }
    function applyInsertion(content, patchKey, markerName, insertionCode) {
        // Define both marker styles
        const markerSlashes = `//${patchKey}Insert_${markerName}`;
        const markerStars = `/*${patchKey}Insert_${markerName}*/`; // New star-based marker

         // Ensure insertionCode is a string
        if (typeof insertionCode !== 'string') {
             console.warn(`    - Insertion code for "${markerName}" in patch "${patchKey}" is not a string. Skipping.`);
             return content; // Return original content unchanged
        }

        // Create regex parts for both
        const regexSlashes = escapeRegExp(markerSlashes) + '(?![a-zA-Z0-9_])'; // Fix for substring match
        const regexStars = escapeRegExp(markerStars); // Star version is self-contained

        // Combine them with an OR |
        const regex = new RegExp(`(${regexSlashes})|(${regexStars})`, 'g');
        
        let found = false;

        // Ensure newlines for clarity. Place new code ABOVE marker.
        const cleanInsertionCode = insertionCode.trim(); // Remove leading/trailing whitespace

        const newContent = content.replace(regex, (match) => {
             found = true;
             // 'match' will be the exact marker that was found (slashes or stars)
             // We add the inserted code, a newline, and then add the *original marker* back.
             const replacement = `\n${cleanInsertionCode}\n${match}`; 
             return replacement;
        });

        if (!found) {
             // Update warning to show all markers it looked for
             console.warn(`    - Insertion marker "${markerSlashes}" OR "${markerStars}" not found in file. Skipping marker "${markerName}".`);
             return content; // Return original content if marker wasn't found
        }

        return newContent; // Return the modified content
    }

    /**
     * Helper function to escape strings for use in a RegExp.
     */
    function escapeRegExp(string) {
        // $& means the whole matched string
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

}); // End DOMContentLoaded