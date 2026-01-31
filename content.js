/**
 * content.js
 * Handles UI rendering and Cross-frame communication.
 */

// Cache for fake domains list
let fakeDomainsCache = null;
let fakeDomainsLoaded = false;

// Load fake domains list
function loadFakeDomains() {
    if (fakeDomainsLoaded) return Promise.resolve(fakeDomainsCache);
    
    return fetch(chrome.runtime.getURL('fake_domains.json'))
        .then(response => response.json())
        .then(data => {
            fakeDomainsCache = data;
            fakeDomainsLoaded = true;
            return data;
        })
        .catch(error => {
            console.error('[NoMoreTabs] Error loading fake domains:', error);
            fakeDomainsCache = {};
            fakeDomainsLoaded = true;
            return {};
        });
}

// Check if domain is in fake domains list
function isFakeDomain(hostname) {
    if (!fakeDomainsCache || !hostname) return false;
    
    // Normalize hostname: lowercase and remove protocol if present
    let normalizedHostname = hostname.toLowerCase().trim();
    
    // Remove protocol (http://, https://)
    normalizedHostname = normalizedHostname.replace(/^https?:\/\//, '');
    
    // Remove port if present
    normalizedHostname = normalizedHostname.split(':')[0];
    
    // Remove path if present
    normalizedHostname = normalizedHostname.split('/')[0];
    
    // Check exact match
    if (fakeDomainsCache[normalizedHostname]) return true;
    
    // Check without www prefix
    const hostnameWithoutWww = normalizedHostname.replace(/^www\./, '');
    if (hostnameWithoutWww !== normalizedHostname && fakeDomainsCache[hostnameWithoutWww]) return true;
    
    // Check with www prefix
    const hostnameWithWww = 'www.' + hostnameWithoutWww;
    if (fakeDomainsCache[hostnameWithWww]) return true;
    
    return false;
}

function injectScript() {
    try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('inject.js');
        (document.head || document.documentElement).appendChild(script);
        script.onload = function() { script.remove(); };
    } catch (e) {
        console.log("[NoMoreTabs] Cannot inject script.");
    }
}

function getHostname(urlString) {
    try {
        // Remove protocol if present and normalize
        let cleanUrl = urlString.trim();
        
        // If URL doesn't have protocol, add a temporary one for URL parsing
        if (!cleanUrl.match(/^https?:\/\//i)) {
            cleanUrl = 'http://' + cleanUrl;
        }
        
        const url = new URL(cleanUrl);
        // Return only hostname (domain), lowercase for consistency
        return url.hostname.toLowerCase();
    } catch (e) {
        // Fallback: try to extract domain manually
        try {
            let domain = urlString.replace(/^https?:\/\//i, '');
            domain = domain.split('/')[0].split(':')[0].toLowerCase();
            return domain || 'unknown-host';
        } catch (e2) {
            return 'unknown-host';
        }
    }
}

function addToBlacklist(hostname) {
    chrome.storage.sync.get(['blacklist', 'allowlist'], (result) => {
        const blacklist = result.blacklist || [];
        const allowlist = result.allowlist || [];
        const newAllowlist = allowlist.filter(h => h !== hostname);
        
        if (!blacklist.includes(hostname)) {
            blacklist.push(hostname);
            chrome.storage.sync.set({ 
                blacklist: blacklist,
                allowlist: newAllowlist 
            });
        } else {
            chrome.storage.sync.set({ allowlist: newAllowlist });
        }
    });
}

function addToAllowlist(hostname) {
    chrome.storage.sync.get(['blacklist', 'allowlist'], (result) => {
        const blacklist = result.blacklist || [];
        const allowlist = result.allowlist || [];
        const newBlacklist = blacklist.filter(h => h !== hostname);
        
        if (!allowlist.includes(hostname)) {
            allowlist.push(hostname);
            chrome.storage.sync.set({ 
                allowlist: allowlist,
                blacklist: newBlacklist 
            });
        } else {
            chrome.storage.sync.set({ blacklist: newBlacklist });
        }
    });
}

function showConfirmationPopup(url, hostname, onConfirm, isFake = false, isAlreadyBlocked = false) {
    if (window !== window.top) return;

    const existingHost = document.getElementById('no-more-tabs-host');
    if (existingHost) existingHost.remove();

    const host = document.createElement('div');
    host.id = 'no-more-tabs-host';
    host.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; width: 0; height: 0;';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Warning message for fake domains
    const warningMessage = isFake ? `
        <div class="warning-box">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
                <strong>WARNING: Fake Website!</strong>
                <p>This domain has been identified as a fraudulent/fake website. You should not visit this website.</p>
            </div>
        </div>
    ` : '';
    
    // Hide checkboxes and modify buttons if already blocked
    const checkboxGroup = isAlreadyBlocked ? 'display: none;' : '';
    const allowButtonText = isAlreadyBlocked ? 'Already Blocked' : 'Allow';
    const allowButtonDisabled = isAlreadyBlocked ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

    const container = document.createElement('div');
    container.innerHTML = `
        <style>
            .overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .card {
                background: #fff; width: 420px; max-width: 90%;
                padding: 24px; border-radius: 12px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            h2 { margin: 0 0 12px 0; font-size: 18px; color: #111827; display: flex; align-items: center; gap: 8px;}
            p { margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.5; }
            .warning-box {
                background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px;
                padding: 16px; margin-bottom: 16px; display: flex; gap: 12px;
                animation: shake 0.5s ease-in-out;
            }
            .warning-icon { font-size: 24px; flex-shrink: 0; }
            .warning-content { flex: 1; }
            .warning-content strong { 
                display: block; color: #dc2626; font-size: 15px; margin-bottom: 6px; 
            }
            .warning-content p { 
                margin: 0; color: #991b1b; font-size: 13px; line-height: 1.5; 
            }
            .url-box {
                background: #eff6ff; padding: 12px; border-radius: 6px; border: 1px solid #bfdbfe;
                word-break: break-all; font-family: 'Courier New', monospace; color: #1d4ed8;
                margin-bottom: 16px; font-size: 13px; max-height: 80px; overflow-y: auto;
            }
            .checkbox-group {
                display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;
            }
            .checkbox-wrapper {
                display: flex; align-items: center; gap: 10px;
                font-size: 13px; color: #374151; user-select: none;
            }
            input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
            input[type="checkbox"]#block-domain { accent-color: #dc2626; }
            input[type="checkbox"]#allow-domain { accent-color: #15803d; }
            .actions { display: flex; gap: 12px; justify-content: flex-end; }
            button {
                border: none; padding: 10px 20px; border-radius: 6px;
                font-weight: 600; cursor: pointer; font-size: 14px; transition: opacity 0.2s;
            }
            .btn-cancel { background: #f3f4f6; color: #374151; }
            .btn-cancel:hover { background: #e5e7eb; }
            .btn-confirm { background: #dc2626; color: white; }
            .btn-confirm:hover { background: #b91c1c; }
            @keyframes popIn {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        </style>
        <div class="overlay">
            <div class="card">
                <h2>🛡️ NoMoreTabs Alert</h2>
                ${warningMessage}
                <p>This site wants to open a new tab to <strong>${hostname}</strong>.</p>
                <div class="url-box">${url}</div>
                <div class="checkbox-group" style="${checkboxGroup}">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="allow-domain">
                        <label for="allow-domain">Always allow <strong>${hostname}</strong></label>
                    </div>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="block-domain">
                        <label for="block-domain">Always block <strong>${hostname}</strong></label>
                    </div>
                </div>
                <div class="actions">
                    <button id="btn-cancel" class="btn-cancel" ${allowButtonDisabled}>${allowButtonText}</button>
                    <button id="btn-confirm" class="btn-confirm">${isAlreadyBlocked ? 'Close' : "Don't Open"}</button>
                </div>
            </div>
        </div>
    `;
    shadow.appendChild(container);

    // Make checkboxes mutually exclusive
    const allowCheckbox = shadow.getElementById('allow-domain');
    const blockCheckbox = shadow.getElementById('block-domain');
    
    allowCheckbox.addEventListener('change', () => {
        if (allowCheckbox.checked) {
            blockCheckbox.checked = false;
        }
    });
    
    blockCheckbox.addEventListener('change', () => {
        if (blockCheckbox.checked) {
            allowCheckbox.checked = false;
        }
    });

    shadow.getElementById('btn-confirm').onclick = () => {
        // Don't open the link, but save preference if checkbox is checked
        if (allowCheckbox.checked) {
            // Save to allowlist for future, but don't open now
            addToAllowlist(hostname);
        } else if (blockCheckbox.checked) {
            // Save to blacklist and don't open
            addToBlacklist(hostname);
        }
        // In all cases, don't open the link (user chose "Don't Open")
        host.remove();
    };

    shadow.getElementById('btn-cancel').onclick = () => {
        if (isAlreadyBlocked) {
            // Already blocked, just close
            host.remove();
            return;
        }
        // Open the link, and save preference if checkbox is checked
        if (allowCheckbox.checked) {
            // Save to allowlist and open the link
            addToAllowlist(hostname);
        } else if (blockCheckbox.checked) {
            // Save to blacklist for future, but open now (user chose "Allow" for this time)
            addToBlacklist(hostname);
        }
        onConfirm(); // Open the link
        host.remove();
    };
}

function handleRequest(url) {
    if (window !== window.top) {
        window.top.postMessage({ action: 'NMT_IFRAME_REQUEST', url: url }, '*');
        return;
    }

    const hostname = getHostname(url);
    
    // Load fake domains and check
    loadFakeDomains().then(() => {
        const isFake = isFakeDomain(hostname);
        
        chrome.storage.sync.get(['blacklist', 'allowlist'], (result) => {
            const blacklist = result.blacklist || [];
            const allowlist = result.allowlist || [];
            
            // If domain is in allowlist, automatically allow
            if (allowlist.includes(hostname)) {
                window.open(url, '_blank');
                return;
            }
            
            // If domain is in blacklist, block silently (unless it's a fake domain - show warning)
            if (blacklist.includes(hostname)) {
                // Show warning popup for fake domains even if already blocked
                if (isFake) {
                    showConfirmationPopup(url, hostname, () => {
                        // User can't open it anyway since it's blocked
                    }, isFake, true);
                }
                return;
            }

            // Otherwise, show confirmation popup with fake domain warning if applicable
            showConfirmationPopup(url, hostname, () => {
                window.open(url, '_blank');
            }, isFake);
        });
    });
}

injectScript();

window.addEventListener('NMT_WindowOpenAttempt', function(e) {
    handleRequest(e.detail.url);
});

if (window === window.top) {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.action === 'NMT_IFRAME_REQUEST') {
            handleRequest(event.data.url);
        }
    });
}