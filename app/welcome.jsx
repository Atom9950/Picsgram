import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import {theme} from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const router = useRouter()
  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style='light'/>
      <View style={styles.container}>

        {/* welcome image */}
        <Image style={styles.welcomeImage} resizeMode={'contain'} source={require('../assets/images/welcome.png')} />

        {/* welcome text */}
        <View style={{gap: 20,marginTop: -hp(10)}}>

        <Text style={styles.title}>PicsGram</Text>
        <Text style={styles.punchline}>Capture. Share. Belong</Text>
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Button
          title='Get Started'
          buttonStyle={{marginHorizontal: wp(3)}}
          onPress={() => router.push('signUp')}
          />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Pressable onPress={() => router.push('login')}>
              <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Login</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background,
    paddingHorizontal: wp(4),
  },
  welcomeImage: {
    width: wp(100),
    height: hp(30),
    alignSelf: 'center',
  },
  title:{
    color: theme.colors.text,
    fontFamily: 'GrandHotel',
    fontSize: hp(5),
    textAlign:'center',
  },
  punchline:{
    color: theme.colors.text,
    fontSize: hp(1.7),
    textAlign:'center',
    paddingHorizontal:wp(10)
  },
  footer:{
    gap: 30,
    width: '100%'
  },
  bottomTextContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap:5
  },
  loginText:{
    textAlign:'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  }
})