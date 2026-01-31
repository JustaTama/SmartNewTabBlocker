/**
 * inject.js
 * Intercepts window.open and attaches listeners deeply into Shadow DOMs.
 */
(function() {
    const originalWindowOpen = window.open;

    /**
     * Checks if a URL is same-origin (same domain) as the current page
     * @param {string} url - The URL to check
     * @returns {boolean} True if same-origin, false otherwise
     */
    function isSameOrigin(url) {
        if (!url) return false;
        
        try {
            if (url.startsWith('/') || url.startsWith('#')) {
                return true;
            }
            
            const linkUrlObj = new URL(url, window.location.href);
            const currentUrlObj = new URL(window.location.href);
            
            return linkUrlObj.origin === currentUrlObj.origin;
        } catch (err) {
            return false;
        }
    }

    /**
     * Dispatches a custom event to notify content script about window.open attempt
     * @param {string} url - The URL to open
     * @param {string} name - Window name
     * @param {string} specs - Window specs
     */
    function dispatchBlockEvent(url, name, specs) {
        const targetUrl = url || 'about:blank';
        window.dispatchEvent(new CustomEvent('NMT_WindowOpenAttempt', { 
            detail: { url: targetUrl, name: name, specs: specs } 
        }));
    }

    /**
     * Override window.open to intercept external links only
     * Allows same-origin navigation to proceed normally
     * @param {string} url - The URL to open
     * @param {string} name - Window name
     * @param {string} specs - Window specs
     * @returns {Window|null} Original window.open result for same-origin, null for external
     */
    window.open = function (url, name, specs) {
        if (isSameOrigin(url)) {
            return originalWindowOpen.call(window, url, name, specs);
        }
        
        dispatchBlockEvent(url, name, specs);
        return null; 
    };

    /**
     * Handles click events on links with target="_blank"
     * Allows same-origin links to navigate normally, intercepts external links
     * @param {Event} e - Click event
     */
    function handleLinkClick(e) {
        const path = e.composedPath ? e.composedPath() : [e.target];
        let anchor = null;

        for (const el of path) {
            if (el instanceof HTMLAnchorElement) {
                anchor = el;
                break;
            }
        }

        if (anchor && anchor.target === '_blank') {
            if (isSameOrigin(anchor.href)) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            dispatchBlockEvent(anchor.href, '_blank', null);
        }
    }

    document.addEventListener('click', handleLinkClick, true);

    /**
     * Override attachShadow to attach click listener to Shadow DOM roots
     * Ensures links in Shadow DOM are also intercepted
     * @param {ShadowRootInit} init - Shadow root initialization options
     * @returns {ShadowRoot} The created shadow root
     */
    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init) {
        const shadowRoot = originalAttachShadow.call(this, init);
        try {
            shadowRoot.addEventListener('click', handleLinkClick, true);
        } catch (e) {}
        return shadowRoot;
    };
})();