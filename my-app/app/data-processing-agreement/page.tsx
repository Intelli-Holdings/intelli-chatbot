import { Navbar } from "@/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement | Intelli",
  description:
    "Data Processing Agreement between Intelli Holdings Inc and its customers.",
};

export default function DataProcessingAgreementPage() {
  return (
    <div className="relative">
      <main className="pt-16">
        <Navbar />
        <section className="container mx-auto mt-8 px-4 max-w-4xl">
          <div className="min-h-screen py-4">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
                Data Processing Agreement
              </h1>
              <p className="text-lg text-gray-600">
                Last updated April 14, 2026
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p>
                This Data Processing Agreement (&ldquo;DPA&rdquo;) forms an
                integral part of the Intelli Terms of Service
                (&ldquo;Terms&rdquo;) between the party named as
                &ldquo;Customer&rdquo; in the Terms (&ldquo;Customer&rdquo; or
                &ldquo;Controller&rdquo;) and Intelli Holdings Inc
                (&ldquo;Company&rdquo; or &ldquo;Processor&rdquo;) and sets out
                the parties&rsquo; respective obligations when Customer personal
                data is processed by Company in relation to the Services
                performed by Company on Customer&rsquo;s behalf pursuant to the
                Terms. The purpose of the DPA is to ensure such processing is
                conducted in accordance with applicable laws and with due respect
                for the rights and freedoms of individuals whose personal data is
                processed. This DPA will be effective from the date on which the
                authorized signatories of the parties sign the Order Form.
              </p>

              <p>The parties hereby agree as follows:</p>

              {/* Section 1 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                1. Definitions and Interpretation
              </h2>
              <p>
                Capitalized terms and expressions used in this DPA shall have the
                following meaning. Any capitalized term used but not defined in
                this DPA has the meaning ascribed to it in the Terms.
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>&ldquo;DPA&rdquo;</strong> means this Data Processing
                  Agreement and all Schedules attached hereto;
                </li>
                <li>
                  <strong>&ldquo;Customer Personal Data&rdquo;</strong> means any
                  Personal Data processed by Company on behalf of Customer
                  pursuant to or in connection with the Terms;
                </li>
                <li>
                  <strong>&ldquo;Data Protection Laws&rdquo;</strong> means any
                  applicable laws and regulations in any relevant jurisdiction
                  where Services are provided relating to the use or processing
                  of Personal Data, which may include depending on the
                  circumstances (but is not limited to): (i) the California
                  Consumer Privacy Act (Cal. Civ. Code &sect;&sect; 1798.100 et
                  seq.), as amended by the California Privacy Rights Act of 2020
                  (&ldquo;CCPA&rdquo;); (ii) the General Data Protection
                  Regulation (Regulation (EU) 2016/679) (&ldquo;EU GDPR&rdquo;);
                  (iii) the UK Data Protection Act 2018 and the EU GDPR as it
                  forms part of the law of England and Wales by virtue of section
                  3 of the European Union (Withdrawal) Act 2018 (the &ldquo;UK
                  GDPR&rdquo;) (together with the EU GDPR, collectively, the
                  &ldquo;GDPR&rdquo;); and (iv) the Swiss Federal Act on Data
                  Protection (&ldquo;FADP&rdquo;); (v) the Data Protection Act,
                  2012 (Act 843) of Ghana; and (vi) the Data Protection Act, 2019
                  of Kenya; in each case, as updated, amended or replaced from
                  time to time;
                </li>
                <li>
                  <strong>&ldquo;EEA&rdquo;</strong> means the European Economic
                  Area;
                </li>
                <li>
                  <strong>&ldquo;Restricted Transfer&rdquo;</strong> means: (i)
                  where the GDPR applies, a transfer of personal data from the
                  EEA to a country outside of the EEA which is not subject to an
                  adequacy determination by the European Commission; (ii) where
                  the UK GDPR applies, a transfer of personal data from the UK to
                  any other country which is not based on adequacy regulations
                  pursuant to Section 17A of the Data Protection Act 2018; and
                  (iii) where the Swiss DPA applies, a transfer of personal data
                  to a country outside of Switzerland which is not included on the
                  list of adequate jurisdictions published by the Swiss Federal
                  Data Protection and Information Commissioner;
                </li>
                <li>
                  <strong>&ldquo;EU SCCs&rdquo;</strong> means the standard
                  contractual clauses approved by the European Commission in
                  Commission Decision 2021/914 dated 4 June 2021, for transfers
                  of personal data to countries not otherwise recognized as
                  offering an adequate level of protection for personal data by
                  the European Commission (as amended and updated from time to
                  time).
                </li>
                <li>
                  <strong>&ldquo;ex-UK Transfer&rdquo;</strong> means the
                  transfer of Personal Data covered by Chapter V of the UK GDPR,
                  which is processed in accordance with the UK GDPR and the Data
                  Protection Act 2018, from the Data Exporter to the Data
                  Importer (or its premises) outside the United Kingdom (the
                  &ldquo;UK&rdquo;), and such transfer is not governed by an
                  adequacy decision made by the Secretary of State in accordance
                  with the relevant provisions of the UK GDPR and the Data
                  Protection Act 2018.
                </li>
                <li>
                  <strong>&ldquo;Standard Contractual Clauses&rdquo;</strong>{" "}
                  means the EU SCCs and the UK SCCs.
                </li>
                <li>
                  <strong>&ldquo;UK SCCs&rdquo;</strong> means the EU SCCs, as
                  amended by the International Data Transfer Addendum to the EU
                  Commission Standard Contractual Clauses of 21 March 2022 issued
                  under Section 119A of the UK Data Protection Act 2018,
                  available at{" "}
                  <a
                    href="https://ico.org.uk/media/for-organisations/documents/4019539/international-data-transfer-addendum.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://ico.org.uk/media/for-organisations/documents/4019539/international-data-transfer-addendum.pdf
                  </a>{" "}
                  (the &ldquo;UK Addendum&rdquo;) and incorporated by reference
                  to this DPA.
                </li>
                <li>
                  <strong>
                    &ldquo;Personal Data&rdquo; or &ldquo;personal data&rdquo; or
                    &ldquo;personal information&rdquo;
                  </strong>{" "}
                  means any information, including personal information, relating
                  to an identified or identifiable natural person (&ldquo;data
                  subject&rdquo;) or as defined in and subject to Data Protection
                  Laws.
                </li>
                <li>
                  <strong>&ldquo;Personal Data Breach&rdquo;</strong> means a
                  breach of security of Company or its Sub-Processors leading to
                  the accidental or unlawful destruction, loss, alteration,
                  unauthorized disclosure of, or access to, Customer Personal
                  Data in Company&rsquo;s possession, custody or control.
                  Personal Data Breaches do not include unsuccessful attempts or
                  activities that do not compromise the security of Customer
                  Personal Data, including unsuccessful log-in attempts, pings,
                  port scans, denial of service attacks, or other network attacks
                  on firewalls or networked systems.
                </li>
                <li>
                  <strong>&ldquo;Sub-Processor&rdquo;</strong> means (a) Company,
                  when Company is processing Customer Personal Data and where
                  Customer is itself a processor of such Customer Personal Data,
                  or (b) any third-party Processor engaged by Company to assist
                  in fulfilling Company&rsquo;s obligations under the Terms and
                  which processes Customer Personal Data. Sub-Processors may
                  include third parties or Company&rsquo;s affiliates, but shall
                  exclude Company employees, contractors or consultants.
                </li>
              </ul>
              <p>
                The terms, &ldquo;Business&rdquo;, &ldquo;Commission&rdquo;,
                &ldquo;Controller&rdquo;, &ldquo;Data Subject&rdquo;,
                &ldquo;Member State&rdquo;, &ldquo;Processor&rdquo;,
                &ldquo;Processing&rdquo;, &ldquo;Service Provider&rdquo;,
                &ldquo;Supervisory Authority&rdquo; shall have the same meaning
                ascribed by relevant Data Protection Laws.
              </p>

              {/* Section 2 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                2. Applicability and Scope
              </h2>
              <p>
                <strong>Applicability.</strong> This DPA will apply only to the
                extent that Company processes, on behalf of Customer, Personal
                Data to which applicable Data Protection Laws apply.
              </p>
              <p>
                <strong>Scope.</strong> The subject matter of the data processing
                is the provision of the Services, and the processing will be
                carried out for the duration of the Terms. Exhibit A sets out the
                nature and purposes of the processing, the types of Personal Data
                Company processes and the categories of data subjects whose
                Personal Data is processed.
              </p>

              {/* Section 3 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                3. Processing of Customer Personal Data
              </h2>
              <p>
                Customer appoints Company as a Processor to process Customer
                Personal Data on behalf of, and in accordance with,
                Customer&rsquo;s instructions (a) as set forth in the Terms, this
                DPA and as otherwise necessary to provide the Services to
                Customer (which may include investigating attempted or confirmed
                security breaches, and detecting and preventing exploits or
                abuse); (b) as necessary to comply with applicable law, including
                Data Protection Laws; and (c) as otherwise agreed in writing
                between the Parties (&ldquo;Permitted Purposes&rdquo;).
              </p>
              <p>
                Customer shall, in its use of the Services, at all times provide
                and/or process Personal Data, and provide instructions to Company
                for the processing of such Personal Data, in compliance with Data
                Protection Laws. Customer shall ensure that the processing of
                Personal Data in accordance with Customer&rsquo;s instructions
                will not cause Company to be in breach of the Data Protection
                Laws. Customer is solely responsible for the accuracy, quality,
                and legality of (i) the Personal Data provided to Company by or
                on behalf of Customer, (ii) the means by which Customer acquired
                any such Personal Data, and (iii) the instructions it provides to
                Company regarding the processing of such Personal Data. Customer
                shall not provide or make available to Company any Personal Data
                in violation of the DPA or otherwise inappropriate for the nature
                of the Services, and shall indemnify Company from all claims and
                losses in connection therewith.
              </p>
              <p>Company shall:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  comply with all applicable Data Protection Laws in the
                  Processing of Customer Personal Data; and
                </li>
                <li>
                  only Process Customer Personal Data on the relevant
                  Customer&rsquo;s documented instructions.
                </li>
              </ul>
              <p>
                Company shall not process Personal Data for any reason other than
                the Permitted Purposes, including with regard to transfers of
                personal data to a third country or an international
                organization, unless required to do so by Supervisory Authority
                to which the Company is subject; in such a case, the Company
                shall inform the Customer of that legal requirement before
                processing, unless that law prohibits such information on
                important grounds of public interest, or in violation of Data
                Protection Laws.
              </p>
              <p>
                Following completion of the Services, Company shall delete
                Customer&rsquo;s Personal Data, unless further storage of such
                Personal Data is required or authorized by applicable law. If
                return or destruction is impracticable or prohibited by law, rule
                or regulation, Company shall take measures to block such Personal
                Data from any further processing (except to the extent necessary
                for its continued hosting or processing required by law, rule or
                regulation) and shall continue to appropriately protect the
                Personal Data remaining in its possession, custody, or control.
                If Customer and Company have entered into Standard Contractual
                Clauses as described in Section 12 (Restricted Transfer), the
                parties agree that the certification of deletion of Personal Data
                that is described in Clause 8.1(d) and Clause 8.5 of the EU SCCs
                (as applicable) shall be provided by Company to Customer only
                upon Customer&rsquo;s written request.
              </p>
              <p>
                Company shall notify Customer after Company determines that it
                can no longer meet its obligations under Data Protection Laws.
              </p>

              {/* Section 4 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                4. Confidentiality Obligations of Company Personnel
              </h2>
              <p>
                <strong>Security Policy and Confidentiality.</strong> Company
                requires all employees to acknowledge in writing, at the time of
                hire, they will adhere to terms that are in accordance with
                Company&rsquo;s security policy and to protect Customer Personal
                Data at all times. Company requires all employees to sign a
                confidentiality statement at the time of hire.
              </p>
              <p>
                Company will ensure that any person that it authorizes to process
                Customer Personal Data (including its staff, agents, and
                subcontractors) shall be subject to a duty of confidentiality
                (whether in accordance with Company&rsquo;s confidentiality
                obligations in the Agreement or a statutory duty).
              </p>

              {/* Section 5 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                5. Security
              </h2>
              <p>
                Taking into account the state of the art, the costs of
                implementation and the nature, scope, context and purposes of
                Processing as well as the risk of varying likelihood and severity
                for the rights and freedoms of natural persons, Processor shall
                in relation to the Customer Personal Data have in place and
                maintain throughout the term of the Terms and this DPA
                appropriate technical and organizational measures designed to
                ensure a level of security appropriate to that risk, including,
                as appropriate, the measures identified in Exhibit C hereto. In
                assessing the appropriate level of security, Processor shall take
                account in particular of the risks that are presented by
                Processing, in particular from a Personal Data Breach.
              </p>
              <p>
                Customer is solely responsible for its use of the Services,
                including (a) making appropriate use of the Services to ensure a
                level of security appropriate to the risk in respect of Customer
                Personal Data; (b) securing the account authentication
                credentials, systems and devices Customer uses to access the
                Service; and (c) backing up Customer Personal Data.
              </p>

              {/* Section 6 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                6. Subprocessing
              </h2>
              <p>
                Customer acknowledges and agrees that Company has Customer&rsquo;s
                general authorization to (1) engage its Affiliates and
                Sub-Processors to access and process Customer Personal Data
                solely in connection with the Services including the Permitted
                Purposes and (2) from time to time engage additional
                Sub-Processors for the purpose of providing the Services,
                including without limitation the processing of Customer Personal
                Data.
              </p>
              <p>
                A list of Company&rsquo;s current Sub-Processors (the
                &ldquo;List&rdquo;) is available to Customer at{" "}
                <a
                  href="/subprocessors"
                  className="text-blue-600 hover:underline"
                >
                  https://intelliconcierge.com/subprocessors
                </a>
                . Such List may be updated by Company from time to time. Upon
                request, Company will provide a mechanism to subscribe to
                notifications of changes or additions to the Sub-Processors on
                the List and Customer, if it wishes, will subscribe to such
                notifications. If Customer does not subscribe to such
                notifications, Customer waives any right it may have to receive
                prior notice of changes to the List. At least ten (10) days
                before enabling any change or addition to the Sub-Processors
                authorized by Company to perform Services under the Terms and
                this DPA, Company will make such change to the List and notify
                all subscribers to the List, including Customer if subscribed,
                via the aforementioned notification channels. Customer may object
                to such a change by informing Company in writing within fourteen
                (14) days of receipt of the aforementioned notice from Company,
                provided such objection is in writing and based on reasonable
                grounds relating to the protection of Customer Personal Data
                pursuant to the terms of this DPA. Customer acknowledges that
                certain Sub-Processors are essential to providing the Services
                and that objecting to the use of such a Sub-Processor may prevent
                Company from offering the Services to Customer.
              </p>
              <p>
                If Customer reasonably objects to an engagement in accordance
                with Section 6.2, and Company cannot provide a commercially
                reasonable alternative within a reasonable period of time,
                Customer may discontinue the use of the affected Service by
                providing written notice to Company. Discontinuation shall not
                relieve Customer of any fees owed to Company under the Terms.
              </p>
              <p>
                If Customer does not object to a Sub-Processor change or addition
                in accordance with Section 6.2 within the applicable notice
                period, such Sub-Processor change or addition shall be deemed
                accepted by Customer for the purposes of this DPA.
              </p>
              <p>
                Company will enter into a written agreement with all
                Sub-Processors imposing on them Sub-Processor data protection
                obligations comparable to those imposed on Company under this DPA
                with respect to the protection of Customer Personal Data. Company
                shall remain responsible for the acts and omissions of its
                Sub-Processors as if they were the acts and/or omissions of
                Company hereunder.
              </p>
              <p>
                If Customer and Company have entered into Standard Contractual
                Clauses as described in Section 12 (Transfers of Personal Data),
                (i) the above authorizations will constitute Customer&rsquo;s
                prior written consent to the subcontracting by Company of the
                processing of Customer Personal Data if such consent is required
                under the Standard Contractual Clauses, and (ii) the parties
                agree that the copies of the agreements with Sub-Processors that
                must be provided by Company to Customer pursuant to Clause 9(c)
                of the EU SCCs may have commercial information, or information
                unrelated to the Standard Contractual Clauses or their
                equivalent, removed by the Company beforehand, and that such
                copies will be provided by the Company only upon written request
                from Customer.
              </p>

              {/* Section 7 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                7. Data Subject Rights
              </h2>
              <p>
                Taking into account the nature of the Processing, Processor shall
                reasonably assist the Customer by implementing appropriate
                technical and organizational measures, insofar as this is
                possible, for the fulfillment of the Company obligations, as
                reasonably understood by Company, to respond to requests to
                exercise Data Subject rights under the Data Protection Laws.
              </p>
              <p>Processor shall:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  promptly notify Controller if it receives a request from a Data
                  Subject under any Data Protection Law in respect of Customer
                  Personal Data; and
                </li>
                <li>
                  ensure that it does not respond to a request from a Data
                  Subject identified as an individual connected to Customer
                  Personal Data except on the documented instructions of
                  Controller or as required by Data Protection Laws to which the
                  Processor is subject, in which case Processor shall to the
                  extent permitted by Data Protection Laws inform Controller of
                  that legal requirement before the Processor responds to the
                  request.
                </li>
              </ul>

              {/* Section 8 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                8. Personal Data Breach
              </h2>
              <p>
                Processor shall notify Controller within 72 hours upon Processor
                becoming aware of a Personal Data Breach affecting Customer
                Personal Data, providing Customer with sufficient information to
                allow the Customer to meet any obligations to report or inform
                Data Subjects of the Personal Data Breach under the Data
                Protection Laws.
              </p>
              <p>
                Processor shall cooperate with the Controller and take reasonable
                commercial steps as directed by Controller to assist in the
                investigation, mitigation and remediation of each such Personal
                Data Breach.
              </p>

              {/* Section 9 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                9. Data Protection Impact Assessment and Prior Consultation
              </h2>
              <p>
                Processor shall provide reasonable assistance to the Controller
                with any data protection impact assessments, and prior
                consultations with Supervising Authorities or other competent
                data privacy authorities, which Controller reasonably considers
                to be required by article 35 or 36 of the GDPR or equivalent
                provisions of any other Data Protection Law, in each case solely
                in relation to Processing of Customer Personal Data by, and
                taking into account the nature of the Processing and information
                available to, the Processor.
              </p>

              {/* Section 10 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                10. Deletion or Return of Customer Personal Data
              </h2>
              <p>
                Subject to this section, Processor shall promptly and in any
                event within 30 business days of the date of cessation of any
                Services involving the Processing of Customer Personal Data (the
                &ldquo;Cessation Date&rdquo;), delete and procure the deletion of
                all copies of those Customer Personal Data.
              </p>

              {/* Section 11 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                11. Audit Rights
              </h2>
              <p>
                Subject to the requirements of this section, Processor shall make
                available to Controller on written request all information
                necessary to demonstrate compliance with this DPA, and shall
                allow for and contribute to reasonable requests for audits,
                including inspections, by the Customer or a third-party auditor
                retained by the Customer in relation to the Processing of the
                Customer Personal Data by the Processor.
              </p>
              <p>
                All audits requested hereunder shall be (a) carried out at
                Customer&rsquo;s sole cost and expense, (b) mutual agreement as
                to the details of the audit including a reasonable start date,
                scope and duration of such audit, (c) subject to Company&rsquo;s
                security and confidentiality terms and guidelines, and (d) may
                only be performed a maximum of once annually (with exception for
                a Personal Data Breach). All third-party auditors must be
                approved by Company in writing in advance.
              </p>

              {/* Section 12 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                12. Restricted Transfer
              </h2>
              <p>
                The parties agree that Company may transfer Personal Data
                processed under this DPA outside the EEA, the UK, or Switzerland
                as necessary to provide the Services. Customer acknowledges that
                Company&rsquo;s primary processing operations take place in the
                United States, and that the transfer of Customer&rsquo;s Personal
                Data to the United States is necessary for the provision of the
                Services to Customer. If Company transfers Personal Data
                protected under this DPA to a jurisdiction for which the European
                Commission has not issued an adequacy decision, Company will
                ensure that appropriate safeguards have been implemented for the
                transfer of Personal Data in accordance with Data Protection
                Laws.
              </p>
              <p>
                The parties agree that Restricted Transfers are made pursuant to
                the EU SCCs, which are deemed entered into (and incorporated into
                this DPA by this reference) and completed as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Module One (Controller to Controller) of the EU SCCs apply when
                  both Company and Customer are processing Personal Data as a
                  Controller.
                </li>
                <li>
                  Module Two (Controller to Processor) of the EU SCCs apply when
                  Customer is a Controller and Company is a Processor to
                  Customer.
                </li>
                <li>
                  Module Three (Processor to Sub-Processor) of the EU SCCs apply
                  when Customer is a Processor and Company is a Sub-processor to
                  Customer.
                </li>
              </ul>
              <p>
                For each module, where applicable, the following applies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  In Clause 7, the optional docking clause does not apply.
                </li>
                <li>
                  In Clause 9, Option 2 (general written authorization) applies,
                  and the time period for notice is set forth in Section 6
                  (Sub-processing).
                </li>
                <li>
                  In Clause 11, the optional language does not apply.
                </li>
                <li>
                  All square brackets in Clause 13 are hereby removed.
                </li>
                <li>
                  In Clause 17 (Option 1), the EU SCCs will be governed by the
                  laws of the Republic of Ireland.
                </li>
                <li>
                  In Clause 18(b), disputes will be resolved before the courts of
                  Ireland.
                </li>
                <li>
                  Exhibit B to this DPA contains the information required in
                  Annex I and Annex III of the EU SCCs.
                </li>
                <li>
                  Exhibit C to this DPA contains the information required in
                  Annex II of the EU SCCs.
                </li>
                <li>
                  By entering into this DPA, the parties are deemed to have
                  signed the EU SCCs incorporated herein, including their Annexes.
                </li>
              </ul>
              <p>
                <strong>Ex-UK Transfers.</strong> The parties agree that ex-UK
                Transfers are made pursuant to the UK SCCs, which are deemed
                entered into and incorporated into this DPA by reference, and
                amended and completed in accordance with the UK Addendum, which
                is incorporated herein as Exhibit D of this DPA.
              </p>
              <p>
                <strong>Transfers from Switzerland.</strong> The parties agree
                that transfers of Customer Personal Data from Switzerland are
                made pursuant to the EU SCCs with the following modifications:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  The terms &ldquo;General Data Protection Regulation&rdquo; or
                  &ldquo;Regulation (EU) 2016/679&rdquo; as utilized in the EU
                  SCCs shall be interpreted to include the Federal Act on Data
                  Protection of 19 June 1992 (the &ldquo;FADP,&rdquo; and as
                  revised as of 25 September 2020, the &ldquo;Revised
                  FADP&rdquo;) with respect to data transfers subject to the
                  FADP.
                </li>
                <li>
                  The terms of the EU SCCs shall be interpreted to protect the
                  data of legal entities until the effective date of the Revised
                  FADP.
                </li>
                <li>
                  Clause 13 of the EU SCCs is modified to provide that the
                  Federal Data Protection and Information Commissioner
                  (&ldquo;FDPIC&rdquo;) of Switzerland shall have authority over
                  data transfers governed by the FADP and the appropriate EU
                  supervisory authority shall have authority over data transfers
                  governed by the EU GDPR. Subject to the foregoing, all other
                  requirements of Clause 13 shall be observed.
                </li>
                <li>
                  The term &ldquo;EU Member State&rdquo; as utilized in the EU
                  SCCs shall not be interpreted in such a way as to exclude Data
                  Subjects in Switzerland from exercising their rights in their
                  place of habitual residence in accordance with Clause 18(c) of
                  the EU SCCs.
                </li>
              </ul>
              <p>
                <strong>Supplementary Measures.</strong> In respect of any
                Restricted Transfer or ex-UK Transfer, the following
                supplementary measures shall apply:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  As of the date of this DPA, the Processor has not received any
                  formal legal requests from any government intelligence or
                  security service/agencies in the country to which the Customer
                  Personal Data is being exported, for access to (or for copies
                  of) Customer&rsquo;s Personal Data (&ldquo;Government Agency
                  Requests&rdquo;);
                </li>
                <li>
                  If, after the date of this DPA, the Processor receives any
                  Government Agency Requests, it shall attempt to redirect the
                  law enforcement or government agency to request that data
                  directly from Customer. As part of this effort, Company may
                  provide Customer&rsquo;s basic contact information to the
                  government agency. If compelled to disclose Customer&rsquo;s
                  Personal Data to a law enforcement or government agency, Company
                  shall give Customer reasonable notice of the demand and
                  cooperate to allow Customer to seek a protective order or other
                  appropriate remedy unless Company is legally prohibited from
                  doing so. Company shall not voluntarily disclose Customer
                  Personal Data to any law enforcement or government agency.
                  Customer and Company shall (as soon as reasonably practicable)
                  discuss and determine whether all or any transfers of Customer
                  Personal Data pursuant to this DPA should be suspended in the
                  light of such Government Agency Requests; and
                </li>
                <li>
                  The Customer and Company will meet as needed to consider
                  whether: the protection afforded by the laws of the country of
                  the Processor to data subjects whose Personal Data is being
                  transferred is sufficient to provide broadly equivalent
                  protection to that afforded in the EEA or the UK; additional
                  measures are reasonably necessary to enable the transfer to be
                  compliant with the Data Protection Laws; and it is still
                  appropriate for Personal Data to be transferred to the relevant
                  Processor.
                </li>
              </ul>
              <p>
                To the extent that Company adopts an alternative data transfer
                mechanism (including any new version of or successor to the SCCs
                adopted pursuant to Data Protection Laws), (&ldquo;Alternative
                Transfer Mechanism&rdquo;) the Alternative Transfer Mechanism
                shall upon written notice to Customer and an opportunity to
                object, apply instead of any applicable transfer mechanism
                described in this DPA (but only to the extent such Alternative
                Transfer Mechanism complies with Data Protection Legislation
                applicable to the EEA and extends to territories to which
                Customer Personal Data is transferred).
              </p>

              {/* Section 13 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                13. No Sale or Sharing
              </h2>
              <p>
                To the extent that the processing of Customer Personal Data is
                subject to U.S. data protection laws, Company is prohibited from:
                (a) selling Customer Personal Data or otherwise making Customer
                Personal Data available to any third party for monetary or other
                valuable consideration; (b) sharing Customer Personal Data with
                any third party for cross-behavioral advertising; (c) retaining,
                using, or disclosing Customer Personal Data for any purpose other
                than for the business purposes specified in this DPA or as
                otherwise permitted by U.S. data protection laws; (d) retaining,
                using or disclosing Customer Personal Data outside of the direct
                business relationship between the parties, and; (e) except as
                otherwise permitted by U.S. data protection laws, combining
                Customer Personal Data with personal data that Company receives
                from or on behalf of another person or persons, or collects from
                its own interaction with the data subject. Company will notify
                Customer promptly if it makes the determination that it can no
                longer meet its obligations under applicable U.S. data protection
                laws.
              </p>

              {/* Section 14 */}
              <h2 className="text-2xl font-bold text-gray-900 mt-10">
                14. General Terms
              </h2>
              <p>
                <strong>Confidentiality.</strong> Each Party must keep this DPA
                and information it receives about the other Party and its
                business in connection with this DPA and the Terms
                (&ldquo;Confidential Information&rdquo;) confidential and must
                not use or disclose that Confidential Information without the
                prior written consent of the other Party except to the extent
                that: (a) disclosure is required by law; (b) the relevant
                information is already in the public domain.
              </p>
              <p>
                <strong>Notices.</strong> All notices and communications given
                under this DPA must be in writing and will be delivered
                personally, sent by post, sent by email, or sent to the address
                or email address as notified from time to time by the Parties in
                writing.
              </p>
              <p>
                Any claims brought in connection with this DPA will be subject to
                the terms and conditions, including, but not limited to, the
                exclusions and limitations set forth in the Terms.
              </p>
              <p>
                Notwithstanding anything in the Terms or any order form entered
                in connection therewith, the parties acknowledge and agree that
                Company&rsquo;s access to Customer Personal Data does not
                constitute part of the consideration exchanged by the parties in
                respect of the Services.
              </p>
              <p>
                In no event shall this DPA benefit or create any right or cause
                of action on behalf of a third party (including a Third-Party
                Controller), but without prejudice to the rights or remedies
                available to Data Subjects under Data Protection Laws or this DPA
                (including the SCCs).
              </p>

              {/* Exhibit A */}
              <h2 className="text-3xl font-bold text-gray-900 mt-14 border-t pt-10">
                EXHIBIT A &mdash; Details of Processing
              </h2>
              <p>
                <strong>Nature and Purpose of Processing:</strong> Company will
                Process Customer Personal Data as necessary to provide the
                Services under the Agreement, for the purposes specified in the
                Agreement and this DPA, and in accordance with Customer&rsquo;s
                instructions as set forth in this DPA. The nature of Processing
                includes, without limitation:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Receiving data, including collection, accessing, retrieval,
                  recording, and data entry
                </li>
                <li>
                  Protecting data, including restricting, encrypting, and security
                  testing
                </li>
                <li>
                  Holding data, including storage, organization, and structuring
                </li>
                <li>Erasing data, including destruction and deletion</li>
                <li>
                  Analyzing data, including product usage assessment
                </li>
                <li>
                  Sharing data, including disclosure to subprocessors as permitted
                  in this DPA
                </li>
              </ul>
              <p>
                <strong>Duration of Processing:</strong> Company will Process
                Customer Personal Data as long as required (i) to provide the
                Services to Customer under the Agreement; (ii) for Company&rsquo;s
                legitimate business needs; or (iii) by applicable law or
                regulation.
              </p>
              <p>
                <strong>Frequency of the transfer:</strong> Continuous.
              </p>
              <p>
                <strong>Categories of Data Subjects:</strong> Data Subjects
                include the individuals whose Customer Personal Data is provided
                to Company through the Services by or at the direction of
                Customer or by any employee or end user of Customer which may
                include, but is not limited to Personal Data relating to users,
                employees, contractors, agents, vendors, customers, visitors, and
                such other individuals whose Personal Data may be submitted to
                the Services; the extent of which is determined and controlled by
                Customer in its sole discretion depending on its use of the
                Services.
              </p>
              <p>
                <strong>Categories of Personal Data:</strong> Personal Data
                relating to individuals provided to Company via the Services, by
                or at the direction of Customer which may include, but is not
                limited to the following categories of Personal Data: name,
                email, phone number, WhatsApp telephone number, job title,
                payment information, communication data (messages, conversations,
                media), and device/usage information; the extent of which is
                determined and controlled by Customer in its sole discretion
                depending on its use of the Services.
              </p>

              {/* Exhibit B */}
              <h2 className="text-3xl font-bold text-gray-900 mt-14 border-t pt-10">
                EXHIBIT B &mdash; Transfer Details
              </h2>
              <p>
                The following includes the information required by Annex I and
                Annex III of the EU SCCs, and Table 1, Annex 1A, and Annex 1B of
                the UK Addendum.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                1. The Parties
              </h3>
              <p>
                <strong>Data exporter(s):</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Name:</strong> The party named as
                  &ldquo;Customer&rdquo; in the Terms.
                </li>
                <li>
                  <strong>Address:</strong> The address for Customer associated
                  with its Company account or as otherwise specified in the Order
                  Form or Terms.
                </li>
                <li>
                  <strong>Contact person:</strong> The contact details for
                  Customer associated with its Company account or as otherwise
                  specified in the Order Form or Terms.
                </li>
                <li>
                  <strong>Activities:</strong> As described in Section 2 of the
                  DPA.
                </li>
                <li>
                  <strong>Signature and date:</strong> By using the Services to
                  transfer Customer Personal Data to Company located in a
                  non-adequate country, the data exporter will be deemed to have
                  signed this Exhibit B.
                </li>
                <li>
                  <strong>Role:</strong> Controller
                </li>
              </ul>
              <p>
                <strong>Data importer(s):</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Name:</strong> Intelli Holdings Inc
                </li>
                <li>
                  <strong>Address and contact:</strong> 251 Little Falls Drive,
                  Wilmington, Delaware 19808;{" "}
                  <a
                    href="mailto:support@intelliconcierge.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@intelliconcierge.com
                  </a>
                </li>
                <li>
                  <strong>Activities:</strong> As described in Section 2 of the
                  DPA.
                </li>
                <li>
                  <strong>Signature and date:</strong> By transferring Customer
                  Personal Data to a non-adequate country on Customer&rsquo;s
                  instructions, the data importer will be deemed to have signed
                  this Exhibit B.
                </li>
                <li>
                  <strong>Role:</strong> Processor
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                2. Description of the Transfer
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50 w-1/3">
                        Data Subjects
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Categories of Personal Data
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Special Category Personal Data
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Nature of the Processing
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Purposes of Processing
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Duration of Processing
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Frequency of the transfer
                      </td>
                      <td className="px-4 py-3">
                        As described in Exhibit A of the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Recipients of Personal Data
                      </td>
                      <td className="px-4 py-3">
                        Company maintains a list of Subprocessors at:{" "}
                        <a
                          href="/subprocessors"
                          className="text-blue-600 hover:underline"
                        >
                          https://intelliconcierge.com/subprocessors
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                3. Competent Supervisory Authority
              </h3>
              <p>
                The supervisory authority shall be the supervisory authority of
                the Data Exporter, as determined in accordance with Clause 13 of
                the EU SCCs. The supervisory authority for the purposes of the UK
                Addendum shall be the UK Information Commissioner&rsquo;s Office.
              </p>

              {/* Exhibit C */}
              <h2 className="text-3xl font-bold text-gray-900 mt-14 border-t pt-10">
                EXHIBIT C &mdash; Technical and Organizational Security Measures
              </h2>
              <p>
                Description of the Technical and Organizational Security Measures
                implemented by the Data Importer.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold w-1/3">
                        Security Measure
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Encryption of personal data
                      </td>
                      <td className="px-4 py-3">
                        Company uses AES-256-GCM for field-level encryption of
                        sensitive data at rest. All data in transit is encrypted
                        using TLS 1.2+. Database storage uses Azure transparent
                        disk encryption with AES-256.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Confidentiality, integrity, availability and resilience
                      </td>
                      <td className="px-4 py-3">
                        Company&rsquo;s customer agreements contain strict
                        confidentiality obligations. All downstream subprocessors
                        are required to sign confidentiality provisions
                        substantially similar to those in Company&rsquo;s
                        customer agreements.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Availability and access restoration
                      </td>
                      <td className="px-4 py-3">
                        Regular backups of production datastores are taken and
                        periodically tested in accordance with information
                        security and data management policies.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Regular security testing
                      </td>
                      <td className="px-4 py-3">
                        Company regularly tests and assesses technical and
                        organizational measures, including prompt injection
                        detection, input validation, and PII scrubbing for AI
                        model interactions.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        User identification and authorization
                      </td>
                      <td className="px-4 py-3">
                        Company uses Clerk for secure authentication with
                        multi-factor authentication and organization-scoped
                        access control. All API requests require JWT
                        authentication. Rate limiting is enforced per user, per
                        organization, and per IP address.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Protection of data during transmission
                      </td>
                      <td className="px-4 py-3">
                        All external communications use HTTPS/TLS. Webhook
                        payloads are verified using HMAC-SHA256/SHA512 with
                        timing-safe comparison to prevent tampering.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Protection of data during storage
                      </td>
                      <td className="px-4 py-3">
                        Encryption-at-rest using Azure transparent disk encryption
                        (AES-256). Field-level encryption using AES-256-GCM for
                        sensitive fields. Sensitive data is redacted from
                        application logs.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Physical security
                      </td>
                      <td className="px-4 py-3">
                        All processing occurs in physical data centers managed by
                        Microsoft Azure and Vercel, which maintain
                        industry-standard physical security controls.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Events logging and monitoring
                      </td>
                      <td className="px-4 py-3">
                        Company monitors access to applications and resources
                        that process or store Customer Data using Sentry for
                        error monitoring and PostHog for product analytics.
                        Security-sensitive data is scrubbed from monitoring
                        platforms.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        System configuration management
                      </td>
                      <td className="px-4 py-3">
                        Company adheres to a change management process using
                        CI/CD tools to ensure consistent configurations for all
                        production changes.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Data minimization
                      </td>
                      <td className="px-4 py-3">
                        Customers determine what data they route through the
                        Services. Company operates on a shared responsibility
                        model, giving customers control over what data enters the
                        platform. PII is scrubbed before being sent to AI/LLM
                        providers.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Data retention and erasure
                      </td>
                      <td className="px-4 py-3">
                        Customers can delete Personal Data via self-service
                        functionality. All Personal Data is deleted following
                        service termination within 30 business days.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Sub-processor measures
                      </td>
                      <td className="px-4 py-3">
                        Company enters into Data Processing Agreements with
                        authorized Sub-Processors with data protection
                        obligations substantially similar to those in this DPA.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Exhibit D */}
              <h2 className="text-3xl font-bold text-gray-900 mt-14 border-t pt-10">
                EXHIBIT D &mdash; UK Addendum
              </h2>
              <p>
                International Data Transfer Addendum to the EU Commission
                Standard Contractual Clauses
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                Table 1: Parties
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50 w-1/3">
                        Start Date
                      </td>
                      <td className="px-4 py-3">
                        This UK Addendum shall have the same effective date as
                        the DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Exporter
                      </td>
                      <td className="px-4 py-3">Customer</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Importer
                      </td>
                      <td className="px-4 py-3">Intelli Holdings Inc</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Key Contact
                      </td>
                      <td className="px-4 py-3">See Exhibit B of this DPA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                Table 2: Selected SCCs, Modules and Selected Clauses
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50 w-1/3">
                        Addendum EU SCCs
                      </td>
                      <td className="px-4 py-3">
                        The version of the Approved EU SCCs which this UK
                        Addendum is appended to as defined in and completed in
                        the DPA.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                Table 3: Appendix Information
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50 w-1/3">
                        Annex 1A: List of Parties
                      </td>
                      <td className="px-4 py-3">As per Table 1 above</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Annex 2B: Description of Transfer
                      </td>
                      <td className="px-4 py-3">
                        See Exhibit B of this DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Annex II: Technical and organisational measures
                      </td>
                      <td className="px-4 py-3">
                        See Exhibit C of this DPA
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50">
                        Annex III: List of Sub processors
                      </td>
                      <td className="px-4 py-3">
                        See Exhibit B of this DPA
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-6">
                Table 4: Ending this UK Addendum
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium bg-gray-50 w-1/3">
                        Which Parties may end this Addendum
                      </td>
                      <td className="px-4 py-3">Importer and Exporter</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Contact */}
              <div className="mt-14 border-t pt-10 text-center text-sm text-gray-500">
                <p>
                  For questions about this Data Processing Agreement, please
                  contact us at{" "}
                  <a
                    href="mailto:support@intelliconcierge.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@intelliconcierge.com
                  </a>
                </p>
                <p className="mt-2">
                  Intelli Holdings Inc, 251 Little Falls Drive, Wilmington,
                  Delaware 19808, USA
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
