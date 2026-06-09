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

const MyStack = withScreenTransitions(createNativeStackNavigator());
const Stack = withLayoutContext(MyStack.Navigator);

const _layout = () => {
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