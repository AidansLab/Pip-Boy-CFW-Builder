window.Patches.AlarmPatch = {
    insert: {
        Menu: `
		ALARM: submenuSetAlarm,
        `,
        TriggerAlarm: `
        "Trigger Alarm": function()
		{
			showAlarm(), console.log("ALARM!")
		},
        `,
        CustomRadio: `
        var stationFolders = [];
        try {
            // Read all items in the RADIO directory
            let radioDirContents = fs.readdirSync("RADIO");
            // Filter for items that are directories and NOT . or ..
            stationFolders = radioDirContents.filter(itemName => {
                if (itemName === "." || itemName === "..") return false; // <-- FIX
                try {
                    return fs.statSync("RADIO/" + itemName).dir;
                } catch (e) {
                    return !1; // Ignore files that cause stat errors
                }
            });
        } catch (e) {
            log("Could not scan RADIO for folders: " + e);
        }
        
        // --- New Helper Function ---
        // This function plays a random track from a specified station folder.
        function playFromStationFolder(folderName) {
            console.log("Playing from station folder: " + folderName);
            return new Promise((resolve, reject) => {
                var onClipEnd = () => {
                    Pip.removeListener("audioStopped", onClipEnd);
                    Pip.radioClipPlaying = !1;
                };

                if (Pip.radioClipPlaying) {
                    Pip.audioStop();
                }

                // Ensure we clear listeners from any previous track
                Pip.removeAllListeners("audioStopped");

                // --- FIX: Add delay to prevent race condition with audioStopped event ---
                setTimeout(() => {
                    try {
                        let stationFiles = fs.readdirSync("RADIO/" + folderName).filter(f => f.toUpperCase().endsWith("WAV") && !f.startsWith(".") && f.toUpperCase().startsWith("MX"));
                        if (!stationFiles.length) {
                            return reject("No WAV files in /RADIO/" + folderName);
                        }

                        let trackIndex = getRandomExcluding(stationFiles.length, Pip.lastClipIndex);
                        Pip.audioStart(\`RADIO/\${folderName}/\${stationFiles[trackIndex]}\`);
                        Pip.on("audioStopped", onClipEnd);
                        Pip.radioClipPlaying = !0;
                        Pip.lastClipIndex = trackIndex;

                    } catch (e) {
                        log("Radio folder error: " + e);
                        reject(e);
                    }
                }, 50);
            });
        }`
        },
    replace: {
       showAlarm: `
    function p()
	{
		a && clearTimeout(a), a = undefined, Pip.audioStop(), configureAlarm(), clearInterval(), Pip.videoStop(), bH.clear().flip(), bC.clear(1), bC.setFontMonofonto36().setFontAlign(0, 0), bC.drawString("ALARM TURNED OFF", 200, 100).flip(), drawFooter(), setTimeout(showMainMenu, 3e3)
	}
    
    function m(a)
	{
		a == 0 ? (delete settings.alarm.snoozeTime, saveSettings(), p()) : (Pip.clockVertical = !Pip.clockVertical, bC.clear(1).flip(), tm0 = null)
	}

	a = setTimeout(c, 6e5), Pip.on("knob1", m);
        `,
    removeOldAlarm: ``,
    AddStations: `
        "Alarm sound":
		{
			value: settings.alarm.soundIndex,
			min: 0,
			max: settings.alarm.soundFiles.length +
            (stationFolders && stationFolders.length > 0 ? stationFolders.length : 0),
			step: 1,
			format: a => {
                // 1) Normal sound files
                if (a < settings.alarm.soundFiles.length)
                    return settings.alarm.soundFiles[a].slice(0, -4);

                // 2) FM option (just after the last sound file)
                if (a === settings.alarm.soundFiles.length)
                    return "FM " + rd.freq.toFixed(1);

                // 3) Extra options allowed only when custom radio stations exist
                if (a > settings.alarm.soundFiles.length && stationFolders && stationFolders.length > 0)
                {
                    let indexInStationList = a - (settings.alarm.soundFiles.length + 1);

                    if (indexInStationList >= 0 && indexInStationList < stationFolders.length)
                        return stationFolders[indexInStationList];
                }

                // fallback
                return "Unknown";
            },
			onchange: a => {
                settings.alarm.soundIndex = a;

                if (a < settings.alarm.soundFiles.length) {
                    // Normal alarm sound
                    Pip.audioStart("ALARM/" + settings.alarm.soundFiles[a]);
                }; 
                if (a === settings.alarm.soundFiles.length) {
                    Pip.audioStop();
                    };
                if (a > settings.alarm.soundFiles.length) {
                    let indexInStationList = a - (settings.alarm.soundFiles.length + 1);
                    console.log("Index in Station List:", indexInStationList);
                    console.log("Station Folders:", stationFolders);
                    console.log("Station Folder:", stationFolders[indexInStationList]);
                    playFromStationFolder(stationFolders[indexInStationList])
                    // Save the chosen station in a setting
                    settings.alarm.customStation = stationFolders[indexInStationList] || null;
                };

                // Save settings after 5 seconds
                if (b) clearTimeout(b);
                b = setTimeout(() => saveSettings(), 5000);
            }
		},
    `,   
    AlarmSound: `
        function playFromStationFolder(folderName) {
            console.log("Playing from station folder: " + folderName);
            return new Promise((resolve, reject) => {
                var onClipEnd = () => {
                    Pip.removeListener("audioStopped", onClipEnd);
                    Pip.radioClipPlaying = !1;
                };

                if (Pip.radioClipPlaying) {
                    Pip.audioStop();
                }

                // Ensure we clear listeners from any previous track
                Pip.removeAllListeners("audioStopped");

                // --- FIX: Add delay to prevent race condition with audioStopped event ---
                setTimeout(() => {
                    try {
                        let stationFiles = fs.readdirSync("RADIO/" + folderName).filter(f => f.toUpperCase().endsWith("WAV") && !f.startsWith(".") && f.toUpperCase().startsWith("MX"));
                        if (!stationFiles.length) {
                            return reject("No WAV files in /RADIO/" + folderName);
                        }

                        let trackIndex = getRandomExcluding(stationFiles.length, Pip.lastClipIndex);
                        Pip.audioStart(\`RADIO/\${folderName}/\${stationFiles[trackIndex]}\`);
                        Pip.on("audioStopped", onClipEnd);
                        Pip.radioClipPlaying = !0;
                        Pip.lastClipIndex = trackIndex;

                    } catch (e) {
                        log("Radio folder error: " + e);
                        reject(e);
                    }
                }, 50);
            });
        };
    if (d === settings.alarm.soundFiles.length) {
        // Case 1: d is exactly the length → enable RD after 1 second
        setTimeout(() => {
            rd.enable(true);
        }, 1000);

    } else if (d > settings.alarm.soundFiles.length) {
        // Case 2: d is larger → play custom station
        console.log("Playing custom station:", settings.alarm.customStation);

        Pip.audioStop();
        playFromStationFolder(settings.alarm.customStation)
            .catch(err => console.log("Station error: " + err));

    } else {
        // Case 3: play regular alarm file
        if (o) console.log("Playing alarm sound file: " + settings.alarm.soundFiles[d]);
        Pip.audioStart(\`ALARM/\${settings.alarm.soundFiles[d]}\`, { repeat: true });
    }`
    }
};

// python3 -m http.server 8000
// http://localhost:8080/index.html
