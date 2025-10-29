import Head from 'next/head';
import Link from 'next/link';
import { SEO_CONFIG } from '@/lib/seo';

const Privacy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - {SEO_CONFIG.title}</title>
        <meta name="description" content="Privacy Policy for My Peta - Malaysian Data Visualization Platform" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Privacy Policy
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Last Updated: October 29, 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 prose prose-zinc dark:prose-invert max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                1. Introduction
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Welcome to My Peta ("we," "our," or "us"). We are committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our Malaysian data visualization platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                2.1 Information You Provide
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                When you authenticate with a third-party service, we may collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-zinc-700 dark:text-zinc-300">
                <li>Your username and display name from the authentication provider</li>
                <li>Your profile picture</li>
                <li>Your user ID from the authentication provider</li>
                <li>Your email address (if provided by the authentication service and you authorize it)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                2.2 Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 mb-4 text-zinc-700 dark:text-zinc-300">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used)</li>
                <li>Preferences (selected states, data categories, theme preferences)</li>
                <li>IP address and general location data</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                2.3 Cookies and Tracking Technologies
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service 
                and store certain information, including authentication tokens and user preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                3. How We Use Your Information
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300">
                <li>To provide and maintain our service</li>
                <li>To authenticate your identity and manage your session</li>
                <li>To personalize your experience and save your preferences</li>
                <li>To improve our service and develop new features</li>
                <li>To communicate with you about updates or changes to our service</li>
                <li>To monitor and analyze usage patterns and trends</li>
                <li>To detect, prevent, and address technical issues or fraudulent activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300">
                <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Service providers:</strong> With trusted third-party service providers who assist in operating our service</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                5. Data Security
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information. However, no method of transmission over the Internet or electronic 
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                6. Your Rights and Choices
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Opt-out:</strong> Opt-out of certain data collection and processing</li>
                <li><strong>Revoke consent:</strong> Revoke authentication and disconnect your account at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                7. Data Retention
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes 
                outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. 
                When you disconnect your account, we will delete or anonymize your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                8. Third-Party Services
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Our service may use third-party authentication providers. When you authenticate through these 
                services, you are also subject to their respective privacy policies. We encourage you to review 
                their privacy practices. We are not responsible for the privacy practices of third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                9. Children's Privacy
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Our service is not directed to children under the age of 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected information 
                from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                10. International Data Transfers
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Your information may be transferred to and maintained on servers located outside of your 
                country, where data protection laws may differ. By using our service, you consent to this transfer.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage 
                you to review this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                12. Contact Us
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong>Email:</strong> info@mypeta.ai<br />
                  <strong>Website:</strong> https://mypeta.ai
                </p>
              </div>
            </section>

          </div>

        </div>
      </div>
    </>
  );
};

export default Privacy;

