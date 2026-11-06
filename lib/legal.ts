/**
 * TEMPLATE legal copy for Bir Paragliding — written fresh (not copied from the reference site).
 * Review with your own legal/tax advisor before launch and adjust to how you actually operate.
 */
export type LegalDoc = { slug: string; title: string; intro: string; sections: { h: string; p: string[] }[] };

export const legal: LegalDoc[] = [
  {
    slug: 'cancellation',
    title: 'Cancellation & refunds',
    intro: 'Flying depends on the weather, and plans change. Here is how rescheduling and refunds work.',
    sections: [
      { h: 'Weather calls', p: ['If your pilot decides conditions are not safe, your flight is moved to the next suitable slot. If no slot works for you, we refund any amount you have paid for that flight.', 'The pilot’s safety decision on the day is final.'] },
      { h: 'If you need to cancel', p: ['Let us know on WhatsApp as early as possible. [Placeholder — set your notice period and any cancellation charges, e.g. “free cancellation up to 24 hours before your slot”.]'] },
      { h: 'Courses', p: ['Course days lost to weather are added to the end of your batch where possible. [Placeholder — describe your policy for cancelling a course after it has started.]'] },
      { h: 'Add-ons', p: ['Stays, camps and travel booked through us follow the policy of the property or operator, which we share with you before you confirm.'] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of service',
    intro: 'The short version: fly safely, follow your pilot, and tell us anything that affects your fitness to fly.',
    sections: [
      { h: 'Bookings', p: ['A booking is confirmed only when we confirm it in writing (WhatsApp or email) with a date, time and meeting point.'] },
      { h: 'Health & fitness', p: ['Tell us before booking about heart or back conditions, recent injuries, pregnancy or anything else that may affect your flight. Pilots may decline to fly a passenger if they believe it is unsafe.'] },
      { h: 'On the day', p: ['Arrive on time, wear closed shoes and suitable clothing, and follow your pilot’s instructions at launch, in the air and on landing. Flying under the influence of alcohol or drugs is not allowed.'] },
      { h: 'Risk', p: ['Paragliding is an adventure activity with inherent risk. [Placeholder — add your waiver / liability wording and insurance details.]'] },
      { h: 'Photos & video', p: ['Footage recorded during your flight is shared with you. We may ask your permission before using any of it on our channels.'] },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy policy',
    intro: 'We collect only what we need to arrange your flight, and we never sell it.',
    sections: [
      { h: 'What we collect', p: ['The details you send us when you book or get in touch: name, phone/WhatsApp, email, dates and any notes you add (for example, weights for pilot planning).'] },
      { h: 'How we use it', p: ['To confirm and run your booking, arrange add-ons you ask for, and contact you about your trip.'] },
      { h: 'Sharing', p: ['We share only what is needed with your pilot and with any stay, camp or travel operator you ask us to book.'] },
      { h: 'This website', p: ['The site does not use advertising trackers. The embedded Google Map on the contact page is provided by Google and subject to Google’s privacy policy. [Placeholder — mention any analytics you add.]'] },
      { h: 'Your choices', p: ['Ask us at any time to see, correct or delete the details you have shared with us.'] },
    ],
  },
];

export const getLegal = (slug: string) => legal.find((l) => l.slug === slug);
