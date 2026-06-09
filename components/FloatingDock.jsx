import { Pressable, StyleSheet, View } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import Icon from '@/assets/icons'
import Avatar from './Avatar'
import { theme } from '../constants/theme'

const FloatingDock = ({
  router,
  user,
  hasUnreadNotification,
  onNotificationsPress,
}) => {
  const insets = useSafeAreaInsets()
  const bottomOffset = Math.max(insets.bottom, 16) + 12

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={[styles.dock, { bottom: bottomOffset }]}
    >
      <View style={styles.overlay} />
      <View style={styles.specular} />

      <Pressable
        onPress={onNotificationsPress}
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      >
        <Icon name='heart' size={22} color='rgba(255,255,255,0.82)' />
        {hasUnreadNotification && <View style={styles.dot} />}
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        onPress={() => router.push('newPost')}
        style={({ pressed }) => [styles.primaryItem, pressed && styles.primaryPressed]}
      >
        <Icon name='plus' size={22} color='#FFFFFF' />
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        onPress={() => router.push('profile')}
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      >
        <Avatar uri={user?.image} size={34} rounded={theme.radius.xs} />
      </Pressable>

    </BlurView>
  )
}

export default FloatingDock

const styles = StyleSheet.create({
  dock: {
  position: 'absolute',
  alignSelf: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  borderRadius: 100,
  paddingVertical: 10,
  paddingHorizontal: 24,
  overflow: 'hidden',
  borderWidth: 0.5,
  borderColor: 'rgba(255, 255, 255, 0.22)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.45,
  shadowRadius: 24,
  elevation: 20,
},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 22, 0.72)',
    borderRadius: 100,
  },

  specular: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 100,
  },

  item: {
    width: 52,
    height: 52,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ scale: 0.9 }],
  },

primaryItem: {
  width: 48,
  height: 48,
  borderRadius: 100,
  marginHorizontal: 4,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.primary,
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.5,
  shadowRadius: 12,
  elevation: 8,
},

  primaryPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.93 }],
  },

  divider: {
    width: 0.5,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 2,
  },

  dot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#FF453A',
    borderWidth: 1.5,
    borderColor: 'rgba(20, 20, 22, 0.72)',
  },
})