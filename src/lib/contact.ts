/**
 * The addresses and links the app publishes. Shared so the About page, the
 * abuse page and anything added later can't drift apart, and so an address can
 * be repointed in one place rather than hunted for.
 */

export const contactEmail = "contact@readergata.com";

/**
 * Where abuse and copyright reports go. The general address until a dedicated
 * abuse@ is confirmed deliverable -- an address that bounces would be worse
 * than one shared with everything else.
 */
export const abuseEmail = contactEmail;

export const repoUrl = "https://github.com/InfoGata/readergata";
export const abusePolicyUrl = `${repoUrl}/blob/master/ABUSE.md`;
