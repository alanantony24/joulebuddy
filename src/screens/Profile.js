import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  Phone,
  CreditCard,
  Home,
  Bell,
  Fingerprint,
  FileText,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, getLevel, getLevelProgress } from '../theme/theme';
import { useGP } from '../context/GPContext';
import { BADGE_CATALOGUE } from '../context/GPContext';

// ─── List item ────────────────────────────────────────────────────────────────
function ListItem({ icon: Icon, iconColor, iconBg, label, desc, danger, onPress, showArrow = true }) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.listIcon, { backgroundColor: iconBg ?? COLORS.mintPale }]}>
        <Icon size={18} color={iconColor ?? COLORS.mint} strokeWidth={2} />
      </View>
      <View style={styles.listText}>
        <Text style={[styles.listLabel, danger && { color: COLORS.error }]}>{label}</Text>
        {desc ? <Text style={styles.listDesc}>{desc}</Text> : null}
      </View>
      {showArrow && <ChevronRight size={16} color={COLORS.textMuted} strokeWidth={2} />}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { totalGP, streak, completedQuestIds, unlockedBadgeIds } = useGP();
  const lvl      = getLevel(totalGP);
  const progress = getLevelProgress(totalGP);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.mint} />
      <GreenPointsHeader title="My Profile" subtitle="WattWise account" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar hero */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>AAJ</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Ahmad A. Johari</Text>
            <Text style={styles.userEmail}>ahmad.johari@email.com</Text>
            <View style={styles.tierRow}>
              <Text style={styles.tierEmoji}>{lvl.icon}</Text>
              <Text style={[styles.tierLabel, { color: lvl.color }]}>
                Level {lvl.level} · {lvl.title}
              </Text>
            </View>
          </View>
        </View>

        {/* GP progress card */}
        <View style={styles.gpCard}>
          <View style={styles.gpCardRow}>
            <View style={styles.gpStat}>
              <Text style={styles.gpStatValue}>{totalGP.toLocaleString()}</Text>
              <Text style={styles.gpStatLabel}>Total GP</Text>
            </View>
            <View style={styles.gpDivider} />
            <View style={styles.gpStat}>
              <Text style={styles.gpStatValue}>{streak}</Text>
              <Text style={styles.gpStatLabel}>Day Streak</Text>
            </View>
            <View style={styles.gpDivider} />
            <View style={styles.gpStat}>
              <Text style={styles.gpStatValue}>{completedQuestIds.size}</Text>
              <Text style={styles.gpStatLabel}>Quests Done</Text>
            </View>
          </View>
          <View style={styles.gpBarTrack}>
            <View
              style={[
                styles.gpBarFill,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: lvl.color },
              ]}
            />
          </View>
          <Text style={styles.gpBarHint}>
            {lvl.level < 5
              ? `${(lvl.max - totalGP).toLocaleString()} GP to Level ${lvl.level + 1}`
              : 'Maximum level reached! 🏆'}
          </Text>
        </View>

        {/* Badge Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={16} color={COLORS.gold} strokeWidth={2} fill={COLORS.gold} />
            <Text style={styles.sectionTitle}>Badge Collection</Text>
            <Text style={styles.sectionCount}>
              {unlockedBadgeIds.size}/{BADGE_CATALOGUE.length}
            </Text>
          </View>
          <View style={styles.badgeGrid}>
            {BADGE_CATALOGUE.map((badge) => {
              const unlocked = unlockedBadgeIds.has(badge.id);
              return (
                <View key={badge.id} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
                  <Text style={[styles.badgeEmoji, !unlocked && { opacity: 0.25 }]}>
                    {badge.emoji}
                  </Text>
                  <Text
                    style={[styles.badgeTitle, !unlocked && { color: COLORS.textMuted }]}
                    numberOfLines={1}
                  >
                    {badge.title}
                  </Text>
                  {!unlocked && (
                    <Text style={styles.badgeLockText} numberOfLines={2}>
                      {badge.desc}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Personal details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.listCard}>
            <ListItem icon={Phone}      label="Phone Number"   desc="+65 9123 4567"       iconBg={COLORS.mintPale} />
            <View style={styles.separator} />
            <ListItem icon={CreditCard} label="Account Number" desc="SP-2024-88451234"    iconBg={COLORS.mintPale} />
            <View style={styles.separator} />
            <ListItem icon={Home}       label="Service Address" desc="Blk 123 Toa Payoh Lor 4, #08-45" iconBg={COLORS.mintPale} />
          </View>
        </View>

        {/* Notifications & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications & Security</Text>
          <View style={styles.listCard}>
            <ListItem icon={Bell}        label="Push Notifications" iconBg={COLORS.orangeLight} iconColor={COLORS.orange} />
            <View style={styles.separator} />
            <ListItem icon={Fingerprint} label="Biometric Login"    iconBg={COLORS.blueLight}   iconColor={COLORS.blue} />
            <View style={styles.separator} />
            <ListItem icon={FileText}    label="Paperless Billing"  iconBg={COLORS.mintLight}   iconColor={COLORS.mint} />
          </View>
        </View>

        {/* Help & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Legal</Text>
          <View style={styles.listCard}>
            <ListItem icon={HelpCircle} label="FAQ & Support"    iconBg={COLORS.mintPale} />
            <View style={styles.separator} />
            <ListItem icon={Shield}     label="Privacy Policy"   iconBg={COLORS.mintPale} />
            <View style={styles.separator} />
            <ListItem icon={FileText}   label="Terms of Service" iconBg={COLORS.mintPale} showArrow={false} desc="v3.2.1" />
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: SPACING.sm }]}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
            <LogOut size={18} color={COLORS.error} strokeWidth={2} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.mint },
  scroll:        { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxl },

  // Avatar card
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  avatarCircle: {
    width: 68, height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.mint,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarInitials: { ...TYPOGRAPHY.h2, color: COLORS.textWhite },
  userName:       { ...TYPOGRAPHY.h3, color: COLORS.textHeading },
  userEmail:      { ...TYPOGRAPHY.bodySm, color: COLORS.textMuted, marginTop: 2 },
  tierRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  tierEmoji:      { fontSize: 13 },
  tierLabel:      { ...TYPOGRAPHY.captionBold },

  // GP card
  gpCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.base,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  gpCardRow:   { flexDirection: 'row', alignItems: 'center' },
  gpStat:      { flex: 1, alignItems: 'center', gap: 2 },
  gpStatValue: { ...TYPOGRAPHY.h2, color: COLORS.textHeading },
  gpStatLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  gpDivider:   { width: 1, height: 40, backgroundColor: COLORS.borderLight },
  gpBarTrack:  { height: 8, backgroundColor: COLORS.borderLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  gpBarFill:   { height: '100%', borderRadius: RADIUS.full },
  gpBarHint:   { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center' },

  // Section
  section:       { gap: SPACING.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sectionTitle:  { ...TYPOGRAPHY.h4, color: COLORS.textHeading, flex: 1 },
  sectionCount:  { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted },

  // Badge grid
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeCard: {
    width: '22%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center', gap: 3,
    ...SHADOWS.xs,
    minHeight: 80, justifyContent: 'center',
  },
  badgeLocked: {
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
  },
  badgeEmoji:    { fontSize: 26 },
  badgeTitle:    { ...TYPOGRAPHY.micro, color: COLORS.textHeading, textAlign: 'center', fontSize: 8 },
  badgeLockText: { ...TYPOGRAPHY.micro, color: COLORS.textMuted, textAlign: 'center', fontSize: 7, lineHeight: 10 },

  // List card
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  listItem:  { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  listIcon:  { width: 38, height: 38, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listText:  { flex: 1, gap: 2 },
  listLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading },
  listDesc:  { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  separator: { height: 1, backgroundColor: COLORS.borderLight, marginLeft: 70 },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.card,
    paddingVertical: SPACING.base,
    borderWidth: 1.5, borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  logoutText: { ...TYPOGRAPHY.h4, color: COLORS.error },
});
