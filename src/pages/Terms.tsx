import { Header } from '@/components/Header';
import { Footer } from '@/components/footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container-narrow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">Terms of Service</h1>
            <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Acceptance of Terms</h2>
                <p>
                  By accessing or using LocalLead, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Platform Description</h2>
                <p className="mb-3">
                  LocalLead is a marketplace platform that connects homeowners with independent local service professionals. 
                  We facilitate introductions and provide tools for communication, but we are not a service provider.
                </p>
                <p>
                  <strong className="text-slate-800">LocalLead is not responsible for the quality, safety, or legality of services provided by third-party professionals.</strong> 
                  All service agreements and work are between homeowners and service providers directly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">User Responsibilities</h2>
                <p className="mb-3">Users are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Providing accurate and truthful information</li>
                  <li>Maintaining the security of their account credentials</li>
                  <li>All interactions and agreements with other users</li>
                  <li>Compliance with all applicable laws and regulations</li>
                  <li>Verifying the qualifications, licenses, and insurance of service providers before engaging their services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">No Warranties or Guarantees</h2>
                <p className="mb-3">
                  LocalLead provides the platform "as is" without warranties of any kind, either express or implied. 
                  We do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>That you will receive a specific number of service requests or leads</li>
                  <li>That service providers will respond to your requests</li>
                  <li>The quality, timeliness, or outcome of services provided by third parties</li>
                  <li>That the platform will be uninterrupted, secure, or error-free</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, LocalLead shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
                  or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the platform.
                </p>
                <p className="mt-3">
                  LocalLead is not responsible for disputes, disagreements, or issues that arise between homeowners and service providers. 
                  All service agreements are between users directly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Payment Terms</h2>
                <p className="mb-3">
                  For service providers, charges apply when you choose to access a customer lead. Payment terms include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All charges are clearly displayed before you commit to accessing a lead</li>
                  <li>Payments are processed securely through our payment provider</li>
                  <li>All transactions are final once a lead is accessed</li>
                  <li>Refunds are not available for accessed leads</li>
                  <li>Prices are subject to change, but you will be notified of changes before accessing leads</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Account Termination</h2>
                <p className="mb-3">
                  You may terminate your account at any time by contacting us or using account settings. We reserve the right to 
                  suspend or terminate accounts that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent, abusive, or illegal activity</li>
                  <li>Provide false or misleading information</li>
                  <li>Fail to pay required fees</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. Material changes will be communicated 
                  through the platform or via email. Continued use of the platform after changes constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Information</h2>
                <p>
                  If you have questions about these Terms of Service, please contact us at:
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
