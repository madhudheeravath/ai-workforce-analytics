// ============================================
// SheDev Portfolio - JavaScript Functionality
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initTabs();
    initAnimations();
    initCounters();
    initParallax();
    initMobileMenu();
});

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    if (!link.classList.contains('nav-cta')) {
                        link.classList.remove('active');
                    }
                });
                if (navLink && !navLink.classList.contains('nav-cta')) {
                    navLink.classList.add('active');
                }
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

// ============================================
// Scroll Effects & Animations
// ============================================
function initScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Stagger animations for grid items
                const parent = entry.target.parentElement;
                if (parent) {
                    const siblings = parent.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
                    siblings.forEach((sibling, index) => {
                        sibling.style.transitionDelay = `${index * 0.1}s`;
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// Tab Navigation
// ============================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    // Show all cards initially (KPI Overview shows all)
    function filterCards(category) {
        dashboardCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category') || '';
            
            if (category === 'kpis') {
                // KPI Overview shows all cards
                card.classList.remove('hidden');
                card.style.display = '';
            } else if (cardCategories.includes(category)) {
                card.classList.remove('hidden');
                card.style.display = '';
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the tab category and filter cards
            const tabId = button.getAttribute('data-tab');
            filterCards(tabId);
            
            // Re-trigger animations for visible cards
            setTimeout(() => {
                document.querySelectorAll('.dashboard-card:not(.hidden)').forEach(card => {
                    card.classList.remove('visible');
                    setTimeout(() => card.classList.add('visible'), 50);
                });
            }, 100);
        });
    });
}

// ============================================
// Scroll Reveal Animations
// ============================================
function initAnimations() {
    // Add visible class to hero elements immediately
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-in-right').forEach(el => {
            el.classList.add('visible');
        });
    }, 300);

    // Typing effect for hero text (optional)
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        heroTitle.style.opacity = '1';
    }
}

// ============================================
// Counter Animation
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    // Use Intersection Observer to start counter when visible
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// ============================================
// Parallax Effects
// ============================================
function initParallax() {
    const orbs = document.querySelectorAll('.orb');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        orbs.forEach((orb, index) => {
            const speed = 0.1 * (index + 1);
            orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    // Mouse parallax for hero section
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image');

    if (hero && heroImage) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 50;
            const y = (e.clientY - rect.top - rect.height / 2) / 50;
            
            heroImage.style.transform = `translate(${x}px, ${y}px)`;
        });

        hero.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'translate(0, 0)';
        });
    }
}

// ============================================
// Utility Functions
// ============================================

// Debounce function for performance
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
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Image Lazy Loading
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
});

// ============================================
// Smooth Image Loading
// ============================================
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    img.addEventListener('error', function() {
        // Fallback for missing images
        this.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
        this.style.minHeight = '200px';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
    });
});

// ============================================
// Dynamic Year in Footer
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2025', currentYear);
    }
});

// ============================================
// Console Welcome Message
// ============================================
console.log('%c🚀 SheDev AI Workforce Analytics Platform', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cBuilt with ❤️ by an all-women team', 'font-size: 14px; color: #ec4899;');
console.log('%cVisit: https://awap-next-app.onrender.com', 'font-size: 12px; color: #06b6d4;');
