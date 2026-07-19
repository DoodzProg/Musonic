/**
 * @file useLandscapeSidebarPadding.ts
 * @description Returns the left/right padding a screen's root container needs
 *   to avoid rendering underneath the landscape nav sidebar (TabNavigator's
 *   AppTabBar). Zero on both sides in portrait. Single source of truth so each
 *   screen doesn't reimplement the isLandscape + navBarPosition branching.
 * @author DoodzProg
 * @version 1.0.0
 * @license CC-BY-NC-4.0
 */
import {useIsLandscape} from './useIsLandscape';
import {useSettingsStore} from '../store/settingsStore';
import {SIDEBAR_WIDTH} from '../navigation/shellConstants';

export function useLandscapeSidebarPadding(): {paddingLeft: number; paddingRight: number} {
  const isLandscape = useIsLandscape();
  const navBarPosition = useSettingsStore(s => s.navBarPosition);

  if (!isLandscape) return {paddingLeft: 0, paddingRight: 0};
  return navBarPosition === 'right'
    ? {paddingLeft: 0, paddingRight: SIDEBAR_WIDTH}
    : {paddingLeft: SIDEBAR_WIDTH, paddingRight: 0};
}
