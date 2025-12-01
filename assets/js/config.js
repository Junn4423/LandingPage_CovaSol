(function () {
    if (!window.covasolConfig) {
        window.covasolConfig = {};
    }

    const metaBase = document.querySelector('meta[name="api-base"]')?.content;
    const scriptBase = document.currentScript?.dataset?.apiBase;
    const envBase = window.__COVASOL_API_BASE__;
    const localFallback = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : null;

    window.covasolConfig.apiBase = window.covasolConfig.apiBase
        || envBase
        || scriptBase
        || metaBase
        || localFallback
        || '/api';
})();