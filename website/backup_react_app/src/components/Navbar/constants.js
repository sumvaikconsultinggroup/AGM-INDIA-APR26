import { useTranslation } from "react-i18next";

export const useNavLinks = () => {
  const { t } = useTranslation();

  const navLinks = [
    { name: t("navLinks.home"), href: "/" },
    { name: t("navLinks.about"), href: "/about" },
    { name: t("navLinks.podcasts"), href: "/podcasts" },
    { name: t("navLinks.articles"), href: "/articles" },
    { name: t("navLinks.books"), href: "/books" },
    { name: t("navLinks.videoSeries"), href: "/videos" },
    // { name: t("navLinks.media"), href: '/media' },
    { name: t("navLinks.mantraDiksha"), href: "/mantra-diksha" },
    { name: t("navLinks.donate"), href: "/donate" },
    { name: t("navLinks.privacyPolicy"), href: "/privacy-policys" },
        { name: t("navLinks.termsAndConditions"), href: "/terms-and-conditions" },
  ];

  const secondaryNavLinks = [
    { name: t("secondaryNavLinks.gitaSamagam"), href: "/gita-samagam" },
    { name: t("secondaryNavLinks.vedanta"), href: "/vedanta" },
  ];

  return { navLinks, secondaryNavLinks };
};
