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

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async() => {
    if(!nameRef.current || !emailRef.current || !passwordRef.current){
      Alert.alert("Error", "All the fields are required");
      return;
    }
    //good to go
  };
  return (
    <ScreenWrapper bg={"white"}>
      <StatusBar style= "dark"/>
      <View style={styles.container}>
        <BackButton router ={router}/>

        {/* welcome text */}
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.welcomeText}>PicsGram! 🤳</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{fontSize:hp(1.5), color: theme.colors.text}}>Please SignUp to continue</Text>
          <Input
            icon={<Icon name='user' size={26} strokeWidth={1.6}/>}
            placeholder="Enter your name"
            onChangeText={value => nameRef.current = value}
          />
          <Input
            icon={<Icon name='mail' size={26} strokeWidth={1.6}/>}
            placeholder="Enter your email"
            onChangeText={value => emailRef.current = value}
          />
          <Input
            icon={<Icon name='lock' size={26} strokeWidth={1.6}/>}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={value => passwordRef.current = value}
          />
          {/* button */}
          <Button title={"SignUp"} loading={loading} onPress={onSubmit}/>
        </View>
        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={[styles.footerText,{color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default SignUp

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