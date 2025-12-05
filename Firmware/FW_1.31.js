//1.31
//MaintenancePatchInsert_RAMScan

function log(a, b)
{
	let c;
	b || (b = "exceptions.log");
	try
	{
		c = fs.statSync("LOGS")
	}
	catch (b)
	{
		a || (a = "SD CARD ERROR")
	}
	console.log(a), c && c.dir ? fs.appendFile("LOGS/" + b, `${new Date().toISOString()} ${a}\n`) : require("Storage").open(b, "a").write(`${new Date().toISOString()} ${a}\n`)
}

function saveSettings()
{
	if (!Pip.isSDCardInserted()) throw new Error("Can't save settings - no SD card");
	fs.writeFile("settings.json", JSON.stringify(settings))
}

function configureAlarm()
{
	if (alarmTimeout && (console.log("Cancelling existing alarm"), clearTimeout(alarmTimeout)), alarmTimeout = undefined, settings.alarm.enabled && settings.alarm.time && !Pip.demoMode)
	{
		let b = Pip.getDateAndTime();
		let a = new Date(settings.alarm.time);
		settings.alarm.snoozeTime && (a = new Date(settings.alarm.snoozeTime)), a.getTime() <= b.getTime() && (console.log(`Alarm time (${a}) is in the past, setting to tomorrow`), a = Pip.getDateAndTime(), a.setDate(b.getDate() + 1), a.setHours(new Date(settings.alarm.time).getHours()), a.setMinutes(new Date(settings.alarm.time).getMinutes()), delete settings.alarm.snoozeTime), settings.alarm.snoozeTime || (settings.alarm.time = a.getTime()), alarmTimeout = setTimeout(function a()
		{
			if (Pip.sleeping == "BUSY") return setTimeout(a, 1e4);
			settings.alarm.repeat || (settings.alarm.enabled = !1);
			let b = Pip.sleeping;
			b ? wakeFromSleep(showAlarm) : showAlarm(), console.log("ALARM!")
		}, a.getTime() - b.getTime()), console.log(`Alarm set to ${a} (${((a.getTime()-b.getTime())/60/6e4).toFixed(3)} hours away)`)
	}
}

function wakeOnLongPress()
{
	if (BTN_POWER.read())
	{
		let a = setWatch(a =>
		{
			clearTimeout(b)
		}, BTN_POWER,
		{
			edge: "falling"
		});
		let b = setTimeout(b =>
		{
			clearWatch(a), settings.longPressToWake = !1, saveSettings(), wakeFromSleep(playBootAnimation)
		}, 2e3)
	}
}

function showLoginScreen()
{
	function e(e)
	{
		c = 0, e ? (a = (a + e + 10) % 10, d(), Pip.knob1Click(e)) : (d(), Pip.audioStartVar(Pip.audioBuiltin("OK")), b += a.toString(), b.length == 4 && (b == settings.overseerPin || settings.overseerPin == undefined ? (Pip.remove(), bC.setColor(3).setBgColor(0).setFontAlign(0, -1).drawString("Login successful", 199, 170).flip(), Pip.audioStart("UI/ALERT.wav"), setTimeout(a => showMainMenu(), 1e3)) : (bC.setColor(3).setBgColor(0).drawString("Incorrect login", 199, 170), bC.setColor(0).setBgColor(3).clearRect(164, 128, 310, 156), Pip.audioStart("UI/BURST.wav"), b = '', a = 0, setTimeout(a => bC.fillRect(50, 170, 350, 190), 2e3))))
	}
	g.clear(), bC.clear(1).setColor(3), drawVaultTecLogo(199, 15, bC, !0), bC.setFontMonofonto28().setFontAlign(0, -1).drawString("Welcome OVERSEER", 199, 80), bC.setColor(0).setBgColor(3).clearRect(88, 128, 156, 156).clearRect(164, 128, 310, 156), bC.setFontMonofonto18().drawString("LOGIN", 122, 133);
	let a = 0;
	let b = '';
	let c = 0;
	let f = '';
	let d = function()
	{
		let d = 175 + b.length * 12;
		c == 0 ? (f = a.toString(), bC.drawString(a, d + 4, 133, !0)) : c == 10 && bC.fillRect(d, 133, d + 8, 151), c = (c + 1) % 20, bC.flip()
	};
	let h = setInterval(d, 50);
	Pip.on("knob1", e), Pip.remove = function()
	{
		Pip.removeListener("knob1", e), clearInterval(h)
	}
}

function playBootAnimation(b)
{
	console.log("Playing boot animation");
	let a = null;
	return b === undefined && (b = !0), Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), Pip.videoStart("BOOT/BOOT.avi",
	{
		x: 40
	}), Pip.fadeOn(), new Promise((e, f) =>
	{
		let c = () =>
		{
			Pip.removeListener("videoStopped", c), Pip.audioStart("BOOT/BOOT_DONE.wav"), b && (a = setTimeout(a =>
			{
				Pip.fadeOff().then(a =>
				{
					settings.overseer ? showLoginScreen() : showMainMenu(), setTimeout(a => Pip.fadeOn([LCD_BL]), 200)
				})
			}, 2e3)), e()
		};
		let d = () =>
		{
			Pip.removeListener("videoStopped", d), g.clear(1).drawPoly([90, 45, 90, 35, 390, 35, 390, 45]).drawPoly([90, 275, 90, 285, 390, 285, 390, 275]);
			let a = settings.userName ? `Pip-Boy assigned to ${settings.userName}` : "Success!";
			g.setFontMonofonto18().setFontAlign(0, -1).drawString(a, 240, 250), Pip.videoStart("UI/THUMBUP.avi",
			{
				x: 160,
				y: 55
			}), Pip.on("videoStopped", c)
		};
		Pip.on("videoStopped", d), Pip.remove = function()
		{
			Pip.removeAllListeners("videoStopped"), a && clearTimeout(a)
		}
	})
}

function checkBatteryAndSleep()
{
	let a = Pip.measurePin(VBAT_MEAS);
	if (VUSB_PRESENT.read()) return !1;
	if (a < 3.2) return log(`Battery voltage too low (${a.toFixed(2)} V) - shutting down immediately`), clearInterval(), clearWatch(), Pip.sleeping = !0, setTimeout(Pip.off, 100), !0;
	else if (a < 3.5)
	{
		log(`Battery voltage too low (${a.toFixed(2)} V) - showing battery warning then shutting down`), Pip.sleeping && Pip.wake(), clearInterval(), clearWatch();
		let b = 240,
			c = 160;
		return g.clear(1).fillRect(b - 60, c - 20, b + 60, c - 18).fillRect(b - 60, c + 18, b + 60, c + 20).fillRect(b - 60, c - 18, b - 58, c + 18).fillRect(b + 58, c - 18, b + 60, c + 18).fillRect(b + 60, c - 6, b + 68, c + 6).setColor(g.blendColor(g.theme.bg, g.theme.fg, .5)).fillRect(b - 54, c - 14, b - 48, c + 14), setTimeout(() => LCD_BL.set(), 150), Pip.sleeping = !0, setTimeout(Pip.off, 2e3), !0
	}
	else return !1
}

function wakeFromSleep(a)
{
	Pip.sleeping = "BUSY", Pip.wake(), Pip.brightness < 10 && (Pip.brightness = 20), Pip.mode == MODE.TEST && (Pip.mode = null), Pip.addWatches(), setTimeout(c =>
	{
		let b = [LCD_BL, LED_RED, LED_GREEN];
		rd.setupI2C(), a(), Pip.fadeOn(b).then(a =>
		{
			Pip.sleeping = !1
		})
	}, 100)
}

function submenuBlank(a)
{
	return function()
	{
		bC.clear(1).setFontMonofonto23(), bC.setFontAlign(0, 0).drawString(a, bC.getWidth() / 2, bC.getHeight() / 2), bC.flip(), Pip.removeSubmenu = function() {}
	}
}

function showMainMenu(b)
{
	if (Pip.remove && Pip.remove(), process.env.VERSION < MIN_FW_VER)
	{
		log("Running firmware version " + process.env.VERSION + " but minimum is " + MIN_FW_VER), E.showMessage("Please upgrade firmware binary\n\nRunning: " + process.env.VERSION + "\nMinimum required: " + MIN_FW_VER);
		return
	}
	Pip.mode = null, d0 = null, MEAS_ENB.write(0);
	var a = setInterval(checkMode, 50);
	Pip.on("knob2", b =>
	{
		let a = MODEINFO[Pip.mode];
		if (a && a.submenu)
		{
			let c = Object.keys(a.submenu);
			sm0 = (sm0 + c.length + b) % c.length, drawHeader(Pip.mode), Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, g.clearRect(BGRECT), a.submenu[c[sm0]](), Pip.knob2Click(b)
		}
	}), Pip.on("torch", torchButtonHandler), Pip.remove = () =>
	{
		Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.removeAllListeners("knob2"), MEAS_ENB.write(1), clearInterval(a), Pip.removeAllListeners("torch")
	}, Pip.radioOn && setTimeout(a =>
	{
		!(Pip.sleeping || rd.isOn()) && (rd.enable(!0), Pip.mode == MODE.RADIO) && (Pip.audioStart("UI/RADIO_ON.wav"), Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuRadio())
	}, 2e3), settings.alarm.snoozeTime && Pip.on("knob1", a =>
	{
		a == 0 && settings.alarm.snoozeTime && (E.stopEventPropagation(), delete settings.alarm.snoozeTime, saveSettings(), Pip.audioStop(), configureAlarm(), clearInterval(), Pip.videoStop(), bH.clear().flip(), bC.clear(1), bC.setFontMonofonto36().setFontAlign(0, 0), bC.drawString("SNOOZE CANCELED", 200, 100).flip(), drawFooter(), setTimeout(showMainMenu, 3e3))
	})
}

function enterDemoMode()
{
	function step()
	{
		Pip.demoTimeout = undefined;
		var timeToNext = SEQ[s][0],
			cmd = SEQ[s][1];
		try
		{
			print("Running:", cmd), eval(cmd)
		}
		catch (a)
		{
			print(a)
		}
		s++, s >= SEQ.length && (s = 0, console.log("Loop demo, used", process.memory().usage, "vars")), Pip.demoTimeout = setTimeout(step, timeToNext)
	}
	Pip.remove && Pip.remove(), delete Pip.remove, clearWatch(), setWatch(function()
	{
		E.reboot()
	}, BTN_POWER,
	{
		debounce: 50,
		edge: "rising",
		repeat: !0
	}), settings.idleTimeout = 0, Pip.kickIdleTimer();
	var SEQ = [
			[14e3, "playBootAnimation(0);"],
			[2e3, "showMainMenu(); Pip.demoMode = MODE.STAT;"],
			[200, "Pip.emit('knob1',20)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.emit('knob1',-1)"],
			[2e3, "Pip.emit('knob1',-1)"],
			[6e3, "Pip.emit('knob2',1)"],
			[3e3, "Pip.emit('knob2',1)"],
			[3e3, "Pip.emit('knob1',-1)"],
			[3e3, "Pip.emit('knob1',-1)"],
			[2e3, "Pip.demoMode = MODE.INV;"],
			[2e3, "Pip.emit('knob1',0)"],
			[4e3, "Pip.emit('knob1',-20)"],
			[4e3, "Pip.emit('knob1',15)"],
			[2e3, "Pip.emit('knob1',0)"],
			[2e3, "Pip.emit('knob1',-1)"],
			[2e3, "Pip.emit('knob1',0)"],
			[2e3, "Pip.emit('knob1',0)"],
			[2e3, "Pip.emit('knob2',1)"],
			[6e3, "Pip.emit('knob2',1)"],
			[5e3, "Pip.demoMode = MODE.DATA;"],
			[5e3, "Pip.emit('knob2',1)"],
			[5e3, "Pip.emit('knob1',-1)"],
			[5e3, "Pip.emit('knob1',-1)"],
			[5e3, "Pip.emit('knob1',-1)"],
			[5e3, "Pip.emit('knob1',-1)"],
			[3e3, "Pip.demoMode = MODE.MAP;"],
			[3e3, "Pip.emit('knob1',-1)"],
			[3e3, "Pip.emit('knob1',-1)"],
			[3e3, "Pip.emit('knob1',-1)"],
			[3e3, "Pip.emit('knob1',-1)"],
			[3e3, "Pip.emit('knob1',-1)"],
			[1e3, "Pip.demoMode = MODE.RADIO;"],
			[1e3, "Pip.emit('knob1',-1)"]
		],
		s = 0;
	step()
}

function leaveDemoMode()
{
	Pip.demoTimeout && (clearTimeout(Pip.demoTimeout), Pip.demoTimeout = undefined), clearWatch(), Pip.demoMode = 0, Pip.addWatches()
}

function factoryTestMode()
{
	function e()
	{
		if (b && ftm.currentTest < ftm.tests.length)
		{
			Pip.removeSubmenu && Pip.removeSubmenu();
			let a = ftm.tests[ftm.currentTest];
			a.testTime = Date().toLocalISOString();
			let b = getTime();
			a.fn ? a.fn(a).then(c =>
			{
				a.testDuration = Math.round(getTime() - b), a.pass = c, ftm.currentTest++, h(), e()
			}) : (ftm.currentTest++, e())
		}
		else b = !1, ftm.currentTest = null, d()
	}

	function i(c)
	{
		console.log("Testing inputs"), Pip.remove && Pip.remove(), clearWatch(), c.inputs = [
		{
			pin: MODE_SELECTOR,
			name: "Mode"
		},
		{
			pin: BTN_POWER,
			name: "Power"
		},
		{
			pin: BTN_TORCH,
			name: "Flashlight"
		},
		{
			pin: BTN_PLAY,
			name: "Play"
		},
		{
			pin: BTN_TUNEUP,
			name: "Tune Up"
		},
		{
			pin: BTN_TUNEDOWN,
			name: "Tune Down"
		},
		{
			pin: KNOB1_A,
			name: "Knob A"
		},
		{
			pin: KNOB1_B,
			name: "Knob B"
		},
		{
			pin: KNOB1_BTN,
			name: "Knob Press"
		},
		{
			pin: KNOB2_A,
			name: "Thumbwheel A"
		},
		{
			pin: KNOB2_B,
			name: "Thumbwheel B"
		}];
		const e = [.25, .75];
		const d = [.1, .3, .5, .7, .9];
		return c.inputLevels = new Array(c.inputs.length), c.inputPassed = new Array(c.inputs.length).fill(!1), g.setFontMonofonto18().clearRect(0, 56, 479, 319).setColor("#00C000").drawString("Input test: press buttons & turn knobs", a, 56), c.inputs.forEach((f, b) =>
		{
			g.setColor("#008000").drawString(`${f.name.padStart(12," ")}:`, a, 80 + b * 20, !0), g.setColor("#003300").fillRect(a + 126, 80 + b * 20, a + 216, 97 + b * 20), b == 0 ? (d.forEach(c =>
			{
				g.clearRect(a + 131 + c * 80, 80 + b * 20, a + 131 + c * 80, 97 + b * 20)
			}), g.clearRect(a + 131 + d[4] * 80, 80 + b * 20, a + 216, 97 + b * 20), c.inputLevels[b] = new Array(d.length).fill(!1)) : (e.forEach(c =>
			{
				g.clearRect(a + 131 + c * 80, 80 + b * 20, a + 131 + c * 80, 97 + b * 20)
			}), c.inputLevels[b] = new Array(2).fill(!1)), f.pin.getInfo().analog ? f.pin.mode("analog") : (f.pin.mode("input"), f.pin.mode("input_pullup"))
		}), new Promise((h, j) =>
		{
			function i(a)
			{
				a || (Pip.removeListener("knob1", i), h(!0))
			}
			let f = setInterval(function()
			{
				c.inputs.forEach((l, k) =>
				{
					let j;
					c.inputPassed[k] || (l.pin.getInfo().analog ? j = l.pin.analog() : j = l.pin.read() ? 1 : 0, k == 0 ? d.forEach((b, a) =>
					{
						j > (a == 0 ? 0 : d[a - 1]) && j < b && (c.inputLevels[k][a] = j)
					}) : j < e[0] ? c.inputLevels[k][0] = j : j > e[1] && (c.inputLevels[k][1] = j), g.setColor(0, 1, 0).fillRect(a + 129 + j * 80, 80 + k * 20, a + 133 + j * 80, 97 + k * 20), c.inputLevels[k].includes(!1) || (g.drawString("OK", a + 230, 80 + k * 20), c.inputPassed[k] = !0, l.pin.mode("input"), c.inputPassed.includes(!1) || (clearInterval(f), g.setColor(0, 1, 0).drawString("Input test: PASS - press knob to continue", a, 56, !0), Pip.addWatches(), b ? h(!0) : Pip.on("knob1", i))))
				})
			}, 50);
			Pip.remove = () =>
			{
				clearInterval(f)
			}
		})
	}

	function j(c)
	{
		console.log("Testing LEDs"), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor("#00C000").drawString("LED test", a, 56);
		let e = [LED_RED, LED_GREEN, LED_BLUE, LED_TUNING];
		let d = 0;
		let f = setInterval(function()
		{
			e.forEach((a, b) =>
			{
				a.write(d == b ? 1 : 0)
			}), d = (d + 1) % 4
		}, 500);
		return Pip.remove = () =>
		{
			clearInterval(f), e.forEach(a => a.write(0))
		}, new Promise((a, d) =>
		{
			setTimeout(() =>
			{
				E.showPrompt("Red, green, blue & white\nLEDs all OK?").then(d =>
				{
					if (d)
					{
						c.LEDsOK = !0, console.log("LED test passed - checking pixels"), Pip.remove(), g.setColor(.2, 1, .2).fillRect(0, 0, 479, 319);

						function d(e)
						{
							Pip.removeListener("knob1", d), E.showPrompt("All pixels look OK?").then(d =>
							{
								g.clearRect(0, 0, 479, 319), d ? (c.pixelsOK = !0, console.log("Pixel test passed"), a(!0)) : (c.pixelsOK = !1, console.log("Pixel test failed"), b = !1, a(!1))
							})
						}
						Pip.on("knob1", d)
					}
					else c.LEDsOK = !1, console.log("LED test failed"), b = !1, a(!1)
				})
			}, 2e3)
		})
	}

	function k(c)
	{
		console.log("Testing measurements"), Pip.remove && Pip.remove(), c.meas = [
		{
			pin: RADIO_AUDIO,
			name: "FM radio",
			divider: 1,
			min: .7,
			max: 1.1,
			offMax: .3
		},
		{
			pin: VUSB_MEAS,
			name: "USB supply",
			divider: 2,
			min: 4,
			max: 5.6,
			offMax: .3
		},
		{
			pin: VBAT_MEAS,
			name: "Battery",
			divider: 2,
			min: 3.5,
			max: 4.4
		},
		{
			pin: CHARGE_STAT,
			name: "CHRG status",
			divider: 1,
			min: 2.7,
			max: 4,
			offMax: .3
		},
		{
			name: "VDD",
			min: 3.2,
			max: 3.5
		},
		{
			name: "Temperature",
			min: 15,
			max: 50
		}], c.measLevel = new Array(c.meas.length), c.measOff = new Array(c.meas.length), c.measPassed = new Array(c.meas.length).fill(null), lastValue = new Array(c.meas.length), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor("#00C000").drawString("Measurements test", a, 56);
		let d = (j, h, b, d, c) =>
		{
			c == null && (c = 3), d == null && (d = "#00FF00");
			let e = b.offMax ? 0 : b.min - (b.max - b.min) * .1;
			let i = b.max + (b.max - b.min) * .1;
			let f = a + 131 + (j - e) / (i - e) * 80;
			g.setColor(d).fillRect(f - c / 2, h, f + c / 2, h + 17)
		};
		c.meas.forEach((b, c) =>
		{
			g.setColor("#008000").drawString(`${b.name.padStart(12," ")}:`, a, 85 + c * 25, !0), g.setColor("#003300").fillRect(a + 126, 85 + c * 25, a + 216, 102 + c * 25), d(b.min, 85 + c * 25, b, 0, 1), d(b.max, 85 + c * 25, b, 0, 1), b.offMax && d(b.offMax, 85 + c * 25, b, 0, 1), b.pin && b.pin.mode("analog")
		});
		let e = !1;
		return new Promise((j, k) =>
		{
			function i(a)
			{
				a || (clearInterval(h), Pip.removeListener("knob1", i), rd.enable(0), e || (b = !1), j(e))
			}
			Pip.on("knob1", i);
			let f = 0;
			let h = setInterval(function()
			{
				if (++f == 5 && rd.enable(1), (f < 5 || f > 6) && c.meas.forEach((f, b) =>
					{
						let e;
						let h = "V";
						let i = 2;
						if (f.name == "VDD")
						{
							e = 0;
							for (let a = 0; a < 20; a++) e += E.getAnalogVRef() / 20
						}
						else if (f.name == "Temperature")
						{
							e = 0;
							for (let a = 0; a < 20; a++) e += E.getTemperature() / 20;
							h = "C", i = 1
						}
						else e = Pip.measurePin(f.pin, 100, f.divider);
						g.setColor("#00FF00").setFontMonofonto18().drawString(`${e.toFixed(i)} ${h}  `, a + 230, 85 + b * 25, !0), lastValue[b] && d(lastValue[b], 85 + b * 25, f, "#006600"), d(e, 85 + b * 25, f), lastValue[b] = e, f.offMax && e < f.offMax && (c.measOff[b] = e), e >= f.min && e <= f.max && (c.measLevel[b] = e), c.measLevel[b] && (c.measOff[b] || !f.offMax) ? (c.measPassed[b] = !0, g.drawString("OK  ", a + 310, 85 + b * 25, !0)) : f.offMax || g.setColor("#FF2200").drawString("FAIL", a + 310, 85 + b * 25, !0).setColor("#00FF00")
					}), !(c.measPassed.includes(!1) || c.measPassed.includes(null) || e)) e = !0, b ? (clearInterval(h), Pip.removeListener("knob1", i), rd.enable(0), j(!0)) : g.setColor(0, 1, 0).drawString("Measurement test: PASS - press knob", a, 56, !0);
				else
				{
					let b = c.meas.findIndex(a => a.pin == VUSB_MEAS);
					let d = "                               ";
					c.measLevel[b] ? c.measOff[b] ? (b = c.meas.findIndex(a => a.pin == CHARGE_STAT), c.measOff[b] || (d = "Re-connect charging cable")) : d = "Disconnect charging cable" : d = "Connect charging cable", g.drawString(d, a, 260, !0)
				}
			}, 50);
			Pip.remove = () =>
			{
				clearInterval(h)
			}
		})
	}

	function l(d)
	{
		if (console.log("Testing SD card"), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor("#00C000").drawString("SD card test", a, 56), !Pip.isSDCardInserted()) return new Promise((a, c) =>
		{
			E.showPrompt("No SD card inserted!",
			{
				buttons:
				{
					OK: !0
				}
			}).then(c =>
			{
				b = !1, a(!1)
			})
		});
		else
		{
			const e = fs.getFree();
			const h = (e.freeSectors * e.sectorSize / 1e6).toFixed(0);
			const i = (e.totalSectors * e.sectorSize / 1e6).toFixed(0);
			const m = `${h}/${i} MB free`;
			let f, j;
			d.sdInfo = [
			{
				name: "Size",
				value: i,
				units: "MB",
				min: 240,
				max: 64e3
			},
			{
				name: "Used",
				value: i - h,
				units: "MB",
				min: 10,
				max: 200
			},
			{
				name: "Free",
				value: h,
				units: "MB",
				min: 20,
				max: 64e3
			},
			{
				name: "Files",
				value: "Counting",
				units: '',
				min: 50,
				max: 1e4
			},
			{
				name: "Write speed",
				value: null,
				units: "kB/s",
				min: 50,
				max: 1e4
			},
			{
				name: "Read speed",
				value: null,
				units: "kB/s",
				min: 200,
				max: 1e4
			},
			{
				name: "Integrity",
				value: "Checking",
				units: ''
			}];
			let k = !0;
			let l;
			return d.sdInfo.forEach((b, d) =>
			{
				if (g.setColor("#008000").drawString(`${b.name.padStart(12," ")}:`, a, 85 + d * 25, !0), b.value == null)
				{
					if (g.setColor("#003300").fillRect(a + 126, 85 + d * 25, a + 226, 102 + d * 25).setColor("#00FF00"), j = getTime(), b.name == "Write speed")
					{
						f = E.openFile("test", "w");
						for (let e = 0; e < 50; e++) f.write(c), g.fillRect(a + 126, 85 + d * 25, a + 126 + e * 2, 102 + d * 25)
					}
					else if (b.name == "Read speed")
					{
						f = E.openFile("test", "r");
						for (let e = 0; e < 50; e++) l = f.read(c.length), g.fillRect(a + 126, 85 + d * 25, a + 126 + e * 2, 102 + d * 25)
					}
					j = getTime() - j, f.close(), g.clearRect(a + 126, 85 + d * 25, a + 226, 102 + d * 25), b.value = (50 * c.length / 1024 / j).toFixed(0), g.drawString(b.value + " " + b.units, a + 126, 85 + d * 25, !0)
				}
				else g.setColor("#00FF00").drawString(b.value + " " + b.units, a + 126, 85 + d * 25, !0);
				if (b.name == "Integrity")
				{
					let e = E.toUint8Array(l);
					if (l.length == c.length)
					{
						b.value = "PASS";
						for (let a = 0; a < l.length; a++) e[a] != c[a] && (b.value = "FAIL")
					}
					else b.value = "FAIL";
					g.drawString(b.value + "      ", a + 126, 85 + d * 25, !0)
				}
				else if (b.name == "Files")
				{
					let c = [];

					function e(a, b)
					{
						if (a[0] == "." || b[0] == ".") return;
						let d = fs.statSync(a + b);
						d.dir ? fs.readdir(a + b).forEach(e.bind(null, a + b + "/")) : c.push(
						{
							fn: a + b,
							l: d.size
						})
					}
					fs.readdir().forEach(e.bind(null, '')), b.value = c.length, g.drawString(b.value + "      ", a + 126, 85 + d * 25, !0)
				}
				b.value === "PASS" || b.value >= b.min && b.value <= b.max ? g.drawString("OK", a + 230, 85 + d * 25, !0) : (g.setColor("#FF2200").drawString("FAIL", a + 230, 85 + d * 25, !0), k = !1)
			}), fs.unlink("test"), g.setColor(0, 1, 0).drawString("SD card test completed - press knob", a, 56, !0), new Promise((a, d) =>
			{
				function c(b)
				{
					b || (Pip.removeListener("knob1", c), a(k))
				}
				b && k ? a(!0) : Pip.on("knob1", c)
			})
		}
	}

	function m(e)
	{
		console.log("Testing audio"), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor("#00C000").drawString("Audio test", a, 56);
		let f;
		if (Pip.isSDCardInserted()) Pip.audioStart("UI/ALERT.wav");
		else
		{
			const b = ["PREV", "NEXT", "COLUMN", "OK2"];
			let a = 0;
			f = setInterval(function()
			{
				Pip.audioStartVar(Pip.audioBuiltin(b[a])), a = (a + 1) % b.length
			}, 500)
		}
		let d = !0;
		let c = 100;
		return e.audio = [
		{
			name: "Sound check",
			value: null,
			units: null
		},
		{
			name: "FM frequency",
			value: c,
			units: "MHz",
			min: 76,
			max: 108
		},
		{
			name: "RSSI",
			value: 0,
			units: "dBuV",
			min: 15,
			max: 100
		}], new Promise((h, i) =>
		{
			E.showPrompt("Sound heard OK?").then(i =>
			{
				if (f && clearInterval(f), g.clearRect(0, 76, 479, 289), i)
				{
					e.audio[0].value = "PASS", rd.init(), rd.freqSet(c), rd.setVol(15);

					function i(a)
					{
						if (!a) rd.enable(0), Pip.removeListener("knob1", i), d || (b = !1), h(d);
						else
						{
							c += a * .1, c > rd.end / 100 && (c = rd.start / 100), c < rd.start / 100 && (c = rd.end / 100);
							try
							{
								rd.freqSet(c)
							}
							catch (a)
							{
								console.log("Error setting frequency:", a)
							}
						}
					}
					Pip.on("knob1", i), e.audio.forEach((b, c) =>
					{
						g.setColor("#008000").drawString(`${b.name.padStart(12," ")}:`, a, 85 + c * 25, !0)
					});
					let f = 0;
					let j = setInterval(function()
					{
						f++, d = !0, e.audio.forEach((b, e) =>
						{
							let h = 2;
							b.name == "FM frequency" ? b.value = c : b.name == "RSSI" && (b.value = rd.getRSSI(), h = 0);
							let i = b.value;
							b.units && (i = `${b.value.toFixed(h)} ${b.units}  `), g.setColor("#00FF00").setFontMonofonto18().drawString(i, a + 126, 85 + e * 25, !0), f > 3 && (b.value == "PASS" || b.value >= b.min && b.value <= b.max ? g.drawString("OK  ", a + 230, 85 + e * 25, !0) : (g.setColor("#FF2200").drawString("FAIL", a + 230, 85 + e * 25, !0).setColor("#00FF00"), d = !1))
						}), g.drawString(d ? ": PASS - press knob" : "                   ", a + 90, 56, !0)
					}, 200);
					Pip.remove = () =>
					{
						clearInterval(j)
					}
				}
				else rd.enable(0), print("Audio test failed"), b = !1, h(!1)
			})
		})
	}

	function n(c)
	{
		console.log("Testing USB"), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor("#00C000").drawString("USB test", a, 56), c.pass = !1, c.status = "Connect USB cable";
		let d = !1;
		return new Promise((e, h) =>
		{
			function a(d)
			{
				d || (Pip.removeListener("knob1", a), c.status = "Aborted", b = !1, e(c.pass))
			}
			Pip.on("knob1", a);
			let f = setInterval(function()
			{
				!d && VUSB_PRESENT.read() && (d = !0, c.status = "Waiting for data"), c.pass && (Pip.removeListener("knob1", a), e(c.pass)), g.setFontAlign(0, 0).drawString("          " + c.status + "          ", 240, 160, !0)
			}, 200);
			Pip.remove = () =>
			{
				clearInterval(f)
			}
		})
	}
	Pip.remove && Pip.remove(), delete Pip.remove, Pip.removeSubmenu && Pip.removeSubmenu(), E.showMessage("Entering Factory Test Mode"), settings.idleTimeout = 0, Pip.kickIdleTimer(), MEAS_ENB.write(0), clearInterval(), Pip.mode = MODE.TEST, Pip.addWatches(), global.ftm = {
		id: Pip.getID(),
		jsVersion: VERSION,
		fwVersion: process.env.VERSION
	};
	let a = 60;
	LCD_BL.write(1);
	let c = new Uint8Array(4096);
	c.forEach((b, a) => c[a] = a % 256);
	let b = !1;
	rd.init() && rd.enable(0), ftm.tests = [
	{
		name: "Inputs",
		fn: i
	},
	{
		name: "LEDs & pixels",
		fn: j
	},
	{
		name: "Measurements",
		fn: k
	},
	{
		name: "SD card",
		fn: l
	},
	{
		name: "Audio",
		fn: m
	},
	{
		name: "USB",
		fn: n
	}];
	let f = {
		'':
		{
			x2: 200
		},
		"[ Run all tests ]": function()
		{
			b = !0, ftm.currentTest = 0, e()
		}
	};
	let h = () =>
	{
		Pip.remove && Pip.remove(), delete Pip.remove, g.clear(1).setFontMonofonto23().setColor(0, 1, 0).drawString("Pip-Boy Factory Test Mode", a, 20), g.setColor(0, .6, 0).drawLine(0, 52, 479, 52).drawLine(0, 290, 479, 290), g.setFontMonofonto16().drawString(`Version ${ftm.jsVersion} ${ftm.fwVersion}     ID:${ftm.id}`, a, 295)
	};
	let d = () =>
	{
		h(), E.showMenu(f), bC.setFontMonofonto18().setColor(3), ftm.currentTest = null, ftm.tests.forEach((a, b) =>
		{
			a.fn && bC.drawString(a.pass === !0 ? "PASS" : a.pass === !1 ? "FAIL!" : '', 212, 43 + b * 27)
		}), ftm.tests.every(a => a.pass === !0) && bC.fillPolyAA([290, 100, 310, 120, 355, 65, 375, 85, 310, 145, 275, 120]);
		let a = setInterval(function()
		{
			bC.flip()
		}, 50);
		Pip.remove = () =>
		{
			clearInterval(a)
		}
	};
	ftm.tests.forEach((a, b) =>
	{
		f[a.name] = function()
		{
			Pip.removeSubmenu && Pip.removeSubmenu(), ftm.currentTest = b, a.testTime = Date().toLocalISOString();
			let c = getTime();
			a.fn(a).then(b =>
			{
				a.testDuration = Math.round(getTime() - c), a.pass = b, d()
			})
		}
	}), d()
}
const VERSION = "1.31";
const MIN_FW_VER = "2v25.280";
var fs = require("fs");
log(`------- Booting ${process.env.VERSION} - ${VERSION} -------`), log("Reset flags: 0x" + (peek32(1073887348) >> 24).toString(16).padStart(2, "0")), poke32(1073887348, 16777216), clearTimeout(), g.theme.fg == 65535 && g.setTheme(
{
	fg: 2016,
	fg2: 2016
}), process.on("uncaughtException", function(a)
{
	if (Pip.sleeping) console.log("Uncaught exception while sleeping: " + a);
	else try
	{
		clearTimeout(), clearWatch(), Pip.sleeping = !1, B15.set();
		let b = global.__FILE__ ? `(${global.__FILE__}) : ` : '';
		b += a ? `${a.type}: ${a.message} ` : "Unknown Error", Pip.isSDCardInserted() || (b += "\n(No SD card)"), g.clearRect(120, 90, 360, 180).setColor(g.theme.fg).drawRect(120, 90, 360, 180), g.setFontMonofonto16().setFontAlign(0, 0), g.drawString(g.wrapString(b, 220).join("\n"), 240, 138, 1), g.setFont("6x8").drawString(`ID:${Pip.getID()} V${VERSION} ${process.env.VERSION}`, 240, 96, !0), a && a.stack && (b += a.stack), log(b), setWatch(a =>
		{
			LCD_BL.write(0), setTimeout(Pip.off, 1e3)
		}, BTN_POWER), E.getConsole() != "USB" && setTimeout(Pip.off, 3e4)
	}
	catch (b)
	{
		console.log("Error in uncaught exception handler: " + b.message + "\n" + b.stack), console.log("Original error: " + a + "\n" + a.stack)
	}
});
const LED_RED = LED1;
const LED_GREEN = LED2;
const LED_BLUE = LED3;
const LED_TUNING = LED4;
const BTN_PLAY = BTN1;
const BTN_TUNEUP = BTN2;
const BTN_TUNEDOWN = BTN3;
const BTN_TORCH = BTN4;
const KNOB2_A = BTN5;
const KNOB2_B = BTN6;
const KNOB1_BTN = BTN7;
const KNOB1_A = BTN8;
const KNOB1_B = BTN9;
const BTN_POWER = BTN10;
const MEAS_ENB = C4;
const LCD_BL = B15;
const VUSB_PRESENT = A9;
const VUSB_MEAS = A5;
const VBAT_MEAS = A6;
const CHARGE_STAT = C5;
const RADIO_AUDIO = A4;
const MODE_SELECTOR = A7;
const SDCARD_DETECT = A15;
pinMode(MEAS_ENB, "opendrain"), Pip.isSDCardInserted = () => !SDCARD_DETECT.read();
var settings = {};
Pip.isSDCardInserted() ? fs.statSync("settings.json") && (settings = JSON.parse(fs.readFile("settings.json"))) : log("Can't load settings - no SD card"), isFinite(settings.idleTimeout) || (settings.idleTimeout = 3e5), settings.timezone && E.setTimeZone(settings.timezone), (typeof settings.alarm)[0] != "o" && (settings.alarm = {
	time: null,
	enabled: !1,
	repeat: !1,
	soundIndex: 0
}), settings.alarm.snooze || (settings.alarm.snooze = 10), settings.alarm.soundFiles = [];
try
{
	settings.alarm.soundFiles = fs.readdirSync("ALARM").filter(a => a.toUpperCase().endsWith("WAV") && !a.startsWith(".")), settings.alarm.soundIndex > settings.alarm.soundFiles.length && (settings.alarm.soundIndex = 0)
}
catch (a)
{
	log("No alarm sounds found")
}
Pip.setDateAndTime = a =>
{
	console.log("Setting date/time to", a), settings.century = Math.floor(a.getFullYear() / 100), a.setFullYear(a.getFullYear() % 100 + 2e3), setTime(a.getTime() / 1e3), saveSettings()
}, Pip.getDateAndTime = () =>
{
	let a = new Date;
	return a.setFullYear((settings.century || 20) * 100 + a.getFullYear() % 100), a
}, MEAS_ENB.write(0);
try
{
	Pip.setDACMode("out")
}
catch (a)
{
	log("setDACMode error: " + a)
}
Date().getFullYear() == 2e3 && setTime(new Date("2077-10-23T09:47").getTime() / 1e3), Number.prototype.twoDigit = function()
{
	return this.toString().padStart(2, "0")
};
let dc = require("heatshrink").decompress;
//IconModBegin_IconObjects
let icons = {
	cog: "\x8CF UP\x02U\xFF(\x10*\xCD\x7F\xE3\xA5\x02\x83o\xDF\xFE\xBE\xA0Pw\xFF\xFF\xFF\xF4\n=\xBC\n\bD)\xF8\x14\x1F\xC5V\xAF\xFF\xFC\xDF\xFF\xF9P(?Z\xFF\xFF\xAA\x05\x1C\"\x18tQH\xC3\xB3/\xE4\xD0\xCB!\x19H\0 ",
	holotape: "\x8CF UP\x02\xD5\xBF\xF8\0,\xAD|\n\x1F\xD6\xDE\x03\x07\xFDV\x02\x87\xFC\xAA\xEDm\xF7\xFF\xFF\xE6\xABu\xB7K\xC0\xA1\x84B\xFE\x84B\x11\x04\x1D\x0B\xD5\xAA\xD7\x8AD\x17\x8A\x05\x0F\xF4\x11\x1F\xF0\x1D\x10\n\t4O-WT\0\b\xEC\xBDT",
	alarm: "\x87\xC4\xA0P\b\x18\x1C)p\b\x18_\xFF\x01\0\xDF\x80\xC1\x03\x02\x03\x06~\x03\x06\x02\x02\x07\xF9\x07\x01\x83\xF4\x8F\x80\xC1\xE8_\xC0`\xD0@@\xFF``0~\x12\xF0\x18> \x10?\xFFx\f_\xF4V}\xF1\xA8@/\xF4\b\0",
	noAlarm: "\x87\xC4\xA0P\b\x18\x1C)p\b\x18_\xFF\x01\0\x8F\x80\xC2\x97\x80\xC1\x90\0\xC1\x80x'\xFF\xC88\f\x1F\xA4\x7F\xA1\x7F\0\x87A\xFF\xF07\xB00\x18;\0\xE0^/\xF8\f\x1Fx\f\x1A\b\f8\xAC\xFB\xE28\x06\xFF@\x80\0",
	charging: "\x85D\xA0P\xFF\xFE\x03\xFF\xF0\x8F\xFF`_\xFE\x04\xFF\xE9\x03\xFF@/\xFDZ\xDF\xFC\0\x17?\xFF\xF4\x88\x83\x01\x8F\xF0 _H\x04\xFA\x01\x03\xE0@&\x90\b8\xB4\x1A\x04\0",
	snooze: "\x11\x12\x02\0\x01V\xAF\0\0\xFF\xFF\xC0\0?\xFF\xF0\0\x05A\xF4\0\0\0\xFC\0\0\0}\x02\x94\0?\0\xFF\xFC\x1F@\x1A\xFF\x0F\xC0\0\x1FG\xD0\0\x0F\x83\xF0\0\x0B\x81\xF4\x05\x0B\xC0\xFF\xFF\xC7\xD0\x7F\xFF\xF3\xD0\x0F\xEAV\xF5\0\0\0\xFF\xFC\0\0\x05\xBF\0\0\0"
};
//IconModEnd_IconObjects
let bC = Graphics.createArrayBuffer(400, 210, 2,
{
	msb: !0,
	buffer: E.toArrayBuffer(E.memoryArea(268468224, 21e3))
});
bC.flip = a => Pip.blitImage(bC, 40, 65,
{
	height: a
});
let bH = Graphics.createArrayBuffer(370, 51, 4,
{
	msb: !0,
	buffer: E.toArrayBuffer(E.memoryArea(268489224, 9435))
});
bH.flip = () => Pip.blitImage(bH, 53, 7,
{
	noScanEffect: !0
});
let bF = Graphics.createArrayBuffer(372, 25, 2,
{
	msb: !0,
	buffer: E.toArrayBuffer(E.memoryArea(268498659, 2325))
});
bF.flip = () => Pip.blitImage(bF, 52, 290,
{
	noScanEffect: !0
});
let BGRECT = {
	x: 36,
	y: 58,
	w: 408,
	h: 230
};
const modes = ["STAT", "INV", "DATA", "MAP", "RADIO"];
const MODE = {
	TEST: 0,
	STAT: 1,
	INV: 2,
	DATA: 3,
	MAP: 4,
	RADIO: 5
};
let MODEINFO;
let sm0, d0, tm0, ts0;
settings.fallbackMode === undefined && (settings.fallbackMode = MODE.RADIO), Pip.measurePin = (c, a, d) =>
{
	d === undefined && (d = 2), a === undefined && (a = 10), MEAS_ENB.write(0), pinMode(c, "analog");
	let b = 0,
		e = 0;
	for (let f = 0; f < a; f++) b += analogRead(c) / a, e += E.getAnalogVRef() / a;
	return pinMode(c, "input"), b *= d * e, b
}, Pip.getID = () =>
{
	let b = peek32(536836624);
	let d = peek32(536836632);
	let c = peek32(536836628);
	let a = '';
	for (let e = 0; e < 4; e++) a += String.fromCharCode(d >> 24 - e * 8 & 255);
	for (let e = 0; e < 3; e++) a += String.fromCharCode(c >> 24 - e * 8 & 255);
	return a += "-" + (c & 255).toString(16).padStart(2, "0"), a += "-" + ((b & 16711680) >> 16).toString(16).padStart(2, "0") + (b & 255).toString(16).padStart(2, "0"), a
}, Pip.knob1Click = a =>
{
	a > 0 ? Pip.audioStart("UI/ROT_V_1.wav") : Pip.audioStart("UI/ROT_V_2.wav")
}, Pip.knob2Click = a =>
{
	a > 0 ? Pip.audioStartVar(Pip.audioBuiltin("PREV")) : Pip.audioStartVar(Pip.audioBuiltin("NEXT"))
}, Pip.typeText = i =>
{
	let g = ["W\0O\0I\0\xC9\xFF\xD2\xFE\xC7\xFEr\0A\x01m\xFF\xC2\xFD\x0F\xFF\xF7\0y\0\xB4\xFE&\xFE\xF7\0\xFC\x02o\x01H\xFF\x8D\xFE\xED\xFF\xDB\x01\xC4\0\x19\xFFW\xFEW\xFFy\x01\xA2\x01y\0\xCB\xFE4\xFE\x85\xFF\\\0\x04\0\xD6\xFF\xC0\xFE\x88\xFF\x95\x01B\x01\x15\0\xC4\xFE\x87\xFE\x8F\0\xE3\0Q\0\xC2\xFF\xFC\xFEC\x01\x8F\x01K\xFFo\xFFu\0\xAB\x01V\x01\xC8\xFE\xC9\xFF\xF5\0\xA4\0\x83\0\x10\xFE\x8D\xFD\x07\xFFg\xFFo\x01\x8D\xFF\xF0\xFD\xEB\xFF<\xFFH\x02-\x02q\xFE\xA7\0\x1E\xFD\xF6\xFD\xE7\x06\x99\x03\x1A\0=\xFB/\xF65\x06\x97\x0B/\xFD\xE2\xFBJ\xF9O\xFFy\f\x87\xFF\xA1\xF8$\0D\xFD\x83\x02\xFD\x03\x17\xFC2\x02\x96\xFF\x9B\xFAf\x02X\x02\xA1\xFF\xF2\x01\xA5\xFE\x17\xFE\x8A\xFFi\0\xC8\x03w\x02G\xFE:\xFD;\xFF)\x01\xD5\0\x07\xFF\x99\x01\x02\xFFy\xFC\xFC\x01a\x04]\x02\b\xFE\x13\xF5\xBE\xFDH\x0BX\x03\x90\xFE\xC2\xFB\xFD\xF5\x0B\x04\x8A\x0Bp\xFEz\xFF\xED\xF6\xC8\xF5\xFD\x114\r\xB2\xF7\xF6\xF9\x03\xF2\f\x01\x81\x1A\x14\xFF\b\xF6\x99\xFEY\xED\xDE\x07#\x17\x9A\xF7\xA0\xFF\xEE\xF3\xB7\xED\xBB\x1B\xC4\x0B\xF3\xEF\xF1\x01\xE2\xF0\x7F\0M\x19\xA7\xF6\xF4\x01u\x06\x19\xE8\x10\x03\xF7\f\xF2\xFEU\r\xF0\xF6\xE8\xEFE\n>\0\x97\0~\n\xF7\xF5\xBD\xF7L\x03\x84\xFF%\x0B\xE5\x04\x80\xF2\xA2\xF8W\xFE-\x03Y\x0F\x1F\x07\x95\xF5\xF6\xF0\xB9\xF9\x05\x0B\xB3\x13\'\x02\x8B\xF02\xF6\x89\x02\x9A\n\x7F\b]\xFBA\xF38\xFA\x02\x02w\t+\n\xB3\xFB8\xF4\x80\xFBv\x02k\t\x15\x06\n\xFC5\xFC\x1C\xFB[\xFC\"\x07\xE6\x07+\xFEL\xF9D\xFA\x05\x04U\t\xE4\xFF\xA9\xFA\xA6\xFD\x16\xFES\x01\xA0\x03W\x02\xFF\xFF\x18\xF9\xB3\xF9 \x04\xBF\x07\xDF\x01\xCF\xFC\x0E\xFCT\0\xBA\x02i\0{\xFFB\xFE\n\xFE\xDE\x03\xE3\x04\x17\0z\xFB\x8D\xFA\xA9\x01\xAD\x069\x01z\xFBP\xFC\"\x01\xDB\x04I\x01\x18\xFEG\xFE<\xFD\x95\xFE\xB0\x04\xF1\x05\xEF\xFFz\xF7\x80\xF7\xCA\x03\xF5\bR\x03O\xFD@\xFB\xD8\xFD\xF1\x017\x02\x9A\x02\x96\x011\xFB\x82\xFA\xBC\x01\xFD\x05\xCB\x04\xF5\xFDe\xF9\xCA\xFC8\x02\xF3\x04\xE7\x02\x7F\xFDg\xFA\xDA\xFDr\x02\xC4\x04\xBF\x03J\xFF\xC6\xFB\xFD\xFC\xE3\xFF\f\x02\xC6\x02I\xFF;\xFC.\xFE\xEF\x01-\x04\x90\x01\x81\xFCw\xFD1\x01\xA6\x01|\x01\x7F\0b\xFEL\xFE@\xFE(\0U\x02\"\0z\xFE\x1D\0\xA8\x01\xC5\0\xC2\xFD%\xFD\x19\x01C\x02\x1F\0\x19\0V\x01\x92\0\xE7\xFD\xD1\xFEN\x02\xBD\x02\x7F\xFFL\xFC\xC1\xFE\xA9\x03y\x03^\xFF \xFDW\xFD\x83\0i\x02\x93\x007\0\xE2\xFE\xE2\xFC\x99\xFF!\x01K\x014\x02\x91\xFF\xA3\xFDY\xFE\xF5\xFFI\x03\xA0\x02\x13\xFE\xEA\xFCG\xFF\x14\x02\xAC\x01\xEC\xFD\xC5\xFD\x8C\0x\0 \0", "t\0E\0\x90\xFF4\0}\xFF\xD3\xFF\xFC\0\xC8\xFF\xCE\xFF\xE4\xFFT\xFF \x01F\0\x9A\xFEy\0=\0B\0\xC1\0e\xFE\x9D\xFFD\x01\xC7\xFF\xBC\0\xE6\xFFH\xFE\x1C\0\xA5\0[\x01\xCD\0\xCF\xFD\x81\xFEo\0\xF1\x01\x92\x01\xD4\xFE\xBA\xFE\x8E\xFE\xD7\xFF]\x03\x86\0\x95\xFE!\xFF\x8F\xFD\xC1\x012\x03,\xFF\xA9\xFF\xFF\xFD\x7F\xFEb\x02\x1D\0\xC6\0W\x01\xAB\xFE\x8A\xFE\x8F\xFD\x10\x01\x9A\x041\0K\xFE.\xFD9\xFEG\x04`\x01\xDF\xFEy\0\xF8\xFB\x1D\0v\x04\x87\xFE\x9E\0\xD1\xFF5\xFC\f\x03\x92\0\x01\xFE\xAA\x03\x8A\xFDw\xFD{\x04\0\xFE\xE8\xFE\x80\x02\xE3\xFC\x8E\x02z\x02\x90\xFAW\x01\xB7\0\xC1\xFD]\x05\xD2\xFF\x03\xFC\x10\x01\xD4\xFCe\x01Q\x06\x9E\xFD)\xFE\x99\xFE\x13\xFC\x9D\x048\x05\xA4\xFE\xD6\xFD\xC4\xFA\xA8\xFD>\x06\x1A\x05\xFD\0v\xFC\xE7\xF7\x93\xFD\xDF\x06\x8F\x07\x1C\x019\xFA&\xF8\xB2\xFE\x99\x06\xCE\x06\x8B\x01V\xFA\xA3\xF7\x83\xFE)\x07\x97\x07a\x01\xB9\xF9b\xF7\xB6\xFE\xA2\x06\xA6\x07\x01\x02\x05\xFA\xD1\xF7P\xFE\x9D\x05=\x07\xA9\x02\xBD\xFA\t\xF8\x17\xFEN\x05\xF5\x061\x02\xF7\xFA*\xF9{\xFE$\x04\x12\x06\x8B\x02\xB3\xFB\xCC\xF9y\xFE\xBD\x03\x1C\x05\xB5\x01\x84\xFC\xFA\xFB\x18\xFF\xBF\x01\xFF\x02\x82\x01\xE5\xFE\xE4\xFD_\xFE\xF1\xFF=\x02\xD8\x01q\xFFz\xFE\xA7\xFEQ\0>\x01\x87\0&\0\xF1\xFF \xFF\x05\xFF\x18\0\xC2\0\x16\x01u\0M\xFF=\xFF;\xFFd\xFF\xBE\0\xEC\x01\x1B\x01B\xFF\x83\xFD\xD2\xFD\xA0\x01\xA8\x03.\x01\xE0\xFD\x97\xFC\xE4\xFE\xBD\x02I\x03r\0\xB2\xFD\xA5\xFC\x13\xFF\xDD\x02Q\x03\x9D\0|\xFD\xB5\xFC\\\xFF\xBD\x02\x84\x02N\0`\xFE\x8E\xFDe\xFFw\x01\x0E\x02\xF7\0\xEF\xFE\xB1\xFD\xF1\xFE<\x01\xEA\x01T\x01\x11\xFF\xAB\xFD\xF0\xFE\xDE\0\xE8\x01p\x01`\xFF\x95\xFD\xCB\xFE\x15\x01\x15\x02\xC7\0\x8B\xFE\x8F\xFE\xFB\xFF\x13\x01\xE9\0\xAE\xFF\x03\xFF\xC0\xFF\x9C\0~\0\xE3\xFFv\xFF\xCB\xFFe\0\x8F\0\xD5\xFF/\xFF\xBB\xFF\xB1\0\xE9\0\xEC\xFF\x04\xFFP\xFF9\0\xCB\0\x89\0\xDB\xFFR\xFF\xCD\xFF\x17\0\x11\0;\0\x1F\0\x15\0\xF2\xFF\xC6\xFF\xAF\xFF\xFA\xFFn\0|\0\xEE\xFFT\xFF\x8C\xFF=\0\xD8\0z\0u\xFF\x07\xFF\xBC\xFF\xDF\0\xED\0\xDB\xFF\t\xFFt\xFFn\0\xAA\0\x18\0\xB9\xFF\xB5\xFF\xDE\xFF", "\xC1\0\xD8\0*\0[\0]\x01+\x01E\x02\x0B\x02\xDB\0%\x01\x94\0=\x01\xF1\xFFH\xFE\xFF\xFEX\0\xF5\xFF\xBC\xFE\x16\xFE\xC4\xFF\xB2\xFE1\xFC\x9E\xFD\xFC\xFD\xFC\xFE(\x02D\xFD\xC7\xFE\xD5\x03\x95\x008\x04\xE8\xFE\xA7\xFA\xF8\b\xFC\x07\xCA\xFB*\xFF\b\xFC$\x05\x1B\f\xFB\xF5\xBE\xF7\n\x05J\xFF\xF1\x01\xC3\xFE\xFE\xF6\xCF\x03F\x04r\xFA\x8D\x02\xC6\x04\x8C\xF9\xF0\x006\xFFJ\xFB\'\x0EG\x02\x93\xECZ\x02\x05\x058\x05c\x0F\xCD\xED\xD1\xF7\xD0\x0EA\xF7I\x02\x15\x06\xC2\xF5\xB9\b\xBB\xF9\x1B\xEF7\r\x96\x06\x07\xFDC\0\xD8\xF4\x11\x04\xE1\x13\x1E\x03[\xF7\xDD\xF7{\xFDr\x07\x06\n%\xF9\xB8\xF7w\xFF\x19\xFB\x8F\x05b\n\xB8\xFC;\xFC\xE5\xF7\x89\xFBO\x0E\xDE\x07W\xFCR\xF6\x03\xF6\xD1\x05\x04\x0Ey\x03\f\xFB\xA3\xF7\xAB\xFD\x83\x066\x06\xD9\xFF\x17\xFA\x98\xFA\xFC\xFC\xC9\x02\xE7\x04+\0\xB0\xFA\xB5\xF6,\xFD\x97\t\xA9\n\xE5\x02x\xF8\xC9\xF6\xC4\x02@\fw\t\x1B\xFD\xDF\xF3T\xFB\xE6\x07\x84\n+\x02\x85\xF6\"\xF7E\xFFD\x07`\x07\x99\xFF\x9C\xF7q\xF5\xC6\xFCz\x05p\b\xBA\0\xB4\xF6\xE7\xF6\t\x01\x18\n\xAF\b:\xFF\x04\xF8\x87\xFB\x9F\x04\xF5\t\xFF\x05L\xFCw\xF9\xF2\xFC9\x01\xC7\x04\xB3\x04\xB6\xFE\xFF\xF76\xF9\xEA\0\x8A\x07\xC1\x03\xBD\xFA\x18\xF9M\xFE\x84\x06\xEB\x07D\xFF\xA8\xF8\x18\xFB\x1F\x03N\x07\xEE\x03\xEE\xFD\xA1\xFCh\xFEt\x01%\x03\x10\x01\x81\xFE#\xFC\x95\xFCu\xFFp\x03h\x01-\xFBe\xFA\x80\xFFX\x05<\x04\xCB\xFF\x85\xFD\x1C\xFE1\0\xC4\x01\xF2\x02\xEA\0\xCB\xFE\x04\xFEh\xFF>\x04\x84\x05\x9A\0\x9B\xFA\x9E\xFB0\x02\xB6\x04\xFF\0\b\xFD\x05\xFDK\xFF+\x02+\x03\xC1\0\x9C\xFD\xA9\xFC8\xFF0\x02\xCE\x024\x01\"\xFE$\xFE\xF3\xFF\xDB\0V\0\xD8\xFD\xE0\xFD\xD1\xFE\x03\xFF]\xFF\xB6\xFF\xA1\xFE\xD1\xFD_\xFF\x99\0\xC7\x01\xA1\x01\x88\xFF\xD9\xFEb\x01\x01\x03\xE3\x02>\x02\xEE\0\x95\xFF\x93\0v\x02Y\x02\xED\0 \xFE\x95\xFE?\0\x12\0F\xFF\x17\xFF\x83\xFE\x9C\xFD\x90\xFEy\xFE\xBF\xFE\xBF\xFF\xAB\xFD\xDA\xFDW\x01\xDC\x01\x1C\0\xBB\xFF\xEF\0\xAF\x02\xD1\x03\xDF\0W\xFF^\0\x19\0p\xFF\xA6\xFE\x04\0q\x01\n\xFF\xF9\xFC\x87\xFF:\x02e\0{\xFDd\xFD0\0\x97\x02t\x014\xFF\x03\xFF9\x01\xB7\x01\x07\0\x15\xFF!\xFF\x1B\x01\xC0\0\xC5\xFF \x01J\0U\xFFX\xFF\xC3\xFF\x1D\x01\xFF\0=\xFE\0\xFD\xF5\xFE\x85\0\xF3\xFFe\xFF\x91\xFF#\0&\0\x88\xFF(\0|\0Z\0\x04\x01\xCD\0+\xFFs\0\x1A\x01\x1F\0\xDB\xFF\x1D\0\"\x01+\x02!\x02\x04\0\xCC\xFFV\xFF\xB7\xFE;\xFF\x90\xFF\xDF\xFFj\0\xFA\xFF(\0\x81\0\xFA\xFF\x14\0\xEF\0", "\x9F\0\xAB\x01\xE8\x01\xC2\x01m\0\xF0\xFFy\x01\x7F\x01p\xFF\xEC\xFEr\xFFj\xFF\xC6\xFE8\xFF_\xFF\xD3\xFD\xEB\xFES\x01\x9F\0\xBC\xFFt\xFF\x10\0\x82\x01p\x01r\0L\xFFq\0f\x01P\xFF\x95\xFE\x82\xFFW\x01\x16\x01Y\xFFG\xFFL\0\x8F\x016\x01\xF6\xFE\x18\xFE\x9A\0\xF1\xFF;\xFFe\0c\xFF\xE8\xFFS\0\xBE\xFF)\x01\x93\0\xE0\xFFO\x01]\xFE]\xFE\x1C\x02\x19\0\xA8\xFD\xD5\xFC\x88\xFD}\x01s\x01L\xFFK\xFF\xEA\0\x86\x02v\0*\xFED\0\xAA\x04\x90\x03\x1D\xFE\xE1\xFCI\0\x0B\x03:\x02\x0B\xFE\xAA\xFC\xD3\0\xF2\x01\\\xFFU\xFD\x86\xFD\xC3\xFF$\0\x8D\xFE\xB1\xFE\x96\xFE\xCE\0\x84\x03\xF0\0\xA0\xFE\xD3\xFB\xF5\0\xDF\x07\x8A\x02\xB5\xFE\xCD\xFCm\xFDs\b\x97\x03X\xFA,\xFF\"\xFB\xF4\x01\xE4\t\xDD\xF9\xC1\xFB\xDE\xFF\r\xFC\x1F\x0B\xDA\xFC\0\xEF=\x02+\x05\xA2\t\xA1\x04\xBA\xE9k\xFA\xB7\x12\r\x0B#\x03#\xF0\xEE\xF0\xA3\x0E\x17\r\xC3\xFC\x15\xF9C\xF6y\x03J\x0Bj\xFFT\xFB\x8D\xFE\xF4\xFF\x0F\x04\xD1\x01\xE9\xF9T\xFE\x87\x07\x1A\x06w\x01\x9E\xF8\xAF\xF3)\x03\xBC\x0Bs\x06)\xFB\x0B\xEFK\xF87\n\x92\x0Ba\x01\x8B\xF4\xBE\xF4\xA9\x037\x0BC\x06\xA2\xFCG\xF9\x05\xFF\x1F\x04\xF6\x02\xEF\xFE-\0u\x03\x83\x016\xFDB\xFD\xAF\x01S\x05\x18\x03\x95\xFD\x06\xFA\xA4\xF9@\xFE\x9C\x03\xD2\x04\x02\x03\x8B\xFC\x97\xF7\x82\xFA\xF7\x01\x01\t\xFE\x05\xAC\xFC\x13\xF8\xE3\xFA\xC3\x036\x0B+\bn\xFF\x91\xF7t\xF6W\xFF\x91\n;\f\r\x02I\xF5-\xF2\xA1\xFD{\nd\f\x11\x02-\xF3\x80\xF0+\xFD?\n~\rY\x02y\xF5\x8A\xF4\xED\xFD \t2\f\xCD\x03\x1F\xFA@\xF6\x8C\xF9&\x03\x0E\n\x13\b\x8F\xFE\r\xF5\x7F\xF6K\x01B\tY\b\x10\0b\xF8\xC4\xF8\x15\xFF\"\x06[\t$\x04:\xFC\b\xF8\xF4\xFB\xBB\x03\xB3\x06q\x04F\xFE\xD2\xF8\x11\xFAJ\xFF\xB9\x03\xFB\x04\x91\x01\'\xFB7\xF83\xFD-\x04\x8C\x07L\x03\x9D\xFC\xA6\xF9V\xFC\x1F\x03\x10\b\xD2\x05*\xFF\x02\xFA\xCA\xFAC\x01q\x06\xB5\x05\x1B\0\0\xFA\xEA\xF7V\xFC\x95\x03\xFE\x06\x9F\x019\xFA&\xF9y\xFE\x13\x04\xDA\x05\xDE\x02\xEC\xFC\xD4\xFA\xBD\xFE\xF9\x03\x14\x06\xC3\x03\xEA\xFE\x06\xFC6\xFD$\x02\x1C\x04\xF4\x01\x1C\xFF\x82\xFC\xCD\xFC\x05\xFF\xE6\x01\xC6\x02o\xFF\xBC\xFBM\xFC\xF9\xFEd\x02<\x03\x7F\0;\xFE\xC3\xFEg\0v\x01\xC6\x01\xC7\x01H\x01\x9C\xFEL\xFE*\xFF\xAC\0l\x02\x83\0U\xFDG\xFD\xC9\xFF\x17\x02\xFA\xFF\x9E\xFE\xD9\xFE\x96\xFE<\0\xC3\0g\0\x0E\x01\xB5\x01\x99\0#\xFF\x01\xFF\xF8\x01\\\x03\x8A\0\n\xFE\xCD\xFE:\0N\x01\x90\0\xCB\xFE\x94\xFD\xE5\xFC\xF9\xFDH\0\x91\x02\xB0\x01l\xFE{\xFD\xF3\xFF\xB6\x02\x7F\x03\x97\x01O\0\xF4\xFF\x03\0k\0\xAB\xFF\x8E\0\x18\x02\"\xFF\xA2\xFCi\xFE$\x01T\x01\xE6\xFDh\xFB\xEF\xFD\x10\x01\x0F\x01E\xFFJ\xFEI\0\xAF\x01J\x01\xDE\0\xD4\0\xDA\x01\f\x02\r\0\xD2\xFE\x87\xFF"];
	let a = 0,
		b = 0;
	Pip.typeTimer && clearTimeout(Pip.typeTimer);
	let h = 0;
	let d = 0;
	let f = i.split(/\x20|\xa0|\x09/);
	let e = f[0];
	bC.setFontMonofonto16().setFontAlign(-1, -1).setColor(3);
	const c = bC.getFontHeight();
	return b == 0 && (bC.clear(), drawVaultTecLogo(199, 15, bC), b = 125), new Promise(j =>
	{
		function i()
		{
			if (d == 0 && a + bC.stringWidth(e) > 359 && (a = 0, b += c), b > bC.getHeight() - c && (bC.scroll(0, -c), b -= c), d < e.length)
			{
				let f = e[d++];
				bC.drawString(f, a + 20, b), bC.flip(), Pip.audioStartVar(g[Math.random() * g.length | 0]), a += bC.stringWidth(f), (f == "\n" || a > bC.getWidth() - 6) && (a = 0, b += c)
			}
			else
			{
				if (d = 0, a && (a += 8), !(++h < f.length))
				{
					Pip.typeTimer && clearTimeout(Pip.typeTimer), Pip.typeTimer = 0, j();
					return
				}
				e = f[h]
			}
			Pip.typeTimer = setTimeout(i, Math.random() * 50 | 0)
		}
		i()
	})
};
let alarmTimeout;
configureAlarm(), Pip.offAnimation = function()
{
	var a = (E.toFlatString || E.toString)("0\xB5O\xF0\xC0D*##\x80\x11K\0\"$%\x1A\x80\x1D\x80\x01%\x1D\x80\xBB%\x1D\x80+%%\x80\xC0\xF3\x0F%\x1D\x80\xC5\xB2\x1D\x80\xC1\xF3\x0F%\x1D\x80\xCD\xB2\x1D\x80\t\x1A,%O\xF4\xCCp\x01\xFB\0\x01%\x80\x10F\x8AB\x02\xDA\x18\x80\x012\xFA\xE70\xBD\0\0\x02`\xF0\xB5O\xF0\xC0F*#3\x80;K\0$$\'\x1C\x80\x1F\x80\x01\'\x1F\x80\xBB\'\x1F\x80+\'7\x80E\x1C\xC0\xF3\x0F\'\xC0\xB2\x1F\x80\x18\x80\xC5\xF3\x0F \x18\x80\xED\xB2. \x1D\x800\x80\x18\x88\xAD\xF2lm\x80\xB2\xAD\xF8\x06\0\x02\xAF F\x1C\x88\'\xF8\x10@\x010\xB0\xF5\xCC\x7F\xF8\xD1O\xF6\x1F\x0E\x02\xEA\x0E\x0E\0&\x02\xF4\xFCb\x1C\x887\xF8\x16P\xA4\xB2$\xF4\xFCl%\xF4\xFC``DpD\x05\xF4\xFCe\x04\xF4\xFCd,D\xC5\x03H\xBF@\xF4x@\x14D\x85\x06H\xBF@\xF0\x1F\0%\x05H\xBFD\xF4\xFCd\x04\xF4\xFCd \xF4\xFC` C\'\xF8\x16\0\x016\xB6\xF5\xCC\x7F\xD8\xD1O\xF0\xC0@*\"\x02\x80$$\0\"\x1A\x80\x1C\x80\x01$\x1C\x80\xBB$\x1C\x80+$\x04\x80\xC1\xF3\x0F$\xC9\xB2\x1C\x80\x19\x80\x1C\x80\x19\x80,!\x01\x807\xF8\x12\x10\x19\x80\x012\xB2\xF5\xCC\x7F\xF8\xD1\r\xF2lm\xF0\xBD\0\xBF\0\0\x02`\xF8\xB5P$\x0FF\x04A\x9E&\0%\xA5B\x0F\xDA\x0150F:F\xC5\xF1\xA0\x01\xFF\xF7s\xFF\xC6\xF5\x9Fp:F\x05\xF1\x9F\x01\xFF\xF7l\xFF\x02>\xED\xE7e\0\xC4\xF1\xA0\x01\xC5\xF1\xA0\0\xFF\xF79\xFF\x05\xF1\xA0\x01\x04\xF1\xA0\0\xBD\xE8\xF8@\xFF\xF71\xBF\0\0"),
		b = E.nativeCall(337, "void(int,int)", a);
	return new Promise(e =>
	{
		var a = 0,
			c = ((g.theme.fg & 63488) > 16384 ? 2048 : 0) | ((g.theme.fg & 2016) > 512 ? 32 : 0) | ((g.theme.fg & 31) > 8 ? 1 : 0),
			d = setInterval(function()
			{
				if (a < 7) b(a, c);
				else
				{
					analogWrite(LCD_BL, 1 - (a - 8) / 8,
					{
						freq: 200
					});
					var f = 200 - (a - 7) * 20,
						h = f + 25;
					f < 0 ? (LCD_BL.write(0), clearInterval(d), e()) : g.clearRect(240 - h, 155, 240 - f, 165).clearRect(240 + f, 155, 240 + h, 165)
				}
				a++
			}, 50)
	})
}, Pip.offOrSleep = function(a)
{
	a = a ||
	{}, Pip.idleTimer = undefined, Pip.sleeping = "BUSY", Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.remove, delete Pip.removeSubmenu, Pip.radioOn && rd.enable(!1, !0);
	let b = () =>
	{
		Pip.audioStart("UI/POWER_OFF.wav");
		let b = [LED_RED, LED_GREEN];
		Pip.radioOn && b.push(LED_TUNING), Pip.fadeOff(b), Pip.offAnimation().then(b =>
		{
			MEAS_ENB.write(1), setTimeout(b =>
			{
				Pip.sleeping = !0;
				try
				{
					clearWatch(), setWatch(Pip.powerButtonHandler, BTN_POWER,
					{
						repeat: !0
					}), a.forceOff ? (console.log("forceOff => turning off completely"), Pip.off()) : Pip.sleep()
				}
				catch (a)
				{
					log("Error going to sleep: " + a)
				}
			}, 1e3)
		})
	};
	a.immediate ? b() : Pip.fadeOff().then(h =>
	{
		g.setBgColor(0).clearRect(36, 40, 444, 288);
		let c = Graphics.createArrayBuffer(260, 35, 4,
		{
			msb: !0
		});
		let a = 15,
			d = -1;
		bC.clear().setFontMonofonto28().setFontAlign(0, -1).setColor(3).drawString("PIP-BOY 3000 Mk V", 200, 10);
		let e = settings.userName ? "Assigned to " + settings.userName : "Serial number " + Pip.getID();
		bC.setFontMonofonto18().drawString(e.toUpperCase(), 200, 60), c.setFontMonofonto36().setFontAlign(0, -1);
		let f = setInterval(b =>
		{
			c.setColor(a).drawString("- SLEEP MODE -", 130, -3), bC.flip(100), Pip.blitImage(c, 110, 180), a += d, (a == 15 || a == 6) && (d = -d)
		}, 100);
		Pip.audioStart("UI/BURST5.wav"), Pip.fadeOn([LCD_BL]), setTimeout(a =>
		{
			clearInterval(f), b()
		}, 3750)
	})
}, Pip.offButtonHandler = () =>
{
	if (BTN_POWER.read())
	{
		let a = setWatch(a =>
		{
			clearTimeout(b), settings.longPressToWake && (settings.longPressToWake = !1, saveSettings()), Pip.offOrSleep(
			{
				immediate: !0
			})
		}, BTN_POWER,
		{
			edge: "falling"
		});
		let b = setTimeout(b =>
		{
			if (clearWatch(a), BTN_TORCH.read()) return;
			settings.longPressToWake = !0, settings.alarm.enabled = !1, saveSettings(), configureAlarm(), Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), Pip.audioStart("UI/BURST5.wav"), E.showMessage("Pip-Boy powering off"), setWatch(a => setTimeout(a => Pip.offOrSleep(
			{
				immediate: !0
			}), 1e3), BTN_POWER,
			{
				edge: "falling"
			})
		}, 2500)
	}
	else Pip.offOrSleep(
	{
		immediate: !0
	})
}, Pip.idleTimer = undefined, Pip.kickIdleTimer = function()
{
	Pip.idleTimer && clearTimeout(Pip.idleTimer), Pip.idleTimer = settings.idleTimeout && !VUSB_PRESENT.read() ? setTimeout(Pip.offOrSleep, settings.idleTimeout) : undefined
}, Pip.kickIdleTimer(), Pip.brightness = 20, Pip.sleeping = !1, Pip.demoMode = 0, Pip.fadeOff = (b, c) =>
{
	Pip.fadeTimer && (clearInterval(Pip.fadeTimer), c = Pip.tempB), c == null && (c = Math.pow(2, Pip.brightness / 2) / 1024), b == null && (b = [LCD_BL]);
	let a = c;
	return new Promise(d =>
	{
		let c = function()
		{
			clearInterval(Pip.fadeTimer), b.forEach(a => a.reset()), delete Pip.fadeTimer, delete Pip.tempB, d()
		};
		Pip.fadeTimer = setInterval(() =>
		{
			if (a *= .65, a < .01) return c();
			b.forEach(b => analogWrite(b, b == LED_GREEN ? a / 2 : a,
			{
				soft: b == E3 || b == E4,
				freq: 200
			})), Pip.tempB = a
		}, 40)
	})
}, Pip.fadeOn = (b, c) =>
{
	Pip.fadeTimer && clearInterval(Pip.fadeTimer), c == null && (c = Math.pow(2, Pip.brightness / 2) / 1024), b == null && (b = [LCD_BL, LED_RED, LED_GREEN], Pip.radioOn && b.push(LED_TUNING));
	let a = Pip.tempB || .01;
	return new Promise(e =>
	{
		let d = function()
		{
			clearInterval(Pip.fadeTimer), b.forEach(a => analogWrite(a, a == LED_GREEN ? c / 2 : c,
			{
				soft: a == E3 || a == E4,
				freq: 200
			})), delete Pip.fadeTimer, delete Pip.tempB, e()
		};
		Pip.fadeTimer = setInterval(() =>
		{
			if (a *= 1.46, a >= c) return d();
			b.forEach(b => analogWrite(b, b == LED_GREEN ? a / 2 : a,
			{
				soft: b == E3 || b == E4,
				freq: 200
			})), Pip.tempB = a
		}, 40)
	})
}, Pip.updateBrightness = () =>
{
	let a = Math.pow(2, Pip.brightness / 2) / 1024;
	analogWrite(LCD_BL, a), analogWrite(LED_RED, a,
	{
		soft: !0
	}), analogWrite(LED_GREEN, a / 2), Pip.radioOn && analogWrite(LED_TUNING, a,
	{
		soft: !0
	})
}, Pip.powerButtonHandler = () =>
{
	if (Pip.sleeping == "BUSY") return;
	Pip.sleeping ? checkBatteryAndSleep() || (Pip.kickIdleTimer(), settings.longPressToWake ? wakeOnLongPress() : (wakeFromSleep(showMainMenu), Pip.audioStart("BOOT/BOOT_DONE.wav"))) : (Pip.idleTimer && clearTimeout(Pip.idleTimer), Pip.offButtonHandler())
}, Pip.usbConnectHandler = a =>
{
	if (console.log(`USB ${a.state?'':"dis"}connected`), Pip.sleeping == "BUSY") return;
	Pip.kickIdleTimer(), Pip.sleeping ? a.state && (console.log("USB connected - waking up"), settings.longPressToWake ? (settings.longPressToWake = !1, saveSettings(), wakeFromSleep(playBootAnimation)) : wakeFromSleep(showMainMenu)) : drawFooter()
}, Pip.addWatches = () =>
{
	clearWatch(), pinMode(KNOB1_B, "input"), setWatch(a =>
	{
		let b = a.state ^ a.data ? -1 : 1;
		Pip.emit("knob1", b), Pip.kickIdleTimer()
	}, KNOB1_A,
	{
		data: KNOB1_B,
		edge: 1,
		repeat: !0,
		debounce: 0
	}), setWatch(a =>
	{
		Pip.emit("knob1", 0), Pip.kickIdleTimer()
	}, KNOB1_BTN,
	{
		repeat: !0,
		edge: "rising",
		debounce: 20
	}), Pip.mode == MODE.TEST ? setWatch(E.reboot, BTN_POWER,
	{
		repeat: !0
	}) : (pinMode(KNOB2_A, "input"), setWatch(a =>
	{
		let b = a.state ^ a.data ? 1 : -1;
		Pip.emit("knob2", b), Pip.kickIdleTimer()
	}, KNOB2_B,
	{
		data: KNOB2_A,
		edge: 1,
		repeat: !0,
		debounce: 0
	}), setWatch(a =>
	{
		Pip.emit("torch")
	}, BTN_TORCH,
	{
		repeat: !0,
		edge: 1,
		debounce: 50
	}), setWatch(Pip.usbConnectHandler, VUSB_PRESENT,
	{
		repeat: !0
	}), setWatch(Pip.powerButtonHandler, BTN_POWER,
	{
		repeat: !0
	}))
};
let showTorch = () =>
{
	if (Pip.sleeping) return;
	Pip.remove && Pip.remove();

	function a()
	{
		Pip.removeAllListeners("torch"), Pip.audioStart("UI/L_OFF.wav"), Pip.fadeOff([LCD_BL], 1).then(a =>
		{
			g.clear(), showMainMenu(), Pip.fadeOn([LCD_BL])
		})
	}

	function b(b)
	{
		b || a()
	}
	Pip.fadeOff().then(c =>
	{
		Pip.audioStart("UI/L_ON.wav"), g.setColor(g.blendColor(g.theme.fg, "#FFF", .2)).fillRect(0, 0, 479, 319), Pip.fadeOn([LCD_BL], 1).then(c =>
		{
			Pip.on("torch", a), Pip.on("knob1", b), Pip.remove = function()
			{
				Pip.removeAllListeners("torch"), Pip.removeListener("knob1", b)
			}
		})
	})
};
let torchButtonHandler = () =>
{
	if (BTN_TORCH.read())
	{
		let a = setWatch(a =>
		{
			clearTimeout(b), showTorch()
		}, BTN_TORCH,
		{
			edge: "falling"
		});
		let b = setTimeout(b =>
		{
			if (clearWatch(a), BTN_POWER.read()) return;
			if (BTN_PLAY.read() && KNOB1_BTN.read()) console.log("Torch, play and knob1 buttons held down - entering Factory Test Mode"), Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), Pip.videoStop(), factoryTestMode();
			else
			{
				let a = 1;
				let b = setInterval(d =>
				{
					const b = [2, 10, 20];
					let c = b.findIndex(a => a >= Pip.brightness);
					c >= b.length - 1 && (a = -1), c == 0 && (a = 1), Pip.brightness = b[c + a], Pip.updateBrightness()
				}, 1e3);

				function c()
				{
					b && clearInterval(b), b = undefined
				}
				setWatch(c, BTN_POWER,
				{
					edge: "rising"
				}), setWatch(c, BTN_TORCH,
				{
					edge: "falling"
				})
			}
		}, 1e3)
	}
	else showTorch()
};
let drawVaultTecLogo = (b, c, a, f) =>
{
	a || (a = g);
	let d = "\xBDL\xA0@\xF3 :\xFF\xFE\x90Z\xCC\x1F\xFE\0\x07\xFA\x1Db\x16\x1D\x0B\xFF\xFE\x0E\xB3\xE4.\x83\xBF\x1E\xAEY\x07\0\x05\n^\x1EZ\x02\x1D\x10<\x0F\xD0<\xAE\xFC:$\x02\x7F\xD0\x0E\xA9/\x0B\x02\xD5\x05\xA8\x10\x94b\xB1uP\x005\xB2\x98-P\x8E\xE0\xC0\xBF\xC0\xC0\xAA\x8C\xE4\x03\0\xBC\xC5\x06\f\xB0,\0\x1D\0\f\tt\x1B\xF8\\\x19xx\xE8\x17\xFF*Z\x0B\xC0\xB7\x11j\x16\xF8\xB6\x15\xBF\xF0\xB06\x03\xFC\x1C\x03\xC0O\t\x03\xF8\x01\x83\xF0\x07H\x87\xB1\xC3\x9F\xD0#\xE1\x117\xE0pV\xE1\xEF\xC7\x84\xDF\xC1\xE1A\xFC\x102p0o\xD1\x9C\x12  \x10\\B\x1EI\xF5j\xB5H\x90w\xCB\x10\xBF\xC00|\x10\x7F\xD04\x1F\xF9\xE4\xA5\xB0\x9C\b\xFF\0\x0E\x10x\x13\x183\xF6\xAA_H\x1F\xD0\x88\t\xD4\x1F\xC2\x80\x100 \0\x7F!\xD2\x80\x01\xCF\xCF\xE0\xA0C\x8F\xF4!\xE4PS\x01\x80\re\x03\x0B\f\x02\x8C\bF\r\xF90 \0ky\xD40\0G J`\xA3\x02\x01\x82\'\x06\x1E\x12\x1B\xFF\x90^\x82\n\x1F\xC0S\x04\xBC\x0B\xFC ([\xF0\x98\xE6PA#\xFF`?\x87\xB0!\xE0\xB7\x90# !1\xFF\xF4\xB5\xE8\xF0~\x84~\x81}\x03\x89/\x03\x88\x13\x13\xFCp\x04\x005\xF6\x03\xF4\f\x82\x07\n\xFC\x07\x18\0\x19\x14\x12pc\xC3@\xE2\x80\x04\xDF\xDF\xFC\x83\xC2\x0F\"\xEF`C\xC2 ;\xFE\x8A\f\x87\x888\x05\xB0\xB2\xF5\xB1?H\x10$w\x98P?\xA0\xC0 (/2\x7F\0\xF0mZ\xA0\0\x9A\xB6X.\x10x\0\xE0g\xF4\x02\x10?\xE0\x90\xBA\xAC\x82\x04p\xB0K\0`\x1B\xE5HBPL\x80\x89B\0\x18A\x07W\xF4)\x83\x03\xFE\xADA\xFE\x18\x81\x80\x8F\x02\x1B\x94n\x04\xCC\x1E\x02_\x80\x8F\xFF\xAB\x7F\xFA\0\x18\x19\xFAH0\xF1Jp\xC6\xA0\x8E\x81\x97\x89\x02\x83\x90\xC1\x16\x06\xE0\f\xEA;\xE0#\x80!p`\x16\xF6\xD8\"@\xB7\xA4\xE0\xCF\xA4\xC3\xC9\x01\xA6\x01\x97\x84A\x8A\xD0\0\xE0\xE0\x12\xE1\x87\x81\x1E\x12\xEF\x04\0\f\t\xC0\t\xD4\x108Q\xFF\x84\bX\x1C,\xB6L\x1C\x9C\t\x04.\x84\fJ\x1C-\x02\r\xFC$8\0h\xFA$2`0\xB0\xF0@0\xA1\xE0\xD1\t\x01\x80\x06W\x04\xB7\fJ\x0E\x97^\x16\x05j\"\xF8\x16\xA9Q\xB68\xA2P\xC2\xC0\x82\xC3\xFF\x0E\xCA\0\x0B\x7F\f\x02%\x04,\x14\xFD\x9EH\0\xA68#\0\xAA\x0Bp\xC3\xA9\xAAAZ\x86\xB7\x10\0\xA4=\x90 \x90`\x022\xF0\xC0g\xC0RH6\xC8\xD2\xD5Z\xA0\xB3\x8B\0\x19ov\x1E\x005\xF4\x13\xB1\x16\xC1UZ\xA0@\xD0";
	if (a.drawImage(dc(d), b - 61, c), f) return;
	let e = "\xAC\xC4\xE0[\xFE\x04\xBF\xE5\xFF\x80_\xF8_\xE9\x7F\x87\xFF\xFF\xE0@\0`\xF5\xFF\xFF\b\x0E\xFF\x9F\xF8\x87\xFF\x01\xA0\xCB\xFE\x1F\xFE\x7F\xF3~\x0F\x06\x01?\xFF\xFE\xBF\xFF\xC8\x17\xFF\xE7\xFF\x81\xFF\xA7\xFFH_\xF2~\b\x06^\x0F\x06\x01\x0F\xFF\xFF\x83\x80\x85A\x14\x05\xFF\xAF\xFF\x80\xE0\x8CB\xE5\x8F\x81\x80@\xC0`\xEB\xFF\xFC\x10 1\xFF\x86\xFC\x1C\x0F\x03\x7F\xC3\xFF\xCF\xFE:\xFF\xF6\x02\0\x03\x07\x17\xFE\xD0\x7F\xFE\x982\0#\xC0~\x05\x81\x05\0\xA0\x01\x01\x827\x04\xF8\t\x80\x10p?\x8F\xFF\xF4\xB0 (\x14  0\x92\xC0\xCF\xC2\xA0\xCB\xFEa\x10\x7F\xF8\"\xC0`\xD0~?\xFF\xC0D\x13\xA8#`F`\xFF\x8F\xA1\x17\x01,\x05\xF0\f\x82\x80\x04\x06\f-0\x10\xCC \xD8?\x7F\xE1``\xF8!\xD0S\x02.B\xF1\x81\x81\xA5\x96\x05G\x02\x1D\x04\xB0\b\xD8(\x04\x1C\x12\x14\xFF\xC4X\x1BU\xA8,\x05\xFA\xC7\x96\x01\x10\x82N\x0B\xF9\x7F,\n\r\x04\xB0\x13\xCC%\xC83\xFF\xF18\x11P+\x13~\x90\x03\xA04\xF0\xA8<?\xF6\xFC\xB0\x0F\xF5b0@!\xA8\'\x80\x95\0\x80\x84j\x84:\x05b\x17\x80\x14\b\x1C\x15\xE8#pQ@\xB3B_\x84X\f@\f|b\f?\xF0\xE5\x04^\x17\xF6\x1E\xBF\x10\xB0\x1F\xFA\x02\x98\x06\x03\xA8\x8Dd#Z\b\xFF\xE2\x02\x97\x06\xD5@\x0B\x02\x03\x06\xD5\xAA\x80A\xBF\0";
	a.drawImage(dc(e), b - 45, c + 60)
};
let drawVaultNumLogo = (b, c, d, a) =>
{
	a || (a = g);
	let e = "\xFFX\xE0A\xF7 \xBA\xFF\xFF\xFB(^\xE6\xDF\xFF\0\x07@\x1E\xED\x06\x1E\x88\0\x07\xC8>\xD6\x16>\x1B\xFF\xF8\x1Fi\x1B\x1F\x0F\xFF\xFC\x8F\xB3\x8F\x8F\x88\xFF\xFFW\x9D\xAF\xF5\x1F\x16?\xCA\x0E>/\xFF\xF4\x1F_\x02\x1F\x19\xFF\xF0\x0F\xEF\xDF\x8F\xCD\xE0\x0F\xAE\x9F\x8F\x8D\xFF\xD0\x07\xD6\xC7\xC7\xC7\x7FG\xD6\xC1\xC7\xC7\x7F\xFE\x83\xEB #\xE3\xFF\xFD\x01\xFD\x97\xF1\xFA\x0F\xEB\x1F\x83\xE5\x11\0\xEF\xDF\xD9@\xC6b\xFEAa\xC2\xDF\xD4\xC6\x96&\x8C\x85\x81\x05\r\xF4\xBC\xE8\xF0\x05E\x1F\x9D\xFF\xA0\x0F\xA6X\x0E??\0>\xB6\x01\x03?\xCB\x1F\x12\x9B\xFC\f\x11\x0B\f\x1B\xFE\x1F*%d\xB0w\xE0|\xA3\x91\xA9\xF8d\xDF\x03\xF2>\x80h\xA7\xF4p1\x19\xBF@\xD3?\x03\xF2\x8E3_\x85\0\x01\x87\x86\x8C\xFE\x8F\x94_\x1C\xFC(4z\xF5G\x19\xCA# A\xA3:\x03\xE5D\x86(\x8D\x85\x86\x8B\xF0\x0F\x95\x1F\x9A\xBD2\x01?\x1FD\xE41zd\x02\x02\x18\'\xFC\xFBX\0L=z\x80I0\x03\fQ8\t\x84V\xCC\x80\ru\x07\xF4\t\x1B\x03)\x06>\x98V\x9C|$\x17\xC0\x7F2\xA92\x90t\x01\xF4\xB0\xB1P_\xC0\x9A_\x83\xF4\xC6\xA0\xF8\t$\x82g\x80\x16\x87\x9A\x92\x81\xA4\x92?6\xE9>~\x13\x0B\xA0-R\r\xBF\x17\x86\0;\xE0$:\x04#K\xFF\xE8\f\x87\x1B\f\xA7\xFF2\x1F\x1F\x12\'\xFE\f/\xFF\xF04\x93\x1F\xA7\x0B\f.\x006\x1E&S\xFB\0\x83\x85\xD4?M\xFF\xFC@\x82\xEA\x95\xC1?I\xFF\xF8o\xC2\xEA\xF0\x0F\xD2\xFF\xF9\xE1e\x7F\x87\xE9\xBF\xC7\xEF\xB8o\xDF~\x81u\xBC\x07\xE9L\xC0\xCB\xDA\xAA\x9F\xA6\xA0@/\xE1u>\x07\xE9p\x01\x80G\xEA\x8F\x8F\x8F\x8F\x97\x80F\x8F\xD1\xC0\x84\x89\xFEL\x87\xAAI\t\x9F?\t\x85\xD0\x17*\0>\x1E*\x0B\xF0\x13:\x06\x13\x0B\xF8>\x94\xFC\'\0&u\xFC&\x90\x01hY\xA9 \x98i#\xC0\x0B\x9A\x83\xF0$\x92\xA0\x0F\xA5t\x87\xFF\t\x9D\x1F\t\x05\xF0?M?\x15\x85\xF4)B\0^\x04+\x0F\x80\xD1\x84\0\xBC<V\x17\xF4%\0\x01-\xF9\xE00\0\xAE\xA3R\"\0\x06\xC8\x0FW\x80\x89\n\xFF\xE0\x03FO\xC3%1W\x1F\x18\xAB6\x16\x1A/\xA0\xBC\x85|r\xF4\xB0\0<\x01\xF2\xAA\"\xD7\xC7_\xC3FP\x07\xCAG\xC4f\x7F\x83E\xC3\xC3F6M\0\x0F\x03\x11\x99\xFF\xFA\x06\xA5^\xAF\xFF\xE8\x06\x8A\f\x9A\xBEV\x04$9\xFCQd\xEF\x01\xF9HX\x90\xD7\xF1Q\xF0\xC9\xBF\xC1\xF2\x90\tx\x95r\xC1\xDF\xF1\xF2\xB0\x0B\xF8\x94\xDF\xA0\\x\x1B]\x90\x01\x9B\xF1\xFA\xB0!\xF4\xC7\xF3\xFC\x03\xEB\xA0\x10mP\0]y\xFC\xB1\xF0\xDE\xA0\xD8\xDAQ\xEB\0\x02]\xE3~Aa\xC2\xD9f\x80$\x8F\xAAF\xD2@ ;\xF0H\xBF\xD1\xF5p\x0B\xFB\xC4\xE0\x004\x01\xF5p\x11\xF2\x1E\x03\xF5\x90q\xF1\xEF\xCB\x1F\xC4\x80\x07~Z\0\x06~\xFC\xEC\0\x16\xFC|o\0}t\x04|o\x80}t\x02\x06>3\xE8>\xBE\x01\x0B\x1F\x17\xF8\x1F`?0}\x90\xFC\xBF\xE8\xFB!\xF9_\x91\xF6c\xF2W\x99\x80\x02\x81\x0F\x86\xF2\x0F\xB5\0\x03o\x1E\x87\xFE\xA0\x0F\xB7\x80Au\xE3\xD0r\x82\'@";
	let f = "\x95J [\xFF\xF8\0\x1F\xF4\0\n\x0F\xE2\x01\x0F\x04\x85\xFF\xF8\x03\xC2\x05\x02\t\x0F\xFC\x0F\x0F\xC0\x14\x13\x80\x04\x0F\0\x04\x0F\xE8\x0F\x0F\xFA\x14\x10H\'\x80\b\x1F@\x1E$,\x06\x17\xF0(\'\xD0\xB0\b\x10\x1A\x04?\x01\x07\x1A\x05\0\x8F\x94\x81\x80P \x12\xF2\xA0P1\xC0\'0\xC2\x81\xDF\xC0a\0\x01\x1B\x02\x14\x04j\bx\x10\xA0\x820P\xC1\x05\x04\x1F\x02-\x07\x80\x14\x14f8@\x11()\x80K\xA0\x80\x01\b\x02%\x04\xDC\x11\x88(\x04\xFCJ\x12\xB4.\x80$\x12 !\xA0M\x81\x0B\x81.\x8B\x16\x0F\x88x\f\\\x10\x90!\x98e\x80\xC7\xE1\x1E\x01,\x86\x05\f\xF8\x198X\b\xE0Bp^\0\x18\x81AI\xC0\x9E\x04\b\x06c\x05X\x18P2\x90\'p\xC7\xC1t J\xC1\xCA`\x88\x81@\x83\x0B\xC0\x1A\x03C\x06-\x07\xD6\t\x04\xB2\n0/\xFFl\b\x1D\x01t\b\0\x1F\xEA\x98$h\" \x82\x82\x96A\x07\x86\x14\x12\x80\xCB\b()H \xA0\xC60J@\x84\x03\x05\x03\xE4\x80@\xB5@\0\xB5 ";
	let h = "\x95J _\xF0\0_\xE8x\x140\0\x9E\0I\x1F\xC0\xA0\x9D\xF0 t\0 \x7F\x80 \x7F\0\xA0\x80@\xFF\xB0\x01q\x1C\0x\x7F\xC86\xAB_\xFF\xFA@-Z\xA0P8\b\x04\x04\b\tt \xB0?\0 3\xFF\xFF@\b\t\x94\x1F\xF0\x10\x189\b\x10\xA0@\xF0x\0@C\xC2B\xC5\xC1@#\xE4 AA\x03\xC3\x11\x83\xFC\x04\x84\x0F\x04\\\x10\x8C\x12\x100\b\x18<1\x18#\x80\xA0\x17\xF1 g \xCAA\x07\xC2\x02\x049\b\xE6\x10\x94\x13\xE8b@\x83A\x01\x02\x15\x04)\x04\xE6\x13L#\xC0D\x90V\xE0\x91\x02%\x07/%\x065\x04\xBE\x18\xBC8\x06\xFC\b\x1A8\x12xCPB\x81\xA8\xC4\x1D\x02\x14\b^\n\xA0@\xA0\xA7@\x82\x84\x8AE\x07\x82)\b\x86 <\x1F\xEE@\xB0\x1C\x15\xD8\x1F?\xA0~\x0B\x01\xBE,\x05\xFCH\x84}\x04\x1A\x10\0\x1Ax\x100\x90@\xF0\x81!\x88\x83$\x02\xBB\x0B\xFF\xF8\n\t\xC0\x07\x06\xB6\f<\bP50!@\x83\"\x02A@\x02\x9B\x0E5\xFA_\x82\\\x07_\xE8\x02\x02";
	a.drawImage(dc(e), b - 127, c), d == 32 ? a.drawImage(dc(f), b - 21, c + 30) : d == 33 && a.drawImage(dc(h), b - 21, c + 30)
};
let drawText = (c, d, e, a) =>
{
	a || (a = g);
	let b = c.split("\n");
	a.setFontMonofonto23().setFontAlign(0, -1), b.forEach((b, c) =>
	{
		a.drawString(b, d, e + c * 30)
	})
};
let showVaultAssignment = () =>
{
	if (settings.overseer)
	{
		let a = setTimeout(function()
		{
			a = undefined, Pip.videoStart(`MISC/REPOP1.avi`,
			{
				x: 36,
				y: 40,
				repeat: !1
			}), Pip.on("videoStopped", function()
			{
				Pip.removeAllListeners("videoStopped"), Pip.videoStart(`MISC/REPOP2.avi`,
				{
					x: 36,
					y: 40,
					repeat: !0
				})
			})
		}, 100);
		Pip.removeSubmenu = function()
		{
			a && clearTimeout(a), Pip.removeAllListeners("videoStopped"), Pip.videoStop()
		}
	}
	else
	{
		let b = 32 + Math.floor(Math.random() * 2);
		let c = settings.userName ? settings.userName.toUpperCase() : "CONSTITUENT";
		var a = 0;
		g.clearRect(40, 40, 440, 58);
		let d = () =>
		{
			var d;
			bC.clear(1).setFontMonofonto23().setFontAlign(0, 0), a == 0 ? (d = b == 32 ? "WE BID YOU FAREWELL!\nYOU'RE MOVING TO" : "CONGRATULATIONS!\nYOU'RE STAYING IN", drawText(d, 200, 15, bC), drawVaultNumLogo(200, 85, b, bC)) : (b == 32 ? d = "CONGRATULATIONS,\n" + c + "!\n\nYOU'RE ONE OF THE CHOSEN\nPIONEERS WHO WILL\nREPOPULATE VAULT 32!" : d = "CONGRATULATIONS,\n" + c + "!\n\nYOU REMAIN A\nTRUE AND TRUSTED\nRESIDENT OF VAULT 33!", drawText(d, 200, 15, bC)), a = (a + 1) % 2
		};
		d();
		let e = setInterval(function()
		{
			bC.flip()
		}, 50);
		let f = setInterval(d, 3e3);
		Pip.removeSubmenu = function()
		{
			clearTimeout(f), clearInterval(e)
		}, setTimeout(a => Pip.audioStart("UI/ALERT.wav"), 100)
	}
};
Pip.clockVertical = !1;
let submenuClock = () =>
{
	tm0 = null;
	let b = "\xB1\xEB\xE0A\x03g\xC2\x85\xA0\x7F\xF0\xC2\xD3\xFF\xFD\0.\xA4\x0B\xFF\xFF\xC8\x05\x93\xC8G\xC3\0\xFFC\t_\xC2\xC0\x80\x02\x0B\xA3\x07\x0B\x88\x18C\x81\0\xDF\x85\xC4\xFF\x05\xCE\x85\xD0!c\x01\x7F\x8As\xF2!P\xC6\x81\x06\x0F\n\x85\xEF\xFF\xE0\x18\xC0\xFF\xFF\x0F\x13\xFF\xFF\b_\xD1\xBE\x10\xC4\xF8xD\x18\xFE\x02\r\x90\x18\xA2\x11\x07\xE3\xFF\xF3\x7F\xFE\x8C\x90\x86\xC0\xB6\xCEz\x04\x14\x06\xFD@\x8F\xFC\x0Fg\f\x01\f\x07\x01\xD2G\xFA\x01s \x9F\xE1\x80lP\xE7\xEE\x80@\x05\xEE AqF`\xEF\xE8\n\xC3>\x9F\xD3\xB0_\xE0\xC0]\x1F\xF0\xC0\xC8^.\x80\x14\x0B\xC0\x03\n\x96\xAD69~\xD5\x85\x02\x0E\x05\xF8\xBF\xA5\r\x91\x97\xC4\xC0\x80\x81\xA3\xFF\xCFf\xA4\x85\xF1\x9E\x82\xFF\xB1NI\x8EK\x04.d\x1F\xFC)\x04\0%\xA1\0\b`\xC9z<\x1F\xEA\xB0?\xF4\xA1\0\t$\xDA\x1F\xFF\xB6\xC1\x04b\x14\xA3\xF8I7\xF9\x0F\xFFO\xFF\xF00\xB8>\xE9\xB2\xB0\xD9\x7F\xD2\x7F\xF1\xFF\x87\x01\f\x03\x8A\xB9\xE0\t&\xFD\xFF\xF4\xFF\xFF\xC2\xFE\x18\x07\x13\x9D\x0B\x98C\t~\x17L\n\x0F\xEF\x11\x90n\x9F\x87V\t\xD3\xCA\xB7M!\x83\xF8=\x02\xF9\x12@\x172\x02\x11\x07\xA0\x17\x13\xFD\xDB\x88\x06\f\x85\x84\x81\xC1\x86\x04\xFA\xFBI&\xCB\xC2@\xB7\xC1\0\x07\xF3n\x9Ab\x0B\xFE\xC2\b\0\x1F\0\xC4x\0.\xF8\x106\xE9\xB0\x7F\xF0L1\x98\x84\x93a\xFCp\x90_\x84\b_\xFF\xE8`\xD9\xEC\x15\xEA\x0F\xA6(\x18\x0F\xE0\x187i\xB9\xA2\xD4#\x7F\xC4\xD0G\xB3\xFE\x03\0N\xC1\x12Q\x81\xF6\x85\x81t~a\x80\xBC\x01\x83K\x80\xC1\xBF\xFA\x0B\xFA\xB4-@\\\xD8\x04}z\x10\f\x14\xB8As\xA0\x13\xFF\xFF\xE6\xB6\xF5D\0\x15\xFF\xFF\xAA\x0B\x87\xFC\x0B\x9F\0\xDF\xFF`a\x80\xFA\x01\x84\x02`\xAB\x83U\x1C\xC6\f\\\x18\xC10\xC0\xA6\x14`\x10 \xC0\x8B\x10F*\xFD\"\x14\0\xB9\xF1o\0`?]/\xC0\x17:\xDF\xEF\xFA1\xC1z\x85?\xF50\xCE\xFF\xF7\xFF\x11\xF0\xC0X?\xFE\xBD,c\0+\xFF\xF2\x02\x05\x07\xE9/\xFF_\xFF\x01r\x88\x81\x7F\xB7\xE1\0`\xDF\xE7\xD0?PH!re\xEB\xF0\xCB\xC0\xC0\xBFT\x01\b<\xB0P)r!h\xE0\xFF?\xFF\xE8$\x13(?\xE9\xFB\xEC\x96\xC0\xA4 \x7F\xF9[x\f\x1F\x80(%\x80\xEAP\xC2\"\x80\x02\x87\xB9\x03$\x14\r\t0\x10x&X\x81q !qU\x01\x01\x02\xFE\xC1\xC1A\x86\x05\x07\x86\0\x0F\xF9\x06\x02\x05\x80\x1B\t\xFC\x0B\x86\xB8\x04\x002\xF4\x12(?\xC7\xD8a\x81\x93\xA1\0\x06\xF2\x06\x01\xFB\x8F\x06\x18\x16_\b\x04\x0F\xBC0H\xC0\x91pa\x82F\x05\x7F\xFB\xE0 Z\"\x86\x03\x18\x15\xFF\xD7\x93\x03\f\r\x02\x0B\x95\xFFT\x82L\x1D\x8E\ntS\xD9\x1E\xB1\xB0n\xB0\xE0\x011\xCBa\x8B\x822\x84\xE0\x13\xE0\xFF\x10\0\x17\0\xF6A\x94_\x01\xE8o\xC1D@\xA8\x8E\x11x!q\x7F\xC8!?\xC0 \x7Fca\0\x01b\xC8\x02\xE0\x07\x02~\x8Fb2\x05\b\x06E\x07\xA1\x01{\x8E$\x04\x98\t\x901\xE0A\x80\xB2\x0F\xD1\x8Fb\r\x81\xE1\xAFG~\x03\0\x87\x82\x04=\x89\xFB\xFE\xCB\xC1A9\x04\f\x04b\x11\"/\x7F\xC2#\x140)\x88s\xD8c\xD0\xFF\x8E@\xFF\xC1pLD\x10A\xFE\xFE\x01A\x8DD\xFE\x06\x01\x85\x98\x86\x01\x05\xF7\xE3\x82\x83\xA1\xBD\x04\f\x02n\fr\b\xF8\x13(]\xF3p\x7F\xC1H\x9F\0\xC0%\x10\xDB\xC1\x99B\xD2\x82\x83\xF0)D\xF0@\x1B\xC2\x9E\x022\x85\x8BG\b\xA5\x13\x81\0\x83\xB7\x89\xFE\x04\x83.\x02\xAD\x12\x81\0\x8F\x9E\xC62\x85\xF1\x15\n\xF8\x18>!\xE0/\xF0\b\x1EZ\xFCUh\xA6!O\x01\0\x81$\x88\x8D\x06\x04\x10\x0F\xE8\xDE$\x04\x0F\0\xB6(DD\xA0)\xB1\x1B\xC2\x7F%MqQ\xA1\xFE _\xD4\xD8\x86 \x80@\xE0\xBE\xD6\xB3\xD0p\x06\xF8t\x0B\xFF\xC0\xC4G\xD2_\xC0.\x83\xFD\x0B\x82C\x0F\xF1/\xFF\xF0\xCCC\xF7\x8B@\xCA\xA8?\xFE\x80`P\xA8T\xF3\x10\xE3\xC0I\x80\xF8\x15a\x06\x03/\x84\xA1\x11\x8A!d\x12x?DX!\x81>J\xE0\x89\x80\x98\x85\'\x88\xBC\x040)\x18.\xEAl3\x10`\0\xB5\xED\xC0\x80\x01\xC2\xFF\x9B\xF0`6\xFA\x05\xBC$\x10\xD8O\xF88\x12H\x81\x80~a \xD0\xC0\xD5j\xB0\0\xB8\x9FP\x108\0\xC0\x90,\xF9\xC8(\xFF\xFA\x80\xEA\x14\0\x0E\r\x12\b\\@\0$\x90\x91a\x7F\xF5aa\x02\xA0\x9C\xC1$\x8A1\x04\x18\x0F\xAF\xFFG\n\x8A\0\x0B\x84\xCB\x04`1\0.?\xFF\x0E\x17\x1F\xF9-\x18\x0E\xF9\f0\x0F,0>\x0B\xEE\xAB\x14\0\x14|0\x1B\x04W@}\xFE\0`y\xFF\xEC\xAE\x0F\xFA~\x17\x17\xFCp\x07^I\x1C0\x0F\xCB\xFF\xD0\x80\x8C\x06\xE8_\xFF\xDB\xF2Q\x17\xFF\x17\xFF\xF0g\b\x90\"\xD4\x1F\xD7\xFD\xA0\x10`o\x0F\xFD\xF6\x18\0/\xEA\xE4/6@.9(\x1F\x05\xBE\x9E`\x14F\b\x10\x13\xD1\0\0e\xFFH\x04l.%\x02^\x05\b.J\xB8\x1F\xEC\x12\x03\xAF\b\x83\xE9[\x86\xDF\x040T\x07Do\x14l\"H\x87\xD0\xBF\x90\xC8#@\xC0\x01\x18\x8A\x80A\x98c\0\x04\x18\x16r\f\0\x17\xBC\b\x19\x88\xB8\x03\fi\xF9\x88\xF8\x18`W(&#\xCF@\x80\x04\x03\nI-\xDA\x10\0/\xC6\xFC\xC4|\b`/\f\n!\x88\xB8XDO\xF2hS\x11h\xC1\x05@\xB1Q\b\x8B\x8B4\n\x17*\x0E\xC4+\xFF\xE0{ I\x1B\0IC\x06\x81\x15\xEC\x87\xF14/\xD1\xEC\x87\xC2>\x06\x13\xA0\xF6B\x80\x06\x15\xEC\x87\xF0\xD2(\x18\x12I\xFE\x03H\xBF\x07\xB2\x01\xF1\xB8\x01r`$!\x83\xE2+\x0BR\x8A\xEF\x05X\x81$c\x10\xAA\xC2\xC9#\x18\x85\x0B\x95\x07$\x8C8\x11X\\\xBD\xBA(\xE0P\xF8$\x94\fB\x87\xC1$\xA0b\x13\xFAIH\xC4#\xD8\xB2H\xC0q^\xC5\x12G1\b\xF6,\x929\x88G\xB1d\x91\xCCB\x12JR\n\xBD\t\xECy$Q\0\xDF\x82JF!:\x04\x93\xC2\x01\x18\x84\x18\x15\x1F-\x0E8\x18\0F\xFC\xB40\xE4D\x10@\x01\xE0N\xE1\xC7\"3\x01\0\x10r\x11\xDC\x1D\xFC\x92q\xC8O\x80\x1C\x18\b\x1Cea\xB8\x0080p8\xCA\xC3\b!\x98\x83\xFE\x8C\nj\x93k4\x82z*\x01\x0B=\f\0\x120\x18)Z\x1A\xF08\x0F\xFB)\0\x8D\x8C\x8B\xC0)An\x04{\x19\x9C\x19\x88wP\xF0/\xE6\xFD\xF0f\xFD\x10L\xBD\x8EZ\xB00`\xE4\xC0\xFE\x8A\xC2\xCE\x04[\xD5\xE5\x0F\x82=\b\0A$\b\xC0\x90\x01\x86\xE2\x83\x07%\t\0\x1B\xBE\t\xA4";
	let c = ["\x14\x07\x02\xEB\xFF\xFF\xFF\xFF\x83\xFF\xF7\xFF\xFBC\xFF\xDB\xFF\xD1\x03\xFF\x8F\xFF\xC0C\xFF\x1F\xFF\xC0\xDF\xFD?\xFF\xC1\xFF\xF4\xBF\xFF\xD3", "\x14\x07\x02\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xF7\xFF\xFFk\xFF\xDB\xFF\xFF\x03\xFF\x8F\xFF\xDEC\xFF\x1F\xFF\xC0\xDF\xFD?\xFF\xC1\xFF\xF4\xBF\xFF\xD3", "\x14\x07\x02\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xF7\xFF\xFF\xFF\xFF\xDB\xFF\xFF\xBB\xFF\x8F\xFF\xFFS\xFF\x1F\xFF\xFE\xDF\xFD?\xFF\xC5\xFF\xF4\xBF\xFF\xD3"];
	let a = null;
	let d = setInterval(function()
	{
		let f = Date();
		let g = f.getHours();
		let d, i;
		settings.clock12hr ? (d = (g + 11) % 12 + 1, i = g < 12 ? "AM" : "PM") : d = g.twoDigit();
		let e = f.getMinutes().twoDigit();
		let h = f.getSeconds();
		e != tm0 && (bC.clear(1), Pip.clockVertical ? (bC.drawImage(dc(b), 60, 20), bC.setFontMonofonto96().drawString(d, settings.clock12hr && d < 10 ? 281 : 223, 0).drawString(e, 223, 110), settings.clock12hr && bC.setFontMonofonto28().drawString(i, 350, 177)) : (bC.setFontMonofonto120().drawString(d, settings.clock12hr && d < 10 ? 93 : 20, 45).drawString(":", 160, 45).drawString(e, 228, 45), settings.clock12hr && bC.setFontMonofonto28().drawString(i, 183, 177)), tm0 = e), a && (bC.setColor(3).drawImage(c[a < 4 ? a - 1 : 5 - a], 98, 44), ++a > 5 && (a = null)), h != ts0 && (bC.setFontMonofonto120().setColor(h & 1 ? 3 : 1).drawString(":", 160, Pip.clockVertical ? 40 : 45), ts0 = h, Pip.clockVertical && Math.random() < .15 && (a = 1)), !Pip.radioOn && Pip.brightness < 20 && !Pip.audioIsPlaying() && Pip.audioStartVar(new Uint8Array(2)), bC.flip()
	}, 50);

	function e(a)
	{
		if (a == 0) return;
		Pip.clockVertical = !Pip.clockVertical, Pip.knob1Click(a), bC.clear(1).flip(), tm0 = null
	}
	Pip.on("knob1", e), Pip.removeSubmenu = function()
	{
		clearInterval(d), Pip.removeListener("knob1", e)
	}
};
let getRandomExcluding = (b, c) =>
{
	const a = Array(b).fill().map((b, a) => a).filter(a => a != c);
	return 0 | a[Math.floor(Math.random() * a.length * .999)]
};
var rd = new I2C;
rd.setupI2C = () =>
{
	if ([B6, B7].forEach(a => a.mode("input")), B7.read() == 0)
	{
		[B6, B7].forEach(a => a.mode("input_pullup")), log("Radio I2C SDA pin is low - trying to unstick the bus with SCL pulses");
		for (var a = 1; a <= 100; a++)
			if (B6.write(0), B6.write(1), B7.read()) break;
		log(`Radio I2C bus ${B7.read()?"unstuck":"still stuck"} after ${a} pulses`)
	}
	try
	{
		rd.setup(
		{
			sda: B7,
			scl: B6
		})
	}
	catch (a)
	{
		log("Radio I2C setup failed: " + a)
	}
}, rd.setupI2C(), rd.freq = 98.8, rd.tuningInterval = null, rd.writeReg = (b, a) =>
{
	rd.writeTo(17, [b, a >> 8 & 255, a & 255])
}, rd.readReg = b =>
{
	rd.writeTo(17, b);
	let a = rd.readFrom(17, 2);
	return a[0] << 8 | a[1]
}, rd.getChannelInfo = () =>
{
	let a = rd.readReg(3);
	rd.band = (a & 12) >> 2;
	switch (rd.band)
	{
		case 0:
			rd.start = 8700;
			rd.end = 10800;
			break;
		case 1:
			rd.start = 7600;
			rd.end = 9100;
			break;
		case 2:
			rd.start = 7600;
			rd.end = 10800;
			break;
		case 3:
			rd.readReg(7) >> 9 & 1 ? (rd.start = 6500, rd.end = 7600) : (rd.start = 5e3, rd.end = 7600)
	}
	rd.space = a & 3;
	switch (rd.space)
	{
		case 0:
			rd.chans_per_MHz = 10;
			break;
		case 1:
			rd.chans_per_MHz = 5;
			break;
		case 2:
			rd.chans_per_MHz = 20;
			break;
		case 3:
			rd.chans_per_MHz = 40;
			break
	}
	rd.channel = (a & 65472) >> 6, rd.freq = (rd.channel * rd.chans_per_MHz + rd.start) / 100
}, rd.init = c =>
{
	rd._options || rd.setupI2C();
	let a = rd.readReg(0) >> 8;
	let b = !0;
	return a == 88 ? c && console.log(`RDA5807 ID: 0x${a.toString(16)} (as expected)`) : (log(`Unexpected value reading RDA5807 ID: 0x${a.toString(16)}`), b = !1), rd.writeReg(2, 3), rd.writeReg(2, 61453), rd.writeReg(3, 8), rd.writeReg(4, 12800), rd.writeReg(5, 34984), rd.writeReg(6, 32768), rd.writeReg(7, 24346), rd.getChannelInfo(), b
}, rd.init(), rd.writeReg(2, 61452);
let stationName = '';
let stationNameSegments = new Array(8).fill(" ");
let stationNameTemp = new Array(8);
readRDSData = () =>
{
	if (!(rd.useRDS && rd.readReg(10) & 32768)) return;
	let a = rd.readReg(13);
	let b = rd.readReg(15);
	if ((a >> 12 & 15) === 0)
	{
		let c = (a & 3) * 2;
		let d = b >> 8;
		let e = b & 255;
		stationNameTemp[c] == d && d >= 32 ? stationNameSegments[c] = String.fromCharCode(d) : stationNameTemp[c] = d, stationNameTemp[c + 1] == e && e >= 32 ? stationNameSegments[c + 1] = String.fromCharCode(e) : stationNameTemp[c + 1] = e, stationName = stationNameSegments.join('').trim()
	}
	let c = Graphics.createArrayBuffer(100, 25, 2,
	{
		msb: !0
	});
	c.setFontMonofonto18().setFontAlign(0, -1).drawString(stationName, 50, 0, 1), Pip.blitImage(c, 295, 238)
}, rd.seek = c =>
{
	let a = rd.readReg(2);
	a |= 256, c ? a |= 512 : a &= -513, rd.writeReg(2, a), rd.tuningInterval && clearInterval(rd.tuningInterval);
	let b = rd.readReg(4);
	return rd.writeReg(4, b | 1024), rd.writeReg(4, b & -1025), stationNameSegments.fill(" "), stationName = '', new Promise((a, b) =>
	{
		rd.tuningInterval = setInterval(() =>
		{
			let b = rd.readReg(10);
			let c = b & 1023;
			rd.freq = (c * rd.chans_per_MHz + rd.start) / 100, Pip.mode == MODE.RADIO && rd.drawFreq(), b & 24576 && (clearInterval(rd.tuningInterval), rd.tuningInterval = null, Pip.audioStop(), a((b & 8192) == 0))
		}, 200)
	})
}, rd.isOn = () =>
{
	try
	{
		Pip.radioOn = (rd.readReg(2) & 1) != 0
	}
	catch (a)
	{
		log(`Error reading radio enabled status: ${a}`), Pip.radioOn = null
	}
	return Pip.radioOn
}, rd.getRSSI = () => ((rd.readReg(11)) & 65024) >> 9, rd.enable = (a, b) =>
{
	if (a)
	{
		let a = rd.freq;
		rd.init(), RADIO_AUDIO.mode("analog"), a && rd.freqSet(a), Pip.fadeTimer || Pip.fadeOn([LED_TUNING], Math.pow(2, Pip.brightness / 2) / 1024)
	}
	else rd.tuningInterval && clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.writeReg(2, rd.readReg(2) & 65278), Pip.fadeOff([LED_TUNING], Math.pow(2, Pip.brightness / 2) / 1024);
	b || (Pip.radioOn = a)
}, rd.getVol = () => ((rd.readReg(5)) & 15), rd.setVol = a =>
{
	rd.writeReg(5, rd.readReg(5) & 65520 | a & 15)
}, rd.freqSet = (a, b) =>
{
	if (a *= 100, a < rd.start || a > rd.end)
	{
		b && console.log(`Invalid frequency (${a}) - must be between ${rd.start} and ${rd.end}`);
		return
	}
	let d = (a - rd.start) / rd.chans_per_MHz & 1023;
	b && console.log(`Band:${rd.band} (start:${rd.start}, end:${rd.end}), spacing:${1e3/rd.chans_per_MHz} kHz, tuning to ${a/100} MHz (channel ${d})`);
	let c = d << 6 | rd.band << 2 | rd.space;
	Pip.audioStop(), rd.writeReg(3, c), rd.writeReg(3, c | 16), stationNameSegments.fill(" "), stationName = "        ";
	var e = 0;
	return rd.tuningInterval && clearInterval(rd.tuningInterval), new Promise((d, f) =>
	{
		rd.tuningInterval = setInterval(() =>
		{
			let f = rd.readReg(10);
			if (f & 24576)
			{
				let c = (f & 8192) == 0;
				b && console.log(`- set channel=${f&1023} ${c?"OK":"(failed)"}`), rd.freq = a / 100, Pip.mode == MODE.RADIO && rd.drawFreq(), clearInterval(rd.tuningInterval), rd.tuningInterval = null, d(c)
			}
			e++ > 10 && (b && console.log(`Giving up!`), clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.writeReg(3, c), log("Timeout tuning to " + a), d(!1))
		}, 200)
	})
}, rd.drawFreq = a =>
{
	const b = a ? 245 : 0,
		c = a ? 150 : 0;
	a || (a = Graphics.createArrayBuffer(120, 23, 2,
	{
		msb: !0
	})), a.setFontMonofonto18().setFontAlign(0, -1), Pip.radioOn ? (a.drawString(`  ${rd.freq.toFixed(2)} MHz  `, b + 60, c, 1), a == bC ? bC.drawString("  " + stationName + "  ", 305, 173, 1) : (Pip.blitImage(a, 285, 215), g.clearRect(295, 238, 395, 262))) : a.clearRect(b, c, b + 119, c + 40)
};
const CLIP_TYPE = {
	ANY: null,
	VOICE: "DX",
	MUSIC: "MX",
	SFX: "SFX"
};
let radioPlayClip = (a, b) => (a == undefined && (a = CLIP_TYPE.MUSIC), new Promise((e, f) =>
{
	var c = null;
	let d = () =>
	{
		Pip.removeListener("audioStopped", d), Pip.radioClipPlaying = !1, c && rd.setVol(c), e(1)
	};
	if (Pip.radioClipPlaying) Pip.removeListener("audioStopped", d), Pip.audioStop(), Pip.radioClipPlaying = !1, c && rd.setVol(c), e(0);
	else
	{
		c = rd.getVol(), rd.setVol(2), a == CLIP_TYPE.ANY && (a = [CLIP_TYPE.MUSIC, CLIP_TYPE.VOICE, CLIP_TYPE.SFX][Math.floor(Math.random() * 2.999)]);
		let e = fs.readdirSync("RADIO").sort().filter(b => b.startsWith(a) && b.toUpperCase().endsWith("WAV") && !b.startsWith("."));
		e.length || f("No radio clips found");
		let g = getRandomExcluding(e.length, Pip.lastClipIndex);
		b && console.log(`Playing radio clip type ${a}: ${e[g]}`), Pip.audioStart("RADIO/" + e[g]), Pip.on("audioStopped", d), Pip.radioClipPlaying = !0, Pip.lastClipIndex = g
	}
}));
//CustomRadioPatchBegin_submenuRadio
let submenuRadio = () =>
{
	rd._options || rd.setupI2C(), bC.clear(1);
	let f = 0;
	let a = Graphics.createArrayBuffer(120, 120, 2,
	{
		msb: !0
	});
	E.getAddressOf(a, 0) == 0 && (a = undefined, E.defrag(), a = Graphics.createArrayBuffer(120, 120, 2,
	{
		msb: !0
	}));
	let c = new Uint16Array(60);
	for (let l = 0; l < 60; l += 2) c[l] = l * 2;

	function j()
	{
		for (let a = 0; a < 40; a++)
		{
			let c = 2,
				b = 1;
			a % 5 == 0 && (c = 3, b = 2), bC.setColor(c), bC.drawLine(245 + a * 3, 143 - b, 245 + a * 3, 143), bC.drawLine(367 - b, 22 + a * 3, 367, 22 + a * 3)
		}
		bC.setColor(3).drawLine(245, 144, 367, 144).drawLine(368, 144, 368, 22).flip()
	}

	function k()
	{
		if (a.clearRect(0, 0, 119, 119), Pip.radioClipPlaying) Pip.getAudioWaveform(c, 20, 100);
		else if (Pip.radioOn)
			for (let a = 1; a < 60; a += 2) c[a] = E.clip(60 + (analogRead(RADIO_AUDIO) - .263) * 600, 0, 119);
		else
		{
			let a = f;
			for (let b = 1; b < 60; b += 2) c[b] = 60 + Math.sin(a) * 45 * Math.sin((a += .6) * .13)
		}
		a.drawPolyAA(c), f += .3, Pip.blitImage(a, 285, 85,
		{
			noScanEffect: !0
		})
	}
	E.showMenu(
	{
		'':
		{
			x2: 200,
			predraw: function()
			{
				bC.drawImage(a, 245, 20), rd.drawFreq(bC)
			}
		},
		"FM Radio":
		{
			value: rd.isOn(),
			format: a => a ? "On" : "Off",
			onchange: a =>
			{
				a ? (Pip.radioKPSS = !1, rd.enable(!0), Pip.audioStart("UI/RADIO_ON.wav")) : (rd.enable(!1), rd.drawFreq(), Pip.audioStart("UI/RADIO_OFF.wav"))
			}
		},
		"FM Volume":
		{
			value: rd.getVol(),
			min: 0,
			max: 15,
			step: 1,
			onchange: a =>
			{
				rd.setVol(a)
			}
		},
		"KPSS Radio":
		{
			value: !!Pip.radioKPSS,
			format: a => a ? "On" : "Off",
			onchange: a =>
			{
				Pip.radioKPSS = a, a ? radioPlayClip(CLIP_TYPE.VOICE) : Pip.audioStart("UI/RADIO_OFF.wav")
			}
		}
	});
	let g = Pip.removeSubmenu;
	j();
	let h = setInterval(() =>
	{
		Pip.radioKPSS && !Pip.streamPlaying() ? radioPlayClip(CLIP_TYPE.MUSIC) : k()
	}, 50);
	rd.rdsTimer = setInterval(() =>
	{
		readRDSData()
	}, 100), rd.isOn() && (rd.getChannelInfo(), rd.drawFreq());
	let b = null;
	let e = 0;
	let d = null;

	function i(a)
	{
		if (Pip.radioKPSS)
		{
			Pip.audioStop();
			return
		}
		d || a == e ? (rd.freq = rd.freq + e * .1, rd.freq < rd.start / 100 && (rd.freq = rd.end / 100), rd.freq > rd.end / 100 && (rd.freq = rd.start / 100), rd.drawFreq(), b && clearTimeout(b), b = setTimeout(() =>
		{
			try
			{
				rd.freqSet(rd.freq)
			}
			catch (a)
			{
				log(`Error tuning radio: ${a}`)
			}
			b = null
		}, 200), d && clearTimeout(d), d = setTimeout(() =>
		{
			d = null
		}, 20)) : e = a
	}
	Pip.on("knob2", i), Pip.removeSubmenu = function()
	{
		Pip.radioKPSS = !1, clearInterval(h), rd.tuningInterval && clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.rdsTimer && clearInterval(rd.rdsTimer), rd.rdsTimer = null, Pip.removeListener("knob2", i), b && clearTimeout(b), g()
	}
};
//CustomRadioPatchEnd_submenuRadio
let submenuStatus = () =>
{
	const c = {
		x: 137,
		y: 65,
		repeat: !0
	};
	let a = fs.readdirSync("STAT").sort().filter(a => a.startsWith("VB") && a.toUpperCase().endsWith("AVI") && !a.startsWith("."));
	if (!a.length) return;
	Pip.statIndex == null && (Pip.statIndex = Math.floor(a.length * Math.random() * .999));
	let b = setTimeout(function()
	{
		b = undefined, Pip.videoStart(`STAT/${a[Pip.statIndex]}`, c)
	}, 50);

	function d(b)
	{
		if (b == 0) return;
		Pip.statIndex -= b, Pip.statIndex < 0 ? Pip.statIndex = 0 : Pip.statIndex >= a.length ? Pip.statIndex = a.length - 1 : (Pip.knob1Click(b), setTimeout(b => Pip.videoStart(`STAT/${a[Pip.statIndex]}`, c), 50))
	}
	Pip.on("knob1", d), Pip.removeSubmenu = function()
	{
		b && clearTimeout(b), Pip.videoStop(), Pip.removeListener("knob1", d)
	}
};
let submenuConnect = () =>
{
	let a = setTimeout(function()
	{
		a = undefined, Pip.videoStart(`STAT/CONNECTING.avi`,
		{
			x: 50,
			y: 73,
			repeat: !1
		}), Pip.on("videoStopped", function()
		{
			Pip.removeAllListeners("videoStopped"), Pip.videoStart(`STAT/CONNECTED${1+Math.floor(Math.random()*1.999)}.avi`,
			{
				x: 50,
				y: 73,
				repeat: !0
			})
		})
	}, 100);
	Pip.removeSubmenu = function()
	{
		a && clearTimeout(a), Pip.removeAllListeners("videoStopped"), Pip.videoStop()
	}
};
let submenuDiagnostics = () =>
{
	const e = {
		x: 50,
		y: 42,
		repeat: !0
	};
	let a = fs.readdirSync("STAT").filter(a => a.startsWith("DIAG") && a.toUpperCase().endsWith("AVI") && !a.startsWith("."));
	if (!a.length) return;
	let b = Math.floor(a.length * Math.random() * .999);
	let c = !1;
	let d = setTimeout(function()
	{
		d = undefined, Pip.videoStart(`STAT/${a[b]}`, e)
	}, 200);

	function f(d)
	{
		if (d == 0 || c) return;
		c = !0, b = (b + a.length + d) % a.length, Pip.knob1Click(d), setTimeout(d =>
		{
			Pip.videoStart(`STAT/${a[b]}`, e), c = !1
		}, 100)
	}
	Pip.on("knob1", f), Pip.removeSubmenu = function()
	{
		d && clearTimeout(d), Pip.videoStop(), Pip.removeListener("knob1", f)
	}
};
let submenuRad = () =>
{
	var d = Pip.audioBuiltin("CLICK"),
		k = new Uint8Array(d.length),
		a = Math.random() * .5 + .02,
		b = a,
		c = !1;
	bC.clear();
	var e = dc("\0~\0\xFC\x01\xF8\x03\xF0\x07\xE0\x0F\xC0\x1F\x80?\0~\0\xFC\x01\xF8\x01\xCA\xAD@\x83\xF8\x02\b\x0F\xFF\xC0\x1Cf\x17\xFF\xFF\xFC\f\x1F\x80\x02\x81\x98\xDB\x87\x98\xFF\0\x0B\x07\"\xB6c\xFC\x8CA\x8F\xF3\x1C^\xF3\x1F\xE0\be\xFD\xFF\x01\x8D\xA3\x0F\xE0\x01g\xE6?\xC0\x11o\xEB\xE4v\x8C\x7F\x80\x06\xFF\xC7\xCCni\x0B\xFF\x80\x02\x81\x7Fc\xFE\x03\x1B_\xFF\xFD\0\xC3\xF8\0\x18\x1F\xF0\xC6\xF0u\xA0\x04\xF0\x7F\xA4\x7F\xE0cp:\xD0\x02x\x7F\xC1\x8E\xF7\xF0\xC3\xF8\0\x13\b,w?\x10\xF3\x1F\xE60\xD5 \xFF\xC3\xED\xC1\xCC\x7F\x98\xE2\x81\x98\xFF1\xFEc\xFC\0$\x07\xC1\x071\xFE\0\x12\x7F\xF0\r\xB3\x0F\xFAC\xCC\x7F\x98\xE1r\x03\xF8/\xFE\0\x0E_\xE01\xB8\x81h\xC7\xF8\0X\x19\x8C\x1E\x81\x7F\xF3\x1B\xF0\x13\x184\x02\xFF\xE0\b\'\xFF\x82\x0F\xE0\x0F\xC0\x1F\x80?\0~\0\xFC\x01\xF8\x03\xF0\x07\xE0\x0F\xC0\x1F\x80?\0~\0\xFC\x01\xF8\x03\xF0\x07\xE0\x0F\xC0\t\xC5\xA8\x01ucAu\x80\x19\xEA\xB0\x065\xB4\x85\x9F\xCCed\x02\xEA\xCA\xB4\x05\x9F\xC0\x04\xDA\x8CkZ\x8C\x7F\xAB\xE2=\xAEc\xD3H\x17WU\x80,\xFE\0&4cV\x02c\xFC\0\\+PcZ\x80Y\xFC\xC6V\xA4\x12<\x16\xAA\0\b\x18<\x0BTX\xFC\0T\x18\xC65[T\0\x1A\xA0\x16\x14\xC7\xF8\0\xB5\x80\xB0S\b\xE0\0\x8E\x82\x1E\x87\0~c\x1A\x80\x04\x06,b)\x94,+PX\xFC\0T\x04\xC6\x15h\xB0\x1ET\xB0\x13@ X\x86@L\x7F\x80\r\xD5`\n\xC1\xE5\x01A\x98\xC2:\x05j2\x07\x1A\xD2\x15\xFF1\x99\x9A\\\bc \0\fh \x15\xA8\xC7\xF8\0\xC5\xB0Z\x9A\0(S\x18\xD0\b\xA9\x90-\x01_\xF0\x01P\x13\x10@\xB1\xCCc\xC0 \xA1@X\xFF\x80\x0B\xAD1H1\x95\0\x83\x19\x01\xC8\x16\x7F&\x16\xB1$\xC6L\x01\xBAP\x03\xF8\t,\x1C\xD6\xA0\xC6\x90\\#\xD9@\x0FcZ\xAD,(\xC6\x9C\x0BUU2\x03@.\xFE\xAE\x1E\x81\x06\xD4\x98\xD5\xAB2?c\x11\x90\x80A\xB5F4\x82\x80\xD5j\xB6\xADU@\xBF\xFB\x18F\x18K LiB\xB5&0Y\0\xB8Iczh\n\x80cU\x90\x10x&7\xEA\x81\0\xA0\xE0\fh\xC6\x8Ca\xD5uZ\x83\x17\xECa@\0\x98\xD3\x95iLa\xD6\x9CD\x807S\rj4\x88cM\x90\x0E\x90\xC5\xF4\x19\x8C)\x8C\x1D\x01\x8D\x1BQ\x8C[S\"\xB9\x7F\x90&\x8D\xABR\xB3\x18\xC6\x96\xAB*c\x12\xAC\x86\x18\0\\?\xFEwV\x05\xFF\xFF1\x98\x80F\xB4\x866\x19\0\xA1\xC6\0\x15\x7F\xFF\xF8\fjA\xFF\xFF\xFC\0L\xF8\xD0\xF8x\xD6\xA0\xC6\x84\x04\xC6; \x11\xBA\x04\xA0~\x865\x1B\xE0\xFF\xF8\x01#\x88\xC0\xAF\x87\x85\x18\xD1\x81j\x8CB\x80\x01\x12\x90\x1A \x94\x0F\xF0\xC6\xA4|0\x0F\xC0$t\x1BU@,\x8E\xD0\x1C\xC6\x9DkT7:\x07\xFE\x85\x98\xD5\x9F\xFC\0 \x84\x8E\xB5\x16H6\x82c@$\t\x8Cv@9\x03\x19\xDF\xC8\x1F\xF4\xC6\xAF\x82>c:\x02;%h\t\x8D\x06\xD0&2-ZC\x19\xF0#\x1A\xDD\x03\x19\xEA\x90h\x062AC\x98\xD3\xAB Hc\xBC\0\x06^c:T\x9E%\xA4\x0E\0\xC6|h\xC6MU\xE0I\x8C\x7F\xE1\x8Di\xF9\x8C\xD2\xB8&2`\x064\xB4\xA62\x85%=C\xFF\xE7\xCCk\xEF\xFC\0\xE3 \xDA\xABA\x8C\xA5H\xE62%F2\xB4\xDA\xAA\0\xE8\xCF\xFF\xFF\xE8c[\xFF\xC0\x07\x19*\xD2F\x81\x84\xDA\xB4\x063\xEDF2j\xD9T\x11\0\x01o\xFF\xF5q\xA0\x02 \x7F\xF4a\xA3paA\x02eF4r\xA62+U[V\x90r\\\x05\x8E\x0F\xE0\xC6\xAC\x1F\xFE\x0E2\r\xAA\x80@\x93\xA4\xB5\x011\x9F\xAA1\x93id\x83\xA9V\x9B_\xFE\x98\xD5\x87\xFF\x01\xC6F\xB5\b\xF0W\x83\x83B1\x90\xDB\x1A\x02c2\xAB\xAA\xC0\x0E\x8A\x85\xFF\f\xA0\x98\xD5\x8F\xB7\xCD\xB51\x02,\x0EZ\b\xE2\b\0(\xADkT\0\n\xAAf\f\xC6\t\x88\x8A\xAE\x94\x04\r\xA9\x1CJ\xB4/\xC4\x04\xC6\xB4\xFF\xE0\r,\x86\t$)I\x8C\x9DHH+Q\x840\0y@`0#\x195f\x88U\xA0\xF8F2~\x90\x03\x1A\xDB\xFE\x804\xB2\xA0p\b\xD08\x8808\x13\xA8 \x02t\xA62\xEBFp\xD2A\xB1\xE1\xFF\xF0\x01\xA5\xCA\xB4\x85\x90\xF0\0\xE1\xCA@\x98\x84\xD2\x94\xC3\x04\bt\x04\xC6`P\x1C\x81\x8C\xAF\xE4\f\xC6\xAC\x0B\xFF\xFF\xF0\x03\x8A\xD5\x17\x83\x81\x0E\b1\x83j,\x03\xA9U\x8D\x152\x05\x9A1\x93i\x02\x07jI\x86\0\x1A\x17\xFF\xAD\x98\xD5=\x03\xFF\xF8\x1CJ\xD5\x01\x84\x1C\x10\xC5\x0F*\x1D\"\x02p\f\xC6CpJ\xB6\xA4\x94g\xF4\xC6\xA1\xF0\x13\x19p\xAD@\x18K@<x\xD1P\x1C\xA0\xB4\xB3 F3j\xBA\xA7 \xCA\0\xC9@\xFF\fjC\xCCfJ\xB4\x05\xA1X\xC4\x98\x8C2\x06\xC8\x1E\xAD\x95\x03\tj\xC8\x07\t\xDF\x92\x8B\0\x15/1\x99\xAA\xC03\x85N\rZ\xD5iE\xC7\x1DB-\x8BU\xAD\x01\x86\xD2\x07\t\x8D\xFF\xDA\x84\x80\x18\x81j\x80\xE2\xC1\x8DB\xC1\x96\x80\x8D\x10\t\x84\\\x16\xD2\xCE\x1BRV\x84\0d+P\xAD\x1B@\x06\x12\xD5\xAA\xC8\b\xD1\n\x02\xC8\x14\xC65WT\xBB\x88\0\\\xA8\xB6(\0\x1D\"\xC8](\x8D(\x0E\xABT[\x13Jc\x1A\xD4\x87H\0\xB24KV\0\x1A4\xA5b*\x89H\xD3 J\xB34P\x005\xA4\xB8\x91C\x14P\x11Hj H\xE4\0\xC2\x81j\x99\xA2\0\x11\xB5jLa\x98\x86\x04\x03\xA8\t\x87h1\xC5\x06\xD4\x81\x07\x07\n\xD0\t^\x0B\x19@\x000\xA6@u\xA3\x19\x03@\xE0C\x92\0\r\r\xC1(\x05\x1A\\\x11\x02\xC85\x02c,\x19\t\x90\x15\xA4\xC6=Tr\"=p\x01b@J!J\x8B \x91\x87\x06\x826h4\td\x1D)\x8C\x8BP\xD4+Q\x8E8\x12l\x10 \"\x82\xAD\x03`X\xCB\xB2\x030\x82c&\xB4(\x04z \x02\x14HP\x11AQ\x986\xA9\xA8C!-M[*c\"\xAD\xA8l\x05\xA01\xC6&\x07I\x06\x16\x02\0\"\x15ZL\xB6\x80\x074b \0\x0E\xA9@\x19\x8E7\xF8:\x98\xD3\xD0\x12)I\x97-Z\x93\x19ta\xD8&(\xC6\xC1j\xB5Y\x03\x19i\x97\x1E\xA0\x98\xCA\xB5f\x87%\x80\x1B\x85\x18\xC1+\x15\x1A\xD4=^\xCA\x98\xC9\xAD\x0EL\x1B;\xAA\x06\x94\x99~\xD5\xA51\x93V\xD5$\x1D\x1B\x17\xAA\xC0\x02\xC8\x83&_\x85jX\xE5\xA4\x1E\x1B\x15\xAA\xD2\x02\xC8\x8D&_z\x83\x951\x91\xAAH>\0&4+\x05\xA6N\x81\xEB\x06\x94\xC4=Xn\x0E\0\xC7=\xA8V\x0B\xCCu()\x98#Z\x93\x18\xE3r\x80\x10j\xA0\xDA\xAD (h6\xA4[\x04\x0BTc\x1C\xC4\rhn8\x01\xF8\x0E\xA5z\x0E\xA8\x164\xA8i\x16\xAB*b\x16\xAD\xAA\xD4\xD5\xB5\x069\xA0\xC2\x80^\xA0\xBD\x06~G*\xD2\x98\xC5\x1A\x02l\x05\xED\b\0XR\xEC\x186\xA9~,\t\x9E:M\xCDI\x8CW\xE0 0\xA8\x069cK\xB0`\"\xF0M\xC2\xBE\xE3\x16\x02b\x12\xAD\xAAg\x85j\xC0\x18\xE5\x95\t\xC2\x95j\x8D\0\x82\x83\xD0\f#\xB5eLa\xDA\xB5@`\xABCa\x06Q;\xC2\x83j\xB4\x80\xA1\x12\xD2F\x98\x01\0\x01}\x02\x04\n\xB4\x94\x91\xF4\x0E\xA5\xFE&\xA8\xD2\x10\x14\x11\x8C\x90mIt*\xB6\xA8\xD2\x1DY4 \x02\b\x16\xA0\n\x1C\xABT\xF5\n\f\n\x11+\x0B\x04;V\xAB*c\r@\x1AV$P\x90mQ|(\xD2VX\x05\xA8\xBC\x13\xE0\x13\x10@`\x86\x12B\xB4\t\xB1uT\x01\xD8,\xB0\x80\x11\xCA\x8C`\xD6\xB5ZS\x18\x96\xA1\xA8 \b\xA3E\x81cZ\xA08&`\x92\xD2\x97\xC1\xB5j\x99a\x18\xC3\xC0%$\x12\x8B\x06\xD5j Z\x93\x14\xB0\x01@5W\xB0&!\x19\xE0\xBE\xA4v\x8E5\x06\x8D\xA81\xCD\x01\xD5V\xB5L\xA0Lb\xE8\x06\x11\xEA\x80\xE3F\x8C\x80\x8B\xE4K\x88+\x07*c\x16\xAD\xA4I\xC6\xBC\x1E\f7\x07\0c\x9D\x1E\x0E\xA4\xC4)\x8C\x17\xDCp!!\t\xC0h\x069\xE1Z\xAD)\x8Cj\xAE\xA4]\x14\x19\xD8Dh]\x1B\xCC|\xA9\x8C}RJ=\0\xE0\x87\xB4\x10R\x905\0@\x90\x1DQ\x88z\xAD\xA9\xF9\x14k mD\xC4\xC9\x90{Q\x8C\x9C\x01\x8E\x19P\x8C\x83i \x05`%AV\xE2J\xB2\xA61\xEBCW\x92\":\xC8H\xBF\x15*\x0BTG\x89\xA51\x90\xFD|\0\x16\xA8\x12\x90\x01R\xA8\xE0\xB0\xE0\xC62*\xDAC\x14\x10\x1DH%\x13\x1CP-I\x8C\x8DA\x8E\b\x10\x88\x880\xB1\xF2\xA0\xD5D\x80\xA61\xEA\xA68\x9DDB\x9E\x8F\xC5Le@5F2\x1F\xCF\xAFB\xD0\x02G\x8Dd\x05OAJb\xD4\x01\x82J\xB2\xA61\xF5F8!F2%X\x03\x1Dq\xA3\x19\x16\xAA\x01\x8D\xF5\xE9\"\xB8 %1D\xC2\xC2\xB4\xA62\x13o\xAFJy\xC0c2\fc\"\xB4c\x85z<\x07R*~\0S\x14\x16,\x0BRc# 7~\xD4\b\x1E\x05\xA81\xCBTI\x0Ec#@7\x7FT\b\x1E\r\xA41\xC1\x151\x948\x04\xC6=X\xC7\x06\xA4\x10<(U\x04\x02\nR\x0E\xA0\f\x1A\xD4c!8\xFC\x07P\t\x1E5\x901\xDB*\xCA\x98\xC7!\x10\0Z\x04 \"U\x801\xC1\x01)\x07@I\x8Ec\x1E\xAAc\x83T\xBE\x1E\xD4<\x1C\xC74+Jb\x1A\xD5\xA9\x1B=\x06\xD3j\x9F\x83j\x8CP\0\x01)\x069 \xC65[T9~\x15\xA0\xADjS\"@Q\xAF\x80\x03\x8A\x94\x81\xAA\x02\xC7\x81\x18\xC51\x03\x95\xB5\x18\xDF\xC8@]b\xC0u\x06;\x92\x80\x98\xC4\xD5\x1A\x81\xB5)\x04\x003\x1A\xC8@ \xBA\xA0\x18)`\xB4\x868\xA0\xA50j\x063mL\xD0\xADX\x03\x1B\xC1\xF0\xA0\xDA\xA4@Pm\x01\x8E\xE8\x06\xA8\xC4\x15h\xD0\x1Dh\xC6\xF4\xA9\xCE\x1CkR\x05\x06\x14c\x8E\x02P\x04^\x18\0[P0\x1A\xB1\x9C3\x189\x03\x1CB\xE0t\xA60E\x0F\0\x05\xA0@GE\x17A\xD5iLq\xDA\x93\xE2\xEA\xB4\x91\xA7\x83\xC9\xE4\xB2\xB6\xADI\x883\x18:\x03\x1Cp\b.\xABTc\xC25\xAA1\x0BU\xAB\x18\xDE\xD4\x81\xC6\x8Bj\xA8\x06;\xE1Z\xA3\x10\xA60t\x869Z\x03\x80\x1E\x82\xD4\x01d\xC1\xB4\xA69`:\x80H\xFA\xA3\x1C\x91Z\xA1\x8D2!\x067\x9A\x04\0\x1C(\x02\x0B&\x04c\x1E\xAAcv\x04\x1E\x1C\xD8I\x8E\x9DI\x8Em!\x8EX\t0S\x18`\x91h\x010\x8CdjLr\x82\b1\xD3\x001\xCD\x06\xD0\x18\xFF\0\x07\xAA1\xCA\b \xC6\xECV\xA8c+Tc\x1E\xD4;r\x14Z\x1C\x10A\x8D\xCA\x04\x04\x12@P+Q\x8El\x80 \xF3\x1B\x95\0H0S\x192\xA3\x19\0\xD0\xC0\x02A\x80@\xC6\xFF\0\xB1\xA0\\\x03\x1B0 \x100\xBF\xC8\xAC \x18F3\xEA\x80\x90b\xA0\x91B\x81\x98\xD2\x9F\x80\x81\xFF\xFF\xCBcG\xCCg\xC6\x8Cd\xCB\xC0@\xEF\xFF\xFD\x01Y \x01\t\xA3\x02\n1\x85\x951\x9F\x02\xFF\xC0 cp~\taG\xE3\xC6\xB0\x061\xC1\x03\x89\xC3\x01\x03\xFF\xFA\n\xC81\x96\xC764c x<\xBCv\f\x1Cv\x13\x18S\x1BA\xB0Qa\xFF!b\xB1\xCCqV\x87\x83\x8C\xC1\x80C\xFF\xD6\xFF\xE0,I\xF9\x8D\tS\xB8q8p\x7F\xF5\x7F\xF8+\x0B\xF0c(\xB4-@\x10\f\x14\xD89\x8Dq\xC8&3\xA5F5!lPE \xFE\x05c\x18\xD9\x85\x18\xD4\x1B\x8Ec$\xB49\x8C\xE8\x19\x8DQ P\x13\x1BP\x1F\xF1\x8C\xA9\xF4\xFC\xC6}\xA8F \xE8\x1A\xAC\x03\xFAcQ|($6\x80\xE60\xB4\xA61\xF2\x02Q\xBAF2\xA4\x065`\x7F\xF8\x10\x90\x1D\x01\x8E\x881\x8D\x01\xF0CrX\xEB\x7F\xE8\x7F\xE0(&5 $\xB0\xDC\xC0\x80\x02\x8A\x82C\x1B\bc\x98\xB4  \x9F\xFF,>\x11\x8F\xF1\xE8&5\xB5 Q/\xFD\xFF\xC1\x8Dh\x01,:\x80 8($2\x88\xA624\fy\fb\xCF\xFF\xFF\x03\x1F\xE68#\xFF\xFE\x81\x8Dx\xA9,*\0 8\b *\xA1\x8C\xDA\xB1\x8E\xB8\x7F\xFC.\x11\x8DU\xF0m\x12\x1A\x02\x18\xF6\x81\xFF\xD5A\x18\xCE\x82\x88\x05_\x06c!\xA0!\x8Dq\xE8&5\xB5\0Q!lt`?\xFF\xC1\x8Cz\xA0\xA8X\xA9\xB0v=\xE61a\xFF\xFE\x81\x8C\xF3\xB0 \xF0W\xC3\x18\xC8\x04\r\x02\xD4\x98\xEC\x80\x98\xC5\x97\xFF\xFE\x061`\xE62\x02@\xB6\xC3-\tP\x15\x8B\x05\x04\x0EcTr\t\x8C\xEDQ\x8C\xD9\xFF\x7F\xE8c\x13\xFA)\fV,\xFC\xC6\x0F\x80D-V\x80c\x1C\x101\x8DG\xB8_\x83\x19!\xD0\xF5BQ\xCCb\xFF\xF9\xE5p\x84\xE0\xC1\xC4\xE0\x98A\x15\x8D\xBF\x03\x82\xDB\b\0\x19hs`)\x81\xF5Ua\xE8\xB5\xAD(\x10&\xE0f0\xA0b\xF2\fa\xDA\xB5@\x02\x8Cb@\x7F\xF4\x7F\xE9\x8C18_\x838B\xB1\0\xC0\x8C\xC7\x8A\x96\x86\x80U\fd\0\x0Be\x86c\b\x04\x0B\xDCc\x1A\xC5\xB0@ \x98\xC35\x82W\x04V9\x8C/\xA1Hc\x18\xEC\xF1\x8Ci\xFF\x80`\xDF\xFF\xE1\xF1\xA7\xF8\x04\xB8N\x81@\x02\xA6\xC4\x81\xFF\x8B\xA0\x88\x013\x04\'\x04>\b\xACc\x19 \x04H\x05\xD5j\x07\x91\xC1\x03\x80)1\x85\xF0\x1A`\0\xB9\x9C\t\x8F\xF0\x043\xF3\x18=\x02\x1F\xE0\x07\xE3\xE60p\x04?\xC0\x0F\xC1\xFF\xFF\xE2\x17\xE0\bw\xFE\x01\x9E "),
		f = [0, 0, -5, -5, -130, -5, -152, 0, -130, 5, -5, 5],
		h = setInterval(function()
		{
			Math.random() < a && (b < .95 && (b += .02), Pip.audioGetFree() > 1e3 && Pip.audioStartVar(d), b > .6 ? c || (Pip.fadeOff([LED_GREEN]), c = !0) : c && (Pip.fadeOn([LED_GREEN]), c = !1))
		}, 25),
		i = setInterval(function()
		{
			var c = (Math.random() - .5) * (a + .1);
			b = b * .9 + (a + c * c) * .1, new Uint8Array(bC.buffer).set(e), bC.setColor(3).fillPolyAA(g.transformVertices(f,
			{
				x: 195,
				y: 194,
				rotate: Math.PI * b
			})), bC.flip()
		}, 100);

	function j(b)
	{
		b ? (a += b * .03, a < .01 && (a = .01), a > .85 && (a = .85)) : (Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuInvAttach())
	}
	Pip.on("knob1", j), Pip.removeSubmenu = function()
	{
		clearInterval(h), clearInterval(i), Pip.removeListener("knob1", j), c && (Pip.fadeOn([LED_GREEN]), c = !1)
	}
};
let submenuMap = () =>
{
	if (fs.statSync("MAP/MAP.img") == undefined)
	{
		const e = {
			x: 36,
			y: 40,
			repeat: !0
		};
		let d = !1;
		let b = fs.readdirSync("MAP").sort().filter(a => a.toUpperCase().endsWith("AVI") && !a.startsWith("."));
		if (!b.length) return;
		let c = Math.floor(b.length * Math.random() * .999);
		let a = setTimeout(function()
		{
			a = undefined, Pip.videoStart(`MAP/${b[c]}`, e)
		}, 200);

		function f(f)
		{
			if (f == 0 || d) return;
			d = !0, c = (c + b.length + f) % b.length, Pip.knob1Click(f), a && clearTimeout(a), a = setTimeout(f =>
			{
				a = undefined, g.clearRect(36, 286, 444, 289), Pip.videoStart(`MAP/${b[c]}`, e), d = !1
			}, 100)
		}
		Pip.on("knob1", f), Pip.removeSubmenu = function()
		{
			a && clearTimeout(a), Pip.videoStop(), Pip.removeListener("knob1", f), g.clearRect(36, 40, 444, 65)
		}
	}
	else
	{
		var a, e = 2048 - bC.getWidth(),
			f = 2048 - bC.getHeight(),
			b = Math.round(Math.random() * e),
			c = Math.round(Math.random() * f),
			h = {
				width: 128,
				height: 128,
				bpp: 2
			},
			d;
		bC.clear(1).setFontMonofonto23(), bC.setFontAlign(0, 0).drawString("LOADING...", 200, 75), bC.flip();
		var j = setInterval(() => bC.flip(), 50);
		E.defrag();

		function g()
		{
			d = undefined, a === undefined && (a = E.openFile("MAP/MAP.img", "r"));
			var l = b >> 7,
				m = c >> 7;
			for (var f = 0; f < 3; f++)
			{
				var i = m + f,
					e = f * 128 - (c & 127);
				if (i >= 0 && i < 16)
					for (var g = 0; g < 4; g++)
					{
						var j = l + g,
							k = g * 128 - (b & 127);
						j >= 0 && j < 16 ? (a.seek(4096 * (j + i * 16)), h.buffer = undefined, h.buffer = a.read(4096), bC.drawImage(h, k, e)) : bC.fillRect(k, e, k + 127, e + 127)
					}
				else bC.fillRect(0, e, BGRECT.w, e + 127)
			}
		}
		var i = setTimeout(function()
		{
			i = undefined, bH.drawImage(
			{
				width: 370,
				height: 5,
				bpp: 2,
				buffer: require("heatshrink").decompress("\xAA\x80?\0?j\xD5\0\x07\xD2\x84\xC8\t\x11\xAA\xCA\x84\x87\xAB\x04\xC9\x13\x11Z\x1D$N \x90n\xA4@A \x91\xA2F\xF2Pe\x0E\x91\x1C\x88}Lh\xDA\f\xA5\xC4 \x0F\xC0\x0BT\0")
			}, 0, 34).flip(), g()
		}, 250);

		function k(c)
		{
			if (!a) return;
			b += c * 20, b < 0 && (b = 0), b > e && (b = e), d || (d = setTimeout(g, 20))
		}

		function l(b)
		{
			if (!a) return;
			c -= b * 20, c < 0 && (c = 0), c > f && (c = f), d || (d = setTimeout(g, 20))
		}
		Pip.on("knob1", l), Pip.on("knob2", k), Pip.removeSubmenu = function()
		{
			a && a.close(), i && clearTimeout(i), d && clearTimeout(d), j && clearInterval(j), Pip.removeListener("knob1", l), Pip.removeListener("knob2", k)
		}
	}
};

let showAlarm = o =>
{
	Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.remove && Pip.remove(), delete Pip.remove;
	let f = "\xC4j\xA0@`\xE4\x82\x887\x82\x18?\x814\xA0^\x02\x1B\xF0\xF1\xB1p\x1F\xE8}\b\xA4\x02\x7F\xFF\x07\x15\x7F\xFF\xFE\x03\xC6.\x02\xFF\xE0?\xFF\xFE\0@\x8880\x10\x80\"\x12\xEF\x10\bXH!\xB1R\xF0h_\x05\xC1\xA5P@\x01\x8D\x88\xDF\x83\x02K\x19\xFF\xCB\b\x04\xFF\xFD\x1A\xC3\x83Ds\x96\x1F\x14lI\xCCDAb\x12?\xCF\x81\xC1\xA2x\x04&~S`\xFE\xCB\x04\xAA\x03U\x18!\x0B\x97\xE7\x1F\x82X&~\x950\0\x184\x19\xFF\xE6\x83Pg\x85\xC0\x07\x8A\xD9\x15\xF8L\x02\x0B\xBF\xFC\x04\x02\xFE\x8EB=\f\xEC\r\xDCd?_\x8B\b\x87O\x1B\x10\xD94\0\x14\x7F\xA24\x13\x96G\bB\xB4\xBF\x1E\x11\x13\xE7\xFE\xB7\xBB\x86!\xA3?\xA1\x84C\xFFj\xB0N\xE1\x84(C7\xFE\xB0\x98\xBF\x8D\xFB\xB8Q\n\x10 \x80\x9E\xF0\x98S\xF7p\xA2\x14 \xE1\x01\r!<\x01\x10\xAD\x0F\b\t\xD2\x10\xB5/\xFF\x04\x03\xFA\x04\xC2\xDF\xF4\x04*\xCF\xFE\x01\0\xFF\xA0 |_\xF1\n\xDB\xFF\x06\xFC\x8A\'\xFE>!_\xFF\xE0\xFF\xFE\x82b_\xFF\xE8u`?\xFF\x97\xFF\xCF\xFF\xFC\x04\xC2\xEF\x88V\x81\x03B\xE7\xFF\xD1a\x7Fv\x7F\xFC\x01\xD8Q\t\xD00`?\xE9\xF9\xA4 \x007\xEF\xF9\xD8`\0\x9F\xE1\t\x7F\x81\xA8>\x10\x98]\xD1\b\xA1\0\x80\x02P\x04#\xC1\xC1`\xF4\x80@\xFD\xCA\xC1\x7F\xF7\xC1\x01!\xE2\x11\x9B\x02\x80\x02\x85\x82\xC1\xC3\x84\x85\x9D\xEF\x02\x02\x1C\x81\0\x0B\xF8\x10\x95\xC7\t\x0B\xAB\xDC*\nU\x14T\x0B\xC6\x11\x13\xF5\xDE\xD0*\nm\x84!+\xE2U\x17\xD4\x9B\x14B\x98\0_\x16\xD8 )\x95\x13\x18\xA0\0~_\xA0\x80\xAA\x94!\xF8`h_\xE0\x18_q\xA0\xD0\xADV\xAB\xFD\xAA\xFF\x81\x01\xC82\xC8\xE7\xEA\xC4!\x0E\x03\xF8\x04\x87\x80\x7F\xA0\x06\"\0\x01A\xFA\xE3\x10uZ\x88\xF8\x84/\xA0Di\x7F\x12\xFEb$B\x1F\xBB\x7F\xFA*\x03\x87M\x15/\xE8K\xC9\xE5\0\x01\x81\xFF\xF1\xE1\xD0\xB0k\xC2\xE2\x10\xBF\xFE\x02\x14!&\x04\xC4\x048\x0F\x97\x16!*=@\x80Y \x17\xFC\0\x84\x88\x0F\xFF\xFB\x05\xAA[\xFB\xED\xE2\xA5\xFFH\xA3@\x1F\xFF@\x88Hh\x1FV\xBF\xFF\xEFe\x95\x0F\xFF\xC7\xFFm\x92\xE0\x1B\xFF\xF0t \0|\x04\xC9\x1D2\x89@\0\xA7\xFF\xF0\x90 \0\xED\'rHA-\xC9;\x04A\x14\"U\xFC\xC4\f\x18\x1E\x0F\x80\x1EA\xD8\x10\0\x87r\x9D\x80\xFE\xFF1\xFF\x97\xF8\x1ED\x1CB+t\x930@\0z~\x7F\xF9\x10\x80x`\0F$\x9E\x06\xE7\x84\x88\x83\x7Fw\xE6C\x8A\xC2\xEB\xC0@\xFD\x01\x82F\xC1\0\xC7\xC4!\xD0\x04%\xAA\xC2\xFF\xB8\x81\0\x03\xE9\xA0@j\xC2\x90\xBF\xB1pX_K\x17\x90B[(\x1F\xF0\x840\0\xDF\x8F\xC1\x98>\x9A \xC2\xD0?\xE3\xD8\x80\x01~_\xC3H_\xFC\x7F\xF7p\"2\xD0 \'\xFF\xF3\x1E\x82/\x07\xFD/\xFC\"\x8E\x10\x95\xE3\xFF\xE0@\x80\xF87\xE0`_\xE4\bQ\xF0[\xFF\x10\xBF\xFF/\xFF\xFC\x10\x98\x87(B\x0F\xFA\x81\x02\x07\x83_x\x9C\xCB(B\b\x006\xE8}\x01\tp\xF5I@Q?\x800\xBE\x82\x12\xE0b\x13\xFEDp\xD5I\xF3\xC0@\xFD\x81\x02u\xC0\x81\xA2\x13\x10\x85\xF8\x04\tO\x02\x07\xC0\x10\x96\xDE\x04\0#\x8C\x14\b\x80@o\xE0P\xFE\x02\x12\xE0B\x11q\xE2\x11\xBCJ\xE1Q\x06\r\x04\x10\x87\xF5\r\x07\x1Fy\n!0\xCC(\x84&Xl\x90\xD5H@7\xE2\x11\xBC\xE0`\x80a\xAA\x90\"\n\xCB\b\x04\x17\xFF\xB6!\x1B\xC0!1\x12 \x84`\x18`\0\xFE\x82\x13Y\xC1\x86\x82\xCF\x9B\x05f$g\x10B\x16\xBC2\x15\xBCB30\xD0\0Q\xBF\xFF,*\f\xFC2\x10\f0\0\x82\x13\xE0\x16\xB1\t\xF8\x01\x12\x14\xB0\xE8\x9F\xE5\xA0n\xE4\x80\x01\xC1\xC3\xA2\x7Fw\xE2\x11\xDD\xC7\bD\x0E\x87\xFC\x10\x0F\xFF\xF8\bP\x81\x88Ar\x06!#\xF0!H:\x18\f?x\x84O\xE0\x85\b\x10\x84\x86\xA8@\0\xBF\xA2\x14 %pB\xE1~@a|L\xC2\x88P\x80\x7F\xFFB\x11\xBF\x8FP\x80\x01P\x04(\xFC\x84#\x7F\xE1b\x110\x02\x147\xFF1\b\xFD!\b\x9C\x01\x0B_\x8D\xF8\x14?\0\x85\x0B\xF8\x84\x8F\xF4\xBC\n\x1F\xC0B\x84\xFF\xCE!\x1F\xFF\x8B\x10\xAB\x0B\xED\x88H\xC1\x1A\xC4\x10\xA1(\xC7\x85\x82\xFE\x88DI\x82\xF4\fB\x84\xBE\xBE\x16\r\x0E ,\x11\n\xA1\xC0\xFF\x96\xB0\xD8\x90\xB18\x82\x15?\xF9@HU\b\x04\f\xD6 \0\xF8\xF8\x84A\xD0>\xF5\x18P\x11\x0B`\0\xBE\x80\xC0UA\xD0\x04,\xFC\x01\x80\xCF\xC0\xC1`\x04.%\x03\xE0*U\0\x07\xE0\x06\x03\x0F\x10\xC1\x07\x03\x05\xD0\x10\xB2\x1A\n\x04(\x14\0jp1\t\x10\x01\x0B\xA8\0\xDD\xC1\b^\xBF\xA1\xD2\x1A\x84!(^\x17$B\xEA\xDC*p\x84\xF80\x84\x8A\x004(\x7F\xFF\xFD?\x10\x9F\0\x85\x88\x06\xC0\x03\x05\xFCo\xC4\x07\xCAh\x10\xA0\xF8\x7F\xAC\x05\xBC\x86\x1C\x1F\xFF\x83\xFF\x88O\xBF\xFF\xB2\x10\rV\xA7!\x01\xD7\x91\x05D\x84\xA9K\xD4\x05\x06T\xA9\x1A\x1C(\x04B\x82\xA0\x8F\xFFA\xDA(\x85\xAF\x004a\x01\xD0\x11\t?\x05@b\x14`B\x12~\x8B`\xC0\xC0\xFB\xC4\'@\xC4$\xFE\x16\xC1x\x17\0\xFB\x84,\xFF\x01\xA0\xC5\x11\0\xEF\xF5\xC2\x13\x8F\"\0\x05\xFE\xAE\x04\xBF\xDF\x04\'B\xC3a\xFB\xC4\"\x7F\x84*\xC3\xC4$\xB1\x03m\x03\x7F\xB8\bS\xFD\x88I\xFFo\x84\x07\bE\xFB\x88E\xC0?\x02\xFE\xEF\x04\'\xCB\xDC\xE2\bE\xE0\bB\xFE|\x04*}7\xE2\x11\xE0\x7F\xCC\x80\x84\xF9\xF8h?\x80\x14O\xFF@B\x17\xD0@x\x84^\x81$O\xFF\x80B\x11\x91\b\x05\xFC\xBC\"\xBCBP\"\x10\x8D!\0\x0E@\x89\x80\x85\x88G\x81P\x04*\x8E\x81\x10\x89\xF8\x0E\xA0\0\f4$\x02\x02\x06\x13\xF8!c\xFC(\x18B\xA0\xF0@\xC8K\x01?\xA2\x16\x0F\xE1=\x04%\x84\0F\x04\x19\x0F\xE8\x07\x06>!u\xCA\x14=b(\x01\'0\x9E\x0080\xB1\x0B\xBD\x008\xDF\xFA\0\x85~\x01\xB4o\xFE\0B\x94\x1CB4\0B\xC1\xFC@\xC0{\xF1P\xE2\x15\x01\x01\xDF\xC4+\xB9D\x04\x07?\x10\xB7\xFE\x04\x07\x1Fj\f!S\xFAL B\xBF\xF1 G\x80B\x91p1\b\x901\n\xF2\xF0\xB8_\x81\t\x1F\x01\x0Bp\x11\x0BaqD+\xCF\xC42\'\xC5\xBF\x82B\xFA\bR\x0B\x86!\x14V\x18\x85~\x82D\x81\n{\xF0\xB8\\\0H\x91\xF6\xA8\xE8t\x84\"\xC3\xC4*\xC1`ap\xB0\0\xA1!b\x15 \'\x90`\xDB\xED ,X8\x85E8^Z\xADh\x16)41\n\x10 \xA0@\0\x81\x84\x88T\xFFe\xFF\xADb|\x86T \xDA\xED\xD5\x02\x03@J\x0F\xAAH\x8C\0bP0\x07\xE0!v~\xCBLB\x7F\xF0B\xEC|C\x04\x1CC\x04\x01\x0F\x04\x02_\xFF\xF0\b^\x81\x7F\xA8\0q\0";
	let h = "\x9DF\xA0@`\xE0_\xF0\0_\x80\xA9\x1B\xF0p~\0h\xF1\xF0h\x7F\xFA\x004h\x184O\xE0p{\xF88N\x804hx4O\xF8pph\xBF\x029\x84\x81\xCEB\x1D\t\x97\x83\x85\xC0\x07?\x0E~\x1C\x95\x94l\f\x1A/\xF1\xEAc\xD8y\xF88n\x004Hx4o\xF8\xACb\xB8\x85Q\xC0\0\xEF\xC1\xC1\xF8\x01\xA3\x99E2\fe\x18\xC8<\x02\xFE\x0E\x13\xA0\f\x17\xC0W\x1A\x01\xB09\t\x80@\x8D/:\x07\x0F\xF8+F\xA0\x9D\x03\x80\xFFYC\xC2\xFE\x82\xA1\x1C\xE3\x8A\xC3\x81\xFD\x1C\xE4\x19\xC3\xBF\xC0\x03\x83\xC3\xCC\xE1B\xFC\x01\xC27\xC1\xC0\x80`\x87\bX\x05\x0B\xF8\x07\b\xFF\x0EM+\x19\x01+\x06i\x0489\xF4\x10p_\xE4\x81\x80@C\x83`H\xE1\xA7\xC1\xA1\x07\x06\x8F\x8A\x83\x80h\x19CP4\x0Fa `\xD1J\x81\x80\x03\x06\x8A\xF6\x04\x1A,\xFC\x1C2\0 \0P\xF0h\xDF\xF0`p@\x10\'A\x15\x80\xC0 $P\x97\xE1o\xC1\xC1\x81\xC2\xDE\x11B\x01\x02e\x16\x804\x04\x94\f\xBD\xF2\t\x94S [\xFC\x04\x1Cb\x15\xFC\x1C X\x18\x17\xF5\xD4\x17\x80\xAE4\x03`+\x06?\xC0g\x82\x81\x19\xC4\f\xFE\x87\xF8\b\x84\x0E\x16\x83\xFF\x81~\'\xF0\x1F\xEB\x9C\x98\xFF\x1F\xE0*\x05\xCE0\x1C\x1E\x07\xF7}\x03\xFA\x07\x07\x80\x7F!~\xFF\x05\xFC\xEC\bph\x7FC\x7F\xFD\x85\xF8\x03\x84o\xA1g\x80w\xC1\xC2|\x1B\xFF\xF4/\xE0\x1C \x16\x0B\x04\x11\xC9\\\r\xF1X\xA8\x0F\xF2\x1F\xE7J\x84\x1C\x1C\xFA\x0F\xF6\x7F@\xFF$\n\xE1\x01\x02\x0E\r\x81\xFF@\xFF\x11\xFE\x84\xFE\x84\x1C\x1A?\x80)\x82\xDE\x07@\xCA\x1A\x81\xA0j\x83\x075\x03\x03\x06\x8B\xFC\x80@\x80@\xCB\xFC\x01\xF0^\xC3@7\xF8\0\x100\t\xF88n\x02|\x10\xF8>\bx4b\x18;\x88\0";
	let i = "\x96M\xE0@q\'\x81\"\x7F\xE0\xAA`?\xFA\0$\x80\0 \xB1\xA1\xE0\xA0\xBE\x02\x91\x80\x01\x82D\x81\x82\x84\xE0\x07\xC7\x10\x8D?\x05\t\xFC\x05\x07\xBF\x05\t\xFE\x1A\x907\x10j(\xDC@QD\x01HB\x02\x95\x8F\x82\x86\xFA\x02\x81\x97\x82\x86\xFC\x02\x8C;\x8A\n\xFC\x15\xF8)5\"_\xC0P \x91\x80\0\xC0 `\xA28\x0F\x01\xDEA\n\x87\x16\x05\xBF\x05\x11\xFD\x04\x90\0[\xFC6(\xEE9\xE4(8(\x8E\x81\xE4\x13\x80\'\xE0g\xFC\x008@\xA0\xFF\xF4/\xFE\0\x14*D0H\xCAp\x94!\0\x05I\x03\xF0\x05\x0F\0\xDF\x01D";
	let j = "\xA3H @q \x7F\xF0\0\x7F\xC0\xC9A\x01?\xFF\0\x812\xF0\x88\xB8\0\x81\x031F\x85\x84\x05\x1A\x15\x0F\b\x8C3<hT\xFC\"7\0D\xCD\xFC\"7@ <, 7\xF8DF\xFC\"7\x80\xF2x\x88\x90\x80\xC2/\xC4_\x88\xBF\x117\x0B\x111\xF0\b\x0F?\b\x8F\xC0+\x1C\0\x04 4\f G\xF0\x88q\x18\xA1 \xA2\x01\xC4\x84\x88\b\0\x03/\b\x8B\x80\b\x10X\x18hQT\xF4a\0\xE1\xA0>\x04`\xE3@D\x82\xCF\xF0\f\x01\xF8\x12\xF6\b\x90\xFF\xC0\x88\x88\x10\xD8@p0\x0B\xF8Dn\x84<\xD6$\xFF\x81\x0B\b\r\xFE\x05\x843\x0F\xE9\0\xDF\x84F\xF0@F\x82\x01\x01<\x8E\"\x06\x1Ei\x0E\x1F\xE0z\x90\t\b \x14\x0B\xFA\"*\x0F\xF8o\x86J\x04DJ\\\x13\xC8F\xD0DD\xC0\xC4J@\x8B\xC1\b\x88\x85\xA1\x814\x04m\x04\xD0j-\x18Y\\\x11\x11\x100\x98-\x10\xDB \x88\x88\xBF\xB4C}\x04\"\"\x1Ey\fr\x0F\xF0DD\f\xAC \xD0\x11\x111\xF1\x98`\0p\x10\xB2)\x12\0\x80\x87\xC0\x80\x03\x1D\xC3\x1A\x8A\x11\x1Cd)` \x80\xE5Q^\xC1\x04\bS\x82D4\x8CP\x90Q\0\xD0\x108b\x02 `0\xA7\xE5\xD0\xA5\xE1\x11p\0\xD1\x17\xC0\x96\b\x04\x88\x02\f\xB0@\xC0 \xF8[\xF1\x98H\xC1\xD5\x01\xF4!\xFFH\x0F\x81\x188x\x1F\x84\x07\xFF\x02\x0B\x83?\xC00\x07\xE0K\xF8\x10\xFF\xC1d\x10\x18\"\"\x03\xC1\xF0\xFF\x85\x80\xAF\xE1\x11\x88 \x83A\xFEo\xC6 \xF0!a\x01\xBF\xC8\xA0\xA5\xFE\xFF\x81`\x13`!\x11\xBC\x05PP\xA1\0\x81<\x90\"\x06\x1E\x1F\x05\"\f?\xC0\xF5 \x12\x10\x04\x1F\xF4\x0B\xFA\"*\x0F\xF8\x05\x83\xE0?\x82\").\x0E\xFF\xFCk\x04DT\x0F\xF0t\x04D\x83\x04\x12\xF0B\"!\x7FC@o\xC0M\x06\"\xD2\x85\x95\xC1\x11\x11\x03\t\x83\xFFh\x84\xD9\x04DE\xFD\xA2\x0FM\xF4\x18\x88\x88\x7F\xE1\x10\f\xFC\n\x0F\xF0DD\f8\x0E\xFF\x80\x03\x06~\"&?\xC0,\x04U\x07\0\xA2\x04\x8A<\x80H\x11T\x18\0\x88\x84\xA8%\x80\x8A\xA1\x05\x01\b\x8E\xCA\x04\xB0\b\b\x17\x11*\x90\x86a\x07\xC1\xE0\x01A\0\x0E\x1C\x04\x1A\bD\x1F\xA1\x10\x820P\"@ ";
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
	//AlarmPatchBegin_showAlarm
	function m(a)
	{
		a == 0 ? (delete settings.alarm.snoozeTime, saveSettings(), c()) : (Pip.clockVertical = !Pip.clockVertical, bC.clear(1).flip(), tm0 = null)
	}

	a = setTimeout(c, 6e5), Pip.on("knob1", m), Pip.on("knob2", c);
	//AlarmPatchEnd_showAlarm

	function n()
	{
		E.stopEventPropagation(), e = !0, ts0 = null, Pip.audioStop(), settings.alarm.snoozeTime || (settings.alarm.snoozeTime = settings.alarm.time), settings.alarm.snoozeTime += 6e4 * settings.alarm.snooze, settings.alarm.enabled = !0, saveSettings(), console.log("Snoozed - reconfigured for", new Date(settings.alarm.snoozeTime).toString()), a && clearTimeout(a), a = setTimeout(c, 3e3)
	}
	settings.alarm.snooze && Pip.prependListener("torch", n), Pip.remove = function()
	{
		a && clearTimeout(a), a = undefined, clearInterval(l), Pip.removeListener("knob1", m), Pip.removeListener("knob2", c), Pip.removeListener("torch", n)
	};
	let d = settings.alarm.soundIndex;
	//AlarmPatchBegin_AlarmSound
	d >= settings.alarm.soundFiles.length ? setTimeout(a =>
	{
		rd.enable(!0)
	}, 1e3) : (o && console.log("Playing alarm sound file: " + settings.alarm.soundFiles[d]),
	Pip.audioStart(`ALARM/${settings.alarm.soundFiles[d]}`,

	{
		repeat: !0
	})), g.clear(), bH.flip(), bF.flip(), Pip.brightness = 20, Pip.fadeOn()
	//AlarmPatchEnd_AlarmSound
};

let submenuInvAttach = () =>
{
	let a = 1;
	let b = ["\xA8Z @\xA1\xE0\xB5Z\xA0y\tV\xABS\x15\xA8\x04\xCE\xB2\xC0+Z\xADU\0\"\\\x06\x83\xA0\x14\x83U\xABd\x02e\x88\xC1\x07\x03d\f\x82)\x07J\x12\"-\xA9\xB5jj\x82\x90Ba\x0F\x89\x95\x07\x81\xABj\xB4\x90\b\x10\xB0\x186\0&=\xA4f\x10P\x1D,\x18H\f\x07#U>\x8Dd\x82\x84\x01\xA0E\xB5Y`\x98C\xD0u!1t\x91P\xA0qP\x18P\x1D-V\xB4R\x17Aj\xD2\xD1@@\xD0 \xA6\x90jE `E!\b\x80\xE9F \xD0Q\xE0\xD4 )0\xE0*Q 9,\x80\xDC\x1DMF\xB5\xA9\n\x06\x03\x04&$\x0B\x04.\x04n\x0E\xA8\x92\x0E\xAA\xA8\xBD\x07@\x13\x16\rF\xC0YI\x81\x05\x03\xAA\xEA\x82c\xD2\xA8( F\xE1\xE9T\x80\xE5\x02cB\xA1MP\xC6\xE0\x84A\xC0JP`\x84\xC5\x8C\xC6`A0\x84@\xBD\xC1\xC8Y \x16\n\bLh0L=VV\x83\xA0\t\x82@\x04&$\xA6R\x13\x14\x1C\bL=HLIE\xA2\x14\x13\x14\x1C\x0E\x82\x01\xA5\x8A\x84\xC4\xB2Y\x02ci\xB2 \xF0t\x11\x90\x98\xBAH\xD0Ll\b<\x1D,\xA4&&\x83A*\t\x8DAh\x03\xAA\x92\x84\xC3\x80\xE8Bc\xEA\xA8A0s6\x10\x98\x84PZ\xE0\x80\x04\xCDA\xA8\x010j!12X\0\x98\xD9\x90\x980\x1C\xC9\x9C \x000,6\0t6\xA6\x14 \x072g\b\0\f\x1A\x8DA\t\x8C\xA7\x04&E(&=\x922\x13\x07R\x13\x12\x15\x1A\x81\x0E\x86\xD2\x04\xC3\xA0\x84\xC3\x8C\xC6]\xC3jt\x12\x80\x98:\xA0\x99\xD9\0\x99\x12\x88\xD1<m6B\xC8\x13\"\r\xA9\xAA\x84\xC5\xC0\x04\xC3\x16\x82\x13\n\xC8\x07\n\x8A\x13\x12\x81\xA0\t\x85Z\t\x85\x06\x01\x83\x05\n\x02)\x0F46\t>\ri\xE6\f\x024\xE3\x04(\x1DX&\x14\x04&\x10\x18\x10\x98V\x98\x05f\xA0)\x17S\x02\x07\x03\x01\xCA\x89\xC2\x81i 9K(\xA8\x18-\xA8(\r\xA0&\x18\x9C\x11`#\xA0`\xB5j\xA8\xA4M.\x92\f\x1B\x04&\x0E\x94&\b\xE8\x18\xD5VST\xD2\x8AB\x10\x02\x13\x0FRT\x06\x02:\x06\xABe\xA8\x8AE|\x82\x99\n\x80\x13\x04t\f\x07,\x10\x06\xABi\x14\x86\x13\x10R\x0EBR\x88\n\xD3U\xD2\xD4r\xA1\x80_!\x04\xC5\xB5e\0\xA0\xC5r\xB5aHU] L\x8DUQ\x94\x15\x92\xB2)\bx\r\xA0&-\x92-\xAA\x14\x8EY\x04R\bLX\x03P\x11H\x83\xA0\x9F!\x04\xC6\x80V\x82\x81\x8AAF\x03j\t\x06\x13\x14(\x10<\x18\x05(t0Lh\bPA\xD0\xC11\x82\x83J\x96\xA1\x04\xC9\n\x06:\x1C&@ \x1BV\xA6\x8C:\x14&HP!H!3\xDE\xA1\x07G\t\x93\0\x94\x04\xFF\t\xFE\x13\xDE*\x13F\r\xAA\xCA\x04\xD0\xB4\xD0#!3\xE0\xDAH\rZ\x80\x13:5A\xD5Ul\x813\xA5P\xADH\xAC\x1A\bL\xDBE\xAB N\x07\"\x132\x03\xA4\xD5`h\x10\x0B(L\xC86KUJ\xC0@#!3r\xDA\x98\xD0L\x180L\xC8U+PP\n,\x1325Z(\x02\x13\x06R\x132U\x02\xD2\xEA\xB4\x10\rHL\xCBL\x07C\xAA\xD2\xC0uU\0\x99\xA7\x80u@ l\x012\xED\x10 \x80:K0L\xDD@L,\x84h&\r\x94&`D\x1C\0L\x1D%\xABJ\x132\x03\x80\x85j\xB2\x91cH!4\x16\xC0\xEA\xB2\xA14\x02\x81\x01\x02\t\x8F\0\xC8Bk@\xE0\xC5#\x04\xC3b\x83`\x8C@*\x80\xD0\xE2\xA6\xA0Vb\xC1\x82`\xCAS\x80\xC9\x06\xC2\x0F\x84\t\x85\x1A\r\x83\x1A\x1F\x02\x13\x14($\xA2\r\xAA\x95\x04\xC1\xB5\x04\xC1\x90\"\x06T\x83\x94\x94Z\xABU\xADL\x01\x90\tH\x15\x88\xF5g\xE8:XVkS\x01\xD5\x14\x81\xA86\x88\x1F\x03@\x83e\xB5P \x98B\x90@\x04E \x10\x1D.\xAA\x8C\x82\x05l\bL\x90\0Z\x9A\xD0\xA4\x1D$\x1A\x80\x1325\x96\x14\x83\xA4\x8D\x04\x8C\x1E\x03U\x14\x83\xA8S\x82\0:\xD5Q\xAA\x98\x8A\x1E\x8C(\x04\x9Ch\xF47\xD0\x80\t\x80", "\x9EN @P\xA5@\xC1`Z\x000\xBA\xA0p\xC0qaZ\xAC\0\x1C\xB9P8`8\"\xD15@aA\xC1j\x06B\x01\x84\x0B\x06<\fd\b8\x91\xA8B0B\xA2\tC\x1A\x86\x0E8\n\x11hA\xA0CP\x82\x81\x83\x84\x12\x86&\x04\x1C!\xA40p\xA20\xCBB\x01\xC3\x13\x02\x0E8F!h!\xA0\x80\xE3\xF4\0\xE1K@\x8D\x04\x07\x02\x05\x10\x1C\x10XPp\xC6\x90A\xC2\xEA\x01\xC2\x96\x81\x03\x8C\x0ESA \x16\x19\x8A\xD5\x16E\x07\f\f\x07\x04\x0Ehr\x0E\x88\xA40\0@p/ \xC0\x04\x0B\x01\x077\0\x1A\f\0T\x94\x0B\x10\x10s\'\x12\x01\xC9\xC0\x92\x01\x1D\x8C\x07 \x87)\xF6\x19h\xA0q\xCD\xB2\x8B\x03\x03\x8F-\x12X\f\xB4P8\xE2\xC0e\xA2\x81\xC7\x03D-\x10X\x14\xB4@8\xE2\xC0\xA5\xA2\x01\xC7\x12\x8ER\x1E\xFE<\0H", "\xBC]\xA0Bh\xE0!\xD7 \xC1\xD7h\x01\xDF\xC3\xBB`\x03l\xC4\x03\xA0\xE4\x03\xAC\xC5 \x10P\xEF\x11\x88\x04\x04:\xD4d:\xE4h:\xE3\xB4\x18\x0E\x90;\xC6@;\xF3\xD0\x10\x02\xC1\xB0C\xA7@C\xAEAj\x01\xD3u\x10\x0B @\xA8\xADP:^\xA0:dV\x81U\xAA\xD0\x03d\x02A\xB4\xC0u!\xD2\xABYZ\xAD\x94xNB\x01j\x0E\x92+\x06\x03\xAA\xD4\xDA\xB5C\xC2B\xE0\xDA\xA8:\x97\x88\xF0\x1C\x84\x1BT\0\x0B*\x1D\"R\x1D.\r\xA5\xAD\x07C\xD4\xADE\x02\x85\x19\x80J\x83\xA5\x06\xC3\0\x04\x1D\x14\xFC\x14j\x81\x1A\xC8\xA5\xC1\x0E\x93V\xD5T@\x80\xE5\x01\xA2VB\x01d#Y\n\xCC\b:F\xA6\xD3e\xA8%\x81\xD2\x83D\x1C\x02\x10\x07I\t\xA0E@\x80\x87G\xD2\x8F\x01Z\x05\xA9K\t\x06!\x02T\x10:<\x17U\x9A:\x84\x99\b\xF0#\xA4 \x10AP\x83\xA3\xDAF\xE0\xB4\x02\xAA\xD6\x92\xC2\xDA\x9F\xC0\x87C\x80\xBDA4\x8BUX\x87\xA5\xB5U\xB2\0\xE1+@`m-\xA1\x83\xA2V\x9D\xE2\x0FAZ\x0B\x1AN\x83$\f\n\0\x123i\x0E\x85\xA6\x1E\x84i\x16\f\x9D\x06 \x1D)*\b\0,\x88\b\x1D\rP\x1C$\x07Ta\n\x0BU,\f\x0E\b\0\x16\x90\xB2\x10tT\xB0$0`\xAD\xF0\x83\xA3;\xC1\0\x04\xEF\x07SU\x0E\x8D\x1A\f\x02\x88\r\xFA t-*P@\xE9\x02\xD0h\xA0\xF0\xD8\"\xA9\x02\x0E\x9A\x87\x05\x86 t}\x0E\xAB4\x10\b:D\x06\xD3\x1A\x0E\x95*\x1D\x83Z\xD4\x84\x01\x0E\x91\0\xAC\xCA\x83\xA1\xE0\x14c$\x83\x0E\x83\xA5b\x11\x15\x1D\x88\xC1\x1C0\b|\x12\xC8!\xD2X\xA2jZ\xE0\x87F\xC8\x83\x01\x11\x04\x1D&*\r\x07U\x96\x0E\x91\x86$\x86\x1D\x048:\x9C\x1A\xA8\0\x1BPt\x8C\xB0tD\xA0\xE1\xD0\x94 \xD5\xB5E\x92\xC7f\x1D\xC3\x0E\x92\x95\x04vht\xD0\0\x99P\xEA\xB6\x90\xF0C\xD0\x83\xA5@C\xA5YP \x86\x81\x10\x82\x1D>\x80;\x1A\xD2\xBF\x06\xB3\x1A\xD5UC\xA4\x9B\x03\xD4\x82\x86\xB4\xE6\x81a\x07Mv\x82\x0E\x04v4\xA8\xE8\x15Z\xD4\xE2\x04:Px\x1A\xADh:3\xEC!X6\xA7p5\0\xE9U\xA7\xF1\x05@r\xA0\xC0A\xA1\x0B\x06<\r\x96\xD5\x0BEn\x88!\x048X\xC4$`-!C\xA0\xE5C\xA1\x12\x06h\x8C\x11\rj+tC\xD8!\xD2\x89\xA1V\x87`\xB4\xC6n\x86\x930\xAE\t\xD8\x170F\xB1Rh\x07L\x8B\x1DB,\x16Y\f:\x0E\xA4:4\x14:\x1D\x14xT\x04\xD6\rX\xD8\x0B\x18j\xC80\x1D-f\xABTZ\x17T\x8Df\xB4\xAD@r\xAB10\xC9`\xADYD\xB9Q]MX4\bX\"\x90 \0uY\x028\"\x90r\'\xA2\xA5@\xF0I\xA0\x8D\x03\0\x05j\xD2Em!\xF0j\xCDB\x83\xA1jN\xE0\x87E\xAA\xBBA\xAA\xDA\xB4\xB5\xAC\xA9\xE4\x96\x90$\xB0F\x80\x87E\x04\x82\x1A\x04D\x0B\xCC\xB5\xA0$\xB0C\xA3\x90\xC1\x1F\x84\xB7\x04\x06\th\x98\xADDvP\x80\x11XM\xF0KD1\x81a\x82\x1D\x074\x1D t\x10\x10\x15\xA9\x10``&\xB0@A\x80\x02\xD3\x17\x05-\x14;\x07T8\x074\x1D8\xB4H`\x10\b9\x90\xE8\xB9`\xE8\xEBPC\xA3\xC1T\xA1\x1BE\x0E\x92x&\x027\x0B*N\x116\x1A`#\xC0\x8F\x12\x03\xA1\x1C\x02t\x86\x1D\b\x12 \xA4\'\x89\x0BP\x9A\x01\x9A\xC1\x0E\x95\xA5K\x10\x1D\x1A\xAA\x1D\x04\x8A:X\xB6\x98)@mHpj\xB5\x10\xE9\x87\x82r\x91P\xD85Z\xA4\x04:a\xE0\x81\xF0A\xD0\xA8\x01\xD0Z\xE1\x07S\x80\x0F\x01\x06\x82\x1D\x1D\xEA\x10t$\xB1\x04\x01\xC3\xA3!A\x0E\x86\x96 :}X\x06\x10u\x96\xD0!\xD5\xCE\x81\x15A\x82\xBFC\x0E\xAC7\x06\x01U\x0E\xA3\0\x1D\x91\0\x1E\x02\x1De\x98\f\x18:\x0BD\xF0\xE9Q\xA0\xEB\xF5\0\xEB6\xA4\xC8!\xD7h\x01\xD4\xF4\xC0 r\xB5\b\n\xDC \xEA\x15P\xE8\xA5@C\xA0\xE5Z\b\x0E\xC1\f\x824\b8\rA\xA0\bu)Pt#\x80!\xE0\x9D\xC9\x87D\x1E\x86\x1Dl\xA8\t\xDC\x12\b!\xD4cA\xC0\xCBAT\"#\xF0\x83\xAA\xA5\x83\x92\0\xC1h \x1D\x15*\x1D\xA6*\x1DXt\x15V\xA3\xAA\xA0\xB4\x11\x0E\x86\xD0\f:\x12M\x10\xE8a\xC1\0\0\x87U\x0E\f;U\x16\btz\xACP:\x8C\x14:H\xF1\xA8\x03X \xEAC\xD1*\0`mY@\xEA\x80\x01\xADYP\xEBr\xA0\xEB\x91\xAD*U3\xF1\x15\x03\xE0@"];
	let c = [submenuExtTerminal, submenuRad, showTorch];

	function d()
	{
		bC.clear(1).setFontMonofonto23().setFontAlign(-1, 0);
		let e = 0,
			d = 220,
			c = 40;
		const f = ["EXT TERMINAL", "RAD METER", "FLASHLIGHT"];
		f.forEach((b, f) =>
		{
			f == a ? (bC.setColor(2).fillRect(e, c - 21, d, c - 18).fillRect(d - 3, c - 17, d, c + 16).fillRect(e, c + 17, d, c + 20), bC.setBgColor(1).clearRect(e, c - 17, d - 4, c + 16), bC.setColor(3).fillRect(50, c - 5, 59, c + 4)) : (bC.setBgColor(0).clearRect(e, c - 21, d, c + 20), bC.setColor(2)), bC.drawString(b, 70, c), c += 50
		}), bC.setBgColor(0).setColor(3), b[a] && bC.drawImage(dc(b[a]), 310, 90,
		{
			rotate: 0
		}), bC.flip()
	}
	d();

	function e(b)
	{
		if (b)
		{
			let c = a;
			a = E.clip(a - b, 0, 2), a != c && Pip.knob1Click(b), d()
		}
		else c[a] && (Pip.audioStartVar(Pip.audioBuiltin("OK")), Pip.removeSubmenu(), c[a]())
	}
	let f = setInterval(function()
	{
		bC.flip()
	}, 50);
	Pip.on("knob1", e), Pip.removeSubmenu = function()
	{
		Pip.removeListener("knob1", e), clearInterval(f)
	}
};
//InvPatchInsert_ItemsFunction
//PerksPatchInsert_PerksFunction
//SpecialPatchInsert_SpecialFunction
let submenuExtTerminal = () =>
{
	E.setUSBHID(
	{
		reportDescriptor: "\x05\x01\t\x06\xA1\x01u\x01\x95\b\x05\x07\x19\xE0)\xE7\x15\0%\x01\x81\x02\x95\x01u\b\x81\x03\x95\x05u\x01\x05\b\x19\x01)\x05\x91\x02\x95\x01u\x03\x91\x03\x95\x06u\b\x15\0%h\x05\x07\x19\0)h\x81\0\xC0"
	});
	var c = 0;

	function d()
	{
		c++, E.sendUSBHID([0, 0, 0, 0, 0, 0, 0, 0]) ? e() : (bC.clear().setFontAlign(0, -1).setColor(3), drawVaultTecLogo(199, 15, bC), bC.setFontMonofonto23().drawString("Connecting" + [".  ", ".. ", "..."][c % 3], 199, 115, !0), bC.setFontMonofonto16().drawString("Please reconnect USB", 199, 145, !0), bC.flip())
	}

	function e()
	{
		function f(b, a)
		{
			E.sendUSBHID([j, 0, b, 0, 0, 0, 0, 0]), setTimeout(function()
			{
				E.sendUSBHID([j, 0, 0, 0, 0, 0, 0, 0]), a && setTimeout(a, 5)
			}, 5), Pip.kickIdleTimer()
		}

		function n(a, d, b)
		{
			b = b || 20;
			var e = setInterval(function()
			{
				a.length ? (a[0] in c && f(c[a[0]]), a = a.substr(1)) : (clearInterval(e), d && d())
			}, b)
		}

		function o()
		{
			Pip.removeSubmenu(), delete Pip.removeSubmenu, bC.clear().setFontAlign(0, -1).setColor(3), drawVaultTecLogo(199, 15, bC), bC.setFontMonofonto23().drawString("Sending...", 199, 115, !0), bC.flip()
		}

		function g(a)
		{
			polys = [
				[200, 20, 220, 40, 210, 40, 210, 60, 190, 60, 190, 40, 180, 40],
				[200, 180, 220, 160, 210, 160, 210, 140, 190, 140, 190, 160, 180, 160],
				[100, 100, 120, 80, 120, 90, 140, 90, 140, 110, 120, 110, 120, 120],
				[300, 100, 280, 80, 280, 90, 260, 90, 260, 110, 280, 110, 280, 120]
			], bC.setFontMonofonto23().setFontAlign(0, 0), h && clearTimeout(h), h = setTimeout(b =>
			{
				polys.forEach((b, c) =>
				{
					bC.setColor(a == c ? 3 : 1).fillPoly(b)
				}), bC.setColor(0), bC.setBgColor(a == 4 ? 3 : 1).clearRect(165, 85, 235, 115).drawString("ENTER", 200, 101), bC.setBgColor(a == 5 ? 3 : 1).clearRect(275, 25, 345, 55).drawString("ESC", 310, 41), bC.setBgColor(a == 6 ? 3 : 1).clearRect(275, 145, 345, 175).drawString(d.labels[d.keyIndex], 310, 161), bC.setBgColor(0), h = null, bC.flip()
			}, a === null ? 100 : 0)
		}

		function e()
		{
			g(null)
		}

		function p()
		{
			E.showMenu(
			{
				'':
				{
					title: "Terminal Connected"
				},
				"Hello World": function()
				{
					o(), n("HELLO WORLD", p)
				}
			})
		}

		function k(a)
		{
			a ? a < 0 ? (g(1), f(c.DOWN, e)) : (g(0), f(c.UP, e)) : (g(4), f(c.ENTER, e))
		}

		function l(a)
		{
			a < 0 ? (g(2), f(c.LEFT, e)) : (g(3), f(c.RIGHT, e))
		}

		function m()
		{
			g(5), f(c.ESC, e)
		}

		function i(a)
		{
			d.v = a, a ? (d.keyIndex = (d.keyIndex + a + d.keys.length) % d.keys.length, e()) : (g(6), f(d.keys[d.keyIndex], e))
		}
		Pip.HIDenabled = !0;
		var c = {
				A: 4,
				B: 5,
				C: 6,
				D: 7,
				E: 8,
				F: 9,
				G: 10,
				H: 11,
				I: 12,
				J: 13,
				K: 14,
				L: 15,
				M: 16,
				N: 17,
				O: 18,
				P: 19,
				Q: 20,
				R: 21,
				S: 22,
				T: 23,
				U: 24,
				V: 25,
				W: 26,
				X: 27,
				Y: 28,
				Z: 29,
				1: 30,
				2: 31,
				3: 32,
				4: 33,
				5: 34,
				6: 35,
				7: 36,
				8: 37,
				9: 38,
				0: 39,
				ENTER: 40,
				"\n": 40,
				ESC: 41,
				BACKSPACE: 42,
				"\t": 43,
				" ": 44,
				"-": 45,
				"=": 46,
				"[": 47,
				"]": 48,
				"\\": 49,
				NUMBER: 50,
				";": 51,
				"'": 52,
				"~": 53,
				",": 54,
				".": 55,
				"/": 56,
				CAPS_LOCK: 57,
				F1: 58,
				F2: 59,
				F3: 60,
				F4: 61,
				F5: 62,
				F6: 63,
				F7: 64,
				F8: 65,
				F9: 66,
				F10: 67,
				F11: 68,
				F12: 69,
				PRINTSCREEN: 70,
				SCROLL_LOCK: 71,
				PAUSE: 72,
				INSERT: 73,
				HOME: 74,
				PAGE_UP: 75,
				DELETE: 76,
				END: 77,
				PAGE_DOWN: 78,
				RIGHT: 79,
				LEFT: 80,
				DOWN: 81,
				UP: 82,
				NUM_LOCK: 83,
				PAD_SLASH: 84,
				PAD_ASTERIX: 85,
				PAD_MINUS: 86,
				PAD_PLUS: 87,
				PAD_ENTER: 88,
				PAD_1: 89,
				PAD_2: 90,
				PAD_3: 91,
				PAD_4: 92,
				PAD_5: 93,
				PAD_6: 94,
				PAD_7: 95,
				PAD_8: 96,
				PAD_9: 97,
				PAD_0: 98,
				PAD_PERIOD: 99
			},
			j = 0;
		let h;
		let d = {
			v: null,
			keys: [c["\t"], c[" "], c.DELETE, c.BACKSPACE, c.HOME, c.END],
			labels: ["TAB", "SPACE", "DEL", "BACK", "HOME", "END"],
			keyIndex: 0
		};
		clearInterval(b), b = undefined, clearInterval(a), a = setInterval(() =>
		{
			BTN_PLAY.read() ? d.v == null && i(0) : BTN_TUNEUP.read() ? d.v == null && i(1) : BTN_TUNEDOWN.read() ? d.v == null && i(-1) : d.v = null, bC.flip()
		}, 50), Pip["#onknob1_old"] = Pip["#onknob1"], delete Pip["#onknob1"], Pip["#onknob2_old"] = Pip["#onknob2"], delete Pip["#onknob2"], Pip["#ontorch_old"] = Pip["#ontorch"], delete Pip["#ontorch"], Pip.on("knob1", k), Pip.on("knob2", l), Pip.on("torch", m), Pip.removeSubmenu = function()
		{
			a && clearInterval(a), Pip.removeListener("knob1", k), Pip.removeListener("knob2", l), Pip.removeListener("torch", m), Pip["#onknob1"] = Pip["#onknob1_old"], delete Pip["#onknob1_old"], Pip["#onknob2"] = Pip["#onknob2_old"], delete Pip["#onknob2_old"], Pip["#ontorch"] = Pip["#ontorch_old"], delete Pip["#ontorch_old"], Pip.HIDenabled = !1
		}, bC.clear(), e()
	}
	var b = setInterval(d, 1e3),
		a = setInterval(() => bC.flip(), 50);
	Pip.removeSubmenu = function()
	{
		b && clearInterval(b), a && clearInterval(a)
	}, d()
};
let submenuApparel = () =>
{
	let b = "PROCEDURES!\n\nVault-Tec provides all clothing, bedding, and accommodations for residents.\n\nPersonal belongings must be reviewed and approved of by an authorized Vault-Tec hermetics technician before such belongings can be delivered to your reserved quarters within the Vault.\n\nAll Vault residents must attend an orientation seminar. If you did not attend such a seminar as part of the application process, you must make an appointment with your Vault-Tec representative.\n";
	bC.setFontMonofonto16().setFontAlign(-1, -1).setColor(3);
	let a = -223,
		c;

	function d(b)
	{
		a -= b * 10, a < -400 && (a = 200), a > 200 && (a = -400)
	}

	function e()
	{
		a !== c && (c = a, bC.clear(), a > -100 && drawVaultTecLogo(199, a + 15, bC), bC.drawString(b, 20, a + 120)), bC.flip()
	}
	Pip.typeText(b).then(() =>
	{
		b = bC.wrapString(b, 350).join("\n"), Pip.drawInterval = setInterval(e, 50), Pip.on("knob1", d)
	}), Pip.removeSubmenu = function()
	{
		Pip.typeTimer && (clearInterval(Pip.typeTimer), delete Pip.typeTimer), Pip.drawInterval && (clearInterval(Pip.drawInterval), delete Pip.drawInterval, Pip.removeListener("knob1", d))
	}
};
let submenuStats = () =>
{
	const e = {
		x: 36,
		y: 41,
		repeat: !0
	};
	let a = fs.readdirSync("MISC").sort().filter(a => a.toUpperCase().endsWith("AVI") && !a.startsWith("."));
	if (!a.length) return;
	let b = Math.floor(a.length * Math.random() * .999);
	let c = !1;
	let d = setTimeout(function()
	{
		d = undefined, Pip.videoStart(`MISC/${a[b]}`, e)
	}, 200);

	function f(d)
	{
		if (d == 0 || c) return;
		c = !0, b = (b + a.length + d) % a.length, Pip.knob1Click(d), setTimeout(d =>
		{
			g.clearRect(36, 41, 444, 288), Pip.videoStart(`MISC/${a[b]}`, e), c = !1
		}, 100)
	}
	Pip.on("knob1", f), Pip.removeSubmenu = function()
	{
		d && clearTimeout(d), Pip.videoStop(), Pip.removeListener("knob1", f)
	}
};
let submenuAbout = () =>
{
	let g = "\xCBY AD`:A\xD4r\xAC\0\x92(6d\x95\x1D\x97 $\x8A\x15\xAA%G\x9A\xD0\t\"\x8A\xEA\xA8\x02H`Z\xAD!*)U\x1B\0$\x86\r\xA0\xB4\x12\xA2\xB5f\xB2\x02HaV\xADHy\xB8\xC0\x14H\x0E\x86\xD5\xA0\x04\t\x19\x12)\x03\xF0\x07\x05\x85j\x93\xA3\tT\x8F\xB6\x04\x81iuZB\x90\x9A\x83\x82\xB7\xE0\xE0\x9A\xAD\xD7\xAB\xA8\xC2\x10H\xAC\x07\xF8I\x0F5\xE8\x81vIa\xC6\x8B\x02\0\x11\x83\xA5\x83\xB0Z\xBF{\xDC\0\x80$\xA2\xC9`\xB8\x04\xA0\xB5YX\xAEi \x14\x07\xB8$Y,\r\0\x06\f\x92\x13U\xAC@\x80\xE1Y\x84\x8B\xA5\x83\x81Z\xB5U\xADu\x80\x0E\fw %^\x0F\xF0\x01\x83\x19\x90T*\x19\xA4\xA0W\x01\"\xE9`\xE08mV\xBBQP\x03\x03\xD8\x121\0\xBF\x80\x81\x85\xEFmQ\xFFbP$\xC0Ie\xFF\xB0k6\xFF\r\xA8\xDF\xE5,\x91\x94\xA3\x04p\xBE?\xFF\xFFGU\x92\x02\x03\x86\xBA\t\x19K\x03\xDB\xFF\xF95Z\xAA?\xFF\xC5\x9C\x125\0\xDF\xC5j\x96\xADV\xA6\x0B\xA4\xD1\x89\x1B\x81\x7F`5\xA2P:\x9A\x02Q\xB1 <\xBF\xA0\x8C\x10\0X\xAB\'@J\xD5\xFE^\xB9\x04\0\x16K\x13?\xA0\t\x19\x83\xF87\xF4a I@h\x7FBSS\xFA\x17\xF64\x95\nQ\x90\xBF\t\x1A\x80\xFE!\x7FG\0:\xAAT\x92\x9E\x95n\x1F\xC8K\x07\x92\xC5I\x7F\x02F\xA0\x1B\xDB\x02X-&\x8B\x15/]4\xBB\x07\xA5\x92K\x02\x94\x07#\xA2\xF8\x12\x9B\xBFJ\xA1\xE9`iR\x8DT\xFCH\xDC\x0F\xC5\xA8K\x03\x92\xA5F\xB2~\x01+s\xF9V\x83\xFF\x80\xD1a\xB53\xE2S\xBA\xAC\x17\xF2i\xA1\xD5h\xC9NO\xA5Z\xA8\xF46Qj\xD4\xA5\\\x83\x92\x81\xD4B\x92\x80\xEA\x9C\x0E\xDFmZ\xAC\x96\x0B\x03\xAA\xD5K\xE8\x02F\xA1\xFCmV\x93A2\xA3j\xB4\xBF\x81#P\x1F\xC6\xABS(\x84\xCFN\0\xD3\xFA\x02V\xA7\xF5\xADU*\x05\x8F\xFAZ\xB5\x17\xE3{~\x14\xA08\r\x17\xFF\xA3\xAA\xC9\x9C\x1A\x81\x7F\b\x80\xE8&\x90\xBF\xFAX\x1A\x7F\x80\xDE\xD5)(\x14\xA2_\xFD\x8Dj7\xCB\xA6\x89@\xA5\x01\xC5i7\xE9`Wm\xC2\xFCU$\xA0:\xAC\x12X\x1B\x12U\xA3\x804\x1D\x04\x92\xD5\xAA\xA5\xFF\xF2\x17\xF1\x1B0X\x0F\xE3I\n\x95j\xB5\x12\xFF\xFE?\xA1P\x12\xB1\xA9\x85\xD6 XmV\xA9,\x0F\xF7q+\x121\b\xB4D\xA8\x16\x11 :\xAC?\xFF\xCD\x1D\x907\xD8\xC0i:\x10\x94\xA0:\xADI\xC0\x1CT\n\x80%_I\xA9\xDAA\xB1D\xA0\xB4\x9F\xFF\xF6.\x9A%_Q-\xBC\xC0\xB2\x02@\xB5T\x1F\xFF\xEFS\x1A\x12-\x06\x85M\xA8\x1A\x1C\x10\x90,\x8E\x8F\xFF\xD9\xB2h\x04\xABG\xB0=\tE\xFE\x8Co\n\xFF\x9F\xFF\xD0v\x89U\xF4\x14\xA8V\x9F\xFD\x06\x12\x03/\xF3_\xFC\x10q\"\xF2\x89$\xEBEK\xFFAr\x92\xFF\xC6[\xFB$\x8C\t\x16\x85@\xA2\x1E-d\x7F\xFD@\xB7\xFFa\xD9xLB\xC0%[\x01\xAA\xA1`\xB0\x12\xFF\xFE\xFF\xFB\0\xB8\xF05T1\"\xD0\x98l&\x15p\x80\tA\xFF@ :\n\xAC\x92`%Za\x02\xA4G\x80\xA0\xC6\xFF 0o\x10*L$H\xB4\x0B\x81`\xDAGA\"Z p\x98\x17@J\xB6z\t\x18\xA0J\xA8\0\x80\xAD0*\xC5B\xFE\b\f\0\x94\xA2q\x02\x81`#ZX\x8C[k\0\xCA^#\xEC\0@\nC`=\n\x86b\x01\x05\xB5j\xAA\x10\x18F\x82\x05\xFF\xFA%\x15\xA0Y\xB0\x06\xE0b\x80\x90\xA0\x93\x8D\x14\x03\xAF\xFFK+`\x94B\xA07\b\x15\x87\x03P\x8Ap\xB2Y\x0B$\x7F\xFCJV\x15\0\x8E\xC0\xA0\x13K5\xA6\x03\xED\x93\xC0%0\t\xFF\xC0J\xA4\xBD\xA4\f\xA2\x01\x06\xA1Ph\x10\xAA\x9DR5\0\x80\xEFWj\x80\x02\xBA@4\x15d\xB88h\x84(`\b\x01\xAB\xC4\x07\r\x91\xC0B\"\x11\xA1#\x90\x0BM\x02\b\x05\n\xBC$v\x01[\xCA\x80\xC1\x8BjDn\x80\x01\x82\xEA\xF7{\xAA\xA0\x91\xF0\x07\xE0\x0F\xC0\x15@\xFF\xFF\x8D\xA4z\x17\xFF\xE8@\xF8\x1F\t\xE4\x1F\x81\x0B\xC0m%\xFF@\xA02\xEA\x04\x0B\xE9\x02\xE8C\xE1\x7F\xD8\x04|\x16\b \x1F\x84z\x7F\xFF\xC5\xD0|\x1B\xF0p3\xC8x\x9C\x1D\xEC\x03y\x0B\xA1\x7F\xFE\x10\b\x7F\xFA\0\x05\x06_\x02\xF8o\xFF\x82\xC0\xBE\x12\xD0\x98=\b\xF4\0\x94\x15\0\xA4\x0F\x03\xE8\'\x07\xA1\x0B\xE8m%\xB0\xF28>\x0F\xA4\xB82\x0F\xE2\xFE\x1D\n\x7F@\x97\x81\x01\xBCO >\bY(\x1D\xA1\x8C\x19l~\x8F\x80\xF7@7\xC1\x80\xAF\x05``\xF8>\x05\xE2_\xDF\xF8m#\xF0=\xC4\x0B\xF1-\x81\xF1\xF0\x04\xA1\xA0=\x1F\xC5\xD2;\xF0\x85\x86\x01\x96\xA6\xC1+\x03\x10\x13\x83\x82\xF7\xFB\xC2\xC0\xFC.\xFC\t\x7F\x0B\xA1,\xDA\x12\x87\x8FK\xF8\xF4\x1E\\\x03\x7FK%\x03|%\x02~\n\xF1-\xDE\x92\x82\x83\xCB _\xD9l\x07\xBE\x1D\x04\x94,\x03\xE7\xAC\xD8K.\x90\xBB\xE1(S\x90X.\x9D<\xF8\x16\xC7\xA1-\xF9:A\xF0\x12\x82\xFF\xB8\x01\xE85\x01\x9A\xF3\xE0x:\x06\xD7\x96J&@\xE0\n\x1D\r\x81u\xE5\xB0\x07\xC0$\xA0w\xFF\xE8_\xF4\x94\x0E\xDE\xBB\xF0\x9AN!t\xD2Q$\x10a\x7F\xE8\x07C\xC1-\x9Bt\x02 \xA5G\x83\xFC?\xD0z\x1F\x03i\xFF%\x13\0J\x83\0\x8E\xC3\xE0]2\b!\x10R\xA3\xDF\xE1\xFD\r\xF6\xF2\x17G\xFA8\b%\x05@\x81~\xBE\x12\xD8\xF9(\xA8\x1F\xC3\xF9\x0F\xFF\xF46\x93\xF2P7\x83hX2P\xD3\xF2\xD0D\xA2\xE7\xF0\xBE\x07\xC0\x10\r\f\x94\f<\x80\x0F\x83\xE9.n\x04J\b\xEE\x19\x88\x12P\xDB\xF1p0?\x05\xF0^\b\xF0\x18\xFD\x0B\xFF\xF0v\x02\xB3\x04\n\t(K\xC4\x0F\x85\xD0\xBE\x92\x874\x82\xA5\x06\x0F\x81\x1E\x07\xF4\x97\xFD\n\xC0\xCB\x89\xA0\xFD @\xD0\xE0\xF4\t\xE4\xB6\x07\xD0(\x02";
	let c = E.getTemperature();
	let d = () =>
	{
		let b = process.memory();
		let d = Pip.measurePin(VUSB_MEAS);
		let e = Pip.measurePin(VBAT_MEAS);
		let f = CHARGE_STAT.read() == 0;
		c = c * .99 + E.getTemperature() * .01;
		let a = "============ Pip-Boy 3000 Mark V ===========\n\nPip-OS " + process.env.VERSION + " - " + VERSION + "\nSerial number: " + Pip.getID() + "\n\n";
		return settings.userName && (a += "Pip-Boy assigned to " + settings.userName + "\n\n"), a += `Battery: ${e.toFixed(1)}V`, d > 1 ? (a += `, USB: ${d.toFixed(1)}V`, f ? a += " (charging)\n" : e > 4 ? a += " (charged)\n" : a += " (not charging)\n") : a += " (not charging)\n", a += "Memory used: " + b.usage + "/" + b.total + " blocks\nCore temperature: " + c.toFixed(1) + " C\n\n", a += "Built for Vault-Tec by The Wand Company\n", a
	};
	bC.setFontMonofonto16().setFontAlign(-1, -1).setColor(3);
	let e = d().split("\n").length * bC.getFontHeight();
	let a = 90 - e,
		b = -200 - e;

	function f(c)
	{
		a -= c * 10, a < b && (a = 190), a > 190 && (a = b)
	}

	function h()
	{
		bC.clear(), a > -100 ? drawVaultTecLogo(199, a + 15, bC) : a < 310 + b && bC.drawImage(dc(g), 125, a - 90 - b), bC.drawString(d(), 20, a + 120), bC.flip()
	}
	Pip.typeText(d()).then(() =>
	{
		Pip.drawInterval = setInterval(h, 50), Pip.on("knob1", f);
		let a = 0;
		scrollInterval = setInterval(function()
		{
			f(1), ++a > 8 && clearInterval(scrollInterval)
		}, 100)
	}), Pip.removeSubmenu = function()
	{
		Pip.typeTimer && (clearInterval(Pip.typeTimer), delete Pip.typeTimer), Pip.drawInterval && (clearInterval(Pip.drawInterval), delete Pip.drawInterval, Pip.removeListener("knob1", f))
	}
};
let getUserVideos = () =>
{
	var a = [];
	try
	{
		a = fs.readdirSync("USER").filter(a => a.toUpperCase().endsWith("AVI") && !a.startsWith("."))
	}
	catch (a)
	{}
	return a
};
let submenuVideos = () =>
{
	var b = getUserVideos();

	function c(b)
	{
		function a(a)
		{
			a || submenuVideos()
		}
		Pip.removeSubmenu(), Pip.videoStart("USER/" + b), Pip.on("knob1", a), Pip.removeSubmenu = function()
		{
			g.clear(), bH.flip(), drawFooter(), Pip.removeListener("knob1", a), Pip.videoStop()
		}
	}
	var a = {};
	b.length ? (b.forEach(b =>
	{
		a[b.slice(0, -4)] = function()
		{
			c(b)
		}
	}), a["< Back"] = submenuMaintenance, E.showMenu(a)) : (Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuBlank("NO VIDEOS\nADD TO 'USER' DIR")())
};
let getUserAudio = () =>
{
	var a = [];
	try
	{
		a = fs.readdirSync("USER").filter(a => a.toUpperCase().endsWith("WAV") && !a.startsWith("."))
	}
	catch (a)
	{}
	return a
};
let submenuAudio = () =>
{
	var b = getUserAudio(),
		a = {};
	b.length ? (b.forEach(b =>
	{
		a[b.slice(0, -4)] = function()
		{
			Pip.audioStart("USER/" + b)
		}
	}), a["< Back"] = submenuMaintenance, E.showMenu(a)) : (Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuBlank("NO AUDIO FILES\nADD TO 'USER' DIR")())
};
let getUserApps = () =>
{
	var a = [];
	try
	{
		a = fs.readdirSync("USER").filter(a => a.toUpperCase().endsWith("JS") && !a.startsWith("."))
	}
	catch (a)
	{}
	return a
};
let submenuApps = () =>
{
	var files = getUserApps();

	function startApp(app)
	{
		Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.remove && Pip.remove(), delete Pip.remove, g.clear(BGRECT), g.reset().setFontMonofonto28().setFontAlign(0, 0), g.drawString("Loading\n" + app, BGRECT.x + BGRECT.w / 2, BGRECT.y + BGRECT.h / 2), eval(fs.readFile("USER/" + app))
	}
	var menu = {};
	if (files.length)
	{
		var nameMap = {};
		try
		{
			fs.readdirSync("APPINFO").forEach(b =>
			{
				if (!fs.statSync("APPINFO/" + b).dir)
				{
					var a = JSON.parse(fs.readFile("APPINFO/" + b));
					nameMap[a.id] = a.name
				}
			})
		}
		catch (a)
		{}
		files.forEach(b =>
		{
			var a = b.slice(0, -3);
			a in nameMap && (a = nameMap[a]), menu[a] = function()
			{
				startApp(b)
			}
		}), E.showMenu(menu)
	}
	else Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuBlank("NO JS FILES\nADD TO 'USER' DIR")()
};
let submenuSetAlarm = () =>
{
	//AlarmPatchInsert_CustomRadio
	var b, a = {
		//AlarmPatchInsert_TriggerAlarm
		"Set alarm time": function()
		{
			Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuSetAlarmTime()
		},
		//AlarmPatchBegin_AddStations
		"Alarm sound":
		{
			value: settings.alarm.soundIndex,
			min: 0,
			max: settings.alarm.soundFiles.length,
			step: 1,
			format: a => a >= settings.alarm.soundFiles.length ? "FM " + rd.freq.toFixed(1) : settings.alarm.soundFiles[a].slice(0, -4),
			onchange: a =>
			{
				settings.alarm.soundIndex = a, a < settings.alarm.soundFiles.length ? Pip.audioStart("ALARM/" + settings.alarm.soundFiles[a]) : Pip.audioStop(), b && clearTimeout(b), b = setTimeout(function()
				{
					saveSettings()
				}, 5e3)
			}
		},
		//AlarmPatchEnd_AddStations
		"Alarm on/off":
		{
			value: settings.alarm.enabled,
			format: a => a ? "On" : "Off",
			onchange: a =>
			{
				settings.alarm.enabled = a, saveSettings(), configureAlarm(), drawFooter()
			}
		},
		"Repeat alarm each day?":
		{
			value: settings.alarm.repeat,
			format: a => a ? "Yes" : "No",
			onchange: a =>
			{
				settings.alarm.repeat = a, saveSettings(), console.log("Alarm repeats:", settings.alarm.repeat ? "Yes" : "No")
			}
		},
		Snooze:
		{
			value: 0 | settings.alarm.snooze,
			format: a => a ? a + " min" : "Off",
			min: 1,
			max: 30,
			step: 1,
			onchange: a =>
			{
				settings.alarm.snooze = a, saveSettings(), console.log("Alarm snooze:", settings.alarm.snooze)
			}
		}
	};
	settings.alarm.snoozeTime && (a["Cancel Snooze"] = function()
	{
		delete settings.alarm.snoozeTime, saveSettings(), configureAlarm(), drawFooter(), submenuSetAlarm()
	}), a["< Back"] = submenuMaintenance, E.showMenu(a)
};
let submenuMaintenance = () =>
{
	var a, b = {
		"Set date & time": function()
		{
			Pip.removeSubmenu(), submenuSetDateTime()
		},
		"Timezone (offset from UTC)":
		{
			value: settings.timezone || 0,
			min: -12,
			max: 14,
			step: 1,
			format: a => (a > 0 ? "+" + a : a) + (a == 1 || a == -1 ? " hr" : " hrs"),
			onchange: (b, c) =>
			{
				settings.timezone = b, E.setTimeZone(b), settings.alarm.time && (settings.alarm.time -= c * 36e5), drawFooter(), a && clearTimeout(a), a = setTimeout(function()
				{
					saveSettings()
				}, 5e3)
			}
		},
		"12/24 hour display":
		{
			value: !!settings.clock12hr,
			format: a => a ? "12 hr" : "24 hr",
			onchange: a =>
			{
				settings.clock12hr = a, drawFooter(), saveSettings(), console.log("12/24 hour display set to", settings.clock12hr ? "12 hr" : "24 hr")
			}
		},
		//AlarmPatchBegin_removeOldAlarm
		"Set alarm": function()
		{
			Pip.removeSubmenu(), submenuSetAlarm()
		},
		//AlarmPatchEnd_removeOldAlarm
		"Display timeout":
		{
			value: settings.idleTimeout ? Math.round(settings.idleTimeout / 6e4) : 31,
			min: 1,
			max: 31,
			step: 1,
			format: a => a < 31 ? a + " min" : "Never",
			onchange: b =>
			{
				settings.idleTimeout = b < 31 ? b * 6e4 : 0, a && clearTimeout(a), a = setTimeout(function()
				{
					saveSettings()
				}, 5e3)
			}
		},
		"Display brightness":
		{
			value: Pip.brightness,
			min: 1,
			max: 20,
			step: 1,
			onchange: a =>
			{
				Pip.brightness = a, Pip.updateBrightness()
			}
		},
		"Display color": function()
		{
			Pip.removeSubmenu(), submenuPalette()
		},
		//MaintenancePatchInsert_RAMScanToggle
		"Demo mode": enterDemoMode,
		About: function()
		{
			Pip.removeSubmenu(), submenuAbout()
		},
		Reboot: function()
		{
			clearWatch(), clearInterval(), E.showMessage("Rebooting..."), setTimeout(E.reboot, 2e3)
		}
	};
	getUserVideos().length && (b["Play videos"] = submenuVideos), getUserAudio().length && (b["Play audio files"] = submenuAudio), E.showMenu(b)
};
let drawHeader = b =>
{
	let a = 50;
	bH.clear(1).setFontMonofonto18().setFontAlign(-1, -1), bH.drawImage(dc(icons.cog), 1, 1), modes.forEach((c, d) =>
	{
		b == d + 1 && bH.drawPoly([0, 28, a - 10, 28, a - 10, 14, a - 5, 14]), bH.drawString(c, a, 7), a += c.length * 9, b == d + 1 && bH.drawPoly([a + 5, 14, a + 10, 14, a + 10, 28, 369, 28]), a += 24
	}), bH.drawImage(dc(icons.holotape), 345, 1);
	let c = MODEINFO[b];
	c.submenu && (a = 50, Object.keys(c.submenu).forEach((b, c) =>
	{
		bH.setColor(15 / (1 + Math.abs(c - sm0))).drawString(b, a, 34), a += bH.stringWidth(b) + 10
	})), bH.flip()
};
let drawFooter = () =>
{
	let a = Pip.getDateAndTime();
	let g = (a.getMonth() + 1).twoDigit();
	let h = a.getDate().twoDigit();
	let e = a.getHours();
	let i = settings.clock12hr ? ((e + 11) % 12 + 1).toString().padStart(2, " ") : e.twoDigit();
	let j = a.getMinutes().twoDigit();
	let k = a.getFullYear() + "-" + g + "-" + h + " " + i + ":" + j;
	bF.clear(1).setBgColor(1).setColor(3), bF.clearRect(0, 0, 148, 24).clearRect(152, 0, 238, 24).clearRect(242, 0, 371, 24), bF.setFontMonofonto16().setFontAlign(-1, -1).drawString(k, 10, 4), bF.drawRect(162, 5, 212, 19).fillRect(212, 9, 215, 15);
	let c = Pip.measurePin(VBAT_MEAS);
	let d = 3.5,
		f = 4.1;
	VUSB_PRESENT.read() ? (bF.drawImage(dc(icons.charging), 223, 4), CHARGE_STAT.read() == 0 && (d = 3.6, f = 4.2)) : c < 3.5 && (bF.drawString("!", 224, 4), c < 3.3 && Pip.sleeping === !1 && Pip.offOrSleep(
	{
		immediate: !1,
		forceOff: !0
	}));
	let b = (c - d) / (f - d) * 48;
	if (b < 1 && (b = 1), b > 48 && (b = 48), bF.setColor(2).fillRect(163, 6, 163 + b, 18).setColor(3), Pip.demoMode) bF.drawString("DEMO MODE", 252, 4);
	else if (settings.alarm.time)
	{
		let a = new Date(settings.alarm.time);
		let b = 0;
		bF.setColor(settings.alarm.enabled ? 3 : 2), settings.alarm.snoozeTime && (a = new Date(settings.alarm.snoozeTime), bF.drawImage(icons.snooze, 250, 3), b = 21), bF.drawString(a.getHours().twoDigit() + ":" + a.getMinutes().twoDigit(), 252 + b, 4), bF.drawImage(dc(settings.alarm.enabled ? icons.alarm : icons.noAlarm), 300 + b, 3)
	}
	bF.flip(), (Pip.radioOn || Pip.brightness < 20) && !Pip.audioIsPlaying() && Pip.audioStartVar(new Uint8Array(Pip.radioOn ? 4 : 2))
};
let mPrev = null;
let checkMode = () =>
{
	let b = MODE_SELECTOR.analog();
	let a = 1;
	if (b > .9 ? (pinMode(MEAS_ENB, "input"), pinMode(MEAS_ENB, "output"), MEAS_ENB.write(0), a = settings.fallbackMode) : b > .7 ? a = 5 : b > .5 ? a = 4 : b > .3 ? a = 3 : b > .1 && (a = 2), Pip.demoMode && (a = mPrev = Pip.demoMode), a == mPrev && a != Pip.mode)
	{
		Pip.kickIdleTimer(), sm0 = 0, Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, g.setBgColor(0).clearRect(BGRECT);
		let b = MODEINFO[a];
		if (b && b.submenu)
		{
			let a = Object.keys(b.submenu);
			b.submenu[a[sm0]]()
		}
		else b && b.fn && b.fn();
		Pip.mode == null ? drawFooter() : Pip.audioStart("UI/ROT_H_1.wav"), drawHeader(a), Pip.mode = a
	}
	mPrev = a;
	let c = Date();
	c.getMinutes() != d0 && (drawFooter(), d0 = c.getMinutes()), BTN_PLAY.read() && !Pip.HIDenabled ? (Pip.btnPlayPrev || (Pip.kickIdleTimer(), Pip.mode == MODE.RADIO ? radioPlayClip() : KNOB1_BTN.read() || (rd.enable(!Pip.radioOn), Pip.audioStart(Pip.radioOn ? "UI/RADIO_ON.wav" : "UI/RADIO_OFF.wav"))), Pip.btnPlayPrev = !0) : Pip.btnPlayPrev = !1, BTN_TUNEUP.read() ? (!Pip.btnUpPrev && Pip.radioOn && (Pip.kickIdleTimer(), Pip.audioStart("RADIO/TUNING.wav"), rd.seek(1)), Pip.btnUpPrev = !0) : Pip.btnUpPrev = !1, BTN_TUNEDOWN.read() ? (!Pip.btnDownPrev && Pip.radioOn && (Pip.kickIdleTimer(), Pip.audioStart("RADIO/TUNING.wav"), rd.seek(0)), Pip.btnDownPrev = !0) : Pip.btnDownPrev = !1
};
let createDateTimeSubmenu = (a, d, h, i) =>
{
	Pip["#onknob2_old"] = Pip["#onknob2"], delete Pip["#onknob2"], a.setSeconds(0);
	let b = d ? 0 : 3;
	let f = () =>
	{
		let b = a.getHours().twoDigit();
		let c = a.getMinutes().twoDigit();
		bC.reset().setFontMonofonto28().setFontAlign(-1, -1), d ? (bC.drawString(a.getFullYear(), 77, 83, !0), bC.drawString("-", 136, 83), bC.drawString((a.getMonth() + 1).twoDigit(), 153, 83, !0), bC.drawString("-", 184, 83), bC.drawString(a.getDate().twoDigit(), 201, 83, !0), bC.drawString(b, 249, 83, !0), bC.drawString(":", 280, 83), bC.drawString(c, 297, 83, !0)) : (bC.drawString(b, 162, 83, !0), bC.drawString(":", 193, 83), bC.drawString(c, 210, 83, !0))
	};
	let e = (f, g, h, i, a) =>
	{
		a == null && (a = 1);
		let b = f,
			c = f + h,
			d = g,
			e = g + i;
		while (a--) bC.drawRect(b, d, c, e), b++, c--, d++, e--
	};
	let c = c =>
	{
		c == null && (c = 3);
		let f;
		d ? f = [
			[73, 76, 64, 42, 2],
			[149, 76, 36, 42, 2],
			[197, 76, 36, 42, 2],
			[245, 76, 36, 42, 2],
			[293, 76, 36, 42, 2],
			[150, 145, 100, 33, 1]
		] : f = [
			[],
			[],
			[],
			[158, 76, 36, 42, 2],
			[206, 76, 36, 42, 2],
			[150, 145, 100, 33, 1]
		], bC.setColor(c);
		let a = f[b];
		b == 5 && (bC.setBgColor(1).clearRect(a[0], a[1], a[0] + a[2], a[1] + a[3]), bC.setFontMonofonto23().setFontAlign(0, -1), bC.drawString("SET", 200, 150).setBgColor(0)), e(a[0], a[1], a[2], a[3], a[4])
	};
	Pip.removeSubmenu = () =>
	{
		clearInterval(g), Pip.removeAllListeners("knob1"), Pip.removeAllListeners("knob2"), Pip["#onknob2"] = Pip["#onknob2_old"], delete Pip["#onknob2_old"]
	}, Pip.on("knob1", d =>
	{
		if (d)
		{
			switch (b)
			{
				case 0:
					a.setFullYear(a.getFullYear() + d);
					break;
				case 1:
					a.setMonth(a.getMonth() + d);
					break;
				case 2:
					a.setDate(a.getDate() + d);
					break;
				case 3:
					a.setHours(a.getHours() + d);
					break;
				case 4:
					a.setMinutes(a.getMinutes() + d);
					break
			}
			f()
		}
		else b >= 5 ? (Pip.audioStartVar(Pip.audioBuiltin("OK")), setTimeout(i, 700, a)) : (Pip.audioStartVar(Pip.audioBuiltin("NEXT")), c(0), b++, c());
		bC.flip()
	}), Pip.on("knob2", a =>
	{
		Pip.audioStartVar(Pip.audioBuiltin("COLUMN")), c(b == 5 ? .3 : 0), d ? b = (b + a + 6) % 6 : b = (b + a + 3) % 3 + 3, c(), bC.flip()
	}), bC.clear().setFontMonofonto28().setColor(2).setFontAlign(0, -1), bC.drawString(h, 200, 23), bC.setFontMonofonto23().setColor(1), bC.drawString("SET", 200, 150), bC.drawRect(150, 145, 250, 178), d ? e(48, 69, 306, 56, 3) : e(124, 69, 152, 56, 3), drawHeader(3), drawFooter(), f(), c(), bC.flip();
	let g = setInterval(function()
	{
		bC.flip()
	}, 50)
};
let submenuSetDateTime = () => createDateTimeSubmenu(Pip.getDateAndTime(), !0, "SET DATE & TIME", a =>
{
	Pip.setDateAndTime(a), showMainMenu()
});
let submenuSetAlarmTime = () =>
{
	var a = Pip.getDateAndTime();
	let b = 7,
		c = 0;
	if (settings.alarm.time)
	{
		var d = new Date(settings.alarm.time);
		b = d.getHours(), c = d.getMinutes()
	}
	return a.setHours(b), a.setMinutes(c), a.setSeconds(0), createDateTimeSubmenu(a, !1, "SET ALARM", a =>
	{
		settings.alarm.time = a.getTime(), delete settings.alarm.snoozeTime, settings.alarm.enabled = !0, drawFooter(), saveSettings(), configureAlarm(), submenuSetAlarm()
	})
};
let submenuPalette = () =>
{
	var a = {
		r: 0,
		g: 255,
		b: 0,
		scanline: 128,
		overscan: 128
	};
	let j = () =>
	{
		setTimeout(function()
		{
			Pip.removeSubmenu(), submenuMaintenance()
		}, 200)
	};
	var k = 10,
		l = 27,
		b = [
		{
			n: "Red",
			id: "r"
		},
		{
			n: "Green",
			id: "g"
		},
		{
			n: "Blue",
			id: "b"
		},
		{
			n: "Set to default (green)",
			fn: () => e(0, 255, 0)
		},
		{
			n: "Set to amber",
			fn: () => e(255, 112, 0)
		},
		{
			n: "Set to white",
			fn: () => e(255, 255, 255)
		},
		{
			n: "< Back",
			fn: j
		}];
	b.forEach((a, b) => a.y = k + b * l);
	var c = 0;
	pal = [new Uint16Array(16), new Uint16Array(16), new Uint16Array(16), new Uint16Array(16)];
	let m = (b, d, e) =>
	{
		var c = 170 + Math.round(d * 170 / 256),
			a = b.y;
		bC.reset().setFontMonofonto18().setFontAlign(-1, -1), e && bC.setBgColor(3).setColor(0).clearRect(10, a, 380, a + 27), bC.drawString(b.n, 30, a + 4), b.id && (bC.fillRect(170, a + 5, 350, a + 6).fillRect(170, a + 21, 350, a + 22).fillRect(c, a + 7, c + 10, a + 20), bC.fillPolyAA([160, 13 + a, 170, 5 + a, 170, 22 + a]).fillPoly([360, 13 + a, 350, 5 + a, 350, 22 + a]))
	};
	let d = () =>
	{
		bC.clear(1), b.forEach((b, d) => m(b, a[b.id], d == c))
	};
	let e = (b, c, d) =>
	{
		a.r = b, a.g = c, a.b = d, f()
	};
	let f = () =>
	{
		const f = a.r / 255;
		const h = a.g / 255;
		const i = a.b / 255;
		const d = 1 - a.scanline / 255;
		const e = a.overscan / 1275;
		for (var b = 0; b < 16; b++)
		{
			var c = Math.max(0, (b - 12) / 30);
			pal[0][b] = g.toColor(c + f * b / 15, c + h * b / 15, c + i * b / 15), pal[1][b] = g.toColor(c + d * f * b / 15, c + d * h * b / 15, c + d * i * b / 15), pal[2][b] = g.toColor(c + (e + f) * b / 15, c + (e + h) * b / 15, c + (e + i) * b / 15), pal[3][b] = g.toColor(c + (e + d * f) * b / 15, c + (e + d * h) * b / 15, c + (e + d * i) * b / 15)
		}
		Pip.setPalette(pal)
	};
	Pip.removeSubmenu = () =>
	{
		settings.color = a, settings.palette = pal.map(a => btoa(a.buffer)).join(","), saveSettings(), clearInterval(n), Pip.removeListener("knob1", h), Pip.removeListener("knob2", i)
	};
	let h = a =>
	{
		E.stopEventPropagation(), Pip.knob1Click(a), a ? c = (c + b.length - a) % b.length : b[c].fn && b[c].fn(), d(), bC.flip()
	};
	Pip.prependListener("knob1", h);
	let i = g =>
	{
		E.stopEventPropagation();
		var e = b[c];
		e.id && (a[e.id] = E.clip(a[e.id] + g * 16, 0, 255), f(), Pip.knob2Click(g), d(), bC.flip())
	};
	Pip.prependListener("knob2", i), settings.color && (a.r = 0 | E.clip(settings.color.r, 0, 255), a.g = 0 | E.clip(settings.color.g, 0, 255), a.b = 0 | E.clip(settings.color.b, 0, 255), a.scanline = 0 | E.clip(settings.color.scanline, 0, 255), a.overscan = 0 | E.clip(settings.color.overscan, 0, 255), f()), d(), bC.flip();
	let n = setInterval(function()
	{
		bH.flip(), bC.flip(), bF.flip()
	}, 50)
};
/*KPSSRenamePatchBegin_ShowMenuRewrite*/
E.showMenu = function(g)
{
	function i(a)
	{
		a ? c.move(-a) : c.select()
	}
	var b = bC;
	b.clear(1);
	var a = g[''],
		d = Object.keys(g);
	a && (d.splice(d.indexOf(''), 1), a.back && (g["< Back"] = a.back, d.unshift("< Back"))), a instanceof Object || (a = {}), a.selected === undefined && (a.selected = 0), a.rowHeight = 27;
	var h = 10,
		f = a.x2 || b.getWidth() - 20,
		e = 12,
		j = b.getHeight() - 1;
	a.title && (e += a.rowHeight + 2);
	var c = {
		draw: function()
		{
			b.reset().setFontMonofonto18(), a.predraw && a.predraw(b), b.setFontAlign(0, -1), a.title && (b.drawString(a.title, (h + f) / 2, e - a.rowHeight), b.drawLine(h, e - 2, f, e - 2));
			var o = 0 | Math.min((j - e) / a.rowHeight, d.length),
				k = E.clip(a.selected - (o >> 1), 0, d.length - o),
				i = e,
				s = k > 0;
			b.setColor(k > 0 ? 3 : 0).fillPoly([190, 10, 210, 10, 200, 0]);
			while (o--)
			{
				var q = d[k],
					l = g[q],
					r = k == a.selected && !c.selectEdit;
				if (b.setBgColor(r ? 3 : 0).clearRect(h, i, f, i + a.rowHeight - 1), b.setColor(r ? 0 : 3).setFontAlign(-1, -1).drawString(q, h + 20, i + 4), "o" == (typeof l)[0])
				{
					var m = f,
						n = l.value;
					if (l.format && (n = l.format(n)), c.selectEdit && k == a.selected)
					{
						var p = a.rowHeight > 10 ? 2 : 1;
						m -= 12 * p + 1, b.setBgColor(3).clearRect(m - (b.stringWidth(n) + 4), i, f, i + a.rowHeight - 1), b.setColor(0).drawImage(
						{
							width: 12,
							height: 5,
							buffer: " \x07\0\xF9\xF0\x0E\0@",
							transparent: 0
						}, m, i + (a.rowHeight - 5 * p) / 2,
						{
							scale: p
						})
					}
					b.setFontAlign(1, -1).drawString(n.toString(), m - 2, i + 4)
				}
				i += a.rowHeight, k++
			}
			b.setColor(k < d.length ? 3 : 0).fillPoly([191, 201, 210, 201, 200, 210]), b.setColor(3).setBgColor(0).setFontAlign(-1, -1).flip()
		},
		select: function()
		{
			var b = g[d[a.selected]];
			Pip.audioStartVar(Pip.audioBuiltin("OK")), "f" == (typeof b)[0] ? b(c) : "o" == (typeof b)[0] && ("n" == (typeof b.value)[0] ? c.selectEdit = c.selectEdit ? undefined : b : ("b" == (typeof b.value)[0] && (b.value = !b.value), b.onchange && b.onchange(b.value)), c.draw())
		},
		move: function(e)
		{
			if (c.selectEdit)
			{
				var b = c.selectEdit;
				let a = b.value;
				b.value -= (e || 1) * (b.step || 1), b.min !== undefined && b.value < b.min && (b.value = b.wrap ? b.max : b.min), b.max !== undefined && b.value > b.max && (b.value = b.wrap ? b.min : b.max), b.onchange && b.value != a && b.onchange(b.value, -e)
			}
			else
			{
				let b = a.selected;
				a.wrapSelection ? a.selected = (e + a.selected + d.length) % d.length : a.selected = E.clip(a.selected + e, 0, d.length - 1), b != a.selected && !Pip.radioKPSS && Pip.knob1Click(e)
			}
			c.draw()
		}
	};
	return Pip.removeSubmenu && Pip.removeSubmenu(), c.draw(), Pip.on("knob1", i), Pip.removeSubmenu = () =>
	{
		Pip.removeListener("knob1", i)
	}, c
}/*KPSSRenamePatchEnd_ShowMenuRewrite*/, E.showPrompt = function(e, a)
{
	function c()
	{
		g.setColor(a.color);
		var f = g.getWidth(),
			n = g.getHeight(),
			k = a.title;
		k && g.setFontMonofonto23().setFontAlign(0, -1, 0).setBgColor(a.color).drawString(k, f / 2, 42).setBgColor(0), g.setFontMonofonto18().setFontAlign(0, 0, 0);
		var i = e.split("\n"),
			l = 125 - i.length * 20 / 2;
		a.clearBg && g.clearRect((f - i[0].length * 8) / 2 - 20, l - 20, (f + i[0].length * 8) / 2 + 20, 175 + b.length * 20), i.forEach((a, b) => g.drawString(a, f / 2, l + b * 20));
		var h, c, j, m;
		h = f / 2, c = 175 - (b.length - 1) * 20, b.forEach((b, e) =>
		{
			b = b, j = 50, m = [h - j - 4, c - 13, h + j + 4, c - 13, h + j + 4, c + 13, h - j - 4, c + 13], g.setColor(e == a.selected ? d : 0).fillPoly(m).setColor(a.color).drawPoly(m, 1).setFontMonofonto18().drawString(b, h, c + 1), c += 36
		}), g.setFontAlign(-1, -1)
	}
	var d = g.blendColor(g.theme.bg, g.theme.fg, .5);
	a || (a = {}), a.buttons || (a.buttons = {
		Yes: !0,
		No: !1
	});
	var b = Object.keys(a.buttons);
	return a.selected || (a.selected = 0), a.color === undefined && (a.color = g.theme.fg), a.clearBg || (a.clearBg = !0), c(), new Promise(f =>
	{
		let d = !0;

		function e(g)
		{
			g ? d ? (a.selected -= g, a.selected < 0 && (a.selected = 0), a.selected >= b.length && (a.selected = b.length - 1), c(), d = !1) : d = !0 : (Pip.removeListener("knob1", e), f(a.buttons[b[a.selected]]))
		}
		Pip.on("knob1", e), Pip.removeSubmenu = () =>
		{
			Pip.removeListener("knob1", e)
		}
	})
}, E.showMessage = function(a)
{
	g.clear(1), bC.clear(1).setColor(3).setFontMonofonto23().setFontAlign(0, 0), drawVaultTecLogo(200, 48 - 12 * a.split("\n").length, bC), bC.drawString(a, 200, 156).flip()
}, MODEINFO = [0,
{
	name: "STAT",
	submenu:
	{
		STATUS: submenuStatus,
		//SpecialPatchInsert_Menu
		//PerksPatchInsert_Menu
		//SpecialPerksComboBegin_StatMenuItems
		CONNECT: submenuConnect,
		DIAGNOSTICS: submenuDiagnostics
		//SpecialPerksComboEnd_StatMenuItems
	}
},
{
	name: "INV",
	submenu:
	{
		//InvPatchInsert_Menu
		ATTACHMENTS: submenuInvAttach,
		APPAREL: submenuApparel,
		APPS: submenuApps,
		AID: showVaultAssignment
	}
},
{
	name: "DATA",
	submenu:
	{
		CLOCK: submenuClock,
		STATS: submenuStats,
		//AlarmPatchInsert_Menu
		MAINTENANCE: submenuMaintenance
	}
},
{
	name: "MAP",
	fn: submenuMap
},
{
	name: "RADIO",
	fn: submenuRadio
}], getUserApps().length || delete MODEINFO[2].submenu.APPS, Pip.setPalette && settings.palette && Pip.setPalette(settings.palette.split(",").map(a => new Uint16Array(E.toArrayBuffer(atob(a))))), checkBatteryAndSleep() || (KNOB1_BTN.read() && BTN_POWER.read() ? (log("Entering factory test mode"), factoryTestMode()) : Pip.isSDCardInserted() ? (Pip.addWatches(),/*MaintenancePatchInsert_RAMScanCheck*/ KNOB1_BTN.read() ? (log("Booting into demo mode"), enterDemoMode()) : settings.longPressToWake ? (log("Playing boot animation"), settings.longPressToWake = !1, saveSettings(), playBootAnimation()) : (Pip.sleeping = "BUSY", Pip.fadeOn(), fs.statSync("BOOT") ? (log("Normal boot - showing main menu"), setTimeout(a =>
{
	Pip.fadeOff().then(a =>
	{
		Pip.audioStart("BOOT/BOOT_DONE.wav"), Pip.sleeping = !1, showMainMenu(), Pip.fadeOn()
	})
}, 2e3)) : (log("*** NO BOOT DIRECTORY ***"), g.drawString("NO BOOT DIRECTORY", 240, 179, 1), Pip.sleeping = !1))) : (Pip.fadeOn(), setWatch(Pip.off, BTN_POWER,
{
	edge: "falling"
})))