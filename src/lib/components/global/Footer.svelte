<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<!-- Footer Section -->
<footer class="bg-gray-900 text-gray-300 py-16 sm:py-20">
    <div class="container mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
        <!-- Logo and Brief Description -->
        <div class="flex flex-col items-center md:items-start">
            <!-- Logo -->
            <a href="https://tributestream.com" class="text-2xl font-bold text-white hover:text-brand-gold transition-colors duration-200 mb-4 inline-block">
                <span class="tributestream">
                    <i>Tributestream</i><span class="r-symbol">®</span>
                </span>
            </a>
            <!-- Brief Description -->
            <p class="text-sm text-gray-400 mt-4 leading-relaxed">
                Tributestream is a premier, affordable, and reliable livestreaming service to transport your families and friends to a celebration of life. We don't make videos, we make documentaries.
            </p>
            <!-- Funeral Director Form Link -->
            <a 
                href="/fd-form"
                class="text-brand-gold hover:text-white mt-6 text-sm font-medium hover:underline transition-colors duration-200"
            >
                Funeral Director Form
            </a>
        </div>

        <!-- Coverage Locations List -->
        <div>
            <h3 class="text-md font-semibold text-gray-200 uppercase tracking-wider mb-5">COVERAGE LOCATIONS</h3>
            <p class="text-sm text-gray-400 leading-relaxed mb-2">
                Orange, Lake, Osceola, Seminole, Marion, Sumter, Volusia, Flagler, and Brevard counties.
            </p>
            <p class="text-sm text-gray-400 leading-relaxed mt-4 mb-2">Please call if your location is not listed:</p>
            <p class="text-sm text-gray-400 leading-relaxed mb-2">+1 (407) 221-5922</p>
            <p class="text-sm text-gray-400 leading-relaxed mb-2">Contact@tributestream.com</p>
        </div>

        <!-- Office Hours -->
        <div>
            <h3 class="text-md font-semibold text-gray-200 uppercase tracking-wider mb-5">Office Hours</h3>
            <p class="text-sm text-gray-400 leading-relaxed mb-2">
                Monday – Friday:<br>10:00AM – 5:00PM EST
            </p>
            <p class="text-sm text-gray-400 leading-relaxed mt-4 mb-2">
                Saturday – Sunday:<br>12:00PM – 5:00PM EST
            </p>
            <h3 class="text-md font-semibold text-gray-200 uppercase tracking-wider mt-8 mb-5">After Hours</h3>
            <p class="text-sm text-gray-400 leading-relaxed mb-2">
                If you need to contact us after hours, feel free to reach out via text or email.
            </p>
        </div>

        <!-- Review Us on Google Section -->
        <div>
            <h3 class="text-md font-semibold text-gray-200 uppercase tracking-wider mb-5">REVIEW US ON GOOGLE</h3>
            <p class="text-sm text-gray-400 leading-relaxed mb-4">
                If you appreciated the service we provided you and your family, please consider leaving us a five-star review on Google!
            </p>
            <!-- Button for Reviewing on Google -->
            <a 
                href="https://g.page/r/CT2e1k0NJGeKEAE/review"
                class="bg-brand-gold text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_var(--color-brand-gold)] transition-all duration-300 ease-in-out inline-block"
            >
                Review Us
            </a>
        </div>
    </div>

    <!-- Footer Copyright -->
    <div class="border-t border-gray-700 mt-12 pt-8">
        <p class="text-center text-sm text-gray-500">
            © 2019-2025 All rights reserved | Tributestream is a Registered Trademark
        </p>
    </div>
</footer>