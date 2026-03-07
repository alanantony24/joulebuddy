import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Check,
  Camera,
  ImageIcon,
  X,
  Leaf,
  Sparkles,
} from 'lucide-react-native';
import StyledCard from './StyledCard';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty badge tokens
// ─────────────────────────────────────────────────────────────────────────────
const DIFF = {
  Easy:   { bg: COLORS.mintLight,    text: COLORS.mintDark   },
  Medium: { bg: COLORS.warningLight, text: COLORS.warning    },
  Hard:   { bg: COLORS.errorLight,   text: COLORS.error      },
};

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard
// Props:
//   quest      – quest object from QUEST_CATALOGUE
//   completed  – boolean (driven by GPContext)
//   onComplete – callback(questId, gp) after photo verification
//   delay      – moti stagger delay in ms (default 0)
// ─────────────────────────────────────────────────────────────────────────────
export default function TaskCard({ quest, completed, onComplete, delay = 0 }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewUri,   setPreviewUri]   = useState(null);
  const [confirming,   setConfirming]   = useState(false);
  const [celebrating,  setCelebrating]  = useState(false);

  const diff = DIFF[quest.difficulty] ?? DIFF.Easy;

  // ── Permissions ─────────────────────────────────────────────────────────────
  const ensurePermission = async (type) => {
    const fn = type === 'camera'
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await fn();
    return status === 'granted';
  };

  // ── Camera ───────────────────────────────────────────────────────────────────
  const launchCamera = useCallback(async () => {
    if (!(await ensurePermission('camera'))) {
      Alert.alert('Permission Needed', 'Camera access is required to verify this quest.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.75,
    });
    if (!result.canceled) setPreviewUri(result.assets[0].uri);
  }, []);

  // ── Library ──────────────────────────────────────────────────────────────────
  const launchLibrary = useCallback(async () => {
    if (!(await ensurePermission('library'))) {
      Alert.alert('Permission Needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.75,
    });
    if (!result.canceled) setPreviewUri(result.assets[0].uri);
  }, []);

  // ── Confirm ──────────────────────────────────────────────────────────────────
  const confirmVerification = useCallback(async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1200));   // simulated AI verify
    setConfirming(false);
    setModalVisible(false);
    setPreviewUri(null);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);
    onComplete(quest.id, quest.gp);
  }, [quest, onComplete]);

  const closeModal = () => { setModalVisible(false); setPreviewUri(null); };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Animated card (StyledCard handles moti slide-up + white 24px card) ── */}
      <StyledCard
        delay={delay}
        glow={celebrating}
        style={styles.cardOverride}
      >
        {/* Left: icon in coloured circle */}
        <View style={[styles.iconCircle, { backgroundColor: quest.colorLight }]}>
          <QuestIcon name={quest.icon} color={quest.color} size={24} />
        </View>

        {/* Center: title, description, GP pill */}
        <View style={styles.center}>
          <Text style={[styles.questTitle, completed && styles.strikethrough]}>
            {quest.title}
          </Text>
          <Text style={styles.questDesc} numberOfLines={2}>
            {quest.description}
          </Text>
          <View style={styles.metaRow}>
            {/* GP reward */}
            <View style={styles.gpChip}>
              <Leaf size={11} color={COLORS.mintDark} strokeWidth={2.5} />
              <Text style={styles.gpChipText}>+{quest.gp} GP</Text>
            </View>
            {/* Difficulty */}
            <View style={[styles.diffChip, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffChipText, { color: diff.text }]}>
                {quest.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Verify pill  OR  Done checkmark */}
        <View style={styles.ctaCol}>
          {completed ? (
            <View style={styles.doneCircle}>
              <Check size={16} color={COLORS.textWhite} strokeWidth={3} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.verifyPill}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Camera size={13} color={COLORS.textWhite} strokeWidth={2.5} />
              <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>
      </StyledCard>

      {/* ── Photo Verification Bottom Sheet Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={styles.sheet}>

            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Sparkles size={18} color={COLORS.mint} strokeWidth={2} />
                <Text style={styles.sheetTitle}>Photo Verification</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={{ padding: SPACING.xs }}>
                <X size={20} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Quest recap badge */}
            <View style={[styles.questBadge, { backgroundColor: quest.colorLight }]}>
              <QuestIcon name={quest.icon} color={quest.color} size={18} />
              <Text style={[styles.questBadgeName, { color: quest.color }]} numberOfLines={1}>
                {quest.title}
              </Text>
              <View style={styles.gpBadgePill}>
                <Leaf size={10} color={COLORS.mintDark} strokeWidth={2.5} />
                <Text style={styles.gpBadgeText}>+{quest.gp} GP</Text>
              </View>
            </View>

            {/* Instruction */}
            <Text style={styles.instruction}>
              Take or upload a photo proving you completed this quest.{'\n'}
              Our AI verifies your submission instantly.
            </Text>

            {/* Preview OR picker buttons */}
            {previewUri ? (
              <View style={styles.preview}>
                <Image source={{ uri: previewUri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.retakeBtn} onPress={() => setPreviewUri(null)}>
                  <X size={13} color={COLORS.textWhite} strokeWidth={2.5} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.pickerCard} onPress={launchCamera} activeOpacity={0.8}>
                  <View style={styles.pickerIcon}>
                    <Camera size={22} color={COLORS.mint} strokeWidth={2} />
                  </View>
                  <Text style={styles.pickerLabel}>Take Photo</Text>
                  <Text style={styles.pickerSub}>Camera</Text>
                </TouchableOpacity>

                <View style={styles.pickerSep} />

                <TouchableOpacity style={styles.pickerCard} onPress={launchLibrary} activeOpacity={0.8}>
                  <View style={styles.pickerIcon}>
                    <ImageIcon size={22} color={COLORS.mint} strokeWidth={2} />
                  </View>
                  <Text style={styles.pickerLabel}>Upload Photo</Text>
                  <Text style={styles.pickerSub}>Library</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm button */}
            {previewUri && (
              <TouchableOpacity
                style={[styles.confirmBtn, confirming && styles.confirmBtnLoading]}
                onPress={confirmVerification}
                disabled={confirming}
                activeOpacity={0.85}
              >
                {confirming ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.textWhite} />
                    <Text style={styles.confirmText}>Verifying with AI…</Text>
                  </>
                ) : (
                  <>
                    <Check size={18} color={COLORS.textWhite} strokeWidth={3} />
                    <Text style={styles.confirmText}>Confirm & Earn {quest.gp} GP</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Icon resolver ────────────────────────────────────────────────────────────
function QuestIcon({ name, color, size }) {
  const icons = {
    Wind:        require('lucide-react-native').Wind,
    ZapOff:      require('lucide-react-native').ZapOff,
    Droplets:    require('lucide-react-native').Droplets,
    Sun:         require('lucide-react-native').Sun,
    Thermometer: require('lucide-react-native').Thermometer,
    Leaf:        require('lucide-react-native').Leaf,
  };
  const Icon = icons[name] ?? require('lucide-react-native').Leaf;
  return <Icon size={size} color={color} strokeWidth={2} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Card override (StyledCard base = white, 24px, shadow) ──
  cardOverride: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,          // tighter than StyledCard's 20px default
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },

  // Left icon circle
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Center text block
  center: { flex: 1, gap: 4 },
  questTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textHeading,
    lineHeight: 20,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  questDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textBody,
    lineHeight: 17,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 2 },
  gpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.mintLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  gpChipText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark, fontSize: 11 },
  diffChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  diffChipText: { ...TYPOGRAPHY.micro, fontSize: 9 },

  // Right CTA
  ctaCol: { flexShrink: 0 },
  verifyPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 9,
    ...SHADOWS.mint,
  },
  verifyText: { ...TYPOGRAPHY.captionBold, color: COLORS.textWhite },
  doneCircle: {
    width: 38, height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.mint,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Modal sheet ──
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sheetTitle: { ...TYPOGRAPHY.h3, color: COLORS.textHeading },

  questBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  questBadgeName: { ...TYPOGRAPHY.bodyMd, flex: 1, fontWeight: '600' },
  gpBadgePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.mintLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  gpBadgeText: { ...TYPOGRAPHY.captionBold, color: COLORS.mintDark },

  instruction: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textBody,
    textAlign: 'center', lineHeight: 20,
  },

  // Picker cards
  pickerRow: { flexDirection: 'row', gap: SPACING.md },
  pickerCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, gap: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  pickerIcon: {
    width: 52, height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mintPale,
    alignItems: 'center', justifyContent: 'center',
  },
  pickerLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.textHeading },
  pickerSub:   { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  pickerSep:   { width: 1, backgroundColor: COLORS.border, alignSelf: 'stretch' },

  // Preview
  preview: { borderRadius: RADIUS.card, overflow: 'hidden' },
  previewImg: { width: '100%', height: 200, resizeMode: 'cover' },
  retakeBtn: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  retakeText: { ...TYPOGRAPHY.captionBold, color: COLORS.textWhite },

  // Confirm
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    ...SHADOWS.mint,
  },
  confirmBtnLoading: { backgroundColor: COLORS.mintDark },
  confirmText: { ...TYPOGRAPHY.h4, color: COLORS.textWhite },
});
