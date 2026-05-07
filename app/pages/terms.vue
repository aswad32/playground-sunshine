<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Use - Playground Sunshine',
  description: 'Terms of use for Playground Sunshine — a collection of free, client-side developer tools.',
})
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-12">
    <header class="mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Terms of Use</h1>
      <p class="text-sm text-gray-400">Last updated: May 2026</p>
    </header>

    <div class="space-y-8 text-gray-700 text-sm leading-relaxed">
      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">1. Acceptance</h2>
        <p>
          By using Playground Sunshine ("the Site"), you agree to these Terms of Use. If you do not agree, please do not use the Site.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">2. What Playground Sunshine Is</h2>
        <p>
          Playground Sunshine is a free, open-source collection of browser-based utilities for developers and general users.
          All tools run entirely in your browser — no user input is sent to any server, logged, or stored by us.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">3. No Warranty</h2>
        <p>
          All tools are provided <strong>"as is"</strong> and <strong>"as available"</strong>, without any warranty of any kind — express or implied.
          We make no guarantees about accuracy, reliability, fitness for a particular purpose, or uninterrupted availability.
          You use the tools at your own risk.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">4. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, the maintainers and contributors of Playground Sunshine shall not be liable for any direct, indirect,
          incidental, special, consequential, or punitive damages arising from your use — or inability to use — any tool on the Site.
          This includes, but is not limited to, data loss, security incidents, or incorrect outputs.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">5. Acceptable Use</h2>
        <p>You agree not to use the Site to:</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          <li>Process or generate content that is illegal, harmful, or violates the rights of others</li>
          <li>Attempt to reverse-engineer, scrape excessively, or abuse the Site infrastructure</li>
          <li>Circumvent security controls or use the tools to assist in attacks on other systems</li>
        </ul>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">6. Your Responsibility</h2>
        <p>
          You are solely responsible for any data you input into the tools and for the results you act upon.
          Sensitive data (API keys, passwords, tokens, personal information) should be handled with care.
          Although processing is client-side, you are responsible for the security of your own device and browser environment.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">7. Third-Party Libraries</h2>
        <p>
          The tools rely on open-source libraries. Each library is subject to its own licence and terms.
          We do not warrant the correctness or security of any third-party dependency.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">8. Changes to These Terms</h2>
        <p>
          We may update these Terms of Use from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised terms.
          The "Last updated" date at the top of this page reflects when terms were last revised.
        </p>
      </section>

      <section>
        <h2 class="text-base font-semibold text-gray-900 mb-2">9. Contact</h2>
        <p>
          Playground Sunshine is an open-source project. If you have questions or concerns, please open an issue on
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
