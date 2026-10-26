{/* Footer */}
<footer style={s.footer}>
  <div style={s.footerCard} className="site-footer">
    <div style={s.footerTop}>
      <div style={{ ...s.navBrand, marginBottom: '0.5rem' }} className="footer-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Mr. Rent
      </div>
      <p style={s.footerTagline} className="footer-text">Find or list property for rent across Nigeria, quickly and securely.</p>
    </div>
    <div style={s.footerGrid} className="footer-grid">
      <div>
        <p style={s.footerHeading} className="footer-heading">Explore</p>
        <a href="/browse" className="footer-link" style={s.footerLink}>Browse Rentals</a>
        <a href="/list" className="footer-link" style={s.footerLink}>List Property</a>
        <a href="/veryland" className="footer-link" style={s.footerLink}>Verified Properties</a>
        <a href="/services" className="footer-link" style={s.footerLink}>Our Services</a>
        <a href="/search" className="footer-link" style={s.footerLink}>AI Chat Assistant</a>
      </div>
      <div>
        <p style={s.footerHeading} className="footer-heading">Company</p>
        <a href="/about" className="footer-link" style={s.footerLink}>About Us</a>
        <a href="/support" className="footer-link" style={s.footerLink}>Contact &amp; Support</a>
        <a href="/faq" className="footer-link" style={s.footerLink}>FAQ</a>
        <a href="/affiliate" className="footer-link" style={s.footerLink}>Earn with Referrals</a>
        <a href="/all-pages" className="footer-link" style={s.footerLink}>All Pages</a>
      </div>
      <div>
        <p style={s.footerHeading} className="footer-heading">Legal</p>
        <a href="/privacy-policy" className="footer-link" style={s.footerLink}>Privacy Policy</a>
        <a href="/terms" className="footer-link" style={s.footerLink}>Terms of Service</a>
      </div>
    </div>
    <div style={s.footerBottom} className="footer-bottom">
      <span>© {new Date().getFullYear()} Mr. Rent. All rights reserved.</span>
    </div>
  </div>
</footer>
      
  
