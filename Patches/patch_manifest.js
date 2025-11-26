// This manifest is loaded by index.html
// It tells the patcher what to load.

// Detect base path - defaults to empty string for standalone use,
// or uses CFW_BUILDER_BASE_PATH if embedded in another app (e.g., pip-terminal)
const _BASE_PATH = (typeof window !== 'undefined' && window.CFW_BUILDER_BASE_PATH) ? window.CFW_BUILDER_BASE_PATH : '';

const PATCH_MANIFEST = {
    // The key (e.g., "InvPatch") MUST match the object key in the patch file
    // and the marker name in FW.js.
    
    "InvPatch": {
        name: "Inventory Patch",
        description: "Adds items menu to the inventory tab.",
        file: _BASE_PATH + "Patches/InvPatch.js",
		resources: {
            sourceFolder: _BASE_PATH + "resources/DATA",
            targetPath: "DATA",
            files: [
                "EquipDown_01.wav", "EquipDown_02.wav", "EquipDown_03.wav", "EquipUp_01.wav", "EquipUp_02.wav", "EquipUp_03.wav", "ICONS.json", "items_0.json", "items_1.json", "items_meta.json", "NukaCola.wav", "Radaway.wav", "Radaway_img.js", "RadX_01.wav", "RadX_02.wav", "Shishkebab_img.js", "Soda_01.wav", "Soda_02.wav", "Soda_03.wav", "Stimpak.wav", "Stimpak_img.js"
            ]
        }
    },

    "IconMod": {
        name: "Icon Mod",
        description: "Removes cog and holotape icons.",
        file: _BASE_PATH + "Patches/IconMod.js"
    },

    "PerksPatch": {
        name: "Perks System",
        description: "Adds the perks system.",
        file: _BASE_PATH + "Patches/PerksPatch.js",
        resources: {
            sourceFolder: _BASE_PATH + "resources/PERKS",
            targetPath: "USER_BOOT/PIP_UI_PLUS/PERKS",
            files: [
                "_enabled_perks.dat", "_perks.dat", "action_boy.avi", "action_girl.avi", "adamantium_skeleton.avi", "animal_friend.avi",
                "aquaboy.avi", "aquagirl.avi", "armorer.avi", "attack_dog.avi", "awareness.avi",
                "basher.avi", "better_criticals.avi", "big_leagues.avi", "blacksmith.avi",
                "black_widow.avi", "blitz.avi", "bloody_mess.avi", "cannibal.avi", "cap_collector.avi",
                "chemist.avi", "chem_resistant.avi", "commando.avi", "concentrated_fire.avi",
                "critical_banker.avi", "demolition_expert.avi", "fortune_finder.avi",
                "four_leaf_clover.avi", "ghoulish.avi", "grim_reapers_sprint.avi", "gunslinger.avi",
                "gun_fu.avi", "gun_nut.avi", "hacker.avi", "heavy_gunner.avi", "idiot_savant.avi",
                "inspirational.avi", "intimidation.avi", "iron_fist.avi", "lady_killer.avi",
                "lead_belly.avi", "life_giver.avi", "local_leader.avi", "locksmith.avi",
                "lone_wanderer.avi", "medic.avi", "mister_sandman.avi", "moving_target.avi",
                "mysterious_stranger.avi", "nerd_rage.avi", "night_person.avi", "ninja.avi",
                "nuclear_physicist.avi", "pain_train.avi", "party_boy.avi", "party_girl.avi",
                "penetrator.avi", "pickpocket.avi", "quick_hands.avi", "rad_resistant.avi",
                "refractor.avi", "ricochet.avi", "rifleman.avi", "robotics_expert.avi", "rooted.avi",
                "science.avi", "scrapper.avi", "scrounger.avi", "sneak.avi", "sniper.avi",
                "solar_powered.avi", "steady_aim.avi", "strong_back.avi", "toughness.avi", "vans.avi",
                "wasteland_whisperer.avi"
            ]
        }
    },
	
	"SpecialPatch": {
        name: "SPECIAL System",
        description: "Adds the SPECIAL system.",
        file: _BASE_PATH + "Patches/SpecialPatch.js",
        resources: {
            sourceFolder: _BASE_PATH + "resources/SPECIAL",
            targetPath: "USER_BOOT/PIP_UI_PLUS/SPECIAL",
            files: [
                "agility.avi", "charisma.avi", "endurance.avi", "intelligence.avi",
                "luck.avi", "perception.avi", "strength.avi", "_special.dat"
            ]
        }
    },
	
	"MaintenancePatch": {
        name: "Maintenance Features",
        description: "Adds advanced maintenance features like RAM Scan and theme palette customization (theme palette customization not yet implemented).",
        file: _BASE_PATH + "Patches/MaintenancePatch.js"
    },
	
	"CustomRadioPatch": {
        name: "Custom Radio Patch",
        description: "Adds custom radios based on folders in the radio folder.",
        file: _BASE_PATH + "Patches/CustomRadioPatch.js"
    },
	
	"KPSSRenamePatch": {
        "file": _BASE_PATH + "Patches/KPSSRenamePatch.js",
        "name": "KPSS Rename",
        "description": "Rename 'KPSS Radio' to a custom name.",
        "inputType": "text",
        "placeholder": "Enter new name (e.g., GNR)"
    },
	
	"CameraModule": {
        name: "Pip-Cam Module",
        description: "Module for Pip-Cam support.",
        file: _BASE_PATH + "Patches/CameraModule.js"
	}

    // Add new patches here
};