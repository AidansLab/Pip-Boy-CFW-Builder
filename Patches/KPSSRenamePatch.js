window.Patches.KPSSRenamePatch = {

    /**
     * This 'find' property is now an array of jobs.
     * The patcher will loop through it.
     */
    find: [
        {
            // You can now provide an array of strings to search for multiple possibilities.
            "string": ['"KPSS Radio"', "'KPSS Radio'"],
            "useInput": true // Tells the patcher to use the text box value for this one
        },
        {
            "string": 'x2: 200,',
            "replace": 'x2: 240,' // A hard-coded find/replace for the menu width
        }
    ],
};