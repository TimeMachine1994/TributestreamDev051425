<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<!-- Footer Section -->
<footer class="bg-black text-white py-12">
    <div class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
        <!-- Logo and Brief Description -->
        <div class="flex flex-col items-center md:items-start">
            <!-- Logo -->
            <a href="https://tributestream.com" class="text-xl text-white">
                <span class="tributestream">
                    <i>Tributestream</i><span class="r-symbol">®</span>
                </span>
            </a>
            <!-- Brief Description -->
            <p class="text-sm mt-4">
                Tributestream is a premier, affordable, and reliable livestreaming service to transport your families and friends to a celebration of life. We don't make videos, we make documentaries.
            </p>
            <!-- Funeral Director Form Link -->
            <a 
                href="/fd-form"
                class="text-[#D5BA7F] hover:text-white mt-4 text-sm underline transition-colors duration-200"
            >
                Funeral Director Form
            </a>
        </div>

        <!-- Coverage Locations List -->
        <div>
            <h3 class="text-lg font-semibold mb-4">COVERAGE LOCATIONS</h3>
            <p class="text-sm">
                Orange, Lake, Osceola, Seminole, Marion, Sumter, Volusia, Flagler, and Brevard counties.
            </p>
            <p class="text-sm mt-4">Please call if your location is not listed:</p>
            <p class="text-sm">+1 (407) 221-5922</p>
            <p class="text-sm">Contact@tributestream.com</p>
        </div>

        <!-- Office Hours -->
        <div>
            <h3 class="text-lg font-semibold mb-4">Office Hours</h3>
            <p class="text-sm">
                Monday – Friday:<br>10:00AM – 5:00PM EST
            </p>
            <p class="text-sm mt-4">
                Saturday – Sunday:<br>12:00PM – 5:00PM EST
            </p>
            <h3 class="text-lg font-semibold mt-8 mb-4">After Hours</h3>
            <p class="text-sm">
                If you need to contact us after hours, feel free to reach out via text or email.
            </p>
        </div>

        <!-- Review Us on Google Section -->
        <div>
            <h3 class="text-lg font-semibold mb-4">REVIEW US ON GOOGLE</h3>
            <p class="text-sm mb-4">
                If you appreciated the service we provided you and your family, please consider leaving us a five-star review on Google!
            </p>
            <!-- Button for Reviewing on Google -->
            <a 
                href="https://g.page/r/CT2e1k0NJGeKEAE/review"
                class="bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out inline-block"
            >
                Review Us
            </a>
        </div>
    </div>

    <!-- Footer Copyright -->
    <div class="border-t border-gray-700 mt-8 pt-4">
        <p class="text-center text-sm text-gray-500">
            © 2019-2025 All rights reserved | Tributestream is a Registered Trademark
        </p>
    </div>
</footer>