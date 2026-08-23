(function () {
  var nameInput = document.getElementById('rsvp-name');
  var suggestInput = document.getElementById('rsvp-suggest');
  var choiceInputs = document.querySelectorAll('#rsvp-choices input[type="radio"]');
  var submitBtn = document.getElementById('rsvp-submit');
  var statusEl = document.getElementById('rsvp-status');

  function clearStatus() {
    statusEl.textContent = '';
  }

  nameInput.addEventListener('input', clearStatus);
  suggestInput.addEventListener('input', clearStatus);
  choiceInputs.forEach(function (input) {
    input.addEventListener('change', clearStatus);
  });

  function selectedChoice() {
    for (var i = 0; i < choiceInputs.length; i++) {
      if (choiceInputs[i].checked) return choiceInputs[i].value;
    }
    return null;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error('clipboard unavailable'));
  }

  submitBtn.addEventListener('click', function () {
    var name = nameInput.value.trim();
    var choice = selectedChoice();
    var suggest = suggestInput.value.trim();

    if (!name || !choice) {
      statusEl.textContent = 'Add your name and pick one option first.';
      return;
    }

    var summary = 'Mom Camp — ' + name + ': ' + choice;
    if (suggest) summary += ' · Also invite: ' + suggest;

    var body = new URLSearchParams({
      'form-name': 'mom-camp-rsvp',
      name: name,
      choice: choice,
      suggest: suggest
    }).toString();

    statusEl.textContent = 'Sending…';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      statusEl.textContent = 'Got it. Thanks — your answer is in.';
    }).catch(function () {
      copyToClipboard(summary).then(function () {
        statusEl.textContent = 'Submission did not go through. Your answer is copied — text it to Brittany.';
      }, function () {
        statusEl.textContent = 'Submission did not go through. Copy this and send it to Brittany: ' + summary;
      });
    });
  });
})();
