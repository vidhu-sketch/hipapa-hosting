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
    safeInit(initWhatsAppWidget);
});

if (document.readyState !== 'loading') {
    safeInit(initEnquiryModal);
    safeInit(initMobileMenu);
    safeInit(initWhatsAppWidget);
}

/* --------------------------------------------------------------------------
   WhatsApp Floating Widget
   -------------------------------------------------------------------------- */
function initWhatsAppWidget() {
    if (document.getElementById('whatsapp-widget')) return;

    const phone = '919972788225';
    const message = encodeURIComponent('Hello HiPapa! I need help with hosting.');
    const waUrl = `https://wa.me/${phone}?text=${message}`;

    const style = document.createElement('style');
    style.textContent = `
        #whatsapp-widget {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
        }
        #whatsapp-tooltip {
            background: #ffffff;
            color: #111827;
            font-size: 0.82rem;
            font-weight: 600;
            padding: 8px 14px;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.18);
            white-space: nowrap;
            opacity: 0;
            transform: translateY(6px);
            transition: opacity 0.25s, transform 0.25s;
            pointer-events: none;
        }
        #whatsapp-widget:hover #whatsapp-tooltip {
            opacity: 1;
            transform: translateY(0);
        }
        #whatsapp-btn {
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: #25d366;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 24px rgba(37,211,102,0.45);
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
        }
        #whatsapp-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 32px rgba(37,211,102,0.6);
        }
        #whatsapp-btn svg {
            width: 32px;
            height: 32px;
            fill: #ffffff;
        }
        #whatsapp-pulse {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            border-radius: 50%;
            background: rgba(37,211,102,0.4);
            animation: waPulse 2s ease-out infinite;
        }
        @keyframes waPulse {
            0%   { transform: scale(1); opacity: 0.7; }
            70%  { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(1.6); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = 'whatsapp-widget';
    widget.innerHTML = `
        <div id="whatsapp-tooltip">💬 Chat with us on WhatsApp</div>
        <a id="whatsapp-btn" href="${waUrl}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
            <div id="whatsapp-pulse"></div>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 .8C7.6.8.8 7.6.8 16c0 2.7.7 5.2 1.9 7.5L.8 31.2l7.9-2c2.2 1.1 4.7 1.7 7.3 1.7 8.4 0 15.2-6.8 15.2-15.2S24.4.8 16 .8zm7.8 21.5c-.3.9-1.8 1.7-2.5 1.8-.6.1-1.4.1-2.2-.1-.5-.1-1.2-.4-2-.7-3.5-1.5-5.8-5-6-5.3-.2-.3-1.5-2-1.5-3.8s.9-2.7 1.3-3.1c.3-.4.7-.5.9-.5h.7c.2 0 .5 0 .7.5.3.6 1 2.3 1.1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.6.6c-.2.2-.4.4-.2.8.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1l.9-1c.2-.3.5-.3.8-.2l2.5 1.2c.3.1.5.2.5.4.1.3.1 1.1-.2 2z"/>
            </svg>
        </a>
    `;
    document.body.appendChild(widget);
}

/* --------------------------------------------------------------------------
   1. Three.js Interactive 3D WebGL Particle Grid Scene
   -------------------------------------------------------------------------- */
function init3DBackground() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

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

    const material = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

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

    function animate() {
        requestAnimationFrame(animate);
        targetX += (mouseX - targetX) * 0.015;
        targetY += (mouseY - targetY) * 0.015;
        particleSystem.rotation.y += 0.0003;
        particleSystem.rotation.x = targetY * 0.003;
        particleSystem.rotation.y += targetX * 0.003;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initNavbarScroll() {
    const navbar = document.getElementById('main-nav');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        toggleBtn.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            if (navMenu.classList.contains('active')) icon.className = 'fa-solid fa-xmark';
            else icon.className = 'fa-solid fa-bars';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#main-nav') && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            toggleBtn.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        }
    });
}

function init3DCardParallax() {
    const cards = document.querySelectorAll('[data-tilt], #hero-3d-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

function initCompareAccordion() {
    const compareItems = document.querySelectorAll('.compare-accordion-item');
    compareItems.forEach(item => {
        const header = item.querySelector('.compare-accordion-header');
        if (!header) return;
        header.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = item.classList.contains('active');
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
   5. Hostinger-Style Cart & Checkout Modal Logic
   -------------------------------------------------------------------------- */
function initEnquiryModal() {
    if (!document.getElementById('enquiry-modal')) {
        const modalHTML = `
        <div id="enquiry-modal" class="modal-overlay" aria-hidden="true" style="display: none !important;">
            <div class="cart-modal-box">

                <!-- Header -->
                <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                        <i class="fa-solid fa-cart-shopping" style="color: #00d2ff;"></i> Your Cart
                    </h2>
                    <div style="display: flex; align-items: center; gap: 10px; margin-left: auto;">
                        <div style="background: rgba(0, 210, 255, 0.1); border: 1px solid rgba(0, 210, 255, 0.3); color: #00d2ff; padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; margin-right: 46px;">
                            <i class="fa-solid fa-bolt"></i> Express Checkout
                        </div>
                        <button type="button" class="modal-close" id="modal-close-btn" onclick="event.stopPropagation(); if(window.closeEnquiryModal) window.closeEnquiryModal();" aria-label="Close modal" style="background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; line-height: 1;">&times;</button>
                    </div>
                </div>

                <div id="cart-content-view">
                    <form id="enquiry-form" class="cart-layout-grid">
                        
                        <!-- LEFT COLUMN: Plan Details & Customer Info -->
                        <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
                            
                            <!-- 1. Plan & Period Box -->
                            <div style="background: #0d1424; border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 16px; padding: 20px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(0, 210, 255, 0.15); display: flex; align-items: center; justify-content: center; color: #00d2ff; font-size: 1.3rem;">
                                            <i class="fa-solid fa-server"></i>
                                        </div>
                                        <div>
                                            <h3 id="selected-plan-name" style="font-size: 1.1rem; font-weight: 800; color: #ffffff; margin: 0;">Shared Hosting - Elite Plan</h3>
                                            <span style="font-size: 0.78rem; color: #00d2ff; font-weight: 600;">High-Performance NVMe Hosting</span>
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <span style="background: rgba(0, 210, 255, 0.2); color: #00d2ff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: block; margin-bottom: 2px;">Save 70%</span>
                                        <div style="color: #00d2ff; font-weight: 800; font-size: 1.15rem;">₹199<span style="font-size: 0.8rem; color: #94a3b8;">/mo</span></div>
                                    </div>
                                </div>

                                <div style="margin-bottom: 14px;">
                                    <label style="display: block; color: #94a3b8; font-size: 0.82rem; margin-bottom: 6px; font-weight: 600;">Billing Period</label>
                                    <select id="cart-period" class="form-select" style="width: 100%; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
                                        <option value="48" selected style="background: #0d1424; color: #ffffff;">48 Months (Best Value - ₹199/mo)</option>
                                        <option value="24" style="background: #0d1424; color: #ffffff;">24 Months (₹249/mo)</option>
                                        <option value="12" style="background: #0d1424; color: #ffffff;">12 Months (₹299/mo)</option>
                                        <option value="1" style="background: #0d1424; color: #ffffff;">1 Month (₹699/mo)</option>
                                    </select>
                                </div>

                            </div>

                            <!-- 2. Secure Your Domain Box -->
                            <div style="background: #0d1424; border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 16px; padding: 18px;">
                                <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0 0 4px 0; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-globe" style="color: #00d2ff;"></i> Secure Your Domain
                                </h4>
                                <p style="font-size: 0.8rem; color: #94a3b8; margin: 0 0 10px 0;">Choose from .com, .net, .org, .in, .shop free for 1 year.</p>
                                <input type="text" id="enquiry-domain" name="domain" placeholder="Enter desired domain (e.g. mybrand.com)" style="width: 100%; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 0.88rem;">
                            </div>

                            <!-- 3. Customer Info Box -->
                            <div style="background: #0d1424; border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 16px; padding: 18px;">
                                <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0 0 14px 0; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-user" style="color: #00d2ff;"></i> Customer Details
                                </h4>
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    <div>
                                        <label style="display: block; color: #94a3b8; font-size: 0.78rem; margin-bottom: 4px; font-weight: 600;">Full Name *</label>
                                        <input type="text" id="enquiry-name" name="name" required placeholder="Enter full name" style="width: 100%; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 0.88rem;">
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                        <div>
                                            <label style="display: block; color: #94a3b8; font-size: 0.78rem; margin-bottom: 4px; font-weight: 600;">Email Address *</label>
                                            <input type="email" id="enquiry-email" name="email" required placeholder="name@domain.com" style="width: 100%; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 0.88rem;">
                                        </div>
                                        <div>
                                            <label style="display: block; color: #94a3b8; font-size: 0.78rem; margin-bottom: 4px; font-weight: 600;">Phone Number *</label>
                                            <input type="tel" id="enquiry-phone" name="phone" required placeholder="Phone number" style="width: 100%; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 0.88rem;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT COLUMN: Order Summary Box -->
                        <div style="background: #0d1424; border: 1.5px solid #00d2ff; border-radius: 20px; padding: 22px; width: 100%; box-shadow: 0 10px 30px rgba(0, 210, 255, 0.15);">
                            <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; margin: 0 0 14px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Order Summary</h3>

                            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; margin-bottom: 14px;">
                                <div style="display: flex; justify-content: space-between; color: #ffffff;">
                                    <span id="summary-period-text">48-month period</span>
                                    <span><s style="color: #64748b;">₹33,552</s> <strong style="color: #00d2ff;">₹9,552</strong></span>
                                </div>

                                <div style="display: flex; justify-content: space-between; color: #94a3b8; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
                                    <span>GST / Taxes (18%)</span>
                                    <span>₹1,719.36</span>
                                </div>
                            </div>

                            <div style="border-top: 1px solid rgba(255,255,255,0.15); padding-top: 14px; margin-bottom: 18px;">
                                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                    <span style="font-size: 1.05rem; font-weight: 700; color: #ffffff;">Total</span>
                                    <div style="text-align: right;">
                                        <s style="font-size: 0.8rem; color: #64748b; display: block;">₹46,662.36</s>
                                        <span style="font-size: 1.5rem; font-weight: 800; color: #00d2ff;">₹11,271.36</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Razorpay Payment Option -->
                            <div style="background: rgba(0, 210, 255, 0.08); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; color: #ffffff; font-weight: 600; font-size: 0.85rem; margin: 0;">
                                    <span style="display: flex; align-items: center; gap: 8px;">
                                        <input type="radio" name="payment_method" value="Razorpay" checked style="accent-color: #00d2ff; width: 16px; height: 16px;">
                                        <i class="fa-solid fa-credit-card" style="color: #00d2ff;"></i> Razorpay (UPI/Cards)
                                    </span>
                                    <span style="background: #00d2ff; color: #070913; font-weight: 800; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;">INSTANT</span>
                                </label>
                            </div>

                            <button type="submit" class="modal-submit-btn" style="width: 100%; background: linear-gradient(135deg, #046bd2 0%, #00d2ff 100%); font-size: 1.05rem; font-weight: 800; border-radius: 12px; padding: 14px; cursor: pointer; border: none; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 25px rgba(0, 210, 255, 0.3);">
                                <span>Continue to Razorpay</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>

                            <div style="text-align: center; margin-top: 12px; color: #94a3b8; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i class="fa-solid fa-shield-halved" style="color: #00d2ff;"></i> 30-day money-back guarantee
                            </div>
                        </div>
                    </form>
                </div>

                <div id="enquiry-success-msg" class="modal-success-msg" style="display: none; text-align: center; padding: 30px 16px;">
                    <div class="success-icon" style="font-size: 3rem; color: #00d2ff; margin-bottom: 14px;"><i class="fa-solid fa-circle-check"></i></div>
                    <h3 style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-bottom: 8px;">Order & Payment Placed Successfully!</h3>
                    <p style="color: #00d2ff; font-weight: 700; margin-bottom: 6px;">Transaction Verified via Razorpay</p>
                    <p style="color: #94a3b8; font-size: 1rem; margin-bottom: 24px;">Thank you for buying your plan with HiPapa! Your hosting account activation details have been sent to your email.</p>
                    <button type="button" class="btn btn-primary" id="modal-success-close" style="width: 100%; max-width: 300px; border-radius: 10px; padding: 14px; background: #00d2ff; color: #070913; font-weight: 800; border: none;">Done</button>
                </div>

            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('enquiry-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const enquiryForm = document.getElementById('enquiry-form');
    const successMsg = document.getElementById('enquiry-success-msg');
    const successCloseBtn = document.getElementById('modal-success-close');
    const cartView = document.getElementById('cart-content-view');

    function openModal(serviceName = '') {
        if (window.location.pathname.toLowerCase().includes('contact')) return;

        if (enquiryForm) enquiryForm.reset();
        if (cartView) cartView.style.display = 'block';
        if (successMsg) successMsg.style.display = 'none';

        const planDisplay = document.getElementById('selected-plan-name');
        const summaryPlanDisplay = document.getElementById('summary-period-text');
        if (planDisplay) {
            let displayTitle = (serviceName || '').trim();
            if (!displayTitle) {
                const pagePath = window.location.pathname.toLowerCase();
                if (pagePath.includes('wordpress')) displayTitle = 'WordPress Hosting - Rise Plan';
                else if (pagePath.includes('shared')) displayTitle = 'Shared Hosting - Rise (Managed) Plan';
                else if (pagePath.includes('vps')) displayTitle = 'VPS Hosting - Rise Plan';
                else if (pagePath.includes('dedicated')) displayTitle = 'Dedicated Server - Rise Plan';
                else if (pagePath.includes('domain')) displayTitle = 'Domain Registration Plan';
                else if (pagePath.includes('email')) displayTitle = 'Email Solution Plan';
                else displayTitle = 'HiPapa Hosting Plan';
            }
            if (displayTitle && !displayTitle.toLowerCase().includes('plan')) {
                displayTitle += ' Plan';
            }
            planDisplay.innerText = displayTitle;
            if (summaryPlanDisplay) {
                summaryPlanDisplay.innerText = displayTitle + ' (48 Months)';
            }
        }

        if (modal) {
            modal.style.setProperty('display', 'flex', 'important');
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.setProperty('display', 'none', 'important');
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    window.openEnquiryModal = openModal;
    window.closeEnquiryModal = closeModal;

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = (document.getElementById('enquiry-name')?.value || '').trim();
            const email = (document.getElementById('enquiry-email')?.value || '').trim();
            const phone = (document.getElementById('enquiry-phone')?.value || '').trim();
            if (!name || !email || !phone) {
                alert('Please fill in your Name, Email and Phone Number.');
                return;
            }
            openRazorpayModal();
        });
    }

    // ---- Razorpay Payment Modal ----
    function injectRazorpayModal() {
        if (document.getElementById('rzp-modal')) return;
        const planName = () => document.getElementById('selected-plan-name')?.innerText || 'HiPapa Plan';
        const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('upi://pay?pa=hipapa@razorpay&pn=HiPapa+Hosting&am=249&cu=INR&tn=HiPapa+Hosting+Plan')}`;

        const rzpHTML = `
        <div id="rzp-modal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:99999999; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;">
            <div style="display:flex; max-width:860px; width:100%; border-radius:16px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,0.9); position:relative; max-height:92vh;">

                <!-- LEFT PANEL: Blue Razorpay branding -->
                <div style="width:280px; min-width:260px; background:linear-gradient(160deg, #1a3a6e 0%, #2a52a0 50%, #1a3a8a 100%); padding:28px 24px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
                    <!-- decorative circles -->
                    <div style="position:absolute; bottom:-40px; left:-40px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05);"></div>
                    <div style="position:absolute; bottom:-10px; right:-60px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,0.05);"></div>

                    <div>
                        <!-- Merchant badge -->
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px;">
                            <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:1.1rem;">H</div>
                            <span style="color:#ffffff; font-weight:800; font-size:1rem;">HiPapa Hosting</span>
                        </div>

                        <!-- Price summary -->
                        <div style="background:rgba(255,255,255,0.12); border-radius:12px; padding:16px 18px; margin-bottom:16px;">
                            <div style="color:rgba(255,255,255,0.7); font-size:0.82rem; margin-bottom:4px;">Price Summary</div>
                            <div style="color:#ffffff; font-weight:800; font-size:1.5rem;">₹11,271.36</div>
                        </div>

                        <!-- Plan name -->
                        <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; margin-bottom:12px;">
                            <div style="color:rgba(255,255,255,0.7); font-size:0.75rem; margin-bottom:2px;">Selected Plan</div>
                            <div id="rzp-plan-display" style="color:#ffffff; font-weight:700; font-size:0.88rem;">Shared Hosting - Lite Plan</div>
                        </div>

                        <!-- Phone number -->
                        <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.1); border-radius:8px; padding:8px 14px;">
                            <i class="fa-solid fa-user" style="color:rgba(255,255,255,0.7); font-size:0.85rem;"></i>
                            <span id="rzp-user-phone" style="color:#ffffff; font-size:0.88rem; font-weight:600;">+91 xxxxxxxxxx</span>
                        </div>
                    </div>

                    <!-- Bottom: Razorpay branding -->
                    <div>
                        <!-- Illustration -->
                        <div style="text-align:center; margin-bottom:16px; font-size:3rem; opacity:0.5;">
                            <i class="fa-solid fa-building-columns" style="color:#ffffff;"></i>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-shield-halved" style="color:rgba(255,255,255,0.7); font-size:0.85rem;"></i>
                            <span style="color:rgba(255,255,255,0.7); font-size:0.78rem;">Secured by</span>
                            <span style="color:#ffffff; font-weight:800; font-size:0.88rem; font-style:italic;">Razorpay</span>
                        </div>
                    </div>
                </div>

                <!-- RIGHT PANEL: Payment Options -->
                <div style="flex:1; background:#ffffff; display:flex; overflow:hidden; max-height:92vh;">
                    
                    <!-- Payment method tabs -->
                    <div style="width:170px; background:#f5f6fa; border-right:1px solid #e5e7eb; padding:16px 0; flex-shrink:0;">
                        <div style="padding:12px 16px; border-bottom:1px solid #e5e7eb; margin-bottom:8px;">
                            <div style="font-size:0.75rem; color:#6b7280; font-weight:600; text-transform:uppercase;">Recommended</div>
                        </div>
                        <div class="rzp-tab active-rzp-tab" data-tab="upi" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer; background:#eef2ff; border-left:3px solid #2563eb;">
                            <span style="font-size:0.9rem; font-weight:600; color:#1e40af;">UPI</span>
                            <div style="display:flex; gap:3px;">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/120px-Paytm_Logo_%28standalone%29.svg.png" style="height:14px; object-fit:contain;" alt="Paytm">
                            </div>
                        </div>
                        <div class="rzp-tab" data-tab="cards" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer;">
                            <span style="font-size:0.9rem; font-weight:500; color:#374151;">Cards</span>
                            <div style="display:flex; gap:3px; align-items:center;">
                                <i class="fa-brands fa-cc-visa" style="color:#1a1f71; font-size:1.1rem;"></i>
                                <i class="fa-brands fa-cc-mastercard" style="color:#eb001b; font-size:1.1rem;"></i>
                            </div>
                        </div>
                        <div class="rzp-tab" data-tab="netbanking" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer;">
                            <span style="font-size:0.9rem; font-weight:500; color:#374151;">Netbanking</span>
                            <i class="fa-solid fa-building-columns" style="color:#6b7280; font-size:0.95rem;"></i>
                        </div>
                        <div class="rzp-tab" data-tab="wallet" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer;">
                            <span style="font-size:0.9rem; font-weight:500; color:#374151;">Wallet</span>
                            <i class="fa-solid fa-wallet" style="color:#6b7280; font-size:0.95rem;"></i>
                        </div>
                        <div class="rzp-tab" data-tab="paylater" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; cursor:pointer;">
                            <span style="font-size:0.9rem; font-weight:500; color:#374151;">Pay Later</span>
                            <i class="fa-solid fa-clock" style="color:#6b7280; font-size:0.95rem;"></i>
                        </div>
                    </div>

                    <!-- Payment content area -->
                    <div style="flex:1; padding:20px 24px; overflow-y:auto; position:relative;">
                        <!-- Close button -->
                        <button id="rzp-close-btn" style="position:absolute; top:14px; right:14px; background:none; border:none; cursor:pointer; color:#6b7280; font-size:1.3rem;"><i class="fa-solid fa-xmark"></i></button>

                        <div style="font-weight:700; font-size:1rem; color:#111827; margin-bottom:16px; padding-right:30px;">Payment Options</div>

                        <!-- UPI QR Tab -->
                        <div id="rzp-tab-upi" class="rzp-tab-content" style="display:block;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                                <span style="font-weight:700; color:#111827; font-size:0.95rem;">UPI QR</span>
                                <div style="display:flex; align-items:center; gap:5px; background:#fef3c7; border-radius:6px; padding:3px 8px;">
                                    <i class="fa-solid fa-clock" style="color:#d97706; font-size:0.75rem;"></i>
                                    <span id="rzp-timer" style="color:#d97706; font-size:0.8rem; font-weight:700;">10:00</span>
                                </div>
                            </div>

                            <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px; text-align:center; margin-bottom:16px;">
                                <img src="${upiQrUrl}" alt="UPI QR Code" style="width:160px; height:160px; border-radius:8px; display:block; margin:0 auto 12px;">
                                <div style="font-size:0.78rem; color:#6b7280; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Scan with any app</div>
                                <div style="display:flex; justify-content:center; gap:10px; align-items:center;">
                                    <i class="fa-brands fa-google-pay" style="font-size:1.6rem; color:#4285f4;" title="Google Pay"></i>
                                    <i class="fa-solid fa-mobile-screen-button" style="font-size:1.3rem; color:#5f259f;" title="PhonePe"></i>
                                    <i class="fa-solid fa-building-columns" style="font-size:1.2rem; color:#ff6600;" title="BHIM"></i>
                                    <span style="font-size:0.75rem; background:#008cff; color:#fff; padding:2px 6px; border-radius:4px; font-weight:700;">Pay</span>
                                </div>
                            </div>

                            <div style="margin-bottom:14px;">
                                <label style="display:block; font-size:0.85rem; font-weight:600; color:#374151; margin-bottom:8px;">UPI ID / Number</label>
                                <input type="text" id="rzp-upi-input" placeholder="example@okhdfcbank" style="width:100%; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; font-size:0.9rem; color:#111827; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#d1d5db'">
                            </div>

                            <button id="rzp-verify-pay-btn" style="width:100%; background:#111827; color:#ffffff; font-weight:700; font-size:1rem; padding:14px; border:none; border-radius:8px; cursor:pointer;">Verify and Pay</button>
                        </div>

                        <!-- Cards Tab -->
                        <div id="rzp-tab-cards" class="rzp-tab-content" style="display:none;">
                            <div style="font-weight:700; color:#111827; margin-bottom:16px;">Pay by Card</div>
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <div><label style="font-size:0.82rem; color:#6b7280; font-weight:600;">Card Number</label><input type="text" placeholder="1234 5678 9012 3456" style="width:100%; margin-top:4px; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:8px; font-size:0.9rem;"></div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                    <div><label style="font-size:0.82rem; color:#6b7280; font-weight:600;">Expiry</label><input type="text" placeholder="MM / YY" style="width:100%; margin-top:4px; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:8px; font-size:0.9rem;"></div>
                                    <div><label style="font-size:0.82rem; color:#6b7280; font-weight:600;">CVV</label><input type="password" placeholder="•••" style="width:100%; margin-top:4px; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:8px; font-size:0.9rem;"></div>
                                </div>
                                <button style="width:100%; background:#111827; color:#ffffff; font-weight:700; font-size:1rem; padding:14px; border:none; border-radius:8px; cursor:pointer; margin-top:4px;">Pay ₹11,271.36</button>
                            </div>
                        </div>

                        <!-- Netbanking Tab -->
                        <div id="rzp-tab-netbanking" class="rzp-tab-content" style="display:none;">
                            <div style="font-weight:700; color:#111827; margin-bottom:16px;">Select Your Bank</div>
                            <select style="width:100%; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; font-size:0.9rem; margin-bottom:16px;">
                                <option>State Bank of India</option>
                                <option>HDFC Bank</option>
                                <option>ICICI Bank</option>
                                <option>Axis Bank</option>
                                <option>Kotak Mahindra Bank</option>
                                <option>Punjab National Bank</option>
                            </select>
                            <button style="width:100%; background:#111827; color:#ffffff; font-weight:700; font-size:1rem; padding:14px; border:none; border-radius:8px; cursor:pointer;">Pay via Netbanking</button>
                        </div>

                        <!-- Wallet Tab -->
                        <div id="rzp-tab-wallet" class="rzp-tab-content" style="display:none;">
                            <div style="font-weight:700; color:#111827; margin-bottom:16px;">Select Wallet</div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; cursor:pointer;"><input type="radio" name="wallet"> <span style="font-weight:600;">Paytm Wallet</span></label>
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; cursor:pointer;"><input type="radio" name="wallet"> <span style="font-weight:600;">Mobikwik</span></label>
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; cursor:pointer;"><input type="radio" name="wallet"> <span style="font-weight:600;">Amazon Pay</span></label>
                            </div>
                            <button style="width:100%; background:#111827; color:#ffffff; font-weight:700; font-size:1rem; padding:14px; border:none; border-radius:8px; cursor:pointer; margin-top:14px;">Pay via Wallet</button>
                        </div>

                        <!-- Pay Later Tab -->
                        <div id="rzp-tab-paylater" class="rzp-tab-content" style="display:none;">
                            <div style="font-weight:700; color:#111827; margin-bottom:16px;">Pay Later</div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; cursor:pointer;"><input type="radio" name="paylater"> <span style="font-weight:600;">Simpl</span></label>
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; cursor:pointer;"><input type="radio" name="paylater"> <span style="font-weight:600;">LazyPay</span></label>
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #d1d5db; border-radius:8px; cursor:pointer;"><input type="radio" name="paylater"> <span style="font-weight:600;">ICICI PayLater</span></label>
                            </div>
                            <button style="width:100%; background:#111827; color:#ffffff; font-weight:700; font-size:1rem; padding:14px; border:none; border-radius:8px; cursor:pointer; margin-top:14px;">Proceed</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', rzpHTML);

        // Tab switching
        document.querySelectorAll('.rzp-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.rzp-tab').forEach(t => {
                    t.style.background = '';
                    t.style.borderLeft = '';
                    t.querySelector('span').style.color = '#374151';
                    t.querySelector('span').style.fontWeight = '500';
                });
                tab.style.background = '#eef2ff';
                tab.style.borderLeft = '3px solid #2563eb';
                tab.querySelector('span').style.color = '#1e40af';
                tab.querySelector('span').style.fontWeight = '600';
                document.querySelectorAll('.rzp-tab-content').forEach(c => c.style.display = 'none');
                const tabId = 'rzp-tab-' + tab.getAttribute('data-tab');
                const content = document.getElementById(tabId);
                if (content) content.style.display = 'block';
            });
        });

        // Timer countdown
        let timeLeft = 600;
        const timerEl = document.getElementById('rzp-timer');
        const timerInterval = setInterval(() => {
            timeLeft--;
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            if (timerEl) timerEl.textContent = `${m}:${s}`;
            if (timeLeft <= 0) clearInterval(timerInterval);
        }, 1000);

        // Verify and Pay
        const verifyBtn = document.getElementById('rzp-verify-pay-btn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', async () => {
                verifyBtn.disabled = true;
                verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
                clearInterval(timerInterval);
                const name = (document.getElementById('enquiry-name')?.value || '').trim();
                const email = (document.getElementById('enquiry-email')?.value || '').trim();
                const phone = (document.getElementById('enquiry-phone')?.value || '').trim();
                const domain = (document.getElementById('enquiry-domain')?.value || '').trim();
                const planName = document.getElementById('selected-plan-name')?.innerText || 'HiPapa Plan';
                try {
                    await fetch('/api/enquiry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, phone, domain, service: planName, message: 'Payment via Razorpay UPI' })
                    });
                } catch(err) {}
                setTimeout(() => {
                    closeRzpModal();
                    if (cartView) cartView.style.display = 'none';
                    if (successMsg) successMsg.style.display = 'block';
                }, 1000);
            });
        }

        // Close
        document.getElementById('rzp-close-btn').addEventListener('click', closeRzpModal);
        document.getElementById('rzp-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('rzp-modal')) closeRzpModal();
        });
    }

    function openRazorpayModal() {
        injectRazorpayModal();
        const rzpModal = document.getElementById('rzp-modal');
        const planDisplay = document.getElementById('rzp-plan-display');
        const phoneDisplay = document.getElementById('rzp-user-phone');
        const planName = document.getElementById('selected-plan-name')?.innerText || 'HiPapa Plan';
        const phone = document.getElementById('enquiry-phone')?.value || '';
        if (planDisplay) planDisplay.textContent = planName;
        if (phoneDisplay && phone) phoneDisplay.textContent = '+91 ' + phone.replace(/^(\+91|0)/, '');
        if (rzpModal) {
            rzpModal.style.display = 'flex';
        }
    }

    function closeRzpModal() {
        const rzpModal = document.getElementById('rzp-modal');
        if (rzpModal) rzpModal.style.display = 'none';
    }

    // Intercept all Buy Plan clicks
    document.addEventListener('click', (e) => {
        if (window.location.pathname.toLowerCase().includes('contact')) return;

        const btn = e.target.closest('a, button, .btn, .open-enquiry-modal');
        if (!btn) return;

        if (
            btn.closest('#enquiry-modal') || 
            btn.closest('#rzp-modal') ||
            btn.classList.contains('modal-close') || 
            btn.id === 'modal-close-btn' ||
            btn.id === 'rzp-close-btn' ||
            btn.id === 'rzp-verify-pay-btn' ||
            btn.classList.contains('compare-accordion-header') ||
            btn.closest('.compare-accordion-header') ||
            btn.classList.contains('faq-question') ||
            btn.closest('.faq-question') ||
            btn.classList.contains('mobile-toggle') ||
            btn.id === 'mobile-toggle' ||
            btn.closest('#contact-form') ||
            btn.closest('.contact-form') ||
            btn.type === 'submit'
        ) {
            return;
        }

        const href = (btn.getAttribute('href') || '').trim();
        if ((href.endsWith('.html') && href !== '#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me') || href.endsWith('.pdf')) {
            return;
        }

        const btnText = (btn.innerText || '').toLowerCase();
        const parentCard = btn.closest('.service-card-3d, .pricing-card, .plan-card, .service-card, .card-footer-action, .addon-card, .pricing-box');

        const isActionBtn = 
            btn.classList.contains('open-enquiry-modal') ||
            btn.hasAttribute('data-service') ||
            btn.classList.contains('btn') ||
            parentCard !== null ||
            href === '#' ||
            href === 'javascript:void(0);' ||
            href === 'javascript:void(0)' ||
            href === '' ||
            btnText.includes('buy') ||
            btnText.includes('plan') ||
            btnText.includes('order');

        if (isActionBtn) {
            e.preventDefault();
            e.stopPropagation();

            let service = btn.getAttribute('data-service');
            if (!service && parentCard) {
                const cardTitle = parentCard.querySelector('h3, h4, .service-title, .plan-title');
                let planName = cardTitle ? cardTitle.innerText.trim() : '';
                
                let pageCat = '';
                const pagePath = window.location.pathname.toLowerCase();
                if (pagePath.includes('wordpress')) pageCat = 'WordPress Hosting';
                else if (pagePath.includes('shared')) pageCat = 'Shared Hosting';
                else if (pagePath.includes('vps')) pageCat = 'VPS Hosting';
                else if (pagePath.includes('dedicated')) pageCat = 'Dedicated Server';
                else if (pagePath.includes('domain')) pageCat = 'Domain Registration';
                else if (pagePath.includes('email')) pageCat = 'Email Solution';

                if (pageCat && planName) {
                    service = `${pageCat} - ${planName} Plan`;
                } else if (planName) {
                    service = `${planName} Plan`;
                }
            }

            openModal(service || '');
        }
    });
}
