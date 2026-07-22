// kabirkenth.me — reveal animations, pipeline demo, project filters, nav

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initPipeline();
    initFilters();
    initNavToggle();
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});

// Scroll-triggered reveals
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('on');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Hero pipeline: stages run in sequence, the human-review gate lingers, then loop
function initPipeline() {
    const stages = document.querySelectorAll('#pipeline .stage');
    if (!stages.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stages.forEach(s => s.classList.add('done'));
        return;
    }

    let i = 0;
    function step() {
        if (i >= stages.length) {
            // hold the finished run, then reset
            setTimeout(() => {
                stages.forEach(s => s.classList.remove('done', 'running'));
                i = 0;
                setTimeout(step, 800);
            }, 3200);
            return;
        }
        const stage = stages[i];
        stage.classList.add('running');
        const dwell = stage.classList.contains('gate') ? 2600 : 1300;
        setTimeout(() => {
            stage.classList.remove('running');
            stage.classList.add('done');
            i++;
            step();
        }, dwell);
    }
    step();
}

// Project filters (portfolio page)
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    if (!buttons.length) return;
    const cases = document.querySelectorAll('.case');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cases.forEach(c => {
                const show = filter === 'all' || c.dataset.category.split(' ').includes(filter);
                c.classList.toggle('hide', !show);
            });
        });
    });
}

// Mobile nav
function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', e => {
        if (e.target.tagName === 'A') links.classList.remove('open');
    });
}
