/* eslint-disable i18next/no-literal-string */
import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "@/providers/ThemeProvider";
import React from "react";

const Privacy: React.FC = () => {
  const theme = useTheme();
  const fontColor = theme.theme === "light" ? "020817" : "E6E6E6";
  const backgroundColor = theme.theme === "light" ? "f2f2f2" : "0B0C0E";
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold">Privacy Overview</h1>
      <p>
        <b>
          Personal Data collected for the following purposes and using the
          following services:
        </b>
        <br />
        <br />
        <b>🧮 Analytics</b>
        <br />
        The services contained in this section enable the Owner to monitor and
        analyze web traffic and can be used to keep track of User behavior.
        <br />
        <br />
        <b>1.) Matomo</b>
        <br />
        Personal Data:
        <i>Usage Data</i>
        <br />
        <a
          href="https://matomo.org/privacy-policy/"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        <br />
        <iframe
          title="out-opt"
          style={{ border: 0, height: "200px", width: "600px" }}
          src={`https://matomo.infogata.com/index.php?module=CoreAdminHome&action=optOut&language=en&fontSize=16px&fontColor=${fontColor}&backgroundColor=${backgroundColor}`}
        ></iframe>
      </p>
      {/* End Section */}
      <p>
        <b>📦 Displaying Content From External Platforms</b>
        <br />
        This type of service allows you to view content hosted on external
        platforms directly from the pages of this website and interact with
        them.
        <br />
        <br />
        This type of service might still collect web traffic data for the pages
        where the service is installed, even when Users do not use it.
        <br />
        <br />
        <b>1.) Google Fonts</b>
        <br />
        Personal Data:
        <i>
          Usage Data; various types of Data as specified in the privacy policy
          of the service
        </i>
        <br />
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
      </p>
      <p>
        <b>📁 Hosting and Backend Infrastructure</b>
        <br />
        This type of service has the purpose of hosting Data and files that
        enable this website to exist.
        <br />
        <br />
        Some services among those listed below, if any, may work through
        geographically distributed servers, making it difficult to determine the
        actual location where the Personal Data are stored.
        <br />
        <br />
        <b>1.) Vercel, Inc</b>
        <br />
        Personal Data:
        <i>
          various types of Data as specified in the privacy policy of the
          service
        </i>
        <br />
        <a href="https://vercel.com/privacy" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});
