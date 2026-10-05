// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a:not(#about-nav-btn)').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// About Modal functionality
const aboutNavBtn = document.getElementById('about-nav-btn');
const aboutModal = document.getElementById('about-modal');
const aboutClose = document.getElementById('about-close');
const modalContactBtn = document.getElementById('modal-contact-btn');

if (aboutNavBtn && aboutModal) {
    aboutNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        aboutModal.classList.add('active');
        if (navLinks) navLinks.classList.remove('active');
    });
}

if (aboutClose && aboutModal) {
    aboutClose.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.remove('active');
    });
}

if (modalContactBtn && aboutModal) {
    modalContactBtn.addEventListener('click', (e) => {
        aboutModal.classList.remove('active');
    });
}

if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('active');
        }
    });
}

// Dynamic current year in footer
const yearEl = document.getElementById('current-year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// Lightbox functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

window.openLightbox = function(src) {
    if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }
};

window.closeLightbox = function() {
    if (lightbox) {
        lightbox.classList.remove('active');
    }
};

// Contact form submission handling
const contactForm = document.getElementById('contact-form');
const formMsg = document.getElementById('form-msg');

if (contactForm && formMsg) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameEl = document.getElementById('name');
        const name = nameEl ? nameEl.value.trim() : '';
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (name && email && message) {
            formMsg.textContent = `¡Gracias, ${name}! Tu mensaje ha sido enviado exitosamente.`;
            formMsg.className = 'form-msg success';
            contactForm.reset();

            setTimeout(() => {
                formMsg.className = 'form-msg hidden';
            }, 5000);
        }
    });
}
