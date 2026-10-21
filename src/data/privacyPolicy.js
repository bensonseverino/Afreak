/**
 * Privacy Policy content.
 *
 * All copy lives here so `src/pages/PrivacyPolicy.jsx` only renders data.
 * Placeholders come from `src/data/siteInfo.js` and are interpolated at render
 * time. Inline `**bold**` and `[label](/path)` links are supported by the
 * shared legal renderer.
 */

export const privacySections = [
  {
    id: 'introduction',
    title: 'Introduction',
    blocks: [
      {
        type: 'paragraph',
        text: `{{LEGAL_ENTITY}} ("We," "us," or "our"), operating as Afreak, respects your privacy and is committed to protecting it through our compliance with this policy. We are the data controller responsible for your Personal Information.`,
      },
      {
        type: 'paragraph',
        text: `This policy describes the types of information we may collect from you or that you may provide when you visit our online, digital, or mobile services, including the website {{WEBSITE_URL}}, and any of our other products and services in connection with which this Privacy Policy is posted or from which it is linked (collectively, the "Service"). It also explains how we use and protect that information, and your rights regarding your personal information.`,
      },
      {
        type: 'paragraph',
        text: `By accessing or using the Service, you agree to this Privacy Policy. If you do not agree, please discontinue use of the Service. We may update this Privacy Policy periodically. We will notify you of material changes by posting a notice on the Service or by other means as required by law. For material changes that affect your rights under applicable law, we will obtain your affirmative consent before the changes take effect. Your continued use of the Service after we provide notice of non-material changes constitutes acceptance of those changes.`,
      },
    ],
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    blocks: [
      {
        type: 'paragraph',
        text: `When you visit, access, or use the Service, we collect certain information about your device, your interaction with the Service, your account, and the information necessary to process your purchases and custom print orders. We may also collect additional information if you contact us for support.`,
      },
      {
        type: 'paragraph',
        text: `In this Privacy Policy, "Personal Information" means any information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or household.`,
      },
      { type: 'subheading', text: 'Account Information' },
      {
        type: 'list',
        items: [
          `**Examples:** name, email address, phone number, password (stored in hashed form only), saved addresses, saved payment methods (handled by our payment processor), and order history.`,
          `**Purpose:** to create and manage your Afreak account, let you sign in with your email or phone number, show your orders, and keep your details up to date.`,
          `**Source:** collected directly from you when you sign up or edit your account.`,
          `**Account review:** new accounts may be held in a pending state until our team approves them. Our team can create, delete, or reset accounts when needed for support or security.`,
          `**Disclosure:** shared only with the service providers that host and operate the Service.`,
        ],
      },
      { type: 'subheading', text: 'Order Information' },
      {
        type: 'list',
        items: [
          `**Examples:** name, billing address, shipping address, email address, phone number, and payment details (processed securely by {{PAYMENT_PROCESSOR}}). We do not store full card numbers on our servers.`,
          `**Purpose:** to fulfill orders and provide our products and services, including processing payments, printing and producing items, arranging shipping, sending order confirmations, detecting and preventing fraud, communicating with you about your order, and sending marketing communications when consistent with your preferences.`,
          `**Source:** collected directly from you during checkout or account creation.`,
          `**Disclosure:** shared with {{PAYMENT_PROCESSOR}} (payments), {{SHIPPING_PARTNERS}} (shipping and fulfillment), and {{SUPPORT_TOOL}} (customer support).`,
        ],
      },
      { type: 'subheading', text: 'Custom Design and Artwork Files' },
      {
        type: 'list',
        items: [
          `**Examples:** images, graphics, text, and other files you upload or submit when placing a custom print order.`,
          `**Purpose:** to produce your custom items and verify that the artwork can be printed.`,
          `**Source:** collected directly from you.`,
          `**Storage:** files are stored securely on our cloud infrastructure and used only to fulfill your order, provide support, and handle disputes.`,
          `**Your responsibility:** you must own, or have permission to use, any artwork you upload. We may decline to print content that infringes the rights of others or violates our policies.`,
        ],
      },
      { type: 'subheading', text: 'Device and Usage Information' },
      {
        type: 'list',
        items: [
          `**Examples:** browser version, IP address, time zone, cookie data, and browsing behavior (pages viewed, interaction with products, and search terms). This is gathered through cookies, log files, and similar technologies, and may include {{ANALYTICS_TOOLS}}.`,
          `**Purpose:** to display the Service properly, maintain performance and security, conduct analytics, improve your browsing experience, and prevent fraud. With your prior consent, this information may also support advertising and retargeting.`,
          `**Source:** collected automatically when you access the Service.`,
          `**Disclosure:** shared with service providers that support analytics, advertising, and hosting. These providers are contractually obligated to use your Personal Information only for the purposes for which it was disclosed and to maintain appropriate security measures. Some of them may be located outside your country, and your information may be transferred to, stored, and processed in other countries. For such transfers we implement appropriate safeguards as required by applicable law.`,
        ],
      },
      { type: 'subheading', text: 'Customer Support and Form Submissions' },
      {
        type: 'list',
        items: [
          `**Examples:** information you provide when contacting us or submitting forms on the Service, such as your name, email address, order details, and message content.`,
          `**Purpose:** to respond to your inquiries, resolve issues, and provide customer assistance.`,
          `**Source:** collected directly from you.`,
          `**Disclosure:** shared with {{SUPPORT_TOOL}} and the providers that host our systems.`,
        ],
      },
      { type: 'subheading', text: 'Reviews and User Content' },
      {
        type: 'list',
        items: [
          `**Examples:** product reviews, ratings, and any content you choose to submit publicly.`,
          `**Purpose:** to display feedback to other shoppers and improve our products.`,
          `**Note:** reviews may be displayed publicly alongside your first name or chosen display name. Do not include sensitive personal information in reviews.`,
        ],
      },
    ],
  },
  {
    id: 'sharing-personal-information',
    title: 'Sharing Personal Information',
    blocks: [
      {
        type: 'paragraph',
        text: `We share your Personal Information with trusted service providers who help us deliver our services and fulfill our contractual obligations. For example, we share information with {{PAYMENT_PROCESSOR}}, {{SHIPPING_PARTNERS}}, {{SUPPORT_TOOL}}, our hosting and infrastructure providers, and analytics and advertising partners for order fulfillment, payment processing, customer service, performance analytics, and (with your consent where required) targeted advertising.`,
      },
      {
        type: 'paragraph',
        text: `We may also share Personal Information as required by law, for example to comply with a subpoena, court order, or lawful request, or to protect our rights, customers, and the security of the Service.`,
      },
      {
        type: 'paragraph',
        text: `We do not sell your Personal Information for money.`,
      },
    ],
  },
  {
    id: 'marketing-email-sms',
    title: 'Marketing, Email and SMS',
    blocks: [
      { type: 'paragraph', text: `We use {{EMAIL_SMS_PROVIDER}} for email and SMS marketing.` },
      { type: 'paragraph', text: `We may send:` },
      {
        type: 'list',
        items: [`Promotional emails`, `SMS messages (only if you opted in)`, `Cart reminder emails or SMS (only with your consent where required)`],
      },
      {
        type: 'paragraph',
        text: `We use cookies to help track items placed in your cart. With your prior express consent, this allows us to send cart reminders.`,
      },
      {
        type: 'paragraph',
        text: `By providing your mobile phone number and checking the opt-in box, you expressly consent to receive recurring marketing and transactional text messages from Afreak and our service providers. Consent is not a condition of purchase. Message and data rates may apply, and you are responsible for all charges imposed by your wireless provider. Message frequency varies.`,
      },
      {
        type: 'paragraph',
        text: `You may opt out at any time by replying STOP to any message, using the unsubscribe link in any email, or contacting us at {{CONTACT_EMAIL}}. For help, reply HELP or contact us at {{CONTACT_EMAIL}}. After you opt out you will receive a one-time confirmation message, and no further messages will be sent unless you initiate contact.`,
      },
      {
        type: 'paragraph',
        text: `Your SMS opt-in information and phone number will not be shared with third parties for their own marketing purposes. We may share it with service providers who help us deliver messages, and they are contractually prohibited from using it for any other purpose.`,
      },
      {
        type: 'paragraph',
        text: `To the extent permitted by applicable law, neither we nor the wireless carriers supported by the Service are liable for failed, delayed, misdirected, or undelivered messages.`,
      },
    ],
  },
  {
    id: 'behavioral-advertising',
    title: 'Behavioral Advertising',
    blocks: [
      {
        type: 'paragraph',
        text: `We may use Personal Information to provide you with targeted advertising and marketing communications that we believe may interest you.`,
      },
      {
        type: 'paragraph',
        text: `You can opt out of targeted advertising through the platform tools of the advertising networks we use, such as your Facebook, Google, TikTok, or Pinterest ad preference settings. You can also opt out of many advertising services through the Digital Advertising Alliance at optout.aboutads.info. Residents of certain regions can also exercise their right to opt out of the sale or sharing of personal information by contacting us at {{CONTACT_EMAIL}}.`,
      },
    ],
  },
  {
    id: 'how-we-use-personal-information',
    title: 'How We Use Personal Information',
    blocks: [
      {
        type: 'paragraph',
        text: `We use your Personal Information to provide and improve our services, including offering products for sale, creating and managing accounts, processing payments, producing and shipping orders, providing customer support, sending transactional communications, and keeping you informed about new drops, products, and promotions.`,
      },
    ],
  },
  {
    id: 'gdpr',
    title: 'Legal Bases for EEA and UK Users',
    blocks: [
      {
        type: 'paragraph',
        text: `If you are located in the European Economic Area (EEA) or the United Kingdom, you have certain rights under the General Data Protection Regulation (GDPR). These include:`,
      },
      {
        type: 'list',
        items: [
          `The right to access, correct, update, or delete your Personal Information`,
          `The right to object to or restrict our processing`,
          `The right to data portability`,
          `The right not to be subject to automated decision-making, including profiling, that produces legal or similarly significant effects`,
          `The right to withdraw consent at any time and to lodge a complaint with your local data protection authority`,
        ],
      },
      {
        type: 'paragraph',
        text: `To exercise any of these rights, contact us at {{CONTACT_EMAIL}}.`,
      },
      {
        type: 'paragraph',
        text: `We only process your Personal Information under the following lawful bases:`,
      },
      {
        type: 'list',
        items: [
          `Your consent`,
          `Performance of a contract`,
          `Compliance with legal obligations`,
          `Protection of your vital interests`,
          `A task carried out in the public interest`,
          `Our legitimate interests, provided they do not outweigh your rights`,
        ],
      },
    ],
  },
  {
    id: 'california',
    title: 'California Residents',
    blocks: [
      {
        type: 'paragraph',
        text: `If you are a California resident, this section describes your rights under the California Consumer Privacy Act (CCPA), as amended. If any other part of this Policy conflicts with this section, the provision more protective of your Personal Information applies.`,
      },
      {
        type: 'paragraph',
        text: `**Right to Access.** You may request information about our collection and use of your Personal Information during the past 12 months. After verifying your identity, we will provide:`,
      },
      {
        type: 'list',
        items: [
          `Categories of Personal Information collected`,
          `Sources of that information`,
          `Business or commercial purposes for collection, sale, or sharing`,
          `Categories of third parties with whom it was shared`,
          `Specific pieces of Personal Information collected`,
          `Categories of Personal Information disclosed or sold in the past 12 months`,
        ],
      },
      {
        type: 'paragraph',
        text: `**Right to Deletion.** You may request that we delete Personal Information we collected from you, subject to exceptions under the CCPA (for example, information needed to complete a transaction, detect security incidents, comply with legal obligations, or exercise free speech rights). If an exception applies, we will tell you the reason for denial.`,
      },
      {
        type: 'paragraph',
        text: `**Right to Correct.** You may request that we correct inaccurate Personal Information we maintain about you. After verifying your identity and the inaccuracy, we will use commercially reasonable efforts to correct it. We will respond within 45 days (or up to 90 days if reasonably necessary, with notice).`,
      },
      {
        type: 'paragraph',
        text: `**Right to Opt Out of Sale or Sharing.** You have the right to opt out of the sale or sharing of your Personal Information. "Sale" means disclosing Personal Information to a third party for monetary or other valuable consideration. "Sharing" means disclosing it to a third party for cross-context behavioral advertising. To opt out, email {{CONTACT_EMAIL}}. We also honor Global Privacy Control (GPC) browser signals as a valid opt-out request. Once you opt out, we will not ask you to reauthorize for at least 12 months. You may opt back in at any time by emailing us.`,
      },
      {
        type: 'paragraph',
        text: `**Exercising Your Rights.** To exercise your access, deletion, or correction rights, you (or your authorized agent) must submit a verifiable consumer request that clearly describes your request. We will only use the Personal Information in the request to verify your identity or authority. We will respond within 45 days of receipt (or up to 90 days if reasonably necessary, with notice of the extension and reason). We do not charge a fee unless the request is excessive, repetitive, or manifestly unfounded. If we determine that a fee is warranted, we will explain why and give you a cost estimate before completing your request.`,
      },
      {
        type: 'paragraph',
        text: `**Authorized Agents.** You may designate an authorized agent to submit requests on your behalf. You must provide the agent with written permission, and we may require you to verify your identity directly with us and confirm that you gave the agent permission. We may deny a request from an agent who does not submit proof of authorization.`,
      },
      {
        type: 'paragraph',
        text: `**California "Shine the Light."** California residents may request, once per year and free of charge, a list of third parties to whom we disclosed Personal Information for direct marketing purposes. Email {{CONTACT_EMAIL}} with "California Privacy Rights" in the subject line.`,
      },
    ],
  },
  {
    id: 'us-state-rights',
    title: 'Other US State Privacy Rights',
    blocks: [
      {
        type: 'paragraph',
        text: `Residents of certain U.S. states, including Virginia, Colorado, Connecticut, Utah, Oregon, Texas, and Montana, have rights regarding their Personal Information. Depending on your state, you may have the right to:`,
      },
      {
        type: 'list',
        ordered: true,
        items: [
          `Confirm whether we process your Personal Information and access it`,
          `Correct inaccuracies`,
          `Delete your Personal Information`,
          `Obtain a copy in a portable, readily usable format (where technically feasible)`,
          `Opt out of processing for targeted advertising, sale, or profiling in furtherance of decisions that produce legal or similarly significant effects`,
        ],
      },
      {
        type: 'paragraph',
        text: `You may exercise these rights by contacting us at {{CONTACT_EMAIL}}. We will respond within the timeframes required by applicable state law (typically 45 days, with possible extension) and will verify your request as required by law. We will not discriminate against you for exercising your privacy rights.`,
      },
    ],
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    blocks: [
      {
        type: 'paragraph',
        text: `We do not knowingly collect or solicit Personal Information from children under 13 without verifiable parental consent as required by the Children's Online Privacy Protection Act (COPPA). The Service is not directed to children under 13. We also do not knowingly sell or share the Personal Information of consumers under 16 without affirmative authorization as required by applicable law.`,
      },
      {
        type: 'paragraph',
        text: `If you are a parent or guardian and believe we may have collected Personal Information from a child under 13 without verifiable parental consent, or from a minor under 16 without proper authorization, please contact us immediately at {{CONTACT_EMAIL}} and we will promptly investigate and delete that information as required by law.`,
      },
    ],
  },
  {
    id: 'retention',
    title: 'Data Retention',
    blocks: [
      {
        type: 'paragraph',
        text: `We retain Personal Information only for as long as reasonably necessary for the purposes described in this Privacy Policy or as required by law. Specifically, we retain your information:`,
      },
      {
        type: 'list',
        ordered: true,
        items: [
          `For as long as your account is active or as needed to provide you services`,
          `As necessary to fulfill your orders and provide customer service`,
          `As necessary to comply with legal, tax, accounting, and record-keeping obligations (typically up to 7 years for financial records)`,
          `As necessary to resolve disputes and enforce our agreements`,
          `As otherwise permitted or required by applicable law`,
        ],
      },
      {
        type: 'paragraph',
        text: `Uploaded custom artwork is kept only as long as needed to fulfill your order, handle returns or disputes, and support reorders, unless you ask us to delete it sooner.`,
      },
      {
        type: 'paragraph',
        text: `When Personal Information is no longer needed, we will securely delete or anonymize it in accordance with our retention schedule, unless a longer period is required or permitted by law. You may request deletion at any time, subject to legal exceptions.`,
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    blocks: [
      {
        type: 'paragraph',
        text: `We use reasonable technical and organizational measures to protect your Personal Information, including encrypted connections (HTTPS), hashed passwords, and restricted access to our systems. Payments are handled by our payment processor, and we do not store full card numbers. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.`,
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies',
    blocks: [
      {
        type: 'paragraph',
        text: `Cookies are small files downloaded to your device when you visit, access, or use the Service. We use different types of cookies, including:`,
      },
      {
        type: 'list',
        items: [`Functional cookies`, `Performance and analytics cookies`, `Advertising cookies`, `Social media and content cookies`],
      },
      {
        type: 'paragraph',
        text: `Cookies help the Service remember your preferences and provide insight into how visitors use it. You can control or disable cookies through your browser settings, though this may affect Service functionality. Certain cookies used for targeted advertising may constitute "sharing" of Personal Information under applicable law, and you have the right to opt out as described above.`,
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    blocks: [
      {
        type: 'paragraph',
        text: `We are committed to keeping you informed about changes to this Privacy Policy. Updates will be posted on this page, and the "Last Updated" date at the top will be revised. If we make material changes to how we handle your Personal Information, or changes that materially affect your rights, we will notify you by posting a prominent notice on the Service and, where required by law, by email at least 30 days before the changes take effect. We will not apply material changes retroactively without your consent where required by law.`,
      },
      {
        type: 'paragraph',
        text: `It is your responsibility to keep a current, active, and deliverable email address on your account and to periodically review this page.`,
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    blocks: [
      {
        type: 'contact',
        text: `To ask questions or comment about this Privacy Policy and our privacy practices, contact us:`,
        rows: [
          { label: 'Email', value: '{{CONTACT_EMAIL}}', mailto: true },
          { label: 'Phone', value: '{{CONTACT_PHONE}}', omitIfPlaceholder: true },
          { label: 'Mail', value: '{{LEGAL_ENTITY}}, {{MAILING_ADDRESS}}' },
        ],
      },
    ],
  },
];
