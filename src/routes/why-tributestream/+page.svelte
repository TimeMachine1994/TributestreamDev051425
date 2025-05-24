<script lang="ts">
  import PageLayout from '$lib/components/page-templates/page-layout.svelte';
</script>

<PageLayout 
  title="Why Tributestream?" 
  metaDescription="Discover why Tributestream is the premier livestreaming service for celebrations of life, creating lasting memories for families and friends."
>
  <section class="mb-16">
    <h2 class="text-brand-gold text-3xl font-semibold mb-6">A Dignified Approach to Memorial Livestreaming</h2>
    <p class="text-lg mb-6">
      Tributestream provides a respectful, professional livestreaming service specifically designed for celebrations of life.
      Our approach combines technical expertise with compassionate service to create meaningful experiences for families
      separated by distance during important memorial events.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20">
        <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Professional Quality</h3>
        <p>
          Multiple camera angles, professional audio, and reliable streaming technology ensure that every moment is captured
          with clarity and precision.
        </p>
      </div>
      <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20">
        <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Compassionate Service</h3>
        <p>
          Our team understands the sensitive nature of memorial services and provides discreet, respectful service that honors
          the dignity of the occasion.
        </p>
      </div>
    </div>
  </section>

  <section class="mb-16">
    <h2 class="text-brand-gold text-3xl font-semibold mb-6">Benefits for Families</h2>
    <p class="text-lg mb-10">
      When distance prevents attendance, Tributestream ensures that family members and friends can still participate
      in this important life event.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-2xl mb-4">1</div>
        <h3 class="text-xl font-medium mb-2">Inclusive Participation</h3>
        <p>Connect loved ones who cannot attend in person due to distance, health, or other constraints.</p>
      </div>
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-2xl mb-4">2</div>
        <h3 class="text-xl font-medium mb-2">Lasting Documentation</h3>
        <p>Create a permanent recording that becomes a meaningful keepsake for future generations.</p>
      </div>
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-2xl mb-4">3</div>
        <h3 class="text-xl font-medium mb-2">Peace of Mind</h3>
        <p>Experience reliable, professional service during an already challenging time.</p>
      </div>
    </div>
  </section>

  <div class="mt-12 text-center">
    <a href="/schedule-now" class="bg-brand-gold text-black py-3 px-6 rounded-md font-semibold transition-all duration-300 ease-linear hover:shadow-[0_0_10px_2px_var(--color-brand-gold)] inline-block">
      Schedule a Consultation
    </a>
  </div>
</PageLayout>