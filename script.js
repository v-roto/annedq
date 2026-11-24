// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

const closeMobileMenu = () => {
    if (navLinks) navLinks.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
};

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Modals (About + Contact): open, close on ×, backdrop click or Escape
const aboutModal = document.getElementById('about-modal');
const contactModal = document.getElementById('contact-modal');

// The contact card lives in the bottom section; the contact modal borrows
// that same card while open (one form, identical in both places). A
// placeholder keeps the section's height so the page doesn't jump.
const contactCard = document.getElementById('contact-card');
const contactCardHome = document.createElement('div');

const borrowContactCard = () => {
    contactCardHome.style.height = `${contactCard.offsetHeight}px`;
    contactCard.before(contactCardHome);
    contactModal.querySelector('.modal-card').appendChild(contactCard);
};

const returnContactCard = () => {
    if (!contactCardHome.isConnected) return;
    contactCardHome.replaceWith(contactCard);
};

const closeModal = (modal) => {
    modal.classList.remove('active');
    if (modal === contactModal) returnContactCard();
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('no-scroll');
};

const openModal = (modal) => {
    document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
    closeMobileMenu();
    if (modal === contactModal) borrowContactCard();
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
};

document.getElementById('about-nav-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(aboutModal);
});

document.querySelectorAll('.contact-open').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(contactModal);
    });
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close')) closeModal(modal);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
    closeLightbox();
});

// Seamless marquees: clone the original set until the track is at least
// one set wider than the screen, then slide by exactly one set's width.
// Items use margin (not gap) so every set has the same width and the
// loop point lands pixel-perfect — no visible jump.
function setupMarquee(track) {
    if (!track.dataset.set) {
        track.dataset.set = track.children.length;
    }
    const setSize = Number(track.dataset.set);
    while (track.children.length > setSize) track.lastElementChild.remove();

    const originals = [...track.children];
    const setWidth = track.scrollWidth;
    if (!setWidth) return;

    const copies = Math.ceil(track.parentElement.clientWidth / setWidth) + 1;
    for (let i = 0; i < copies; i++) {
        originals.forEach(el => {
            const clone = el.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    }
    track.style.setProperty('--marquee-shift', `-${setWidth}px`);
    // Constant speed regardless of how wide the set is
    const speed = Number(track.parentElement.dataset.speed || 60);
    track.style.setProperty('--marquee-duration', `${setWidth / speed}s`);
    track.classList.add('ready');
}

const marqueeTracks = document.querySelectorAll('.marquee-track');
window.addEventListener('load', () => marqueeTracks.forEach(setupMarquee));
let marqueeResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(marqueeResizeTimer);
    marqueeResizeTimer = setTimeout(() => marqueeTracks.forEach(setupMarquee), 200);
});

// Dynamic current year in footer
const yearEl = document.getElementById('current-year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

// Lightbox: shows any artwork at full size; arrows, keyboard and swipes
// move through every artwork on the page in order.
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCount = document.getElementById('lightbox-count');
const artworks = [...document.querySelectorAll('.section-banner[data-full], .art[data-full]')];
let lightboxIndex = 0;

const showArtwork = (i) => {
    lightboxIndex = (i + artworks.length) % artworks.length;
    const art = artworks[lightboxIndex];
    lightboxImg.src = art.dataset.full;
    lightboxImg.alt = art.querySelector('img')?.alt || '';
    lightboxCount.textContent = `${lightboxIndex + 1} / ${artworks.length}`;
    // Warm up the neighbours so the arrows feel instant
    [1, -1].forEach(d => { new Image().src = artworks[(lightboxIndex + d + artworks.length) % artworks.length].dataset.full; });
};

window.openLightbox = function(src) {
    if (!lightbox) return;
    const i = artworks.findIndex(a => a.dataset.full === src);
    showArtwork(i < 0 ? 0 : i);
    lightbox.classList.add('active');
    document.body.classList.add('no-scroll');
};

window.closeLightbox = function() {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('no-scroll');
};

artworks.forEach((art, i) => {
    art.addEventListener('click', () => {
        showArtwork(i);
        lightbox.classList.add('active');
        document.body.classList.add('no-scroll');
    });
});

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox-prev')) showArtwork(lightboxIndex - 1);
        else if (e.target.closest('.lightbox-next')) showArtwork(lightboxIndex + 1);
        else if (e.target !== lightboxImg) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') showArtwork(lightboxIndex - 1);
        if (e.key === 'ArrowRight') showArtwork(lightboxIndex + 1);
    });
    // Swipe left/right on phones
    let startX = null;
    lightbox.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) showArtwork(lightboxIndex + (dx < 0 ? 1 : -1));
        startX = null;
    }, { passive: true });
}

// Sketch reveal: on artworks with data-reveal, a lens follows the mouse —
// or the finger on phones — and shows the sketch underneath. While a finger
// is on one of these images the page does not scroll (touch-action: none).
document.querySelectorAll('.art[data-reveal]').forEach(item => {
    const sketch = new Image();
    sketch.className = 'reveal-img';
    sketch.alt = '';
    sketch.decoding = 'async';
    sketch.setAttribute('aria-hidden', 'true');

    // Only enable once the sketch exists, so a missing file changes nothing
    sketch.onload = () => {
        const ring = document.createElement('span');
        ring.className = 'reveal-ring';
        const hint = document.createElement('span');
        hint.className = 'reveal-hint';
        hint.textContent = window.matchMedia('(hover: none)').matches
            ? 'Touch to see the sketch'
            : 'Hover to see the sketch';
        item.append(sketch, ring, hint);
        item.classList.add('reveal-item');

        const moveTo = (x, y) => {
            const rect = item.getBoundingClientRect();
            item.style.setProperty('--reveal-x', `${x - rect.left}px`);
            item.style.setProperty('--reveal-y', `${y - rect.top}px`);
            // Lens scales with the image; a bit bigger for fingers
            const factor = window.matchMedia('(hover: none)').matches ? 0.3 : 0.22;
            item.style.setProperty('--reveal-size', `${Math.round(Math.max(70, Math.min(rect.width, rect.height) * factor))}px`);
        };
        const show = () => item.classList.add('revealing');
        const hide = () => item.classList.remove('revealing');

        // Mouse
        item.addEventListener('pointerenter', (e) => {
            if (e.pointerType !== 'mouse') return;
            moveTo(e.clientX, e.clientY);
            show();
        });
        item.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'mouse') moveTo(e.clientX, e.clientY);
        });
        item.addEventListener('pointerleave', (e) => {
            if (e.pointerType === 'mouse') hide();
        });

        // Finger
        item.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            moveTo(t.clientX, t.clientY);
            show();
        }, { passive: true });
        item.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const t = e.touches[0];
            moveTo(t.clientX, t.clientY);
        }, { passive: false });
        item.addEventListener('touchend', hide, { passive: true });
        item.addEventListener('touchcancel', hide, { passive: true });
    };
    sketch.src = item.dataset.reveal;
});

// Provisional contact email. It never appears as text in the HTML: it is
// assembled here only when someone uses it, which keeps simple address
// scrapers from picking it up.
const contactAddress = () => [['xd', 'randiu'].reverse().join(''), ['com', 'gmail'].reverse().join('.')].join(String.fromCharCode(64));

const contactForm = document.getElementById('contact-form');
const formMsg = document.getElementById('form-msg');

const showFormMsg = (text, type) => {
    formMsg.textContent = text;
    formMsg.className = `form-msg ${type}`;
};

// Many computers have no email app set up, so a bare mailto: link can do
// nothing at all. Offer Gmail in the browser, the email app, and copying.
const showMailOptions = (subject = '', body = '') => {
    const to = contactAddress();
    const q = (s, b) => `subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&${q(subject, body)}`;
    formMsg.className = 'form-msg success mail-options';
    formMsg.innerHTML = '';
    const intro = document.createElement('p');
    intro.textContent = subject
        ? 'Choose how to send your message:'
        : 'Choose how to write to me:';
    const row = document.createElement('div');
    row.className = 'mail-options__row';
    const link = (label, href, newTab) => {
        const a = document.createElement('a');
        a.className = 'btn btn--small';
        a.textContent = label;
        a.href = href;
        if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
        return a;
    };
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'btn btn--small btn--ghost';
    copy.textContent = 'Copy email address';
    copy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(to);
            copy.textContent = 'Copied!';
        } catch {
            copy.textContent = to;
        }
    });
    row.append(
        link('Gmail', gmail, true),
        link('Outlook', outlook, true),
        link('Email app', `mailto:${to}?${q(subject, body)}`, false),
        copy,
    );
    formMsg.append(intro, row);
};

document.querySelectorAll('[data-mail]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showMailOptions();
        formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});

// Contact form: posts to the Formspree endpoint in data-endpoint when it is
// set. Until then it offers ways to send the filled-in message by email.
if (contactForm && formMsg) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const endpoint = contactForm.dataset.endpoint;
        const f = contactForm.elements;
        const name = f.name.value.trim();

        if (!endpoint) {
            showMailOptions(
                `Portfolio contact from ${name}`,
                `${f.message.value.trim()}

${name} (${f.email.value.trim()})`,
            );
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error(res.status);
            showFormMsg(`Thank you, ${name}! Your message has been sent.`, 'success');
            contactForm.reset();
        } catch {
            showFormMsg('Something went wrong sending your message. Please try again or reach me through Instagram.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
}
