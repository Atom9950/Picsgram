import { Pressable, StyleSheet } from 'react-native'
import React from 'react'
import Icon from '@/assets/icons'
import { theme } from '@/constants/theme'

const BackButton = ({ size = 22, router }) => {
  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name="arrowLeft" size={18} color={theme.colors.text} />
    </Pressable>
  )
}

export default BackButton

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.gray,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
})