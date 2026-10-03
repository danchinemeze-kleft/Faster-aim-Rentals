export type Faq = { category: string; question: string; brief: string; detail: string };

export const FAQS: Faq[] = [
  {
    "category": "About",
    "question": "What is Mr. Rent?",
    "brief": "An AI-powered property marketplace for Nigeria where you find rentals and properties without the scams.",
    "detail": "Mr. Rent (rent.fasteraim.com) is a property platform by Faster Aim Technology Limited, a CAC-registered AI technology company. It combines a smart AI assistant, verified listings and secure payments, so you can search, talk to the AI, and connect with property owners safely. The goal is freedom to rent or buy however you want, genuinely and safely."
  },
  {
    "category": "About",
    "question": "Who is Mr. Rent for?",
    "brief": "Tenants, buyers, landlords, property owners, agents and anyone who wants to earn by referring others.",
    "detail": "<ul><li><b>Tenants and buyers</b> search and chat with the AI to find suitable homes.</li><li><b>Landlords and owners</b> list properties and reach serious seekers.</li><li><b>Agents</b> showcase listings to a wider audience.</li><li><b>Affiliates and community members</b> earn commissions and rewards.</li></ul>"
  },
  {
    "category": "About",
    "question": "How is Mr. Rent different from other property sites?",
    "brief": "Verification, an AI assistant that talks to you like a valued client, and a built-in rewards system.",
    "detail": "Instead of a plain list of ads, you can describe what you need in normal language and the AI helps narrow it down. Mr. Rent is built around trust: listings can be verified, payments go through Paystack, and the AI treats every user with high-class respect. On top of that, you earn Fastoken just for being an active, genuine member."
  },
  {
    "category": "Finding",
    "question": "How do I search for a property?",
    "brief": "Use Browse, or chat with the Mr. Rent AI on the Search page.",
    "detail": "The <b>Browse</b> page lets you scan listings. The <b>Search</b> page is the Mr. Rent AI chat: tell it your location, budget, type of property and must-haves, and it suggests matching options. The more detail you give, the better the results.Tip: the chat keeps your recent conversation for a few days, so you can come back and continue."
  },
  {
    "category": "Finding",
    "question": "What can the Mr. Rent AI do?",
    "brief": "Understand your needs, suggest properties and explain price and area context in plain language.",
    "detail": "The assistant is powered by Google's Gemini and draws on publicly available information about Nigerian areas, amenities, development and current market trends. You can ask about neighbourhoods, what to expect for a budget, or how to approach a rental. House search with the AI is free."
  },
  {
    "category": "Finding",
    "question": "Is the AI price information accurate?",
    "brief": "It is a guide based on features and current trends, not a guarantee.",
    "detail": "Prices vary by street, condition, season and negotiation. The AI's figures reflect common market expectations and the property's features, but the owner's asking price is what finally counts. Always inspect in person and confirm before paying.Mr. Rent's AI is an evaluation service and is not investment or legal advice."
  },
  {
    "category": "Finding",
    "question": "How do I contact a property owner?",
    "brief": "Reveal the contact for a one-time fee of ₦5,000 per property.",
    "detail": "Pay once through Paystack and the owner's contact is unlocked for that property. The fee keeps the platform free from spam and time-wasters, and helps owners get serious enquiries.<div class='note'>Pricing may be adjusted as the platform grows. The current price is always shown before you pay.</div>"
  },
  {
    "category": "Safety",
    "question": "How does Mr. Rent protect me from scams?",
    "brief": "Verification, secure payments and strong database security.",
    "detail": "Listings can go through document verification, payments are processed securely by Paystack, and user data is protected with strict database access rules. Still, never send money to anyone before seeing the property, and report suspicious listings to the Mr. Rent team."
  },
  {
    "category": "Safety",
    "question": "What is Veryland?",
    "brief": "Our document verification system. It is coming soon.",
    "detail": "Veryland uses AI to check property documents and an admin approval panel confirms them. Verified properties will carry a trust mark. It is being rolled out in stages, so the launch will be announced on the platform."
  },
  {
    "category": "Safety",
    "question": "Is my payment safe?",
    "brief": "Yes. All payments go through Paystack.",
    "detail": "Mr. Rent does not store your card details. Paystack handles the transaction, and our system confirms the payment before unlocking a contact or activating a subscription. Keep your payment receipt in case you need support."
  },
  {
    "category": "Landlords",
    "question": "How do I list a property?",
    "brief": "Create an account, open the List page and fill in your property details.",
    "detail": "Add photos, location, price, type, features and a clear description. Good photos and honest details attract better enquiries. Your listing then becomes visible to people searching on Mr. Rent and via the AI."
  },
  {
    "category": "Landlords",
    "question": "Is listing free?",
    "brief": "Yes. You can list 2 properties free.",
    "detail": "<ul><li>First 2 properties: <b>free</b>.</li><li>More than 2: landlord subscription of <b>₦10,000 per month</b> via Paystack.</li></ul>Manage everything from your Dashboard.<div class='note'>We are always reviewing pricing to keep Mr. Rent fair for landlords and tenants.</div>"
  },
  {
    "category": "Landlords",
    "question": "How do I get more enquiries?",
    "brief": "Complete your profile, use good photos, price realistically and get verified.",
    "detail": "Respond quickly, keep availability up to date, and earn positive reviews. Active, genuine users also earn Fastoken, and you can invite other landlords and seekers through your affiliate link for commissions."
  },
  {
    "category": "Account",
    "question": "How do I create an account?",
    "brief": "Sign up with email or continue with Google.",
    "detail": "Registration takes a minute. After signing up, visit My Account to update your profile, add a profile image (which can earn Fastoken), and view your reveals, listings and rewards."
  },
  {
    "category": "Account",
    "question": "Does the AI remember me?",
    "brief": "It keeps your recent chat thread for around 3 days.",
    "detail": "This lets you continue a search without repeating your location and preferences. Old conversations are cleared to keep the service fast and storage-efficient."
  },
  {
    "category": "Affiliate",
    "question": "How does the affiliate programme work?",
    "brief": "Share your link and earn cash commissions when people you refer pay.",
    "detail": "<div class='tw'><table><tr><th>Referral action</th><th>You earn</th></tr><tr><td>Someone you referred pays the ₦5,000 contact reveal</td><td>₦500</td></tr><tr><td>A landlord you referred subscribes (₦10,000/month)</td><td>₦2,000</td></tr></table></div>Track your referrals in the affiliate dashboard."
  },
  {
    "category": "Affiliate",
    "question": "How do I get paid commissions?",
    "brief": "Commissions accumulate in your affiliate dashboard and are paid out per the programme terms.",
    "detail": "Make sure your account details are correct. Referrals must be genuine users; fake or self-referral abuse can lead to disqualification."
  },
  {
    "category": "Rewards",
    "question": "What is Fastoken?",
    "brief": "A reward token you earn for genuine activity and invitations on Mr. Rent.",
    "detail": "Fastoken (called Fastcoin in some places) is Mr. Rent's engagement reward. Its purpose is to thank you for using and growing the platform. You earn it from meaningful actions and referrals, and it builds up towards Alpha, the payout unit.<div class='note'>Fastoken is a platform reward, not an investment, and it cannot be cashed out directly.</div>"
  },
  {
    "category": "Rewards",
    "question": "How do I earn Fastoken?",
    "brief": "Invite friends and take meaningful actions such as sharing, reviewing and listing.",
    "detail": "<ul><li><b>Invite friends:</b> 1,000 Fastoken (₦100 value) per signup.</li><li><b>Meaningful actions:</b> sharing, commenting, liking, browsing, chatting with Mr. Rent, rating, uploading a profile image, receiving a positive review, listing property, revealing a contact and visiting external links.</li><li><b>Quality reviews:</b> post varied, original reviews, not repeated text.</li></ul>Simple spam clicking does not earn rewards. The system rewards real engagement, and rewards are tiered to resist bots."
  },
  {
    "category": "Rewards",
    "question": "What is Alpha and how does Fastoken convert?",
    "brief": "Alpha is the payout unit. 40,000 Fastoken = 1 Alpha = ₦4,000.",
    "detail": "<div class='tw'><table><tr><th>Unit</th><th>Value</th></tr><tr><td>40,000 Fastoken</td><td>1 Alpha</td></tr><tr><td>1 Alpha</td><td>₦4,000</td></tr><tr><td>1,000 Fastoken</td><td>₦100</td></tr></table></div>Fastoken converts to Alpha once you reach 40,000. Only Alpha can be turned into money."
  },
  {
    "category": "Rewards",
    "question": "How does the Alpha payout work?",
    "brief": "Once you hold Alpha, you can request a payout or keep saving it.",
    "detail": "Reach 40,000 Fastoken to get 1 Alpha, then choose to cash out its Naira value or hold your Alpha. Buying Alpha directly is not allowed; it must be earned. Payout requests are reviewed to confirm genuine activity, and the exact payout method and timeline are shown in the rewards section of your account.<div class='note'>Mr. Rent plans to make Alpha tradable in future, after the required registration. Any future value is not guaranteed.</div>"
  },
  {
    "category": "Rewards",
    "question": "Can I save my Alpha instead of cashing out?",
    "brief": "Yes. Holding is optional and entirely your choice.",
    "detail": "Affiliates and members can keep their Alpha in their account. Some members prefer to hold as Mr. Rent expands and rewards become more valuable in the future, but no price increase is promised."
  },
  {
    "category": "Rewards",
    "question": "Is there a limit or any rule against cheating?",
    "brief": "Yes. Fake accounts, bots, repeated content and self-referrals are not allowed.",
    "detail": "Accounts found abusing the system can lose rewards or be suspended. Rewards are tiered, and quality-based actions are valued over quantity. The reward terms may be updated, and any changes are published on the platform."
  },
  {
    "category": "Pro",
    "question": "What is Mr. Rent Pro?",
    "brief": "A paid tier for deeper market insight and investment-style questions.",
    "detail": "House search stays free. Pro is for advanced questions such as price evaluation, area investment insight and market intelligence. The AI weighs the property's features, checks current online information and gives an assessment.<div class='note'>Pro is planned as flexible, consumable tokens (like AI usage credits) rather than a heavy flat subscription. It is an evaluation service, not investment advice.</div>"
  },
  {
    "category": "Support",
    "question": "Why can't I see my payment, reveal or reward?",
    "brief": "Refresh, check your account page, then contact support with your payment reference.",
    "detail": "Most delays resolve in minutes. If a payment was debited but not reflected, share your Paystack reference so the team can verify it."
  },
  {
    "category": "Support",
    "question": "Is there a mobile app?",
    "brief": "A Google Play listing is being considered.",
    "detail": "For now Mr. Rent works well in your phone browser. App availability will be announced on the website and our social pages."
  }
];