'use client'

import Breadcrumb from '../components/Breadcrumb'

export default function PrivacyPolicy() {
  return (
    <div className="faim-legal-page">
      <div className="faim-legal-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/browse' }, { label: 'Privacy Policy', href: '/privacy-policy' }]} />
        <h1>Privacy Policy</h1>
        <p className="faim-last-updated">Last updated: November 2026</p>

        <p>Faster Aim Technology Limited (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), a company registered in Nigeria, operates the Mr. Rent website at <strong>rent.fasteraim.com</strong> and the Mr. Rent mobile app for Android (together, the &ldquo;Platform&rdquo;). This Privacy Policy explains what personal information we collect, why we collect it, who we share it with, and the choices you have. It applies to the website and the app.</p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Account information:</strong> your name, email address and phone number when you register. If you sign in with Google, we receive your name and email from Google.</li>
          <li><strong>Listing information:</strong> property details, location, photos and pricing submitted by landlords and owners.</li>
          <li><strong>Photos and camera:</strong> if you choose to take or upload a photo in the app (for example a property photo), the app asks for permission to use your camera or photos. We only access them when you use that feature.</li>
          <li><strong>Payment records:</strong> transaction references, amounts and dates for payments made through Paystack. We do not see or store your card number or PIN.</li>
          <li><strong>Affiliate details:</strong> if you join our affiliate programme, your bank name, account number and account name, so we can pay your commission. This is only collected from affiliates.</li>
          <li><strong>Referral information:</strong> if you arrive through a referral link, we save the referral code in a cookie for up to 30 days and record which affiliate referred you.</li>
          <li><strong>Usage data and AI chat:</strong> pages visited, search queries and the messages you send to the Mr. Rent AI assistant.</li>
          <li><strong>Device and performance data:</strong> basic technical data such as device type, browser and page speed, collected through analytics. If you turn on notifications, a device token is created so we can send them to your phone.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and manage your account and keep you signed in</li>
          <li>To process payments for subscriptions and contact reveals</li>
          <li>To connect tenants with landlords and show property listings</li>
          <li>To answer your questions through the Mr. Rent AI assistant</li>
          <li>To calculate and pay affiliate commissions</li>
          <li>To send important service messages and, if you allow them, push notifications</li>
          <li>To keep the Platform secure, prevent fraud and improve performance</li>
        </ul>
        <p>We do not use your data for advertising, and we do not show third-party ads.</p>

        <h2>3. Services and Features</h2>
        <p>Here is how your information is used in each part of Mr. Rent.</p>
        <ul>
          <li><strong>Listings (rent, sale and short-let):</strong> landlords and owners publish property details, photos and prices, which other users can see. Some listings, such as property sales, have an activation fee after we review them.</li>
          <li><strong>Contact reveals and Tenant Pass:</strong> tenants can pay to reveal a landlord&apos;s contact one property at a time, or buy a 30-day pass. We save the payment record and which contacts you unlocked.</li>
          <li><strong>Landlord subscription:</strong> landlords can subscribe to list more properties. We save the subscription dates, status and payment record.</li>
          <li><strong>Mr. Rent AI assistant:</strong> you describe what you want and the assistant suggests matching listings. Your messages are processed by an AI service (see Section 4).</li>
          <li><strong>Veryland document check:</strong> documents you upload for verification are checked with AI tools and reviewed by our admin team. We use them to verify the property, and verified listings can carry a trust mark. Only upload documents you have the right to share.</li>
          <li><strong>Reviews and support messages:</strong> reviews you post may be shown on the Platform. Messages you send to our support team are used to reply to you.</li>
          <li><strong>Sharing:</strong> if you share a listing or your referral link through another app such as WhatsApp, that app&apos;s own privacy policy applies. We do not access your contacts. If someone signs up through your referral link, we record that the signup came from your code.</li>
          <li><strong>Affiliate programme:</strong> you can join to earn commission when people you refer pay on the Platform. We create your referral code and link. When a referred person pays, we record a commission against your account (currently &#8358;500 for a contact reveal and &#8358;2,000 for a landlord or tenant subscription). Commissions show as pending in your balance page, and you can request a payout once your available balance reaches &#8358;5,000. We review each request and pay it to the bank account saved on your affiliate profile. You cannot earn commission on your own payments, and we may cancel commissions that come from fraud or abuse. The full rules are in our <a href="/affiliate-terms">Affiliate Terms</a>.</li>
        </ul>

        <h2>4. Who We Share Data With</h2>
        <p>We do not sell your personal data. We share it only with the service providers that help us run the Platform:</p>
        <ul>
          <li><strong>Paystack</strong> &mdash; payment processing.</li>
          <li><strong>Supabase</strong> &mdash; secure database, sign-in and file storage.</li>
          <li><strong>Google</strong> &mdash; sign-in (if you choose Google sign-in), delivery of push notifications to Android devices, and the Gemini AI service that generates answers for the Mr. Rent AI assistant. Messages you type into the AI chat are sent to Google for this purpose, so please do not enter sensitive personal information in the chat.</li>
          <li><strong>Vercel</strong> &mdash; website hosting and anonymous analytics and performance measurement.</li>
        </ul>
        <p>We may also disclose information if the law requires it, or to protect the rights and safety of our users and our Platform.</p>

        <h2>5. Contact Reveals</h2>
        <p>When a tenant pays to reveal a landlord&apos;s contact, the landlord&apos;s phone number is shared with that tenant only. It is not shared with any other third party. Listings you publish, including photos, location and price, are visible to other users of the Platform.</p>

        <h2>6. Data Safety Summary</h2>
        <p>This table summarises the data the app handles, in the same way as the Google Play Data safety section.</p>
        <div className="faim-table-wrap">
          <table className="faim-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Collected</th>
                <th>Shared with</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name, email, phone number</td>
                <td>Yes</td>
                <td>Supabase, Google (sign-in only)</td>
                <td>Account and contact between users</td>
              </tr>
              <tr>
                <td>Listing details and photos</td>
                <td>Yes (landlords)</td>
                <td>Shown publicly on the Platform</td>
                <td>Property listings</td>
              </tr>
              <tr>
                <td>Payment records (no card details)</td>
                <td>Yes</td>
                <td>Paystack</td>
                <td>Payments and receipts</td>
              </tr>
              <tr>
                <td>Documents uploaded for Veryland checks</td>
                <td>Only if you use Veryland</td>
                <td>AI service providers and our admin team</td>
                <td>Verifying properties</td>
              </tr>
              <tr>
                <td>Reviews and support messages</td>
                <td>Only if you send them</td>
                <td>Reviews may be shown on the Platform</td>
                <td>Feedback and customer support</td>
              </tr>
              <tr>
                <td>Referral code and commission records</td>
                <td>Affiliates and referred users</td>
                <td>Not shared with other users</td>
                <td>Tracking and paying commission</td>
              </tr>
              <tr>
                <td>Bank account details</td>
                <td>Affiliates only</td>
                <td>Not shared with other users</td>
                <td>Paying commissions</td>
              </tr>
              <tr>
                <td>Search queries and AI chat messages</td>
                <td>Yes</td>
                <td>Google (Gemini AI)</td>
                <td>Answers and improving the service</td>
              </tr>
              <tr>
                <td>Device and performance data</td>
                <td>Yes</td>
                <td>Vercel</td>
                <td>Analytics and performance</td>
              </tr>
              <tr>
                <td>Push notification token</td>
                <td>Only if you allow notifications</td>
                <td>Google</td>
                <td>Sending notifications</td>
              </tr>
              <tr>
                <td>Camera and photos</td>
                <td>Only when you use the feature</td>
                <td>Not shared unless you upload them to a listing</td>
                <td>Taking or uploading property photos</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>All data is encrypted in transit. We do not access your contacts, text messages or call history.</p>

        <h2>7. App Permissions</h2>
        <ul>
          <li><strong>Camera / photos:</strong> to take or choose property photos. Optional.</li>
          <li><strong>Notifications:</strong> to alert you about activity on your account. Optional, and you can turn them off in your phone settings at any time.</li>
          <li><strong>Internet access:</strong> needed for the app to work.</li>
        </ul>

        <h2>8. Data Security</h2>
        <p>We use encryption in transit, access controls and secure hosting to protect your data. Payments are handled by Paystack. No method of transmission or storage is completely secure, but we work to protect your information and to fix problems quickly.</p>

        <h2>9. How Long We Keep Data</h2>
        <p>We keep your account information while your account is active. If you delete your account, we delete or anonymise your personal data, except for records we must keep by law, such as payment and tax records, and information needed to prevent fraud or settle disputes.</p>

        <h2>10. Deleting Your Account and Data</h2>
        <p>You can delete your account and the data linked to it at any time:</p>
        <ul>
          <li><strong>In the app or on the website:</strong> use the Delete account option in your account settings.</li>
          <li><strong>By email:</strong> write to <strong>hello@fasteraim.com</strong> from the email address on your account and ask us to delete it. We will confirm and complete the request within a reasonable time.</li>
        </ul>

        <h2>11. Your Rights</h2>
        <p>Under the Nigeria Data Protection Act 2023 and other applicable laws, you may ask us to access, correct or delete your personal data, to restrict or object to how we use it, and to receive a copy of it. Contact us at <strong>hello@fasteraim.com</strong> to use these rights. You also have the right to complain to the Nigeria Data Protection Commission.</p>

        <h2>12. Cookies and Similar Technologies</h2>
        <p>We use essential cookies and local storage to keep you signed in and remember your session, and a referral cookie that lasts up to 30 days. We use anonymous analytics to understand how the Platform performs. We do not use advertising cookies.</p>

        <h2>13. Children</h2>
        <p>Mr. Rent is intended for people aged 18 and over. It is not directed at children, and we do not knowingly collect personal data from anyone under 18. If you believe a child has given us personal data, contact us and we will delete it.</p>

        <h2>14. Where Your Data Is Processed</h2>
        <p>Our service providers may process data on servers outside Nigeria. When this happens, we rely on providers that apply appropriate safeguards for your information.</p>

        <h2>15. Changes to This Policy</h2>
        <p>We may update this policy from time to time. The date at the top shows when it last changed. For significant changes we will notify you by email or with a notice on the Platform.</p>

        <h2>16. Contact Us</h2>
        <p>For privacy questions or requests, contact us at:<br />
        <strong>Faster Aim Technology Limited</strong><br />
        Awka, Anambra State, Nigeria<br />
        Email: hello@fasteraim.com</p>
      </div>

      <style>{`
        .faim-legal-page {
          background: #f0ede8;
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 40px 16px;
        }
        .faim-legal-container {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 40px;
          border-top: 3px solid #14B8A6;
          outline: 1.5px solid #0ef6cc;
          outline-offset: -5px;
        }
        .faim-back-link {
          color: #14B8A6;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 24px;
        }
        .faim-back-link:hover { text-decoration: underline; }
        h1 {
          font-size: 2rem;
          color: #080a0f;
          margin-bottom: 4px;
        }
        .faim-last-updated {
          color: #888;
          font-size: 0.8rem;
          margin-bottom: 24px;
        }
        h2 {
          font-size: 1.1rem;
          color: #080a0f;
          margin: 28px 0 10px;
          border-left: 3px solid #0ef6cc;
          padding-left: 10px;
        }
        p { color: #444; line-height: 1.7; margin-bottom: 12px; }
        ul { color: #444; line-height: 1.8; padding-left: 20px; margin-bottom: 12px; }
        li { margin-bottom: 4px; }
        .faim-table-wrap { overflow-x: auto; margin-bottom: 12px; }
        .faim-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          color: #444;
        }
        .faim-table th {
          background: #f0ede8;
          color: #080a0f;
          text-align: left;
          padding: 10px;
          border: 1px solid #ddd;
        }
        .faim-table td {
          padding: 10px;
          border: 1px solid #ddd;
          vertical-align: top;
          line-height: 1.5;
        }
        @media (max-width: 480px) {
          .faim-legal-container { padding: 24px 16px; }
          h1 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  )
}