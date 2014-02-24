(function () {
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

  function northNav(e) {
    e.preventDefault();

    var _this = this;
    var target = _this.getAttribute('href');
    var targetID = target;
    var articles = document.querySelectorAll('.__main--article');
    var anchor = '';

    target = document.querySelector(target);

    if (target.tagName.toLowerCase() === 'article') {
      target = target.firstElementChild;
    }

    anchor = target;

    while (anchor.tagName.toLowerCase() !== 'article') {
      anchor = anchor.parentNode;
    }

    for (var i = 0; i < articles.length; i++) {
      articles[i].setAttribute('data-target', 'false');
    }
    anchor.setAttribute('data-target', 'true');
    target.scrollIntoView(true);
    // console.log(targetID);
    history.pushState(null, null, targetID);
  }

  function attachEventListeners() {
    var toc = document.querySelectorAll('.__main--nav a');
    var tocLength = toc.length;

    for (var i = 0; i < tocLength; i++) {
      addEvent(toc[i], 'click', northNav);
    }
  }

  addEvent(window, 'DOMContentLoaded', function () {
    attachEventListeners();
  });
})();