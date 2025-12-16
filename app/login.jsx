import { Alert, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import {hp, wp} from '../helpers/common'
import {theme} from '../constants/theme'
import Input from '../components/Input'
import Icon from '@/assets/icons'
import Button from '../components/Button';
import { supabase } from '../lib/supabase'

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSubmit = async() => {
    if(!emailRef.current || !passwordRef.current){
      Alert.alert("Error", "Email and Password are required");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);

    const {error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    console.log('error: ', error);

    if(error){
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScreenWrapper bg={"white"}>
      <StatusBar style= "dark"/>
      <View style={styles.container}>
        <BackButton router ={router}/>

        {/* welcome text */}
        <View>
          <Text style={styles.welcomeText}>Hey there 👋</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{fontSize:hp(1.5), color: theme.colors.text}}>Please Login to continue</Text>
          <Input
            icon={<Icon name='mail' size={26} strokeWidth={1.6}/>}
            placeholder="Enter your email"
            onChangeText={value => emailRef.current = value}
          />
          <Input
            icon={<Icon name='lock' size={26} strokeWidth={1.6}/>}
            placeholder="Enter your password"
            secureTextEntry={!passwordVisible}
            onChangeText={value => passwordRef.current = value}
            showPasswordToggle={true}
            passwordVisible={passwordVisible}
            onTogglePassword={() => setPasswordVisible(!passwordVisible)}
            eyeIcon={<Icon name='eye' size={26} strokeWidth={1.6}/>}
            eyeOffIcon={<Icon name='eyeOff' size={26} strokeWidth={1.6}/>}
          />
          <Text style={styles.forgotPassword}> Forgotten password?</Text>
          {/* button */}
          <Button title={"Login"} loading={loading} onPress={onSubmit}/>
        </View>
        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push("/signUp")}>
            <Text style={[styles.footerText,{color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
  flex: 1,
  gap: 45,
  paddingHorizontal: wp(5),
  paddingTop: hp(3),
},

welcomeText: {
  fontSize: hp(4),
  fontWeight: theme.fonts.bold,
  color: theme.colors.text,
},

form: {
  gap: 25,
},

forgotPassword: {
  textAlign: 'right',
  fontWeight: theme.fonts.medium,
  color: theme.colors.text,
},

footer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 5,
},

footerText: {
  textAlign: 'center',
  color: theme.colors.text,
  fontSize: hp(1.6),
}

})