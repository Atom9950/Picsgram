import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useRouter, withLayoutContext } from 'expo-router'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Transition, { withScreenTransitions } from 'react-native-screen-transitions'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'
import AlertModal from '../components/AlertModal'
import { useFonts } from 'expo-font'
import React from 'react'
import { Text, TextInput } from 'react-native'

const customFontMap = {
  'normal': 'PlusJakartaSans-Regular',
  '400': 'PlusJakartaSans-Regular',
  '500': 'PlusJakartaSans-Medium',
  'medium': 'PlusJakartaSans-Medium',
  '600': 'PlusJakartaSans-SemiBold',
  'semibold': 'PlusJakartaSans-SemiBold',
  '700': 'PlusJakartaSans-Bold',
  'bold': 'PlusJakartaSans-Bold',
  '800': 'PlusJakartaSans-ExtraBold',
  'extrabold': 'PlusJakartaSans-ExtraBold',
};

const resolveFont = (style) => {
  if (!style) return { fontFamily: 'PlusJakartaSans-Regular' };
  const flat = StyleSheet.flatten(style) || {};
  const weight = flat.fontWeight ? String(flat.fontWeight).toLowerCase() : 'normal';
  const fontFamily = customFontMap[weight] || 'PlusJakartaSans-Regular';
  return { fontFamily, fontWeight: undefined };
};

const initTypography = () => {
  if (Text.render) {
    const oldRender = Text.render;
    Text.render = function (props, ref) {
      const origin = oldRender.call(this, props, ref);
      const resolved = resolveFont(props.style);
      return React.cloneElement(origin, {
        style: [props.style, resolved]
      });
    };
  } else if (Text.prototype && Text.prototype.render) {
    const oldRender = Text.prototype.render;
    Text.prototype.render = function () {
      const origin = oldRender.call(this);
      const resolved = resolveFont(this.props.style);
      return React.cloneElement(origin, {
        style: [this.props.style, resolved]
      });
    };
  }

  if (TextInput.render) {
    const oldRender = TextInput.render;
    TextInput.render = function (props, ref) {
      const origin = oldRender.call(this, props, ref);
      const resolved = resolveFont(props.style);
      return React.cloneElement(origin, {
        style: [props.style, resolved]
      });
    };
  } else if (TextInput.prototype && TextInput.prototype.render) {
    const oldRender = TextInput.prototype.render;
    TextInput.prototype.render = function () {
      const origin = oldRender.call(this);
      const resolved = resolveFont(this.props.style);
      return React.cloneElement(origin, {
        style: [this.props.style, resolved]
      });
    };
  }
};

try {
  initTypography();
} catch (e) {
  console.warn('Typography override failed:', e);
}

const MyStack = withScreenTransitions(createNativeStackNavigator());
const Stack = withLayoutContext(MyStack.Navigator);

const _layout = () => {
 const [fontsLoaded] = useFonts({
  'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
  'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
  'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  'GrandHotel': require('../assets/fonts/GrandHotel-Regular.ttf'),
});

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <MainLayout />
        <AlertModal />
      </AuthProvider>
    </GestureHandlerRootView>
  )
}

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('session user: ', session?.user.id);

      if (session) {
        //set auth
        setAuth(session?.user);
        updatedUserData(session?.user, session?.user.email)
        router.replace('/(main)/home'); // Changed from '/home'
      } else {
        //remove auth
        setAuth(null)
        router.replace('/welcome')
      }
    })
  }, [])

  const updatedUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    if (res.success) setUserData({ ...res.data, email });
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="welcome"
        options={{
          ...Transition.Presets.ZoomIn(),
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          ...Transition.Presets.SlideFromBottom({ gestureEnabled: false }),
        }}
      />
      <Stack.Screen
        name="signUp"
        options={{
          ...Transition.Presets.SlideFromBottom({ gestureEnabled: false }),
        }}
      />
      <Stack.Screen
        name="(main)/home"
        options={{
          ...Transition.Presets.ZoomIn(),
        }}
      />
      <Stack.Screen
        name="(main)/newPost"
        options={{
          ...Transition.Presets.SlideFromBottom({ gestureEnabled: false }),
        }}
      />
      <Stack.Screen
        name="(main)/postDetails"
        options={{
          ...Transition.Presets.ElasticCard({ gestureDirection: "vertical" }),
        }}
      />
      <Stack.Screen
        name="(main)/profile"
        options={{
          ...Transition.Presets.SlideFromBottom({ gestureEnabled: false }),
        }}
      />
      <Stack.Screen
        name="(main)/editProfile"
        options={{
          ...Transition.Presets.DraggableCard({ gestureEnabled: false }),
        }}
      />
      <Stack.Screen
        name="(main)/notifications"
        options={{
          ...Transition.Presets.SlideFromBottom({ gestureEnabled: false }),
        }}
      />
      <Stack.Screen
        name="(main)/viewerProfile"
        options={{
          ...Transition.Presets.ElasticCard({ gestureDirection: "vertical" }),
        }}
      />
    </Stack>
  )
}

export default _layout

const styles = StyleSheet.create({})