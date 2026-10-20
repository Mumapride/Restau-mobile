/**
 * AdminDashboardScreen — Restau Mobile admin home.
 *
 * Presentation-only redesign. Navigation targets, logout flow and auth store
 * usage are unchanged.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/useAuthStore";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme/tokens";
import { getSubscriptions } from "../../api/subscription.api";
import { BASE_URL } from "../../api/auth.api";
import axios from "axios";

// Same logo file used on the mobile login screen (transparent PNG).
const LOGO = require("../../../assets/brand/restau-logo.png");

// The two greens taken from the logo.
const LOGO_DARK = "#01573B";
const LOGO_LIGHT = "#5CB916";

const PAGE_BG = "#F4F7F5";

const STAT_TONES = {
  green: { bg: "#E8F8EE", fg: "#047857" },
  blue: { bg: "#E0F2FE", fg: "#0369A1" },
  amber: { bg: "#FEF3C7", fg: "#B45309" },
  violet: { bg: "#EDE9FE", fg: "#6D28D9" },
};

// Static descriptors only. Numeric values come from the backend and are
// injected in the render (see the statsGrid below), so the dashboard never
// shows fabricated numbers — a stat reads "—" until its request resolves.
const STATS = [
  { key: "students", label: "Students", icon: "people-outline", tone: "green" },
  { key: "subscriptions", label: "Subscriptions", icon: "card-outline", tone: "blue" },
  { key: "pending", label: "Pending payments", icon: "time-outline", tone: "amber" },
  { key: "claims", label: "Meals claimed (all time)", icon: "restaurant-outline", tone: "violet" },
];

const MENU = [
  { route: "Semesters", title: "Semesters", description: "Create and manage academic semesters", icon: "calendar-outline" },
  { route: "MealPlans", title: "Meal Plans", description: "Manage available meal plans", icon: "restaurant-outline" },
  { route: "Subscriptions", title: "Subscriptions", description: "Monitor student subscriptions", icon: "card-outline" },
  { route: "Payments", title: "Payments", description: "Review and manage payments", icon: "time-outline" },
  { route: "Students", title: "Students", description: "Manage student accounts", icon: "people-outline" },
  { route: "Reports", title: "Reports", description: "View meal and transaction reports", icon: "bar-chart-outline" },
  { route: "MealClaims", title: "Meal Claims", description: "Monitor student meal claims", icon: "restaurant-outline" },
];

const StatCard = ({ label, value, icon, tone }) => {
  const t = STAT_TONES[tone] || STAT_TONES.green;
  return (
    <View style={styles.statCard} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={[styles.statIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={20} color={t.fg} />
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const MenuRow = ({ item, first, onPress }) => (
  <TouchableOpacity
    style={[styles.menuRow, !first && styles.menuRowDivider]}
    activeOpacity={0.7}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${item.title}. ${item.description}`}
  >
    <View style={styles.menuIcon}>
      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Text style={styles.menuDescription} numberOfLines={1}>
        {item.description}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

const AdminDashboardScreen = ({ navigation }) => {
  const { token, clearAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => clearAuth(),
      },
    ]);
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Live dashboard statistics, sourced from real backend data only:
  //  - Students / Subscriptions / Meals claimed (all-time total):
  //      GET /api/reports/summary  (ADMIN-only; true totals).
  //  - Pending payments: derived from GET /api/subscriptions by counting each
  //      subscription's embedded `payments` whose stored status is PENDING.
  // No fabricated numbers: a stat shows "—" when its request fails, and a real
  // 0 is rendered as 0 (a failed request is never shown as a genuine zero).
  const [stats, setStats] = useState({
    students: null,
    subscriptions: null,
    pending: null,
    claims: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // Authed client for ADMIN-only endpoints (project convention: Bearer token).
      const authed = axios.create({
        baseURL: BASE_URL,
        timeout: 15000,
        headers: { Authorization: `Bearer ${token}` },
      });

      const summaryReq = authed
        .get("/reports/summary")
        .then((r) => r.data)
        .catch(() => null);

      // Subscriptions embed their payments; count the PENDING ones. The backend
      // writes every payment as VERIFIED on subscription creation, so this
      // legitimately resolves to 0 today — a real 0, not a failed request.
      const subsReq = getSubscriptions()
        .then((subs) => {
          const list = Array.isArray(subs) ? subs : [];
          return list.reduce(
            (count, sub) =>
              count +
              (sub?.payments || []).filter((p) => p?.status === "PENDING").length,
            0
          );
        })
        .catch(() => null);

      const [summary, pending] = await Promise.all([summaryReq, subsReq]);
      if (cancelled) return;

      setStats({
        students:
          summary && Number.isFinite(summary.totalStudents)
            ? summary.totalStudents
            : null,
        subscriptions:
          summary && Number.isFinite(summary.totalSubscriptions)
            ? summary.totalSubscriptions
            : null,
        pending,
        claims:
          summary && Number.isFinite(summary.totalMealsClaimed)
            ? summary.totalMealsClaimed
            : null,
      });
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // "…" while loading, "—" when a source is unavailable, real number otherwise.
  const valueFor = (key) => {
    if (loading) return "…";
    const v = stats[key];
    return v == null ? "—" : v.toLocaleString();
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header: logo + wordmark, admin avatar */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.brand}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="Restau logo"
          />
          <View>
            <Text style={styles.wordmark}>
              <Text style={{ color: LOGO_DARK }}>RESTAU</Text>
              <Text style={{ color: LOGO_LIGHT }}>Admin</Text>
            </Text>
            <Text style={styles.wordmarkSub}>Management System</Text>
          </View>
        </View>

        <View style={styles.avatar} accessible accessibilityLabel="Administrator">
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome hero */}
        <View style={styles.hero}>
          <View style={styles.heroCircleA} />
          <View style={styles.heroCircleB} />

          <View style={styles.heroPill}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.onPrimary} />
            <Text style={styles.heroPillText}>{today}</Text>
          </View>
          <Text style={styles.heroTitle} accessibilityRole="header">
            Welcome back, Admin
          </Text>
          <Text style={styles.heroSubtitle}>Restaurant Management System</Text>
        </View>

        {/* Overview */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {STATS.map(({ key, ...stat }) => (
            <StatCard
              key={key}
              {...stat}
              value={stats[key] == null ? "—" : stats[key].toLocaleString()}
            />
          ))}
        </View>

        {/* Management */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Management</Text>
          <Text style={styles.sectionSubtitle}>Manage the restaurant system</Text>
        </View>

        <View style={styles.menuCard}>
          {MENU.map((item, index) => (
            <MenuRow
              key={item.route}
              item={item}
              first={index === 0}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.75}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Restau Management System</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  /* ---------- Header ---------- */
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 46,
    height: 46,
    marginRight: 10,
  },
  wordmark: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  wordmarkSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F8EE",
    borderWidth: 1,
    borderColor: "#CBEFD8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: LOGO_DARK,
    fontSize: 16,
    fontWeight: "800",
  },

  /* ---------- Hero ---------- */
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 20,
    overflow: "hidden",
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  heroCircleA: {
    position: "absolute",
    top: -50,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroCircleB: {
    position: "absolute",
    bottom: -60,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 14,
  },
  heroPillText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  heroTitle: {
    color: COLORS.onPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: COLORS.onPrimaryMuted,
    fontSize: 13.5,
    marginTop: 4,
  },

  /* ---------- Sections ---------- */
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  sectionHead: {
    marginTop: 6,
    marginBottom: 12,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* ---------- Stats ---------- */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 18,
  },
  statCard: {
    width: "48.2%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    marginTop: 2,
  },

  /* ---------- Menu ---------- */
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  menuRow: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  menuRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    marginRight: 8,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  menuDescription: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    marginTop: 2,
  },

  /* ---------- Logout ---------- */
  logoutButton: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: SPACING.sm,
  },

  footerText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 18,
  },
});

export default AdminDashboardScreen;