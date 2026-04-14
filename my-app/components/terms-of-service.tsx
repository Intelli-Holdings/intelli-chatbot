"use client";
import React, { useState } from "react";

function CurrentTerms() {
  return (
    <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
      <p>
        Welcome to Intelli Holdings Inc, (&ldquo;Intelli&rdquo;, &ldquo;Intelli
        Concierge&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;).
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our
        services. By using our services, you agree to these Terms. If you do not
        agree, please do not use our services.
      </p>

      {/* 1. Definitions */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Definitions</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                Term
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Definition
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Account
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                An account required to access and use certain areas and features
                of our Site or application.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Customer
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                A direct user with an active account, a consumer of Intelli
                applications, and/or a beneficiary of services extended through
                our application.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Client
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                An individual or business that interacts with or benefits from
                one of our customers but does not have an account with us.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Site
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                Our website (www.intelliconcierge.com) and any affiliated
                software accessible from our website or across the internet.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Services
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                All services offered by Intelli, including subscriptions to our
                Web Widget, WhatsApp, and other product offerings.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Subscriptions */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        2. Subscriptions
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Includes
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Limits
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Web Widget
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                $15/month
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Customizable AI website widget</li>
                  <li>1 inbox</li>
                  <li>1 human agent</li>
                  <li>Email support</li>
                </ul>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                750,000 words per month
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                WhatsApp
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                $35/month
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>AI WhatsApp assistant</li>
                  <li>1 inbox</li>
                  <li>5 human agents</li>
                  <li>1,000 free chats</li>
                </ul>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                250 new conversations per day
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. User Responsibilities */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        3. User Responsibilities
      </h2>
      <p>You agree to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Provide accurate and complete information when creating an account.
        </li>
        <li>Keep your account information up to date.</li>
        <li>
          Maintain the confidentiality of your account login credentials.
        </li>
        <li>
          Use our services only for lawful purposes and in accordance with these
          Terms.
        </li>
      </ul>

      {/* 4. Payment and Billing */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        4. Payment and Billing
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Subscriptions are billed monthly.</li>
        <li>Payment is due at the beginning of each billing cycle.</li>
        <li>
          For additional usage beyond the included limits, you will be billed
          according to the rates specified in the subscription details.
        </li>
        <li>
          Failure to make timely payments may result in suspension or
          termination of your account.
        </li>
      </ul>

      {/* 5. Cancellation */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        5. Cancellation
      </h2>
      <p>
        You can cancel your paid subscription at any time. Payments are
        non-refundable, except where required by law. These Terms do not
        override any mandatory local laws regarding your cancellation rights.
      </p>

      {/* 6. Privacy and Data Protection */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        6. Privacy and Data Protection
      </h2>
      <p>
        Your use of our services is governed by our{" "}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
        , which outlines how we collect, use, and protect your personal
        information. By using our services, you consent to our Privacy Policy.
      </p>
      <p>
        Intelli is committed to complying with applicable data protection laws,
        including the General Data Protection Regulation (GDPR), the California
        Consumer Privacy Act (CCPA), the Data Protection Act of Kenya (2019),
        and the Data Protection Act of Ghana (2012). Our systems and processes
        are designed to meet the standards required by these regulations. We are
        currently preparing for a CASA Tier II security assessment.
      </p>
      <p>
        For business customers, we offer a{" "}
        <a
          href="/data-processing-agreement"
          className="text-blue-600 hover:underline"
        >
          Data Processing Agreement (DPA)
        </a>{" "}
        that governs the processing of personal data on your behalf, including
        provisions for international data transfers via EU Standard Contractual
        Clauses (SCCs).
      </p>
      <p>
        A current list of our subprocessors is maintained at{" "}
        <a href="/subprocessors" className="text-blue-600 hover:underline">
          intelliconcierge.com/subprocessors
        </a>
        . Customer data is not used for training or fine-tuning AI models. All
        data sent to AI providers is for real-time inference only and undergoes
        PII scrubbing before transmission.
      </p>

      {/* 7. Intellectual Property */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        7. Intellectual Property
      </h2>
      <p>
        All content, trademarks, and data on our Site and applications,
        including but not limited to software, databases, text, graphics, icons,
        hyperlinks, and designs, are the property of Intelli and are protected
        by intellectual property laws. You agree not to infringe on any of our
        intellectual property rights.
      </p>

      {/* 8. Termination */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        8. Termination
      </h2>
      <p>
        You are free to stop using our Services at any time. We reserve the
        right to terminate or suspend your access to our services at any time,
        with or without notice, for conduct that we believe violates these Terms
        or is harmful to other users of our services, us, or third parties, or
        for any other reason.
      </p>

      {/* 9. Limitation of Liability */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        9. Limitation of Liability
      </h2>
      <p>
        To the fullest extent permitted by law, Intelli shall not be liable for
        any indirect, incidental, special, consequential, or punitive damages,
        or any loss of profits or revenues, whether incurred directly or
        indirectly, or any loss of data, use, goodwill, or other intangible
        losses, resulting from (i) your use of or inability to use our services;
        (ii) any unauthorized access to or use of our servers and/or any
        personal information stored therein.
      </p>

      {/* 10. Governing Law */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        10. Governing Law
      </h2>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the State of Delaware, United States of America, without regard
        to its conflict of law principles. Intelli Holdings Inc is incorporated
        in the State of Delaware. Any disputes arising under or in connection
        with these Terms shall be resolved through binding arbitration in the
        State of Delaware, United States of America. Each party irrevocably
        submits to the jurisdiction of the state and federal courts located in
        the State of Delaware for any proceedings ancillary to arbitration.
      </p>
      <p>
        To the extent that the processing of personal data is subject to the
        California Consumer Privacy Act (Cal. Civ. Code &sect;&sect; 1798.100
        et seq.), as amended by the California Privacy Rights Act of 2020
        (&ldquo;CCPA&rdquo;), our data processing practices comply with the
        requirements of the CCPA. For more details, please refer to our{" "}
        <a
          href="/data-processing-agreement"
          className="text-blue-600 hover:underline"
        >
          Data Processing Agreement
        </a>
        .
      </p>

      {/* 11. Changes to the Terms */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        11. Changes to the Terms
      </h2>
      <p>
        We may modify these Terms from time to time. Any changes will be posted
        on our Site and/or application, and your continued use of our services
        after such changes have been posted constitutes your acceptance of the
        new Terms.
      </p>

      {/* 12. Contact Us */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        12. Contact Us
      </h2>
      <p>
        If you have any questions about these Terms, please contact us at:
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3">
                Registered Address
              </td>
              <td className="px-6 py-3 text-sm text-gray-600">
                Intelli Holdings Inc, 251 Little Falls Drive, City of
                Wilmington, County of Newcastle, Delaware 19808, USA
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                Email
              </td>
              <td className="px-6 py-3 text-sm text-gray-600">
                <a
                  href="mailto:support@intelliconcierge.com"
                  className="text-blue-600 hover:underline"
                >
                  support@intelliconcierge.com
                </a>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                Telephone
              </td>
              <td className="px-6 py-3 text-sm text-gray-600">
                +254769758405
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                Social Media
              </td>
              <td className="px-6 py-3 text-sm text-gray-600">
                &bull; Instagram:
                @Intelli_concierge &bull; Facebook: @Intelli_concierge
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-6 font-semibold text-gray-900">
        By using our services, you agree to these Terms of Service. If you do
        not agree, please discontinue use of our services immediately.
      </p>
    </div>
  );
}

function PreviousTerms() {
  return (
    <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
      <p>
        Welcome to Intelli Holdings Inc, (&ldquo;Intelli&rdquo;, &ldquo;Intelli
        Concierge&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;,
        &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern
        your use of our services, including subscriptions to our Basic Web
        Widget and WhatsApp offerings. By using our services, you agree to these
        Terms. If you do not agree, please discontinue the use of our services immediately.
      </p>

      {/* 1. Definitions */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Definitions</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                Term
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Definition
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Account
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                An account required to access and use certain areas and features
                of our Site or application.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Customer
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                A direct user with an active account, a consumer of Intelli
                applications, and/or a beneficiary of services extended through
                our application.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Client
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                An individual or business that interacts with or benefits from
                one of our customers but does not have an account with us.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Site
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                Our website (www.intelliconcierge.com) and any software
                accessible from our website or across the internet affiliated
                with our primary site.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Services
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                All services offered by Intelli, including subscriptions to the
                Basic Web Widget and WhatsApp offerings.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Subscriptions */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        2. Subscriptions
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Includes
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Overage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Web Widget
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                $8/month
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Customizable widget</li>
                  <li>1 inbox, 1 agent/staff</li>
                  <li>Email support</li>
                  <li>750,000 words limit</li>
                </ul>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                $3.50 per 1M tokens after word limit
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                WhatsApp
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                $20/month
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Intelligent sales &amp; inquiry chatbot</li>
                  <li>1 inbox, 5 agents/staff</li>
                  <li>1,000 free chats/month</li>
                  <li>250 new conversations/day</li>
                  <li>Track travel documents</li>
                </ul>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                $0.0363 per conversation after 1,000 free chats
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. User Responsibilities */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        3. User Responsibilities
      </h2>
      <p>You agree to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Provide accurate and complete information when creating an account.
        </li>
        <li>Keep your account information up to date.</li>
        <li>
          Maintain the confidentiality of your account login credentials.
        </li>
        <li>
          Use our services only for lawful purposes and in accordance with these
          Terms.
        </li>
      </ul>

      {/* 4. Payment and Billing */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        4. Payment and Billing
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Subscriptions are billed monthly.</li>
        <li>Payment is due at the beginning of each billing cycle.</li>
        <li>
          For additional usage beyond the included limits, you will be billed
          according to the rates specified in the subscription details.
        </li>
        <li>
          Failure to make timely payments may result in suspension or
          termination of your account.
        </li>
      </ul>

      {/* 5. Cancellation */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        5. Cancellation
      </h2>
      <p>
        You can cancel your paid subscription at any time. Payments are
        non-refundable, except where required by law. These Terms do not
        override any mandatory local laws regarding your cancellation rights.
      </p>

      {/* 6. Privacy */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">6. Privacy</h2>
      <p>
        Your use of our services is also governed by our Privacy Policy, which
        outlines how we collect, use, and protect your personal information. By
        using our services, you consent to our Privacy Policy.
      </p>

      {/* 7. Intellectual Property */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        7. Intellectual Property
      </h2>
      <p>
        All content, trademarks, and data on our Site and applications,
        including but not limited to software, databases, text, graphics, icons,
        hyperlinks, and designs, are the property of Intelli and are protected
        by intellectual property laws. You agree not to infringe on any of our
        intellectual property rights.
      </p>

      {/* 8. Termination */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        8. Termination
      </h2>
      <p>
        You are free to stop using our Services at any time. We reserve the
        right to terminate or suspend your access to our services at any time,
        with or without notice, for conduct that we believe violates these Terms
        or is harmful to other users of our services, us, or third parties, or
        for any other reason.
      </p>

      {/* 9. Limitation of Liability */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        9. Limitation of Liability
      </h2>
      <p>
        To the fullest extent permitted by law, Intelli shall not be liable for
        any indirect, incidental, special, consequential, or punitive damages,
        or any loss of profits or revenues, whether incurred directly or
        indirectly, or any loss of data, use, goodwill, or other intangible
        losses, resulting from (i) your use of or inability to use our services;
        (ii) any unauthorized access to or use of our servers and/or any
        personal information stored therein.
      </p>

      {/* 10. Governing Law */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        10. Governing Law
      </h2>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of Kenya, without regard to its conflict of law principles. Any
        disputes arising under or in connection with these Terms shall be
        resolved through binding arbitration in Kenya.
      </p>

      {/* 11. Changes to the Terms */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        11. Changes to the Terms
      </h2>
      <p>
        We may modify these Terms from time to time. Any changes will be posted
        on our Site and/or application, and your continued use of our services
        after such changes have been posted constitutes your acceptance of the
        new Terms.
      </p>

      {/* 12. Contact Us */}
      <h2 className="text-2xl font-bold text-gray-900 mt-10">
        12. Contact Us
      </h2>
      <p>
        If you have any questions about these Terms, please contact us at:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Email:{" "}
          <a
            href="mailto:support@intelliconcierge.com"
            className="text-blue-600 hover:underline"
          >
            support@intelliconcierge.com
          </a>
        </li>
        <li>Telephone: +254769758405</li>
        <li>Instagram: @Intelli_concierge</li>
        <li>Facebook: @Intelli_concierge</li>
      </ul>

      <p className="mt-6 font-semibold text-gray-900">
        By using our services, you agree to these Terms of Service. If you do
        not agree, please discontinue use of our services immediately.
      </p>
    </div>
  );
}

function V2Terms() {
  return (
    <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
      <p>
        Welcome to Intelli Holdings Inc, (&ldquo;Intelli&rdquo;, &ldquo;Intelli
        Concierge&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;,
        &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern
        your use of our services. By using our services, you agree to these
        Terms. If you do not agree, please do not use our services.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">1. Definitions</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">Term</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Definition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Account</td>
              <td className="px-6 py-4 text-sm text-gray-600">An account required to access and use certain areas and features of our Site or application.</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Customer</td>
              <td className="px-6 py-4 text-sm text-gray-600">A direct user with an active account, a consumer of Intelli applications, and/or a beneficiary of services extended through our application.</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Client</td>
              <td className="px-6 py-4 text-sm text-gray-600">An individual or business that interacts with or benefits from one of our customers but does not have an account with us.</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Site</td>
              <td className="px-6 py-4 text-sm text-gray-600">Our website (www.intelliconcierge.com) and any affiliated software accessible from our website or across the internet.</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Services</td>
              <td className="px-6 py-4 text-sm text-gray-600">All services offered by Intelli, including subscriptions to our Web Widget, WhatsApp, and other product offerings.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">2. Subscriptions</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Includes</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Limits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Web Widget</td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">$15/month</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Customizable AI website widget</li>
                  <li>1 inbox, 1 human agent</li>
                  <li>Email support</li>
                </ul>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">750,000 words per month</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">WhatsApp</td>
              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">$35/month</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  <li>AI WhatsApp assistant</li>
                  <li>1 inbox, 5 human agents</li>
                  <li>1,000 free chats</li>
                </ul>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">250 new conversations per day</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">3. User Responsibilities</h2>
      <p>You agree to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide accurate and complete information when creating an account.</li>
        <li>Keep your account information up to date.</li>
        <li>Maintain the confidentiality of your account login credentials.</li>
        <li>Use our services only for lawful purposes and in accordance with these Terms.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">4. Payment and Billing</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Subscriptions are billed monthly.</li>
        <li>Payment is due at the beginning of each billing cycle.</li>
        <li>For additional usage beyond the included limits, you will be billed according to the rates specified in the subscription details.</li>
        <li>Failure to make timely payments may result in suspension or termination of your account.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">5. Cancellation</h2>
      <p>You can cancel your paid subscription at any time. Payments are non-refundable, except where required by law. These Terms do not override any mandatory local laws regarding your cancellation rights.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">6. Privacy</h2>
      <p>Your use of our services is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. By using our services, you consent to our Privacy Policy.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">7. Intellectual Property</h2>
      <p>All content, trademarks, and data on our Site and applications, including but not limited to software, databases, text, graphics, icons, hyperlinks, and designs, are the property of Intelli and are protected by intellectual property laws. You agree not to infringe on any of our intellectual property rights.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">8. Termination</h2>
      <p>You are free to stop using our Services at any time. We reserve the right to terminate or suspend your access to our services at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users of our services, us, or third parties, or for any other reason.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">9. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law, Intelli shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (i) your use of or inability to use our services; (ii) any unauthorized access to or use of our servers and/or any personal information stored therein.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">10. Governing Law</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be resolved through binding arbitration in Kenya.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">11. Changes to the Terms</h2>
      <p>We may modify these Terms from time to time. Any changes will be posted on our Site and/or application, and your continued use of our services after such changes have been posted constitutes your acceptance of the new Terms.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10">12. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at:</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/3">Registered Address</td>
              <td className="px-6 py-3 text-sm text-gray-600">Intelli Holdings Inc, 251 Little Falls Drive, City of Wilmington, County of Newcastle, Delaware 19808, USA</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Email</td>
              <td className="px-6 py-3 text-sm text-gray-600"><a href="mailto:support@intelliconcierge.com" className="text-blue-600 hover:underline">support@intelliconcierge.com</a></td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Telephone</td>
              <td className="px-6 py-3 text-sm text-gray-600">+254769758405</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Social Media</td>
              <td className="px-6 py-3 text-sm text-gray-600">X/Twitter: @Intelli_concierge &bull; Instagram: @Intelli_concierge &bull; Facebook: @Intelli_concierge</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-6 font-semibold text-gray-900">
        By using our services, you agree to these Terms of Service. If you do not agree, please discontinue use of our services immediately.
      </p>
    </div>
  );
}

type Version = "v3" | "v2" | "v1";

const versions: { key: Version; label: string; date: string }[] = [
  { key: "v3", label: "Current (v3)", date: "Effective Date: April 14, 2026" },
  { key: "v2", label: "v2", date: "Effective Date: January 14, 2025" },
  { key: "v1", label: "v1", date: "Effective Date: June 20, 2024" },
];

export default function TermsOfService() {
  const [activeVersion, setActiveVersion] = useState<Version>("v3");

  const activeDate = versions.find((v) => v.key === activeVersion)?.date ?? "";

  return (
    <div className="min-h-screen py-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-600">{activeDate}</p>
      </div>

      {/* Version Toggle */}
      <div className="flex justify-center gap-3 mb-10">
        {versions.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveVersion(v.key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeVersion === v.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeVersion === "v3" && <CurrentTerms />}
      {activeVersion === "v2" && <V2Terms />}
      {activeVersion === "v1" && <PreviousTerms />}
    </div>
  );
}
