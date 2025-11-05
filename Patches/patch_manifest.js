// This manifest is loaded by index.html
// It tells the patcher what to load.

const PATCH_MANIFEST = {
    // The key (e.g., "InvPatch") MUST match the object key in the patch file
    // and the marker name in FW.js.
    
    "InvPatch": {
        name: "Inventory Patch",
        description: "Adds items menu to the inventory tab.",
        file: "Patches/InvPatch.js"
    },

    "IconMod": {
        name: "Icon Mod",
        description: "Removes cog and holotape icons.",
        file: "Patches/IconMod.js"
    },

    "PerksPatch": {
        name: "Perks System",
        description: "Adds the perks system.",
        file: "Patches/PerksPatch.js"
    },
	
	"SpecialPatch": {
        name: "SPECIAL System",
        description: "Adds the SPECIAL system.",
        file: "Patches/SpecialPatch.js"
    },
	
	"MaintenancePatch": {
        name: "Maintenance Features",
        description: "Adds advanced maintenance features like RAM Scan and theme palette customization (theme palette customization not yet implemented).",
        file: "Patches/MaintenancePatch.js"
    },
	
	"CustomRadioPatch": {
        name: "Custom Radio Patch",
        description: "Adds custom radios based on folders in the radio folder.",
        file: "Patches/CustomRadioPatch.js"
    },
	
	"KPSSRenamePatch": {
        "file": "Patches/KPSSRenamePatch.js",
        "name": "KPSS Rename",
        "description": "Rename 'KPSS Radio' to a custom name.",
        "inputType": "text",
        "placeholder": "Enter new name (e.g., GNR)"
    }

    // Add new patches here
};