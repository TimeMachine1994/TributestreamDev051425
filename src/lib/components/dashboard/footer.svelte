<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-100 py-4 border-t border-gray-300 mt-auto">
  <div class="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
    <div class="text-sm text-gray-600">
      &copy; {currentYear} TributeStream. All rights reserved.
    </div>
    
    <div class="flex gap-4 md:gap-6">
      <a href="/privacy-policy" class="text-sm text-gray-600 no-underline hover:text-gray-800 hover:underline">Privacy Policy</a>
      <a href="/terms-of-service" class="text-sm text-gray-600 no-underline hover:text-gray-800 hover:underline">Terms of Service</a>
      <a href="/contact-us" class="text-sm text-gray-600 no-underline hover:text-gray-800 hover:underline">Contact Us</a>
    </div>
  </div>
</footer>
