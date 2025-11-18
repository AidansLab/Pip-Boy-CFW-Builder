window.Patches.CustomRadioPatch = {
    
    // 'insert' objects are injected at insertion markers
    insert: {
        
	},

    replace: {
        submenuRadio: `
let submenuRadio = () =>
{
	rd._options || rd.setupI2C(), bC.clear(1);

	// --- New State Variable ---
	// This object will track our new custom stations.
	// We check if KPSS was already active to set the initial state.
	Pip.customRadioState = Pip.customRadioState || {
		activeStation: Pip.radioKPSS ? "KPSS" : "NONE"
	};

	let f = 0;
	let a = Graphics.createArrayBuffer(120, 120, 2, {
		msb: !0
	});
	E.getAddressOf(a, 0) == 0 && (a = undefined, E.defrag(), a = Graphics.createArrayBuffer(120, 120, 2, {
		msb: !0
	}));
	let c = new Uint16Array(60);
	for (let l = 0; l < 60; l += 2) c[l] = l * 2;

	// --- New Helper Function ---
	// This function plays a random track from a specified station folder.
	function playFromStationFolder(folderName) {
		return new Promise((resolve, reject) => {
			var onClipEnd = () => {
				Pip.removeListener("audioStopped", onClipEnd);
				Pip.radioClipPlaying = !1;
				// Only resolve(true) if the station is still supposed to be active
				if (Pip.customRadioState.activeStation === folderName) {
					resolve(!0);
				} else {
					resolve(!1); // Station was changed, don't auto-play next
				}
			};

			if (Pip.radioClipPlaying) {
				Pip.audioStop();
			}

			// Ensure we clear listeners from any previous track
			Pip.removeAllListeners("audioStopped");

			try {
				let stationFiles = fs.readdirSync("RADIO/" + folderName).filter(f => f.toUpperCase().endsWith("WAV") && !f.startsWith("."));
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
		});
	}

	function j() {
		for (let a = 0; a < 40; a++) {
			let c = 2,
				b = 1;
			a % 5 == 0 && (c = 3, b = 2), bC.setColor(c), bC.drawLine(245 + a * 3, 143 - b, 245 + a * 3, 143), bC.drawLine(367 - b, 22 + a * 3, 367, 22 + a * 3)
		}
		bC.setColor(3).drawLine(245, 144, 367, 144).drawLine(368, 144, 368, 22).flip()
	}

	// --- MODIFIED VISUALIZER FUNCTION ---
	function k() {
		if (a.clearRect(0, 0, 119, 119), Pip.radioClipPlaying) {
			Pip.getAudioWaveform(c, 20, 100);
			// --- ADDED FIX: Clip waveform spikes to prevent lag ---
			for (let i = 1; i < 60; i += 2) {
				c[i] = E.clip(c[i], 10, 110);
			}
		} else if (Pip.radioOn)
			for (let a = 1; a < 60; a += 2) c[a] = E.clip(60 + (analogRead(RADIO_AUDIO) - .263) * 600, 0, 119);
		else {
			let a = f;
			for (let b = 1; b < 60; b += 2) c[b] = 60 + Math.sin(a) * 45 * Math.sin((a += .6) * .13)
		}
		a.drawPolyAA(c), f += .3, Pip.blitImage(a, 285, 85, {
			noScanEffect: !0
		})
	}

	// --- MODIFIED SCAN FOR CUSTOM STATIONS ---
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

	// --- Build the Menu Dynamically ---
	var menuConfig = {
		'': {
			x2: 240,
			predraw: function() {
				bC.drawImage(a, 245, 20), rd.drawFreq(bC)
			}
		},
		"FM Radio": {
			value: rd.isOn() && Pip.customRadioState.activeStation === "NONE", // Only "On" if no custom station is active
			format: a => a ? "On" : "Off",
			onchange: a => {
				Pip.radioKPSS = !1; // Deactivate KPSS
				Pip.customRadioState.activeStation = "NONE"; // Deactivate custom stations
				Pip.audioStop();
				a ? (Pip.radioKPSS = !1, rd.enable(!0), Pip.audioStart("UI/RADIO_ON.wav")) : (rd.enable(!1), rd.drawFreq(), Pip.audioStart("UI/RADIO_OFF.wav"));
				menu.draw(); // Redraw to update other items
			}
		},
		"FM Volume": {
			value: rd.getVol(),
			min: 0,
			max: 15,
			step: 1,
			onchange: a => {
				rd.setVol(a)
			}
		},
		"KPSS Radio": {
			value: !!Pip.radioKPSS, // Use original Pip.radioKPSS for the value
			format: a => a ? "On" : "Off",
			onchange: a => {
				Pip.radioKPSS = a;
				Pip.customRadioState.activeStation = a ? "KPSS" : "NONE"; // Set active station
				Pip.audioStop();
				if (a) {
					radioPlayClip(CLIP_TYPE.VOICE);
				} else {
					Pip.audioStart("UI/RADIO_OFF.wav");
				}
				menu.draw(); // Redraw to update other items
			}
		}
	};

	// Add the discovered station folders to the menu
	stationFolders.forEach(folderName => {
		// Use the folder name as the menu item title
		menuConfig[folderName] = {
			value: (Pip.customRadioState.activeStation === folderName),
			format: a => a ? "On" : "Off",
			onchange: function(a) {
				Pip.customRadioState.activeStation = a ? folderName : "NONE";
				Pip.radioKPSS = !1; // Deactivate KPSS
				Pip.audioStop();
				if (a) {
					playFromStationFolder(folderName).catch(err => log("Station error: " + err));
				} else {
					Pip.audioStart("UI/RADIO_OFF.wav");
				}
				menu.draw(); // Redraw menu to show new "On"/"Off" state
			}
		};
	});

	// Show the menu
	var menu = E.showMenu(menuConfig);

	let g = Pip.removeSubmenu;
	j();

	// --- Modified Music Logic Interval ---
	let h = setInterval(() => {
		if (Pip.radioKPSS && !Pip.streamPlaying()) {
			// KPSS logic (original)
			radioPlayClip(CLIP_TYPE.MUSIC);
		} else if (Pip.customRadioState.activeStation !== "NONE" && Pip.customRadioState.activeStation !== "KPSS" && !Pip.streamPlaying()) {
			// Custom station logic
			playFromStationFolder(Pip.customRadioState.activeStation).catch(err => {
				log("Station autoplay error: " + err);
				// Stop trying if folder is bad
				Pip.customRadioState.activeStation = "NONE";
			});
		} else {
			// Visualizer logic (original)
			k();
		}
	}, 50);

	rd.rdsTimer = setInterval(() => {
		readRDSData()
	}, 100), rd.isOn() && (rd.getChannelInfo(), rd.drawFreq());
	let b = null;
	let e = 0;
	let d = null;

	// --- Modified Knob 2 Handler ---
	function i(a) {
		// Original KPSS logic: Knob 2 stops the track
		if (Pip.radioKPSS) {
			Pip.audioStop();
			return;
		}

		// New Custom Station logic: Knob 2 stops the track
		if (Pip.customRadioState.activeStation !== "NONE" && Pip.customRadioState.activeStation !== "KPSS") {
			Pip.audioStop();
			// If you wanted to skip to the next track instead, you would use this line:
			// playFromStationFolder(Pip.customRadioState.activeStation).catch(err => log("Station skip error: " + err));
			return;
		}

		// Original FM tuning logic
		d || a == e ? (rd.freq = rd.freq + e * .1, rd.freq < rd.start / 100 && (rd.freq = rd.end / 100), rd.freq > rd.end / 100 && (rd.freq = rd.start / 100), rd.drawFreq(), b && clearTimeout(b), b = setTimeout(() => {
			try {
				rd.freqSet(rd.freq)
			} catch (a) {
				log(\`Error tuning radio: \${a}\`)
			}
			b = null
		}, 200), d && clearTimeout(d), d = setTimeout(() => {
			d = null
		}, 20)) : e = a
	}
	Pip.on("knob2", i);

	// --- Modified Cleanup Function ---
	Pip.removeSubmenu = function() {
		Pip.radioKPSS = !1;
		Pip.customRadioState.activeStation = "NONE"; // Clear custom station state
		clearInterval(h);
		rd.tuningInterval && clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.rdsTimer && clearInterval(rd.rdsTimer), rd.rdsTimer = null, Pip.removeListener("knob2", i), b && clearTimeout(b), g()
	}
};
		`
    }
};