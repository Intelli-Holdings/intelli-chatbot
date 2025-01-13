"use client";
import React, { useState } from "react";

export default function TermsOfService() {
  const [showCurrentVersion, setShowCurrentVersion] = useState(true);

  const termsHtml = `
    <h1 class="text-2xl font-bold mb-4">Terms of Service</h1>
    <p><strong>Effective Date: November 01, 2024</strong></p>
    <p>Welcome to Intelli Holdings Inc, ("Intelli", "Intelli Concierge", "we", "our", "us"). These Terms of Service ("Terms") govern your use of our services...</p>
    
    <h2 class="text-xl font-semibold mt-6 mb-2">1. Definitions</h2>
    <ul class="list-disc list-inside pl-6">
      <li><strong>Account:</strong> An account required to access and use certain areas and features...</li>
      <li><strong>Customer:</strong> A direct user with an active account...</li>
      <li><strong>Client:</strong> An individual or business that interacts with or benefits from one of our customers...</li>
      <li><strong>Site:</strong> Our website (www.intelliconcierge.com) and any affiliated software...</li>
      <li><strong>Services:</strong> All services offered by Intelli, including subscriptions...</li>
    </ul>

    <h2 class="text-xl font-semibold mt-6 mb-2">2. Subscriptions</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="text-left px-4 py-2 font-semibold">Subscription</th>
            <th class="text-left px-4 py-2 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border-t border-gray-200 px-4 py-2">Web Widget</td>
            <td class="border-t border-gray-200 px-4 py-2">
              Customizable widget, 1 inbox, 1 agent, Email support, 750,000 words limit, $8 per month...
            </td>
          </tr>
          <tr>
            <td class="border-t border-gray-200 px-4 py-2">WhatsApp</td>
            <td class="border-t border-gray-200 px-4 py-2">
              Intelligent chatbot, 1 inbox, 5 agents, 1000 free chats, $20 per month, 250 new conversations/day...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="text-xl font-semibold mt-6 mb-2">3. User Responsibilities</h2>
    <p>You agree to:</p>
    <ul class="list-disc list-inside pl-6">
      <li>Provide accurate and complete information when creating an account...</li>
      <li>Keep your account information up to date...</li>
      <li>Maintain the confidentiality of your account login credentials...</li>
       <li>Use our services only for lawful purposes and in accordance with these Terms...</li>
    </ul>

    <h2 class="text-xl font-semibold mt-6 mb-2">4. Payment and Billing</h2>
    <ul>
      <li>Subscriptions are billed monthly.</li>
      <li>Payment is due at the beginning of each billing cycle.</li>
      <li>For additional usage beyond the included limits, you will be billed according to the rates specified in the subscription details.</li>
      <li>Failure to make timely payments may result in suspension or termination of your account.</li>
    </ul>

    <h2 class="text-xl font-semibold mt-6 mb-2">5. Cancellation</h2>
    <p>You can cancel your paid subscription at any time. Payments are non-refundable, except where required by law. These Terms do not override any mandatory local laws regarding your cancellation rights.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">6. Privacy</h2>
    <p>Your use of our services is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. By using our services, you consent to our Privacy Policy.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">7. Intellectual Property</h2>
    <p>All content, trademarks, and data on our Site and applications, including but not limited to software, databases, text, graphics, icons, hyperlinks, and designs, are the property of Intelli and are protected by intellectual property laws. You agree not to infringe on any of our intellectual property rights.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">8. Termination</h2>
    <p>You are free to stop using our Services at any time. We reserve the right to terminate or suspend your access to our services at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users of our services, us, or third parties, or for any other reason.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">9. Limitation of Liability</h2>
    <p>To the fullest extent permitted by law, Intelli shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (i) your use of or inability to use our services; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">10. Governing Law</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be resolved through binding arbitration in Kenya.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">11. Changes to the Terms</h2>
    <p>We may modify these Terms from time to time. Any changes will be posted on our Site and/or application, and your continued use of our services after such changes have been posted constitutes your acceptance of the new Terms.</p>

    <h2 class="text-xl font-semibold mt-6 mb-2">12. Contact Us</h2>
    <p>If you have any questions about these Terms, please contact us at:</p>
     <p>Intelli Holdings Inc with a registered address in the State of Delaware at
251 little Falls Drive, city of Wilmington, County of Newcastle, Delaware 19808</p> 
    <ul class="list-disc list-inside pl-6">
        
      <li>Email: support@intelliconcierge.com</li>
      <li>Telephone: +233536620120, +254745051091 </li>
      <li>Twitter: @Intelli_concierge</li>
      <li>Instagram: @Intelli_concierge</li>
      <li>Facebook: @Intelli_concierge</li>
    </ul>

    <p >By using our services, you agree to these Terms of Service. <b>If you do not agree, please discontinue use of our services immediately.<b></p>
    <p>
    <br>
  `;

  const previousTermsHtml = `
    <h1 class="text-2xl font-bold mb-4">Previous Terms of Service</h1>
    <p><strong>Effective Date: June 20, 2024</strong></p>
    <p>Welcome to Intelli Holdings Inc, ("Intelli", "Intelli Concierge", "we", "our", "us"). These Terms of Service ("Terms") govern your use of our services, including subscriptions to our Basic Web Widget and WhatsApp offerings. By using our services, you agree to these Terms. If you do not agree, please do not use our services.</p>
    
    <h2>1. Definitions</h2>
    <ul>
      <li><strong>Account:</strong> An account required to access and use certain areas and features of our Site or application.</li>
      <li><strong>Customer:</strong> A direct user with an active account, a consumer of Intelli applications, and/or a beneficiary of services extended through our application.</li>
      <li><strong>Client:</strong> An individual or business that interacts with or benefits from one of our customers but does not have an account with us.</li>
      <li><strong>Site:</strong> Our website (www.intelliconcierge.com) and any software accessible from our website or across the internet affiliated with our primary site.</li>
      <li><strong>Services:</strong> All services offered by Intelli, including subscriptions to the Basic Web Widget and WhatsApp offerings.</li>
    </ul>

    <h2>2. Subscriptions</h2>
    <h3>Web Widget</h3>
    <ul>
      <li>Customizable widget</li>
      <li>1 inbox</li>
      <li>1 agent/staff</li>
      <li>Email support</li>
      <li>750,000 words limit</li>
      <li>$8 per month</li>
      <li>Additional usage: $3.5 per 1 million tokens after the word limit</li>
    </ul>
    <h3>WhatsApp</h3>
    <ul>
      <li>Intelligent sales and customer inquiry chatbot</li>
      <li>1 inbox</li>
      <li>5 agent/staff</li>
      <li>$20 per month</li>
      <li>1000 free chats per month</li>
      <li>Track travel documents</li>
      <li>250 new conversations per day</li>
      <li>Additional usage: $0.0363 per conversation after 1000 free chats</li>
    </ul>

    <h2>3. User Responsibilities</h2>
    <p>You agree to:</p>
    <ul>
      <li>Provide accurate and complete information when creating an account.</li>
      <li>Keep your account information up to date.</li>
      <li>Maintain the confidentiality of your account login credentials.</li>
      <li>Use our services only for lawful purposes and in accordance with these Terms.</li>
    </ul>

    <h2>4. Payment and Billing</h2>
    <ul>
      <li>Subscriptions are billed monthly.</li>
      <li>Payment is due at the beginning of each billing cycle.</li>
      <li>For additional usage beyond the included limits, you will be billed according to the rates specified in the subscription details.</li>
      <li>Failure to make timely payments may result in suspension or termination of your account.</li>
    </ul>

    <h2>5. Cancellation</h2>
    <p>You can cancel your paid subscription at any time. Payments are non-refundable, except where required by law. These Terms do not override any mandatory local laws regarding your cancellation rights.</p>

    <h2>6. Privacy</h2>
    <p>Your use of our services is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. By using our services, you consent to our Privacy Policy.</p>

    <h2>7. Intellectual Property</h2>
    <p>All content, trademarks, and data on our Site and applications, including but not limited to software, databases, text, graphics, icons, hyperlinks, and designs, are the property of Intelli and are protected by intellectual property laws. You agree not to infringe on any of our intellectual property rights.</p>

    <h2>8. Termination</h2>
    <p>You are free to stop using our Services at any time. We reserve the right to terminate or suspend your access to our services at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users of our services, us, or third parties, or for any other reason.</p>

    <h2>9. Limitation of Liability</h2>
    <p>To the fullest extent permitted by law, Intelli shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (i) your use of or inability to use our services; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein.</p>

    <h2>10. Governing Law</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be resolved through binding arbitration in Kenya.</p>

    <h2>11. Changes to the Terms</h2>
    <p>We may modify these Terms from time to time. Any changes will be posted on our Site and/or application, and your continued use of our services after such changes have been posted constitutes your acceptance of the new Terms.</p>

    <h2>12. Contact Us</h2>
    <p>If you have any questions about these Terms, please contact us at:</p>
    <ul>
      <li>Email: support@intelliconcierge.com</li>
      <li>Telephone: +233536620120</li>
      <li>Twitter: @Intelli_concierge</li>
      <li>Instagram: @Intelli_concierge</li>
      <li>Facebook: @Intelli_concierge</li>
    </ul>

    <p>By using our services, you agree to these Terms of Service. If you do not agree, please discontinue use of our services immediately.</p>
  `;

  const formattedTerms = showCurrentVersion ? termsHtml : previousTermsHtml;

  return (
    <div className="relative">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setShowCurrentVersion(true)}
          className={`px-4 py-2 text-sm font-semibold ${showCurrentVersion ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Current Terms
        </button>
        <button
          onClick={() => setShowCurrentVersion(false)}
          className={`px-4 py-2 text-sm font-semibold ${!showCurrentVersion ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Previous Terms
        </button>
      </div>

      <main className="pt-8">
        <section className="container mx-auto mt-4 px-4 lg:w-2/4 xl:w-2/3 sm:w-3/4">
          <div 
            className="terms-of-service text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedTerms }}
          />
        </section>
      </main>
    </div>
  );
}
