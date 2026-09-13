# ReaderGata

[![CI](https://github.com/InfoGata/readergata/actions/workflows/ci.yml/badge.svg)](https://github.com/InfoGata/readergata/actions/workflows/ci.yml)

Read ebooks and PDFs in your browser — your own files, or books from the
Internet Archive, OPDS catalogs and your Humble Bundle library, through plugins
you choose.

**[www.readergata.com](https://www.readergata.com)**

## What it is

ReaderGata is a reader, not a bookstore or a library service. It hosts no books
and has no accounts. Open a file from your device or a link, or browse a source
through a plugin, and it fetches from that source directly, from your device.

- **Reads the common formats.** EPUB, MOBI, AZW3, FB2 and CBZ through
  [foliate-js](https://github.com/johnfactotum/foliate-js), and PDF through
  pdf.js.
- **Your data stays yours.** Installed plugins, logins, reading positions,
  bookmarks and settings live in your browser. There is no sign-up.
- **Works offline.** It installs as a PWA and opens without a connection.
- **Plugins are sandboxed.** Each runs in an iframe on its own subdomain
  (`<plugin-id>.readergata.com`), so one plugin can't read another's data or the
  page around it.

## Plugins

Three ship in the catalog. Install them from the plugins page, or point it at
any manifest URL.

| Plugin | Needs |
| --- | --- |
| Internet Archive | nothing |
| OPDS Catalog | nothing — add any catalog's address in its options |
| Humble Bundle | a Humble Bundle account **and** the browser extension |

### Why some need the extension

Some sites refuse requests that don't come from a page on their own domain, and
a browser enforces that. The [InfoGata
extension](https://github.com/InfoGata/infogata-extension) makes those requests
on the plugin's behalf, from your browser, and handles signing in to sites like
Humble Bundle. Plugins that can't work without it are hidden rather than offered
and broken.

## Development

Requires Node 22 (what CI builds against).

```bash
git clone https://github.com/InfoGata/readergata.git
cd readergata
npm install
npm run dev          # http://localhost:3004
```

| | |
| --- | --- |
| `npm run dev` | dev server, port 3004 |
| `npm run build` | typecheck and build for production |
| `npm run preview` | serve the production build, port 4004 |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint |
| `npm run electron:dev` / `electron:build` | desktop build (renderer on 5004) |
| `npm run android` | build and run via Capacitor |
| `npm run vendor:foliate -- --check` | verify the vendored foliate-js is untouched |

Ports are fixed (`strictPort`) and unique across the InfoGata apps, so they can
run side by side and a collision fails instead of drifting.

foliate-js is vendored under `src/vendor/foliate-js` rather than installed from
npm; never edit it by hand. Built with React 19, TypeScript, Vite, TanStack
Router, Redux Toolkit, Dexie, Tailwind and Radix/shadcn. Architecture notes for
contributors are in [CLAUDE.md](CLAUDE.md).

## Writing a plugin

A plugin is a manifest plus a script. It implements the callbacks it supports —
`onGetFeed`, `onSearch`, `onGetPublicationDetails`, `onGetPublicationSource` and
so on — and the host calls whichever exist.

Types are published, and are the API contract:

```bash
npm install --save-dev @infogata/readergata-plugin-typings
```

The callbacks and fields are in
[index.d.ts](https://github.com/InfoGata/readergata-plugin-typings/blob/master/index.d.ts),
and the manifest format is documented
[here](https://infogata.github.io/readergata-plugin-typings/plugins/plugin-manifest).
The catalog plugins are working examples:
[internetarchive](https://github.com/InfoGata/internetarchive-readergata),
[opds](https://github.com/InfoGata/opds-readergata) and
[humblebundle](https://github.com/InfoGata/humblebundle-readergata). Start with
Internet Archive — a plain JSON api, with no sign-in and no extension, so
nothing in it is there to work around a restriction.

To develop against a local copy: serve the plugin folder
(`npx serve . -p 8080 --cors`), install it by URL from the plugins page
(`http://localhost:8080/manifest.json`), and run the plugin's build in watch
mode. Plugins installed from localhost are polled every few seconds and reload
themselves as you build.

## Privacy

No accounts, no profiles, and no books hosted by us. Anonymous, cookieless
analytics is on by default and can be turned off in Settings; Do Not Track turns
it off regardless, and a build with no analytics key configured loads none at
all. See [the privacy page](https://www.readergata.com/privacy).

To report abuse or a copyright concern, and for what we can and can't act on,
see [ABUSE.md](ABUSE.md).

## Versioning

`package.json` holds the version, and nothing else should carry a copy of it.
`npm version <major|minor|patch>` is the only thing that changes it:

- the web and desktop builds read it through `build-info.ts`, which stamps in
  the commit (`git describe --always --dirty`) alongside it
- the Android build reads it in `android/app/build.gradle` and derives
  `versionCode` from it, so `0.1.0` becomes `100` and `1.2.3` becomes `10203`
- the About page shows both, and tapping the version copies the build, the
  platform and the user agent — everything a bug report needs

## Contributing

Issues and pull requests are welcome. `npm run lint`, `npm test` and
`npm run build` all need to pass — CI runs them on every push, along with the
foliate-js check and the Electron build.

New plugins don't need to live here. Publish the manifest anywhere and it can
be installed by URL; the catalog in `src/default-plugins.ts` is a starting
point, not a permission list.

## License

[AGPL-3.0](LICENSE). If you run a modified copy as a service, the source has to
be available to its users.
