import { faBitcoin } from "@fortawesome/free-brands-svg-icons/faBitcoin";
import { faMonero } from "@fortawesome/free-brands-svg-icons/faMonero";
import { faPatreon } from "@fortawesome/free-brands-svg-icons/faPatreon";
import { faPaypal } from "@fortawesome/free-brands-svg-icons/faPaypal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SvgIcon } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { ReactComponent as Liberapay } from "../liberapay_logo.svg";
import AboutLink, { AboutLinkProps } from "@/components/AboutLink";

const Donate: React.FC = () => {
  const { t } = useTranslation();
  const btcDonation = "bc1q3jdf0xpy2m2m2vuvvuqrzzaqt6g8h4lspv49j0";
  const xmrDonation =
    "485HGRVmzC4XK3Tm6vq2v7hXg32qVJLaeK15GjUpsWvGHQ7nyrV3UA2PJGTE4rCTPzCQxqwnkMWF6WRafjg3KTuAAGvi6wJ";
  const paypalUrl =
    "https://www.paypal.com/donate/?hosted_button_id=VYJRQP387NF4S";
  const liberapayUrl = "https://liberapay.com/InfoGata/donate";
  const patreonUrl = "https://www.patreon.com/InfoGata";
  const donateText = t("donate");

  const links: AboutLinkProps[] = [
    {
      title: donateText,
      description: "Paypal",
      icon: <FontAwesomeIcon icon={faPaypal} />,
      url: paypalUrl,
    },
    {
      title: donateText,
      description: "Pateron",
      icon: <FontAwesomeIcon icon={faPatreon} />,
      url: patreonUrl,
    },
    {
      title: donateText,
      description: "Liberapay",
      icon: <SvgIcon component={Liberapay} inheritViewBox />,
      url: liberapayUrl,
    },
    {
      title: `${donateText} - BTC`,
      description: btcDonation,
      icon: <FontAwesomeIcon icon={faBitcoin} />,
    },
    {
      title: `${donateText} - XMR`,
      description: xmrDonation,
      icon: <FontAwesomeIcon icon={faMonero} />,
    },
  ];
  return (
    <div>
      {links.map((l) => (
        <AboutLink {...l} key={l.title} />
      ))}
    </div>
  );
};

export default Donate;
