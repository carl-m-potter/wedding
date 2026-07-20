const PASSWORD_HASH = "492208a0cfb275cba14739f8ae07b0df5c454b493d902f68ec03d2b5c26b0238";

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unlockSite() {
  sessionStorage.setItem("weddingSiteUnlocked", "true");
  document.querySelector(".password-screen")?.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const gate = document.querySelector(".password-screen");
  if (sessionStorage.getItem("weddingSiteUnlocked") === "true") {
    gate?.classList.add("hidden");
  }

  const form = document.querySelector(".password-form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const error = document.querySelector(".password-error");
    const attemptedHash = await sha256(input.value);

    if (attemptedHash === PASSWORD_HASH) {
      unlockSite();
    } else {
      error.textContent = "That password is not correct.";
      input.select();
    }
  });

  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelector(".nav-links");
  menuButton?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  });
});
