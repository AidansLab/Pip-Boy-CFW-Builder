//1.32
//MaintenancePatchInsert_RAMScan	  
function log(a, b) {
    let c;
    b || (b = 'exceptions.log');
    try {
        c = fs.statSync('LOGS')
    } catch (b) {
        a || (a = 'SD CARD ERROR')
    }
    console.log(a), c && c.dir ? fs.appendFile('LOGS/' + b, `${ new Date().toISOString() } ${ a }\n`) : require('Storage').open(b, 'a').write(`${ new Date().toISOString() } ${ a }\n`)
}
function saveSettings() {
    if (!Pip.isSDCardInserted())
        throw new Error("Can't save settings - no SD card");
    fs.writeFile('settings.json', JSON.stringify(settings))
}
function configureAlarm() {
    if (alarmTimeout && (console.log('Cancelling existing alarm'), clearTimeout(alarmTimeout)), alarmTimeout = undefined, settings.alarm.enabled && settings.alarm.time && !Pip.demoMode) {
        let b = Pip.getDateAndTime();
        let a = new Date(settings.alarm.time);
        settings.alarm.snoozeTime && (a = new Date(settings.alarm.snoozeTime)), a.getTime() <= b.getTime() && (console.log(`Alarm time (${ a }) is in the past, setting to tomorrow`), a = Pip.getDateAndTime(), a.setDate(b.getDate() + 1), a.setHours(new Date(settings.alarm.time).getHours()), a.setMinutes(new Date(settings.alarm.time).getMinutes()), delete settings.alarm.snoozeTime), settings.alarm.snoozeTime || (settings.alarm.time = a.getTime()), alarmTimeout = setTimeout(function a() {
            if (Pip.sleeping == 'BUSY')
                return setTimeout(a, 1e4);
            settings.alarm.repeat || (settings.alarm.enabled = !1);
            let b = Pip.sleeping;
            b ? wakeFromSleep(showAlarm) : showAlarm(), console.log('ALARM!')
        }, a.getTime() - b.getTime()), console.log(`Alarm set to ${ a } (${ ((a.getTime() - b.getTime()) / 60 / 6e4).toFixed(3) } hours away)`)
    }
}
function wakeOnLongPress() {
    if (BTN_POWER.read()) {
        let a = setWatch(a => {
            clearTimeout(b)
        }, BTN_POWER, { edge: 'falling' });
        let b = setTimeout(b => {
            clearWatch(a), settings.longPressToWake = !1, saveSettings(), wakeFromSleep(playBootAnimation)
        }, 2e3)
    }
}
function showLoginScreen() {
    function e(e) {
        c = 0, e ? (a = (a + e + 10) % 10, d(), Pip.knob1Click(e)) : (d(), Pip.audioStartVar(Pip.audioBuiltin('OK')), b += a.toString(), b.length == 4 && (b == settings.overseerPin || settings.overseerPin == undefined ? (Pip.remove(), bC.setColor(3).setBgColor(0).setFontAlign(0, -1).drawString('Login successful', 199, 170).flip(), Pip.audioStart('UI/ALERT.wav'), setTimeout(a => showMainMenu(), 1e3)) : (bC.setColor(3).setBgColor(0).drawString('Incorrect login', 199, 170), bC.setColor(0).setBgColor(3).clearRect(164, 128, 310, 156), Pip.audioStart('UI/BURST.wav'), b = '', a = 0, setTimeout(a => bC.fillRect(50, 170, 350, 190), 2e3))))
    }
    g.clear(), bC.clear(1).setColor(3), drawVaultTecLogo(199, 15, bC, !0), bC.setFontMonofonto28().setFontAlign(0, -1).drawString('Welcome OVERSEER', 199, 80), bC.setColor(0).setBgColor(3).clearRect(88, 128, 156, 156).clearRect(164, 128, 310, 156), bC.setFontMonofonto18().drawString('LOGIN', 122, 133);
    let a = 0;
    let b = '';
    let c = 0;
    let f = '';
    let d = function () {
        let d = 175 + b.length * 12;
        c == 0 ? (f = a.toString(), bC.drawString(a, d + 4, 133, !0)) : c == 10 && bC.fillRect(d, 133, d + 8, 151), c = (c + 1) % 20, bC.flip()
    };
    let h = setInterval(d, 50);
    Pip.on('knob1', e), Pip.remove = function () {
        Pip.removeListener('knob1', e), clearInterval(h)
    }
}
function playBootAnimation(b) {
    console.log('Playing boot animation');
    let a = null;
    return b === undefined && (b = !0), Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), Pip.videoStart('BOOT/BOOT.avi', { x: 40 }), Pip.fadeOn(), new Promise((e, f) => {
        let c = () => {
            Pip.removeListener('videoStopped', c), Pip.audioStart('BOOT/BOOT_DONE.wav'), b && (a = setTimeout(a => {
                Pip.fadeOff().then(a => {
                    settings.overseer ? showLoginScreen() : showMainMenu(), setTimeout(a => Pip.fadeOn([LCD_BL]), 200)
                })
            }, 2e3)), e()
        };
        let d = () => {
            Pip.removeListener('videoStopped', d), g.clear(1).drawPoly([
                90,
                45,
                90,
                35,
                390,
                35,
                390,
                45
            ]).drawPoly([
                90,
                275,
                90,
                285,
                390,
                285,
                390,
                275
            ]);
            let a = settings.userName ? `Pip-Boy assigned to ${ settings.userName }` : 'Success!';
            g.setFontMonofonto18().setFontAlign(0, -1).drawString(a, 240, 250), Pip.videoStart('UI/THUMBUP.avi', {
                x: 160,
                y: 55
            }), Pip.on('videoStopped', c)
        };
        Pip.on('videoStopped', d), Pip.remove = function () {
            Pip.removeAllListeners('videoStopped'), a && clearTimeout(a)
        }
    })
}
function checkBatteryAndSleep() {
    let a = Pip.measurePin(VBAT_MEAS);
    if (VUSB_PRESENT.read())
        return !1;
    if (a < 3.2)
        return log(`Battery voltage too low (${ a.toFixed(2) } V) - shutting down immediately`), clearInterval(), clearWatch(), Pip.sleeping = !0, setTimeout(Pip.off, 100), !0;
    else if (a < 3.5) {
        log(`Battery voltage too low (${ a.toFixed(2) } V) - showing battery warning then shutting down`), Pip.sleeping && Pip.wake(), clearInterval(), clearWatch();
        let b = 240, c = 160;
        return g.clear(1).fillRect(b - 60, c - 20, b + 60, c - 18).fillRect(b - 60, c + 18, b + 60, c + 20).fillRect(b - 60, c - 18, b - 58, c + 18).fillRect(b + 58, c - 18, b + 60, c + 18).fillRect(b + 60, c - 6, b + 68, c + 6).setColor(g.blendColor(g.theme.bg, g.theme.fg, .5)).fillRect(b - 54, c - 14, b - 48, c + 14), setTimeout(() => LCD_BL.set(), 150), Pip.sleeping = !0, setTimeout(Pip.off, 2e3), !0
    } else
        return !1
}
function wakeFromSleep(a) {
    Pip.sleeping = 'BUSY', Pip.wake(), Pip.brightness < 10 && (Pip.brightness = 20), Pip.mode == MODE.TEST && (Pip.mode = null), Pip.addWatches(), setTimeout(c => {
        let b = [
            LCD_BL,
            LED_RED,
            LED_GREEN
        ];
        rd.setupI2C(), a(), Pip.fadeOn(b).then(a => {
            Pip.sleeping = !1
        })
    }, 100)
}
function submenuBlank(a) {
    return function () {
        bC.clear(1).setFontMonofonto23(), bC.setFontAlign(0, 0).drawString(a, bC.getWidth() / 2, bC.getHeight() / 2), bC.flip(), Pip.removeSubmenu = function () {
        }
    }
}
function showMainMenu(b) {
    if (Pip.remove && Pip.remove(), process.env.VERSION < MIN_FW_VER) {
        log('Running firmware version ' + process.env.VERSION + ' but minimum is ' + MIN_FW_VER), E.showMessage('Please upgrade firmware binary\n\nRunning: ' + process.env.VERSION + '\nMinimum required: ' + MIN_FW_VER);
        return
    }
    Pip.mode = null, d0 = null, MEAS_ENB.write(0);
    var a = setInterval(checkMode, 50);
    Pip.on('knob2', b => {
        let a = MODEINFO[Pip.mode];
        if (a && a.submenu) {
            let c = Object.keys(a.submenu);
            sm0 = (sm0 + c.length + b) % c.length, drawHeader(Pip.mode), Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, g.clearRect(BGRECT), a.submenu[c[sm0]](), Pip.knob2Click(b)
        }
    }), Pip.on('torch', torchButtonHandler), Pip.remove = () => {
        Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.removeAllListeners('knob2'), MEAS_ENB.write(1), clearInterval(a), Pip.removeAllListeners('torch')
    }, Pip.radioOn && setTimeout(a => {
        !(Pip.sleeping || rd.isOn()) && (rd.enable(!0), Pip.mode == MODE.RADIO) && (Pip.audioStart('UI/RADIO_ON.wav'), Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuRadio())
    }, 2e3), settings.alarm.snoozeTime && Pip.on('knob1', a => {
        a == 0 && settings.alarm.snoozeTime && (E.stopEventPropagation(), delete settings.alarm.snoozeTime, saveSettings(), Pip.audioStop(), configureAlarm(), clearInterval(), Pip.videoStop(), bH.clear().flip(), bC.clear(1), bC.setFontMonofonto36().setFontAlign(0, 0), bC.drawString('SNOOZE CANCELED', 200, 100).flip(), drawFooter(), setTimeout(showMainMenu, 3e3))
    })
}
function enterDemoMode() {
    function step() {
        Pip.demoTimeout = undefined;
        var timeToNext = SEQ[s][0], cmd = SEQ[s][1];
        try {
            print('Running:', cmd), eval(cmd)
        } catch (a) {
            print(a)
        }
        s++, s >= SEQ.length && (s = 0, console.log('Loop demo, used', process.memory().usage, 'vars')), Pip.demoTimeout = setTimeout(step, timeToNext)
    }
    Pip.remove && Pip.remove(), delete Pip.remove, clearWatch(), setWatch(function () {
        E.reboot()
    }, BTN_POWER, {
        debounce: 50,
        edge: 'rising',
        repeat: !0
    }), settings.idleTimeout = 0, Pip.kickIdleTimer();
    var SEQ = [
            [
                14e3,
                'playBootAnimation(0);'
            ],
            [
                2e3,
                'showMainMenu(); Pip.demoMode = MODE.STAT;'
            ],
            [
                200,
                "Pip.emit('knob1',20)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                2e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                6e3,
                "Pip.emit('knob2',1)"
            ],
            [
                3e3,
                "Pip.emit('knob2',1)"
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                2e3,
                'Pip.demoMode = MODE.INV;'
            ],
            [
                2e3,
                "Pip.emit('knob1',0)"
            ],
            [
                4e3,
                "Pip.emit('knob1',-20)"
            ],
            [
                4e3,
                "Pip.emit('knob1',15)"
            ],
            [
                2e3,
                "Pip.emit('knob1',0)"
            ],
            [
                2e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                2e3,
                "Pip.emit('knob1',0)"
            ],
            [
                2e3,
                "Pip.emit('knob1',0)"
            ],
            [
                2e3,
                "Pip.emit('knob2',1)"
            ],
            [
                6e3,
                "Pip.emit('knob2',1)"
            ],
            [
                5e3,
                'Pip.demoMode = MODE.DATA;'
            ],
            [
                5e3,
                "Pip.emit('knob2',1)"
            ],
            [
                5e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                5e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                5e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                5e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                3e3,
                'Pip.demoMode = MODE.MAP;'
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                3e3,
                "Pip.emit('knob1',-1)"
            ],
            [
                1e3,
                'Pip.demoMode = MODE.RADIO;'
            ],
            [
                1e3,
                "Pip.emit('knob1',-1)"
            ]
        ], s = 0;
    step()
}
function leaveDemoMode() {
    Pip.demoTimeout && (clearTimeout(Pip.demoTimeout), Pip.demoTimeout = undefined), clearWatch(), Pip.demoMode = 0, Pip.addWatches()
}
function factoryTestMode() {
    function e() {
        if (b && ftm.currentTest < ftm.tests.length) {
            Pip.removeSubmenu && Pip.removeSubmenu();
            let a = ftm.tests[ftm.currentTest];
            a.testTime = Date().toLocalISOString();
            let b = getTime();
            a.fn ? a.fn(a).then(c => {
                a.testDuration = Math.round(getTime() - b), a.pass = c, ftm.currentTest++, h(), e()
            }) : (ftm.currentTest++, e())
        } else
            b = !1, ftm.currentTest = null, d()
    }
    function i(c) {
        console.log('Testing inputs'), Pip.remove && Pip.remove(), clearWatch(), c.inputs = [
            {
                pin: MODE_SELECTOR,
                name: 'Mode'
            },
            {
                pin: BTN_POWER,
                name: 'Power'
            },
            {
                pin: BTN_TORCH,
                name: 'Flashlight'
            },
            {
                pin: BTN_PLAY,
                name: 'Play'
            },
            {
                pin: BTN_TUNEUP,
                name: 'Tune Up'
            },
            {
                pin: BTN_TUNEDOWN,
                name: 'Tune Down'
            },
            {
                pin: KNOB1_A,
                name: 'Knob A'
            },
            {
                pin: KNOB1_B,
                name: 'Knob B'
            },
            {
                pin: KNOB1_BTN,
                name: 'Knob Press'
            },
            {
                pin: KNOB2_A,
                name: 'Thumbwheel A'
            },
            {
                pin: KNOB2_B,
                name: 'Thumbwheel B'
            }
        ];
        const e = [
            .25,
            .75
        ];
        const d = [
            .1,
            .3,
            .5,
            .7,
            .9
        ];
        return c.inputLevels = new Array(c.inputs.length), c.inputPassed = new Array(c.inputs.length).fill(!1), g.setFontMonofonto18().clearRect(0, 56, 479, 319).setColor('#00C000').drawString('Input test: press buttons & turn knobs', a, 56), c.inputs.forEach((f, b) => {
            g.setColor('#008000').drawString(`${ f.name.padStart(12, ' ') }:`, a, 80 + b * 20, !0), g.setColor('#003300').fillRect(a + 126, 80 + b * 20, a + 216, 97 + b * 20), b == 0 ? (d.forEach(c => {
                g.clearRect(a + 131 + c * 80, 80 + b * 20, a + 131 + c * 80, 97 + b * 20)
            }), g.clearRect(a + 131 + d[4] * 80, 80 + b * 20, a + 216, 97 + b * 20), c.inputLevels[b] = new Array(d.length).fill(!1)) : (e.forEach(c => {
                g.clearRect(a + 131 + c * 80, 80 + b * 20, a + 131 + c * 80, 97 + b * 20)
            }), c.inputLevels[b] = new Array(2).fill(!1)), f.pin.getInfo().analog ? f.pin.mode('analog') : (f.pin.mode('input'), f.pin.mode('input_pullup'))
        }), new Promise((h, j) => {
            function i(a) {
                a || (Pip.removeListener('knob1', i), h(!0))
            }
            let f = setInterval(function () {
                c.inputs.forEach((l, k) => {
                    let j;
                    c.inputPassed[k] || (l.pin.getInfo().analog ? j = l.pin.analog() : j = l.pin.read() ? 1 : 0, k == 0 ? d.forEach((b, a) => {
                        j > (a == 0 ? 0 : d[a - 1]) && j < b && (c.inputLevels[k][a] = j)
                    }) : j < e[0] ? c.inputLevels[k][0] = j : j > e[1] && (c.inputLevels[k][1] = j), g.setColor(0, 1, 0).fillRect(a + 129 + j * 80, 80 + k * 20, a + 133 + j * 80, 97 + k * 20), c.inputLevels[k].includes(!1) || (g.drawString('OK', a + 230, 80 + k * 20), c.inputPassed[k] = !0, l.pin.mode('input'), c.inputPassed.includes(!1) || (clearInterval(f), g.setColor(0, 1, 0).drawString('Input test: PASS - press knob to continue', a, 56, !0), Pip.addWatches(), b ? h(!0) : Pip.on('knob1', i))))
                })
            }, 50);
            Pip.remove = () => {
                clearInterval(f)
            }
        })
    }
    function j(c) {
        console.log('Testing LEDs'), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor('#00C000').drawString('LED test', a, 56);
        let e = [
            LED_RED,
            LED_GREEN,
            LED_BLUE,
            LED_TUNING
        ];
        let d = 0;
        let f = setInterval(function () {
            e.forEach((a, b) => {
                a.write(d == b ? 1 : 0)
            }), d = (d + 1) % 4
        }, 500);
        return Pip.remove = () => {
            clearInterval(f), e.forEach(a => a.write(0))
        }, new Promise((a, d) => {
            setTimeout(() => {
                E.showPrompt('Red, green, blue & white\nLEDs all OK?').then(d => {
                    if (d) {
                        c.LEDsOK = !0, console.log('LED test passed - checking pixels'), Pip.remove(), g.setColor(.2, 1, .2).fillRect(0, 0, 479, 319);
                        function d(e) {
                            Pip.removeListener('knob1', d), E.showPrompt('All pixels look OK?').then(d => {
                                g.clearRect(0, 0, 479, 319), d ? (c.pixelsOK = !0, console.log('Pixel test passed'), a(!0)) : (c.pixelsOK = !1, console.log('Pixel test failed'), b = !1, a(!1))
                            })
                        }
                        Pip.on('knob1', d)
                    } else
                        c.LEDsOK = !1, console.log('LED test failed'), b = !1, a(!1)
                })
            }, 2e3)
        })
    }
    function k(c) {
        console.log('Testing measurements'), Pip.remove && Pip.remove(), c.meas = [
            {
                pin: RADIO_AUDIO,
                name: 'FM radio',
                divider: 1,
                min: .7,
                max: 1.1,
                offMax: .3
            },
            {
                pin: VUSB_MEAS,
                name: 'USB supply',
                divider: 2,
                min: 4,
                max: 5.6,
                offMax: .3
            },
            {
                pin: VBAT_MEAS,
                name: 'Battery',
                divider: 2,
                min: 3.5,
                max: 4.4
            },
            {
                pin: CHARGE_STAT,
                name: 'CHRG status',
                divider: 1,
                min: 2.7,
                max: 4,
                offMax: .3
            },
            {
                name: 'VDD',
                min: 3.2,
                max: 3.5
            },
            {
                name: 'Temperature',
                min: 15,
                max: 50
            }
        ], c.measLevel = new Array(c.meas.length), c.measOff = new Array(c.meas.length), c.measPassed = new Array(c.meas.length).fill(null), lastValue = new Array(c.meas.length), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor('#00C000').drawString('Measurements test', a, 56);
        let d = (j, h, b, d, c) => {
            c == null && (c = 3), d == null && (d = '#00FF00');
            let e = b.offMax ? 0 : b.min - (b.max - b.min) * .1;
            let i = b.max + (b.max - b.min) * .1;
            let f = a + 131 + (j - e) / (i - e) * 80;
            g.setColor(d).fillRect(f - c / 2, h, f + c / 2, h + 17)
        };
        c.meas.forEach((b, c) => {
            g.setColor('#008000').drawString(`${ b.name.padStart(12, ' ') }:`, a, 85 + c * 25, !0), g.setColor('#003300').fillRect(a + 126, 85 + c * 25, a + 216, 102 + c * 25), d(b.min, 85 + c * 25, b, 0, 1), d(b.max, 85 + c * 25, b, 0, 1), b.offMax && d(b.offMax, 85 + c * 25, b, 0, 1), b.pin && b.pin.mode('analog')
        });
        let e = !1;
        return new Promise((j, k) => {
            function i(a) {
                a || (clearInterval(h), Pip.removeListener('knob1', i), rd.enable(0), e || (b = !1), j(e))
            }
            Pip.on('knob1', i);
            let f = 0;
            let h = setInterval(function () {
                if (++f == 5 && rd.enable(1), (f < 5 || f > 6) && c.meas.forEach((f, b) => {
                        let e;
                        let h = 'V';
                        let i = 2;
                        if (f.name == 'VDD') {
                            e = 0;
                            for (let a = 0; a < 20; a++)
                                e += E.getAnalogVRef() / 20
                        } else if (f.name == 'Temperature') {
                            e = 0;
                            for (let a = 0; a < 20; a++)
                                e += E.getTemperature() / 20;
                            h = 'C', i = 1
                        } else
                            e = Pip.measurePin(f.pin, 100, f.divider);
                        g.setColor('#00FF00').setFontMonofonto18().drawString(`${ e.toFixed(i) } ${ h }  `, a + 230, 85 + b * 25, !0), lastValue[b] && d(lastValue[b], 85 + b * 25, f, '#006600'), d(e, 85 + b * 25, f), lastValue[b] = e, f.offMax && e < f.offMax && (c.measOff[b] = e), e >= f.min && e <= f.max && (c.measLevel[b] = e), c.measLevel[b] && (c.measOff[b] || !f.offMax) ? (c.measPassed[b] = !0, g.drawString('OK  ', a + 310, 85 + b * 25, !0)) : f.offMax || g.setColor('#FF2200').drawString('FAIL', a + 310, 85 + b * 25, !0).setColor('#00FF00')
                    }), !(c.measPassed.includes(!1) || c.measPassed.includes(null) || e))
                    e = !0, b ? (clearInterval(h), Pip.removeListener('knob1', i), rd.enable(0), j(!0)) : g.setColor(0, 1, 0).drawString('Measurement test: PASS - press knob', a, 56, !0);
                else {
                    let b = c.meas.findIndex(a => a.pin == VUSB_MEAS);
                    let d = '                               ';
                    c.measLevel[b] ? c.measOff[b] ? (b = c.meas.findIndex(a => a.pin == CHARGE_STAT), c.measOff[b] || (d = 'Re-connect charging cable')) : d = 'Disconnect charging cable' : d = 'Connect charging cable', g.drawString(d, a, 260, !0)
                }
            }, 50);
            Pip.remove = () => {
                clearInterval(h)
            }
        })
    }
    function l(d) {
        if (console.log('Testing SD card'), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor('#00C000').drawString('SD card test', a, 56), !Pip.isSDCardInserted())
            return new Promise((a, c) => {
                E.showPrompt('No SD card inserted!', { buttons: { OK: !0 } }).then(c => {
                    b = !1, a(!1)
                })
            });
        else {
            const e = fs.getFree();
            const h = (e.freeSectors * e.sectorSize / 1e6).toFixed(0);
            const i = (e.totalSectors * e.sectorSize / 1e6).toFixed(0);
            const m = `${ h }/${ i } MB free`;
            let f, j;
            d.sdInfo = [
                {
                    name: 'Size',
                    value: i,
                    units: 'MB',
                    min: 240,
                    max: 64e3
                },
                {
                    name: 'Used',
                    value: i - h,
                    units: 'MB',
                    min: 10,
                    max: 200
                },
                {
                    name: 'Free',
                    value: h,
                    units: 'MB',
                    min: 20,
                    max: 64e3
                },
                {
                    name: 'Files',
                    value: 'Counting',
                    units: '',
                    min: 50,
                    max: 1e4
                },
                {
                    name: 'Write speed',
                    value: null,
                    units: 'kB/s',
                    min: 50,
                    max: 1e4
                },
                {
                    name: 'Read speed',
                    value: null,
                    units: 'kB/s',
                    min: 200,
                    max: 1e4
                },
                {
                    name: 'Integrity',
                    value: 'Checking',
                    units: ''
                }
            ];
            let k = !0;
            let l;
            return d.sdInfo.forEach((b, d) => {
                if (g.setColor('#008000').drawString(`${ b.name.padStart(12, ' ') }:`, a, 85 + d * 25, !0), b.value == null) {
                    if (g.setColor('#003300').fillRect(a + 126, 85 + d * 25, a + 226, 102 + d * 25).setColor('#00FF00'), j = getTime(), b.name == 'Write speed') {
                        f = E.openFile('test', 'w');
                        for (let e = 0; e < 50; e++)
                            f.write(c), g.fillRect(a + 126, 85 + d * 25, a + 126 + e * 2, 102 + d * 25)
                    } else if (b.name == 'Read speed') {
                        f = E.openFile('test', 'r');
                        for (let e = 0; e < 50; e++)
                            l = f.read(c.length), g.fillRect(a + 126, 85 + d * 25, a + 126 + e * 2, 102 + d * 25)
                    }
                    j = getTime() - j, f.close(), g.clearRect(a + 126, 85 + d * 25, a + 226, 102 + d * 25), b.value = (50 * c.length / 1024 / j).toFixed(0), g.drawString(b.value + ' ' + b.units, a + 126, 85 + d * 25, !0)
                } else
                    g.setColor('#00FF00').drawString(b.value + ' ' + b.units, a + 126, 85 + d * 25, !0);
                if (b.name == 'Integrity') {
                    let e = E.toUint8Array(l);
                    if (l.length == c.length) {
                        b.value = 'PASS';
                        for (let a = 0; a < l.length; a++)
                            e[a] != c[a] && (b.value = 'FAIL')
                    } else
                        b.value = 'FAIL';
                    g.drawString(b.value + '      ', a + 126, 85 + d * 25, !0)
                } else if (b.name == 'Files') {
                    let c = [];
                    function e(a, b) {
                        if (a[0] == '.' || b[0] == '.')
                            return;
                        let d = fs.statSync(a + b);
                        d.dir ? fs.readdir(a + b).forEach(e.bind(null, a + b + '/')) : c.push({
                            fn: a + b,
                            l: d.size
                        })
                    }
                    fs.readdir().forEach(e.bind(null, '')), b.value = c.length, g.drawString(b.value + '      ', a + 126, 85 + d * 25, !0)
                }
                b.value === 'PASS' || b.value >= b.min && b.value <= b.max ? g.drawString('OK', a + 230, 85 + d * 25, !0) : (g.setColor('#FF2200').drawString('FAIL', a + 230, 85 + d * 25, !0), k = !1)
            }), fs.unlink('test'), g.setColor(0, 1, 0).drawString('SD card test completed - press knob', a, 56, !0), new Promise((a, d) => {
                function c(b) {
                    b || (Pip.removeListener('knob1', c), a(k))
                }
                b && k ? a(!0) : Pip.on('knob1', c)
            })
        }
    }
    function m(e) {
        console.log('Testing audio'), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor('#00C000').drawString('Audio test', a, 56);
        let f;
        if (Pip.isSDCardInserted())
            Pip.audioStart('UI/ALERT.wav');
        else {
            const b = [
                'PREV',
                'NEXT',
                'COLUMN',
                'OK2'
            ];
            let a = 0;
            f = setInterval(function () {
                Pip.audioStartVar(Pip.audioBuiltin(b[a])), a = (a + 1) % b.length
            }, 500)
        }
        let d = !0;
        let c = 100;
        return e.audio = [
            {
                name: 'Sound check',
                value: null,
                units: null
            },
            {
                name: 'FM frequency',
                value: c,
                units: 'MHz',
                min: 76,
                max: 108
            },
            {
                name: 'RSSI',
                value: 0,
                units: 'dBuV',
                min: 15,
                max: 100
            }
        ], new Promise((h, i) => {
            E.showPrompt('Sound heard OK?').then(i => {
                if (f && clearInterval(f), g.clearRect(0, 76, 479, 289), i) {
                    e.audio[0].value = 'PASS', rd.init(), rd.freqSet(c), rd.setVol(15);
                    function i(a) {
                        if (!a)
                            rd.enable(0), Pip.removeListener('knob1', i), d || (b = !1), h(d);
                        else {
                            c += a * .1, c > rd.end / 100 && (c = rd.start / 100), c < rd.start / 100 && (c = rd.end / 100);
                            try {
                                rd.freqSet(c)
                            } catch (a) {
                                console.log('Error setting frequency:', a)
                            }
                        }
                    }
                    Pip.on('knob1', i), e.audio.forEach((b, c) => {
                        g.setColor('#008000').drawString(`${ b.name.padStart(12, ' ') }:`, a, 85 + c * 25, !0)
                    });
                    let f = 0;
                    let j = setInterval(function () {
                        f++, d = !0, e.audio.forEach((b, e) => {
                            let h = 2;
                            b.name == 'FM frequency' ? b.value = c : b.name == 'RSSI' && (b.value = rd.getRSSI(), h = 0);
                            let i = b.value;
                            b.units && (i = `${ b.value.toFixed(h) } ${ b.units }  `), g.setColor('#00FF00').setFontMonofonto18().drawString(i, a + 126, 85 + e * 25, !0), f > 3 && (b.value == 'PASS' || b.value >= b.min && b.value <= b.max ? g.drawString('OK  ', a + 230, 85 + e * 25, !0) : (g.setColor('#FF2200').drawString('FAIL', a + 230, 85 + e * 25, !0).setColor('#00FF00'), d = !1))
                        }), g.drawString(d ? ': PASS - press knob' : '                   ', a + 90, 56, !0)
                    }, 200);
                    Pip.remove = () => {
                        clearInterval(j)
                    }
                } else
                    rd.enable(0), print('Audio test failed'), b = !1, h(!1)
            })
        })
    }
    function n(c) {
        console.log('Testing USB'), Pip.remove && Pip.remove(), g.setFontMonofonto18().setFontAlign(-1, -1).clearRect(0, 56, 479, 289).setColor('#00C000').drawString('USB test', a, 56), c.pass = !1, c.status = 'Connect USB cable';
        let d = !1;
        return new Promise((e, h) => {
            function a(d) {
                d || (Pip.removeListener('knob1', a), c.status = 'Aborted', b = !1, e(c.pass))
            }
            Pip.on('knob1', a);
            let f = setInterval(function () {
                !d && VUSB_PRESENT.read() && (d = !0, c.status = 'Waiting for data'), c.pass && (Pip.removeListener('knob1', a), e(c.pass)), g.setFontAlign(0, 0).drawString('          ' + c.status + '          ', 240, 160, !0)
            }, 200);
            Pip.remove = () => {
                clearInterval(f)
            }
        })
    }
    Pip.remove && Pip.remove(), delete Pip.remove, Pip.removeSubmenu && Pip.removeSubmenu(), E.showMessage('Entering Factory Test Mode'), settings.idleTimeout = 0, Pip.kickIdleTimer(), MEAS_ENB.write(0), clearInterval(), Pip.mode = MODE.TEST, Pip.addWatches(), global.ftm = {
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
            name: 'Inputs',
            fn: i
        },
        {
            name: 'LEDs & pixels',
            fn: j
        },
        {
            name: 'Measurements',
            fn: k
        },
        {
            name: 'SD card',
            fn: l
        },
        {
            name: 'Audio',
            fn: m
        },
        {
            name: 'USB',
            fn: n
        }
    ];
    let f = {
        '': { x2: 200 },
        '[ Run all tests ]': function () {
            b = !0, ftm.currentTest = 0, e()
        }
    };
    let h = () => {
        Pip.remove && Pip.remove(), delete Pip.remove, g.clear(1).setFontMonofonto23().setColor(0, 1, 0).drawString('Pip-Boy Factory Test Mode', a, 20), g.setColor(0, .6, 0).drawLine(0, 52, 479, 52).drawLine(0, 290, 479, 290), g.setFontMonofonto16().drawString(`Version ${ ftm.jsVersion } ${ ftm.fwVersion }     ID:${ ftm.id }`, a, 295)
    };
    let d = () => {
        h(), E.showMenu(f), bC.setFontMonofonto18().setColor(3), ftm.currentTest = null, ftm.tests.forEach((a, b) => {
            a.fn && bC.drawString(a.pass === !0 ? 'PASS' : a.pass === !1 ? 'FAIL!' : '', 212, 43 + b * 27)
        }), ftm.tests.every(a => a.pass === !0) && bC.fillPolyAA([
            290,
            100,
            310,
            120,
            355,
            65,
            375,
            85,
            310,
            145,
            275,
            120
        ]);
        let a = setInterval(function () {
            bC.flip()
        }, 50);
        Pip.remove = () => {
            clearInterval(a)
        }
    };
    ftm.tests.forEach((a, b) => {
        f[a.name] = function () {
            Pip.removeSubmenu && Pip.removeSubmenu(), ftm.currentTest = b, a.testTime = Date().toLocalISOString();
            let c = getTime();
            a.fn(a).then(b => {
                a.testDuration = Math.round(getTime() - c), a.pass = b, d()
            })
        }
    }), d()
}
const VERSION = '1.32';
const MIN_FW_VER = '2v25.280';
var fs = require('fs');
log(`------- Booting ${ process.env.VERSION } - ${ VERSION } -------`), log('Reset flags: 0x' + (peek32(1073887348) >> 24).toString(16).padStart(2, '0')), poke32(1073887348, 16777216), clearTimeout(), g.theme.fg == 65535 && g.setTheme({
    fg: 2016,
    fg2: 2016
}), process.on('uncaughtException', function (a) {
    if (Pip.sleeping)
        console.log('Uncaught exception while sleeping: ' + a);
    else
        try {
            clearTimeout(), clearWatch(), Pip.sleeping = !1, B15.set();
            let b = global.__FILE__ ? `(${ global.__FILE__ }) : ` : '';
            b += a ? `${ a.type }: ${ a.message } ` : 'Unknown Error', Pip.isSDCardInserted() || (b += '\n(No SD card)'), g.clearRect(120, 90, 360, 180).setColor(g.theme.fg).drawRect(120, 90, 360, 180), g.setFontMonofonto16().setFontAlign(0, 0), g.drawString(g.wrapString(b, 220).join('\n'), 240, 138, 1), g.setFont('6x8').drawString(`ID:${ Pip.getID() } V${ VERSION } ${ process.env.VERSION }`, 240, 96, !0), a && a.stack && (b += a.stack), log(b), setWatch(a => {
                LCD_BL.write(0), setTimeout(Pip.off, 1e3)
            }, BTN_POWER), E.getConsole() != 'USB' && setTimeout(Pip.off, 3e4)
        } catch (b) {
            console.log('Error in uncaught exception handler: ' + b.message + '\n' + b.stack), console.log('Original error: ' + a + '\n' + a.stack)
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
pinMode(MEAS_ENB, 'opendrain'), Pip.isSDCardInserted = () => !SDCARD_DETECT.read();
var settings = {};
Pip.isSDCardInserted() ? fs.statSync('settings.json') && (settings = JSON.parse(fs.readFile('settings.json'))) : log("Can't load settings - no SD card"), isFinite(settings.idleTimeout) || (settings.idleTimeout = 3e5), settings.timezone && E.setTimeZone(settings.timezone), (typeof settings.alarm)[0] != 'o' && (settings.alarm = {
    time: null,
    enabled: !1,
    repeat: !1,
    soundIndex: 0
}), settings.alarm.snooze || (settings.alarm.snooze = 10), settings.alarm.soundFiles = [];
try {
    settings.alarm.soundFiles = fs.readdirSync('ALARM').filter(a => a.toUpperCase().endsWith('WAV') && !a.startsWith('.')), settings.alarm.soundIndex > settings.alarm.soundFiles.length && (settings.alarm.soundIndex = 0)
} catch (a) {
    log('No alarm sounds found')
}
Pip.setDateAndTime = a => {
    console.log('Setting date/time to', a), settings.century = Math.floor(a.getFullYear() / 100), a.setFullYear(a.getFullYear() % 100 + 2e3), setTime(a.getTime() / 1e3), saveSettings()
}, Pip.getDateAndTime = () => {
    let a = new Date;
    return a.setFullYear((settings.century || 20) * 100 + a.getFullYear() % 100), a
}, MEAS_ENB.write(0);
try {
    Pip.setDACMode('out')
} catch (a) {
    log('setDACMode error: ' + a)
}
Date().getFullYear() == 2e3 && setTime(new Date('2077-10-23T09:47').getTime() / 1e3), Number.prototype.twoDigit = function () {
    return this.toString().padStart(2, '0')
};
let dc = require('heatshrink').decompress;
//IconModBegin_IconObjects
let icons = {
    cog: atob('jEYgVVACVf8oECrNf+OlAoNv3/6+oFB3////9Ao9vAoIRCn4FB/FVq///N//+VAoP1r//6oFHCIYdFFIw7Mv5NDLIRlIACA='),
    holotape: atob('jEYgVVAC1b/4ACytfAof1t4DB/1WAof8qu1t9///5qt1t0vAoYRC/oRCEQQdC9Wq14pEF4oFD/QRH/AdEAoJNE8tV1QACOy9VA=='),
    alarm: atob('h8SgUAgYHClwCBhf/wEA34DBAwIDBn4DBgICB/kHAYP0j4DB6F/AYNBAQP9gYDB+EvAYPiAQP/94DF/0Vn3xqEAv9AgA'),
    noAlarm: atob('h8SgUAgYHClwCBhf/wEAj4DCl4DBkADBgHgn/8g4DB+kf6F/AIdB//A3sDAYOwDgXi/4DB94DBoIDDis++I4Bv9AgAA='),
    charging: atob('hUSgUP/+A//wj/9gX/4E/+kD/0Av/Vrf/AAXP//0iIMBj/AgX0gE+gED4EAmkAg4tBoEAA=='),
    snooze: atob('ERICAAFWrwAA///AAD//8AAFQfQAAAD8AAAAfQKUAD8A//wfQBr/D8AAH0fQAA+D8AALgfQFC8D//8fQf//z0A/qVvUAAAD//AAABb8AAAA=')
};
//IconModEnd_IconObjects
let bC = Graphics.createArrayBuffer(400, 210, 2, {
    msb: !0,
    buffer: E.toArrayBuffer(E.memoryArea(268468224, 21e3))
});
bC.flip = a => Pip.blitImage(bC, 40, 65, { height: a });
let bH = Graphics.createArrayBuffer(370, 51, 4, {
    msb: !0,
    buffer: E.toArrayBuffer(E.memoryArea(268489224, 9435))
});
bH.flip = () => Pip.blitImage(bH, 53, 7, { noScanEffect: !0 });
let bF = Graphics.createArrayBuffer(372, 25, 2, {
    msb: !0,
    buffer: E.toArrayBuffer(E.memoryArea(268498659, 2325))
});
bF.flip = () => Pip.blitImage(bF, 52, 290, { noScanEffect: !0 });
let BGRECT = {
    x: 36,
    y: 58,
    w: 408,
    h: 230
};
const modes = [
    'STAT',
    'INV',
    'DATA',
    'MAP',
    'RADIO'
];
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
settings.fallbackMode === undefined && (settings.fallbackMode = 0), Pip.measurePin = (c, a, d) => {
    d === undefined && (d = 2), a === undefined && (a = 10), MEAS_ENB.write(0), pinMode(c, 'analog');
    let b = 0, e = 0;
    for (let f = 0; f < a; f++)
        b += analogRead(c) / a, e += E.getAnalogVRef() / a;
    return pinMode(c, 'input'), b *= d * e, b
}, Pip.getID = () => {
    let b = peek32(536836624);
    let d = peek32(536836632);
    let c = peek32(536836628);
    let a = '';
    for (let e = 0; e < 4; e++)
        a += String.fromCharCode(d >> 24 - e * 8 & 255);
    for (let e = 0; e < 3; e++)
        a += String.fromCharCode(c >> 24 - e * 8 & 255);
    return a += '-' + (c & 255).toString(16).padStart(2, '0'), a += '-' + ((b & 16711680) >> 16).toString(16).padStart(2, '0') + (b & 255).toString(16).padStart(2, '0'), a
}, Pip.knob1Click = a => {
    a > 0 ? Pip.audioStart('UI/ROT_V_1.wav') : Pip.audioStart('UI/ROT_V_2.wav')
}, Pip.knob2Click = a => {
    a > 0 ? Pip.audioStartVar(Pip.audioBuiltin('PREV')) : Pip.audioStartVar(Pip.audioBuiltin('NEXT'))
}, Pip.typeText = i => {
    let g = [
        atob('VwBPAEkAyf/S/sf+cgBBAW3/wv0P//cAeQC0/ib+9wD8Am8BSP+N/u3/2wHEABn/V/5X/3kBogF5AMv+NP6F/1wABADW/8D+iP+VAUIBFQDE/of+jwDjAFEAwv/8/kMBjwFL/2//dQCrAVYByP7J//UApACDABD+jf0H/2f/bwGN//D96/88/0gCLQJx/qcAHv32/ecGmQMaAD37L/Y1BpcLL/3i+0r5T/95DIf/ofgkAET9gwL9Axf8MgKW/5v6ZgJYAqH/8gGl/hf+iv9pAMgDdwJH/jr9O/8pAdUAB/+ZAQL/efz8AWEEXQII/hP1vv1IC1gDkP7C+/31CwSKC3D+ev/t9sj1/RE0DbL39vkD8gwBgRoU/wj2mf5Z7d4HIxea96D/7vO37bsbxAvz7/EB4vB/AE0Zp/b0AXUGGegQA/cM8v5VDfD26O9FCj4AlwB+Cvf1vfdMA4T/JQvlBIDyovhX/i0DWQ8fB5X19vC5+QULsxMnAovwMvaJApoKfwhd+0HzOPoCAncJKwqz+zj0gPt2AmsJFQYK/DX8HPtb/CIH5gcr/kz5RPoFBFUJ5P+p+qb9Fv5TAaADVwL//xj5s/kgBL8H3wHP/A78VAC6AmkAe/9C/gr+3gPjBBcAevuN+qkBrQY5AXr7UPwiAdsESQEY/kf+PP2V/rAE8QXv/3r3gPfKA/UIUgNP/UD72P3xATcCmgKWATH7gvq8Af0FywT1/WX5yvw4AvME5wJ//Wf62v1yAsQEvwNK/8b7/fzj/wwCxgJJ/zv8Lv7vAS0EkAGB/Hf9MQGmAXwBfwBi/kz+QP4oAFUCIgB6/h0AqAHFAML9Jf0ZAUMCHwAZAFYBkgDn/dH+TgK9An//TPzB/qkDeQNe/yD9V/2DAGkCkwA3AOL+4vyZ/yEBSwE0ApH/o/1Z/vX/SQOgAhP+6vxH/xQCrAHs/cX9jAB4ACAA'),
        atob('dABFAJD/NAB9/9P//ADI/87/5P9U/yABRgCa/nkAPQBCAMEAZf6d/0QBx/+8AOb/SP4cAKUAWwHNAM/9gf5vAPEBkgHU/rr+jv7X/10DhgCV/iH/j/3BATIDLP+p///9f/5iAh0AxgBXAav+iv6P/RABmgQxAEv+Lv05/kcEYAHf/nkA+PsdAHYEh/6eANH/NfwMA5IAAf6qA4r9d/17BAD+6P6AAuP8jgJ6ApD6VwG3AMH9XQXS/wP8EAHU/GUBUQae/Sn+mf4T/J0EOAWk/tb9xPqo/T4GGgX9AHb85/eT/d8GjwccATn6Jviy/pkGzgaLAVb6o/eD/ikHlwdhAbn5Yve2/qIGpgcBAgX60fdQ/p0FPQepAr36CfgX/k4F9QYxAvf6Kvl7/iQEEgaLArP7zPl5/r0DHAW1AYT8+vsY/78B/wKCAeX+5P1f/vH/PQLYAXH/ev6n/lEAPgGHACYA8f8g/wX/GADCABYBdQBN/z3/O/9k/74A7AEbAUL/g/3S/aABqAMuAeD9l/zk/r0CSQNyALL9pfwT/90CUQOdAHz9tfxc/70ChAJOAGD+jv1l/3cBDgL3AO/+sf3x/jwB6gFUARH/q/3w/t4A6AFwAWD/lf3L/hUBFQLHAIv+j/77/xMB6QCu/wP/wP+cAH4A4/92/8v/ZQCPANX/L/+7/7EA6QDs/wT/UP85AMsAiQDb/1L/zf8XABEAOwAfABUA8v/G/6//+v9uAHwA7v9U/4z/PQDYAHoAdf8H/7z/3wDtANv/Cf90/24AqgAYALn/tf/e/w=='),
        atob('wQDYACoAWwBdASsBRQILAtsAJQGUAD0B8f9I/v/+WAD1/7z+Fv7E/7L+Mfye/fz9/P4oAkT9x/7VA5UAOATo/qf6+Aj8B8r7Kv8I/CQFGwz79b73CgVK//EBw/7+9s8DRgRy+o0CxgSM+fAANv9K+ycORwKT7FoCBQU4BWMPze3R99AOQfdJAhUGwvW5CLv5G+83DZYGB/1DANj0EQThEx4DW/fd93v9cgcGCiX5uPd3/xn7jwViCrj8O/zl94n7Tw7eB1f8UvYD9tEFBA55Awz7o/er/YMGNgbZ/xf6mPr8/MkC5wQrALD6tfYs/ZcJqQrlAnj4yfbEAkAMdwkb/d/zVPvmB4QKKwKF9iL3Rf9EB2AHmf+c93H1xvx6BXAIugC09uf2CQEYCq8IOv8E+If7nwT1Cf8FTPx3+fL8OQHHBLMEtv7/9zb56gCKB8EDvfoY+U3+hAbrB0T/qPgY+x8DTgfuA+79ofxo/nQBJQMQAYH+I/yV/HX/cANoAS37ZfqA/1gFPATL/4X9HP4xAMQB8gLqAMv+BP5o/z4EhAWaAJv6nvswArYE/wAI/QX9S/8rAisDwQCc/an8OP8wAs4CNAEi/iT+8//bAFYA2P3g/dH+A/9d/7b/of7R/V//mQDHAaEBiP/Z/mIBAQPjAj4C7gCV/5MAdgJZAu0AIP6V/j8AEgBG/xf/g/6c/ZD+ef6//r//q/3a/VcB3AEcALv/7wCvAtED3wBX/14AGQBw/6b+BABxAQr/+fyH/zoCZQB7/WT9MACXAnQBNP8D/zkBtwEHABX/If8bAcAAxf8gAUoAVf9Y/8P/HQH/AD3+AP31/oUA8/9l/5H/IwAmAIj/KAB8AFoABAHNACv/cwAaAR8A2/8dACIBKwIhAgQAzP9W/7f+O/+Q/9//agD6/ygAgQD6/xQA7wA='),
        atob('nwCrAegBwgFtAPD/eQF/AXD/7P5y/2r/xv44/1//0/3r/lMBnwC8/3T/EACCAXABcgBM/3EAZgFQ/5X+gv9XARYBWf9H/0wAjwE2Afb+GP6aAPH/O/9lAGP/6P9TAL7/KQGTAOD/TwFd/l3+HAIZAKj91fyI/X0BcwFM/0v/6gCGAnYAKv5EAKoEkAMd/uH8SQALAzoCC/6q/NMA8gFc/1X9hv3D/yQAjf6x/pb+zgCEA/AAoP7T+/UA3weKArX+zfxt/XMIlwNY+iz/Ivv0AeQJ3fnB+97/DfwfC9r8AO89AisFogmhBLrpa/q3Eg0LIwMj8O7wow4XDcP8FflD9nkDSgtq/1T7jf70/w8E0QHp+VT+hwcaBncBnviv8ykDvAtzBin7C+9L+DcKkgthAYv0vvSpAzcLQwai/Ef5Bf8fBPYC7/4tAHUDgwE2/UL9rwFTBRgDlf0G+qT5QP6cA9IEAgOL/Jf3gvr3AQEJ/gWs/BP44/rDAzYLKwhu/5H3dPZX/5EKOwwNAkn1LfKh/XsKZAwRAi3zgPAr/T8Kfg1ZAnn1ivTt/SAJMgzNAx/6QPaM+SYDDgoTCI/+DfV/9ksBQglZCBAAYvjE+BX/IgZbCSQEOvwI+PT7uwOzBnEERv7S+BH6Sv+5A/sEkQEn+zf4M/0tBIwHTAOd/Kb5VvwfAxAI0gUq/wL6yvpDAXEGtQUbAAD66vdW/JUD/gafATn6Jvl5/hME2gXeAuz81Pq9/vkDFAbDA+r+Bvw2/SQCHAT0ARz/gvzN/AX/5gHGAm//vPtN/Pn+ZAI8A38AO/7D/mcAdgHGAccBSAGc/kz+Kv+sAGwCgwBV/Uf9yf8XAvr/nv7Z/pb+PADDAGcADgG1AZkAI/8B//gBXAOKAAr+zf46AE4BkADL/pT95fz5/UgAkQKwAWz+e/3z/7YCfwOXAU8A9P8DAGsAq/+OABgCIv+i/Gn+JAFUAeb9aPvv/RABDwFF/0r+SQCvAUoB3gDUANoBDAINANL+h/8=')
    ];
    let a = 0, b = 0;
    Pip.typeTimer && clearTimeout(Pip.typeTimer);
    let h = 0;
    let d = 0;
    let f = i.split(/\x20|\xa0|\x09/);
    let e = f[0];
    bC.setFontMonofonto16().setFontAlign(-1, -1).setColor(3);
    const c = bC.getFontHeight();
    return b == 0 && (bC.clear(), drawVaultTecLogo(199, 15, bC), b = 125), new Promise(j => {
        function i() {
            if (d == 0 && a + bC.stringWidth(e) > 359 && (a = 0, b += c), b > bC.getHeight() - c && (bC.scroll(0, -c), b -= c), d < e.length) {
                let f = e[d++];
                bC.drawString(f, a + 20, b), bC.flip(), Pip.audioStartVar(g[Math.random() * g.length | 0]), a += bC.stringWidth(f), (f == '\n' || a > bC.getWidth() - 6) && (a = 0, b += c)
            } else {
                if (d = 0, a && (a += 8), !(++h < f.length)) {
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
configureAlarm(), Pip.offAnimation = function () {
    var a = (E.toFlatString || E.toString)(atob('MLVP8MBEKiMjgBFLACIkJRqAHYABJR2AuyUdgCslJYDA8w8lHYDFsh2AwfMPJR2AzbIdgAkaLCVP9MxwAfsAASWAEEaKQgLaGIABMvrnML0AAAJg8LVP8MBGKiMzgDtLACQkJxyAH4ABJx+AuycfgCsnN4BFHMDzDyfAsh+AGIDF8w8gGIDtsi4gHYAwgBiIrfJsbYCyrfgGAAKvIEYciCf4EEABMLD1zH/40U/2Hw4C6g4OACYC9PxiHIg3+BZQpLIk9PxsJfT8YGBEcEQF9PxlBPT8ZCxExQNIv0D0eEAURIUGSL9A8B8AJQVIv0T0/GQE9PxkIPT8YCBDJ/gWAAE2tvXMf9jRT/DAQCoiAoAkJAAiGoAcgAEkHIC7JByAKyQEgMHzDyTJshyAGYAcgBmALCEBgDf4EhAZgAEysvXMf/jRDfJsbfC9AL8AAAJg+LVQJA9GBEGeJgAlpUIP2gE1MEY6RsXxoAH/93P/xvWfcDpGBfGfAf/3bP8CPu3nZQDE8aABxfGgAP/3Of8F8aABBPGgAL3o+ED/9zG/AAA=')), b = E.nativeCall(337, 'void(int,int)', a);
    return new Promise(e => {
        var a = 0, c = ((g.theme.fg & 63488) > 16384 ? 2048 : 0) | ((g.theme.fg & 2016) > 512 ? 32 : 0) | ((g.theme.fg & 31) > 8 ? 1 : 0), d = setInterval(function () {
                if (a < 7)
                    b(a, c);
                else {
                    analogWrite(LCD_BL, 1 - (a - 8) / 8, { freq: 200 });
                    var f = 200 - (a - 7) * 20, h = f + 25;
                    f < 0 ? (LCD_BL.write(0), clearInterval(d), e()) : g.clearRect(240 - h, 155, 240 - f, 165).clearRect(240 + f, 155, 240 + h, 165)
                }
                a++
            }, 50)
    })
}, Pip.offOrSleep = function (a) {
    a = a || {}, Pip.idleTimer = undefined, Pip.sleeping = 'BUSY', Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.remove, delete Pip.removeSubmenu, Pip.radioOn && rd.enable(!1, !0);
    let b = () => {
        Pip.audioStart('UI/POWER_OFF.wav');
        let b = [
            LED_RED,
            LED_GREEN
        ];
        Pip.radioOn && b.push(LED_TUNING), Pip.fadeOff(b), Pip.offAnimation().then(b => {
            MEAS_ENB.write(1), setTimeout(b => {
                Pip.sleeping = !0;
                try {
                    clearWatch(), setWatch(Pip.powerButtonHandler, BTN_POWER, { repeat: !0 }), a.forceOff ? (console.log('forceOff => turning off completely'), Pip.off()) : Pip.sleep()
                } catch (a) {
                    log('Error going to sleep: ' + a)
                }
            }, 1e3)
        })
    };
    a.immediate ? b() : Pip.fadeOff().then(h => {
        g.setBgColor(0).clearRect(36, 40, 444, 288);
        let c = Graphics.createArrayBuffer(260, 35, 4, { msb: !0 });
        let a = 15, d = -1;
        bC.clear().setFontMonofonto28().setFontAlign(0, -1).setColor(3).drawString('PIP-BOY 3000 Mk V', 200, 10);
        let e = settings.userName ? 'Assigned to ' + settings.userName : 'Serial number ' + Pip.getID();
        bC.setFontMonofonto18().drawString(e.toUpperCase(), 200, 60), c.setFontMonofonto36().setFontAlign(0, -1);
        let f = setInterval(b => {
            c.setColor(a).drawString('- SLEEP MODE -', 130, -3), bC.flip(100), Pip.blitImage(c, 110, 180), a += d, (a == 15 || a == 6) && (d = -d)
        }, 100);
        Pip.audioStart('UI/BURST5.wav'), Pip.fadeOn([LCD_BL]), setTimeout(a => {
            clearInterval(f), b()
        }, 3750)
    })
}, Pip.offButtonHandler = () => {
    if (BTN_POWER.read()) {
        let a = setWatch(a => {
            clearTimeout(b), settings.longPressToWake && (settings.longPressToWake = !1, saveSettings()), Pip.offOrSleep({ immediate: !0 })
        }, BTN_POWER, { edge: 'falling' });
        let b = setTimeout(b => {
            if (clearWatch(a), BTN_TORCH.read())
                return;
            settings.longPressToWake = !0, settings.alarm.enabled = !1, saveSettings(), configureAlarm(), Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), Pip.audioStart('UI/BURST5.wav'), E.showMessage('Pip-Boy powering off'), setWatch(a => setTimeout(a => Pip.offOrSleep({ immediate: !0 }), 1e3), BTN_POWER, { edge: 'falling' })
        }, 2500)
    } else
        Pip.offOrSleep({ immediate: !0 })
}, Pip.idleTimer = undefined, Pip.kickIdleTimer = function () {
    Pip.idleTimer && clearTimeout(Pip.idleTimer), Pip.idleTimer = settings.idleTimeout && !VUSB_PRESENT.read() ? setTimeout(Pip.offOrSleep, settings.idleTimeout) : undefined
}, Pip.kickIdleTimer(), Pip.brightness = 20, Pip.sleeping = !1, Pip.demoMode = 0, Pip.fadeOff = (b, c) => {
    Pip.fadeTimer && (clearInterval(Pip.fadeTimer), c = Pip.tempB), c == null && (c = Math.pow(2, Pip.brightness / 2) / 1024), b == null && (b = [LCD_BL]);
    let a = c;
    return new Promise(d => {
        let c = function () {
            clearInterval(Pip.fadeTimer), b.forEach(a => a.reset()), delete Pip.fadeTimer, delete Pip.tempB, d()
        };
        Pip.fadeTimer = setInterval(() => {
            if (a *= .65, a < .01)
                return c();
            b.forEach(b => analogWrite(b, b == LED_GREEN ? a / 2 : a, {
                soft: b == E3 || b == E4,
                freq: 200
            })), Pip.tempB = a
        }, 40)
    })
}, Pip.fadeOn = (b, c) => {
    Pip.fadeTimer && clearInterval(Pip.fadeTimer), c == null && (c = Math.pow(2, Pip.brightness / 2) / 1024), b == null && (b = [
        LCD_BL,
        LED_RED,
        LED_GREEN
    ], Pip.radioOn && b.push(LED_TUNING));
    let a = Pip.tempB || .01;
    return new Promise(e => {
        let d = function () {
            clearInterval(Pip.fadeTimer), b.forEach(a => analogWrite(a, a == LED_GREEN ? c / 2 : c, {
                soft: a == E3 || a == E4,
                freq: 200
            })), delete Pip.fadeTimer, delete Pip.tempB, e()
        };
        Pip.fadeTimer = setInterval(() => {
            if (a *= 1.46, a >= c)
                return d();
            b.forEach(b => analogWrite(b, b == LED_GREEN ? a / 2 : a, {
                soft: b == E3 || b == E4,
                freq: 200
            })), Pip.tempB = a
        }, 40)
    })
}, Pip.updateBrightness = () => {
    let a = Math.pow(2, Pip.brightness / 2) / 1024;
    analogWrite(LCD_BL, a), analogWrite(LED_RED, a, { soft: !0 }), analogWrite(LED_GREEN, a / 2), Pip.radioOn && analogWrite(LED_TUNING, a, { soft: !0 })
}, Pip.powerButtonHandler = () => {
    if (Pip.sleeping == 'BUSY')
        return;
    Pip.sleeping ? checkBatteryAndSleep() || (Pip.kickIdleTimer(), settings.longPressToWake ? wakeOnLongPress() : (wakeFromSleep(showMainMenu), Pip.audioStart('BOOT/BOOT_DONE.wav'))) : (Pip.idleTimer && clearTimeout(Pip.idleTimer), Pip.offButtonHandler())
}, Pip.usbConnectHandler = a => {
    if (console.log(`USB ${ a.state ? '' : 'dis' }connected`), Pip.sleeping == 'BUSY')
        return;
    Pip.kickIdleTimer(), Pip.sleeping ? a.state && (console.log('USB connected - waking up'), settings.longPressToWake ? (settings.longPressToWake = !1, saveSettings(), wakeFromSleep(playBootAnimation)) : wakeFromSleep(showMainMenu)) : drawFooter()
}, Pip.addWatches = () => {
    clearWatch(), pinMode(KNOB1_B, 'input'), setWatch(a => {
        let b = a.state ^ a.data ? -1 : 1;
        Pip.emit('knob1', b), Pip.kickIdleTimer()
    }, KNOB1_A, {
        data: KNOB1_B,
        edge: 1,
        repeat: !0,
        debounce: 0
    }), setWatch(a => {
        Pip.emit('knob1', 0), Pip.kickIdleTimer()
    }, KNOB1_BTN, {
        repeat: !0,
        edge: 'rising',
        debounce: 20
    }), Pip.mode == MODE.TEST ? setWatch(E.reboot, BTN_POWER, { repeat: !0 }) : (pinMode(KNOB2_A, 'input'), setWatch(a => {
        let b = a.state ^ a.data ? 1 : -1;
        Pip.emit('knob2', b), Pip.kickIdleTimer()
    }, KNOB2_B, {
        data: KNOB2_A,
        edge: 1,
        repeat: !0,
        debounce: 0
    }), setWatch(a => {
        Pip.emit('torch')
    }, BTN_TORCH, {
        repeat: !0,
        edge: 1,
        debounce: 50
    }), setWatch(Pip.usbConnectHandler, VUSB_PRESENT, { repeat: !0 }), setWatch(Pip.powerButtonHandler, BTN_POWER, { repeat: !0 }))
};
let showTorch = () => {
    if (Pip.sleeping)
        return;
    Pip.remove && Pip.remove();
    function a() {
        Pip.removeAllListeners('torch'), Pip.audioStart('UI/L_OFF.wav'), Pip.fadeOff([LCD_BL], 1).then(a => {
            g.clear(), showMainMenu(), Pip.fadeOn([LCD_BL])
        })
    }
    function b(b) {
        b || a()
    }
    Pip.fadeOff().then(c => {
        Pip.audioStart('UI/L_ON.wav'), g.setColor(g.blendColor(g.theme.fg, '#FFF', .2)).fillRect(0, 0, 479, 319), Pip.fadeOn([LCD_BL], 1).then(c => {
            Pip.on('torch', a), Pip.on('knob1', b), Pip.remove = function () {
                Pip.removeAllListeners('torch'), Pip.removeListener('knob1', b)
            }
        })
    })
};
let torchButtonHandler = () => {
    if (BTN_TORCH.read()) {
        let a = setWatch(a => {
            clearTimeout(b), showTorch()
        }, BTN_TORCH, { edge: 'falling' });
        let b = setTimeout(b => {
            if (clearWatch(a), BTN_POWER.read())
                return;
            if (BTN_PLAY.read() && KNOB1_BTN.read())
                console.log('Torch, play and knob1 buttons held down - entering Factory Test Mode'), Pip.remove && Pip.remove(), Pip.removeSubmenu && Pip.removeSubmenu(), Pip.videoStop(), factoryTestMode();
            else {
                let a = 1;
                let b = setInterval(d => {
                    const b = [
                        2,
                        10,
                        20
                    ];
                    let c = b.findIndex(a => a >= Pip.brightness);
                    c >= b.length - 1 && (a = -1), c == 0 && (a = 1), Pip.brightness = b[c + a], Pip.updateBrightness()
                }, 1e3);
                function c() {
                    b && clearInterval(b), b = undefined
                }
                setWatch(c, BTN_POWER, { edge: 'rising' }), setWatch(c, BTN_TORCH, { edge: 'falling' })
            }
        }, 1e3)
    } else
        showTorch()
};
let drawVaultTecLogo = (b, c, a, f) => {
    a || (a = g);
    let d = atob('vUygQPMgOv/+kFrMH/4AB/odYhYdC//+DrPkLoO/Hq5ZBwAFCl4eWgIdEDwP0Dyu/DokAn/QDqkvCwLVBagQlGKxdVAANbKYLVCO4MC/wMCqjOQDALzFBgywLAAdAAwJdBv4XBl4eOgX/ypaC8C3EWoW+LYVv/CwNgP8HAPATwkD+AGD8AdIh7HDn9Aj4RE34HBW4e/HhN/B4UH8EDJwMG/RnBIgIBBcQh5J9Wq1SJB3yxC/wDB8EH/QNB/55KWwnAj/AA4QeBMYM/aqX0gf0IgJ1B/CgBAwIAB/IdKAAc/P4KBDj/Qh5FBTAYANZQMLDAKMCEYN+TAgAGt51DAARyBKYKMCAYInBh4SG/+QXoIKH8BTBLwL/CAoW/CY5lBBI/9gP4ewIeC3kCMgITH/9LXo8H6EfoF9A4kvA4gTE/xwBAA19gP0DIIHCvwHGAAZFBJwY8NA4oAE39/8g8IPIu9gQ8IgO/6KDIeIOAWwsvWxP0gQJHeYUD+gwCAoLzJ/APBtWqAAmrZYLhB4AOBn9AIQP+CQuqyCBHCwSwBgG+VIQlBMgIlCABhBB1f0KYMD/q1B/hiBgI8CG5RuBMweAl+Aj/+rf/oAGBn6SDDxSnDGoI6Bl4kCg5DBFgbgDOo74COAIXBgFvbYIkC3pODPpMPJAaYBl4RBitAA4OAS4YeBHhLvBAAMCcAJ1BA4Uf+ECFgcLLZMHJwJBC6EDEocLQIN/CQ4AGj6JDJgMLDwQDCh4NEJAYAGVwS3DEoOl14WBWoi+BapUbY4olDCwILD/w7KAAt/DAIlBCwU/Z5IAKY4IwCqC3DDqapBWoa3EACkPZAgkGACMvDAZ8BSSDbI0tVaoLOLABlvdh4ANfQTsRbBVVqgQNA=');
    if (a.drawImage(dc(d), b - 61, c), f)
        return;
    let e = atob('rMTgW/4Ev+X/gF/4X+l/h///4EAAYPX//wgO/5/4h/8BoMv+H/5/834PBgE///6//8gX/+f/gf+n/0hf8n4IBl4PBgEP//+DgIVBFAX/r/+A4IxC5Y+BgEDAYOv//BAgMf+G/BwPA3/D/8/+Ov/2AgADBxf+0H/+mDIAI8B+BYEFAKABAYI3BPgJgBBwP4//9LAgKBQgIDCSwM/CoMv+YRB/+CLAYNB+P//ARBOoI2BGYP+PoRcBLAXwDIKABAYMLTAQzCDYP3/hYGD4IdBTAi5C8YGBpZYFRwIdBLAI2CgEHBIU/8RYG1WoLAX6x5YBEIJOC/l/LAoNBLATzCXIM//xOBFQKxN+kAOgNPCoPD/2/LAP9WIwQCGoJ4CVAICEaoQ6BWIXgBQIHBXoI3BRQLNCX4RYDEAMfGIMP/DlBF4X9h6/ELAf+gKYBgOojWQjWgj/4gKXBtVACwIDBtWqgEG/AA==');
    a.drawImage(dc(e), b - 45, c + 60)
};
let drawVaultNumLogo = (b, c, d, a) => {
    a || (a = g);
    let e = atob('/1jgQfcguv//+yhe5t//AAdAHu0GHogAB8g+1hY+G//4H2kbHw///I+zj4+I//9Xna/1HxY/yg4+L//0H18CHxn/8A/v34/N4A+un4+N/9AH1sfHx39H1sHHx3/+g+sgI+P//QH9l/H6D+sfg+URAO/f2UDGYv5BYcLf1MaWJoyFgQUN9Lzo8AVFH53/oA+mWA4/PwA+tgEDP8sfEpv8DBELDBv+HyolZLB34Hyjkan4ZN8D8j6AaKf0cDEZv0DTPwPyjjNfhQABh4aM/o+UXxz8KDR69UcZyiMgQaM6A+VEhiiNhYaL8A+VH5q9MgE/H0TkMXpkAgIYJ/z7WABMPXqASTADDFE4CYRWzIANdQf0CRsDKQY+mFacfCQXwH8yqTKQdAH0sLFQX8CaX4P0xqD4CSSCZ4AWh5qSgaSSPzbpPn4TC6AtUg2/F4YAO+AkOgQjS//oDIcbDKf/Mh8fEif+DC//8DSTH6cLDC4ANh4mU/sAg4XUP03//ECC6pXBP0n/+G/C6vAP0v/54WV/h+m/x++4b99+gXW8B+lMwMvaqp+moEAv4XU+B+lwAYBH6o+Pj4+XgEaP0cCEif5Mh6pJCZ8/CYXQFyoAPh4qC/ATOgYTC/g+lPwnACZ1/CaQAWhZqSCYaSPAC5qD8CSSoA+ldIf/CZ0fCQXwP00/FYX0KUIAXgQrD4DRhAC8PFYX9CUAAS354DAArqNSIgAGyA9XgIkK/+ADRk/DJTFXHxirNhYaL6C8hXxy9LAAPAHyqiLXx1/DRlAHykfEZn+DRcPDRjZNAA8DEZn/+galXq//6AaKDJq+VgQkOfxRZO8B+UhYkNfxUfDJv8HykAl4lXLB3/HysAv4lN+gXHgbXZABm/H6sCH0x/P8A+ugEG1QAF15/LHw3qDY2lHrAAJd435BYcLZZoAkj6pG0kAgO/BIv9H1cAv7xOAANAH1cBHyHgP1kHHx78sfxIAHfloABn787AAW/HxvAH10BHxvgH10AgY+M+g+vgELHxf4H2A/MH2Q/L/o+yH5X5H2Y/JXmYACgQ+G8g+1AANvHof+oA+3gEF149BygidA');
    let f = atob('lUogW//4AB/0AAoP4gEPBIX/+APCBQIJD/wPD8AUE4AEDwAED+gPD/oUEEgngAgfQB4kLAYX8Cgn0LAIEBoEPwEHGgUAj5SBgFAgEvKgUDHAJzDCgd/AYQABGwIUBGoIeBCggjBQwQUEHwItB4AUFGY4QBEoKYBLoIABCAIlBNwRiCgE/EoStC6AJBIgIaBNgQuBLosWD4h4DFwQkCGYZYDH4R4BLIYFDPgZOFgI4EJwXgAYgUFJwJ4ECAZjBVgYUDKQJ3DHwXQgSsHKYIiBQIMLwBoDQwYtB9YJBLIKMC//bAgdAXQIAB/qmCRoIiCCgpZBB4YUEoDLCCgpSCCgxjBKQIQDBQPkgEC1QAC1IA==');
    let h = atob('lUogX/AAX+h4FDAAngBJH8CgnfAgdAAgf4AgfwCggED/sAFxHAB4f8g2q1//+kAtWqBQOAgEBAgJdCCwPwAgM///QAgJlB/wEBg5CBCgQPB4AEBDwkLFwUAj5CBBQQPDEYP8BIQPBFwQjBIQMAgYPDEYI4CgF/EgZyDKQQfCAgQ5COYQlBPoYkCDQQECFQQpBOYTTCPARJBW4JECJQcvJQY1BL4YvDgG/AgaOBJ4Q1BCgajEHQIUCF4KoECgp0CChIpFB4IpCIYgPB/uQLAcFdgfP6B+CwG+LAX8SIR9BBoQABp4EDCQQPCBIYiDJAK7C//4CgnABwa2DDwIUDUwIUCDIgJBQAKbDjX6X4JcB1/oAgI=');
    a.drawImage(dc(e), b - 127, c), d == 32 ? a.drawImage(dc(f), b - 21, c + 30) : d == 33 && a.drawImage(dc(h), b - 21, c + 30)
};
let drawText = (c, d, e, a) => {
    a || (a = g);
    let b = c.split('\n');
    a.setFontMonofonto23().setFontAlign(0, -1), b.forEach((b, c) => {
        a.drawString(b, d, e + c * 30)
    })
};
let showVaultAssignment = () => {
    if (settings.overseer) {
        let a = setTimeout(function () {
            a = undefined, Pip.videoStart(`MISC/REPOP1.avi`, {
                x: 36,
                y: 40,
                repeat: !1
            }), Pip.on('videoStopped', function () {
                Pip.removeAllListeners('videoStopped'), Pip.videoStart(`MISC/REPOP2.avi`, {
                    x: 36,
                    y: 40,
                    repeat: !0
                })
            })
        }, 100);
        Pip.removeSubmenu = function () {
            a && clearTimeout(a), Pip.removeAllListeners('videoStopped'), Pip.videoStop()
        }
    } else {
        let b = 32 + Math.floor(Math.random() * 2);
        let c = settings.userName ? settings.userName.toUpperCase() : 'CONSTITUENT';
        var a = 0;
        g.clearRect(40, 40, 440, 58);
        let d = () => {
            var d;
            bC.clear(1).setFontMonofonto23().setFontAlign(0, 0), a == 0 ? (d = b == 32 ? "WE BID YOU FAREWELL!\nYOU'RE MOVING TO" : "CONGRATULATIONS!\nYOU'RE STAYING IN", drawText(d, 200, 15, bC), drawVaultNumLogo(200, 85, b, bC)) : (b == 32 ? d = 'CONGRATULATIONS,\n' + c + "!\n\nYOU'RE ONE OF THE CHOSEN\nPIONEERS WHO WILL\nREPOPULATE VAULT 32!" : d = 'CONGRATULATIONS,\n' + c + '!\n\nYOU REMAIN A\nTRUE AND TRUSTED\nRESIDENT OF VAULT 33!', drawText(d, 200, 15, bC)), a = (a + 1) % 2
        };
        d();
        let e = setInterval(function () {
            bC.flip()
        }, 50);
        let f = setInterval(d, 3e3);
        Pip.removeSubmenu = function () {
            clearTimeout(f), clearInterval(e)
        }, setTimeout(a => Pip.audioStart('UI/ALERT.wav'), 100)
    }
};
Pip.clockVertical = !1;
let submenuClock = () => {
    tm0 = null;
    let b = atob('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');
    let c = [
        atob('FAcC6/////+D//f/+0P/2//RA/+P/8BD/x//wN/9P//B//S//9M='),
        atob('FAcC//////////f//2v/2///A/+P/95D/x//wN/9P//B//S//9M='),
        atob('FAcC//////////f/////2///u/+P//9T/x///t/9P//F//S//9M=')
    ];
    let a = null;
    let d = setInterval(function () {
        let f = Date();
        let g = f.getHours();
        let d, i;
        settings.clock12hr ? (d = (g + 11) % 12 + 1, i = g < 12 ? 'AM' : 'PM') : d = g.twoDigit();
        let e = f.getMinutes().twoDigit();
        let h = f.getSeconds();
        e != tm0 && (bC.clear(1), Pip.clockVertical ? (bC.drawImage(dc(b), 60, 20), bC.setFontMonofonto96().drawString(d, settings.clock12hr && d < 10 ? 281 : 223, 0).drawString(e, 223, 110), settings.clock12hr && bC.setFontMonofonto28().drawString(i, 350, 177)) : (bC.setFontMonofonto120().drawString(d, settings.clock12hr && d < 10 ? 93 : 20, 45).drawString(':', 160, 45).drawString(e, 228, 45), settings.clock12hr && bC.setFontMonofonto28().drawString(i, 183, 177)), tm0 = e), a && (bC.setColor(3).drawImage(c[a < 4 ? a - 1 : 5 - a], 98, 44), ++a > 5 && (a = null)), h != ts0 && (bC.setFontMonofonto120().setColor(h & 1 ? 3 : 1).drawString(':', 160, Pip.clockVertical ? 40 : 45), ts0 = h, Pip.clockVertical && Math.random() < .15 && (a = 1)), !Pip.radioOn && Pip.brightness < 20 && !Pip.audioIsPlaying() && Pip.audioStartVar(new Uint8Array(2)), bC.flip()
    }, 50);
    function e(a) {
        if (a == 0)
            return;
        Pip.clockVertical = !Pip.clockVertical, Pip.knob1Click(a), bC.clear(1).flip(), tm0 = null
    }
    Pip.on('knob1', e), Pip.removeSubmenu = function () {
        clearInterval(d), Pip.removeListener('knob1', e)
    }
};
let getRandomExcluding = (b, c) => {
    const a = Array(b).fill().map((b, a) => a).filter(a => a != c);
    return 0 | a[Math.floor(Math.random() * a.length * .999)]
};
var rd = new I2C;
rd.setupI2C = () => {
    if ([
            B6,
            B7
        ].forEach(a => a.mode('input')), B7.read() == 0) {
        [
            B6,
            B7
        ].forEach(a => a.mode('input_pullup')), log('Radio I2C SDA pin is low - trying to unstick the bus with SCL pulses');
        for (var a = 1; a <= 100; a++)
            if (B6.write(0), B6.write(1), B7.read())
                break;
        log(`Radio I2C bus ${ B7.read() ? 'unstuck' : 'still stuck' } after ${ a } pulses`)
    }
    try {
        rd.setup({
            sda: B7,
            scl: B6
        })
    } catch (a) {
        log('Radio I2C setup failed: ' + a)
    }
}, rd.setupI2C(), rd.freq = 98.8, rd.tuningInterval = null, rd.writeReg = (b, a) => {
    rd.writeTo(17, [
        b,
        a >> 8 & 255,
        a & 255
    ])
}, rd.readReg = b => {
    rd.writeTo(17, b);
    let a = rd.readFrom(17, 2);
    return a[0] << 8 | a[1]
}, rd.getChannelInfo = () => {
    let a = rd.readReg(3);
    rd.band = (a & 12) >> 2;
    switch (rd.band) {
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
    switch (rd.space) {
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
}, rd.init = c => {
    rd._options || rd.setupI2C();
    let a = rd.readReg(0) >> 8;
    let b = !0;
    return a == 88 ? c && console.log(`RDA5807 ID: 0x${ a.toString(16) } (as expected)`) : (log(`Unexpected value reading RDA5807 ID: 0x${ a.toString(16) }`), b = !1), rd.writeReg(2, 3), rd.writeReg(2, 61453), rd.writeReg(3, 8), rd.writeReg(4, 12800), rd.writeReg(5, 34984), rd.writeReg(6, 32768), rd.writeReg(7, 24346), rd.getChannelInfo(), b
}, rd.init(), rd.writeReg(2, 61452);
let stationName = '';
let stationNameSegments = new Array(8).fill(' ');
let stationNameTemp = new Array(8);
readRDSData = () => {
    if (!(rd.useRDS && rd.readReg(10) & 32768))
        return;
    let a = rd.readReg(13);
    let b = rd.readReg(15);
    if ((a >> 12 & 15) === 0) {
        let c = (a & 3) * 2;
        let d = b >> 8;
        let e = b & 255;
        stationNameTemp[c] == d && d >= 32 ? stationNameSegments[c] = String.fromCharCode(d) : stationNameTemp[c] = d, stationNameTemp[c + 1] == e && e >= 32 ? stationNameSegments[c + 1] = String.fromCharCode(e) : stationNameTemp[c + 1] = e, stationName = stationNameSegments.join('').trim()
    }
    let c = Graphics.createArrayBuffer(100, 25, 2, { msb: !0 });
    c.setFontMonofonto18().setFontAlign(0, -1).drawString(stationName, 50, 0, 1), Pip.blitImage(c, 295, 238)
}, rd.seek = c => {
    let a = rd.readReg(2);
    a |= 256, c ? a |= 512 : a &= -513, rd.writeReg(2, a), rd.tuningInterval && clearInterval(rd.tuningInterval);
    let b = rd.readReg(4);
    return rd.writeReg(4, b | 1024), rd.writeReg(4, b & -1025), stationNameSegments.fill(' '), stationName = '', new Promise((a, b) => {
        rd.tuningInterval = setInterval(() => {
            let b = rd.readReg(10);
            let c = b & 1023;
            rd.freq = (c * rd.chans_per_MHz + rd.start) / 100, Pip.mode == MODE.RADIO && rd.drawFreq(), b & 24576 && (clearInterval(rd.tuningInterval), rd.tuningInterval = null, Pip.audioStop(), a((b & 8192) == 0))
        }, 200)
    })
}, rd.isOn = () => {
    try {
        Pip.radioOn = (rd.readReg(2) & 1) != 0
    } catch (a) {
        log(`Error reading radio enabled status: ${ a }`), Pip.radioOn = null
    }
    return Pip.radioOn
}, rd.getRSSI = () => (rd.readReg(11) & 65024) >> 9, rd.enable = (a, b) => {
    if (a) {
        let a = rd.freq;
        rd.init(), RADIO_AUDIO.mode('analog'), a && rd.freqSet(a), Pip.fadeTimer || Pip.fadeOn([LED_TUNING], Math.pow(2, Pip.brightness / 2) / 1024)
    } else
        rd.tuningInterval && clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.writeReg(2, rd.readReg(2) & 65278), Pip.fadeOff([LED_TUNING], Math.pow(2, Pip.brightness / 2) / 1024);
    b || (Pip.radioOn = a)
}, rd.getVol = () => rd.readReg(5) & 15, rd.setVol = a => {
    rd.writeReg(5, rd.readReg(5) & 65520 | a & 15)
}, rd.freqSet = (a, b) => {
    if (a *= 100, a < rd.start || a > rd.end) {
        b && console.log(`Invalid frequency (${ a }) - must be between ${ rd.start } and ${ rd.end }`);
        return
    }
    let d = (a - rd.start) / rd.chans_per_MHz & 1023;
    b && console.log(`Band:${ rd.band } (start:${ rd.start }, end:${ rd.end }), spacing:${ 1e3 / rd.chans_per_MHz } kHz, tuning to ${ a / 100 } MHz (channel ${ d })`);
    let c = d << 6 | rd.band << 2 | rd.space;
    Pip.audioStop(), rd.writeReg(3, c), rd.writeReg(3, c | 16), stationNameSegments.fill(' '), stationName = '        ';
    var e = 0;
    return rd.tuningInterval && clearInterval(rd.tuningInterval), new Promise((d, f) => {
        rd.tuningInterval = setInterval(() => {
            let f = rd.readReg(10);
            if (f & 24576) {
                let c = (f & 8192) == 0;
                b && console.log(`- set channel=${ f & 1023 } ${ c ? 'OK' : '(failed)' }`), rd.freq = a / 100, Pip.mode == MODE.RADIO && rd.drawFreq(), clearInterval(rd.tuningInterval), rd.tuningInterval = null, d(c)
            }
            e++ > 10 && (b && console.log(`Giving up!`), clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.writeReg(3, c), log('Timeout tuning to ' + a), d(!1))
        }, 200)
    })
}, rd.drawFreq = a => {
    const b = a ? 245 : 0, c = a ? 150 : 0;
    a || (a = Graphics.createArrayBuffer(120, 23, 2, { msb: !0 })), a.setFontMonofonto18().setFontAlign(0, -1), Pip.radioOn ? (a.drawString(`  ${ rd.freq.toFixed(2) } MHz  `, b + 60, c, 1), a == bC ? bC.drawString('  ' + stationName + '  ', 305, 173, 1) : (Pip.blitImage(a, 285, 215), g.clearRect(295, 238, 395, 262))) : a.clearRect(b, c, b + 119, c + 40)
};
const CLIP_TYPE = {
    ANY: null,
    VOICE: 'DX',
    MUSIC: 'MX',
    SFX: 'SFX'
};
let radioPlayClip = (a, b) => (a == undefined && (a = CLIP_TYPE.MUSIC), new Promise((e, f) => {
    var c = null;
    let d = () => {
        Pip.removeListener('audioStopped', d), Pip.radioClipPlaying = !1, c && rd.setVol(c), e(1)
    };
    if (Pip.radioClipPlaying)
        Pip.removeListener('audioStopped', d), Pip.audioStop(), Pip.radioClipPlaying = !1, c && rd.setVol(c), e(0);
    else {
        c = rd.getVol(), rd.setVol(2), a == CLIP_TYPE.ANY && (a = [
            CLIP_TYPE.MUSIC,
            CLIP_TYPE.VOICE,
            CLIP_TYPE.SFX
        ][Math.floor(Math.random() * 2.999)]);
        let e = fs.readdirSync('RADIO').sort().filter(b => b.startsWith(a) && b.toUpperCase().endsWith('WAV') && !b.startsWith('.'));
        e.length || f('No radio clips found');
        let g = getRandomExcluding(e.length, Pip.lastClipIndex);
        b && console.log(`Playing radio clip type ${ a }: ${ e[g] }`), Pip.audioStart('RADIO/' + e[g]), Pip.on('audioStopped', d), Pip.radioClipPlaying = !0, Pip.lastClipIndex = g
    }
}));
//CustomRadioPatchBegin_submenuRadio
let submenuRadio = () => {
    rd._options || rd.setupI2C(), bC.clear(1);
    let f = 0;
    let a = Graphics.createArrayBuffer(120, 120, 2, { msb: !0 });
    E.getAddressOf(a, 0) == 0 && (a = undefined, E.defrag(), a = Graphics.createArrayBuffer(120, 120, 2, { msb: !0 }));
    let c = new Uint16Array(60);
    for (let l = 0; l < 60; l += 2)
        c[l] = l * 2;
    function j() {
        for (let a = 0; a < 40; a++) {
            let c = 2, b = 1;
            a % 5 == 0 && (c = 3, b = 2), bC.setColor(c), bC.drawLine(245 + a * 3, 143 - b, 245 + a * 3, 143), bC.drawLine(367 - b, 22 + a * 3, 367, 22 + a * 3)
        }
        bC.setColor(3).drawLine(245, 144, 367, 144).drawLine(368, 144, 368, 22).flip()
    }
    function k() {
        if (a.clearRect(0, 0, 119, 119), Pip.radioClipPlaying)
            Pip.getAudioWaveform(c, 20, 100);
        else if (Pip.radioOn)
            for (let a = 1; a < 60; a += 2)
                c[a] = E.clip(60 + (analogRead(RADIO_AUDIO) - .263) * 600, 0, 119);
        else {
            let a = f;
            for (let b = 1; b < 60; b += 2)
                c[b] = 60 + Math.sin(a) * 45 * Math.sin((a += .6) * .13)
        }
        a.drawPolyAA(c), f += .3, Pip.blitImage(a, 285, 85, { noScanEffect: !0 })
    }
    E.showMenu({
        '': {
            x2: 200,
            predraw: function () {
                bC.drawImage(a, 245, 20), rd.drawFreq(bC)
            }
        },
        'FM Radio': {
            value: rd.isOn(),
            format: a => a ? 'On' : 'Off',
            onchange: a => {
                a ? (Pip.radioKPSS = !1, rd.enable(!0), Pip.audioStart('UI/RADIO_ON.wav')) : (rd.enable(!1), rd.drawFreq(), Pip.audioStart('UI/RADIO_OFF.wav'))
            }
        },
        'FM Volume': {
            value: rd.getVol(),
            min: 0,
            max: 15,
            step: 1,
            onchange: a => {
                rd.setVol(a)
            }
        },
        'KPSS Radio': {
            value: !!Pip.radioKPSS,
            format: a => a ? 'On' : 'Off',
            onchange: a => {
                Pip.radioKPSS = a, a ? radioPlayClip(CLIP_TYPE.VOICE) : Pip.audioStart('UI/RADIO_OFF.wav')
            }
        }
    });
    let g = Pip.removeSubmenu;
    j();
    let h = setInterval(() => {
        Pip.radioKPSS && !Pip.streamPlaying() ? radioPlayClip(CLIP_TYPE.MUSIC) : k()
    }, 50);
    rd.rdsTimer = setInterval(() => {
        readRDSData()
    }, 100), rd.isOn() && (rd.getChannelInfo(), rd.drawFreq());
    let b = null;
    let e = 0;
    let d = null;
    function i(a) {
        if (Pip.radioKPSS) {
            Pip.audioStop();
            return
        }
        d || a == e ? (rd.freq = rd.freq + e * .1, rd.freq < rd.start / 100 && (rd.freq = rd.end / 100), rd.freq > rd.end / 100 && (rd.freq = rd.start / 100), rd.drawFreq(), b && clearTimeout(b), b = setTimeout(() => {
            try {
                rd.freqSet(rd.freq)
            } catch (a) {
                log(`Error tuning radio: ${ a }`)
            }
            b = null
        }, 200), d && clearTimeout(d), d = setTimeout(() => {
            d = null
        }, 20)) : e = a
    }
    Pip.on('knob2', i), Pip.removeSubmenu = function () {
        Pip.radioKPSS = !1, clearInterval(h), rd.tuningInterval && clearInterval(rd.tuningInterval), rd.tuningInterval = null, rd.rdsTimer && clearInterval(rd.rdsTimer), rd.rdsTimer = null, Pip.removeListener('knob2', i), b && clearTimeout(b), g()
    }
};
//CustomRadioPatchEnd_submenuRadio
let submenuStatus = () => {
    const c = {
        x: 137,
        y: 65,
        repeat: !0
    };
    let a = fs.readdirSync('STAT').sort().filter(a => a.startsWith('VB') && a.toUpperCase().endsWith('AVI') && !a.startsWith('.'));
    if (!a.length)
        return;
    Pip.statIndex == null && (Pip.statIndex = Math.floor(a.length * Math.random() * .999));
    let b = setTimeout(function () {
        b = undefined, Pip.videoStart(`STAT/${ a[Pip.statIndex] }`, c)
    }, 50);
    function d(b) {
        if (b == 0)
            return;
        Pip.statIndex -= b, Pip.statIndex < 0 ? Pip.statIndex = 0 : Pip.statIndex >= a.length ? Pip.statIndex = a.length - 1 : (Pip.knob1Click(b), setTimeout(b => Pip.videoStart(`STAT/${ a[Pip.statIndex] }`, c), 50))
    }
    Pip.on('knob1', d), Pip.removeSubmenu = function () {
        b && clearTimeout(b), Pip.videoStop(), Pip.removeListener('knob1', d)
    }
};
let submenuConnect = () => {
    let a = setTimeout(function () {
        a = undefined, Pip.videoStart(`STAT/CONNECTING.avi`, {
            x: 50,
            y: 73,
            repeat: !1
        }), Pip.on('videoStopped', function () {
            Pip.removeAllListeners('videoStopped'), Pip.videoStart(`STAT/CONNECTED${ 1 + Math.floor(Math.random() * 1.999) }.avi`, {
                x: 50,
                y: 73,
                repeat: !0
            })
        })
    }, 100);
    Pip.removeSubmenu = function () {
        a && clearTimeout(a), Pip.removeAllListeners('videoStopped'), Pip.videoStop()
    }
};
let submenuDiagnostics = () => {
    const e = {
        x: 50,
        y: 42,
        repeat: !0
    };
    let a = fs.readdirSync('STAT').filter(a => a.startsWith('DIAG') && a.toUpperCase().endsWith('AVI') && !a.startsWith('.'));
    if (!a.length)
        return;
    let b = Math.floor(a.length * Math.random() * .999);
    let c = !1;
    let d = setTimeout(function () {
        d = undefined, Pip.videoStart(`STAT/${ a[b] }`, e)
    }, 200);
    function f(d) {
        if (d == 0 || c)
            return;
        c = !0, b = (b + a.length + d) % a.length, Pip.knob1Click(d), setTimeout(d => {
            Pip.videoStart(`STAT/${ a[b] }`, e), c = !1
        }, 100)
    }
    Pip.on('knob1', f), Pip.removeSubmenu = function () {
        d && clearTimeout(d), Pip.videoStop(), Pip.removeListener('knob1', f)
    }
};
let submenuRad = () => {
    var d = Pip.audioBuiltin('CLICK'), k = new Uint8Array(d.length), a = Math.random() * .5 + .02, b = a, c = !1;
    bC.clear();
    var e = dc(atob('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')), f = [
            0,
            0,
            -5,
            -5,
            -130,
            -5,
            -152,
            0,
            -130,
            5,
            -5,
            5
        ], h = setInterval(function () {
            Math.random() < a && (b < .95 && (b += .02), Pip.audioGetFree() > 1e3 && Pip.audioStartVar(d), b > .6 ? c || (Pip.fadeOff([LED_GREEN]), c = !0) : c && (Pip.fadeOn([LED_GREEN]), c = !1))
        }, 25), i = setInterval(function () {
            var c = (Math.random() - .5) * (a + .1);
            b = b * .9 + (a + c * c) * .1, new Uint8Array(bC.buffer).set(e), bC.setColor(3).fillPolyAA(g.transformVertices(f, {
                x: 195,
                y: 194,
                rotate: Math.PI * b
            })), bC.flip()
        }, 100);
    function j(b) {
        b ? (a += b * .03, a < .01 && (a = .01), a > .85 && (a = .85)) : (Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuInvAttach())
    }
    Pip.on('knob1', j), Pip.removeSubmenu = function () {
        clearInterval(h), clearInterval(i), Pip.removeListener('knob1', j), c && (Pip.fadeOn([LED_GREEN]), c = !1)
    }
};
let submenuMap = () => {
    if (fs.statSync('MAP/MAP.img') == undefined) {
        const e = {
            x: 36,
            y: 40,
            repeat: !0
        };
        let d = !1;
        let b = fs.readdirSync('MAP').sort().filter(a => a.toUpperCase().endsWith('AVI') && !a.startsWith('.'));
        if (!b.length)
            return;
        let c = Math.floor(b.length * Math.random() * .999);
        let a = setTimeout(function () {
            a = undefined, Pip.videoStart(`MAP/${ b[c] }`, e)
        }, 200);
        function f(f) {
            if (f == 0 || d)
                return;
            d = !0, c = (c + b.length + f) % b.length, Pip.knob1Click(f), a && clearTimeout(a), a = setTimeout(f => {
                a = undefined, g.clearRect(36, 286, 444, 289), Pip.videoStart(`MAP/${ b[c] }`, e), d = !1
            }, 100)
        }
        Pip.on('knob1', f), Pip.removeSubmenu = function () {
            a && clearTimeout(a), Pip.videoStop(), Pip.removeListener('knob1', f), g.clearRect(36, 40, 444, 65)
        }
    } else {
        var a, e = 2048 - bC.getWidth(), f = 2048 - bC.getHeight(), b = Math.round(Math.random() * e), c = Math.round(Math.random() * f), h = {
                width: 128,
                height: 128,
                bpp: 2
            }, d;
        bC.clear(1).setFontMonofonto23(), bC.setFontAlign(0, 0).drawString('LOADING...', 200, 75), bC.flip();
        var j = setInterval(() => bC.flip(), 50);
        E.defrag();
        function g() {
            d = undefined, a === undefined && (a = E.openFile('MAP/MAP.img', 'r'));
            var l = b >> 7, m = c >> 7;
            for (var f = 0; f < 3; f++) {
                var i = m + f, e = f * 128 - (c & 127);
                if (i >= 0 && i < 16)
                    for (var g = 0; g < 4; g++) {
                        var j = l + g, k = g * 128 - (b & 127);
                        j >= 0 && j < 16 ? (a.seek(4096 * (j + i * 16)), h.buffer = undefined, h.buffer = a.read(4096), bC.drawImage(h, k, e)) : bC.fillRect(k, e, k + 127, e + 127)
                    }
                else
                    bC.fillRect(0, e, BGRECT.w, e + 127)
            }
        }
        var i = setTimeout(function () {
            i = undefined, bH.drawImage({
                width: 370,
                height: 5,
                bpp: 2,
                buffer: require('heatshrink').decompress(atob('qoA/AD9q1QAH0oTICRGqyoSHqwTJExFaHSROIJBupEBBIJGiRvJQZQ6RHIh9TGjaDKXEIA/AC1QA'))
            }, 0, 34).flip(), g()
        }, 250);
        function k(c) {
            if (!a)
                return;
            b += c * 20, b < 0 && (b = 0), b > e && (b = e), d || (d = setTimeout(g, 20))
        }
        function l(b) {
            if (!a)
                return;
            c -= b * 20, c < 0 && (c = 0), c > f && (c = f), d || (d = setTimeout(g, 20))
        }
        Pip.on('knob1', l), Pip.on('knob2', k), Pip.removeSubmenu = function () {
            a && a.close(), i && clearTimeout(i), d && clearTimeout(d), j && clearInterval(j), Pip.removeListener('knob1', l), Pip.removeListener('knob2', k)
        }
    }
};
//AlarmPatchBegin_showAlarm	
let showAlarm = o => {
    Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.remove && Pip.remove(), delete Pip.remove;
    let f = atob('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');
    let h = atob('nUagQGDgX/AAX4CpG/BwfgBo8fBof/oANGgYNE/gcHv4OE6ANGh4NE/4cHBovwI5hIHOQh0Jl4OFwAc/Dn4clZRsDBov8epj2Hn4OG4ANEh4NG/4rGK4hVHAAO/BwfgBo5lFMgxlGMg8Av4OE6AMF8BXGgGwOQmAQI0vOgcP+CtGoJ0DgP9ZQ8L+gqEc44rDgf0c5BnDv8ADg8PM4UL8AcI3wcCAYIcIWAUL+AcI/w5NKxkBKwZpBDg59BBwX+SBgEBDg2BI4afBoQcGj4qDgGgZQ1A0D2EgYNFKgYADBor2BBos/BwyACAAUPBo3/BgcEAQJ0EVgMAgJFCX4W/BwYHC3hFCAQJlFoA0BJQMvfIJlFMgW/wEHGIV/BwgWBgX9dQXgK40A2ArBj/AZ4KBGcQM/of4CIQOFoP/gX4n8B/rnJj/H+AqBc4wHB4H930D+gcHgH8hfv8F/OwIcGh/Q3/9hfgDhG+hZ4B3wcJ8G//0L+AcIBYLBBHJXA3xWKgP8h/nSoQcHPoP9n9A/yQK4QECDg2B/0D/Ef6E/oQcGj+AKYLeB0DKGoGgaoMHNQMDBov8gECAQMv8AfBew0A3+AAQMAn4OG4CfBD4Pgh4NGIYO4gA');
    let i = atob('lk3gQHEngSJ/4KpgP/oAJIAAILGh4KC+ApGAAYJEgYKE4AfHEI0/BQn8BQe/BQn+GpA3EGoo3EBRRAFIQgKVj4KG+gKBl4KG/AKMO4oK/BX4KTUiX8BQIJGAAMAgYKI4DwHeQQqHFgW/BRH9BJAAW/w2KO455Cg4KI6B5BOAJ+Bn/AA4QKD/9C/+ABQqRDBIynCUIQAFSQPwBQ8A3wFE');
    let j = atob('o0ggQHEgf/AAf8DJQQE//wCBMvCIuACBAzFGhYQFGhUPCIwzPGhU/CI3AETN/CI3QCA8LCA3+ERG/CI3gPJ4iJCAwi/EX4i/ETcLETHwCA8/CI/AKxwABCA0DCBH8IhxGKEgogHEhIgIAAMvCIuACBBYGGhRVPRhAOGgPgRg40BEgs/wDAH4EvYIkP/AiIgQ2EBwMAv4RG6EPNYk/4ELCA3+BYQzD+kA34RG8EBGggEBPI4iBh5pDh/gepAJCCAUC/oiKg/4b4ZKBERKXBPIRtBERMDESkCLwQiIhaGBNARtBNBqLRhZXBEREDCYLRDbIIiIv7RDfQQiIh55DHIP8EREDKwg0BERMfGYYABwELIpEgCAh8CAAx3DGooRHGQpYCCA5VFewQQIU4JENIxQkFEA0BA4YgIgYDCn5dCl4RFwANEXwJYIBIgCDLBAwCD4W/GYSMHVAfQh/0gPgRg4eB+EB/8CC4M/wDAH4Ev4EP/BZBAYIiIDwfD/hYCv4RGIIINB/m/GIPAhYQG/yKCl/v+BYBNgIRG8BVBQoQCBPJAiBh4fBSIMP8D1IBIQBB/0C/oiKg/4BYPgP4IiKS4O//xrBERUD/B0BESDBBLwQiIhf0NAb8BNBiLShZXBEREDCYP/aITZBERF/aIPTfQYiIh/4RAM/AoP8EREDDgO/4ADBn4iJj/ALARVBwCiBIo8gEgRVBgAiISoJYCKoQUBCI7KBLAICBcRKpCGYQfB4AFBAA4cBBoIRB+hEIIwUCJAIA==');
    tm0 = null;
    let k = 0, b = 0, e = !1;
    let l = setInterval(function () {
        let g = Date();
        let l = g.getHours();
        let c, m;
        settings.clock12hr ? (c = (l + 11) % 12 + 1, m = l < 12 ? 'AM' : 'PM') : c = l.twoDigit();
        let d = g.getMinutes().twoDigit();
        let a = g.getSeconds();
        if (e) {
            a != ts0 && (bH.clear().flip(), bC.clear(1), bC.setFontMonofonto36().setFontAlign(0, -1), bC.setColor(a & 1 ? 3 : 2).drawString('SNOOZE', 200, 55), bC.setColor(a & 1 ? 2 : 3).drawString(settings.alarm.snooze + ' MIN', 200, 105), bC.flip());
            return
        }
        d != tm0 && (bC.clear(1), Pip.clockVertical ? (bC.drawImage(dc(f), 25, 20), bC.setFontMonofonto96().drawString(c, settings.clock12hr && c < 10 ? 281 : 223, 0).drawString(d, 223, 110), settings.clock12hr && bC.setFontMonofonto28().drawString(m, 350, 177)) : (bC.drawImage(dc(i), 175, 0), bC.setFontMonofonto120().drawString(c, settings.clock12hr && c < 10 ? 93 : 20, 45).drawString(':', 160, 45).drawString(d, 228, 45)), tm0 = d), a != ts0 && (bC.setFontMonofonto120().setFontAlign(0, -1).setColor(a & 1 ? 3 : 1).drawString(':', 196, Pip.clockVertical ? 40 : 45), bH.clear().setFontMonofonto18().setFontAlign(0, -1).setColor(a & 1 ? 13 : 7).drawString('LEFT BUTTON: STOP    TOP BUTTON: SNOOZE', 185, 10, !0).flip(), ts0 = a), (++k & 7) == 0 && (Pip.clockVertical ? bC.setColor(3).drawImage(dc(h), 14, 28, { frame: b }) : bC.setColor(3).drawImage(dc(j), 162, 10, { frame: b }), b = ++b % 3), bC.flip()
    }, 50);
    let a;
    function c() {
        a && clearTimeout(a), a = undefined, Pip.audioStop(), Pip.videoStop(), configureAlarm(), showMainMenu()
    }
    function m(a) {
        a == 0 ? (delete settings.alarm.snoozeTime, saveSettings(), c()) : (Pip.clockVertical = !Pip.clockVertical, bC.clear(1).flip(), tm0 = null)
    }
    a = setTimeout(c, 6e5), Pip.on('knob1', m), Pip.on('knob2', c);
    function n() {
        E.stopEventPropagation(), e = !0, ts0 = null, Pip.audioStop(), settings.alarm.snoozeTime || (settings.alarm.snoozeTime = settings.alarm.time), settings.alarm.snoozeTime += 6e4 * settings.alarm.snooze, settings.alarm.enabled = !0, saveSettings(), console.log('Snoozed - reconfigured for', new Date(settings.alarm.snoozeTime).toString()), a && clearTimeout(a), a = setTimeout(c, 3e3)
    }
    settings.alarm.snooze && Pip.prependListener('torch', n), Pip.remove = function () {
        a && clearTimeout(a), a = undefined, clearInterval(l), Pip.removeListener('knob1', m), Pip.removeListener('knob2', c), Pip.removeListener('torch', n)
    };
    let d = settings.alarm.soundIndex;
    d >= settings.alarm.soundFiles.length ? setTimeout(a => {
        rd.enable(!0)
    }, 1e3) : (o && console.log('Playing alarm sound file: ' + settings.alarm.soundFiles[d]), Pip.audioStart(`ALARM/${ settings.alarm.soundFiles[d] }`, { repeat: !0 })), g.clear(), bH.flip(), bF.flip(), Pip.brightness = 20, Pip.fadeOn()
};
//AlarmPatchEnd_showAlarm
let submenuInvAttach = () => {
    let a = 1;
    let b = [
        atob('qFogQKHgtVqgeQlWq1MVqATOssArWq1VACJcBoOgFINVq2QCZYjBBwNkDIIpB0oSIi2ptWpqgpBCYQ+JlQeBq2q0kAgQsBg2ACY9pGYQUB0sGEgMByNVPo1kgoQBoEW1WWCYQ9B1ITF0kVCgcVAYUB0tVrRSF0Fq0tFAQNAgppBqRSBgRSEIgOlGINBR4NQgKTDgKlEgOSyA3B1NRrWpCgYDBCYkCwQuBG4OqJIOqqi9B0ATFg1GwFlJgQUDquqCY9KoKCBG4elUgOUCY0KhTVDG4IRBwEpQYITFjMZgQTCEQL3ByFkgFgoITGgwTD1WVoOgCYJABCYkplITFBwITD1ITElFohQTFBwOggGlioTEslkCY2myIPB0EZCYukjQTGwIPB0spCYmg0EqCY1BaAOqkoTDgOhCY+qoQTBzNhCYhFBa4IAEzUGoATBqITEyWACY2ZCYMBzJnCAAMCw2AHQ2phQgBzJnCAAMGo1BCYynBCZFKCY9kjITB1ITEhUagQ6G0gTDoITDjMZdw2p0EoCYOqCZ2QCZEojRPG02QsgTIg2pqoTFwATDFoITCsgHCooTEoGgCYVaCYUGAYMFCgIpDzQ2CT4NaeYMAjTjBCgdWCYUBCYQGBCYVpgFZqApF1MCBwMByonCgWkgOUsoqBgtqCgNoCYYnBFgI6BgtWqopE0ukgwbBCYOlCYI6BjVVlNU0opCEAITD1JUBgI6BqtlqIpFfIKZCoATBHQMBywQBqtpFIYTEFIOQlKICtNV0tRyoYBfIQTFtWUAoMVytWFIVV0gTI1VUZQVkrIpCHgNoCYtki2qFI5ZBFIITFgDUBFIg6CfIQTGgFaCgYpBRgNqCQYTFCgQPBgFKHQwTGgIUEHQwTGCg0qWoQTJCgY6HCZAIBtWpow6FCZIUCFIITPeoQdHCZMAlAT/Cf4T3ioTRg2qygTQtNAjITPg2kgNWoATOjVB1VVsgTOlUK1IrBoITNtFqyBOByITMgOk1WBoEAsoTMg2S1VKwEAjITNy2pjQTBgwTMhVK1BQCiwTMjVaKAITBlITMlUC0uq0EA1ITMtMB0Oq0sB1VQCZp4B1QCBsATLtECCAOkswTN1ATCyEaCYNlCZgRBwATB0lq0oTMgOAhWqykWNIITQWwOqyoTQCgQECCY8AyEJrQODFIwTDYoNgjEAqgNDipqBWYsGCYMpTgMkGwg+ECYUaDYMaHwITFCgkog2qlQTBtQTBkCIGVIOUlFqrVa1MAZAJSBWI9WfoOlhWa1MB1RSBqDaIHwNAg2W1UCCYQpBABEUgEB0uqoyCBWwITJAAWprQpB0kGoATMjWWFIOkjQSMHgNVFIOoU4IAOtVRqpiKHowoBJxo9DfQgAmA'),
        atob('nk4gQFClQMFgWgAwuqBwwHFhWqwAHLlQOGA4ItE1QGFBwWoGQgGECwY8DGQIOJGoQjBCoglDGoYOOAoRaEGgQ1CCgYOEEoYmBBwhpDBwojDLQgHDEwIOOEYhaCGggOP0AOFLQI0EBwIFEBwQWFBwxpBBwuoBwpaBA4wOU0EgFhmK1RZFBwwMBwQOaHIOiKQwAEBwLyDABAsBBzcAGgwAVJQLEBBzJxIBycCSAR2MByCHKfYZaKBxzbKLAwOPLRJYDLRQOOLAZaKBxwNELRBYFLRAOOLApaIBxxKOUh7+PABI'),
        atob('vF2gQmjgIdcgwddoAd/Du2ADbMQDoOQDrMUgEFDvEYgEBDrUZDrkaDrjtBgOkDvGQDvz0BACwbBDp0BDrkFqAdN1EAsgQKitUDpeoDpkVoFVqtADZAJBtMB1IdKrWVqtlHhOQgFqDpIrBgOq1Nq1Q8JC4NqoOpeI8ByEG1QACyodIlIdLg2lrQdD1K1FAoUZgEqDpQbDAAQdFPwUaoEayKXBDpNW1VRAgOUBolZCAWQjWQrMCDpGptNlqCWB0oNEHAIQB0kJoEVAgIdH0o8BWgWpSwkGIQJUEDo8F1WaOoSZCPAjpCAQQVCDo9pG4LQCqtaSwtqfwIdDgL1BNItVWIeltVWyAOErQGBtLaGDolad4g9BWgsaToMkDAoAEjNpDoWmHoRpFgydBiAdKSoIACyICB0NUBwkB1RhCgtVLAwOCAAWkLIQdFSwJDBgrfCDozvBAATvB1NVDo0aDAKIDfogdC0qUEDpAtBooPDYIqkCDpqHBYYgdH0OqzQQCDpEBtMaDpUqHYNa1IQBDpEArMqDoeAUYySDDoOlYhEVHYjBHDAIfBLIIdJYompa4IdGyIMBEQQdJioNB1WWDpGGJIYdBDg6nBqoABtQdIywdESg4dCUINW1RZLHZh3DDpKVBHZodNAAmVDqtpDwQ9CDpUBDpVlQIIaBEIIdPoA7GtK/BrMa1VVDpJsD1IKGtOaBYQdNdoIOBHY0qOgVWtTiBDpQeBqtaDoz7CFYNqdwNQDpVafxBUByoMBBoQsGPA2W1QtFboghBDhYxCRgLSFDoOVDoRIGaIwRDWordEPYIdKJoVaHYLTGboaTMK4J2BcwRrFSaAdMix1CLBZZDDoOpDo0FDodFHhUBNYNWNgLGGrIMB0tZqtUWhdUjWa0rUByqzEwyWCtWUS5UV1NWDQIWCKQIAB1WQI4IpByJ6KlQPBJoI0DAAVq0kVtIfBqzUKDoWpO4IdFqrtBqtq0tayp5JaQJLBGgIdFBIIaBEQLzLWgJLBDo5DBH4S3BAYJaJitRHZQgBFYTfBLRDGBYYIdBzQdIHQQEBWpEGBgJrBAQYAC0xcFLRQ7B1Q4BzQdOLRIYBAIOZDouWDo61BDo8FUoRtFDpJ4JgI3CypOETYaYCPAjxIDoRwCdIYdCBIgpCeJC1CaAZrBDpWlSxAdGqodBIo6WLaYKUBtSHBqtRDph4JykVDYNVqkBDph4IHwQdCoAdBa4QdTgA8BBoIdHeoQdCSxBAHDoyFBDoaWIDp9WAYQdZbQIdXOgRVBgr9DDqw3BgFVDqMAHZEAHgIdZZgMGDoLRPDpUaDr9QDrNqTIIddoAdT0wCBytQgK3CDqFVDopUBDoOVaCA7BDII0CDgNQaAIdSlQdCOAIeCdyYdEHoYdbKgJ3BIIIdRjQcDLQVQiI/CDqqWDkgDBaCAdFSodpiodWHQVVqOqoLQRDobQDDoSTRDoYcEAAIdVDgw7VRYIdHqsUDqMFDpI8agDWCDqQ9EqAGBtWUDqgAGtWVDrcqDrka0qVTPxFQPgQA==')
    ];
    let c = [
        submenuExtTerminal,
        submenuRad,
        showTorch
		/*CameraModuleInsert_Menu*/
    ];
    function d() {
        bC.clear(1).setFontMonofonto23().setFontAlign(-1, 0);
        let e = 0, d = 220, c = 40;
        const f = [
            'EXT TERMINAL',
            'RAD METER',
            'FLASHLIGHT'/*CameraModuleInsert_Title*/
        ];
        f.forEach((b, f) => {
            f == a ? (bC.setColor(2).fillRect(e, c - 21, d, c - 18).fillRect(d - 3, c - 17, d, c + 16).fillRect(e, c + 17, d, c + 20), bC.setBgColor(1).clearRect(e, c - 17, d - 4, c + 16), bC.setColor(3).fillRect(50, c - 5, 59, c + 4)) : (bC.setBgColor(0).clearRect(e, c - 21, d, c + 20), bC.setColor(2)), bC.drawString(b, 70, c), c += 50
        }), bC.setBgColor(0).setColor(3), b[a] && bC.drawImage(dc(b[a]), 310, 90, { rotate: 0 }), bC.flip()
    }
    d();
    function e(b) {
        if (b) {
            let c = a;
            /*CameraModuleBegin_ScrollFix*/a = E.clip(a - b, 0, 2), a != c && Pip.knob1Click(b), d()/*CameraModuleEnd_ScrollFix*/
        } else
            c[a] && (Pip.audioStartVar(Pip.audioBuiltin('OK')), Pip.removeSubmenu(), c[a]())
    }
    let f = setInterval(function () {
        bC.flip()
    }, 50);
    Pip.on('knob1', e), Pip.removeSubmenu = function () {
        Pip.removeListener('knob1', e), clearInterval(f)
    }
};
//CameraModuleInsert_CameraFunction	   
//InvPatchInsert_ItemsFunction
//PerksPatchInsert_PerksFunction
//SpecialPatchInsert_SpecialFunction
let submenuExtTerminal = () => {
    E.setUSBHID({ reportDescriptor: atob('BQEJBqEBdQGVCAUHGeAp5xUAJQGBApUBdQiBA5UFdQEFCBkBKQWRApUBdQORA5UGdQgVACVoBQcZAClogQDA') });
    var c = 0;
    function d() {
        c++, E.sendUSBHID([
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]) ? e() : (bC.clear().setFontAlign(0, -1).setColor(3), drawVaultTecLogo(199, 15, bC), bC.setFontMonofonto23().drawString('Connecting' + [
            '.  ',
            '.. ',
            '...'
        ][c % 3], 199, 115, !0), bC.setFontMonofonto16().drawString('Please reconnect USB', 199, 145, !0), bC.flip())
    }
    function e() {
        function f(b, a) {
            E.sendUSBHID([
                j,
                0,
                b,
                0,
                0,
                0,
                0,
                0
            ]), setTimeout(function () {
                E.sendUSBHID([
                    j,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ]), a && setTimeout(a, 5)
            }, 5), Pip.kickIdleTimer()
        }
        function n(a, d, b) {
            b = b || 20;
            var e = setInterval(function () {
                a.length ? (a[0] in c && f(c[a[0]]), a = a.substr(1)) : (clearInterval(e), d && d())
            }, b)
        }
        function o() {
            Pip.removeSubmenu(), delete Pip.removeSubmenu, bC.clear().setFontAlign(0, -1).setColor(3), drawVaultTecLogo(199, 15, bC), bC.setFontMonofonto23().drawString('Sending...', 199, 115, !0), bC.flip()
        }
        function g(a) {
            polys = [
                [
                    200,
                    20,
                    220,
                    40,
                    210,
                    40,
                    210,
                    60,
                    190,
                    60,
                    190,
                    40,
                    180,
                    40
                ],
                [
                    200,
                    180,
                    220,
                    160,
                    210,
                    160,
                    210,
                    140,
                    190,
                    140,
                    190,
                    160,
                    180,
                    160
                ],
                [
                    100,
                    100,
                    120,
                    80,
                    120,
                    90,
                    140,
                    90,
                    140,
                    110,
                    120,
                    110,
                    120,
                    120
                ],
                [
                    300,
                    100,
                    280,
                    80,
                    280,
                    90,
                    260,
                    90,
                    260,
                    110,
                    280,
                    110,
                    280,
                    120
                ]
            ], bC.setFontMonofonto23().setFontAlign(0, 0), h && clearTimeout(h), h = setTimeout(b => {
                polys.forEach((b, c) => {
                    bC.setColor(a == c ? 3 : 1).fillPoly(b)
                }), bC.setColor(0), bC.setBgColor(a == 4 ? 3 : 1).clearRect(165, 85, 235, 115).drawString('ENTER', 200, 101), bC.setBgColor(a == 5 ? 3 : 1).clearRect(275, 25, 345, 55).drawString('ESC', 310, 41), bC.setBgColor(a == 6 ? 3 : 1).clearRect(275, 145, 345, 175).drawString(d.labels[d.keyIndex], 310, 161), bC.setBgColor(0), h = null, bC.flip()
            }, a === null ? 100 : 0)
        }
        function e() {
            g(null)
        }
        function p() {
            E.showMenu({
                '': { title: 'Terminal Connected' },
                'Hello World': function () {
                    o(), n('HELLO WORLD', p)
                }
            })
        }
        function k(a) {
            a ? a < 0 ? (g(1), f(c.DOWN, e)) : (g(0), f(c.UP, e)) : (g(4), f(c.ENTER, e))
        }
        function l(a) {
            a < 0 ? (g(2), f(c.LEFT, e)) : (g(3), f(c.RIGHT, e))
        }
        function m() {
            g(5), f(c.ESC, e)
        }
        function i(a) {
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
                '\n': 40,
                ESC: 41,
                BACKSPACE: 42,
                '\t': 43,
                ' ': 44,
                '-': 45,
                '=': 46,
                '[': 47,
                ']': 48,
                '\\': 49,
                NUMBER: 50,
                ';': 51,
                "'": 52,
                '~': 53,
                ',': 54,
                '.': 55,
                '/': 56,
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
            }, j = 0;
        let h;
        let d = {
            v: null,
            keys: [
                c['\t'],
                c[' '],
                c.DELETE,
                c.BACKSPACE,
                c.HOME,
                c.END
            ],
            labels: [
                'TAB',
                'SPACE',
                'DEL',
                'BACK',
                'HOME',
                'END'
            ],
            keyIndex: 0
        };
        clearInterval(b), b = undefined, clearInterval(a), a = setInterval(() => {
            BTN_PLAY.read() ? d.v == null && i(0) : BTN_TUNEUP.read() ? d.v == null && i(1) : BTN_TUNEDOWN.read() ? d.v == null && i(-1) : d.v = null, bC.flip()
        }, 50), Pip['#onknob1_old'] = Pip['#onknob1'], delete Pip['#onknob1'], Pip['#onknob2_old'] = Pip['#onknob2'], delete Pip['#onknob2'], Pip['#ontorch_old'] = Pip['#ontorch'], delete Pip['#ontorch'], Pip.on('knob1', k), Pip.on('knob2', l), Pip.on('torch', m), Pip.removeSubmenu = function () {
            a && clearInterval(a), Pip.removeListener('knob1', k), Pip.removeListener('knob2', l), Pip.removeListener('torch', m), Pip['#onknob1'] = Pip['#onknob1_old'], delete Pip['#onknob1_old'], Pip['#onknob2'] = Pip['#onknob2_old'], delete Pip['#onknob2_old'], Pip['#ontorch'] = Pip['#ontorch_old'], delete Pip['#ontorch_old'], Pip.HIDenabled = !1
        }, bC.clear(), e()
    }
    var b = setInterval(d, 1e3), a = setInterval(() => bC.flip(), 50);
    Pip.removeSubmenu = function () {
        b && clearInterval(b), a && clearInterval(a)
    }, d()
};
let submenuApparel = () => {
    let b = 'PROCEDURES!\n\nVault-Tec provides all clothing, bedding, and accommodations for residents.\n\nPersonal belongings must be reviewed and approved of by an authorized Vault-Tec hermetics technician before such belongings can be delivered to your reserved quarters within the Vault.\n\nAll Vault residents must attend an orientation seminar. If you did not attend such a seminar as part of the application process, you must make an appointment with your Vault-Tec representative.\n';
    bC.setFontMonofonto16().setFontAlign(-1, -1).setColor(3);
    let a = -223, c;
    function d(b) {
        a -= b * 10, a < -400 && (a = 200), a > 200 && (a = -400)
    }
    function e() {
        a !== c && (c = a, bC.clear(), a > -100 && drawVaultTecLogo(199, a + 15, bC), bC.drawString(b, 20, a + 120)), bC.flip()
    }
    Pip.typeText(b).then(() => {
        b = bC.wrapString(b, 350).join('\n'), Pip.drawInterval = setInterval(e, 50), Pip.on('knob1', d)
    }), Pip.removeSubmenu = function () {
        Pip.typeTimer && (clearInterval(Pip.typeTimer), delete Pip.typeTimer), Pip.drawInterval && (clearInterval(Pip.drawInterval), delete Pip.drawInterval, Pip.removeListener('knob1', d))
    }
};
let submenuStats = () => {
    const e = {
        x: 36,
        y: 41,
        repeat: !0
    };
    let a = fs.readdirSync('MISC').sort().filter(a => a.toUpperCase().endsWith('AVI') && !a.startsWith('.'));
    if (!a.length)
        return;
    let b = Math.floor(a.length * Math.random() * .999);
    let c = !1;
    let d = setTimeout(function () {
        d = undefined, Pip.videoStart(`MISC/${ a[b] }`, e)
    }, 200);
    function f(d) {
        if (d == 0 || c)
            return;
        c = !0, b = (b + a.length + d) % a.length, Pip.knob1Click(d), setTimeout(d => {
            g.clearRect(36, 41, 444, 288), Pip.videoStart(`MISC/${ a[b] }`, e), c = !1
        }, 100)
    }
    Pip.on('knob1', f), Pip.removeSubmenu = function () {
        d && clearTimeout(d), Pip.videoStop(), Pip.removeListener('knob1', f)
    }
};
let submenuAbout = () => {
    let g = atob('y1kgQURgOkHUcqwAkig2ZJUdlyAkihWqJUea0AkiiuqoAkhgWq0hKilVGwAkhg2gtBKitWayAkhhVq1IebjAFEgOhtWgBAkZEikD8AcFhWqTowlUj7YEgWl1WkKQmoOCt+Dgmq3Xq6jCEEisB/hJDzXogXZJYcaLAgARg6WDsFq/e9wAgCSiyWC4BKC1WViuaSAUB7gkWSwNAAYMkhNVrECA4VmEi6WDgVq1Va11gA4MdyAlXg/wAYMZkFQqGaSgVwEi6WDgOG1Wu1FQAwPYEjEAv4CBhe9tUf9iUCTASWX/sGs2/w2o3+UskZSjBHC+P///R1WSAgOGugkZSwPb//k1Wqo//8WcEjUA38Vqlq1Wpguk0YkbgX9gNaJQOpoCUbEgPL+gjBAAWKsnQErV/l65BAAWSxM/oAkZg/g39GEgSUBof0JTU/oX9jSVClGQvwkagP4hf0cAOqpUkp6Vbh/ISweSxUl/AkagG9sCWC0mixUvXTS7B6WSSwKUByOi+BKbv0qh6WBpUo1U/EjcD8WoSwOSpUayfgErc/lWg/+A0WG1M+JTuqwX8mmh1WjJTk+lWqj0NlFq1KVcg5KB1EKSgOqcDt9tWqyWCwOq1UvoAkah/G1Wk0Eyo2q0v4EjUB/Gq1MohM9OANP6Alan9a1VKgWP+lq1F+N7fhSgOA0X/6OqyZwagX8IgOgmkL/6WBp/gN7VKSgUol/9jWo3y6aJQKUBxWk36WBXbcL8VSSgOqwSWBsSVaOANB0EktWqpf/yF/EbMFgP40kKlWq1Ev/+P6FQErGphdYgWG1WqSwP93ErEjEItESoFhEgOqw//80dkDfYwGk6EJSgOq1JwBxUCoAlX0mp2kGxRKC0n//2LpolX1EtvMCyAkC1VB//71MaEi0GhU2oGhwQkCyOj//ZsmgEq0ewPQlF/oxvCv+f/9B2iVX0FKhWn/0GEgMv81/8EHEi8okk60VL/0Fykv/GW/skjAkWhUCiHi1kf/1At/9h2XhMQsAlWwGqoWCwEv/+//sAuPA1VDEi0JhsJhVwgAlB/0AgOgqskmAlWmECpEeAoMb/IDBvECpMJEi0C4Fg2kdBIlogcJgXQEq2egkYoEqoAICtMCrFQv4IDACUonECgWAjWliMW2sAyl4j7ABACkNgPQqGYgEFtWqqEBhGggX/+iUVoFmwBuBigJCgk40UA6//SytglEKgNwgVhwNQinCyWQskf/xKVhUAjsCgE0s1pgPtk8AlMAn/wEqkvaQMogEGoVBoEKqdUjUAgO9XaoACukA0FWS4OGiEKGAIAavEBw2RwEIiEaEjkAtNAggFCrwkdgFbyoDBi2pEboABgur3e6qgkfAH4A/AFUD//42kehf/6ED4HwnkH4ELwG0l/0CgMuoEC+kC6EPhf9gEfBYIIB+Een//xdB8G/BwM8h4nB3sA3kLoX/+EAh/+gAFBl8C+G//gsC+EtCYPQj0AJQVAKQPA+gnB6EL6G0lsPI4Pg+kuDIP4v4dCn9Al4EBvE8gPghZKB2hjBlsfo+A90A3wYCvBWBg+D4F4l/f+G0j8D3EC/EtgfHwBKGgPR/F0jvwhYYBlqbBKwMQE4OC9/vCwPwu/Al/C6Es2hKHj0v49B5cA39LJQN8JQJ+CvEt3pKCg8sgX9lsB74dBJQsA+es2EsukLvhKFOQWC6dPPgWx6Et+TpB8BKC/7gB6DUBmvPgeDoG15ZKJkDgCh0NgXXlsAfAJKB3/+hf9JQO3rvwmk4hdNJRJBBhf+gHQ8Etm3QCIKVHg/w/0HofA2n/JRMASoMAjsPgXTIIIRBSo9/h/Q328hdH+jgIJQVAgX6+Etj5KKgfw/kP//Q2k/JQN4NoWDJQ0/LQRKLn8L4HwBANDJQMPIAPg+kubgRKCO4ZiBJQ2/FwMD8F8F4I8Bj9C//wdgKzBAoJKEvED4XQvpKHNIKlBg+BHgf0l/0KwMuJoP0gQNDg9AnktgfQKAI=');
    let c = E.getTemperature();
    let d = () => {
        let b = process.memory();
        let d = Pip.measurePin(VUSB_MEAS);
        let e = Pip.measurePin(VBAT_MEAS);
        let f = CHARGE_STAT.read() == 0;
        c = c * .99 + E.getTemperature() * .01;
        let a = '============ Pip-Boy 3000 Mark V ===========\n\nPip-OS ' + process.env.VERSION + ' - ' + VERSION + '\nSerial number: ' + Pip.getID() + '\n\n';
        return settings.userName && (a += 'Pip-Boy assigned to ' + settings.userName + '\n\n'), a += `Battery: ${ e.toFixed(1) }V`, d > 1 ? (a += `, USB: ${ d.toFixed(1) }V`, f ? a += ' (charging)\n' : e > 4 ? a += ' (charged)\n' : a += ' (not charging)\n') : a += ' (not charging)\n', a += 'Memory used: ' + b.usage + '/' + b.total + ' blocks\nCore temperature: ' + c.toFixed(1) + ' C\n\n', a += 'Built for Vault-Tec by The Wand Company\n', a
    };
    bC.setFontMonofonto16().setFontAlign(-1, -1).setColor(3);
    let e = d().split('\n').length * bC.getFontHeight();
    let a = 90 - e, b = -200 - e;
    function f(c) {
        a -= c * 10, a < b && (a = 190), a > 190 && (a = b)
    }
    function h() {
        bC.clear(), a > -100 ? drawVaultTecLogo(199, a + 15, bC) : a < 310 + b && bC.drawImage(dc(g), 125, a - 90 - b), bC.drawString(d(), 20, a + 120), bC.flip()
    }
    Pip.typeText(d()).then(() => {
        Pip.drawInterval = setInterval(h, 50), Pip.on('knob1', f);
        let a = 0;
        scrollInterval = setInterval(function () {
            f(1), ++a > 8 && clearInterval(scrollInterval)
        }, 100)
    }), Pip.removeSubmenu = function () {
        Pip.typeTimer && (clearInterval(Pip.typeTimer), delete Pip.typeTimer), Pip.drawInterval && (clearInterval(Pip.drawInterval), delete Pip.drawInterval, Pip.removeListener('knob1', f))
    }
};
let getUserVideos = () => {
    var a = [];
    try {
        a = fs.readdirSync('USER').filter(a => a.toUpperCase().endsWith('AVI') && !a.startsWith('.'))
    } catch (a) {
    }
    return a
};
let submenuVideos = () => {
    var b = getUserVideos();
    function c(b) {
        function a(a) {
            a || submenuVideos()
        }
        Pip.removeSubmenu(), Pip.videoStart('USER/' + b), Pip.on('knob1', a), Pip.removeSubmenu = function () {
            g.clear(), bH.flip(), drawFooter(), Pip.removeListener('knob1', a), Pip.videoStop()
        }
    }
    var a = {};
    b.length ? (b.forEach(b => {
        a[b.slice(0, -4)] = function () {
            c(b)
        }
    }), a['< Back'] = submenuMaintenance, E.showMenu(a)) : (Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuBlank("NO VIDEOS\nADD TO 'USER' DIR")())
};
let getUserAudio = () => {
    var a = [];
    try {
        a = fs.readdirSync('USER').filter(a => a.toUpperCase().endsWith('WAV') && !a.startsWith('.'))
    } catch (a) {
    }
    return a
};
let submenuAudio = () => {
    var b = getUserAudio(), a = {};
    b.length ? (b.forEach(b => {
        a[b.slice(0, -4)] = function () {
            Pip.audioStart('USER/' + b)
        }
    }), a['< Back'] = submenuMaintenance, E.showMenu(a)) : (Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuBlank("NO AUDIO FILES\nADD TO 'USER' DIR")())
};
let getUserApps = () => {
    var a = [];
    try {
        a = fs.readdirSync('USER').filter(a => a.toUpperCase().endsWith('JS') && !a.startsWith('.'))
    } catch (a) {
    }
    return a
};
let submenuApps = () => {
    var files = getUserApps();
    function startApp(app) {
        Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.remove && Pip.remove(), delete Pip.remove, g.clear(BGRECT), g.reset().setFontMonofonto28().setFontAlign(0, 0), g.drawString('Loading\n' + app, BGRECT.x + BGRECT.w / 2, BGRECT.y + BGRECT.h / 2), eval(fs.readFile('USER/' + app))
    }
    var menu = {};
    if (files.length) {
        var nameMap = {};
        try {
            fs.readdirSync('APPINFO').forEach(b => {
                if (!fs.statSync('APPINFO/' + b).dir) {
                    var a = JSON.parse(fs.readFile('APPINFO/' + b));
                    nameMap[a.id] = a.name
                }
            })
        } catch (a) {
        }
        files.forEach(b => {
            var a = b.slice(0, -3);
            a in nameMap && (a = nameMap[a]), menu[a] = function () {
                startApp(b)
            }
        }), E.showMenu(menu)
    } else
        Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuBlank("NO JS FILES\nADD TO 'USER' DIR")()
};
let submenuSetAlarm = () => {
	//AlarmPatchInsert_CustomRadio
    var b, a = {
			//AlarmPatchInsert_TriggerAlarm
            'Set alarm time': function () {
                Pip.removeSubmenu(), delete Pip.removeSubmenu, submenuSetAlarmTime()
            },
			//AlarmPatchBegin_AddStations
            'Alarm sound': {
                value: settings.alarm.soundIndex,
                min: 0,
                max: settings.alarm.soundFiles.length,
                step: 1,
                format: a => a >= settings.alarm.soundFiles.length ? 'FM ' + rd.freq.toFixed(1) : settings.alarm.soundFiles[a].slice(0, -4),
                onchange: a => {
                    settings.alarm.soundIndex = a, a < settings.alarm.soundFiles.length ? Pip.audioStart('ALARM/' + settings.alarm.soundFiles[a]) : Pip.audioStop(), b && clearTimeout(b), b = setTimeout(function () {
                        saveSettings()
                    }, 5e3)
                }
            },
			//AlarmPatchEnd_AddStations
            'Alarm on/off': {
                value: settings.alarm.enabled,
                format: a => a ? 'On' : 'Off',
                onchange: a => {
                    settings.alarm.enabled = a, saveSettings(), configureAlarm(), drawFooter()
                }
            },
            'Repeat alarm each day?': {
                value: settings.alarm.repeat,
                format: a => a ? 'Yes' : 'No',
                onchange: a => {
                    settings.alarm.repeat = a, saveSettings(), console.log('Alarm repeats:', settings.alarm.repeat ? 'Yes' : 'No')
                }
            },
            Snooze: {
                value: 0 | settings.alarm.snooze,
                format: a => a ? a + ' min' : 'Off',
                min: 1,
                max: 30,
                step: 1,
                onchange: a => {
                    settings.alarm.snooze = a, saveSettings(), console.log('Alarm snooze:', settings.alarm.snooze)
                }
            }
        };
    settings.alarm.snoozeTime && (a['Cancel Snooze'] = function () {
        delete settings.alarm.snoozeTime, saveSettings(), configureAlarm(), drawFooter(), submenuSetAlarm()
    }), a['< Back'] = submenuMaintenance, E.showMenu(a)
};
let submenuMaintenance = () => {
    var a, b = {
            'Set date & time': function () {
                Pip.removeSubmenu(), submenuSetDateTime()
            },
            'Timezone (offset from UTC)': {
                value: settings.timezone || 0,
                min: -12,
                max: 14,
                step: 1,
                format: a => (a > 0 ? '+' + a : a) + (a == 1 || a == -1 ? ' hr' : ' hrs'),
                onchange: (b, c) => {
                    settings.timezone = b, E.setTimeZone(b), settings.alarm.time && (settings.alarm.time -= c * 36e5), drawFooter(), a && clearTimeout(a), a = setTimeout(function () {
                        saveSettings()
                    }, 5e3)
                }
            },
            '12/24 hour display': {
                value: !!settings.clock12hr,
                format: a => a ? '12 hr' : '24 hr',
                onchange: a => {
                    settings.clock12hr = a, drawFooter(), saveSettings(), console.log('12/24 hour display set to', settings.clock12hr ? '12 hr' : '24 hr')
                }
            },
			//AlarmPatchBegin_removeOldAlarm
            'Set alarm': function () {
                Pip.removeSubmenu(), submenuSetAlarm()
            },
			//AlarmPatchEnd_removeOldAlarm
            'Display timeout': {
                value: settings.idleTimeout ? Math.round(settings.idleTimeout / 6e4) : 31,
                min: 1,
                max: 31,
                step: 1,
                format: a => a < 31 ? a + ' min' : 'Never',
                onchange: b => {
                    settings.idleTimeout = b < 31 ? b * 6e4 : 0, a && clearTimeout(a), a = setTimeout(function () {
                        saveSettings()
                    }, 5e3)
                }
            },
            'Display brightness': {
                value: Pip.brightness,
                min: 1,
                max: 20,
                step: 1,
                onchange: a => {
                    Pip.brightness = a, Pip.updateBrightness()
                }
            },
            'Display color': function () {
                Pip.removeSubmenu(), submenuPalette()
            },
		//MaintenancePatchInsert_RAMScanToggle
		//CameraModuleInsert_CorruptionToggle
		//CustomRadioPatchInsert_RandomToggle
            'Demo mode': enterDemoMode,
            About: function () {
                Pip.removeSubmenu(), submenuAbout()
            },
            Reboot: function () {
                clearWatch(), clearInterval(), E.showMessage('Rebooting...'), setTimeout(E.reboot, 2e3)
            }
        };
    getUserVideos().length && (b['Play videos'] = submenuVideos), getUserAudio().length && (b['Play audio files'] = submenuAudio), E.showMenu(b)
};
let drawHeader = b => {
    let a = 50;
    bH.clear(1).setFontMonofonto18().setFontAlign(-1, -1), bH.drawImage(dc(icons.cog), 1, 1), modes.forEach((c, d) => {
        b == d + 1 && bH.drawPoly([
            0,
            28,
            a - 10,
            28,
            a - 10,
            14,
            a - 5,
            14
        ]), bH.drawString(c, a, 7), a += c.length * 9, b == d + 1 && bH.drawPoly([
            a + 5,
            14,
            a + 10,
            14,
            a + 10,
            28,
            369,
            28
        ]), a += 24
    }), bH.drawImage(dc(icons.holotape), 345, 1);
    let c = MODEINFO[b];
    c.submenu && (a = 50, Object.keys(c.submenu).forEach((b, c) => {
        bH.setColor(15 / (1 + Math.abs(c - sm0))).drawString(b, a, 34), a += bH.stringWidth(b) + 10
    })), bH.flip()
};
let drawFooter = () => {
    let a = Pip.getDateAndTime();
    let g = (a.getMonth() + 1).twoDigit();
    let h = a.getDate().twoDigit();
    let e = a.getHours();
    let i = settings.clock12hr ? ((e + 11) % 12 + 1).toString().padStart(2, ' ') : e.twoDigit();
    let j = a.getMinutes().twoDigit();
    let k = a.getFullYear() + '-' + g + '-' + h + ' ' + i + ':' + j;
    bF.clear(1).setBgColor(1).setColor(3), bF.clearRect(0, 0, 148, 24).clearRect(152, 0, 238, 24).clearRect(242, 0, 371, 24), bF.setFontMonofonto16().setFontAlign(-1, -1).drawString(k, 10, 4), bF.drawRect(162, 5, 212, 19).fillRect(212, 9, 215, 15);
    let c = Pip.measurePin(VBAT_MEAS);
    let d = 3.5, f = 4.1;
    VUSB_PRESENT.read() ? (bF.drawImage(dc(icons.charging), 223, 4), CHARGE_STAT.read() == 0 && (d = 3.6, f = 4.2)) : c < 3.5 && (bF.drawString('!', 224, 4), c < 3.3 && Pip.sleeping === !1 && Pip.offOrSleep({
        immediate: !1,
        forceOff: !0
    }));
    let b = (c - d) / (f - d) * 48;
    if (b < 1 && (b = 1), b > 48 && (b = 48), bF.setColor(2).fillRect(163, 6, 163 + b, 18).setColor(3), Pip.demoMode)
        bF.drawString('DEMO MODE', 252, 4);
    else if (settings.alarm.time) {
        let a = new Date(settings.alarm.time);
        let b = 0;
        bF.setColor(settings.alarm.enabled ? 3 : 2), settings.alarm.snoozeTime && (a = new Date(settings.alarm.snoozeTime), bF.drawImage(icons.snooze, 250, 3), b = 21), bF.drawString(a.getHours().twoDigit() + ':' + a.getMinutes().twoDigit(), 252 + b, 4), bF.drawImage(dc(settings.alarm.enabled ? icons.alarm : icons.noAlarm), 300 + b, 3)
    }
    bF.flip(), (Pip.radioOn || Pip.brightness < 20) && !Pip.audioIsPlaying() && Pip.audioStartVar(new Uint8Array(Pip.radioOn ? 4 : 2))
};
let vPrev = 0;
let checkMode = () => {
    let a = MODE_SELECTOR.analog();
    if (Math.abs(a - vPrev) < .003) {
        let b = 1;
        if (a > .9 ? (pinMode(MEAS_ENB, 'input'), pinMode(MEAS_ENB, 'output'), MEAS_ENB.write(0), b = settings.fallbackMode) : a > .7 ? b = 5 : a > .5 ? b = 4 : a > .3 ? b = 3 : a > .1 && (b = 2), Pip.demoMode && (b = Pip.demoMode), b && b != Pip.mode) {
            Pip.kickIdleTimer(), sm0 = 0, Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, g.setBgColor(0).clearRect(BGRECT);
            let a = MODEINFO[b];
            if (a && a.submenu) {
                let b = Object.keys(a.submenu);
                a.submenu[b[sm0]]()
            } else
                a && a.fn && a.fn();
            Pip.mode == null ? drawFooter() : Pip.audioStart('UI/ROT_H_1.wav'), drawHeader(b), Pip.mode = b
        }
    }
    vPrev = a;
    let b = Date();
    b.getMinutes() != d0 && (drawFooter(), d0 = b.getMinutes()), BTN_PLAY.read() && !Pip.HIDenabled ? (Pip.btnPlayPrev || (Pip.kickIdleTimer(), Pip.mode == MODE.RADIO ? radioPlayClip() : KNOB1_BTN.read() || (rd.enable(!Pip.radioOn), Pip.audioStart(Pip.radioOn ? 'UI/RADIO_ON.wav' : 'UI/RADIO_OFF.wav'))), Pip.btnPlayPrev = !0) : Pip.btnPlayPrev = !1, BTN_TUNEUP.read() ? (!Pip.btnUpPrev && Pip.radioOn && (Pip.kickIdleTimer(), Pip.audioStart('RADIO/TUNING.wav'), rd.seek(1)), Pip.btnUpPrev = !0) : Pip.btnUpPrev = !1, BTN_TUNEDOWN.read() ? (!Pip.btnDownPrev && Pip.radioOn && (Pip.kickIdleTimer(), Pip.audioStart('RADIO/TUNING.wav'), rd.seek(0)), Pip.btnDownPrev = !0) : Pip.btnDownPrev = !1
};
let createDateTimeSubmenu = (a, d, h, i) => {
    Pip['#onknob2_old'] = Pip['#onknob2'], delete Pip['#onknob2'], a.setSeconds(0);
    let b = d ? 0 : 3;
    let f = () => {
        let b = a.getHours().twoDigit();
        let c = a.getMinutes().twoDigit();
        bC.reset().setFontMonofonto28().setFontAlign(-1, -1), d ? (bC.drawString(a.getFullYear(), 77, 83, !0), bC.drawString('-', 136, 83), bC.drawString((a.getMonth() + 1).twoDigit(), 153, 83, !0), bC.drawString('-', 184, 83), bC.drawString(a.getDate().twoDigit(), 201, 83, !0), bC.drawString(b, 249, 83, !0), bC.drawString(':', 280, 83), bC.drawString(c, 297, 83, !0)) : (bC.drawString(b, 162, 83, !0), bC.drawString(':', 193, 83), bC.drawString(c, 210, 83, !0))
    };
    let e = (f, g, h, i, a) => {
        a == null && (a = 1);
        let b = f, c = f + h, d = g, e = g + i;
        while (a--)
            bC.drawRect(b, d, c, e), b++, c--, d++, e--
    };
    let c = c => {
        c == null && (c = 3);
        let f;
        d ? f = [
            [
                73,
                76,
                64,
                42,
                2
            ],
            [
                149,
                76,
                36,
                42,
                2
            ],
            [
                197,
                76,
                36,
                42,
                2
            ],
            [
                245,
                76,
                36,
                42,
                2
            ],
            [
                293,
                76,
                36,
                42,
                2
            ],
            [
                150,
                145,
                100,
                33,
                1
            ]
        ] : f = [
            [],
            [],
            [],
            [
                158,
                76,
                36,
                42,
                2
            ],
            [
                206,
                76,
                36,
                42,
                2
            ],
            [
                150,
                145,
                100,
                33,
                1
            ]
        ], bC.setColor(c);
        let a = f[b];
        b == 5 && (bC.setBgColor(1).clearRect(a[0], a[1], a[0] + a[2], a[1] + a[3]), bC.setFontMonofonto23().setFontAlign(0, -1), bC.drawString('SET', 200, 150).setBgColor(0)), e(a[0], a[1], a[2], a[3], a[4])
    };
    Pip.removeSubmenu = () => {
        clearInterval(g), Pip.removeAllListeners('knob1'), Pip.removeAllListeners('knob2'), Pip['#onknob2'] = Pip['#onknob2_old'], delete Pip['#onknob2_old']
    }, Pip.on('knob1', d => {
        if (d) {
            switch (b) {
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
        } else
            b >= 5 ? (Pip.audioStartVar(Pip.audioBuiltin('OK')), setTimeout(i, 700, a)) : (Pip.audioStartVar(Pip.audioBuiltin('NEXT')), c(0), b++, c());
        bC.flip()
    }), Pip.on('knob2', a => {
        Pip.audioStartVar(Pip.audioBuiltin('COLUMN')), c(b == 5 ? .3 : 0), d ? b = (b + a + 6) % 6 : b = (b + a + 3) % 3 + 3, c(), bC.flip()
    }), bC.clear().setFontMonofonto28().setColor(2).setFontAlign(0, -1), bC.drawString(h, 200, 23), bC.setFontMonofonto23().setColor(1), bC.drawString('SET', 200, 150), bC.drawRect(150, 145, 250, 178), d ? e(48, 69, 306, 56, 3) : e(124, 69, 152, 56, 3), drawHeader(3), drawFooter(), f(), c(), bC.flip();
    let g = setInterval(function () {
        bC.flip()
    }, 50)
};
let submenuSetDateTime = () => createDateTimeSubmenu(Pip.getDateAndTime(), !0, 'SET DATE & TIME', a => {
    Pip.setDateAndTime(a), showMainMenu()
});
let submenuSetAlarmTime = () => {
    var a = Pip.getDateAndTime();
    let b = 7, c = 0;
    if (settings.alarm.time) {
        var d = new Date(settings.alarm.time);
        b = d.getHours(), c = d.getMinutes()
    }
    return a.setHours(b), a.setMinutes(c), a.setSeconds(0), createDateTimeSubmenu(a, !1, 'SET ALARM', a => {
        settings.alarm.time = a.getTime(), delete settings.alarm.snoozeTime, settings.alarm.enabled = !0, drawFooter(), saveSettings(), configureAlarm(), submenuSetAlarm()
    })
};
let submenuPalette = () => {
    var a = {
        r: 0,
        g: 255,
        b: 0,
        scanline: 128,
        overscan: 128
    };
    let j = () => {
        setTimeout(function () {
            Pip.removeSubmenu(), submenuMaintenance()
        }, 200)
    };
    var k = 10, l = 27, b = [
            {
                n: 'Red',
                id: 'r'
            },
            {
                n: 'Green',
                id: 'g'
            },
            {
                n: 'Blue',
                id: 'b'
            },
            {
                n: 'Set to default (green)',
                fn: () => e(0, 255, 0)
            },
            {
                n: 'Set to amber',
                fn: () => e(255, 112, 0)
            },
            {
                n: 'Set to white',
                fn: () => e(255, 255, 255)
            },
            {
                n: '< Back',
                fn: j
            }
        ];
    b.forEach((a, b) => a.y = k + b * l);
    var c = 0;
    pal = [
        new Uint16Array(16),
        new Uint16Array(16),
        new Uint16Array(16),
        new Uint16Array(16)
    ];
    let m = (b, d, e) => {
        var c = 170 + Math.round(d * 170 / 256), a = b.y;
        bC.reset().setFontMonofonto18().setFontAlign(-1, -1), e && bC.setBgColor(3).setColor(0).clearRect(10, a, 380, a + 27), bC.drawString(b.n, 30, a + 4), b.id && (bC.fillRect(170, a + 5, 350, a + 6).fillRect(170, a + 21, 350, a + 22).fillRect(c, a + 7, c + 10, a + 20), bC.fillPolyAA([
            160,
            13 + a,
            170,
            5 + a,
            170,
            22 + a
        ]).fillPoly([
            360,
            13 + a,
            350,
            5 + a,
            350,
            22 + a
        ]))
    };
    let d = () => {
        bC.clear(1), b.forEach((b, d) => m(b, a[b.id], d == c))
    };
    let e = (b, c, d) => {
        a.r = b, a.g = c, a.b = d, f()
    };
    let f = () => {
        const f = a.r / 255;
        const h = a.g / 255;
        const i = a.b / 255;
        const d = 1 - a.scanline / 255;
        const e = a.overscan / 1275;
        for (var b = 0; b < 16; b++) {
            var c = Math.max(0, (b - 12) / 30);
            pal[0][b] = g.toColor(c + f * b / 15, c + h * b / 15, c + i * b / 15), pal[1][b] = g.toColor(c + d * f * b / 15, c + d * h * b / 15, c + d * i * b / 15), pal[2][b] = g.toColor(c + (e + f) * b / 15, c + (e + h) * b / 15, c + (e + i) * b / 15), pal[3][b] = g.toColor(c + (e + d * f) * b / 15, c + (e + d * h) * b / 15, c + (e + d * i) * b / 15)
        }
        Pip.setPalette(pal)
    };
    Pip.removeSubmenu = () => {
        settings.color = a, settings.palette = pal.map(a => btoa(a.buffer)).join(','), saveSettings(), clearInterval(n), Pip.removeListener('knob1', h), Pip.removeListener('knob2', i)
    };
    let h = a => {
        E.stopEventPropagation(), Pip.knob1Click(a), a ? c = (c + b.length - a) % b.length : b[c].fn && b[c].fn(), d(), bC.flip()
    };
    Pip.prependListener('knob1', h);
    let i = g => {
        E.stopEventPropagation();
        var e = b[c];
        e.id && (a[e.id] = E.clip(a[e.id] + g * 16, 0, 255), f(), Pip.knob2Click(g), d(), bC.flip())
    };
    Pip.prependListener('knob2', i), settings.color && (a.r = 0 | E.clip(settings.color.r, 0, 255), a.g = 0 | E.clip(settings.color.g, 0, 255), a.b = 0 | E.clip(settings.color.b, 0, 255), a.scanline = 0 | E.clip(settings.color.scanline, 0, 255), a.overscan = 0 | E.clip(settings.color.overscan, 0, 255), f()), d(), bC.flip();
    let n = setInterval(function () {
        bH.flip(), bC.flip(), bF.flip()
    }, 50)
};
E.showMenu = function (g) {
    function i(a) {
        a ? c.move(-a) : c.select()
    }
    var b = bC;
    b.clear(1);
    var a = g[''], d = Object.keys(g);
    a && (d.splice(d.indexOf(''), 1), a.back && (g['< Back'] = a.back, d.unshift('< Back'))), a instanceof Object || (a = {}), a.selected === undefined && (a.selected = 0), a.rowHeight = 27;
    var h = 10, f = a.x2 || b.getWidth() - 20, e = 12, j = b.getHeight() - 1;
    a.title && (e += a.rowHeight + 2);
    var c = {
        draw: function () {
            b.reset().setFontMonofonto18(), a.predraw && a.predraw(b), b.setFontAlign(0, -1), a.title && (b.drawString(a.title, (h + f) / 2, e - a.rowHeight), b.drawLine(h, e - 2, f, e - 2));
            var o = 0 | Math.min((j - e) / a.rowHeight, d.length), k = E.clip(a.selected - (o >> 1), 0, d.length - o), i = e, s = k > 0;
            b.setColor(k > 0 ? 3 : 0).fillPoly([
                190,
                10,
                210,
                10,
                200,
                0
            ]);
            while (o--) {
                var q = d[k], l = g[q], r = k == a.selected && !c.selectEdit;
                if (b.setBgColor(r ? 3 : 0).clearRect(h, i, f, i + a.rowHeight - 1), b.setColor(r ? 0 : 3).setFontAlign(-1, -1).drawString(q, h + 20, i + 4), 'o' == (typeof l)[0]) {
                    var m = f, n = l.value;
                    if (l.format && (n = l.format(n)), c.selectEdit && k == a.selected) {
                        var p = a.rowHeight > 10 ? 2 : 1;
                        m -= 12 * p + 1, b.setBgColor(3).clearRect(m - (b.stringWidth(n) + 4), i, f, i + a.rowHeight - 1), b.setColor(0).drawImage({
                            width: 12,
                            height: 5,
                            buffer: ' \x07\0 ù ð\x0E\0@',
                            transparent: 0
                        }, m, i + (a.rowHeight - 5 * p) / 2, { scale: p })
                    }
                    b.setFontAlign(1, -1).drawString(n.toString(), m - 2, i + 4)
                }
                i += a.rowHeight, k++
            }
            b.setColor(k < d.length ? 3 : 0).fillPoly([
                191,
                201,
                210,
                201,
                200,
                210
            ]), b.setColor(3).setBgColor(0).setFontAlign(-1, -1).flip()
        },
        select: function () {
            var b = g[d[a.selected]];
            Pip.audioStartVar(Pip.audioBuiltin('OK')), 'f' == (typeof b)[0] ? b(c) : 'o' == (typeof b)[0] && ('n' == (typeof b.value)[0] ? c.selectEdit = c.selectEdit ? undefined : b : ('b' == (typeof b.value)[0] && (b.value = !b.value), b.onchange && b.onchange(b.value)), c.draw())
        },
        move: function (e) {
            if (c.selectEdit) {
                var b = c.selectEdit;
                let a = b.value;
                b.value -= (e || 1) * (b.step || 1), b.min !== undefined && b.value < b.min && (b.value = b.wrap ? b.max : b.min), b.max !== undefined && b.value > b.max && (b.value = b.wrap ? b.min : b.max), b.onchange && b.value != a && b.onchange(b.value, -e)
            } else {
                let b = a.selected;
                a.wrapSelection ? a.selected = (e + a.selected + d.length) % d.length : a.selected = E.clip(a.selected + e, 0, d.length - 1), b != a.selected && !Pip.radioKPSS && Pip.knob1Click(e)
            }
            c.draw()
        }
    };
    return Pip.removeSubmenu && Pip.removeSubmenu(), c.draw(), Pip.on('knob1', i), Pip.removeSubmenu = () => {
        Pip.removeListener('knob1', i)
    }, c
}, E.showPrompt = function (e, a) {
    function c() {
        g.setColor(a.color);
        var f = g.getWidth(), n = g.getHeight(), k = a.title;
        k && g.setFontMonofonto23().setFontAlign(0, -1, 0).setBgColor(a.color).drawString(k, f / 2, 42).setBgColor(0), g.setFontMonofonto18().setFontAlign(0, 0, 0);
        var i = e.split('\n'), l = 125 - i.length * 20 / 2;
        a.clearBg && g.clearRect((f - i[0].length * 8) / 2 - 20, l - 20, (f + i[0].length * 8) / 2 + 20, 175 + b.length * 20), i.forEach((a, b) => g.drawString(a, f / 2, l + b * 20));
        var h, c, j, m;
        h = f / 2, c = 175 - (b.length - 1) * 20, b.forEach((b, e) => {
            b = b, j = 50, m = [
                h - j - 4,
                c - 13,
                h + j + 4,
                c - 13,
                h + j + 4,
                c + 13,
                h - j - 4,
                c + 13
            ], g.setColor(e == a.selected ? d : 0).fillPoly(m).setColor(a.color).drawPoly(m, 1).setFontMonofonto18().drawString(b, h, c + 1), c += 36
        }), g.setFontAlign(-1, -1)
    }
    var d = g.blendColor(g.theme.bg, g.theme.fg, .5);
    a || (a = {}), a.buttons || (a.buttons = {
        Yes: !0,
        No: !1
    });
    var b = Object.keys(a.buttons);
    return a.selected || (a.selected = 0), a.color === undefined && (a.color = g.theme.fg), a.clearBg || (a.clearBg = !0), c(), new Promise(f => {
        let d = !0;
        function e(g) {
            g ? d ? (a.selected -= g, a.selected < 0 && (a.selected = 0), a.selected >= b.length && (a.selected = b.length - 1), c(), d = !1) : d = !0 : (Pip.removeListener('knob1', e), f(a.buttons[b[a.selected]]))
        }
        Pip.on('knob1', e), Pip.removeSubmenu = () => {
            Pip.removeListener('knob1', e)
        }
    })
}, E.showMessage = function (a) {
    g.clear(1), bC.clear(1).setColor(3).setFontMonofonto23().setFontAlign(0, 0), drawVaultTecLogo(200, 48 - 12 * a.split('\n').length, bC), bC.drawString(a, 200, 156).flip()
}, MODEINFO = [
    0,
    {
        name: 'STAT',
        submenu: {
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
        name: 'INV',
        submenu: {
			//InvPatchInsert_Menu
            ATTACHMENTS: submenuInvAttach,
            APPAREL: submenuApparel,
            APPS: submenuApps,
            AID: showVaultAssignment
        }
    },
    {
        name: 'DATA',
        submenu: {
            CLOCK: submenuClock,
			//AlarmPatchInsert_Menu
            STATS: submenuStats,
            MAINTENANCE: submenuMaintenance
        }
    },
    {
        name: 'MAP',
        fn: submenuMap
    },
    {
        name: 'RADIO',
        fn: submenuRadio
    }
], getUserApps().length || delete MODEINFO[2].submenu.APPS, Pip.setPalette && settings.palette && Pip.setPalette(settings.palette.split(',').map(a => new Uint16Array(E.toArrayBuffer(atob(a))))), checkBatteryAndSleep() || (KNOB1_BTN.read() && BTN_POWER.read() ? (log('Entering factory test mode'), factoryTestMode()) : Pip.isSDCardInserted() ? (Pip.addWatches(), KNOB1_BTN.read() ? (log('Booting into demo mode'), enterDemoMode()) : settings.longPressToWake ? (log('Playing boot animation'), settings.longPressToWake = !1, saveSettings(), playBootAnimation()) : (Pip.sleeping = 'BUSY', Pip.fadeOn(), fs.statSync('BOOT') ? (log('Normal boot - showing main menu'), setTimeout(a => {
    Pip.fadeOff().then(a => {
        Pip.audioStart('BOOT/BOOT_DONE.wav'), Pip.sleeping = !1, showMainMenu(), Pip.fadeOn()
    })
}, 2e3)) : (log('*** NO BOOT DIRECTORY ***'), g.drawString('NO BOOT DIRECTORY', 240, 179, 1), Pip.sleeping = !1))) : (Pip.fadeOn(), setWatch(Pip.off, BTN_POWER, { edge: 'falling' })))