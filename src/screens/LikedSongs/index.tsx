/**
 * @file index.tsx
 * @description Liked Songs screen. Displays all starred tracks with playback,
 *   like/add-to-playlist/download actions per row, and remove-from-liked actions.
 * @author DoodzProg
 * @version 1.0.3
 * @license MIT
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {darkTheme} from '../../theme';
import BackArrowIcon from '../../components/icons/BackArrowIcon';
import PlayIcon from '../../components/icons/PlayIcon';
import DotsVerticalIcon from '../../components/icons/DotsVerticalIcon';
import {getStarred} from '../../api/endpoints/library';
import {getStreamUrl, getCoverArtUrl} from '../../api/client';
import {loadAndPlayTracks} from '../../services/playerActions';
import {usePlayerStore} from '../../store/playerStore';
import {usePlaylistCacheStore} from '../../store/playlistCacheStore';
import {useDownloadStore} from '../../store/downloadStore';
import type {SubsonicSong} from '../../api/types';
import type {Track} from '../../store/playerStore';
import CoverArt from '../../components/CoverArt';
import HeartIcon from '../../components/icons/HeartIcon';
import ShuffleIcon from '../../components/icons/ShuffleIcon';
import PlusCircleIconComponent from '../../components/icons/PlusCircleIcon';
import CheckCircleGreenIcon from '../../components/icons/CheckCircleGreenIcon';
import DownloadStatusIcon from '../../components/icons/DownloadStatusIcon';
import SongOptionsSheet from '../../components/SongOptionsSheet';
import AddToPlaylistSheet from '../../components/AddToPlaylistSheet';
import {showToast} from '../../components/Toast';
import {useT, getT} from '../../i18n';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function songToTrack(s: SubsonicSong): Track {
  const id = String(s.id);
  return {
    id,
    title: s.title,
    artist: s.artist,
    album: s.album || '',
    duration: s.duration || 0,
    coverArt: s.coverArt,
    streamUrl: getStreamUrl(id),
    url: getStreamUrl(id),
    artwork: getCoverArtUrl(s.coverArt || id, 300),
  };
}

// ─── Song Row ────────────────────────────────────────────────────────────────

type SongRowProps = {
  song: SubsonicSong;
  onPress: () => void;
  onMore: () => void;
  onAddToPlaylist: () => void;
};

const SongRow = React.memo(function SongRow({song, onPress, onMore, onAddToPlaylist}: SongRowProps) {
  const likedSongIds = usePlayerStore(s => s.likedSongIds);
  const localLikeOverrides = usePlayerStore(s => s.localLikeOverrides);
  const pendingLikes = usePlayerStore(s => s.pendingLikes);
  const toggleLike = usePlayerStore(s => s.toggleLike);
  const savedSet = usePlaylistCacheStore(s => s.savedSet);
  const id = String(song.id);
  const isLiked = localLikeOverrides[id] !== undefined ? localLikeOverrides[id] : likedSongIds.has(id);
  const isInPlaylist = savedSet.has(id);

  const handleDownloadPress = useCallback(() => {
    const isDownloaded = id in useDownloadStore.getState().downloads;
    if (isDownloaded) {
      const d = getT();
      Alert.alert(
        d.downloads.deleteSongTitle,
        d.downloads.deleteSongMessage(song.title),
        [
          {text: d.downloads.cancelButton, style: 'cancel'},
          {
            text: d.downloads.deleteConfirm,
            style: 'destructive',
            onPress: () => useDownloadStore.getState().deleteDownload(id),
          },
        ],
      );
    } else {
      useDownloadStore.getState().enqueueTrack(song);
    }
  }, [id, song]);

  return (
    <TouchableOpacity style={styles.songRow} onPress={onPress} onLongPress={onMore} delayLongPress={400} activeOpacity={0.7}>
      <CoverArt id={song.coverArt} size={48} borderRadius={4} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
      </View>
      <View style={styles.songActions}>
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 10, right: 6}}
          onPress={() => toggleLike(id, song.title, song.artist)}
          disabled={pendingLikes.has(id)}>
          {pendingLikes.has(id)
            ? <ActivityIndicator size="small" color={darkTheme.accent} style={styles.likeSpinner} />
            : <HeartIcon size={20} color={isLiked ? darkTheme.accent : '#444'} filled={isLiked} />}
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 6, right: 6}}
          onPress={onAddToPlaylist}>
          {isInPlaylist
            ? <CheckCircleGreenIcon size={20} />
            : <PlusCircleIconComponent size={20} color="#444" />}
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, left: 6, right: 6}}
          onPress={handleDownloadPress}>
          <DownloadStatusIcon trackId={id} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreBtn}
          hitSlop={{top: 8, bottom: 8, left: 4, right: 8}}
          onPress={onMore}>
          <DotsVerticalIcon size={20} color="#b3b3b3" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}, (prev, next) => prev.song.id === next.song.id && prev.song.title === next.song.title);

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LikedSongsScreen() {
  const t = useT();
  const navigation = useNavigation<any>();
  const isShuffled = usePlayerStore(s => s.isShuffled);
  const shuffleMode = usePlayerStore(s => s.shuffleMode);
  const toggleShuffle = usePlayerStore(s => s.toggleShuffle);
  const setLikedSongs = usePlayerStore(s => s.setLikedSongs);
  const localLikeOverrides = usePlayerStore(s => s.localLikeOverrides);
  const [songs, setSongs] = useState<SubsonicSong[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSong, setSelectedSong] = useState<SubsonicSong | null>(null);
  const [songOptsVisible, setSongOptsVisible] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<SubsonicSong | null>(null);
  const [addToPlaylistVisible, setAddToPlaylistVisible] = useState(false);
  useFocusEffect(useCallback(() => {
    setLoading(true);
    getStarred()
      .then(d => {
        setSongs(d.songs);
        setLikedSongs(d.songs.map(s => String(s.id)));
      })
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [setLikedSongs]));

  const displayedSongs = songs.filter(s => localLikeOverrides[String(s.id)] !== false);

  const handlePlayAll = useCallback(() => {
    if (displayedSongs.length === 0) return;
    const tracks = displayedSongs.map(songToTrack);
    const ordered = isShuffled ? [...tracks].sort(() => Math.random() - 0.5) : tracks;
    loadAndPlayTracks(ordered, 0);
  }, [displayedSongs, isShuffled]);

  const handlePressSong = useCallback(
    (index: number) => {
      loadAndPlayTracks(displayedSongs.map(songToTrack), index);
    },
    [displayedSongs],
  );

  const handleMore = useCallback((song: SubsonicSong) => {
    setSelectedSong(song);
    setSongOptsVisible(true);
  }, []);

  const handleNavigateAlbum = useCallback((albumId: string) => {
    navigation.navigate('AlbumDetail', {albumId});
  }, [navigation]);

  const handleNavigateArtist = useCallback((artistId: string | undefined, artistName: string) => {
    navigation.navigate('ArtistDetail', {artistId, artistName});
  }, [navigation]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1040" />

      <FlashList
        data={displayedSongs}
        keyExtractor={s => s.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={['#3d1870', '#1a1040', darkTheme.background]}
              style={styles.headerGrad}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}>
                <BackArrowIcon />
              </TouchableOpacity>
              <LinearGradient
                colors={['#6B2FA0', '#1E3A8A']}
                style={styles.headerCover}>
                <HeartIcon size={72} color="#fff" filled />
              </LinearGradient>
              <Text style={styles.title}>{t.likedSongs.title}</Text>
              <Text style={styles.subtitle}>
                {loading ? '…' : t.likedSongs.trackCount(displayedSongs.length)}
              </Text>
            </LinearGradient>

            {!loading && displayedSongs.length > 0 && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.shuffleBtn}
                  onPress={toggleShuffle}
                  activeOpacity={0.8}>
                  <ShuffleIcon mode={shuffleMode} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={handlePlayAll}
                  activeOpacity={0.85}>
                  <PlayIcon />
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={darkTheme.accent} />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>{t.likedSongs.emptyState}</Text>
            </View>
          )
        }
        renderItem={({item, index}) => (
          <SongRow
            song={item}
            onPress={() => handlePressSong(index)}
            onMore={() => handleMore(item)}
            onAddToPlaylist={() => { setAddToPlaylistSong(item); setAddToPlaylistVisible(true); }}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <AddToPlaylistSheet
        visible={addToPlaylistVisible}
        onClose={() => setAddToPlaylistVisible(false)}
        trackId={addToPlaylistSong ? String(addToPlaylistSong.id) : undefined}
        trackTitle={addToPlaylistSong?.title}
        onToast={showToast}
      />

      <SongOptionsSheet
        visible={songOptsVisible}
        onClose={() => setSongOptsVisible(false)}
        track={selectedSong}
        onToast={showToast}
        onNavigateAlbum={handleNavigateAlbum}
        onNavigateArtist={handleNavigateArtist}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: darkTheme.background},
  headerGrad: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 8,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    padding: 6,
    zIndex: 10,
  },
  headerCover: {
    width: 160,
    height: 160,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  shuffleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: darkTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: darkTheme.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  listContent: {
    paddingBottom: 140,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 13,
    marginTop: 2,
  },
  moreBtn: {
    paddingVertical: 8,
    paddingLeft: 4,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeSpinner: {
    width: 20,
    height: 20,
  },
  center: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 15,
    fontWeight: '500',
  },
});
