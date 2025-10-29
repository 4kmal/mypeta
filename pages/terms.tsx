import Head from 'next/head';
import Link from 'next/link';
import { SEO_CONFIG } from '@/lib/seo';

const Terms = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - {SEO_CONFIG.title}</title>
        <meta name="description" content="Terms of Service for My Peta - Malaysian Data Visualization Platform" />
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
              Terms of Service
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Last Updated: October 29, 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 prose prose-zinc dark:prose-invert max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                1. Acceptance of Terms
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Welcome to My Peta. By accessing or using our service at mypeta.ai (the "Service"), 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
                please do not use the Service. These Terms apply to all visitors, users, and others who access 
                or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                2. Description of Service
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                My Peta is a data visualization platform that provides interactive access to publicly available 
                Malaysian statistical data, including but not limited to income, population, crime, water consumption, 
                and household expenditure data. The Service is provided for informational and educational purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                3. User Accounts and Authentication
              </h2>
              
              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                3.1 Account Creation
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                To access certain features of the Service, you may authenticate using a third-party authentication 
                provider. By authenticating, you authorize us to access certain information from your account with 
                that provider as permitted by them and authorized by you.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                3.2 Account Security
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of your authentication credentials and for 
                all activities that occur under your account. You agree to notify us immediately of any unauthorized 
                use of your account.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                3.3 Account Termination
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                You may disconnect your account at any time. We reserve the right to suspend or terminate your 
                access to the Service at our discretion, without notice, for conduct that we believe violates 
                these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                4. Acceptable Use
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300">
                <li>Use the Service in any way that violates any applicable law or regulation</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>Use any automated system, including robots or scrapers, to access the Service without our permission</li>
                <li>Transmit any viruses, malware, or other malicious code</li>
                <li>Impersonate or attempt to impersonate another user or person</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use of the Service</li>
                <li>Use the Service for any commercial purpose without our express written consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                5. Data and Content
              </h2>
              
              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                5.1 Data Accuracy
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                While we strive to provide accurate and up-to-date information, we make no representations or 
                warranties regarding the accuracy, completeness, or reliability of any data displayed on the Service. 
                The data is sourced from publicly available datasets and is provided "as is."
              </p>

              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                5.2 Data Sources
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                All statistical data displayed on the Service is derived from publicly available Malaysian government 
                sources and official statistics. We do not claim ownership of this public data.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
                5.3 Intellectual Property
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                The Service and its original content, features, and functionality (excluding public data) are owned 
                by My Peta and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                6. Third-Party Services
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                The Service may use third-party authentication providers. Your use of these services is governed by 
                their respective Terms of Service and Privacy Policies. We are not responsible for the practices 
                of third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                7. Disclaimer of Warranties
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
                WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL 
                BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                8. Limitation of Liability
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL MY PETA, ITS DIRECTORS, EMPLOYEES, OR 
                AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR 
                USE OF THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER 
                LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                9. Indemnification
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                You agree to indemnify, defend, and hold harmless My Peta and its officers, directors, employees, 
                and agents from and against any claims, liabilities, damages, losses, and expenses, including 
                reasonable legal fees, arising out of or in any way connected with your access to or use of the 
                Service or your violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                10. Privacy
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, 
                which explains how we collect, use, and disclose information about you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                11. Changes to Terms
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If we make 
                material changes to these Terms, we will notify you by updating the "Last Updated" date and, where 
                appropriate, through other means such as email or a notice on the Service. Your continued use of the 
                Service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                12. Governing Law and Jurisdiction
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Malaysia, without 
                regard to its conflict of law provisions. Any disputes arising from these Terms or your use of 
                the Service shall be subject to the exclusive jurisdiction of the courts of Malaysia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                13. Severability
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable by a court of competent 
                jurisdiction, the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                14. Entire Agreement
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
                My Peta regarding the use of the Service and supersede all prior and contemporaneous agreements 
                and understandings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                15. Contact Information
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <strong>Email:</strong> info@mypeta.ai<br />
                  <strong>Website:</strong> https://mypeta.ai
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                16. Acknowledgment
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE 
                BOUND BY THEM.
              </p>
            </section>

          </div>

        </div>
      </div>
    </>
  );
};

export default Terms;

