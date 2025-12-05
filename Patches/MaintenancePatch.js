window.Patches.MaintenancePatch = {
//Based on Pip UI Plus by:
//Mercy
//Cody Tolene
//Athene Allen
    insert: {
        RAMScan: `
var RAMScanEnabled = false;
var RAMScanInterval;

function drawRamOverlay() {
	const HEIGHT = g.getHeight();
	const WIDTH = g.getWidth();
	const area = {
		x1: WIDTH - 95,
		y1: HEIGHT - 40,
		x2: WIDTH - 55,
		y2: HEIGHT - 30,
	};
	
	g.clearRect(area);
	if (!RAMScanEnabled) {
		return;
	}

	const mem = process.memory();
	const used = mem.usage;
	const total = mem.total;
	const text = used + '/' + total;
	
	const COLOR_THEME = g.theme.fg;
	const COLOR_BLACK = '#000000';
	
	// g.setColor(COLOR_THEME);
	// g.drawRect(area);
	
	g.setColor(COLOR_BLACK);
	g.fillRect(area);
	
	g.setColor(COLOR_THEME);
	g.setFont('4x6');
	g.setFontAlign(1, 1, 0);
	g.drawString(text, area.x2, area.y1 + 8);
}

function toggleRAMScan(enabled) {
	RAMScanEnabled = enabled;
	if (RAMScanEnabled && !RAMScanInterval) {
		// Start the scan
		RAMScanInterval = setInterval(drawRamOverlay, 1000); // Update every second
		drawRamOverlay(); // Draw immediately
	} else if (!RAMScanEnabled && RAMScanInterval) {
		// Stop the scan
		clearInterval(RAMScanInterval);
		RAMScanInterval = undefined;
		drawRamOverlay(); // This will clear the text
	}
}
		`,
		RAMScanToggle: `
			"RAM Scan": {
				value: RAMScanEnabled,
				format: a => a ? "On" : "Off",
				onchange: a => {
					toggleRAMScan(a);
					settings.RAMScanEnabled = a; // Save setting
					saveSettings();
				}
			},
		`,
		RAMScanCheck:`
		settings.RAMScanEnabled && toggleRAMScan(true),
		`
	},

    // 'replace' objects replace entire blocks
    replace: {
        // This patch doesn't replace any regions, so this is empty.
    }
};