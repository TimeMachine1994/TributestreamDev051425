# Contact Form reCAPTCHA v3 Refactor Plan (Updated with Async Loading Best Practices)

This document outlines the step-by-step refactor plan to correctly integrate and position the reCAPTCHA v3 challenge in the contact form of the SvelteKit project, incorporating best practices for asynchronous script loading and race condition prevention.

---

## ✅ Issues Identified

1. **Incorrect reCAPTCHA version usage**: The button uses v2-style attributes (`data-sitekey`, `data-callback`, `data-action`) which are not compatible with reCAPTCHA v3.
2. **Missing `grecaptcha.execute()`**: reCAPTCHA v3 requires explicit invocation of `grecaptcha.execute()` to obtain a token.
3. **Invisible CAPTCHA positioning**: Although v3 is invisible, a visual placeholder or legal notice should be placed beneath the button for clarity.
4. **Async loading race condition**: `grecaptcha` may be undefined if the script hasn't finished loading. This needs to be handled safely.
5. **Server-side validation**: Already correctly implemented in `+page.server.ts`.

---

## 🛠️ Refactor Steps

### Step 1: Update Button Markup

Replace the existing button with a click handler that triggers `grecaptcha.execute()`:

```svelte
<button
  class="btn preset-filled-primary-500 w-full flex items-center justify-center"
  on:click|preventDefault={handleRecaptcha}
  disabled={$submitting}
>
  {#if $submitting}
    <span>Sending...</span>
  {:else}
    <span>Send Message</span>
  {/if}
</button>
```

### Step 2: Add `handleRecaptcha` Function

In the `<script>` block of `+page.svelte`, add:

```ts
async function handleRecaptcha() {
  grecaptcha.ready(async () => {
    const token = await grecaptcha.execute(siteKey, { action: 'submit' });
    onSubmit(token);
  });
}
```

### Step 3: Remove v2 Attributes

Remove the following from the button:
- `data-sitekey`
- `data-callback`
- `data-action`

### Step 4: Add Legal Notice Below Button

Add a paragraph below the button to indicate reCAPTCHA protection:

```svelte
<p class="text-xs text-surface-500 text-center mt-2">
  This site is protected by reCAPTCHA and the Google
  <a href="https://policies.google.com/privacy" class="underline" target="_blank">Privacy Policy</a> and
  <a href="https://policies.google.com/terms" class="underline" target="_blank">Terms of Service</a> apply.
</p>
```

### Step 5: Load reCAPTCHA Script Asynchronously with Fallback

Update the `onMount` logic to include the fallback for `grecaptcha.ready()`:

```ts
onMount(() => {
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  // Safe fallback for grecaptcha.ready
  if (typeof grecaptcha === 'undefined') {
    grecaptcha = {
      ready: function (cb) {
        const c = '___grecaptcha_cfg';
        window[c] = window[c] || {};
        (window[c]['fns'] = window[c]['fns'] || []).push(cb);
      }
    };
  }
});
```

### Step 6: Add Resource Hints to app.html

In `src/app.html`, add:

```html
<link rel="preconnect" href="https://www.google.com">
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
```

---

## ✅ Server-Side Validation

The `+page.server.ts` file already:
- Extracts `g-recaptcha-response` from the form
- Validates it with Google’s API
- Returns appropriate error messages

No changes needed.

---

## ✅ Final Layout Structure

```svelte
<div>
  <button
    class="btn preset-filled-primary-500 w-full flex items-center justify-center"
    on:click|preventDefault={handleRecaptcha}
    disabled={$submitting}
  >
    {#if $submitting}
      <span>Sending...</span>
    {:else}
      <span>Send Message</span>
    {/if}
  </button>

  <p class="text-xs text-surface-500 text-center mt-2">
    This site is protected by reCAPTCHA and the Google
    <a href="https://policies.google.com/privacy" class="underline" target="_blank">Privacy Policy</a> and
    <a href="https://policies.google.com/terms" class="underline" target="_blank">Terms of Service</a> apply.
  </p>
</div>