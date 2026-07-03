document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll("form[data-static-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var confirmation = form.querySelector(".form-confirmation");
      form.reset();
      if (confirmation) {
        confirmation.hidden = false;
      }
    });
  });

  var yearEl = document.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
