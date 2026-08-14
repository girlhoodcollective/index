document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("vpModal");
  var openTriggers = document.querySelectorAll("[data-vp-open-modal]");
  var closeTriggers = document.querySelectorAll("[data-vp-close-modal]");
  var form = document.getElementById("vpForm");
  var confirmation = form ? form.querySelector(".vp-form-confirmation") : null;
  var errorMessage = form ? form.querySelector(".vp-form-error") : null;

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
    if (errorMessage) {
      errorMessage.hidden = true;
    }
  }

  function encodeFormData(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      })
      .join("&");
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
      if (errorMessage) {
        errorMessage.hidden = true;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFormData(data)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Netlify Forms submission failed: " + response.status);
          }
          if (confirmation) {
            confirmation.hidden = false;
          }
          setTimeout(closeModal, 1800);
        })
        .catch(function (error) {
          console.error(error);
          if (errorMessage) {
            errorMessage.hidden = false;
          }
        });
    });
  }
});
