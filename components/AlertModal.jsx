import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { registerAlertListener } from '../services/alertService';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const { width } = Dimensions.get('window');

const AlertModal = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    registerAlertListener((alertTitle, alertMessage, alertButtons) => {
      setTitle(alertTitle || '');
      setMessage(alertMessage || '');
      const formattedButtons = alertButtons && alertButtons.length > 0 
        ? alertButtons 
        : [{ text: 'OK', onPress: () => {} }];
      setButtons(formattedButtons);
      setVisible(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        })
      ]).start();
    });
  }, []);

  const handleButtonPress = (onPress) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setVisible(false);
      if (onPress) onPress();
    });
  };

  if (!visible) return null;

  const isDestructive = title.toLowerCase().includes('delete') || 
                        title.toLowerCase().includes('logout') || 
                        title.toLowerCase().includes('remove') ||
                        title.toLowerCase().includes('sure');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        
        <Animated.View style={[
          styles.container, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}>
          {/* Content Area - Left Aligned */}
          <View style={styles.contentArea}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          {/* Action Row - Right Aligned */}
          <View style={styles.actionRow}>
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel' || btn.text.toLowerCase() === 'cancel';
              const isDestruct = btn.style === 'destructive' || btn.text.toLowerCase() === 'ok' && isDestructive;
              
              let btnStyle = styles.defaultButton;
              let txtStyle = styles.defaultButtonText;

              if (isCancel) {
                btnStyle = styles.cancelButton;
                txtStyle = styles.cancelButtonText;
              } else if (isDestruct) {
                btnStyle = styles.destructiveButton;
                txtStyle = styles.destructiveButtonText;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={btnStyle}
                  onPress={() => handleButtonPress(btn.onPress)}
                  activeOpacity={0.75}
                >
                  <Text style={txtStyle}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  container: {
    width: width * 0.84,
    backgroundColor: '#16181A', // Carbon Dark Gray
    borderRadius: theme.radius.md, // Clean, moderate 12-14px radius
    padding: 20,
    borderWidth: 1,
    borderColor: '#24282B', // extremely subtle border to define edge
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  contentArea: {
    alignItems: 'flex-start', // Clean left-aligned copy
    marginBottom: 20,
  },
  title: {
    fontSize: hp(2.0),
    fontWeight: theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  message: {
    fontSize: hp(1.55),
    color: '#9CA3AF', // slate/zinc-400
    lineHeight: hp(2.1),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Clean right-aligned actions
    gap: 8,
  },
  // Default/Confirm Button (e.g. OK)
  defaultButton: {
    backgroundColor: theme.colors.primary, // Brand Orange
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultButtonText: {
    color: '#FFFFFF',
    fontSize: hp(1.65),
    fontWeight: theme.fonts.semibold,
  },
  // Destructive Button (e.g. OK on Delete)
  destructiveButton: {
    backgroundColor: theme.colors.heart, // Solid active red
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
    fontSize: hp(1.65),
    fontWeight: theme.fonts.semibold,
  },
  // Cancel Button
  cancelButton: {
    backgroundColor: '#202326', // subtle gray tint matching carbon
    borderWidth: 1,
    borderColor: '#2D3236',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D1D5DB', // zinc-300
    fontSize: hp(1.65),
    fontWeight: theme.fonts.medium,
  },
});
