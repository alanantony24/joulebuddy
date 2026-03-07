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
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  Clock,
  Download,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  Banknote,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─── Mock data ────────────────────────────────────────────────────────────────
const BILLS = [
  {
    id: 'b1',
    month: 'October 2025',
    amount: 142.50,
    dueDate: '15 Nov 2025',
    status: 'due',
    breakdown: { Electricity: 98.40, Water: 29.60, Gas: 14.50 },
  },
  {
    id: 'b2',
    month: 'September 2025',
    amount: 138.20,
    dueDate: '15 Oct 2025',
    status: 'paid',
    breakdown: { Electricity: 94.80, Water: 28.40, Gas: 15.00 },
  },
  {
    id: 'b3',
    month: 'August 2025',
    amount: 155.80,
    dueDate: '15 Sep 2025',
    status: 'paid',
    breakdown: { Electricity: 110.20, Water: 30.60, Gas: 15.00 },
  },
  {
    id: 'b4',
    month: 'July 2025',
    amount: 148.30,
    dueDate: '15 Aug 2025',
    status: 'paid',
    breakdown: { Electricity: 102.60, Water: 30.20, Gas: 15.50 },
  },
];

const PAYMENT_METHODS = [
  { id: 'm1', label: 'OCBC Debit ···4521', icon: CreditCard },
  { id: 'm2', label: 'PayNow',              icon: Banknote   },
];

// ─── BillRow ──────────────────────────────────────────────────────────────────
function BillRow({ bill, expanded, onToggle }) {
  const isDue = bill.status === 'due';

  return (
    <TouchableOpacity
      style={[styles.billCard, isDue && styles.billCardDue]}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View style={styles.billMain}>
        <View style={[styles.billIcon, { backgroundColor: isDue ? COLORS.warningLight : COLORS.mintLight }]}>
          {isDue
            ? <Clock       size={18} color={COLORS.warning} strokeWidth={2} />
            : <CheckCircle size={18} color={COLORS.mint}    strokeWidth={2} />}
        </View>
        <View style={styles.billInfo}>
          <Text style={styles.billMonth}>{bill.month}</Text>
          <Text style={styles.billDue}>Due {bill.dueDate}</Text>
        </View>
        <View style={styles.billRight}>
          <Text style={[styles.billAmount, isDue && { color: COLORS.mint }]}>
            ${bill.amount.toFixed(2)}
          </Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isDue ? COLORS.warningLight : COLORS.mintLight },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isDue ? COLORS.warning : COLORS.mint },
              ]}
            >
              {isDue ? 'Due' : 'Paid'}
            </Text>
          </View>
        </View>
      </View>

      {/* Breakdown */}
      {expanded && (
        <View style={styles.breakdown}>
          <View style={styles.breakdownDivider} />
          {Object.entries(bill.breakdown).map(([key, val]) => (
            <View key={key} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{key}</Text>
              <Text style={styles.breakdownVal}>${val.toFixed(2)}</Text>
            </View>
          ))}
          {isDue && (
            <TouchableOpacity style={styles.payBtn} activeOpacity={0.8}>
              <Text style={styles.payBtnText}>Pay Now</Text>
              <ArrowUpRight size={16} color={COLORS.textWhite} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.downloadRow} activeOpacity={0.75}>
            <Download size={14} color={COLORS.mint} strokeWidth={2} />
            <Text style={styles.downloadText}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BillsScreen() {
  const [expandedId, setExpandedId] = useState('b1');
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.mint} />
      <GreenPointsHeader title="Bills & Payments" subtitle="SP Group · 4-room HDB" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Outstanding banner — gradient card */}
        <LinearGradient
          colors={GRADIENTS.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.outstandingBanner}
        >
          <View>
            <Text style={styles.outLabel}>Current Outstanding</Text>
            <Text style={styles.outAmount}>$142.50</Text>
            <Text style={styles.outDue}>Due by 15 Nov 2025</Text>
          </View>
          <TouchableOpacity style={styles.payNowBtn} activeOpacity={0.85}>
            <Text style={styles.payNowText}>Pay Now</Text>
            <ArrowUpRight size={16} color={COLORS.mint} strokeWidth={2.5} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <TouchableOpacity key={id} style={styles.methodRow} activeOpacity={0.75}>
              <View style={styles.methodIcon}>
                <Icon size={18} color={COLORS.mint} strokeWidth={2} />
              </View>
              <Text style={styles.methodLabel}>{label}</Text>
              <ChevronRight size={16} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill History</Text>
          {BILLS.map((bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              expanded={expandedId === bill.id}
              onToggle={() => toggle(bill.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.mint },
  scroll:        { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxl },

  // Outstanding banner
  outstandingBanner: {
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  outLabel:  { ...TYPOGRAPHY.caption, color: COLORS.textWhiteSub },
  outAmount: { ...TYPOGRAPHY.h1, color: COLORS.textWhite, marginVertical: 2 },
  outDue:    { ...TYPOGRAPHY.caption, color: COLORS.textWhiteSub },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.textWhite,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  payNowText: { ...TYPOGRAPHY.bodyMd, color: COLORS.mint, fontWeight: '700' },

  // Section
  section:      { gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.textHeading },

  // Payment method row
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.xs,
  },
  methodIcon: {
    width: 36, height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mintPale,
    alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading, flex: 1 },

  // Bill card
  billCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  billCardDue: { borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  billMain: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  billIcon: {
    width: 40, height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  billInfo:   { flex: 1 },
  billMonth:  { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading },
  billDue:    { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  billRight:  { alignItems: 'flex-end', gap: 4 },
  billAmount: { ...TYPOGRAPHY.h4, color: COLORS.textHeading, fontWeight: '700' },
  statusPill: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { ...TYPOGRAPHY.micro, fontSize: 9 },

  // Breakdown
  breakdown:        { marginTop: SPACING.md, gap: SPACING.sm },
  breakdownDivider: { height: 1, backgroundColor: COLORS.borderLight },
  breakdownRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel:   { ...TYPOGRAPHY.bodySm, color: COLORS.textBody },
  breakdownVal:     { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    ...SHADOWS.mint,
  },
  payBtnText:   { ...TYPOGRAPHY.h4, color: COLORS.textWhite },
  downloadRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, justifyContent: 'center' },
  downloadText: { ...TYPOGRAPHY.captionBold, color: COLORS.mint },
});
