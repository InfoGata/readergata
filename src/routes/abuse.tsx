/* eslint-disable i18next/no-literal-string */
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { abuseEmail, abusePolicyUrl } from "@/lib/contact";

const MailLink: React.FC<{ subject: string; children: React.ReactNode }> = ({
  subject,
  children,
}) => (
  <a
    href={`mailto:${abuseEmail}?subject=${encodeURIComponent(subject)}`}
    className="text-primary hover:underline"
  >
    {children}
  </a>
);

const Abuse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>🚩</span>
          Reporting Abuse
        </h1>
        <p className="text-muted-foreground">
          How to reach us about a plugin, and what a report to us can and can’t
          achieve.
        </p>
      </div>

      {/* The thing everything else follows from */}
      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-lg font-semibold">ReaderGata hosts no books</h2>
        <p className="text-sm text-muted-foreground">
          ReaderGata is a reader. When you browse a source, the plugin for it
          fetches from that source directly, from your device. What the app
          keeps — the book you’re reading, your positions and bookmarks — stays
          in your browser on that device, not with us. Some
          requests pass through a CORS relay we run, which forwards each
          response as it arrives and keeps no copy. That limit is what shapes
          everything below.
        </p>
      </div>

      {/* What we can and can't do, side by side on purpose */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span>✅</span>What we can act on
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>
              <strong className="text-foreground">The plugin catalog.</strong>{" "}
              The plugins the app offers are curated by us, and we can remove an
              entry.
            </li>
            <li>
              <strong className="text-foreground">Plugins we publish.</strong>{" "}
              The plugins under the InfoGata organization are ours to change or
              withdraw.
            </li>
            <li>
              <strong className="text-foreground">
                The app, this site and the relay.
              </strong>{" "}
              Anything we actually run.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span>🚫</span>What we can’t
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>
              <strong className="text-foreground">
                Books hosted somewhere else.
              </strong>{" "}
              The Internet Archive, an OPDS catalog or a store holds its own
              files. We have no copy and no way to remove one, and we don’t
              forward notices on a reporter’s behalf.
            </li>
            <li>
              <strong className="text-foreground">
                Which catalogs a reader adds.
              </strong>{" "}
              The OPDS plugin reads whatever catalog address its user gives it.
              We never see that list.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Every site that hosts books publishes its own copyright contact. For
            material hosted there, that is the only route that can actually
            result in its removal.
          </p>
        </div>
      </section>

      {/* How to report */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✉️</span>
          <h2 className="text-2xl font-semibold">How to report</h2>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-lg">Copyright</h3>
          <p className="text-sm text-muted-foreground">
            A notice under the DMCA needs six things: your signature, the work
            you say is infringed, the material you say infringes it and where to
            find it, your contact details, a good-faith statement that the use
            isn’t authorized, and a statement under penalty of perjury that the
            notice is accurate and that you’re authorized to send it.
          </p>
          <p className="text-sm text-muted-foreground">
            For material hosted elsewhere, we can’t disable access to something
            we never had. What we can consider is whether a plugin we list
            exists primarily to surface it.
          </p>
          <MailLink subject="Copyright notice">
            Send a copyright notice →
          </MailLink>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-lg">A plugin</h3>
          <p className="text-sm text-muted-foreground">
            A plugin behaving maliciously, surfacing illegal material, or
            reading a site whose operator has asked us to stop. Tell us which
            plugin and what it did.
          </p>
          <MailLink subject="Plugin report">Report a plugin →</MailLink>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-lg">A security problem</h3>
          <p className="text-sm text-muted-foreground">
            Please report privately, so it can be fixed before it’s public.
          </p>
          <MailLink subject="Security report">
            Report a vulnerability →
          </MailLink>
        </div>
      </section>

      {/* Delisting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h2 className="text-2xl font-semibold">Delisting a plugin</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          The catalog is the one lever we have. We remove a plugin from it when
          it exists primarily to surface infringing material and its source
          won’t act, when it behaves maliciously, when the site it reads asks us
          to stop, or when we’re required to. We don’t delist a plugin because a
          source it can read holds infringing material somewhere — a
          general-purpose catalog reader can be pointed at anything, the same as
          a browser can.
        </p>
        <p className="text-sm text-muted-foreground">
          We verify reports ourselves rather than delisting on assertion, and
          every removal is a public commit in the repository, so the record of
          what went and when is permanent.
        </p>

        <div className="rounded-lg border bg-muted/50 p-5 space-y-2">
          <h3 className="font-semibold">What delisting doesn’t do</h3>
          <p className="text-sm text-muted-foreground">
            It removes a plugin from the list the app offers. It does not
            uninstall it. Plugins live in your browser’s storage on your own
            device, and we have no mechanism — and want none — to reach into an
            installation and remove software someone chose to install. Anyone
            can also still install any plugin by URL. The catalog is a starting
            point, not a permission list.
          </p>
        </div>

        <a
          href={abusePolicyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Read the full policy →
        </a>
      </section>

      {/* Footer note */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>
          We aim to acknowledge a report within seven days. If a report reaches
          us that we can’t act on, we’ll say so once and point you at the right
          place — that’s the honest limit of what a reader can do, not a
          brush-off.
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/abuse")({
  component: Abuse,
});
