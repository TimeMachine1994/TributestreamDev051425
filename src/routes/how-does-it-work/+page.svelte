<script lang="ts">
  import PageLayout from '$lib/components/page-templates/page-layout.svelte';
</script>

<PageLayout 
  title="How Does It Work?" 
  metaDescription="Learn how Tributestream's livestreaming service process works, from initial consultation to delivery of the final memorial video."
>
  <section class="content-section">
    <p class="text-lg mb-10">
      Tributestream provides a seamless, respectful process for livestreaming memorial services. 
      Our professional team handles all technical aspects, allowing you to focus on what matters most.
    </p>

    <div class="relative">
      <!-- Timeline line -->
      <div class="absolute left-0 md:left-1/2 h-full w-1 bg-[#D5BA7F]/30 transform -translate-x-1/2 hidden md:block"></div>
      
      <!-- Step 1 -->
      <div class="relative mb-16">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 md:pr-12 mb-6 md:mb-0 md:text-right">
            <h3 class="text-2xl text-[#D5BA7F] font-medium mb-3">Initial Consultation</h3>
            <p class="text-gray-300">
              We begin with a thorough consultation to understand your needs and preferences.
              This can be conducted via phone, video call, or in person with the funeral director or family.
            </p>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-xl font-semibold z-10 mx-4">1</div>
          <div class="md:w-1/2 md:pl-12 md:text-left hidden md:block">
            <!-- Empty for layout -->
          </div>
        </div>
      </div>
      
      <!-- Step 2 -->
      <div class="relative mb-16">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 md:pr-12 mb-6 md:mb-0 hidden md:block md:text-right">
            <!-- Empty for layout -->
          </div>
          <div class="w-12 h-12 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-xl font-semibold z-10 mx-4">2</div>
          <div class="md:w-1/2 md:pl-12">
            <h3 class="text-2xl text-[#D5BA7F] font-medium mb-3">Pre-Event Setup</h3>
            <p class="text-gray-300">
              Our team arrives early to set up discreet camera and audio equipment. 
              We coordinate with venue staff to ensure minimal disruption while 
              maintaining optimal recording positions.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Step 3 -->
      <div class="relative mb-16">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 md:pr-12 mb-6 md:mb-0 md:text-right">
            <h3 class="text-2xl text-[#D5BA7F] font-medium mb-3">Live Streaming</h3>
            <p class="text-gray-300">
              During the service, we manage multiple camera angles with professional audio 
              capture. Remote family and friends receive a private streaming link to view
              the service in real-time from anywhere in the world.
            </p>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-xl font-semibold z-10 mx-4">3</div>
          <div class="md:w-1/2 md:pl-12 md:text-left hidden md:block">
            <!-- Empty for layout -->
          </div>
        </div>
      </div>
      
      <!-- Step 4 -->
      <div class="relative">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 md:pr-12 mb-6 md:mb-0 hidden md:block md:text-right">
            <!-- Empty for layout -->
          </div>
          <div class="w-12 h-12 rounded-full bg-[#D5BA7F] text-black flex items-center justify-center text-xl font-semibold z-10 mx-4">4</div>
          <div class="md:w-1/2 md:pl-12">
            <h3 class="text-2xl text-[#D5BA7F] font-medium mb-3">Post-Service Delivery</h3>
            <p class="text-gray-300">
              After the service, we professionally edit the recording and deliver a permanent 
              keepsake video. This can be shared with family and friends who were unable to 
              attend or wish to revisit the memorial.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="content-section mt-16">
    <h2 class="section-title">Technical Overview</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
      <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20">
        <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Equipment</h3>
        <p>
          We use professional-grade cameras, microphones, and streaming equipment 
          to ensure high-quality video and audio capture.
        </p>
      </div>
      
      <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20">
        <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Streaming Platform</h3>
        <p>
          Our custom streaming platform provides secure, reliable access for remote 
          viewers across all devices and internet connections.
        </p>
      </div>
      
      <div class="bg-zinc-900 p-6 rounded-lg border border-[#D5BA7F]/20">
        <h3 class="text-xl text-[#D5BA7F] font-medium mb-4">Backup Systems</h3>
        <p>
          Multiple redundancies in our recording and streaming setup ensure that 
          no moment is missed, even in the event of technical issues.
        </p>
      </div>
    </div>
  </section>

  <div class="mt-12 text-center">
    <a href="/schedule-now" class="gold-btn inline-block">
      Schedule Your Service
    </a>
  </div>
</PageLayout>