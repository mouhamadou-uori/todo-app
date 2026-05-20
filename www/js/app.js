(function ($) {
    'use strict';

    var STORAGE_KEY = 'todo.state.v1';

    var state = { enCours: [], terminees: [] };

    /* ---------- persistence ---------- */
    function load() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            var parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.enCours) && Array.isArray(parsed.terminees)) {
                state = parsed;
            }
        } catch (e) {
            state = { enCours: [], terminees: [] };
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* quota / private mode — ignore */ }
    }

    /* ---------- ids ---------- */
    function newId() {
        return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    }

    /* ---------- mutations ---------- */
    function addTask(text) {
        text = (text || '').trim();
        if (!text) return false;
        state.enCours.unshift({ id: newId(), text: text });
        save();
        return true;
    }

    function indexIn(bucket, id) {
        var arr = state[bucket];
        for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return i;
        return -1;
    }

    function removeTask(bucket, id) {
        var i = indexIn(bucket, id);
        if (i < 0) return;
        state[bucket].splice(i, 1);
        save();
    }

    function moveTask(bucket, id) {
        var i = indexIn(bucket, id);
        if (i < 0) return;
        var item = state[bucket].splice(i, 1)[0];
        var dest = (bucket === 'enCours') ? 'terminees' : 'enCours';
        state[dest].unshift(item);
        save();
    }

    function resetAll() {
        state = { enCours: [], terminees: [] };
        save();
    }

    /* ---------- DOM helpers ---------- */
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function liFor(task, bucket) {
        var cls = 'task-item' + (bucket === 'terminees' ? ' done' : '');
        return '<li class="' + cls + '" data-bucket="' + bucket + '" data-id="' + escapeHtml(task.id) + '">' +
                   '<span class="t-task-text">' + escapeHtml(task.text) + '</span>' +
               '</li>';
    }

    function render() {
        var $enCours = $('#list-encours');
        var $term    = $('#list-terminees');

        $enCours.empty();
        $term.empty();

        for (var i = 0; i < state.enCours.length; i++) {
            $enCours.append(liFor(state.enCours[i], 'enCours'));
        }
        for (var j = 0; j < state.terminees.length; j++) {
            $term.append(liFor(state.terminees[j], 'terminees'));
        }

        var hasEnCours = state.enCours.length > 0;
        var hasTerm    = state.terminees.length > 0;

        $('#section-encours').prop('hidden', !hasEnCours);
        $('#section-terminees').prop('hidden', !hasTerm);
        $('#empty-hint').prop('hidden', hasEnCours || hasTerm);
    }

    /* ---------- gesture handlers ---------- */
    function animateAndExecute($li, direction, action) {
        var cls = direction === 'left' ? 'swiping-left' : 'swiping-right';
        $li.addClass(cls);
        setTimeout(function () {
            action();
            render();
        }, 140);
    }

    /* ---------- modal ---------- */
    function openModal() {
        $('#t-modal').prop('hidden', false).attr('aria-hidden', 'false');
    }
    function closeModal() {
        $('#t-modal').prop('hidden', true).attr('aria-hidden', 'true');
    }

    function bindEvents() {

        $('#add-form').on('submit', function (ev) {
            ev.preventDefault();
            var $input = $('#task-input');
            if (addTask($input.val())) {
                $input.val('');
                render();
            }
            $input.focus();
        });

        $('#btn-reset').on('click', function () {
            if (state.enCours.length === 0 && state.terminees.length === 0) return;
            openModal();
        });
        $('#t-modal-cancel').on('click', closeModal);
        $('#t-modal-ok').on('click', function () {
            resetAll();
            render();
            closeModal();
        });
        // click on backdrop closes (but not on card)
        $('#t-modal').on('click', function (ev) {
            if (ev.target === this) closeModal();
        });
        // ESC to close
        $(document).on('keydown', function (ev) {
            if (ev.key === 'Escape' && !$('#t-modal').prop('hidden')) closeModal();
        });

        // Gestes natifs jQuery Mobile (consigne du projet) :
        // swipeleft / swiperight sont déclenchés par jQM via $.event.special.swipe,
        // qui écoute touchstart/touchmove/touchend (et vmousedown/move/up pour le mouse fallback).
        $(document).on('swipeleft', 'li.task-item', function (ev) {
            ev.stopPropagation();
            var $li = $(this);
            animateAndExecute($li, 'left', function () {
                removeTask($li.attr('data-bucket'), $li.attr('data-id'));
            });
        });

        $(document).on('swiperight', 'li.task-item', function (ev) {
            ev.stopPropagation();
            var $li = $(this);
            animateAndExecute($li, 'right', function () {
                moveTask($li.attr('data-bucket'), $li.attr('data-id'));
            });
        });
    }

    function tuneSwipe() {
        if ($.event && $.event.special && $.event.special.swipe) {
            $.event.special.swipe.horizontalDistanceThreshold = 30;
            $.event.special.swipe.verticalDistanceThreshold   = 60;
            $.event.special.swipe.durationThreshold           = 1000;
            $.event.special.swipe.scrollSupressionThreshold   = 10;
        }
    }

    /* ---------- boot ---------- */
    function boot() {
        tuneSwipe();
        load();
        bindEvents();
        render();
    }

    if (window.cordova) {
        document.addEventListener('deviceready', boot, false);
    } else {
        $(boot);
    }

})(jQuery);
