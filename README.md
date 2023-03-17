# ReaderGata

A plugin based reading app.

https://www.readergata.com

## Running locally

```console
npm install
npm run dev
```

## Plugins

The plugin scripts are run in sandboxed iframes using [plugin-frame](https://github.com/elijahgreen/plugin-frame). Every iframe is ran on it's own subdomain with it's subdomain being the id of the plugin ([pluginId].readergata.com).

[humblebundle-readergata](https://github.com/InfoGata/humblebundle-readergata)

[opds-readergata](https://github.com/InfoGata/opds-readergata)

## Plugin Development

[Docs](https://infogata.github.io/readergata-plugin-typings/plugins/plugin-manifest)

[Types](https://github.com/InfoGata/readergata-plugin-typings)
