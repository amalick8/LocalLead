import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container-narrow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Privacy Policy</h1>
            <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Information We Collect</h2>
                <p className="mb-3">
                  When you use LocalLead, we collect the following types of information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-slate-800">Account Information:</strong> Name, email address, business name (for service providers), and password</li>
                  <li><strong className="text-slate-800">Service Request Information:</strong> Service category, location (city, ZIP code), project description, and contact preferences</li>
                  <li><strong className="text-slate-800">Contact Information:</strong> Email address and phone number (when provided)</li>
                  <li><strong className="text-slate-800">Usage Data:</strong> Information about how you interact with our platform, including pages visited and features used</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">How We Use Your Information</h2>
                <p className="mb-3">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Facilitate connections between homeowners and service providers</li>
                  <li>Process service requests and manage your account</li>
                  <li>Send notifications about service requests and platform updates</li>
                  <li>Improve our platform and user experience</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Data Sharing</h2>
                <p className="mb-3">
                  <strong className="text-slate-800">LocalLead does not sell personal data.</strong> We share information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-slate-800">With Service Providers:</strong> When a homeowner submits a service request, service providers in the relevant area can view the request details. Full contact information (email, phone) is only shared when a service provider chooses to access a specific lead.</li>
                  <li><strong className="text-slate-800">Service Providers:</strong> Businesses only receive customer information when they choose to access a lead. Homeowners' contact details are not shared until a business explicitly purchases access to a lead.</li>
                  <li><strong className="text-slate-800">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Cookies & Analytics</h2>
                <p>
                  We use cookies and similar technologies to improve your experience, analyze platform usage, and provide personalized content. 
                  You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to provide our services, comply with legal obligations, 
                  resolve disputes, and enforce our agreements. Account information is retained while your account is active and for a 
                  reasonable period after account closure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Rights</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt out of certain communications</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at <a href="mailto:support@locallead.com" className="text-blue-600 hover:underline">support@locallead.com</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Information</h2>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <p className="mt-2">
                  <strong className="text-slate-800">Email:</strong> <a href="mailto:support@locallead.com" className="text-blue-600 hover:underline">support@locallead.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
