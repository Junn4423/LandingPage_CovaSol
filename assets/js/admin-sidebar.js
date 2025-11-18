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
            const hasNavPath = Boolean(item.dataset.navPath);
            if (hasNavPath) {
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

        const navButtons = document.querySelectorAll('.admin-sidebar .tab-btn[data-nav-path]');
        navButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const targetPath = button.dataset.navPath;
                if (!targetPath) {
                    return;
                }

                event.preventDefault();

                let destination;
                try {
                    destination = new URL(targetPath, window.location.href);
                } catch (error) {
                    console.warn('Invalid sidebar navigation path:', targetPath, error);
                    return;
                }

                const isSamePath = destination.pathname === window.location.pathname;
                const isSameQuery = destination.search === window.location.search;
                const isSameHash = destination.hash === window.location.hash;

                if (isSamePath && isSameQuery && isSameHash) {
                    return;
                }

                window.location.href = destination.href;
            });
        });
    });

    globalNamespace.setActiveNav = setActiveNavKey;
    window.covasolSidebar = globalNamespace;
})();
