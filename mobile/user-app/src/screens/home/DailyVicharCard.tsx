import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
  const [vichar, setVichar] = useState<Vichar | null>(null);
  const [lang, setLang] = useState<"hindi" | "english">("hindi");

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
        <Text style={styles.label}>{"\u0906\u091C \u0915\u093E \u0935\u093F\u091A\u093E\u0930"}</Text>
        <View style={styles.langToggle}>
          <TouchableOpacity
            onPress={() => setLang("hindi")}
            style={[styles.langBtn, lang === "hindi" && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langText,
                lang === "hindi" && styles.langTextActive,
              ]}
            >
              {"\u0939\u093F\u0902"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLang("english")}
            style={[styles.langBtn, lang === "english" && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langText,
                lang === "english" && styles.langTextActive,
              ]}
            >
              En
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>
        {lang === "hindi" ? vichar.titleHindi : vichar.titleEnglish}
      </Text>
      <Text style={styles.content}>
        {"\u201C"}{lang === "hindi" ? vichar.contentHindi : vichar.contentEnglish}
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
  langToggle: { flexDirection: "row", gap: 4 },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F5E6CC",
  },
  langBtnActive: { backgroundColor: colors.primary.saffron },
  langText: { fontSize: 11, color: "#666" },
  langTextActive: { color: "#FFF" },
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
