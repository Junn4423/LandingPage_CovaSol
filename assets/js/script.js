/**
 * COVASOL Landing Page JavaScript
 * Modern, Interactive, and Performance-optimized
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================================================
    // LANGUAGE SWITCHER
    // ============================================================================
    
    let currentLanguage = localStorage.getItem('covasol-language') || 'vi';

    function translate(key, fallback = '') {
        const langPack = translations[currentLanguage] || {};
        if (langPack && Object.prototype.hasOwnProperty.call(langPack, key)) {
            return langPack[key];
        }
        return fallback || key;
    }
    
    // Language switcher elements
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    const currentLangSpan = document.getElementById('currentLang');
    const langOptions = document.querySelectorAll('.lang-option');
    
    // Initialize language
    function initLanguage() {
        updateLanguage(currentLanguage);
        updateActiveLanguage(currentLanguage);
    }
    
    // Update active language in dropdown
    function updateActiveLanguage(lang) {
        langOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.lang === lang) {
                option.classList.add('active');
            }
        });
        
        // Update current language display
        const langMap = {
            'vi': 'VI',
            'en': 'EN', 
            'fr': 'FR'
        };
        if (currentLangSpan) {
            currentLangSpan.textContent = langMap[lang];
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }
    
    // Update page content based on language
    function updateLanguage(lang) {
        const elements = document.querySelectorAll('[data-key]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[lang][key];
                } else if (element.tagName === 'SELECT') {
                    // Handle select options separately
                    return;
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
        
        // Update select options
        updateSelectOptions(lang);
        
        // Store language preference
        localStorage.setItem('covasol-language', lang);
        currentLanguage = lang;
    }
    
    // Update select dropdown options
    function updateSelectOptions(lang) {
        const serviceSelect = document.getElementById('service');
        if (serviceSelect && translations[lang]) {
            const options = serviceSelect.querySelectorAll('option');
            options.forEach(option => {
                const key = option.getAttribute('data-key');
                if (key && translations[lang][key]) {
                    option.textContent = translations[lang][key];
                }
            });
        }
    }
    
    // Language dropdown toggle
    if (langBtn) {
        langBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            langMenu.classList.toggle('active');
        });
    }
    
    // Language option selection
    langOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLang = this.dataset.lang;
            updateLanguage(selectedLang);
            updateActiveLanguage(selectedLang);
            langMenu.classList.remove('active');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (langMenu && !langMenu.contains(e.target) && !langBtn.contains(e.target)) {
            langMenu.classList.remove('active');
        }
    });
    
    // Initialize language on page load
    initLanguage();
    
    // ============================================================================
    // LOADING SCREEN
    // ============================================================================
    
    const loadingScreen = document.getElementById('loading');
    
    // Hide loading screen after page load
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Remove loading screen from DOM after animation
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.remove();
                }
            }, 500);
        }, 1000); // Show loading for at least 1 second
    });
    
    // ============================================================================
    // NAVIGATION
    // ============================================================================
    
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }
    
    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(13, 27, 42, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(13, 27, 42, 0.1)';
        } else {
            navbar.style.background = 'rgba(13, 27, 42, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
    
    // Active nav link highlighting
    function setActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNavLink);
    
    // ============================================================================
    // SMOOTH SCROLLING
    // ============================================================================
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================================================
    // ANIMATION INITIALIZATION
    // ============================================================================
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out-cubic',
            once: false, // Allow animations to repeat
            offset: 120,
            delay: 0,
            anchorPlacement: 'top-bottom'
        });
        
        // Refresh AOS on window resize
        window.addEventListener('resize', function() {
            AOS.refresh();
        });
        
        console.log('AOS Initialized successfully');
    } else {
        console.error('AOS library not loaded');
    }
    
    // ============================================================================
    // COUNTER ANIMATION
    // ============================================================================
    
    function animateCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        const speed = 200; // Animation speed
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-counter'));
            const increment = target / speed;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current);
                    setTimeout(updateCounter, 1);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Start animation when element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.7 });
            
            observer.observe(counter);
        });
    }
    
    // Initialize counter animation
    animateCounters();
    
    // ============================================================================
    // REVIEWS RATING BARS ANIMATION
    // ============================================================================
    
    function animateRatingBars() {
        const ratingBars = document.querySelectorAll('.bar .fill');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    
                    // Reset and animate
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        ratingBars.forEach(bar => {
            observer.observe(bar);
        });
    }
    
    // Initialize rating bars animation
    animateRatingBars();
    
    // ============================================================================
    // CONTACT FORM WITH GOOGLE APPS SCRIPT INTEGRATION
    // ============================================================================
    
    const quoteForm = document.getElementById('quoteForm');
    
    if (quoteForm) {
        // Real-time validation
        const formInputs = quoteForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    function validateForm(data) {
        let isValid = true;
        const errors = {};
        
        // Name validation
        if (!data.name || data.name.length < 2) {
            errors.name = 'Họ và tên phải có ít nhất 2 ký tự';
            isValid = false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.email = 'Email không hợp lệ';
            isValid = false;
        }
        
        // Phone validation - Allow Vietnamese phone formats
        const phoneRegex = /^(\+84|84|0)[3-9][0-9]{8}$/;
        const cleanPhone = data.phone.replace(/[\s\-\.]/g, '');
        if (!data.phone || !phoneRegex.test(cleanPhone)) {
            errors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
            isValid = false;
        }
        
        // Service validation
        if (!data.service) {
            errors.service = 'Vui lòng chọn dịch vụ';
            isValid = false;
        }
        
        // Message validation
        if (!data.message || data.message.length < 10) {
            errors.message = 'Nội dung yêu cầu phải có ít nhất 10 ký tự';
            isValid = false;
        }
        
        // Display errors
        Object.keys(errors).forEach(field => {
            showFieldError(field, errors[field]);
        });
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const name = field.name;
        let error = '';
        
        switch (name) {
            case 'name':
                if (value.length < 2) error = 'Họ và tên phải có ít nhất 2 ký tự';
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) error = 'Email không hợp lệ';
                break;
            case 'phone':
                const phoneRegex = /^[0-9]{10,11}$/;
                if (!phoneRegex.test(value.replace(/\s/g, ''))) error = 'Số điện thoại không hợp lệ';
                break;
            case 'service':
                if (!value) error = 'Vui lòng chọn dịch vụ';
                break;
            case 'message':
                if (value.length < 10) error = 'Tin nhắn phải có ít nhất 10 ký tự';
                break;
        }
        
        if (error) {
            showFieldError(name, error);
            return false;
        } else {
            clearFieldError(field);
            return true;
        }
    }
    
    function showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        
        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error styling
        field.style.borderColor = '#ff6b6b';
        field.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.2)';
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        formGroup.appendChild(errorElement);
        
        // Scroll to first error if not visible
        if (!isInViewport(field)) {
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.remove();
        }
        
        // Reset field styling
        field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        field.style.boxShadow = '';
        
        // Add success styling if field is valid
        if (field.value.trim() && validateSingleField(field)) {
            field.classList.add('form-success');
        } else {
            field.classList.remove('form-success');
        }
    }
    
    function validateSingleField(field) {
        const value = field.value.trim();
        const name = field.name || field.id;
        
        switch (name) {
            case 'name':
                return value.length >= 2;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            case 'phone':
                const phoneRegex = /^(\+84|84|0)[3-9][0-9]{8}$/;
                const cleanPhone = value.replace(/[\s\-\.]/g, '');
                return phoneRegex.test(cleanPhone);
            case 'service':
                return value !== '';
            case 'message':
                return value.length >= 10;
            default:
                return true;
        }
    }
    
    // Google Apps Script Form Submission Function
    window.sendQuote = async function() {
        const form = document.getElementById('quoteForm');
        const submitButton = document.getElementById('submitBtn');
        const originalText = submitButton.innerHTML;
        
        // Get form data
        const data = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            service: document.getElementById("service").value,
            message: document.getElementById("message").value.trim()
        };
        
        // Validate form data
        if (!validateForm(data)) {
            return;
        }
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitButton.disabled = true;
        
        try {
            // Send to Google Apps Script
            const response = await fetch("https://script.google.com/macros/s/AKfycby1t-q3w1EcaUYyT0P8M6ilRiWwdxSLFcqtIL6pHwA3nWYYPU4bh8kQYafZxJCLR4kaHA/exec", {
                method: "POST",
                mode: "no-cors", // Required for Google Apps Script
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            
            // Since we're using no-cors mode, we can't check response status
            // Assume success if no error was thrown
            form.reset();
            showNotification('Cảm ơn bạn! COVASOL đã nhận yêu cầu báo giá và sẽ liên hệ sớm.', 'success');
            
            // Clear any existing field errors
            const formGroups = form.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                const errorMessage = group.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
                const field = group.querySelector('input, select, textarea');
                if (field) {
                    field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
            });
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ trực tiếp qua email.', 'error');
        } finally {
            // Reset button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    };
    
    // ============================================================================
    // NOTIFICATION SYSTEM
    // ============================================================================
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#2E8B57' : type === 'error' ? '#e74c3c' : '#124E66',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            maxWidth: '400px',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        notification.querySelector('.notification-content').style.display = 'flex';
        notification.querySelector('.notification-content').style.alignItems = 'center';
        notification.querySelector('.notification-content').style.gap = '10px';
        
        const closeBtn = notification.querySelector('.notification-close');
        Object.assign(closeBtn.style, {
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '10px'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto dismiss
        setTimeout(() => {
            dismissNotification(notification);
        }, 5000);
        
        // Close button
        closeBtn.addEventListener('click', () => {
            dismissNotification(notification);
        });
    }
    
    function dismissNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
    
    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
    
    // ============================================================================
    // BACK TO TOP BUTTON
    // ============================================================================
    
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide back to top button
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Scroll to top functionality
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ============================================================================
    // CONTACT FLOATING BUTTON
    // ============================================================================

    const contactFab = document.querySelector('.contact-fab');

    if (contactFab) {
        const toggleButton = contactFab.querySelector('.contact-fab__toggle');
        const actionLinks = contactFab.querySelectorAll('.contact-fab__action');

        const closeFab = () => {
            contactFab.classList.remove('open');
            if (toggleButton) {
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        };

        if (toggleButton) {
            toggleButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const isOpen = contactFab.classList.toggle('open');
                toggleButton.setAttribute('aria-expanded', String(isOpen));
            });
        }

        actionLinks.forEach((link) => {
            link.addEventListener('click', () => {
                closeFab();
            });
        });

        document.addEventListener('click', (event) => {
            if (!contactFab.contains(event.target)) {
                closeFab();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeFab();
            }
        });
    }
    
    // ============================================================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================================================
    
    // Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // ============================================================================
    // PARTICLE ANIMATION
    // ============================================================================
    
    function createParticles() {
        const particlesContainer = document.querySelector('.hero-particles');
        if (!particlesContainer) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    // Create additional particles
    createParticles();
    
    // ============================================================================
    // LOGO FALLBACK
    // ============================================================================
    
    // Handle logo loading errors - but should not be needed with local file
    const logos = document.querySelectorAll('img[alt="COVASOL Logo"]');
    logos.forEach(logo => {
        logo.addEventListener('error', function() {
            console.warn('Logo failed to load:', this.src);
            // Create a simple text-based logo as fallback
            const textLogo = document.createElement('div');
            textLogo.innerHTML = 'COVASOL';
            textLogo.style.fontSize = '16px';
            textLogo.style.fontWeight = '700';
            textLogo.style.width = '40px';
            textLogo.style.height = '40px';
            textLogo.style.display = 'flex';
            textLogo.style.alignItems = 'center';
            textLogo.style.justifyContent = 'center';
            textLogo.style.background = 'var(--gradient-secondary)';
            textLogo.style.borderRadius = '8px';
            textLogo.style.color = 'white';
            textLogo.style.fontSize = '10px';
            
            this.parentNode.replaceChild(textLogo, this);
        });
    });
    
    // ============================================================================
    // ACCESSIBILITY IMPROVEMENTS
    // ============================================================================
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        }
    });
    
    // Focus management for mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                // Focus first menu item when menu opens
                const firstLink = navMenu.querySelector('.nav-link');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        });
    }
    
    // ============================================================================
    // MOBILE OPTIMIZATIONS
    // ============================================================================
    
    // Detect mobile device
    function isMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Optimize for mobile performance
    if (isMobile()) {
        // Reduce particle count on mobile
        document.querySelectorAll('.particle').forEach((particle, index) => {
            if (index > 2) { // Keep only 3 particles on mobile
                particle.remove();
            }
        });
        
        // Add touch class to body
        document.body.classList.add('touch-device');
    }
    
    // Handle touch events for better mobile interaction
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const diff = touchStartY - touchEndY;
        
        // Swipe up to close mobile menu
        if (diff > swipeThreshold && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    }
    
    // Prevent body scroll when mobile menu is open
    function toggleBodyScroll(disable) {
        if (disable) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }
    
    // Update mobile menu toggle to prevent body scroll
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isMenuActive = navMenu.classList.contains('active');
            toggleBodyScroll(!isMenuActive);
        });
    }
    
    // Close menu on link click and restore scroll
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggleBodyScroll(false);
        });
    });
    
    // ============================================================================
    // HOMEPAGE DYNAMIC CONTENT (API-DRIVEN SECTIONS)
    // ============================================================================

    const apiClient = window.covasolApi;
    const homeProductsGrid = document.getElementById('homeProductsGrid');
    const homeProductsLoading = document.getElementById('homeProductsLoading');
    const homeProductsEmpty = document.getElementById('homeProductsEmpty');
    const homeBlogGrid = document.getElementById('homeBlogGrid');
    const homeBlogLoading = document.getElementById('homeBlogLoading');
    const homeBlogEmpty = document.getElementById('homeBlogEmpty');

    function setVisibility(element, visible) {
        if (!element) return;
        element.classList.toggle('is-hidden', !visible);
    }

    function truncateText(value, limit = 140) {
        if (!value) return '';
        if (value.length <= limit) return value;
        return `${value.slice(0, limit).trim()}…`;
    }

    function formatLocalizedDate(value) {
        if (!value) return '';
        try {
            return new Date(value).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return value;
        }
    }

    function buildHomeProductCard(product, index) {
    const detailUrl = `product-detail.html?code=${encodeURIComponent(product.code)}`;
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'zoom-in');
        card.setAttribute('data-aos-delay', `${(index % 6) * 100}`);

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'product-image';
        const imageLink = document.createElement('a');
        imageLink.href = detailUrl;
        const img = document.createElement('img');
        img.src =
            product.imageUrl ||
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80';
        img.alt = product.name || 'COVASOL Product';
        imageLink.appendChild(img);
        imageWrapper.appendChild(imageLink);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'product-content';

        const titleEl = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = detailUrl;
        titleLink.textContent = product.name || 'COVASOL Solution';
        titleEl.appendChild(titleLink);

        const categoryEl = document.createElement('p');
        categoryEl.className = 'product-category';
        categoryEl.textContent = product.category || 'Giải pháp số';

        const descriptionEl = document.createElement('p');
        descriptionEl.className = 'product-description';
        descriptionEl.textContent =
            product.shortDescription ||
            truncateText(product.description, 160) ||
            'Giải pháp công nghệ linh hoạt cho doanh nghiệp.';

        contentWrapper.appendChild(titleEl);
        contentWrapper.appendChild(categoryEl);
        contentWrapper.appendChild(descriptionEl);

        if (product.featureTags && product.featureTags.length) {
            const featureWrapper = document.createElement('div');
            featureWrapper.className = 'product-features';
            product.featureTags.slice(0, 3).forEach((feature) => {
                const tag = document.createElement('span');
                tag.className = 'feature-tag';
                tag.textContent = feature;
                featureWrapper.appendChild(tag);
            });
            contentWrapper.appendChild(featureWrapper);
        }

        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'product-actions';

        if (product.ctaPrimary?.label) {
            const primaryLink = document.createElement('a');
            primaryLink.className = 'btn btn-primary';
            primaryLink.href = product.ctaPrimary.url || detailUrl;
            primaryLink.textContent = product.ctaPrimary.label;
            actionsWrapper.appendChild(primaryLink);
        }

        const detailLink = document.createElement('a');
        detailLink.className = 'btn btn-outline';
        detailLink.href = detailUrl;
        const detailLabel = document.createElement('span');
        detailLabel.dataset.key = 'read-more';
        detailLabel.textContent = translate('read-more', 'Read more');
        const detailIcon = document.createElement('i');
        detailIcon.className = 'fas fa-arrow-right';
        detailLink.appendChild(detailLabel);
        detailLink.appendChild(detailIcon);
        actionsWrapper.appendChild(detailLink);

        contentWrapper.appendChild(actionsWrapper);

        card.appendChild(imageWrapper);
        card.appendChild(contentWrapper);

        card.tabIndex = 0;
        card.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;
            window.location.href = detailUrl;
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.target.closest('a')) {
                window.location.href = detailUrl;
            }
        });

        return card;
    }

    function buildHomePostCard(post, index) {
    const detailUrl = `blog-detail.html?code=${encodeURIComponent(post.code)}`;
        const article = document.createElement('article');
        article.className = 'post-card';
        article.setAttribute('data-aos', 'fade-up');
        article.setAttribute('data-aos-delay', `${(index % 6) * 100}`);

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'post-image';
        const imageLink = document.createElement('a');
        imageLink.href = detailUrl;
        const img = document.createElement('img');
        img.src =
            post.imageUrl ||
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80';
        img.alt = post.title || 'COVASOL Blog';
        imageLink.appendChild(img);
        imageWrapper.appendChild(imageLink);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'post-content';

        const metaWrapper = document.createElement('div');
        metaWrapper.className = 'post-meta';
        const categoryEl = document.createElement('span');
        categoryEl.className = 'post-category';
        categoryEl.textContent = post.category || 'Tin tức';
        const dateEl = document.createElement('span');
        dateEl.className = 'post-date';
        dateEl.textContent = formatLocalizedDate(post.publishedAt);
        metaWrapper.appendChild(categoryEl);
        metaWrapper.appendChild(dateEl);

        const titleEl = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = detailUrl;
        titleLink.textContent = post.title || 'COVASOL Insight';
        titleEl.appendChild(titleLink);

        const excerptEl = document.createElement('p');
        excerptEl.textContent = post.excerpt || truncateText(post.content, 160);

        contentWrapper.appendChild(metaWrapper);
        contentWrapper.appendChild(titleEl);
        contentWrapper.appendChild(excerptEl);

        if (post.tags && post.tags.length) {
            const tagsWrapper = document.createElement('div');
            tagsWrapper.className = 'post-tags';
            post.tags.slice(0, 3).forEach((tag) => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tagsWrapper.appendChild(tagEl);
            });
            contentWrapper.appendChild(tagsWrapper);
        }

        const readMoreLink = document.createElement('a');
        readMoreLink.className = 'read-more';
        readMoreLink.href = detailUrl;
        const readMoreLabel = document.createElement('span');
        readMoreLabel.dataset.key = 'read-more';
        readMoreLabel.textContent = translate('read-more', 'Read more');
        const readMoreIcon = document.createElement('i');
        readMoreIcon.className = 'fas fa-arrow-right';
        readMoreLink.appendChild(readMoreLabel);
        readMoreLink.appendChild(readMoreIcon);
        contentWrapper.appendChild(readMoreLink);

        article.appendChild(imageWrapper);
        article.appendChild(contentWrapper);

        article.tabIndex = 0;
        article.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;
            window.location.href = detailUrl;
        });
        article.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.target.closest('a')) {
                window.location.href = detailUrl;
            }
        });

        return article;
    }

    const isActiveHomeProduct = (product) =>
        (product?.status || 'inactive').toLowerCase() === 'active';
    const isPublishedHomePost = (post) =>
        (post?.status || 'draft').toLowerCase() === 'published';

    async function loadHomeProducts() {
        if (!homeProductsGrid || !apiClient) return;
        setVisibility(homeProductsLoading, true);
        setVisibility(homeProductsEmpty, false);
        homeProductsGrid.innerHTML = '';

        try {
            const products = await apiClient.fetchProducts({ limit: 3, offset: 0, status: 'active' });
            const visibleProducts = (products || []).filter(isActiveHomeProduct);
            if (!visibleProducts.length) {
                setVisibility(homeProductsEmpty, true);
                return;
            }
            visibleProducts.slice(0, 3).forEach((product, index) => {
                homeProductsGrid.appendChild(buildHomeProductCard(product, index));
            });
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        } catch (error) {
            setVisibility(homeProductsEmpty, true);
            const emptyText = homeProductsEmpty?.querySelector('p');
            if (emptyText) {
                emptyText.textContent = error.message || translate('home-products-empty', 'Không thể tải sản phẩm.');
            }
        } finally {
            setVisibility(homeProductsLoading, false);
        }
    }

    async function loadHomeBlogPosts() {
        if (!homeBlogGrid || !apiClient) return;
        setVisibility(homeBlogLoading, true);
        setVisibility(homeBlogEmpty, false);
        homeBlogGrid.innerHTML = '';

        try {
            const posts = await apiClient.fetchBlogPosts({ limit: 3, offset: 0, status: 'published' });
            const visiblePosts = (posts || []).filter(isPublishedHomePost);
            if (!visiblePosts.length) {
                setVisibility(homeBlogEmpty, true);
                return;
            }
            visiblePosts.slice(0, 3).forEach((post, index) => {
                homeBlogGrid.appendChild(buildHomePostCard(post, index));
            });
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        } catch (error) {
            setVisibility(homeBlogEmpty, true);
            const emptyText = homeBlogEmpty?.querySelector('p');
            if (emptyText) {
                emptyText.textContent = error.message || translate('home-blog-empty', 'Không thể tải bài viết.');
            }
        } finally {
            setVisibility(homeBlogLoading, false);
        }
    }

    if (homeProductsGrid || homeBlogGrid) {
        if (apiClient) {
            Promise.all([loadHomeProducts(), loadHomeBlogPosts()]).finally(() => {
                updateLanguage(currentLanguage);
            });
        } else {
            console.warn('Covasol API helper is not available. Homepage dynamic sections will be static.');
        }
    }

    // ============================================================================
    // WINDOW RESIZE HANDLER
    // ============================================================================
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close mobile menu on desktop resize
            if (window.innerWidth > 768) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
                toggleBodyScroll(false); // Restore scroll on desktop
            }
            
            // Refresh AOS on resize
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }, 250);
    });
    
    // ============================================================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================================================
    
    // Enhanced scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .feature-item, .detail-card');
    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });
    
    // ============================================================================
    // ERROR HANDLING
    // ============================================================================
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        // You could send this to an error tracking service
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault();
    });
    
    // ============================================================================
    // CONSOLE SIGNATURE
    // ============================================================================
    
    console.log(
        '%cCOVASOL Landing Page',
        'color: #2E8B57; font-size: 20px; font-weight: bold;'
    );
    console.log(
        '%cCore Value. Smart Solutions.',
        'color: #124E66; font-size: 14px; font-style: italic;'
    );
    console.log(
        '%cDeveloped with ❤️ by COVASOL Team',
        'color: #A5B452; font-size: 12px;'
    );
    
});

// ============================================================================
// UTILITIES
// ============================================================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Format phone number
function formatPhoneNumber(value) {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneLength = phoneNumber.length;
    
    if (phoneLength < 4) return phoneNumber;
    if (phoneLength < 7) {
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}





