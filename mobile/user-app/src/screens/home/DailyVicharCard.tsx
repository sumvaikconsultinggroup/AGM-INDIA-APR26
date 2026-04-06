import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../theme";
import api from "../../services/api";

interface Vichar {
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source?: string;
  date: string;
}

export default function DailyVicharCard() {
  const { t, i18n } = useTranslation();
  const [vichar, setVichar] = useState<Vichar | null>(null);

  const preferredLanguage = useMemo<"hindi" | "english">(() => {
    return i18n.language === "en" ? "english" : "hindi";
  }, [i18n.language]);

  useEffect(() => {
    const fetchVichar = async () => {
      try {
        const res = await api.get("/daily-vichar/today");
        setVichar(res.data);
      } catch {
        // Silently fail
      }
    };
    fetchVichar();
  }, []);

  if (!vichar) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{t("home.dailyVicharLabel")}</Text>
        <Text style={styles.languageTag}>
          {preferredLanguage === "english" ? t("home.languageEnglish") : t("home.languageHindi")}
        </Text>
      </View>

      <Text style={styles.title}>
        {preferredLanguage === "hindi" ? vichar.titleHindi : vichar.titleEnglish}
      </Text>
      <Text style={styles.content}>
        {"\u201C"}{preferredLanguage === "hindi" ? vichar.contentHindi : vichar.contentEnglish}
        {"\u201D"}
      </Text>
      {vichar.source && <Text style={styles.source}>{"\u2014"} {vichar.source}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFDF5",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#F5E6CC",
    shadowColor: "#D4A017",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: colors.primary.saffron,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  languageTag: {
    fontSize: 11,
    color: colors.gold.dark,
    fontWeight: "600",
    backgroundColor: "#F9F0D8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#800020",
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    fontStyle: "italic",
  },
  source: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
});
