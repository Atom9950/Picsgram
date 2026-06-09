import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'
import Loading from './Loading'

const Button = ({
    buttonStyle,
    textStyle,
    title = "",
    onPress = () => {},
    loading = false,
    hasShadow = true,
    variant = 'primary', // 'primary' | 'secondary' | 'ghost'
}) => {

    if (loading) {
        return (
            <View style={[styles.button, styles.loadingButton, buttonStyle]}>
                <Loading color="rgba(255,255,255,0.7)" size="small" />
            </View>
        )
    }

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                variant === 'secondary' && styles.buttonSecondary,
                variant === 'ghost' && styles.buttonGhost,
                hasShadow && styles.shadow,
                pressed && styles.pressed,
                buttonStyle,
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: false }}
        >
            {({ pressed }) => (
                <Text style={[
                    styles.text,
                    variant === 'secondary' && styles.textSecondary,
                    variant === 'ghost' && styles.textGhost,
                    pressed && { opacity: 0.85 },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </Pressable>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        height: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
    },

    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },

    buttonGhost: {
        backgroundColor: theme.colors.gray,
    },

    loadingButton: {
        backgroundColor: theme.colors.primary,
        opacity: 0.6,
    },

    shadow: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },

    pressed: {
        opacity: 0.88,
        transform: [{ scale: 0.985 }],
    },

    text: {
        fontSize: hp(1.85),
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    textSecondary: {
        color: theme.colors.primary,
    },

    textGhost: {
        color: theme.colors.text,
    },
})