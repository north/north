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

    state = state.split('|');
    for (var i = 0; i < anchorLength; i++) {
      if (state.length === 1) {
        anchor[i].setAttribute('data-state', state[0]);
      }
      else {
        var anchorState = anchor[i].getAttribute('data-state');
        var statePos = state.indexOf(anchorState);

        if (statePos < state.length - 1) {
          _this.setAttribute('data-state-active', state[statePos + 1]);
          anchor[i].setAttribute('data-state', state[statePos + 1]);
        }
        else {
          _this.setAttribute('data-state-active', state[0]);
          anchor[i].setAttribute('data-state', state[0]);
        }
      }
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