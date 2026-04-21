import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using the Natures Alternative Market Place platform (the \"Platform\"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our Platform.",
      "We reserve the right to modify these terms at any time. We will notify users of material changes by posting the updated terms on our Platform with a revised effective date. Your continued use of the Platform after changes constitutes acceptance of the updated terms.",
    ],
  },
  {
    id: "use-of-platform",
    title: "2. Use of Platform",
    content: [
      "You may use our Platform only for lawful purposes and in accordance with these Terms. You agree not to use the Platform in any way that violates applicable local, state, national, or international law or regulation.",
      "You must be at least 18 years old to create an account or make purchases on our Platform. By using our Platform, you represent and warrant that you meet this age requirement.",
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.",
    ],
  },
  {
    id: "buyer-terms",
    title: "3. Buyer Terms",
    content: [
      "As a buyer on our Platform, you agree to provide accurate and complete information when placing orders. You agree to pay for all products you purchase and to not engage in fraudulent transactions.",
      "All sales are between you and the individual farm seller. Natures Alternative facilitates the transaction but is not a party to the sale. Disputes regarding product quality or fulfillment should first be directed to the seller, with Natures Alternative support available to assist.",
      "You acknowledge that products are natural and may vary in appearance, size, and quantity due to the nature of farm-fresh goods. Product descriptions are provided by sellers and may not reflect exact product characteristics.",
    ],
  },
  {
    id: "seller-terms",
    title: "4. Seller Terms",
    content: [
      "To sell on our Platform, you must complete our application process and be approved by Natures Alternative. We reserve the right to reject applications or revoke seller status at our discretion if our natural farming standards are not met.",
      "As a seller, you agree to accurately describe your products, fulfill orders in a timely manner, and maintain the natural farming standards you represented in your application. Misrepresentation of products or practices may result in removal from the Platform.",
      "Sellers are responsible for all taxes related to their sales, compliance with food safety regulations, and proper labeling and packaging of products. Natures Alternative is not responsible for seller non-compliance with applicable regulations.",
      "Natures Alternative charges a transaction fee on all sales made through the Platform. Current fee structures are available in your seller dashboard. We reserve the right to update fee structures with advance notice.",
    ],
  },
  {
    id: "prohibited-activities",
    title: "5. Prohibited Activities",
    content: [
      "You may not use our Platform to post false, misleading, or deceptive content; engage in price manipulation; create fake reviews or accounts; or harass, abuse, or harm other users.",
      "Sellers may not list products that do not meet our natural farming standards, use the Platform to sell prohibited or illegal goods, or misrepresent the source, quality, or characteristics of their products.",
      "Any attempt to interfere with, disrupt, or circumvent the security of our Platform is strictly prohibited and may result in immediate account termination and legal action.",
    ],
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual Property",
    content: [
      "The Natures Alternative Platform, including its design, features, and content created by us, is owned by Natures Alternative and is protected by copyright, trademark, and other intellectual property laws.",
      "By posting content on our Platform, you grant Natures Alternative a non-exclusive, royalty-free license to use, display, and distribute that content in connection with our services. You retain ownership of your content.",
      "You may not reproduce, distribute, modify, or create derivative works of our Platform or content without our express written permission.",
    ],
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, Natures Alternative shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our Platform.",
      "Our total liability for any claims arising under these terms shall not exceed the greater of $100 or the amount you paid to us in the 12 months preceding the claim.",
      "We do not warrant that our Platform will be uninterrupted, error-free, or free of viruses or other harmful components. The Platform is provided on an \"as is\" and \"as available\" basis.",
    ],
  },
  {
    id: "governing-law",
    title: "8. Governing Law",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions.",
      "Any dispute arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the state and federal courts located in Harris County, Texas.",
    ],
  },
  {
    id: "changes",
    title: "9. Changes to Terms",
    content: [
      "We reserve the right to update these Terms of Use at any time. We will post the revised terms on this page with an updated effective date. For material changes, we will provide additional notice such as an email notification.",
      "Your continued use of the Platform after any changes to the Terms constitutes your acceptance of the new terms. If you do not agree to the changed terms, you must stop using our Platform.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    content: [
      "If you have questions about these Terms of Use, please contact us at legal@naturesalternative.com or by mail at Natures Alternative Market Place, Houston, Texas.",
      "We welcome your feedback and questions and will do our best to respond in a timely manner.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-[#1a4a2e] py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Terms of Use</h1>
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
              Please read these Terms of Use carefully before using the Natures Alternative Market Place platform. These terms govern your access to and use of our website and services.
            </p>

            {/* Sections */}
            <div className="space-y-10">
              {SECTIONS.map((section, idx) => (
                <div key={section.id} id={section.id}>
                  <h2 className="text-xl font-bold text-[#1a4a2e] mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((para, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed text-sm">{para}</p>
                    ))}
                  </div>
                  {idx < SECTIONS.length - 1 && (
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
