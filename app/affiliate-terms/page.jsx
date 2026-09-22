'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AffiliateTermsPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleAgree = () => {
    if (agreed) {
      // Navigate back or to the affiliate dashboard/signup page
      router.push('/affiliate')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            MR. RENT AFFILIATE PROGRAM
          </h1>
          <p className="text-emerald-400 font-medium mt-2 text-sm sm:text-base">
            TERMS OF SERVICE & PRIVACY POLICY
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
          
          {/* Definitions */}
          <section className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/60">
            <h2 className="text-lg font-semibold text-white mb-3">DEFINITIONS</h2>
            <ul className="space-y-2">
              <li><strong className="text-slate-200">"Company," "we," "our," "us"</strong> — Faster Aim Technology.</li>
              <li><strong className="text-slate-200">"The App," "the Platform," "it"</strong> — Mr. Rent, and any associated programs including this affiliate program.</li>
              <li><strong className="text-slate-200">"You," "your," "User"</strong> — the individual who has signed up to participate in this affiliate program.</li>
              <li><strong className="text-slate-200">"Client"</strong> — any person who signs up on Mr. Rent using your referral link.</li>
            </ul>
          </section>

          {/* Terms */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">TERMS</h2>

            <div>
              <h3 className="font-semibold text-white mb-1">1. Changes to these terms</h3>
              <p>We may update or partially amend these terms at any time, without prior notice. You are responsible for periodically reviewing this page, particularly when notified of a policy change.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">2. Eligibility</h3>
              <p>You must be at least 14 years old, and you must have lawful ownership or authorization over the device and personal data used to access Mr. Rent and this program.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">3. Dashboard</h3>
              <p>Your dashboard displays your performance statistics, including the number of people who signed up using your referral link. These signups alone do not generate earnings — only signups who go on to make an actual payment do.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">4. How you earn</h3>
              <p>You earn only when someone you referred actually uses Mr. Rent by making a real payment — either to list a property for rent or to reveal a property owner's contact details.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">5. Who can participate</h3>
              <p>Both landlords and tenants may participate in this program.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">6. No self-referrals</h3>
              <p>You will not earn by signing up through your own referral link.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">7. Prohibited conduct</h3>
              <p>You may not sell or transfer your account, referral link, or any promo code issued to you by the Company. Violations may result in immediate account termination and may expose you to legal action.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">8. Deductions</h3>
              <p>No deductions apply to your qualifying earnings at payout, other than applicable taxes.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">9. Dashboard terminology</h3>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li><strong className="text-slate-200">Invites</strong> — the number of people who signed up using your referral link.</li>
                <li><strong className="text-slate-200">Leads</strong> — invites who have not yet made a payment.</li>
                <li><strong className="text-slate-200">Earnings</strong> — the total amount you have earned from invites who made a qualifying payment.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">10. Payout threshold</h3>
              <p>You must accumulate at least ₦50,000 in qualifying earnings before you can request a payout. This threshold may change in the future.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">11. Accurate information</h3>
              <p>You must provide accurate personal information to participate in this program, so that we can serve and pay you correctly.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">12. Data privacy</h3>
              <p>Your personal data will never be sold or transferred to any third party for commercial or unrelated purposes.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">13. Payout method</h3>
              <p>We currently pay out to Nigerian bank accounts only.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1">14. Agreement</h3>
              <p>By checking the box below, you confirm that you have read and agree to this Terms of Service and Privacy Policy, and you authorize us to access, view, modify, and transfer your information as necessary to accurately deliver the services promised under this program.</p>
            </div>

          </section>
        </div>

        {/* Agreement Action Section */}
        <div className="mt-10 pt-8 border-t border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <span className="text-slate-300 text-sm sm:text-base group-hover:text-white transition-colors">
              I have read and agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAgree}
              disabled={!agreed}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                agreed
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
