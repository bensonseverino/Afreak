/**
 * Terms & Conditions content.
 *
 * All copy lives here so `src/pages/Terms.jsx` only renders data.
 * Placeholders come from `src/data/siteInfo.js` and are interpolated at render
 * time. Inline `**bold**` and `[label](/path)` links are supported by the
 * shared legal renderer.
 *
 * The arbitration clause (section `dispute-resolution` and the matching
 * sentence in the notice) is a legal decision for the store owner: set
 * `INCLUDE_ARBITRATION` to false to remove both at once. The clause came from a
 * US-style reference document and needs legal review for the store's actual
 * jurisdiction.
 */

export const INCLUDE_ARBITRATION = true;

const noticeParagraphs = [
  `**PLEASE READ THESE TERMS CAREFULLY.** They contain important information about your legal rights and obligations, as well as conditions, limitations, and exclusions that may apply to you.`,
  ...(INCLUDE_ARBITRATION
    ? [
        `These Terms require the use of individual arbitration to resolve disputes, rather than jury trials or class actions, subject to your right to opt out as described below.`,
      ]
    : []),
  `By accessing or using the Service, including by browsing the website, creating an account, or placing an order, you acknowledge that you have read, understand, and agree to be bound by these Terms and our [Privacy Policy](/privacy), which is incorporated by reference. If you do not agree, do not use the Service.`,
];

export const termsNotice = {
  type: 'callout',
  paragraphs: noticeParagraphs,
};

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    blocks: [
      {
        type: 'paragraph',
        text: `This website, located at {{WEBSITE_URL}}, is operated by {{LEGAL_ENTITY}}, doing business as Afreak ("Afreak," "we," "us," or "our"). These Terms & Conditions ("Terms") govern your access to and use of the website and any related online, digital, or mobile services, content, and features provided by Afreak (collectively, the "Service").`,
      },
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility and Use of the Service',
    blocks: [
      { type: 'paragraph', text: `You may not use the Service or place an order if you:` },
      {
        type: 'list',
        ordered: true,
        items: [
          `Do not agree to these Terms`,
          `Are under {{MIN_AGE}} years of age`,
          `Are prohibited from accessing or using the Service under applicable law`,
        ],
      },
      {
        type: 'paragraph',
        text: `By using the Service, you represent and warrant that you are purchasing products for personal or household use only, and not for resale, redistribution, or export, unless we have agreed otherwise in writing (for example, a bulk or wholesale arrangement).`,
      },
      {
        type: 'paragraph',
        text: `If you access or place an order on behalf of a business or other entity, you represent that you have authority to bind that entity to these Terms.`,
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts',
    blocks: [
      {
        type: 'paragraph',
        text: `You may create an account using your email address or phone number. By creating an account you agree that:`,
      },
      {
        type: 'list',
        items: [
          `The information you provide is accurate and kept up to date`,
          `You are responsible for keeping your password confidential and for all activity under your account`,
          `You will notify us right away of any unauthorized use of your account`,
        ],
      },
      {
        type: 'paragraph',
        text: `**Account approval.** New accounts may be reviewed before they are activated. We may approve, hold, or decline any account request at our discretion. Our team may also create, suspend, delete, or reset accounts when needed for support, security, or to enforce these Terms.`,
      },
    ],
  },
  {
    id: 'changes-to-terms',
    title: 'Changes to Terms',
    blocks: [
      {
        type: 'paragraph',
        text: `We may modify these Terms at any time. Material changes take effect fifteen (15) days after we post notice on the website or send notice to the email address on file. Changes to the dispute resolution provisions require your affirmative consent where the law requires it. Your continued use of the Service after the notice period constitutes acceptance of the revised Terms. It is your responsibility to review these Terms regularly.`,
      },
    ],
  },
  {
    id: 'description-of-service',
    title: 'Description of the Service',
    blocks: [
      {
        type: 'paragraph',
        text: `The Service is an online platform through which you may browse, customize, purchase, and receive Afreak products, including custom printed apparel and streetwear, access customer support, manage your account, and receive communications related to orders, promotions, and updates.`,
      },
      {
        type: 'paragraph',
        text: `We may modify, suspend, or discontinue any aspect of the Service, including product offerings, pricing, availability, or features, at any time and without notice.`,
      },
    ],
  },
  {
    id: 'products',
    title: 'Products, Availability, and Accuracy',
    blocks: [
      {
        type: 'paragraph',
        text: `Some products may be available in limited quantities or limited drops. All product descriptions, images, sizing information, and pricing are subject to change at any time without notice.`,
      },
      {
        type: 'paragraph',
        text: `Colors may look different on different screens, and printed colors can vary slightly from what you see on your device. Small differences in print placement, color, and fabric between production runs are normal and are not defects.`,
      },
      {
        type: 'paragraph',
        text: `We may limit the sale of products to any person, region, or jurisdiction, and may discontinue any product at any time.`,
      },
    ],
  },
  {
    id: 'custom-orders',
    title: 'Custom Orders and Your Artwork',
    blocks: [
      {
        type: 'paragraph',
        text: `Afreak offers custom print products. If you submit artwork, text, images, or other designs ("Your Content") for a custom order, you agree that:`,
      },
      {
        type: 'list',
        items: [
          `**You own it or have permission.** You own, or have all necessary rights and permissions to use, Your Content, and it does not infringe or violate any copyright, trademark, privacy, publicity, or other right of any person.`,
          `**License to us.** You grant Afreak a limited, non-exclusive, royalty-free license to use, reproduce, and modify Your Content only as needed to review, prepare, print, and deliver your order, provide support, and handle disputes. We will not use Your Content for marketing without your permission.`,
          `**Content we may refuse.** We may decline, cancel, or remove any custom order that we believe, in our discretion, is unlawful, infringing, hateful, harassing, sexually explicit, or otherwise violates these Terms or the rights of others. If we cancel for this reason, you will receive a refund of the amount paid for the affected item.`,
          `**Artwork quality.** The final print depends on the quality and resolution of what you upload. Low-resolution or poorly prepared files may print with reduced quality. We may contact you about the artwork before production, but we are not responsible for print results caused by the file you provided.`,
          `**Responsibility.** You are solely responsible for Your Content and for any claim made against us because of it, as covered in the Indemnification section.`,
        ],
      },
    ],
  },
  {
    id: 'orders-and-payment',
    title: 'Orders, Pricing, and Payment',
    blocks: [
      {
        type: 'paragraph',
        text: `Your order is an offer to purchase products under these Terms. All orders are subject to our acceptance. We may refuse or cancel any order at our discretion, including because of suspected fraud, unauthorized activity, pricing errors, product availability, or problems with custom artwork.`,
      },
      {
        type: 'paragraph',
        text: `Prices may change without notice. If there is a pricing error, we may cancel the affected orders and refund you in full.`,
      },
      {
        type: 'paragraph',
        text: `By submitting payment information, you authorize us and our third-party payment processor ({{PAYMENT_PROCESSOR}}) to charge the full amount of your order, including applicable taxes and shipping. You represent that all payment information is accurate and that you are authorized to use the payment method provided.`,
      },
    ],
  },
  {
    id: 'shipping-returns',
    title: 'Production, Shipping, Returns, and Cancellations',
    blocks: [
      {
        type: 'paragraph',
        text: `**Production and shipping.** Many Afreak items are printed to order. Estimated processing time is {{PROCESSING_TIME}}, in addition to shipping time. We ship to the address you provide at checkout. Production, shipping, and delivery dates are estimates only and are not guaranteed.`,
      },
      {
        type: 'paragraph',
        text: `**Risk of loss.** Title and risk of loss pass to you when you receive the products. We are not responsible for delays caused by shipping carriers or customs. If products are lost or damaged in transit before they reach you, we will work with you to resolve it, which may include a replacement or refund at our discretion.`,
      },
      {
        type: 'paragraph',
        text: `**Final sale.** Because many products are custom-made, all sales are final, except where required by applicable law. We do not accept returns or exchanges for shipped products, except for defective or incorrect products, or as otherwise required by law. This includes size exchanges on custom items unless we tell you otherwise.`,
      },
      {
        type: 'paragraph',
        text: `**Cancellations.** You may request to cancel an order within {{CANCELLATION_WINDOW_HOURS}} of placing it, provided production has not started and the order has not shipped. Contact us at {{CONTACT_EMAIL}} as soon as possible.`,
      },
      {
        type: 'paragraph',
        text: `**Defective or incorrect items.** If you receive a defective, damaged, or incorrect product, you must notify us within {{DEFECT_NOTICE_DAYS}} days of delivery, with your order number and clear photos, to be eligible for a replacement or refund. Misuse, improper care, alterations, normal wear, and damage after delivery are not defects. Errors in the artwork or text you submitted are not defects.`,
      },
    ],
  },
  {
    id: 'chargebacks',
    title: 'Chargebacks and Fraud Prevention',
    blocks: [
      {
        type: 'paragraph',
        text: `We may investigate and dispute any chargeback or claim of an unauthorized transaction. We encourage you to contact us first so we can solve the problem quickly.`,
      },
      {
        type: 'paragraph',
        text: `Fraudulent, abusive, or bad-faith chargebacks are a material breach of these Terms and may result in permanent restriction from the Service, refusal of orders, and legal action to recover losses, the cost of goods, collection costs, and reasonable legal fees to the extent permitted by law.`,
      },
    ],
  },
  {
    id: 'communications',
    title: 'Communications (Email and SMS)',
    blocks: [
      {
        type: 'paragraph',
        text: `By providing your email address or phone number, you consent to receive transactional communications related to your account and orders. You may separately opt in to marketing communications, including by SMS, through our opt-in mechanism. Message and data rates may apply. Consent to marketing messages is not a condition of purchase.`,
      },
      {
        type: 'paragraph',
        text: `You may revoke consent and opt out of marketing at any time by replying STOP to any message, using the unsubscribe link in any email, or contacting us at {{CONTACT_EMAIL}}. More details are in our [Privacy Policy](/privacy).`,
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    blocks: [
      {
        type: 'paragraph',
        text: `All content, designs, logos, trademarks, text, graphics, images, and other materials on the Service (excluding Your Content and other users' content) are owned by or licensed to Afreak and are protected by intellectual property laws.`,
      },
      {
        type: 'paragraph',
        text: `You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial purposes only. Any unauthorized use is prohibited and may result in legal action.`,
      },
      {
        type: 'paragraph',
        text: `If you believe content on the Service infringes your rights, contact us at {{CONTACT_EMAIL}} with details of the content and your claim, and we will review it.`,
      },
    ],
  },
  {
    id: 'user-content',
    title: 'Reviews and User Content',
    blocks: [
      {
        type: 'paragraph',
        text: `If you post reviews, ratings, comments, or other content on the Service, you are responsible for it. It must be honest, lawful, and based on your own experience. You grant Afreak a non-exclusive, royalty-free, worldwide license to display, reproduce, and use that content on and in connection with the Service. We may moderate, edit, or remove any content at our discretion, including content that is abusive, misleading, spam, or violates the rights of others.`,
      },
    ],
  },
  {
    id: 'personal-information',
    title: 'Personal Information',
    blocks: [
      {
        type: 'paragraph',
        text: `Your submission of personal information through the Service is governed by our [Privacy Policy](/privacy).`,
      },
    ],
  },
  {
    id: 'prohibited-uses',
    title: 'Prohibited Uses',
    blocks: [
      { type: 'paragraph', text: `You agree not to use the Service to:` },
      {
        type: 'list',
        items: [
          `Violate any law or regulation`,
          `Infringe intellectual property, privacy, or other rights`,
          `Scrape, crawl, or use automated tools to access the Service without permission`,
          `Introduce malware or interfere with security features`,
          `Place orders using stolen or unauthorized payment methods`,
          `Upload unlawful, infringing, or abusive content`,
          `Engage in abusive, fraudulent, or deceptive conduct`,
        ],
      },
      {
        type: 'paragraph',
        text: `We may suspend or terminate access for violations. Where reasonable and legally required, we will give you notice and an opportunity to fix the problem first.`,
      },
    ],
  },
  {
    id: 'third-party-services',
    title: 'Third-Party Services and Links',
    blocks: [
      {
        type: 'paragraph',
        text: `The Service may rely on or include links to third-party services, including payment processors, carriers, analytics, and advertising tools. To the extent permitted by law, we disclaim liability arising from third-party services, including outages, errors, or data issues. More information is in our [Privacy Policy](/privacy).`,
      },
    ],
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    blocks: [
      {
        type: 'paragraph',
        text: `**THE SERVICE AND ALL PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE," TO THE MAXIMUM EXTENT PERMITTED BY LAW. EXCEPT AS EXPRESSLY PROVIDED IN THESE TERMS OR REQUIRED BY APPLICABLE LAW, AFREAK DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.**`,
      },
      {
        type: 'paragraph',
        text: `We do not guarantee uninterrupted, error-free, or secure operation of the Service.`,
      },
      {
        type: 'paragraph',
        text: `Some jurisdictions do not allow certain disclaimers, so parts of this section may not apply to you.`,
      },
    ],
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of Liability',
    blocks: [
      {
        type: 'paragraph',
        text: `**TO THE MAXIMUM EXTENT PERMITTED BY LAW, AFREAK IS NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATING TO THE SERVICE OR PRODUCTS.**`,
      },
      { type: 'paragraph', text: `This limitation does not apply to:` },
      {
        type: 'list',
        items: [
          `Remedies expressly provided for defective products under these Terms`,
          `Personal injury caused by our gross negligence, fraud, or willful misconduct`,
          `Liability that cannot be limited under applicable law`,
        ],
      },
      {
        type: 'paragraph',
        text: `Except where prohibited by law, our total liability for any claim relating to a product will not exceed the amount you paid for the specific order that gave rise to the claim.`,
      },
    ],
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    blocks: [
      {
        type: 'paragraph',
        text: `You agree to indemnify, defend, and hold harmless Afreak, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from your violation of these Terms, your misuse of the Service, Your Content, or your violation of any law or third-party right.`,
      },
    ],
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute Resolution',
    blocks: [
      {
        type: 'paragraph',
        text: `**Informal resolution first.** Before starting any formal proceeding, you agree to try to resolve any dispute, claim, or controversy arising from these Terms, the Service, or any products sold by Afreak (each a "Dispute") by contacting us at {{CONTACT_EMAIL}} with a written description of the Dispute and your contact information. If the Dispute is not resolved within thirty (30) days of our receipt of your notice, either party may start a formal proceeding as described below.`,
      },
      {
        type: 'paragraph',
        text: `**Agreement to arbitrate.** Except for disputes that qualify for small-claims court, any Dispute will be resolved exclusively by final and binding individual arbitration, not in court, and you waive any right to a jury trial. The arbitration will be conducted under the rules of a recognized arbitration body that applies to consumer disputes in {{GOVERNING_LAW}}, as modified by these Terms.`,
      },
      {
        type: 'paragraph',
        text: `**Location and procedure.** Unless the law requires otherwise, arbitration will take place in {{DISPUTE_LOCATION}}. It may be conducted in person, by telephone, by video conference, or based only on written submissions, as the arbitrator decides.`,
      },
      {
        type: 'paragraph',
        text: `**Small claims exception.** Either party may bring an individual claim in a small-claims court in {{DISPUTE_LOCATION}} if the claim qualifies and stays in that court.`,
      },
      {
        type: 'paragraph',
        text: `**Class action and representative waiver.** You and Afreak agree that all Disputes must be brought in an individual capacity only. **You waive the right to participate as a plaintiff or class member in any class, collective, or representative action or proceeding.** The arbitrator may not combine claims, preside over any class or representative proceeding, or award relief to anyone other than the individual party seeking relief. If this waiver is found unenforceable, this arbitration agreement will be void.`,
      },
      {
        type: 'paragraph',
        text: `**Delegation.** The arbitrator has exclusive authority to resolve any dispute about the interpretation, applicability, enforceability, or formation of this arbitration agreement.`,
      },
      {
        type: 'paragraph',
        text: `**Fees and costs.** Payment of arbitration fees will follow the rules of the arbitration body. Afreak will not seek to recover arbitration fees from you unless the arbitrator finds your claim frivolous or brought for an improper purpose.`,
      },
      {
        type: 'paragraph',
        text: `**Opt-out right.** You may opt out of this arbitration agreement by sending written notice to {{CONTACT_EMAIL}} within thirty (30) days of first accepting these Terms. Your notice must include your full name, mailing address, and a clear statement that you wish to opt out of arbitration. Opting out does not affect any other provision of these Terms.`,
      },
      {
        type: 'paragraph',
        text: `**Survival.** This arbitration agreement survives termination of these Terms and your use of the Service.`,
      },
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    blocks: [
      {
        type: 'paragraph',
        text: `These Terms are governed by the laws of {{GOVERNING_LAW}}, without regard to conflict-of-law rules.`,
      },
    ],
  },
  {
    id: 'force-majeure',
    title: 'Force Majeure',
    blocks: [
      {
        type: 'paragraph',
        text: `We are not liable for any failure or delay caused by events beyond our reasonable control, including acts of God, war, terrorism, pandemics, labor disputes, supplier or printing equipment failures, carrier failures, internet or hosting outages, or government actions.`,
      },
    ],
  },
  {
    id: 'severability',
    title: 'Severability',
    blocks: [
      {
        type: 'paragraph',
        text: `If any provision of these Terms is found to be unlawful, void, or unenforceable, it will be enforced to the fullest extent permitted by law, and the unenforceable part will be treated as severed. This does not affect the validity and enforceability of the remaining provisions.`,
      },
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    blocks: [
      {
        type: 'paragraph',
        text: `Obligations and liabilities incurred before the termination date survive termination of these Terms. These Terms stay in effect until terminated by us. If we believe, in our judgment, that you have not complied with these Terms, we may terminate these Terms or deny you access to the Service (or any part of it), and you remain liable for all amounts due up to the date of termination. Where reasonable, we will give you notice first.`,
      },
    ],
  },
  {
    id: 'entire-agreement',
    title: 'Waiver and Entire Agreement',
    blocks: [
      {
        type: 'paragraph',
        text: `Our failure to exercise or enforce any right or provision of these Terms is not a waiver of that right or provision. These Terms, together with our [Privacy Policy](/privacy) and any policies or operating rules we post on the Service, are the entire agreement between you and us regarding the Service. They replace any earlier agreements, communications, and proposals, whether oral or written, including prior versions of the Terms. Any ambiguity in these Terms will not be interpreted against the party that drafted them.`,
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    blocks: [
      {
        type: 'contact',
        text: `To ask questions or comment about the Service or these Terms, contact us:`,
        rows: [
          { label: 'Email', value: '{{CONTACT_EMAIL}}', mailto: true },
          { label: 'Phone', value: '{{CONTACT_PHONE}}', omitIfPlaceholder: true },
          { label: 'Mail', value: '{{LEGAL_ENTITY}}, {{MAILING_ADDRESS}}' },
        ],
      },
    ],
  },
];

export const termsSections = INCLUDE_ARBITRATION
  ? sections
  : sections.filter((section) => section.id !== 'dispute-resolution');
