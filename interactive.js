/* interactive.js — diagrams that run, widgets that demonstrate.
   Motion only where it carries meaning. Everything degrades to a static,
   readable state under prefers-reduced-motion or if JS never arrives. */

(function () {
    'use strict';

    var NS = 'http://www.w3.org/2000/svg';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

    function makeToken(svg, cls) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'flow-token' + (cls ? ' ' + cls : ''));
        var halo = document.createElementNS(NS, 'circle');
        halo.setAttribute('r', '11'); halo.setAttribute('class', 'tok-halo');
        var dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '4.5'); dot.setAttribute('class', 'tok-dot');
        g.appendChild(halo); g.appendChild(dot);
        svg.appendChild(g);
        return g;
    }

    function place(t, x, y) { t.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); }

    function travel(t, a, b, ms) {
        return new Promise(function (res) {
            if (reduce) { place(t, b[0], b[1]); return res(); }
            var t0 = performance.now();
            function step(now) {
                var k = Math.min(1, (now - t0) / ms);
                var e = ease(k);
                place(t, a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e);
                if (k < 1) requestAnimationFrame(step); else res();
            }
            requestAnimationFrame(step);
        });
    }

    function path(t, pts, msPerLeg) {
        var p = Promise.resolve();
        for (var i = 0; i < pts.length - 1; i++) {
            (function (a, b) { p = p.then(function () { return travel(t, a, b, msPerLeg); }); })(pts[i], pts[i + 1]);
        }
        return p;
    }

    function nodeMap(svg) {
        var m = {};
        svg.querySelectorAll('[data-node]').forEach(function (n) { m[n.getAttribute('data-node')] = n; });
        return m;
    }
    function clearActive(m) { Object.keys(m).forEach(function (k) { m[k].classList.remove('n-active', 'n-done'); }); }

    /* ---------- 1. ApplyTron: the gate actually stops the flow ---------- */

    function initApplytron() {
        var root = document.querySelector('[data-flow="applytron"]');
        if (!root) return;
        var svg = root.querySelector('svg');
        var n = nodeMap(svg);
        var status = root.querySelector('[data-flow-status]');
        var bApprove = root.querySelector('[data-act="approve"]');
        var bReject = root.querySelector('[data-act="reject"]');
        var bReplay = root.querySelector('[data-act="replay"]');

        var Y = 123;
        var X = { listings: 73, ingest: 231, score: 389, generate: 547, gate: 662, submit: 863 };
        var tok = makeToken(svg);
        var running = false, decision = null, resolveDecision = null;

        function say(text, tone) {
            status.textContent = text;
            status.className = 'flow-status' + (tone ? ' is-' + tone : '');
        }
        function gate(on) {
            bApprove.disabled = !on; bReject.disabled = !on;
            root.classList.toggle('awaiting', !!on);
        }
        function decide() {
            return new Promise(function (res) { resolveDecision = res; });
        }
        bApprove.addEventListener('click', function () { if (resolveDecision) { resolveDecision('approve'); resolveDecision = null; } });
        bReject.addEventListener('click', function () { if (resolveDecision) { resolveDecision('reject'); resolveDecision = null; } });
        bReplay.addEventListener('click', function () { if (!running) run(); });

        function stage(key, label) {
            clearActiveOnly(key);
            n[key].classList.add('n-active');
            say(label, 'work');
        }
        function clearActiveOnly(key) {
            Object.keys(n).forEach(function (k) {
                if (k !== key) { n[k].classList.remove('n-active'); }
            });
        }

        async function run() {
            running = true;
            clearActive(n); gate(false);
            place(tok, X.listings, Y);
            tok.classList.add('on');

            stage('listings', 'Pulling job listings from Adzuna…');
            await wait(450);

            await travel(tok, [X.listings, Y], [X.ingest, Y], 620);
            stage('ingest', 'Nightly ingest — deduping against what we already have');
            await wait(520);

            var rejected = false;
            do {
                if (!rejected) {
                    await travel(tok, [X.ingest, Y], [X.score, Y], 620);
                    stage('score', 'Scoring this role against your parsed resume…');
                    await wait(600);
                    await travel(tok, [X.score, Y], [X.generate, Y], 620);
                } else {
                    stage('generate', 'Regenerating with your edits…');
                    await wait(650);
                }
                stage('generate', 'Rendering an ATS-safe PDF…');
                await wait(520);

                await travel(tok, [X.generate, Y], [X.gate, Y], 620);
                n.generate.classList.remove('n-active');
                n.gate.classList.add('n-active');
                root.classList.add('held');
                say('Held. Nothing is sent until you decide.', 'hold');
                gate(true);

                decision = await decide();
                gate(false);
                root.classList.remove('held');

                if (decision === 'reject') {
                    rejected = true;
                    say('Rejected — looping back to regenerate.', 'warn');
                    n.gate.classList.remove('n-active');
                    await path(tok, [[X.gate, Y], [X.gate - 15, 190], [X.generate, 190], [X.generate, Y]], 420);
                } else {
                    rejected = false;
                }
            } while (decision === 'reject');

            n.gate.classList.remove('n-active'); n.gate.classList.add('n-done');
            await travel(tok, [X.gate, Y], [X.submit, Y], 700);
            n.submit.classList.add('n-active');
            say('Approved and submitted — with a screenshot captured for review.', 'ok');
            await wait(400);
            tok.classList.remove('on');
            running = false;
        }

        if (reduce) {
            say('Nothing is submitted until a person approves it.', 'hold');
            gate(false);
            return;
        }
        var seen = false;
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; run(); } });
        }, { threshold: 0.35 });
        io.observe(root);
    }

    /* ---------- 2. Pipeline: data flowing into the warehouse ---------- */

    function initPipeline() {
        var root = document.querySelector('[data-flow="pipeline"]');
        if (!root) return;
        var svg = root.querySelector('svg');
        var n = nodeMap(svg);
        var status = root.querySelector('[data-flow-status]');
        var bReplay = root.querySelector('[data-act="replay"]');
        var tok = makeToken(svg);
        var running = false;

        var steps = [
            { at: [237, 86], node: 'extract', text: 'Pulling prices and news for the day…' },
            { at: [379, 86], node: 'load', text: 'MERGE on (ticker, date) — a re-run overwrites, never appends' },
            { at: [521, 86], node: 'score', text: 'Gemini turning headlines into sentiment scores…' },
            { at: [663, 86], node: 'predict', text: 'Random Forest reading the scores…' },
            { at: [630, 257], node: 'predictions', text: 'Predictions written beside the outcomes they get graded against' },
            { at: [860, 247], node: 'looker', text: 'Dashboard updated — including how wrong yesterday was' }
        ];

        async function run() {
            running = true; clearActive(n);
            place(tok, 69, 75); tok.classList.add('on');
            status.textContent = 'Daily run starting…';
            status.className = 'flow-status is-work';
            await wait(500);
            var prev = [69, 75];
            for (var i = 0; i < steps.length; i++) {
                var s = steps[i];
                await travel(tok, prev, s.at, 620);
                prev = s.at;
                Object.keys(n).forEach(function (k) { n[k].classList.remove('n-active'); });
                if (n[s.node]) n[s.node].classList.add('n-active');
                status.textContent = s.text;
                status.className = 'flow-status' + (s.node === 'load' ? ' is-hold' : ' is-work');
                await wait(680);
            }
            status.textContent = 'Run complete. Re-run it — the row count will not move.';
            status.className = 'flow-status is-ok';
            tok.classList.remove('on');
            running = false;
        }

        bReplay.addEventListener('click', function () { if (!running) run(); });
        if (reduce) { status.textContent = 'Daily run: extract → merge → score → predict → dashboard.'; return; }
        var seen = false;
        new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; run(); } });
        }, { threshold: 0.35 }).observe(root);
    }

    /* ---------- 3. FreightSwipe: one row, two parties ---------- */

    function initFreight() {
        var root = document.querySelector('[data-flow="freight"]');
        if (!root) return;
        var svg = root.querySelector('svg');
        var n = nodeMap(svg);
        var status = root.querySelector('[data-flow-status]');
        var bReplay = root.querySelector('[data-act="replay"]');
        var running = false;
        var a = makeToken(svg, 'tok-b'), b = makeToken(svg, 'tok-b');

        async function run() {
            running = true; clearActive(n);
            place(a, 60, 101); place(b, 60, 181);
            a.classList.add('on'); b.classList.add('on');
            status.textContent = 'A carrier and a shipper act on the same load…';
            status.className = 'flow-status is-work';
            await wait(700);
            await Promise.all([
                path(a, [[60, 101], [132, 101], [132, 141], [214, 141]], 380),
                path(b, [[60, 181], [132, 181], [132, 141], [214, 141]], 380)
            ]);
            b.classList.remove('on');
            if (n.api) n.api.classList.add('n-active');
            status.textContent = 'Same REST API, role checked per route…';
            await wait(800);
            await travel(a, [214, 141], [386, 141], 700);
            if (n.api) n.api.classList.remove('n-active');
            if (n.services) n.services.classList.add('n-active');
            status.textContent = 'Matching, lifecycle and reviews…';
            await travel(a, [386, 141], [598, 141], 700);
            await wait(700);
            if (n.services) n.services.classList.remove('n-active');
            if (n.db) n.db.classList.add('n-active');
            await travel(a, [598, 141], [835, 141], 700);
            status.textContent = 'One load record. Nothing left to reconcile.';
            status.className = 'flow-status is-ok';
            await wait(400);
            a.classList.remove('on');
            running = false;
        }

        bReplay.addEventListener('click', function () { if (!running) run(); });
        if (reduce) { status.textContent = 'Both parties read and write the same load record.'; return; }
        var seen = false;
        new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; run(); } });
        }, { threshold: 0.35 }).observe(root);
    }

    /* ---------- 4. Idempotency: MERGE vs INSERT, four seconds to grasp ---------- */

    function initIdempotency() {
        var root = document.querySelector('[data-widget="idempotency"]');
        if (!root) return;
        var TICKERS = ['AAPL', 'MSFT', 'NVDA'];
        var DAY = '2026-09-03';
        var runs = 0;
        var appendRows = [], mergeRows = [];

        var elA = root.querySelector('[data-rows="append"]');
        var elM = root.querySelector('[data-rows="merge"]');
        var cA = root.querySelector('[data-count="append"]');
        var cM = root.querySelector('[data-count="merge"]');
        var dupe = root.querySelector('[data-dupes]');
        var note = root.querySelector('[data-idem-note]');
        var bRun = root.querySelector('[data-act="run"]');
        var bReset = root.querySelector('[data-act="reset"]');

        function render(el, rows, mode) {
            el.innerHTML = '';
            rows.forEach(function (r) {
                var li = document.createElement('li');
                li.className = 'row' + (r.dupe ? ' is-dupe' : '') + (r.updated ? ' is-updated' : '');
                li.innerHTML = '<span class="k">' + r.ticker + ' · ' + r.day + '</span>' +
                               '<span class="v">' + r.close.toFixed(2) + '</span>' +
                               '<span class="tag">' + (r.dupe ? 'duplicate' : (r.updated ? 'updated in place' : 'new')) + '</span>';
                el.appendChild(li);
            });
            var dupes = rows.filter(function (r) { return r.dupe; }).length;
            if (mode === 'append') { cA.textContent = rows.length; dupe.textContent = dupes; }
            else { cM.textContent = rows.length; }
        }

        function runOnce() {
            runs++;
            var close = 180 + runs * 0.35;
            TICKERS.forEach(function (t) {
                appendRows.push({ ticker: t, day: DAY, close: close, dupe: runs > 1 });
                var found = null;
                for (var i = 0; i < mergeRows.length; i++) {
                    if (mergeRows[i].ticker === t && mergeRows[i].day === DAY) { found = mergeRows[i]; break; }
                }
                if (found) { found.close = close; found.updated = true; }
                else { mergeRows.push({ ticker: t, day: DAY, close: close }); }
            });
            render(elA, appendRows, 'append');
            render(elM, mergeRows, 'merge');
            note.textContent = runs === 1
                ? 'One run each. Identical so far — this is where most pipelines stop testing.'
                : 'Run ' + runs + ' of the same day. Append has ' + (appendRows.length - mergeRows.length) +
                  ' phantom rows; every average computed downstream is now wrong. Merge is unchanged.';
            root.classList.toggle('diverged', runs > 1);
        }

        bRun.addEventListener('click', runOnce);
        bReset.addEventListener('click', function () {
            runs = 0; appendRows = []; mergeRows = [];
            render(elA, appendRows, 'append'); render(elM, mergeRows, 'merge');
            note.textContent = 'Empty tables. Run the same day more than once and watch them diverge.';
            root.classList.remove('diverged');
        });
        runOnce();
    }

    /* ---------- 5. Guarded state machine ---------- */

    function initStateMachine() {
        var root = document.querySelector('[data-widget="statemachine"]');
        if (!root) return;

        var MACHINE = {
            ingested:  { label: 'ingested',   next: [['score', 'scored']] },
            scored:    { label: 'scored',     next: [['generate documents', 'generated']] },
            generated: { label: 'generated',  next: [['send for approval', 'awaiting_approval']] },
            awaiting_approval: { label: 'awaiting approval', gate: true,
                                 next: [['approve', 'approved'], ['reject', 'generated']] },
            approved:  { label: 'approved',   next: [['submit', 'submitted'], ['submission fails', 'approved_failed']] },
            approved_failed: { label: 'approved · submission failed', warn: true,
                               next: [['retry submit', 'submitted']] },
            submitted: { label: 'submitted', terminal: true, next: [] }
        };
        var ORDER = ['ingested', 'scored', 'generated', 'awaiting_approval', 'approved', 'submitted'];

        var state = 'ingested';
        var track = root.querySelector('[data-sm-track]');
        var acts = root.querySelector('[data-sm-actions]');
        var log = root.querySelector('[data-sm-log]');
        var bReset = root.querySelector('[data-act="sm-reset"]');

        function draw() {
            track.innerHTML = '';
            ORDER.forEach(function (k) {
                var li = document.createElement('li');
                var isNow = (k === state) || (state === 'approved_failed' && k === 'approved');
                li.className = 'sm-node' + (isNow ? ' is-now' : '') +
                    (ORDER.indexOf(k) < ORDER.indexOf(state === 'approved_failed' ? 'approved' : state) ? ' is-past' : '') +
                    (MACHINE[k] && MACHINE[k].gate ? ' is-gate' : '');
                li.textContent = MACHINE[k].label;
                track.appendChild(li);
            });

            acts.innerHTML = '';
            var s = MACHINE[state];
            if (s.terminal) {
                var done = document.createElement('p');
                done.className = 'sm-done';
                done.textContent = 'Terminal state. There is no transition out of submitted — which is the point.';
                acts.appendChild(done);
            }
            s.next.forEach(function (pair) {
                var b = document.createElement('button');
                b.className = 'btn' + (pair[1] === 'approved' ? ' btn-solid' : '');
                b.textContent = pair[0];
                b.addEventListener('click', function () {
                    var from = MACHINE[state].label;
                    state = pair[1];
                    add(from + '  →  ' + MACHINE[state].label);
                    draw();
                });
                acts.appendChild(b);
            });
            root.setAttribute('data-state', state);
        }

        function add(text) {
            var li = document.createElement('li');
            li.textContent = text;
            log.appendChild(li);
            log.scrollTop = log.scrollHeight;
        }

        bReset.addEventListener('click', function () {
            state = 'ingested'; log.innerHTML = ''; draw();
        });
        draw();
    }

    /* ---------- 6. Live pipeline status (hidden until the endpoint answers) ---------- */

    function initLiveStatus() {
        var el = document.querySelector('[data-live-status]');
        if (!el || !window.fetch) return;
        var src = el.getAttribute('data-live-status') || 'pipeline-status.json';

        fetch(src, { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw 0; return r.json(); })
            .then(function (d) {
                if (!d || !d.last_run_utc) throw 0;
                var when = new Date(d.last_run_utc);
                if (isNaN(when)) throw 0;
                var mins = Math.round((Date.now() - when.getTime()) / 60000);
                var ago = mins < 90 ? mins + ' min ago'
                        : mins < 60 * 48 ? Math.round(mins / 60) + ' h ago'
                        : Math.round(mins / 1440) + ' days ago';
                el.querySelector('[data-live="when"]').textContent = ago;
                el.querySelector('[data-live="rows"]').textContent =
                    typeof d.rows_loaded === 'number' ? d.rows_loaded.toLocaleString() : '—';
                el.querySelector('[data-live="tickers"]').textContent =
                    typeof d.tickers === 'number' ? d.tickers.toLocaleString() : '—';
                var ok = el.querySelector('[data-live="state"]');
                ok.textContent = d.status === 'success' ? 'success' : String(d.status || 'unknown');
                ok.className = 'live-pill ' + (d.status === 'success' ? 'is-ok' : 'is-warn');
                el.hidden = false;
            })
            .catch(function () { /* stay hidden — a broken widget is worse than none */ });
    }

    document.addEventListener('DOMContentLoaded', function () {
        try { initApplytron(); } catch (e) {}
        try { initPipeline(); } catch (e) {}
        try { initFreight(); } catch (e) {}
        try { initIdempotency(); } catch (e) {}
        try { initStateMachine(); } catch (e) {}
        try { initLiveStatus(); } catch (e) {}
    });
})();
