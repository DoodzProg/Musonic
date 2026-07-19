/**
 * @file index.tsx
 * @description Settings screen. Language picker, player style (classic / waveform),
 *   crossfade duration, mono audio toggle, screen rotation lock, and landscape
 *   navigation bar position (shown only while rotation is unlocked).
 * @author DoodzProg
 * @version 1.0.4
 * @license MIT
 */

import React, {useState} from 'react';
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import {checkForUpdate} from '../../services/updateChecker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import {useSettingsStore} from '../../store/settingsStore';
import Slider from '@react-native-community/slider';
import {useT} from '../../i18n';

// ─── Icons ────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function PhoneRotateIcon({locked}: {locked: boolean}) {
  const color = locked ? '#FF6B35' : '#fff';
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      {/* Phone body */}
      <Rect x={8} y={5} width={10} height={16} rx={2} stroke={color} strokeWidth={1.5} fill="none" />
      <Circle cx={13} cy={18.5} r={1} fill={color} />
      {/* Rotation arc */}
      <Path
        d="M20 6 A9 9 0 0 0 6 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrowhead */}
      <Path
        d="M4.5 5 L6 6 L7.5 4.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function NavBarSideIcon({onRight, active}: {onRight: boolean; active: boolean}) {
  const color = active ? '#FF6B35' : '#A7A7A7';
  return (
    <Svg width={44} height={28} viewBox="0 0 44 28" style={styles.navBarSideIcon}>
      {/* Landscape screen outline */}
      <Rect x={1} y={1} width={42} height={26} rx={3} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Sidebar bar, on the matching edge */}
      <Rect
        x={onRight ? 33 : 1}
        y={1}
        width={10}
        height={26}
        rx={2}
        fill={color}
      />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const {
    useWaveformScrubber,
    setUseWaveformScrubber,
    crossfadeDuration,
    setCrossfadeDuration,
    rotationLocked,
    setRotationLocked,
    navBarPosition,
    setNavBarPosition,
    isAutoplayEnabled,
    setIsAutoplayEnabled,
    isAutoDownloadEnabled,
    setIsAutoDownloadEnabled,
    autoOnlineMode,
    setAutoOnlineMode,
    locale,
    setLocale,
  } = useSettingsStore();

  const t = useT();

  const ACCENT = '#FF6B35';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Spotify-style header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings.title}</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Language section */}
        <Text style={styles.sectionTitle}>{t.settings.language.sectionTitle}</Text>
        <View style={styles.languagePicker}>
          <TouchableOpacity
            style={[styles.langPill, locale === 'en' && styles.langPillActive]}
            onPress={() => setLocale('en')}
            activeOpacity={0.8}>
            <Text style={[styles.langPillText, locale === 'en' && styles.langPillTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langPill, locale === 'fr' && styles.langPillActive]}
            onPress={() => setLocale('fr')}
            activeOpacity={0.8}>
            <Text style={[styles.langPillText, locale === 'fr' && styles.langPillTextActive]}>
              Français
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textBlock}>
            <Text style={styles.settingLabel}>{t.settings.player.progressLabel}</Text>
            <Text style={styles.settingDesc}>{t.settings.player.progressDesc}</Text>
          </View>
        </View>

        {/* Waveform vs Classic preview */}
        <View style={styles.previewContainer}>
          <TouchableOpacity
            style={[styles.previewCard, !useWaveformScrubber && styles.previewCardActive]}
            onPress={() => setUseWaveformScrubber(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.previewTitle, !useWaveformScrubber && styles.previewTitleActive]}>
              {t.settings.player.classic}
            </Text>
            <Svg width="100%" height="30" viewBox="0 0 100 30">
              <Path d="M10 15 L50 15" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
              <Path d="M50 15 L90 15" stroke="#535353" strokeWidth={3} strokeLinecap="round" />
              <Circle cx="50" cy="15" r="5" fill="#fff" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.previewCard, useWaveformScrubber && styles.previewCardActive]}
            onPress={() => setUseWaveformScrubber(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.previewTitle, useWaveformScrubber && styles.previewTitleActive]}>
              {t.settings.player.waveform}
            </Text>
            <Svg width="100%" height="30" viewBox="0 0 100 30">
              <Rect x="20" y="10" width="3" height="10" fill="#fff" rx="1.5" />
              <Rect x="28" y="5" width="3" height="20" fill="#fff" rx="1.5" />
              <Rect x="36" y="12" width="3" height="6" fill="#fff" rx="1.5" />
              <Rect x="44" y="2" width="3" height="26" fill="#fff" rx="1.5" />
              <Rect x="52" y="8" width="3" height="14" fill="#FF6B35" rx="1.5" />
              <Rect x="60" y="14" width="3" height="2" fill="#535353" rx="1.5" />
              <Rect x="68" y="6" width="3" height="18" fill="#535353" rx="1.5" />
              <Rect x="76" y="11" width="3" height="8" fill="#535353" rx="1.5" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textBlock}>
            <Text style={styles.settingLabel}>{t.settings.transitions.crossfadeLabel}</Text>
            <Text style={styles.settingDesc}>{t.settings.transitions.crossfadeDesc}</Text>
          </View>
        </View>

        <View style={styles.realSliderContainer}>
          <Text style={styles.sliderText}>0 s</Text>

          <View style={styles.sliderWrapper}>
            {/* Floating tooltip above thumb */}
            <View style={[styles.tooltip, {left: `${(crossfadeDuration / 12) * 100}%`}]}>
              <Text style={styles.tooltipText}>{crossfadeDuration} s</Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={12}
              step={1}
              value={crossfadeDuration}
              onValueChange={setCrossfadeDuration}
              minimumTrackTintColor={ACCENT}
              maximumTrackTintColor="#535353"
              thumbTintColor="#fff"
            />
          </View>

          <Text style={styles.sliderText}>12 s</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textBlock}>
            <Text style={styles.settingLabel}>{t.settings.playback.autoplayLabel}</Text>
            <Text style={styles.settingDesc}>{t.settings.playback.autoplayDesc}</Text>
          </View>
          <Switch
            value={isAutoplayEnabled}
            onValueChange={setIsAutoplayEnabled}
            trackColor={{false: '#535353', true: ACCENT}}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textBlock}>
            <Text style={styles.settingLabel}>{t.settings.playback.autoDownloadLabel}</Text>
            <Text style={styles.settingDesc}>{t.settings.playback.autoDownloadDesc}</Text>
          </View>
          <Switch
            value={isAutoDownloadEnabled}
            onValueChange={val => {
              if (val) {
                Alert.alert(
                  t.settings.playback.autoDownloadAlertTitle,
                  t.settings.playback.autoDownloadAlertMessage,
                  [
                    {text: t.settings.playback.autoDownloadAlertCancel, style: 'cancel'},
                    {text: t.settings.playback.autoDownloadAlertConfirm, onPress: () => setIsAutoDownloadEnabled(true)},
                  ],
                );
              } else {
                setIsAutoDownloadEnabled(false);
              }
            }}
            trackColor={{false: '#535353', true: ACCENT}}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        {/* Offline mode section */}
        <Text style={styles.sectionTitle}>{t.settings.sections.offline}</Text>

        <View style={styles.settingRow}>
          <View style={styles.textBlock}>
            <Text style={styles.settingLabel}>{t.settings.offline.autoOnlineLabel}</Text>
            <Text style={styles.settingDesc}>{t.settings.offline.autoOnlineDesc}</Text>
          </View>
          <Switch
            value={autoOnlineMode}
            onValueChange={setAutoOnlineMode}
            trackColor={{false: '#535353', true: ACCENT}}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        {/* Display section */}
        <Text style={styles.sectionTitle}>{t.settings.sections.display}</Text>

        <View style={styles.settingRow}>
          <PhoneRotateIcon locked={rotationLocked} />
          <View style={[styles.textBlock, styles.textBlockIndent]}>
            <Text style={styles.settingLabel}>{t.settings.display.lockRotationLabel}</Text>
            <Text style={styles.settingDesc}>{t.settings.display.lockRotationDesc}</Text>
          </View>
          <Switch
            value={rotationLocked}
            onValueChange={setRotationLocked}
            trackColor={{false: '#535353', true: ACCENT}}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        </View>

        {!rotationLocked && (
          <>
            <Text style={styles.sectionTitle}>{t.settings.display.navBarPositionLabel}</Text>
            <View style={styles.languagePicker}>
              <TouchableOpacity
                style={[styles.langPill, navBarPosition === 'left' && styles.langPillActive]}
                onPress={() => setNavBarPosition('left')}
                activeOpacity={0.8}>
                <NavBarSideIcon onRight={false} active={navBarPosition === 'left'} />
                <Text style={[styles.langPillText, navBarPosition === 'left' && styles.langPillTextActive]}>
                  {t.settings.display.navBarLeft}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langPill, navBarPosition === 'right' && styles.langPillActive]}
                onPress={() => setNavBarPosition('right')}
                activeOpacity={0.8}>
                <NavBarSideIcon onRight={true} active={navBarPosition === 'right'} />
                <Text style={[styles.langPillText, navBarPosition === 'right' && styles.langPillTextActive]}>
                  {t.settings.display.navBarRight}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* About / Updates section */}
        <Text style={styles.sectionTitle}>{t.settings.updates.sectionTitle}</Text>

        <TouchableOpacity
          style={styles.settingRow}
          activeOpacity={0.7}
          disabled={checkingUpdate}
          onPress={async () => {
            setCheckingUpdate(true);
            try { await checkForUpdate(); } finally { setCheckingUpdate(false); }
          }}>
          <View style={styles.textBlock}>
            <Text style={styles.settingLabel}>{t.settings.updates.checkButton}</Text>
          </View>
          {checkingUpdate ? (
            <ActivityIndicator size="small" color={ACCENT} />
          ) : (
            <Text style={styles.versionText}>v1.0.3</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  slider: {width: '100%', height: 40},
  versionText: {fontSize: 13, color: '#888', fontWeight: '500'},
  textBlockIndent: {marginLeft: 12},
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textBlock: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#A7A7A7',
    lineHeight: 18,
  },
  previewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  previewCard: {
    flex: 1,
    backgroundColor: '#282828',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewCardActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#333333',
  },
  previewTitle: {
    color: '#A7A7A7',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewTitleActive: {
    color: '#FF6B35',
  },
  realSliderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 8,
  },
  sliderWrapper: {
    flex: 1,
    marginHorizontal: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: -25,
    marginLeft: -15,
    backgroundColor: '#282828',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sliderText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  languagePicker: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  langPill: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#282828',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langPillActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#2A1A10',
  },
  navBarSideIcon: {
    marginBottom: 8,
  },
  langPillText: {
    color: '#A7A7A7',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  langPillTextActive: {
    color: '#FF6B35',
  },
});
