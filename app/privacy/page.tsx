import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      "We collect information you provide directly to us when you create an account, place an order, or contact us for support. This includes your name, email address, mailing address, phone number, and payment information.",
      "We automatically collect certain information when you use our platform, including your IP address, browser type, operating system, referring URLs, device information, and pages visited. We may also collect information through cookies and similar tracking technologies.",
      "If you are a seller on our platform, we also collect information about your farm, including farm name, location, products, and business information necessary to process payments and provide our services.",
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      "We use the information we collect to provide, maintain, and improve our services, process transactions, send order confirmations and updates, and communicate with you about your account and our platform.",
      "We may use your information to send promotional communications about products, farms, and services that may interest you, subject to your communication preferences. You may opt out of promotional emails at any time.",
      "We use collected data to monitor and analyze usage trends, personalize your experience, prevent fraudulent transactions, and comply with legal obligations.",
    ],
  },
  {
    id: "information-sharing",
    title: "3. Information Sharing",
    content: [
      "We do not sell, rent, or share your personal information with third parties for their marketing purposes. We share your information only as described in this policy.",
      "When you place an order, we share your delivery address and contact information with the farm fulfilling your order. Farms are required to keep this information confidential and use it only for order fulfillment.",
      "We may share information with service providers who assist us in operating our platform, including payment processors, shipping providers, and analytics services. These providers are bound by confidentiality agreements.",
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All data transmissions are encrypted using SSL/TLS technology.",
      "Payment information is processed by our secure payment provider and is never stored on our servers. We comply with PCI DSS standards for handling payment card data.",
      "While we take reasonable measures to protect your information, no security system is impenetrable. We cannot guarantee the absolute security of our systems. In the event of a security breach, we will notify affected users as required by applicable law.",
    ],
  },
  {
    id: "cookies",
    title: "5. Cookies",
    content: [
      "We use cookies and similar tracking technologies to collect usage information, remember your preferences, and improve your experience on our platform. Cookies are small data files stored on your device.",
      "We use essential cookies necessary for the operation of our platform, as well as analytics cookies to understand how visitors use our site. You can control cookie settings through your browser preferences.",
      "Some features of our platform may not function properly if you disable cookies. Third-party services we use, such as analytics providers, may also set cookies on your device subject to their own privacy policies.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      "You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of the personal information we hold about you by contacting us.",
      "You can opt out of promotional emails by clicking the unsubscribe link in any email or by updating your communication preferences in your account settings. You will still receive transactional emails related to your orders.",
      "Depending on your location, you may have additional rights under applicable privacy laws, including the right to data portability and the right to restrict processing of your personal data. Contact us to exercise these rights.",
    ],
  },
  {
    id: "contact",
    title: "7. Contact Us",
    content: [
      "If you have questions about this Privacy Policy or our data practices, please contact us at privacy@naturesalternative.com or by mail at Natures Alternative Market Place, Houston, Texas.",
      "We will respond to your inquiry within a reasonable time period. If you believe we have not adequately addressed your concern, you may have the right to file a complaint with your local data protection authority.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-[#1a4a2e] py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Privacy Policy</h1>
            <p className="text-[#f5f0e8] opacity-80 text-sm">Last updated: December 2024</p>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">

            {/* Table of Contents */}
            <div className="bg-[#f5f0e8] rounded-xl p-6 mb-10">
              <h2 className="font-bold text-gray-900 mb-4">Table of Contents</h2>
              <ol className="space-y-2">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-[#1a4a2e] hover:underline"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 text-sm">
              Natures Alternative Market Place (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share information about you when you use our marketplace platform at naturesalternative.com.
            </p>

            {/* Sections */}
            <div className="space-y-10">
              {SECTIONS.map((section) => (
                <div key={section.id} id={section.id}>
                  <h2 className="text-xl font-bold text-[#1a4a2e] mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((para, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed text-sm">{para}</p>
                    ))}
                  </div>
                  {section !== SECTIONS[SECTIONS.length - 1] && (
                    <hr className="mt-10 border-gray-100" />
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
