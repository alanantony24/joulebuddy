import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Pressable,
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
  ChevronDown,
  Star,
  X,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, getLevel, getLevelProgress } from '../theme/theme';
import { useGP, BADGE_CATALOGUE } from '../context/GPContext';
import { useSettings } from '../services/settingsService';
import { USER_PROFILE } from '../data/profileData';
import { FAQ_ITEMS, PRIVACY_POLICY_TEXT } from '../data/legalContent';

// ─── List item ────────────────────────────────────────────────────────────────
function ListItem({ icon: Icon, iconColor, iconBg, label, desc, onPress, showArrow = true, right }) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.listIcon, { backgroundColor: iconBg ?? COLORS.mintPale }]}>
        <Icon size={18} color={iconColor ?? COLORS.mint} strokeWidth={2} />
      </View>
      <View style={styles.listText}>
        <Text style={styles.listLabel}>{label}</Text>
        {desc ? <Text style={styles.listDesc}>{desc}</Text> : null}
      </View>
      {right ?? (showArrow ? <ChevronRight size={16} color={COLORS.textMuted} strokeWidth={2} /> : null)}
    </TouchableOpacity>
  );
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FAQItem({ item, expanded, onToggle }) {
  return (
    <TouchableOpacity style={styles.faqItem} onPress={onToggle} activeOpacity={0.75}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.q}</Text>
        <ChevronDown
          size={16}
          color={COLORS.textMuted}
          strokeWidth={2}
          style={expanded ? { transform: [{ rotate: '180deg' }] } : undefined}
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { totalGP, streak, completedQuestIds, unlockedBadgeIds } = useGP();
  const { pushNotifications, biometricLogin, paperlessBilling, toggleSetting } = useSettings();
  const lvl      = getLevel(totalGP);
  const progress = getLevelProgress(totalGP);

  const [faqVisible, setFaqVisible]         = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [expandedFaq, setExpandedFaq]       = useState(null);

  function handleLogout() {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your WattWise account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => Alert.alert('Logged Out', 'You have been logged out successfully.'),
        },
      ],
    );
  }

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
            <Text style={styles.avatarInitials}>{USER_PROFILE.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{USER_PROFILE.name}</Text>
            <Text style={styles.userEmail}>{USER_PROFILE.email}</Text>
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
              : 'Maximum level reached!'}
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
            <ListItem
              icon={Phone}
              label="Phone Number"
              desc={USER_PROFILE.phone}
              iconBg={COLORS.mintPale}
              onPress={() => Alert.alert('Phone Number', `${USER_PROFILE.phone}\n\nTo update your phone number, please contact SP Group support.`)}
            />
            <View style={styles.separator} />
            <ListItem
              icon={CreditCard}
              label="Account Number"
              desc={USER_PROFILE.accountNumber}
              iconBg={COLORS.mintPale}
              onPress={() => Alert.alert('Account Number', `${USER_PROFILE.accountNumber}\n\nThis is your unique SP Group account identifier.`)}
            />
            <View style={styles.separator} />
            <ListItem
              icon={Home}
              label="Service Address"
              desc={USER_PROFILE.serviceAddress}
              iconBg={COLORS.mintPale}
              onPress={() => Alert.alert('Service Address', `${USER_PROFILE.serviceAddress}\nSingapore 310123\n\nTo update your service address, please contact SP Group support.`)}
            />
          </View>
        </View>

        {/* Notifications & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications & Security</Text>
          <View style={styles.listCard}>
            <ListItem
              icon={Bell}
              label="Push Notifications"
              iconBg={COLORS.orangeLight}
              iconColor={COLORS.orange}
              onPress={() => toggleSetting('pushNotifications')}
              showArrow={false}
              right={
                <Switch
                  value={pushNotifications}
                  onValueChange={() => toggleSetting('pushNotifications')}
                  trackColor={{ false: COLORS.borderLight, true: COLORS.mintLight }}
                  thumbColor={pushNotifications ? COLORS.mint : COLORS.textMuted}
                />
              }
            />
            <View style={styles.separator} />
            <ListItem
              icon={Fingerprint}
              label="Biometric Login"
              iconBg={COLORS.blueLight}
              iconColor={COLORS.blue}
              onPress={() => toggleSetting('biometricLogin')}
              showArrow={false}
              right={
                <Switch
                  value={biometricLogin}
                  onValueChange={() => toggleSetting('biometricLogin')}
                  trackColor={{ false: COLORS.borderLight, true: COLORS.mintLight }}
                  thumbColor={biometricLogin ? COLORS.mint : COLORS.textMuted}
                />
              }
            />
            <View style={styles.separator} />
            <ListItem
              icon={FileText}
              label="Paperless Billing"
              iconBg={COLORS.mintLight}
              iconColor={COLORS.mint}
              onPress={() => toggleSetting('paperlessBilling')}
              showArrow={false}
              right={
                <Switch
                  value={paperlessBilling}
                  onValueChange={() => toggleSetting('paperlessBilling')}
                  trackColor={{ false: COLORS.borderLight, true: COLORS.mintLight }}
                  thumbColor={paperlessBilling ? COLORS.mint : COLORS.textMuted}
                />
              }
            />
          </View>
        </View>

        {/* Help & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Legal</Text>
          <View style={styles.listCard}>
            <ListItem
              icon={HelpCircle}
              label="FAQ & Support"
              iconBg={COLORS.mintPale}
              onPress={() => setFaqVisible(true)}
            />
            <View style={styles.separator} />
            <ListItem
              icon={Shield}
              label="Privacy Policy"
              iconBg={COLORS.mintPale}
              onPress={() => setPrivacyVisible(true)}
            />
            <View style={styles.separator} />
            <ListItem icon={FileText} label="Terms of Service" iconBg={COLORS.mintPale} showArrow={false} desc="v3.2.1" />
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: SPACING.sm }]}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <LogOut size={18} color={COLORS.error} strokeWidth={2} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── FAQ Modal ── */}
      <Modal visible={faqVisible} animationType="slide" transparent onRequestClose={() => setFaqVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFaqVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <HelpCircle size={20} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.modalTitle}>FAQ & Support</Text>
              <TouchableOpacity onPress={() => setFaqVisible(false)} style={{ padding: SPACING.xs }}>
                <X size={20} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {FAQ_ITEMS.map((item) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  expanded={expandedFaq === item.id}
                  onToggle={() => setExpandedFaq((prev) => (prev === item.id ? null : item.id))}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Privacy Policy Modal ── */}
      <Modal visible={privacyVisible} animationType="slide" transparent onRequestClose={() => setPrivacyVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPrivacyVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Shield size={20} color={COLORS.mint} strokeWidth={2} />
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyVisible(false)} style={{ padding: SPACING.xs }}>
                <X size={20} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.policyText}>{PRIVACY_POLICY_TEXT}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40, height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.textHeading, flex: 1 },

  // FAQ
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: SPACING.md,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  faqQuestion: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading, flex: 1, fontWeight: '600' },
  faqAnswer: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 20, marginTop: SPACING.sm },

  // Privacy policy
  policyText: { ...TYPOGRAPHY.bodySm, color: COLORS.textBody, lineHeight: 22 },
});
