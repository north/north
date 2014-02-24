(function () {
  'use strict';

  //////////////////////////////
  // Add event (cross browser)
  // From http://stackoverflow.com/a/10150042
  //////////////////////////////
  function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
      elem.addEventListener(event, fn, false);
    } else {
      elem.attachEvent('on' + event, function () {
        return (fn.call(elem, window.event));
      });
    }
  }

  function toggleState(e) {
    e.preventDefault();
    var _this = e.srcElement;
    var target = _this.getAttribute('data-toggle-target');
    var state = _this.getAttribute('data-toggle-state');

    var anchor = document.querySelectorAll('[data-toggle-anchor="' + target + '"');
    var anchorLength = anchor.length;
    for (var i = 0; i < anchorLength; i++) {
      anchor[i].setAttribute('data-state', state);
    }
  }

  function attachEventListeners() {
    var toggles = document.querySelectorAll('[data-toggle-target]');
    var togglesLength = toggles.length;

    for (var i = 0; i < togglesLength; i++) {
      addEvent(toggles[i], 'click', toggleState);
    }

  }

  //////////////////////////////
  // Window DOMReady
  //////////////////////////////
  addEvent(window, 'DOMContentLoaded', function () {
    attachEventListeners();
  });


})();