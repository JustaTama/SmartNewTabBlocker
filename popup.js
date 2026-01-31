/**
 * Helper to extract hostname from URL string
 */
function getHostname(urlString) {
    try {
        const url = new URL(urlString.includes('http') ? urlString : `http://${urlString}`);
        return url.hostname;
    } catch (e) {
        return null;
    }
}

/**
 * Render the blacklist from storage
 */
function renderBlacklist() {
    chrome.storage.sync.get(['blacklist'], (result) => {
        const list = result.blacklist || [];
        const ul = document.getElementById('blacklist');
        const emptyMsg = document.getElementById('empty-block-msg');

        ul.innerHTML = '';

        if (list.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
            list.forEach(host => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="host">${host}</span>
                    <button class="delete-btn" title="Remove">&times;</button>
                `;
                
                // Remove logic
                li.querySelector('.delete-btn').addEventListener('click', () => {
                    removeFromBlacklist(host);
                });

                ul.appendChild(li);
            });
        }
    });
}

/**
 * Render the allowlist from storage
 */
function renderAllowlist() {
    chrome.storage.sync.get(['allowlist'], (result) => {
        const list = result.allowlist || [];
        const ul = document.getElementById('allowlist');
        const emptyMsg = document.getElementById('empty-allow-msg');

        ul.innerHTML = '';

        if (list.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
            list.forEach(host => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="host">${host}</span>
                    <button class="delete-btn" title="Remove">&times;</button>
                `;
                
                // Remove logic
                li.querySelector('.delete-btn').addEventListener('click', () => {
                    removeFromAllowlist(host);
                });

                ul.appendChild(li);
            });
        }
    });
}

/**
 * Add a host to blacklist
 */
function addToBlacklist(hostRaw) {
    const hostname = getHostname(hostRaw);
    if (!hostname) return;

    chrome.storage.sync.get(['blacklist', 'allowlist'], (result) => {
        const blacklist = result.blacklist || [];
        const allowlist = result.allowlist || [];
        
        // Remove from allowlist if exists
        const newAllowlist = allowlist.filter(h => h !== hostname);
        
        if (!blacklist.includes(hostname)) {
            blacklist.push(hostname);
            chrome.storage.sync.set({ 
                blacklist: blacklist,
                allowlist: newAllowlist 
            }, () => {
                renderBlacklist();
                renderAllowlist();
                document.getElementById('new-block-host').value = '';
            });
        } else {
            chrome.storage.sync.set({ allowlist: newAllowlist }, () => {
                renderAllowlist();
            });
        }
    });
}

/**
 * Add a host to allowlist
 */
function addToAllowlist(hostRaw) {
    const hostname = getHostname(hostRaw);
    if (!hostname) return;

    chrome.storage.sync.get(['blacklist', 'allowlist'], (result) => {
        const blacklist = result.blacklist || [];
        const allowlist = result.allowlist || [];
        
        // Remove from blacklist if exists
        const newBlacklist = blacklist.filter(h => h !== hostname);
        
        if (!allowlist.includes(hostname)) {
            allowlist.push(hostname);
            chrome.storage.sync.set({ 
                allowlist: allowlist,
                blacklist: newBlacklist 
            }, () => {
                renderAllowlist();
                renderBlacklist();
                document.getElementById('new-allow-host').value = '';
            });
        } else {
            chrome.storage.sync.set({ blacklist: newBlacklist }, () => {
                renderBlacklist();
            });
        }
    });
}

/**
 * Remove a host from blacklist
 */
function removeFromBlacklist(host) {
    chrome.storage.sync.get(['blacklist'], (result) => {
        let list = result.blacklist || [];
        list = list.filter(h => h !== host);
        chrome.storage.sync.set({ blacklist: list }, renderBlacklist);
    });
}

/**
 * Remove a host from allowlist
 */
function removeFromAllowlist(host) {
    chrome.storage.sync.get(['allowlist'], (result) => {
        let list = result.allowlist || [];
        list = list.filter(h => h !== host);
        chrome.storage.sync.set({ allowlist: list }, renderAllowlist);
    });
}

/**
 * Check current tab logic
 */
function checkCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            const currentHost = getHostname(tabs[0].url);
            if (currentHost) {
                const blockBtn = document.getElementById('block-current');
                const allowBtn = document.getElementById('allow-current');
                
                blockBtn.innerText = `Block ${currentHost}`;
                allowBtn.innerText = `Allow ${currentHost}`;
                
                blockBtn.style.display = 'block';
                allowBtn.style.display = 'block';
                
                blockBtn.onclick = () => {
                    addToBlacklist(currentHost);
                };
                
                allowBtn.onclick = () => {
                    addToAllowlist(currentHost);
                };
            }
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderBlacklist();
    renderAllowlist();
    checkCurrentTab();

    // Blacklist handlers
    document.getElementById('add-block-btn').addEventListener('click', () => {
        addToBlacklist(document.getElementById('new-block-host').value);
    });

    document.getElementById('new-block-host').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addToBlacklist(e.target.value);
        }
    });

    // Allowlist handlers
    document.getElementById('add-allow-btn').addEventListener('click', () => {
        addToAllowlist(document.getElementById('new-allow-host').value);
    });

    document.getElementById('new-allow-host').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addToAllowlist(e.target.value);
        }
    });
});