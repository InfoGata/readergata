import AboutLink, { AboutLinkProps } from "@/components/AboutLink";
import { faGitAlt } from "@fortawesome/free-brands-svg-icons/faGitAlt";
import { faMastodon } from "@fortawesome/free-brands-svg-icons/faMastodon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Email, Favorite, Language, Lock, Twitter } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const email = "contact@readergata.com";
  const website = "https://www.infogata.com";
  const twitterUrl = "https://twitter.com/info_gata";
  const twitterAt = "@info_gata";
  const mastodonUrl = "https://mastodon.online/@InfoGata";
  const mastodonAt = "@InfoGata@mastodon.online";
  const gitUrl = "https://github.com/InfoGata/readergata";

  const links: AboutLinkProps[] = [
    {
      title: "Company Website",
      description: website,
      icon: <Language />,
      url: website,
    },
    {
      title: "Github",
      description: gitUrl,
      icon: <FontAwesomeIcon icon={faGitAlt} />,
      url: gitUrl,
    },
    {
      title: "Email",
      description: email,
      icon: <Email />,
    },
    {
      title: "Twitter",
      description: twitterAt,
      icon: <Twitter />,
      url: twitterUrl,
    },
    {
      title: "Mastodon",
      description: mastodonAt,
      icon: <FontAwesomeIcon icon={faMastodon} />,
      url: mastodonUrl,
    },
    {
      title: t("donate"),
      icon: <Favorite />,
      internalPath: "/donate",
    },
    {
      title: t("privacyPolicy"),
      icon: <Lock />,
      internalPath: "/privacy",
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

export default AboutPage;
