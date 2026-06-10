import Icon from '@/assets/icons'
import { BlurView } from 'expo-blur'
import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '../constants/theme'
import { wp } from '../helpers/common'
import Avatar from './Avatar'

const FloatingDock = ({
  router,
  user,
  hasUnreadNotification,
  onNotificationsPress,
  onHomePress,
  activeTab = 'home', // default active tab is home
}) => {
  const insets = useSafeAreaInsets()
  const bottomOffset = Math.max(insets.bottom, 16) + 12

  // Shared values for squishy interactive micro-animations
  const homeScale = useSharedValue(1)
  const notifScale = useSharedValue(1)
  const plusScale = useSharedValue(1)
  const profileScale = useSharedValue(1)

  // Shared value for breathing pulse animation on primary 'plus' button
  const plusPulse = useSharedValue(1)

  useEffect(() => {
    plusPulse.value = withRepeat(
      withTiming(1.04, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      -1,
      true
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animated styles
  const homeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(homeScale.value, { damping: 10, stiffness: 200 }) }],
  }))
  const notifAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(notifScale.value, { damping: 10, stiffness: 200 }) }],
  }))
  const plusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(plusScale.value * plusPulse.value, { damping: 10, stiffness: 200 }) }
    ],
  }))
  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(profileScale.value, { damping: 10, stiffness: 200 }) }],
  }))

  const handleHomePressInternal = () => {
    if (activeTab === 'home') {
      if (onHomePress) onHomePress()
    } else {
      router.push('(main)/home')
    }
  }

  const handleNotificationsPressInternal = () => {
    if (activeTab === 'notifications') {
      // already on notifications
    } else {
      if (onNotificationsPress) {
        onNotificationsPress()
      } else {
        router.push('(main)/notifications')
      }
    }
  }

  const handleProfilePressInternal = () => {
    if (activeTab === 'profile') {
      // already on profile
    } else {
      router.push('(main)/profile')
    }
  }

  const activeColor = theme.colors.primary; // brand vibrant orange
  const inactiveColor = 'white';

  return (
    <BlurView
      intensity={70}
      tint="dark"
      style={[styles.dock, { bottom: bottomOffset }]}
    >
      <View style={styles.overlay} />

      {/* Home */}
      <Pressable
        onPressIn={() => { homeScale.value = 0.82 }}
        onPressOut={() => { homeScale.value = 1.0 }}
        onPress={handleHomePressInternal}
        style={[styles.tabButton, activeTab === 'home' && styles.activeTabPill]}
      >
        <Animated.View style={[homeAnimatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          <Icon
            name='home'
            size={22}
            color={activeTab === 'home' ? activeColor : inactiveColor}
          />
        </Animated.View>
      </Pressable>

      {/* Notifications */}
      <Pressable
        onPressIn={() => { notifScale.value = 0.82 }}
        onPressOut={() => { notifScale.value = 1.0 }}
        onPress={handleNotificationsPressInternal}
        style={[styles.tabButton, activeTab === 'notifications' && styles.activeTabPill]}
      >
        <Animated.View style={[notifAnimatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          <Icon
            name='heart'
            size={22}
            color={activeTab === 'notifications' ? activeColor : inactiveColor}
          />
          {hasUnreadNotification && activeTab !== 'notifications' && <View style={styles.dot} />}
        </Animated.View>
      </Pressable>

      {/* New Post */}
      <Pressable
        onPressIn={() => { plusScale.value = 0.82 }}
        onPressOut={() => { plusScale.value = 1.0 }}
        onPress={() => router.push('newPost')}
        style={[styles.tabButton, activeTab === 'newPost' && styles.activeTabPill]}
      >
        <Animated.View style={[plusAnimatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          <Icon
            name='plus'
            size={22}
            color={activeTab === 'newPost' ? activeColor : inactiveColor}
          />
        </Animated.View>
      </Pressable>

      {/* Profile */}
      <Pressable
        onPressIn={() => { profileScale.value = 0.82 }}
        onPressOut={() => { profileScale.value = 1.0 }}
        onPress={handleProfilePressInternal}
        style={[styles.tabButton, activeTab === 'profile' && styles.activeTabPill]}
      >
        <Animated.View style={[profileAnimatedStyle, { alignItems: 'center', justifyContent: 'center' }, activeTab === 'profile' && styles.activeAvatarWrapper]}>
          <Avatar uri={user?.image} size={26} />
        </Animated.View>
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
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
    width: wp(80),
    maxWidth: 340,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 26, 28, 0.85)',
    borderRadius: 100,
  },

  tabButton: {
    flex: 1,
    height: 44,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabPill: {
    backgroundColor: 'rgba(255, 94, 0, 0.15)', // orange translucent highlight pill
  },

  activeAvatarWrapper: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 100,
    padding: 1,
  },

  dot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3E3E',
    borderWidth: 1.5,
    borderColor: '#0A0A0C',
  },
})