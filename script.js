/* Guest access is shared by every website page.
   Login and RSVP details are always checked with the Cloudflare Worker. */
const INVITATION_STORAGE_KEY = "carl-claire-your-invitation-v1";
const INVITATION_API = "https://api.carlandclaire.co.uk/invitation";
const IS_INVITATION_PAGE = window.location.pathname.startsWith("/invitation");

// Hide the old password screen if any other HTML page still contains it.
const accessStyles = document.createElement("style");
accessStyles.textContent = `
  .password-screen { display: none !important; }
  html.guest-auth-pending body { visibility: hidden !important; }
`;
document.head.appendChild(accessStyles);

function invitationLoginUrl() {
  const original = window.location.pathname + window.location.search + window.location.hash;
  return "/invitation/?next=" + encodeURIComponent(original);
}

function showGuestCheckError() {
  // Never grant access using an old RSVP if D1 cannot be checked.
  document.body.replaceChildren();
  const panel = document.createElement("main");
  panel.style.cssText = "max-width:520px;margin:12vh auto;padding:32px;text-align:center;font-family:Arial,sans-serif";
  const title = document.createElement("h1");
  title.textContent = "We couldn't check your invitation";
  const message = document.createElement("p");
  message.textContent = "Please check your connection and try again. Your RSVP has not been changed.";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Try again";
  retry.style.cssText = "padding:12px 24px;cursor:pointer";
  retry.addEventListener("click", () => window.location.reload());
  panel.append(title, message, retry);
  document.body.append(panel);
  document.documentElement.classList.remove("guest-auth-pending");
}

async function checkGuestAccess() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(INVITATION_STORAGE_KEY) || "null");
  } catch {
    localStorage.removeItem(INVITATION_STORAGE_KEY);
  }

  if (!saved?.sessionToken) {
    window.location.replace(invitationLoginUrl());
    return;
  }

  try {
    const response = await fetch(INVITATION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ sessionToken: saved.sessionToken })
    });

    if (response.status === 401) {
      localStorage.removeItem(INVITATION_STORAGE_KEY);
      window.location.replace(invitationLoginUrl());
      return;
    }
    if (!response.ok) throw new Error("Invitation check unavailable");

    const fresh = await response.json();
    if (!fresh.sessionToken) throw new Error("Missing session token");
    localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(fresh));

    if (!fresh.rsvp) {
      window.location.replace(invitationLoginUrl());
      return;
    }

    // Accepted and declined RSVPs both count as completed.
    document.documentElement.classList.remove("guest-auth-pending");
    upgradeInvitationNav();
  } catch {
    showGuestCheckError();
  }
}

if (!IS_INVITATION_PAGE) {
  document.documentElement.classList.add("guest-auth-pending");
  checkGuestAccess();
}

/* ------------------------------------------------------------------
   Personalised invitation navigation
   ------------------------------------------------------------------ */

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

    const existingLabel = invitationLink.querySelector(
      "#invitation-nav-label"
    );

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

/* A guest who has not responded is redirected to their invitation,
   so the old homepage RSVP button is no longer needed. */
function setupHomeRsvpButton() {
  const button = document.getElementById("home-rsvp-button");
  if (button) button.hidden = true;
}

/* ------------------------------------------------------------------
   Navigation and FAQs
   ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {

  upgradeInvitationNav();

  // NEW: Show or hide the homepage RSVP button.
  setupHomeRsvpButton();

  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelector(".nav-links");

  menuButton?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      String(open)
    );
  });

  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const open = item.classList.toggle("open");

      button.setAttribute(
        "aria-expanded",
        String(open)
      );
    });
  });

});

/* ------------------------------------------------------------------
   Wedding-site motion and page transitions
   ------------------------------------------------------------------ */

function setupScrollMotion() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const revealTargets = document.querySelectorAll(
    ".section > :not(.photo-grid), .detail-card, .hotel-card, .travel-card, .faq-item, .gift-placeholder, .invitation-card, .plan-card, .dashboard-section, .guest-greeting"
  );

  const imageTargets = document.querySelectorAll(
    ".photo-card img, main img"
  );

  revealTargets.forEach(element => {
    element.classList.add("scroll-reveal");
  });

  imageTargets.forEach(element => {
    element.classList.add("image-dissolve");
  });

  if (
    reduceMotion ||
    !("IntersectionObserver" in window)
  ) {
    document.querySelectorAll(
      ".scroll-reveal, .image-dissolve"
    ).forEach(element => {
      element.classList.add("is-visible");
    });

    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.10
  });

  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle(
        "is-visible",
        entry.isIntersecting
      );
    });
  }, {
    rootMargin: "-8% 0px -8% 0px",
    threshold: 0.14
  });

  revealTargets.forEach(element => {
    revealObserver.observe(element);
  });

  imageTargets.forEach(element => {
    imageObserver.observe(element);
  });
}

/* ------------------------------------------------------------------
   Page transitions
   ------------------------------------------------------------------ */

function setupPageTransitions() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.body.classList.add("page-ready");

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-leaving");
    document.body.classList.add("page-ready");
  });

  if (reduceMotion) return;

  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");

    if (!link || event.defaultPrevented) return;

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const rawHref = link.getAttribute("href");

    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:")
    ) {
      return;
    }

    let destination;

    try {
      destination = new URL(
        link.href,
        window.location.href
      );
    } catch {
      return;
    }

    if (destination.origin !== window.location.origin) return;
    if (destination.href === window.location.href) return;

    event.preventDefault();

    document.body.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 260);
  });
}

/* ------------------------------------------------------------------
   Initialise motion and page transitions
   ------------------------------------------------------------------ */

window.addEventListener("DOMContentLoaded", () => {
  setupScrollMotion();
  setupPageTransitions();
});
