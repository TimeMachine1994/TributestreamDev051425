<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="dashboard-footer">
  <div class="container">
    <div class="copyright">
      &copy; {currentYear} TributeStream. All rights reserved.
    </div>
    
    <div class="links">
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms-of-service">Terms of Service</a>
      <a href="/contact-us">Contact Us</a>
    </div>
  </div>
</footer>

<style>
  .dashboard-footer {
    background-color: #f5f5f5;
    padding: 1rem 0;
    border-top: 1px solid #e0e0e0;
    margin-top: auto;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .copyright {
    font-size: 0.875rem;
    color: #666;
  }
  
  .links {
    display: flex;
    gap: 1.5rem;
  }
  
  .links a {
    font-size: 0.875rem;
    color: #666;
    text-decoration: none;
  }
  
  .links a:hover {
    color: #333;
    text-decoration: underline;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .links {
      gap: 1rem;
    }
  }
</style>