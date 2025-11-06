(function () {
    function initTabs() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');

        if (!tabLinks.length || !tabContents.length) {
            return;
        }

        tabLinks.forEach((link) => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;

                tabLinks.forEach((item) => item.classList.remove('active'));
                tabContents.forEach((content) => {
                    if (content.id === tabId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                link.classList.add('active');
            });
        });
    }

    function initUntokenizer() {
        const uploadBtn = document.getElementById('untokenizeUploadBtn');
        const copyBtn = document.getElementById('copyBtn');
        const saveBtn = document.getElementById('saveBtn');
        const codeBlock = document.getElementById('codeBlock');
        const statusLabel = document.getElementById('status');

        function setStatus(message, timeout = 2000) {
            if (!statusLabel) {
                return;
            }
            statusLabel.textContent = message || '';
            if (message) {
                setTimeout(() => {
                    if (statusLabel.textContent === message) {
                        statusLabel.textContent = '';
                    }
                }, timeout);
            }
        }

        if (uploadBtn && codeBlock) {
            uploadBtn.addEventListener('click', () => {
                if (!window.Espruino || !Espruino.Plugins || !Espruino.Plugins.Pretokenise || typeof Espruino.Plugins.Pretokenise.testUntokenize !== 'function') {
                    setStatus('Untokenizer unavailable.');
                    return;
                }

                Espruino.Plugins.Pretokenise.testUntokenize().then((result) => {
                    if (result) {
                        codeBlock.textContent = result;
                        if (copyBtn) copyBtn.disabled = false;
                        if (saveBtn) saveBtn.disabled = false;
                        setStatus('Code loaded.');
                    } else {
                        setStatus('Failed to load code.');
                    }
                });
            });
        }

        if (copyBtn && codeBlock) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(codeBlock.textContent || '');
                    setStatus('Copied to clipboard.');
                } catch (error) {
                    console.error(error);
                    setStatus('Copy failed.');
                }
            });
        }

        if (saveBtn && codeBlock) {
            saveBtn.addEventListener('click', async () => {
                const text = codeBlock.textContent || '';
                if (!text) {
                    setStatus('Nothing to save.', 1500);
                    return;
                }

                const defaultName = 'FW_full.js';
                try {
                    if (window.showSaveFilePicker) {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: defaultName,
                            types: [
                                {
                                    description: 'JavaScript',
                                    accept: { 'text/javascript': ['.js'] },
                                },
                            ],
                        });
                        const writable = await handle.createWritable();
                        await writable.write(text);
                        await writable.close();
                    } else {
                        const blob = new Blob([text], { type: 'text/javascript' });
                        const url = URL.createObjectURL(blob);
                        const anchor = document.createElement('a');
                        anchor.href = url;
                        anchor.download = defaultName;
                        document.body.appendChild(anchor);
                        anchor.click();
                        anchor.remove();
                        URL.revokeObjectURL(url);
                    }
                    setStatus('Saved.');
                } catch (error) {
                    console.error(error);
                    setStatus('Save failed.');
                }
            });
        }
    }

    function init() {
        initTabs();
        initUntokenizer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
