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
        let showAlarm = o =>
    {
        Pip.removeSubmenu && Pip.removeSubmenu(), delete Pip.removeSubmenu, Pip.remove && Pip.remove(), delete Pip.remove;
        let f = "\\xC4j\\xA0@\`\\xE4\\x82\\x887\\x82\\x18?\\x814\\xA0^\\x02\\x1B\\xF0\\xF1\\xB1p\\x1F\\xE8\}\\b\\xA4\\x02\\x7F\\xFF\\x07\\x15\\x7F\\xFF\\xFE\\x03\\xC6.\\x02\\xFF\\xE0?\\xFF\\xFE\\0@\\x8880\\x10\\x80\\"\\x12\\xEF\\x10\\bXH!\\xB1R\\xF0h_\\x05\\xC1\\xA5P@\\x01\\x8D\\x88\\xDF\\x83\\x02K\\x19\\xFF\\xCB\\b\\x04\\xFF\\xFD\\x1A\\xC3\\x83Ds\\x96\\x1F\\x14lI\\xCCDAb\\x12?\\xCF\\x81\\xC1\\xA2x\\x04&~S\`\\xFE\\xCB\\x04\\xAA\\x03U\\x18!\\x0B\\x97\\xE7\\x1F\\x82X&~\\x950\\0\\x184\\x19\\xFF\\xE6\\x83Pg\\x85\\xC0\\x07\\x8A\\xD9\\x15\\xF8L\\x02\\x0B\\xBF\\xFC\\x04\\x02\\xFE\\x8EB=\\f\\xEC\\r\\xDCd?_\\x8B\\b\\x87O\\x1B\\x10\\xD94\\0\\x14\\x7F\\xA24\\x13\\x96G\\bB\\xB4\\xBF\\x1E\\x11\\x13\\xE7\\xFE\\xB7\\xBB\\x86!\\xA3?\\xA1\\x84C\\xFFj\\xB0N\\xE1\\x84(C7\\xFE\\xB0\\x98\\xBF\\x8D\\xFB\\xB8Q\\n\\x10 \\x80\\x9E\\xF0\\x98S\\xF7p\\xA2\\x14 \\xE1\\x01\\r!<\\x01\\x10\\xAD\\x0F\\b\\t\\xD2\\x10\\xB5/\\xFF\\x04\\x03\\xFA\\x04\\xC2\\xDF\\xF4\\x04*\\xCF\\xFE\\x01\\0\\xFF\\xA0 |_\\xF1\\n\\xDB\\xFF\\x06\\xFC\\x8A\\'\\xFE>!_\\xFF\\xE0\\xFF\\xFE\\x82b_\\xFF\\xE8u\`?\\xFF\\x97\\xFF\\xCF\\xFF\\xFC\\x04\\xC2\\xEF\\x88V\\x81\\x03B\\xE7\\xFF\\xD1a\\x7Fv\\x7F\\xFC\\x01\\xD8Q\\t\\xD00\`?\\xE9\\xF9\\xA4 \\x007\\xEF\\xF9\\xD8\`\\0\\x9F\\xE1\\t\\x7F\\x81\\xA8>\\x10\\x98]\\xD1\\b\\xA1\\0\\x80\\x02P\\x04#\\xC1\\xC1\`\\xF4\\x80@\\xFD\\xCA\\xC1\\x7F\\xF7\\xC1\\x01!\\xE2\\x11\\x9B\\x02\\x80\\x02\\x85\\x82\\xC1\\xC3\\x84\\x85\\x9D\\xEF\\x02\\x02\\x1C\\x81\\0\\x0B\\xF8\\x10\\x95\\xC7\\t\\x0B\\xAB\\xDC*\\nU\\x14T\\x0B\\xC6\\x11\\x13\\xF5\\xDE\\xD0*\\nm\\x84!+\\xE2U\\x17\\xD4\\x9B\\x14B\\x98\\0_\\x16\\xD8 )\\x95\\x13\\x18\\xA0\\0~_\\xA0\\x80\\xAA\\x94!\\xF8\`h_\\xE0\\x18_q\\xA0\\xD0\\xADV\\xAB\\xFD\\xAA\\xFF\\x81\\x01\\xC82\\xC8\\xE7\\xEA\\xC4!\\x0E\\x03\\xF8\\x04\\x87\\x80\\x7F\\xA0\\x06\\"\\0\\x01A\\xFA\\xE3\\x10uZ\\x88\\xF8\\x84/\\xA0Di\\x7F\\x12\\xFEb$B\\x1F\\xBB\\x7F\\xFA*\\x03\\x87M\\x15/\\xE8K\\xC9\\xE5\\0\\x01\\x81\\xFF\\xF1\\xE1\\xD0\\xB0k\\xC2\\xE2\\x10\\xBF\\xFE\\x02\\x14!&\\x04\\xC4\\x048\\x0F\\x97\\x16!*=@\\x80Y \\x17\\xFC\\0\\x84\\x88\\x0F\\xFF\\xFB\\x05\\xAA[\\xFB\\xED\\xE2\\xA5\\xFFH\\xA3@\\x1F\\xFF@\\x88Hh\\x1FV\\xBF\\xFF\\xEFe\\x95\\x0F\\xFF\\xC7\\xFFm\\x92\\xE0\\x1B\\xFF\\xF0t \\0|\\x04\\xC9\\x1D2\\x89@\\0\\xA7\\xFF\\xF0\\x90 \\0\\xED\\'rHA-\\xC9;\\x04A\\x14\\"U\\xFC\\xC4\\f\\x18\\x1E\\x0F\\x80\\x1EA\\xD8\\x10\\0\\x87r\\x9D\\x80\\xFE\\xFF1\\xFF\\x97\\xF8\\x1ED\\x1CB+t\\x930@\\0z~\\x7F\\xF9\\x10\\x80x\`\\0F$\\x9E\\x06\\xE7\\x84\\x88\\x83\\x7Fw\\xE6C\\x8A\\xC2\\xEB\\xC0@\\xFD\\x01\\x82F\\xC1\\0\\xC7\\xC4!\\xD0\\x04%\\xAA\\xC2\\xFF\\xB8\\x81\\0\\x03\\xE9\\xA0@j\\xC2\\x90\\xBF\\xB1pX_K\\x17\\x90B[(\\x1F\\xF0\\x840\\0\\xDF\\x8F\\xC1\\x98>\\x9A \\xC2\\xD0?\\xE3\\xD8\\x80\\x01~_\\xC3H_\\xFC\\x7F\\xF7p\\"2\\xD0 \\'\\xFF\\xF3\\x1E\\x82/\\x07\\xFD/\\xFC\\"\\x8E\\x10\\x95\\xE3\\xFF\\xE0@\\x80\\xF87\\xE0\`_\\xE4\\bQ\\xF0[\\xFF\\x10\\xBF\\xFF/\\xFF\\xFC\\x10\\x98\\x87(B\\x0F\\xFA\\x81\\x02\\x07\\x83_x\\x9C\\xCB(B\\b\\x006\\xE8\}\\x01\\tp\\xF5I@Q?\\x800\\xBE\\x82\\x12\\xE0b\\x13\\xFEDp\\xD5I\\xF3\\xC0@\\xFD\\x81\\x02u\\xC0\\x81\\xA2\\x13\\x10\\x85\\xF8\\x04\\tO\\x02\\x07\\xC0\\x10\\x96\\xDE\\x04\\0#\\x8C\\x14\\b\\x80@o\\xE0P\\xFE\\x02\\x12\\xE0B\\x11q\\xE2\\x11\\xBCJ\\xE1Q\\x06\\r\\x04\\x10\\x87\\xF5\\r\\x07\\x1Fy\\n!0\\xCC(\\x84&Xl\\x90\\xD5H@7\\xE2\\x11\\xBC\\xE0\`\\x80a\\xAA\\x90\\"\\n\\xCB\\b\\x04\\x17\\xFF\\xB6!\\x1B\\xC0!1\\x12 \\x84\`\\x18\`\\0\\xFE\\x82\\x13Y\\xC1\\x86\\x82\\xCF\\x9B\\x05f$g\\x10B\\x16\\xBC2\\x15\\xBCB30\\xD0\\0Q\\xBF\\xFF,*\\f\\xFC2\\x10\\f0\\0\\x82\\x13\\xE0\\x16\\xB1\\t\\xF8\\x01\\x12\\x14\\xB0\\xE8\\x9F\\xE5\\xA0n\\xE4\\x80\\x01\\xC1\\xC3\\xA2\\x7Fw\\xE2\\x11\\xDD\\xC7\\bD\\x0E\\x87\\xFC\\x10\\x0F\\xFF\\xF8\\bP\\x81\\x88Ar\\x06!#\\xF0!H:\\x18\\f?x\\x84O\\xE0\\x85\\b\\x10\\x84\\x86\\xA8@\\0\\xBF\\xA2\\x14 %pB\\xE1~@a|L\\xC2\\x88P\\x80\\x7F\\xFFB\\x11\\xBF\\x8FP\\x80\\x01P\\x04(\\xFC\\x84#\\x7F\\xE1b\\x110\\x02\\x147\\xFF1\\b\\xFD!\\b\\x9C\\x01\\x0B_\\x8D\\xF8\\x14?\\0\\x85\\x0B\\xF8\\x84\\x8F\\xF4\\xBC\\n\\x1F\\xC0B\\x84\\xFF\\xCE!\\x1F\\xFF\\x8B\\x10\\xAB\\x0B\\xED\\x88H\\xC1\\x1A\\xC4\\x10\\xA1(\\xC7\\x85\\x82\\xFE\\x88DI\\x82\\xF4\\fB\\x84\\xBE\\xBE\\x16\\r\\x0E ,\\x11\\n\\xA1\\xC0\\xFF\\x96\\xB0\\xD8\\x90\\xB18\\x82\\x15?\\xF9@HU\\b\\x04\\f\\xD6 \\0\\xF8\\xF8\\x84A\\xD0>\\xF5\\x18P\\x11\\x0B\`\\0\\xBE\\x80\\xC0UA\\xD0\\x04,\\xFC\\x01\\x80\\xCF\\xC0\\xC1\`\\x04.%\\x03\\xE0*U\\0\\x07\\xE0\\x06\\x03\\x0F\\x10\\xC1\\x07\\x03\\x05\\xD0\\x10\\xB2\\x1A\\n\\x04(\\x14\\0jp1\\t\\x10\\x01\\x0B\\xA8\\0\\xDD\\xC1\\b^\\xBF\\xA1\\xD2\\x1A\\x84!(^\\x17$B\\xEA\\xDC*p\\x84\\xF80\\x84\\x8A\\x004(\\x7F\\xFF\\xFD?\\x10\\x9F\\0\\x85\\x88\\x06\\xC0\\x03\\x05\\xFCo\\xC4\\x07\\xCAh\\x10\\xA0\\xF8\\x7F\\xAC\\x05\\xBC\\x86\\x1C\\x1F\\xFF\\x83\\xFF\\x88O\\xBF\\xFF\\xB2\\x10\\rV\\xA7!\\x01\\xD7\\x91\\x05D\\x84\\xA9K\\xD4\\x05\\x06T\\xA9\\x1A\\x1C(\\x04B\\x82\\xA0\\x8F\\xFFA\\xDA(\\x85\\xAF\\x004a\\x01\\xD0\\x11\\t?\\x05@b\\x14\`B\\x12~\\x8B\`\\xC0\\xC0\\xFB\\xC4\\'@\\xC4$\\xFE\\x16\\xC1x\\x17\\0\\xFB\\x84,\\xFF\\x01\\xA0\\xC5\\x11\\0\\xEF\\xF5\\xC2\\x13\\x8F\\"\\0\\x05\\xFE\\xAE\\x04\\xBF\\xDF\\x04\\'B\\xC3a\\xFB\\xC4\\"\\x7F\\x84*\\xC3\\xC4$\\xB1\\x03m\\x03\\x7F\\xB8\\bS\\xFD\\x88I\\xFFo\\x84\\x07\\bE\\xFB\\x88E\\xC0?\\x02\\xFE\\xEF\\x04\\'\\xCB\\xDC\\xE2\\bE\\xE0\\bB\\xFE|\\x04*\}7\\xE2\\x11\\xE0\\x7F\\xCC\\x80\\x84\\xF9\\xF8h?\\x80\\x14O\\xFF@B\\x17\\xD0@x\\x84^\\x81$O\\xFF\\x80B\\x11\\x91\\b\\x05\\xFC\\xBC\\"\\xBCBP\\"\\x10\\x8D!\\0\\x0E@\\x89\\x80\\x85\\x88G\\x81P\\x04*\\x8E\\x81\\x10\\x89\\xF8\\x0E\\xA0\\0\\f4$\\x02\\x02\\x06\\x13\\xF8!c\\xFC(\\x18B\\xA0\\xF0@\\xC8K\\x01?\\xA2\\x16\\x0F\\xE1=\\x04%\\x84\\0F\\x04\\x19\\x0F\\xE8\\x07\\x06>!u\\xCA\\x14=b(\\x01\\'0\\x9E\\x0080\\xB1\\x0B\\xBD\\x008\\xDF\\xFA\\0\\x85~\\x01\\xB4o\\xFE\\0B\\x94\\x1CB4\\0B\\xC1\\xFC@\\xC0{\\xF1P\\xE2\\x15\\x01\\x01\\xDF\\xC4+\\xB9D\\x04\\x07?\\x10\\xB7\\xFE\\x04\\x07\\x1Fj\\f!S\\xFAL B\\xBF\\xF1 G\\x80B\\x91p1\\b\\x901\\n\\xF2\\xF0\\xB8_\\x81\\t\\x1F\\x01\\x0Bp\\x11\\x0BaqD+\\xCF\\xC42\\'\\xC5\\xBF\\x82B\\xFA\\bR\\x0B\\x86!\\x14V\\x18\\x85~\\x82D\\x81\\n{\\xF0\\xB8\\\\\\0H\\x91\\xF6\\xA8\\xE8t\\x84\\"\\xC3\\xC4*\\xC1\`ap\\xB0\\0\\xA1!b\\x15 \\'\\x90\`\\xDB\\xED ,X8\\x85E8^Z\\xADh\\x16)41\\n\\x10 \\xA0@\\0\\x81\\x84\\x88T\\xFFe\\xFF\\xADb|\\x86T \\xDA\\xED\\xD5\\x02\\x03@J\\x0F\\xAAH\\x8C\\0bP0\\x07\\xE0!v~\\xCBLB\\x7F\\xF0B\\xEC|C\\x04\\x1CC\\x04\\x01\\x0F\\x04\\x02_\\xFF\\xF0\\b^\\x81\\x7F\\xA8\\0q\\0";
        let h = "\\x9DF\\xA0@\`\\xE0_\\xF0\\0_\\x80\\xA9\\x1B\\xF0p~\\0h\\xF1\\xF0h\\x7F\\xFA\\x004h\\x184O\\xE0p{\\xF88N\\x804hx4O\\xF8pph\\xBF\\x029\\x84\\x81\\xCEB\\x1D\\t\\x97\\x83\\x85\\xC0\\x07?\\x0E~\\x1C\\x95\\x94l\\f\\x1A/\\xF1\\xEAc\\xD8y\\xF88n\\x004Hx4o\\xF8\\xACb\\xB8\\x85Q\\xC0\\0\\xEF\\xC1\\xC1\\xF8\\x01\\xA3\\x99E2\\fe\\x18\\xC8<\\x02\\xFE\\x0E\\x13\\xA0\\f\\x17\\xC0W\\x1A\\x01\\xB09\\t\\x80@\\x8D/:\\x07\\x0F\\xF8+F\\xA0\\x9D\\x03\\x80\\xFFYC\\xC2\\xFE\\x82\\xA1\\x1C\\xE3\\x8A\\xC3\\x81\\xFD\\x1C\\xE4\\x19\\xC3\\xBF\\xC0\\x03\\x83\\xC3\\xCC\\xE1B\\xFC\\x01\\xC27\\xC1\\xC0\\x80\`\\x87\\bX\\x05\\x0B\\xF8\\x07\\b\\xFF\\x0EM+\\x19\\x01+\\x06i\\x0489\\xF4\\x10p_\\xE4\\x81\\x80@C\\x83\`H\\xE1\\xA7\\xC1\\xA1\\x07\\x06\\x8F\\x8A\\x83\\x80h\\x19CP4\\x0Fa \`\\xD1J\\x81\\x80\\x03\\x06\\x8A\\xF6\\x04\\x1A,\\xFC\\x1C2\\0 \\0P\\xF0h\\xDF\\xF0\`p@\\x10\\'A\\x15\\x80\\xC0 $P\\x97\\xE1o\\xC1\\xC1\\x81\\xC2\\xDE\\x11B\\x01\\x02e\\x16\\x804\\x04\\x94\\f\\xBD\\xF2\\t\\x94S [\\xFC\\x04\\x1Cb\\x15\\xFC\\x1C X\\x18\\x17\\xF5\\xD4\\x17\\x80\\xAE4\\x03\`+\\x06?\\xC0g\\x82\\x81\\x19\\xC4\\f\\xFE\\x87\\xF8\\b\\x84\\x0E\\x16\\x83\\xFF\\x81~\\'\\xF0\\x1F\\xEB\\x9C\\x98\\xFF\\x1F\\xE0*\\x05\\xCE0\\x1C\\x1E\\x07\\xF7\}\\x03\\xFA\\x07\\x07\\x80\\x7F!~\\xFF\\x05\\xFC\\xEC\\bph\\x7FC\\x7F\\xFD\\x85\\xF8\\x03\\x84o\\xA1g\\x80w\\xC1\\xC2|\\x1B\\xFF\\xF4/\\xE0\\x1C \\x16\\x0B\\x04\\x11\\xC9\\\\\\r\\xF1X\\xA8\\x0F\\xF2\\x1F\\xE7J\\x84\\x1C\\x1C\\xFA\\x0F\\xF6\\x7F@\\xFF$\\n\\xE1\\x01\\x02\\x0E\\r\\x81\\xFF@\\xFF\\x11\\xFE\\x84\\xFE\\x84\\x1C\\x1A?\\x80)\\x82\\xDE\\x07@\\xCA\\x1A\\x81\\xA0j\\x83\\x075\\x03\\x03\\x06\\x8B\\xFC\\x80@\\x80@\\xCB\\xFC\\x01\\xF0^\\xC3@7\\xF8\\0\\x100\\t\\xF88n\\x02|\\x10\\xF8>\\bx4b\\x18;\\x88\\0";
        let i = "\\x96M\\xE0@q\\'\\x81\\"\\x7F\\xE0\\xAA\`?\\xFA\\0$\\x80\\0 \\xB1\\xA1\\xE0\\xA0\\xBE\\x02\\x91\\x80\\x01\\x82D\\x81\\x82\\x84\\xE0\\x07\\xC7\\x10\\x8D?\\x05\\t\\xFC\\x05\\x07\\xBF\\x05\\t\\xFE\\x1A\\x907\\x10j(\\xDC@QD\\x01HB\\x02\\x95\\x8F\\x82\\x86\\xFA\\x02\\x81\\x97\\x82\\x86\\xFC\\x02\\x8C;\\x8A\\n\\xFC\\x15\\xF8)5\\"_\\xC0P \\x91\\x80\\0\\xC0 \`\\xA28\\x0F\\x01\\xDEA\\n\\x87\\x16\\x05\\xBF\\x05\\x11\\xFD\\x04\\x90\\0[\\xFC6(\\xEE9\\xE4(8(\\x8E\\x81\\xE4\\x13\\x80\\'\\xE0g\\xFC\\x008@\\xA0\\xFF\\xF4/\\xFE\\0\\x14*D0H\\xCAp\\x94!\\0\\x05I\\x03\\xF0\\x05\\x0F\\0\\xDF\\x01D";
        let j = "\\xA3H @q \\x7F\\xF0\\0\\x7F\\xC0\\xC9A\\x01?\\xFF\\0\\x812\\xF0\\x88\\xB8\\0\\x81\\x031F\\x85\\x84\\x05\\x1A\\x15\\x0F\\b\\x8C3<hT\\xFC\\"7\\0D\\xCD\\xFC\\"7@ <, 7\\xF8DF\\xFC\\"7\\x80\\xF2x\\x88\\x90\\x80\\xC2/\\xC4_\\x88\\xBF\\x117\\x0B\\x111\\xF0\\b\\x0F?\\b\\x8F\\xC0+\\x1C\\0\\x04 4\\f G\\xF0\\x88q\\x18\\xA1 \\xA2\\x01\\xC4\\x84\\x88\\b\\0\\x03/\\b\\x8B\\x80\\b\\x10X\\x18hQT\\xF4a\\0\\xE1\\xA0>\\x04\`\\xE3@D\\x82\\xCF\\xF0\\f\\x01\\xF8\\x12\\xF6\\b\\x90\\xFF\\xC0\\x88\\x88\\x10\\xD8@p0\\x0B\\xF8Dn\\x84<\\xD6$\\xFF\\x81\\x0B\\b\\r\\xFE\\x05\\x843\\x0F\\xE9\\0\\xDF\\x84F\\xF0@F\\x82\\x01\\x01<\\x8E\\"\\x06\\x1Ei\\x0E\\x1F\\xE0z\\x90\\t\\b \\x14\\x0B\\xFA\\"*\\x0F\\xF8o\\x86J\\x04DJ\\\\\\x13\\xC8F\\xD0DD\\xC0\\xC4J@\\x8B\\xC1\\b\\x88\\x85\\xA1\\x814\\x04m\\x04\\xD0j-\\x18Y\\\\\\x11\\x11\\x100\\x98-\\x10\\xDB \\x88\\x88\\xBF\\xB4C\}\\x04\\"\\"\\x1Ey\\fr\\x0F\\xF0DD\\f\\xAC \\xD0\\x11\\x111\\xF1\\x98\`\\0p\\x10\\xB2)\\x12\\0\\x80\\x87\\xC0\\x80\\x03\\x1D\\xC3\\x1A\\x8A\\x11\\x1Cd)\` \\x80\\xE5Q^\\xC1\\x04\\bS\\x82D4\\x8CP\\x90Q\\0\\xD0\\x108b\\x02 \`0\\xA7\\xE5\\xD0\\xA5\\xE1\\x11p\\0\\xD1\\x17\\xC0\\x96\\b\\x04\\x88\\x02\\f\\xB0@\\xC0 \\xF8[\\xF1\\x98H\\xC1\\xD5\\x01\\xF4!\\xFFH\\x0F\\x81\\x188x\\x1F\\x84\\x07\\xFF\\x02\\x0B\\x83?\\xC00\\x07\\xE0K\\xF8\\x10\\xFF\\xC1d\\x10\\x18\\"\\"\\x03\\xC1\\xF0\\xFF\\x85\\x80\\xAF\\xE1\\x11\\x88 \\x83A\\xFEo\\xC6 \\xF0!a\\x01\\xBF\\xC8\\xA0\\xA5\\xFE\\xFF\\x81\`\\x13\`!\\x11\\xBC\\x05PP\\xA1\\0\\x81<\\x90\\"\\x06\\x1E\\x1F\\x05\\"\\f?\\xC0\\xF5 \\x12\\x10\\x04\\x1F\\xF4\\x0B\\xFA\\"*\\x0F\\xF8\\x05\\x83\\xE0?\\x82\\").\\x0E\\xFF\\xFCk\\x04DT\\x0F\\xF0t\\x04D\\x83\\x04\\x12\\xF0B\\"!\\x7FC@o\\xC0M\\x06\\"\\xD2\\x85\\x95\\xC1\\x11\\x11\\x03\\t\\x83\\xFFh\\x84\\xD9\\x04DE\\xFD\\xA2\\x0FM\\xF4\\x18\\x88\\x88\\x7F\\xE1\\x10\\f\\xFC\\n\\x0F\\xF0DD\\f8\\x0E\\xFF\\x80\\x03\\x06~\\"&?\\xC0,\\x04U\\x07\\0\\xA2\\x04\\x8A<\\x80H\\x11T\\x18\\0\\x88\\x84\\xA8%\\x80\\x8A\\xA1\\x05\\x01\\b\\x8E\\xCA\\x04\\xB0\\b\\b\\x17\\x11*\\x90\\x86a\\x07\\xC1\\xE0\\x01A\\0\\x0E\\x1C\\x04\\x1A\\bD\\x1F\\xA1\\x10\\x820P\\"@ ";
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
            if (settings.alarm.enabled && settings.alarm.time) {
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
