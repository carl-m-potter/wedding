# Claire & Carl wedding website

A four-page static website designed for GitHub Pages.

## Pages

- `index.html` — landing page
- `venue.html` — venue, date and timings
- `accommodation.html` — accommodation and travel guidance
- `gifts.html` — gift information placeholder
- `faq.html` — expandable FAQs
- `rsvp.html` — RSVP form connected to Formspree
- `thanks.html` — confirmation page after submission

## Current password

`May2027!`

To change it:

1. Choose a new password.
2. Generate its SHA-256 hash.
3. Replace the value of `PASSWORD_HASH` near the top of `script.js`.

You can generate a hash in a browser console with:

```js
crypto.subtle.digest("SHA-256", new TextEncoder().encode("YOUR_PASSWORD"))
  .then(buffer => console.log([...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("")));
```

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.

## Important security limitation

GitHub Pages is a static host. This password gate keeps casual visitors out, but it is not secure server-side authentication. A determined person can inspect the site files and bypass it.

For genuine access control, put the site behind a service such as Cloudflare Access, or use a host that supports server-side authentication.

## Editing content

The visible wording is written directly in each HTML file. Shared styling is in `styles.css`.

## RSVP form

The RSVP form submits to `https://formspree.io/f/meeykknk`.

## Adding your photos

The home page currently uses four placeholder SVG files in the `images` folder.

Replace them with your own photographs and update the image extensions in `index.html`. Landscape images with a 4:3 crop work best.
