// Detect base path - defaults to empty string for standalone use,
// or uses CFW_BUILDER_BASE_PATH if embedded in another app (e.g., pip-terminal)
const _FW_BASE_PATH = (typeof window !== 'undefined' && window.CFW_BUILDER_BASE_PATH) ? window.CFW_BUILDER_BASE_PATH + 'Firmware/' : 'Firmware/';

const FW_VERSIONS = {
    "1.29": {
        name: "FW Version 1.29",
        file: "FW_1.29.js",
        espversion: "2v25.359"
    },
    "1.31": {
        name: "FW Version 1.31",
        file: "FW_1.31.js",
        espversion: "2v25.376"
    }
};