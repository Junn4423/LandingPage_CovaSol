(function () {
    const globalNamespace = window.covasolSidebar || {};

    function setActiveNavKey(key) {
        if (!key) {
            return;
        }

        const sidebar = document.querySelector('.admin-sidebar');
        if (!sidebar) {
            return;
        }

        const items = sidebar.querySelectorAll('[data-nav-key]');
        if (!items.length) {
            return;
        }

        items.forEach((item) => {
            const isActive = item.dataset.navKey === key;
            item.classList.toggle('active', isActive);
            if (item.matches('a')) {
                if (isActive) {
                    item.setAttribute('aria-current', 'page');
                } else {
                    item.removeAttribute('aria-current');
                }
            }
        });

        document.body.dataset.navCurrent = key;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const initialKey = document.body.dataset.navCurrent;
        if (initialKey) {
            setActiveNavKey(initialKey);
        }
    });

    globalNamespace.setActiveNav = setActiveNavKey;
    window.covasolSidebar = globalNamespace;
})();
