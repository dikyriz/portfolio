/* Main interactions — Brittany Chiang-inspired effects, written from scratch */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    /* ---------- 1. Cursor spotlight glow ---------- */
    var glow = document.querySelector('.cursor-glow');
    if (glow && finePointer && !reduceMotion) {
        var x = window.innerWidth / 2, y = window.innerHeight / 2;
        var tx = x, ty = y, raf = null;
        var paint = function () {
            glow.style.background =
                'radial-gradient(600px circle at ' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px, ' +
                'rgba(29, 78, 216, 0.15), transparent 80%)';
        };
        var tick = function () {
            x += (tx - x) * 0.12;
            y += (ty - y) * 0.12;
            paint();
            if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) {
                raf = requestAnimationFrame(tick);
            } else {
                raf = null; // rest until the mouse moves again
            }
        };
        paint();
        window.addEventListener('mousemove', function (e) {
            tx = e.clientX;
            ty = e.clientY;
            if (!raf) raf = requestAnimationFrame(tick);
        }, { passive: true });
    } else if (glow) {
        glow.style.display = 'none';
    }

    /* ---------- 2. Scroll reveal ---------- */
    var revealEls = document.querySelectorAll(
        '.section-heading, .featured-card, .archive-card, .about-text, .about-grid, ' +
        '.contact .overline, .contact h2, .contact p, .contact .btn, .archive-intro'
    );
    if (reduceMotion || !('IntersectionObserver' in window)) {
        return; // leave everything visible
    }
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    /* ---------- 3. Navbar: shadow on scroll, hide on scroll down ---------- */
    var header = document.querySelector('header');
    var lastY = window.scrollY;
    var ticking = false;
    function onScroll() {
        var y = window.scrollY;
        if (header) {
            header.classList.toggle('scrolled', y > 40);
            if (y > lastY && y > 400) {
                header.classList.add('nav-hidden');
            } else {
                header.classList.remove('nav-hidden');
            }
        }
        // ---------- 4. Scrollspy ----------
        var ids = ['about', 'projects', 'contact'];
        var current = null;
        ids.forEach(function (id) {
            var sec = document.getElementById(id);
            if (sec && sec.getBoundingClientRect().top <= 120) current = id;
        });
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            var href = a.getAttribute('href') || '';
            a.classList.toggle('active', current !== null && href.endsWith('#' + current));
        });
        lastY = y;
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
})();
