/**
 * Renders the list of blocked domains.
 */
function renderList() {
    chrome.storage.sync.get(['blacklist'], (result) => {
        const list = result.blacklist || [];
        const ul = document.getElementById('list');
        ul.innerHTML = '';

        list.forEach(host => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${host}</span>
                <button class="delete-btn" data-host="${host}">Remove</button>
            `;
            ul.appendChild(li);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeHost(e.target.getAttribute('data-host'));
            });
        });
    });
}

/**
 * Removes a host from the blacklist.
 * @param {string} host 
 */
function removeHost(host) {
    chrome.storage.sync.get(['blacklist'], (result) => {
        let list = result.blacklist || [];
        list = list.filter(h => h !== host);
        chrome.storage.sync.set({ blacklist: list }, renderList);
    });
}

/**
 * Adds a new host manually.
 */
document.getElementById('add-btn').addEventListener('click', () => {
    const input = document.getElementById('new-host');
    const host = input.value.trim();
    if (host) {
        chrome.storage.sync.get(['blacklist'], (result) => {
            const list = result.blacklist || [];
            if (!list.includes(host)) {
                list.push(host);
                chrome.storage.sync.set({ blacklist: list }, () => {
                    input.value = '';
                    renderList();
                });
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', renderList);