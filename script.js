const PASSWORD_HASH = "492208a0cfb275cba14739f8ae07b0df5c454b493d902f68ec03d2b5c26b0238";
const INVITATION_STORAGE_KEY = "carl-claire-your-invitation-v1";

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

function upgradeInvitationNav() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  const hasRememberedInvitation =
    Boolean(localStorage.getItem(INVITATION_STORAGE_KEY));

  const label = hasRememberedInvitation
    ? "View Your Plans"
    : "Your Invitation";

  let invitationLink = navLinks.querySelector(
    'a[href="/invitation/"], a[href="invitation/"], a[href="/invitation/index.html"]'
  );

  if (!invitationLink) {
    invitationLink = navLinks.querySelector(
      'a[href="/rsvp/"], a[href="rsvp/"], a[href="/rsvp.html"], a[href="rsvp.html"]'
    );
  }

  if (invitationLink) {
    invitationLink.href = "/invitation/";
    invitationLink.classList.add("nav-invitation-priority");

    const existingLabel = invitationLink.querySelector("#invitation-nav-label");
    if (existingLabel) {
      existingLabel.textContent = label;
    } else {
      invitationLink.textContent = label;
    }

    if (window.location.pathname.startsWith("/invitation")) {
      invitationLink.setAttribute("aria-current", "page");
    } else if (
      invitationLink.getAttribute("aria-current") === "page" &&
      (
        window.location.pathname.startsWith("/rsvp") ||
        invitationLink.href.includes("/invitation/")
      )
    ) {
      invitationLink.removeAttribute("aria-current");
    }
  }

  if (!document.getElementById("invitation-nav-priority-style")) {
    const style = document.createElement("style");
    style.id = "invitation-nav-priority-style";
    style.textContent = `
      .nav-links .nav-invitation-priority {
        font-weight: 600;
      }

      @media (max-width: 820px) {
        .nav-links .nav-invitation-priority {
          order: -1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  upgradeInvitationNav();

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


/* ------------------------------------------------------------------
   Wedding-site motion and page transitions
   ------------------------------------------------------------------ */
function setupScrollMotion() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll(
    '.section > :not(.photo-grid), .detail-card, .hotel-card, .travel-card, .faq-item, .gift-placeholder, .invitation-card, .plan-card, .dashboard-section, .guest-greeting'
  );
  const imageTargets = document.querySelectorAll('.photo-card img, main img');

  revealTargets.forEach(element => element.classList.add('scroll-reveal'));
  imageTargets.forEach(element => element.classList.add('image-dissolve'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.scroll-reveal, .image-dissolve').forEach(element => {
      element.classList.add('is-visible');
    });
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.10
  });

  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    rootMargin: '-8% 0px -8% 0px',
    threshold: 0.14
  });

  revealTargets.forEach(element => revealObserver.observe(element));
  imageTargets.forEach(element => imageObserver.observe(element));


}

function setupPageTransitions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('page-ready');

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-leaving');
    document.body.classList.add('page-ready');
  });

  if (reduceMotion) return;

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const rawHref = link.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) return;

    let destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (destination.origin !== window.location.origin) return;
    if (destination.href === window.location.href) return;

    event.preventDefault();
    document.body.classList.add('page-leaving');
    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 260);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupScrollMotion();
  setupPageTransitions();
});
