# Reporting abuse

ReaderGata is a reader. It hosts no books, PDFs or catalogs. When you browse a
source, the plugin for it fetches from that source directly, from your own
device. What the app keeps — the book you're reading, your reading positions
and bookmarks — stays in your browser's storage on that device, not with us.

The one exception is the CORS relays we run, used by the app and some of our
plugins for requests a browser would otherwise refuse to make across sites.
They forward each response as it arrives and keep no copy, so they give us
nothing to take down either.

That shapes what a report to us can and can't achieve, so it's worth being
direct about it before you write one.

## What we can act on

- **The plugin catalog.** The list of plugins offered inside the app is curated
  by us (`src/default-plugins.ts`), and we can remove an entry from it. See
  [Delisting a plugin](#delisting-a-plugin).
- **Plugins we publish.** The plugins under the
  [InfoGata](https://github.com/InfoGata) organization are ours, and we can
  change or withdraw them.
- **The app, this site and the relays.** Anything we actually run.

## What we can't act on

- **Books or files hosted by the Internet Archive, an OPDS catalog, a store or
  anywhere else.** We have no copy and no ability to remove it. A notice sent to
  us does not reach the site hosting the material, and we don't forward notices
  on a reporter's behalf. Send it to that site's own copyright contact.
- **Which catalogs a reader adds.** The OPDS plugin reads whatever catalog
  address its user gives it. We don't see that list and can't change it.
- **Files already on someone's device.** A book someone has downloaded or
  opened is on their device, out of our reach.

If a report reaches us that we can't act on, we'll say so once, point you at the
right place, and close it. That isn't a brush-off; it's the honest limit of what
a client-side reader can do.

## How to report

Email **contact@readergata.com**. Include enough that we can find the thing
you're describing without guessing, and say in the subject line which kind of
report it is.

### Copyright

If you're sending a notice under the DMCA, US law asks that it contain all six
of these. A notice missing them may not be actionable, and we'd rather tell you
that up front than after a delay:

1. A physical or electronic signature of the copyright owner, or someone
   authorized to act for them
2. Identification of the copyrighted work claimed to be infringed
3. Identification of the material claimed to be infringing, specific enough that
   we can locate it
4. Your contact details — address, telephone number, email
5. A statement that you have a good-faith belief the use isn't authorized by the
   owner, its agent, or the law
6. A statement, under penalty of perjury, that the information is accurate and
   that you're authorized to act for the owner

For material hosted on another site, points 3 and 6 are exactly where a notice
to us breaks down: we can't disable access to something we never had. What we
*can* consider is whether a plugin in our catalog exists primarily to surface
that material.

### Everything else

Malicious plugin behavior, security problems, illegal material being surfaced
through a plugin we list, or a site operator asking us to stop pointing at them
— same address.

For a security vulnerability in the app itself, prefer a private report so it
can be fixed before it's public.

## Delisting a plugin

The catalog is the one lever we have, so this is the policy that governs it.

### Grounds

We will remove a plugin from the catalog when:

- it exists primarily to surface infringing material, and the source it reads
  won't act on notices
- it behaves maliciously — exfiltrating data, requesting credentials it has no
  use for, or doing anything outside what its description claims
- the operator of the site it reads asks us to stop listing it
- we're required to by a court or by a provider we depend on

We will **not** delist a plugin merely because a source it can read holds
infringing material somewhere. A general-purpose catalog reader can be pointed at
anything, the same as a web browser can.

### Process

1. You report it, with enough detail to verify.
2. We verify it ourselves. We don't delist on assertion alone.
3. If it's warranted, the entry is removed and the app is redeployed.
4. The change is a commit in this repository, so the record of what was removed
   and when is public and permanent.

We aim to acknowledge a report within seven days and to act on a verified one
promptly after that.

### What delisting does and doesn't do

Delisting removes a plugin from the list of plugins the app *offers*. It does
not uninstall it. Plugins live in the browser's own storage on each device, and
we have no mechanism — and want no mechanism — to reach into an installation and
remove software someone chose to install. Anyone who already has it keeps it
until they remove it themselves.

Anyone can also still install any plugin by URL. The catalog is a curated
starting point, not a permission list, and delisting is not a block.

### Disagreeing with a delisting

Open an issue on this repository or email the address above. We'll explain the
reasoning, and we'll relist if we got it wrong.
