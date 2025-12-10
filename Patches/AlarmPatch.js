window.Patches.AlarmPatch = {
    insert: {
        Menu: `
		ALARM: submenuSetAlarm,
        `,
        TriggerAlarm: `
        "Trigger Alarm": function()
		{
            if (!settings.alarm.repeat) {
                settings.alarm.enabled = !0,
                saveSettings();
            }
			showAlarm();
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
        tm0 = null;
        let k = 0,
            b = 0,
            e = !1;
        let l = setInterval(function()
        {
            let g = Date();
            let l = g.getHours();
            let c, m;
            settings.clock12hr ? (c = (l + 11) % 12 + 1, m = l < 12 ? "AM" : "PM") : c = l.twoDigit();
            let d = g.getMinutes().twoDigit();
            let a = g.getSeconds();
            if (e)
            {
                a != ts0 && (bH.clear().flip(), bC.clear(1), bC.setFontMonofonto36().setFontAlign(0, -1), bC.setColor(a & 1 ? 3 : 2).drawString("SNOOZE", 200, 55), bC.setColor(a & 1 ? 2 : 3).drawString(settings.alarm.snooze + " MIN", 200, 105), bC.flip());
                return
            }
            d != tm0 && (bC.clear(1), Pip.clockVertical ? (bC.drawImage(dc(f), 25, 20), bC.setFontMonofonto96().drawString(c, settings.clock12hr && c < 10 ? 281 : 223, 0).drawString(d, 223, 110), settings.clock12hr && bC.setFontMonofonto28().drawString(m, 350, 177)) : (bC.drawImage(dc(i), 175, 0), bC.setFontMonofonto120().drawString(c, settings.clock12hr && c < 10 ? 93 : 20, 45).drawString(":", 160, 45).drawString(d, 228, 45)), tm0 = d), a != ts0 && (bC.setFontMonofonto120().setFontAlign(0, -1).setColor(a & 1 ? 3 : 1).drawString(":", 196, Pip.clockVertical ? 40 : 45), bH.clear().setFontMonofonto18().setFontAlign(0, -1).setColor(a & 1 ? 13 : 7).drawString("LEFT BUTTON: STOP    TOP BUTTON: SNOOZE", 185, 10, !0).flip(), ts0 = a), (++k & 7) == 0 && (Pip.clockVertical ? bC.setColor(3).drawImage(dc(h), 14, 28,
            {
                frame: b
            }) : bC.setColor(3).drawImage(dc(j), 162, 10,
            {
                frame: b
            }), b = ++b % 3), bC.flip()
        }, 50);
        let a;
        function c()
        {
            a && clearTimeout(a), a = undefined, Pip.audioStop(), Pip.videoStop(), configureAlarm(), showMainMenu()
        }
        function p()
        {
            Pip.removeListener("knob1", m), Pip.removeListener("knob2", n), Pip.removeListener("torch", n),
            a && clearTimeout(a), 
            a = undefined, 
            Pip.audioStop(), 
            configureAlarm(), 
            clearInterval(), 
            Pip.videoStop(), 
            bH.clear().flip(), 
            bC.clear(1), 
            bC.setFontMonofonto36().setFontAlign(0, 0), 
            bC.drawString("ALARM TURNED OFF", 200, 100).flip(); 
            if (settings.alarm.enabled) {
                setTimeout(q, 3e3);
            } else {
                drawFooter(), 
                setTimeout(showMainMenu, 3e3);
            }
        }
        function q()
        {   
            let b = Pip.getDateAndTime();
		    let a = new Date(settings.alarm.time);
            let hoursDecimal = (a.getTime() - b.getTime()) / 60 / 60000;
            let hrs = Math.floor(hoursDecimal);
            let mins = Math.floor((hoursDecimal - hrs) * 60);
            bH.clear().flip(), 
            bC.clear(1), 
            bC.setFontMonofonto36().setFontAlign(0, 0), 
            bC.setColor(a & 1 ? 3 : 2).drawString("ALARM SET", 200, 55), 
            bC.setColor(a & 1 ? 2 : 3).drawString(\`\${hrs} HRS \${mins} MIN FROM NOW\`, 200, 105), bC.flip()
            drawFooter(), 
            setTimeout(showMainMenu, 3e3)
        }
        
        function m(a)
        {
            a == 0 ? (delete settings.alarm.snoozeTime, saveSettings(), p()) : (Pip.clockVertical = !Pip.clockVertical, bC.clear(1).flip(), tm0 = null)
        }

        a = setTimeout(c, 6e5), Pip.on("knob1", m);

        function n()
        {
            Pip.removeListener("knob1", m), Pip.removeListener("knob2", n), Pip.removeListener("torch", n),
            E.stopEventPropagation(), 
            e = !0, ts0 = null, 
            Pip.audioStop(), 
            settings.alarm.snoozeTime || (settings.alarm.snoozeTime = settings.alarm.time), 
            settings.alarm.snoozeTime += 6e4 * settings.alarm.snooze, 
            settings.alarm.enabled = !0, saveSettings(), 
            console.log("Snoozed - reconfigured for", new Date(settings.alarm.snoozeTime).toString()), 
            a && clearTimeout(a), 
            a = setTimeout(c, 3e3)
        }
        settings.alarm.snooze && Pip.prependListener("torch", n), Pip.prependListener("knob2", n),Pip.remove = function()
        {
            a && clearTimeout(a), a = undefined, clearInterval(l)
        };
        let d = settings.alarm.soundIndex;
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
    }
    };`
    ,
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
    `
    }
};
