// Main JavaScript file for Kabir Kenth's personal website
// Handles animations, interactions, and dynamic content

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initScrollAnimations();
    initTypewriter();
    initSkillsChart();
    initProjectFilters();
    initContactForm();
    initModalHandlers();
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Typewriter effect for hero name
function initTypewriter() {
    const typedElement = document.getElementById('typed-name');
    if (typedElement) {
        const typed = new Typed('#typed-name', {
            strings: ['Kabir Kenth'],
            typeSpeed: 100,
            startDelay: 500,
            showCursor: false,
            onComplete: function() {
                // Add gradient text animation after typing completes
                typedElement.classList.add('gradient-text');
            }
        });
    }
}

// Skills radar chart initialization
function initSkillsChart() {
    const chartElement = document.getElementById('skillsChart');
    if (chartElement) {
        const chart = echarts.init(chartElement);
        
        const skillsData = [
            { name: 'Python', value: 90 },
            { name: 'JavaScript', value: 85 },
            { name: 'React', value: 80 },
            { name: 'Node.js', value: 85 },
            { name: 'PostgreSQL', value: 75 },
            { name: 'Docker', value: 70 },
            { name: 'Git', value: 90 },
            { name: 'Agile', value: 85 }
        ];
        
        const option = {
            backgroundColor: 'transparent',
            radar: {
                indicator: skillsData.map(skill => ({
                    name: skill.name,
                    max: 100
                })),
                center: ['50%', '50%'],
                radius: '70%',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(193, 120, 23, 0.3)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(193, 120, 23, 0.2)'
                    }
                },
                axisLabel: {
                    color: '#faf9f6',
                    fontSize: 12
                },
                name: {
                    textStyle: {
                        color: '#faf9f6',
                        fontSize: 14
                    }
                }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: skillsData.map(skill => skill.value),
                    name: 'Technical Skills',
                    areaStyle: {
                        color: 'rgba(193, 120, 23, 0.3)'
                    },
                    lineStyle: {
                        color: '#c17817',
                        width: 2
                    },
                    itemStyle: {
                        color: '#c17817'
                    }
                }],
                animationDuration: 2000,
                animationEasing: 'cubicOut'
            }]
        };
        
        chart.setOption(option);
        
        // Responsive chart
        window.addEventListener('resize', function() {
            chart.resize();
        });
    }
}

// Project filtering functionality
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // Animate visible cards
            setTimeout(() => {
                const visibleCards = document.querySelectorAll('.project-card:not(.hidden)');
                anime({
                    targets: visibleCards,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    delay: anime.stagger(100),
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            }, 100);
        });
    });
}

// Contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simulate form submission
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                
                // Reset form
                this.reset();
                
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }
}

// Modal handlers for project details
function initModalHandlers() {
    // Modal functions are global for onclick handlers
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate modal content
            const modalContent = modal.querySelector('.modal-content');
            anime({
                targets: modalContent,
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }
    };
    
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            
            anime({
                targets: modalContent,
                scale: [1, 0.8],
                opacity: [1, 0],
                duration: 200,
                easing: 'easeInQuad',
                complete: function() {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
    };
    
    // Close modal on background click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            const modalId = e.target.id;
            closeModal(modalId);
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

// Smooth scrolling for navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => notification.remove()
            });
        }
    }, 5000);
}

// Parallax effect for hero section
function initParallax() {
    const hero = document.querySelector('.hero-bg');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Initialize parallax on load
window.addEventListener('load', initParallax);

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Initialize counter animation when elements come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
        }
    });
});

// Observe elements with counter class
document.addEventListener('DOMContentLoaded', () => {
    const counterElements = document.querySelectorAll('.counter');
    if (counterElements.length > 0) {
        counterObserver.observe(counterElements[0].parentElement);
    }
});

// Add loading animation
window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    if (loader) {
        anime({
            targets: loader,
            opacity: [1, 0],
            duration: 500,
            easing: 'easeOutQuad',
            complete: () => loader.remove()
        });
    }
    
    // Animate page elements
    anime({
        targets: '.reveal',
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutQuad'
    });
});

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Add click handlers for mobile menu
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
});

// Performance optimization: Lazy load images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
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
if ('IntersectionObserver' in window) {
    initLazyLoading();
}

// Error handling for missing elements
window.addEventListener('error', function(e) {
    console.warn('Non-critical error:', e.message);
    // Prevent breaking the entire application
    e.preventDefault();
});

// Console welcome message
console.log('%c👋 Hello! Welcome to Kabir Kenth\'s personal website!', 'color: #c17817; font-size: 16px; font-weight: bold;');
console.log('%c💡 Check out the code and let me know if you have any questions!', 'color: #8fbc8f; font-size: 14px;');