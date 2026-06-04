// Prevent browser from restoring scroll position
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Handle page refresh - always go to top and remove hash (except for templates.html)
const handlePageRefresh = () => {
    const currentPage = window.location.pathname;
    
    // If on index.html and there's a hash, remove it and go to top
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
        if (window.location.hash) {
            // Remove hash from URL without triggering navigation
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        window.scrollTo(0, 0);
    }
    // If on templates.html, just scroll to top but stay on page
    else if (currentPage.includes('templates.html')) {
        window.scrollTo(0, 0);
    }
    // For any other page, scroll to top
    else {
        window.scrollTo(0, 0);
    }
};

// Track if we navigated with hash (to distinguish from refresh)
let hasNavigatedWithHash = false;

// Detect if this is a page refresh vs navigation
const isPageRefresh = () => {
    // Check Performance Navigation API first
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
        const navType = navEntries[0].type;
        if (navType === 'reload') {
            hasNavigatedWithHash = false; // Reset on refresh
            return true;
        }
    }
    
    // If we set the flag, it means we navigated with hash
    if (hasNavigatedWithHash) {
        return false;
    }
    
    // If there's a hash but referrer is from different page/domain, it's navigation
    if (window.location.hash) {
        if (document.referrer && !document.referrer.includes(window.location.pathname.split('/').pop())) {
            return false; // Coming from different page = navigation
        }
    }
    
    // Default: treat as refresh if no clear navigation signal
    return true;
};

// Handle initial page load
document.addEventListener('DOMContentLoaded', () => {
    if (isPageRefresh()) {
        handlePageRefresh();
    } else {
        // This is navigation from another page - allow hash navigation
        setTimeout(handleHashNavigation, 200);
    }
});

// Also handle on window load
window.addEventListener('load', () => {
    if (isPageRefresh()) {
        handlePageRefresh();
    } else {
        // Navigation from another page - handle hash if not already handled
        handleHashNavigation();
    }
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links - works on same page and when navigating from other pages
const smoothScrollTo = (hash) => {
    if (!hash || hash === '#' || hash === '#!') return;
    
    // Ensure hash starts with #
    if (!hash.startsWith('#')) {
        hash = '#' + hash;
    }
    
    const target = document.querySelector(hash);
    
    if (target) {
        // CSS already handles scroll-margin-top for navbar offset, so just use scrollIntoView
        target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    }
};

// Handle clicks on anchor links (both #hash and page#hash formats)
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    
    const href = anchor.getAttribute('href');
    if (!href) return;
    
    // Check if it's an anchor link on the same page
    const isSamePageAnchor = href.startsWith('#');
    const isSamePageWithFile = href.includes('#') && 
                               (href.startsWith(window.location.pathname) || 
                                (href.includes('index.html') && (window.location.pathname.includes('index.html') || window.location.pathname === '/')));
    
    if (isSamePageAnchor || isSamePageWithFile) {
        e.preventDefault();
        
        // Extract hash from href (handle both #about and index.html#about formats)
        const hashIndex = href.indexOf('#');
        let hash = hashIndex >= 0 ? href.substring(hashIndex) : href;
        
        // Ensure hash starts with #
        if (!hash.startsWith('#')) {
            hash = '#' + hash;
        }
        
        // Update URL first
        if (hash && hash !== '#') {
            history.pushState(null, '', hash);
            // Mark that we navigated with hash (so refresh detection knows)
            hasNavigatedWithHash = true;
        }
        
        // Scroll after a tiny delay to ensure URL is updated
        setTimeout(() => {
            smoothScrollTo(hash);
        }, 10);
    }
    // If it's a link to another page with a hash (like index.html#about from templates.html),
    // let the browser handle the navigation - handleHashNavigation will catch it after page loads
});

// Handle hash navigation when page loads or when navigating from another page
const handleHashNavigation = () => {
    const hash = window.location.hash;
    if (hash) {
        // Mark that we're navigating with hash (not refreshing)
        hasNavigatedWithHash = true;
        // Small delay to ensure DOM is ready and images are loaded
        setTimeout(() => {
            smoothScrollTo(hash);
            
            // If navigating to home, replay chart bars animation
            if (hash === '#home' || hash === '#') {
                setTimeout(() => {
                    animateChartBars();
                }, 400); // Delay to ensure page is loaded and scrolled
            }
        }, 150);
    }
};

// Hash navigation is now handled in the main DOMContentLoaded and load handlers above

// Handle hash changes (back/forward browser buttons)
window.addEventListener('hashchange', handleHashNavigation);

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Scroll progress indicator
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollIndicator.appendChild(scrollProgress);
document.body.appendChild(scrollIndicator);

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .expertise-box, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Chart bars animation - animate from lowest to highest
const chartBars = document.querySelectorAll('.chart-bar');
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate from lowest to highest: orange (40%) -> yellow (65%) -> green (90%)
            // Find bars by their height classes
            const orangeBar = Array.from(chartBars).find(bar => bar.classList.contains('orange'));
            const yellowBar = Array.from(chartBars).find(bar => bar.classList.contains('yellow'));
            const greenBar = Array.from(chartBars).find(bar => bar.classList.contains('green'));
            
            // Animate in order: orange (shortest) first, then yellow, then green (tallest)
            if (orangeBar) {
                setTimeout(() => {
                    orangeBar.style.transform = 'scaleY(1)';
                    orangeBar.style.transformOrigin = 'bottom';
                }, 300);
            }
            if (yellowBar) {
                setTimeout(() => {
                    yellowBar.style.transform = 'scaleY(1)';
                    yellowBar.style.transformOrigin = 'bottom';
                }, 500);
            }
            if (greenBar) {
                setTimeout(() => {
                    greenBar.style.transform = 'scaleY(1)';
                    greenBar.style.transformOrigin = 'bottom';
                }, 700);
            }
        }
    });
}, { threshold: 0.5 });

const chartContainer = document.querySelector('.chart-container');
if (chartContainer) {
    chartBars.forEach(bar => {
        bar.style.transform = 'scaleY(0)';
        bar.style.transition = 'transform 0.6s ease';
    });
    chartObserver.observe(chartContainer);
}


// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        const rate = scrolled * -0.5;
        heroVisual.style.transform = `translateY(${rate}px)`;
    }
});
// Hover effects for service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});


// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu on escape
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Add focus styles for accessibility
document.querySelectorAll('a, button, input, textarea').forEach(element => {
    element.addEventListener('focus', () => {
        element.style.outline = '2px solid var(--primary-color)';
        element.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', () => {
        element.style.outline = 'none';
    });
});
