/**
 * @file GlobalHeader.tsx
 * @description Top app bar used across main screens. Shows the Musonic logo,
 *   a hamburger drawer trigger, and optional horizontal filter pills.
 *   OfflineBanner is rendered inline at the top (flex flow) to push header
 *   content down instead of overlaying it.
 * @author DoodzProg
 * @version 1.2.0
 * @license CC-BY-NC-4.0
 */
import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {useDrawer} from './DrawerContainer';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import LogoIcon from './icons/LogoIcon';
import OfflineBanner from './OfflineBanner';
import {darkTheme} from '../theme';
import {useIsLandscape} from '../hooks/useIsLandscape';

type Filter = {key: string; label: string};

type Props =
  | {
      variant: 'home';
      filters: readonly Filter[];
      activeFilter: string;
      onFilterPress: (key: string) => void;
    }
  | {
      variant: 'simple';
      title: string;
      /**
       * Rendered inline next to the title in landscape only (e.g. a search
       * bar) so the header doesn't cost a whole separate row of scarce
       * vertical space. Ignored in portrait — render it below the header
       * yourself there instead.
       */
      landscapeInlineExtra?: React.ReactNode;
    };

export default function GlobalHeader(props: Props) {
  const {open: openDrawer} = useDrawer();
  const isLandscape = useIsLandscape();

  if (props.variant === 'simple') {
    return (
      <View>
        <OfflineBanner />
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.profileCircle} activeOpacity={0.7}>
            <LogoIcon size={36} />
          </TouchableOpacity>
          <Text style={styles.simpleTitle}>{props.title}</Text>
          {isLandscape && props.landscapeInlineExtra && (
            <View style={styles.landscapeExtraSlot}>{props.landscapeInlineExtra}</View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View>
      <OfflineBanner />
      <View style={styles.homeHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
          style={styles.pillsScroll}>
          {props.filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.pill, props.activeFilter === f.key && styles.pillActive]}
              onPress={() => props.onFilterPress(f.key)}
              activeOpacity={0.8}>
              <Text style={[styles.pillText, props.activeFilter === f.key && styles.pillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fade overlay on left edge of filter pills */}
        <View style={styles.fadeOverlay} pointerEvents="none">
          <Svg width={80} height={56}>
            <Defs>
              <LinearGradient id="hdrFade" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={darkTheme.background} stopOpacity={1} />
                <Stop offset="0.6" stopColor={darkTheme.background} stopOpacity={1} />
                <Stop offset="1" stopColor={darkTheme.background} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={80} height={56} fill="url(#hdrFade)" />
          </Svg>
        </View>

        {/* Profil absolu au-dessus */}
        <View style={styles.profileAbsolute}>
          <TouchableOpacity onPress={openDrawer} style={styles.profileCircle} activeOpacity={0.7}>
            <LogoIcon size={36} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Home variant */
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.background,
    paddingLeft: 16,
    height: 56,
  },
  pillsScroll: {flex: 1},
  pillsContent: {
    gap: 8,
    paddingLeft: 64,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
  },
  pillActive: {
    backgroundColor: darkTheme.accent,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  pillTextActive: {
    color: '#000',
  },
  fadeOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  profileAbsolute: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },

  /* Simple variant */
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.background,
    paddingHorizontal: 16,
    height: 56,
    gap: 16,
  },
  simpleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: darkTheme.textPrimary,
  },
  landscapeExtraSlot: {
    flex: 1,
  },

  /* Shared */
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
