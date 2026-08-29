(function () {
  var stage = document.getElementById('deckStage');
  if (!stage) return; // not the deck page

  var viewport = document.getElementById('deckViewport');
  var slides = Array.prototype.slice.call(stage.querySelectorAll('.slide'));
  var dotsEl = document.getElementById('navDots');
  var countEl = document.getElementById('navCount');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var notesBtn = document.getElementById('notesBtn');
  var notesPanel = document.getElementById('deckNotes');
  var notesText = document.getElementById('deckNotesText');

  var current = 0;
  var notesVisible = false;

  var dots = slides.map(function (slide, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'nav-dot';
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); });
    dotsEl.appendChild(dot);
    return dot;
  });

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
    countEl.textContent = (current + 1) + ' / ' + slides.length;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
    notesText.textContent = slides[current].getAttribute('data-notes') || '';
  }

  function goTo(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function scaleStage() {
    var availW = viewport.clientWidth;
    var availH = viewport.clientHeight;
    var scale = Math.min(availW / 1920, availH / 1080);
    stage.style.transform = 'scale(' + scale + ')';
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  notesBtn.addEventListener('click', function () {
    notesVisible = !notesVisible;
    notesPanel.hidden = !notesVisible;
    notesBtn.setAttribute('aria-pressed', String(notesVisible));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(slides.length - 1);
    } else if (e.key === 'n' || e.key === 'N') {
      notesBtn.click();
    }
  });

  window.addEventListener('resize', scaleStage);

  render();
  scaleStage();
})();
