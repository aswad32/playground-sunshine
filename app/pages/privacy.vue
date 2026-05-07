<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy - Playground Sunshine',
  description: 'Privacy policy for Playground Sunshine — all tools run entirely in your browser. No data is collected or transmitted.',
})
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-12">
    <header class="mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p class="text-sm text-gray-400">Last updated: May 2026</p>
    </header>

    <div class="space-y-8 text-gray-700 text-sm leading-relaxed">
      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">Overview</h2>
        <p>
          Playground Sunshine is built with privacy as a core principle. All tools run <strong>entirely in your browser</strong>.
          We do not collect, transmit, store, or sell any personal data or user input — ever.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">1. Data We Do Not Collect</h2>
        <p>We do not collect:</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          <li>Text, code, or files you paste or upload into any tool</li>
          <li>Tokens, secrets, API keys, or credentials you enter</li>
          <li>Account information — there are no accounts</li>
          <li>Cookies for tracking or advertising purposes</li>
          <li>Browsing history or cross-site activity</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">2. Client-Side Processing</h2>
        <p>
          Every tool on this site processes your input locally in your browser using JavaScript.
          No input is sent to a server. This applies to all tools, including:
        </p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          <li>JWT Decoder — tokens are decoded locally; no verification request is made</li>
          <li>Hash Generator — hashing runs in the browser via the Web Crypto API</li>
          <li>Image Compressor — images are processed using the Canvas API and never uploaded</li>
          <li>JSON, SQL, and Markdown tools — all formatting happens in your browser</li>
          <li>Base64 and URL tools — encoding and decoding are purely client-side</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">3. Local Storage</h2>
        <p>
          We do not store your tool inputs in <code class="bg-gray-100 px-1 rounded">localStorage</code> or
          <code class="bg-gray-100 px-1 rounded">sessionStorage</code> unless you explicitly enable a history or save feature
          (none currently exist). Your data lives only in the active browser tab and is gone when you close or refresh the page.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">4. Analytics</h2>
        <p>
          Playground Sunshine does not use any analytics, tracking scripts, or third-party telemetry.
          There are no pixels, beacons, or fingerprinting mechanisms on this site.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">5. Third-Party Services</h2>
        <p>
          The site may be hosted on a third-party platform (such as a CDN or static hosting provider).
          That provider may collect standard server access logs (IP address, browser user agent, request timestamps)
          as part of normal infrastructure operation. We do not control or access these logs for user profiling.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">6. Open Source</h2>
        <p>
          The full source code of Playground Sunshine is publicly available on
          <a
            href="https://github.com/aswad32/playground-sunshine"
            target="_blank"
            rel="noopener noreferrer"
            class="text-indigo-600 hover:underline"
          >GitHub</a>.
          You can inspect exactly what each tool does with your input. We believe transparency is the best privacy guarantee.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">7. Your Responsibility</h2>
        <p>
          While we take every measure to ensure your data stays in your browser, you are responsible for the security of
          your own device and browser environment. Avoid using shared or untrusted devices when working with sensitive data.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">8. Changes to This Policy</h2>
        <p>
          If we ever change how data is handled in a meaningful way, this page will be updated and the
          "Last updated" date will reflect the change. We will never silently introduce data collection.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">9. Contact</h2>
        <p>
          Questions about privacy? Open an issue on
          <a
            href="https://github.com/aswad32/playground-sunshine"
            target="_blank"
            rel="noopener noreferrer"
            class="text-indigo-600 hover:underline"
          >GitHub</a>.
        </p>
      </section>
    </div>

    <div class="mt-10">
      <NuxtLink to="/" class="text-sm text-indigo-600 hover:underline">← Back to all tools</NuxtLink>
    </div>
  </main>
</template>
