/* ==========================================================================
   HiPapa Interactive 3D WebGL Background & Micro-Interactions Script
   ========================================================================== */

function safeInit(fn) {
    try {
        fn();
    } catch (err) {
        console.error("Initialization error in " + fn.name + ":", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    safeInit(initEnquiryModal);
    safeInit(init3DBackground);
    safeInit(initNavbarScroll);
    safeInit(init3DCardParallax);
    safeInit(initFAQAccordion);
    safeInit(initMobileMenu);
    safeInit(initCompareAccordion);
});

if (document.readyState !== 'loading') {
    safeInit(initEnquiryModal);
    safeInit(initMobileMenu);
}

/* --------------------------------------------------------------------------
   1. Three.js Interactive 3D WebGL Particle Grid Scene
   -------------------------------------------------------------------------- */
function init3DBackground() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle Cloud Geometry
    const particlesCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorBlue = new THREE.Color(0x046bd2);
    const colorCyan = new THREE.Color(0x00d2ff);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 80;
        positions[i + 1] = (Math.random() - 0.5) * 80;
        positions[i + 2] = (Math.random() - 0.5) * 60;

        const mixedColor = Math.random() > 0.5 ? colorBlue : colorCyan;
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Mouse Parallax Interaction (Ultra-Smooth & Subtle)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.005;
        mouseY = (event.clientY - windowHalfY) * 0.005;
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Ultra smooth lerp easing
        targetX += (mouseX - targetX) * 0.015;
        targetY += (mouseY - targetY) * 0.015;

        // Very slow, ambient rotation
        particleSystem.rotation.y += 0.0003;
        particleSystem.rotation.x = targetY * 0.003;
        particleSystem.rotation.y += targetX * 0.003;

        renderer.render(scene, camera);
    }

    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* --------------------------------------------------------------------------
   2. Navbar Scroll Effects
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
    const navbar = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* --------------------------------------------------------------------------
   2b. Mobile Navigation Menu Toggle Logic
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.getElementById('main-nav');

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        toggleBtn.classList.toggle('active');
        
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#main-nav') && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            toggleBtn.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            toggleBtn.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });
}

/* --------------------------------------------------------------------------
   3. 3D Card Interactive Tilt & Parallax Effect
   -------------------------------------------------------------------------- */
function init3DCardParallax() {
    const cards = document.querySelectorAll('[data-tilt], #hero-3d-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Subtle & elegant 3D tilt max 4deg
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

/* --------------------------------------------------------------------------
   4. FAQ Accordion Logic
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4b. Compare Our Web Hosting Plans Collapsible Accordion
   -------------------------------------------------------------------------- */
function initCompareAccordion() {
    const compareItems = document.querySelectorAll('.compare-accordion-item');
    compareItems.forEach(item => {
        const header = item.querySelector('.compare-accordion-header');
        if (!header) return;
        header.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = item.classList.contains('active');
            
            // Toggle clicked item
            if (isActive) {
                item.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   5. Enquiry Popup Modal Form Logic
   -------------------------------------------------------------------------- */
function initEnquiryModal() {
    // 1. Inject Modal HTML if not already present
    if (!document.getElementById('enquiry-modal')) {
        const modalHTML = `
        <div id="enquiry-modal" class="modal-overlay" aria-hidden="true">
            <div class="modal-container">
                <button type="button" class="modal-close" id="modal-close-btn" onclick="event.stopPropagation(); if(window.closeEnquiryModal) window.closeEnquiryModal();" aria-label="Close modal">&times;</button>
                <div class="modal-header" id="modal-header-content">
                    <div class="modal-badge"><i class="fa-solid fa-paper-plane"></i> Quick Enquiry</div>
                    <h2 class="modal-title">Get Started with <span class="gradient-text">HiPapa</span></h2>
                    <p class="modal-subtitle">Fill out your details below and our technical experts will assist you instantly.</p>
                </div>
                <div class="modal-body">
                    <form id="enquiry-form" class="modal-form">
                        <div class="form-group">
                            <input type="text" id="enquiry-name" name="name" class="form-input" placeholder="Name*" required>
                        </div>
                        <div class="form-group">
                            <input type="email" id="enquiry-email" name="email" class="form-input" placeholder="Your email*" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" id="enquiry-phone" name="phone" class="form-input" placeholder="Phone Number*" required>
                        </div>
                        <div class="form-group">
                            <select id="enquiry-service" name="service" class="form-select" required>
                                <option value="" disabled selected>Select Service*</option>
                                <option value="WordPress Hosting">WordPress Hosting</option>
                                <option value="Shared Hosting">Shared Hosting</option>
                                <option value="VPS Hosting">VPS Hosting</option>
                                <option value="Dedicated Servers">Dedicated Servers</option>
                                <option value="Domain Registration">Domain Registration</option>
                                <option value="Email Solutions">Email Solutions</option>
                                <option value="Bulk SMS">Bulk SMS</option>
                                <option value="Custom Solution">Other / Custom Requirement</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="text" id="enquiry-domain" name="domain" class="form-input" placeholder="Your Domain (if you have any)">
                        </div>
                        <div class="form-group">
                            <select id="enquiry-contact-method" name="contact_method" class="form-select">
                                <option value="" disabled selected>Preferred Contact Method</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Phone Call">Phone Call</option>
                                <option value="Email">Email</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <textarea id="enquiry-message" name="message" class="form-textarea" rows="3" placeholder="Describe your requirement or message"></textarea>
                        </div>
                        <button type="submit" class="modal-submit-btn">
                            <span>Send Enquiry</span> <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                    <div id="enquiry-success-msg" class="modal-success-msg" style="display: none;">
                        <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
                        <h3>Enquiry Sent Successfully!</h3>
                        <p>Thank you for reaching out. Our team will contact you shortly.</p>
                        <button type="button" class="btn btn-primary" id="modal-success-close">Done</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('enquiry-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const enquiryForm = document.getElementById('enquiry-form');
    const serviceSelect = document.getElementById('enquiry-service');
    const headerContent = document.getElementById('modal-header-content');
    const successMsg = document.getElementById('enquiry-success-msg');
    const successCloseBtn = document.getElementById('modal-success-close');

    // Function to open modal
    function openModal(serviceName = '') {
        // NEVER open enquiry modal on contact page
        if (window.location.pathname.toLowerCase().includes('contact')) {
            return;
        }

        // Reset form view
        enquiryForm.reset();
        enquiryForm.style.display = 'flex';
        headerContent.style.display = 'block';
        successMsg.style.display = 'none';

        // Detect service to pre-select
        if (serviceName) {
            setServiceOption(serviceName);
        } else {
            // Detect from page URL
            const pagePath = window.location.pathname.toLowerCase();
            if (pagePath.includes('wordpress')) setServiceOption('WordPress Hosting');
            else if (pagePath.includes('shared')) setServiceOption('Shared Hosting');
            else if (pagePath.includes('vps')) setServiceOption('VPS Hosting');
            else if (pagePath.includes('dedicated')) setServiceOption('Dedicated Servers');
            else if (pagePath.includes('domain')) setServiceOption('Domain Registration');
            else if (pagePath.includes('email')) setServiceOption('Email Solutions');
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    // Expose openModal & closeModal globally
    window.openEnquiryModal = openModal;
    window.closeEnquiryModal = closeModal;

    function setServiceOption(serviceName) {
        if (!serviceSelect) return;
        const options = Array.from(serviceSelect.options);
        const matchedOption = options.find(opt => 
            opt.value.toLowerCase().includes(serviceName.toLowerCase()) || 
            serviceName.toLowerCase().includes(opt.value.toLowerCase())
        );
        if (matchedOption) {
            serviceSelect.value = matchedOption.value;
        } else if (serviceName) {
            serviceSelect.value = 'Custom Solution';
        }
    }

    // Function to close modal
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    // Intercept all plan / buy / order / view plan buttons & external/placeholder links
    document.body.addEventListener('click', (e) => {
        if (window.location.pathname.toLowerCase().includes('contact')) return;

        const btn = e.target.closest('a, button, .btn');
        if (!btn) return;

        // Skip clicks inside modal, close button, compare accordion, mobile toggle, FAQ questions, or contact form
        if (
            btn.closest('#enquiry-modal') || 
            btn.classList.contains('modal-close') || 
            btn.id === 'modal-close-btn' ||
            btn.classList.contains('compare-accordion-header') ||
            btn.closest('.compare-accordion-header') ||
            btn.classList.contains('faq-question') ||
            btn.closest('.faq-question') ||
            btn.classList.contains('mobile-toggle') ||
            btn.id === 'mobile-toggle' ||
            btn.closest('#contact-form') ||
            btn.closest('.contact-form')
        ) {
            return;
        }

        const href = (btn.getAttribute('href') || '').trim();

        // Skip valid internal/external navigation links (HTML pages, mailto, whatsapp, pdf)
        if ((href.endsWith('.html') && href !== '#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me') || href.endsWith('.pdf')) {
            return;
        }

        const btnText = (btn.innerText || '').toLowerCase();
        const parentCard = btn.closest('.service-card-3d, .pricing-card, .plan-card, .service-card, .card-footer-action, .addon-card, .pricing-box');

        const isActionBtn = 
            btn.classList.contains('btn') ||
            btn.classList.contains('open-enquiry-modal') ||
            btn.hasAttribute('data-service') ||
            parentCard !== null ||
            href === '#' ||
            href === '' ||
            btnText.includes('plan') ||
            btnText.includes('select') ||
            btnText.includes('choose') ||
            btnText.includes('order') ||
            btnText.includes('get started') ||
            btnText.includes('build server') ||
            btnText.includes('buy') ||
            btnText.includes('client area') ||
            btnText.includes('enquiry');

        if (isActionBtn) {
            e.preventDefault();
            e.stopPropagation();

            // Try getting specified service name
            let service = btn.getAttribute('data-service');
            if (!service && parentCard) {
                const cardTitle = parentCard.querySelector('h3, h4, .service-title, .plan-title');
                if (cardTitle) service = cardTitle.innerText.trim();
            }

            openModal(service || '');
        }
    });

    // Close handlers
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Intercept domain search forms
    document.querySelectorAll('.domain-search-box').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('.domain-input');
            const domainVal = input ? input.value.trim() : '';
            openModal('Domain Registration');
            const domainField = document.getElementById('enquiry-domain');
            if (domainField && domainVal) {
                domainField.value = domainVal;
            }
        });
    });

    // Form submission (Database Save)
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = enquiryForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Saving...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            }

            const formData = {
                name: document.getElementById('enquiry-name')?.value || '',
                email: document.getElementById('enquiry-email')?.value || '',
                phone: document.getElementById('enquiry-phone')?.value || '',
                service: document.getElementById('enquiry-service')?.value || 'General Enquiry',
                domain: document.getElementById('enquiry-domain')?.value || '',
                contact_method: document.getElementById('enquiry-contact-method')?.value || 'Email',
                message: document.getElementById('enquiry-message')?.value || ''
            };

            try {
                const response = await fetch('/api/enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const resData = await response.json();
                console.log('[DB SAVE SUCCESS]', resData);
            } catch (err) {
                console.error('[DB SAVE ERROR]', err);
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Send Enquiry</span> <i class="fa-solid fa-paper-plane"></i>';
            }

            enquiryForm.style.display = 'none';
            if (headerContent) headerContent.style.display = 'none';
            if (successMsg) successMsg.style.display = 'block';
        });
    }

    // Intercept Contact Page Form
    const contactForm = document.querySelector('form[action="#"], form:not(#enquiry-form):not(.domain-search-box)');
    if (contactForm && window.location.pathname.includes('contact')) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            let name = '', email = '', phone = '', message = '';
            
            inputs.forEach(input => {
                const type = input.type;
                const ph = (input.placeholder || '').toLowerCase();
                if (ph.includes('first') || ph.includes('last') || ph.includes('name')) {
                    name += ' ' + input.value;
                } else if (type === 'email' || ph.includes('email')) {
                    email = input.value;
                } else if (type === 'tel' || ph.includes('phone')) {
                    phone = input.value;
                } else if (input.tagName === 'TEXTAREA' || ph.includes('inquiry') || ph.includes('message')) {
                    message = input.value;
                }
            });

            try {
                await fetch('/api/enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim() || 'Contact Form Lead',
                        email: email.trim(),
                        phone: phone.trim(),
                        service: 'Contact Us Form',
                        message: message.trim()
                    })
                });
                alert('Thank you! Your message has been saved into our database. Our team will contact you shortly.');
                contactForm.reset();
            } catch (err) {
                console.error('Contact form save error:', err);
            }
        });
    }
}

