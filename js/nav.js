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

  function sectionTarget(target) {
    var articles = document.querySelectorAll('.__main--article');
    var navLinks = document.querySelectorAll('.nav--primary-item');
    var anchor = '';
    var link = '';

    target = document.querySelector(target);

    if (target.tagName.toLowerCase() === 'article') {
      target = target.firstElementChild;
    }

    anchor = target;

    while (anchor.tagName.toLowerCase() !== 'article') {
      anchor = anchor.parentNode;
    }
    link = document.querySelector('.nav--link[href="#' + anchor.getAttribute('id') + '"]').parentNode;

    for (var i = 0; i < articles.length; i++) {
      articles[i].setAttribute('data-target', 'false');
    }
    for (i = 0; i < navLinks.length; i++) {
      navLinks[i].removeAttribute('data-active');
    }

    link.setAttribute('data-active', 'true');
    anchor.setAttribute('data-target', 'true');

    return target;
  }

  function northNav(e) {
    e.preventDefault();

    var _this = this;
    var target = _this.getAttribute('href');
    var section = sectionTarget(target);

    section.scrollIntoView(true);
    history.pushState(null, null, target);
  }

  function northImages() {
    var _this = this;
    var srcs = null;
    var src = null;

    try {
      srcs = _this.getAttribute('data-borealis-srcs').split(', ');
      src = srcs[srcs.length - 1].split(': ')[1];
    }
    catch (err) {
      src = _this.getAttribute('src');
    }

    window.location.href = src;
  }

  function attachEventListeners() {
    var toc = document.querySelectorAll('a[href^="#"]');
    var images = document.querySelectorAll('main img');
    var tocLength = toc.length;
    var imgLength = images.length;

    for (var i = 0; i < tocLength; i++) {
      addEvent(toc[i], 'click', northNav);
    }

    for (i = 0; i < imgLength; i++) {
      addEvent(images[i], 'click', northImages);
    }
  }

  addEvent(window, 'DOMContentLoaded', function () {
    document.querySelector('html').className = 'js';

    var location = window.location.hash || '#' + document.querySelector('article[id]').getAttribute('id');

    if (document.querySelector(location) === null) {
      location = '#' + document.querySelector('article[id]').getAttribute('id');
      window.location.hash = '';
    }

    sectionTarget(location);

    attachEventListeners();

    //////////////////////////////
    // Header Nav
    //////////////////////////////
    var headlink = document.querySelector('.banner--title a');
    var firstnav = document.querySelector('#table-of-contents li:first-of-type a');
    firstnav = firstnav.href.replace(window.location.origin, '');
    firstnav = firstnav.charAt(0) === '/' ? firstnav.substr(1) : firstnav;

    addEvent(headlink, 'click', function (e) {
      e.preventDefault();
      console.log(firstnav);
      sectionTarget(firstnav);
      history.pushState(null, null, firstnav);
    });

    var copyright = document.querySelector('.footer--copyright');
    var year = new Date().getFullYear();
    copyright.innerHTML = copyright.innerHTML.replace('{{year}}', year);


  });
})();