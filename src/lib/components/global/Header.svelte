<script lang="ts">
<<<<<<< HEAD
    let button = "bg-brand-gold text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_var(--color-brand-gold)] transition-all duration-300 ease-in-out";
    let mobileMenuOpen = $state(false);
=======
    let button = "bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out";
   
>>>>>>> parent of ef35d37 (hmm)
   </script>
   
   <!-- Header Section -->
   <header class="bg-black text-white">
       <div class="container mx-auto flex justify-between items-center py-4 px-4">
         <!-- Logo -->
<<<<<<< HEAD
         <a href="https://tributestream.com" class="text-2xl font-bold text-gray-100 hover:text-brand-gold transition-colors duration-200">
=======
         <a href="https://tributestream.com" class="text-xl text-white">
>>>>>>> parent of ef35d37 (hmm)
           <span class="tributestream">
             <i>Tributestream</i><span class="r-symbol">®</span>
           </span>
         </a>
         <!-- Navigation Menu -->
         <!-- On larger screens, show the menu items -->
         <nav class="hidden md:block">
           <ul class="flex space-x-4 items-center">
             <!-- Navigation Links -->
             <li>
<<<<<<< HEAD
               <a href="/why-tributestream" class="text-gray-300 hover:text-brand-gold transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
=======
               <a href="/why-tributestream" class="text-white hover:text-[#D5BA7F]">
>>>>>>> parent of ef35d37 (hmm)
                 Why Tributestream?
               </a>
             </li>
             <li>
<<<<<<< HEAD
               <a href="/how-does-it-work" class="text-gray-300 hover:text-brand-gold transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
=======
               <a href="/how-does-it-work" class="text-white hover:text-[#D5BA7F]">
>>>>>>> parent of ef35d37 (hmm)
                 How Does It Work?
               </a>
             </li>
             <li>
<<<<<<< HEAD
                <a href="/contact-us" class="text-gray-300 hover:text-brand-gold transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
=======
                <a href="/contact-us" class="text-white hover:text-[#D5BA7F]">
>>>>>>> parent of ef35d37 (hmm)
                 Contact Us
               </a>
             </li>
             <li>
<<<<<<< HEAD
               <a href="/schedule-now" class="text-gray-300 hover:text-brand-gold transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
=======
               <a href="/schedule-now" class="text-white hover:text-[#D5BA7F]">
>>>>>>> parent of ef35d37 (hmm)
                 Schedule Now
               </a>
             </li>
             <li>
               <a href="/my-portal" class={button}>
                 My Portal
               </a>
             </li>
             <li>
    
             </li>
           </ul>
         </nav>
<<<<<<< HEAD
         <!-- Mobile Menu Button -->
         <div class="md:hidden">
           <button on:click={() => mobileMenuOpen = !mobileMenuOpen} aria-label="Open navigation menu" class="text-gray-100 focus:outline-none p-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-brand-gold">
             {#if mobileMenuOpen}
               <!-- X Icon SVG -->
               <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             {:else}
               <!-- Hamburger Icon SVG -->
               <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
               </svg>
             {/if}
           </button>
         </div>
       </div>
       <!-- Mobile Navigation Menu -->
       {#if mobileMenuOpen}
       <nav class="md:hidden absolute top-16 left-0 right-0 bg-gray-900 p-4 space-y-2 z-50 border-t border-gray-700">
         <ul class="flex flex-col space-y-2">
           <li><a href="/why-tributestream" class="block py-2 px-4 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-brand-gold rounded-md">Why Tributestream?</a></li>
           <li><a href="/how-does-it-work" class="block py-2 px-4 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-brand-gold rounded-md">How Does It Work?</a></li>
           <li><a href="/contact-us" class="block py-2 px-4 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-brand-gold rounded-md">Contact Us</a></li>
           <li><a href="/schedule-now" class="block py-2 px-4 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-brand-gold rounded-md">Schedule Now</a></li>
           <li><a href="/my-portal" class="block w-full text-center {button} mt-2">My Portal</a></li>
         </ul>
       </nav>
     {/if}
   </header>
=======
    
       </div>
   </header>
   
   
>>>>>>> parent of ef35d37 (hmm)
