document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("vpModal");
  var openTriggers = document.querySelectorAll("[data-vp-open-modal]");
  var closeTriggers = document.querySelectorAll("[data-vp-close-modal]");
  var form = document.getElementById("vpForm");
  var confirmation = form ? form.querySelector(".vp-form-confirmation") : null;

  function openModal() {
    modal.classList.add("is-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    if (form) {
      form.reset();
    }
    if (confirmation) {
      confirmation.hidden = true;
    }
  }

  openTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", openModal);
  });

  closeTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", closeModal);
  });

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (confirmation) {
        confirmation.hidden = false;
      }
      setTimeout(closeModal, 1800);
    });
  }
});
