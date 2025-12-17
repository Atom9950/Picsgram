import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import BackButton from '../components/BackButton'
import { Platform } from 'react-native'
import { hp } from '../helpers/common'
import { theme } from '../constants/theme'

const Header = ({title, showBackButton= true, mb=10}) => {
    const router = useRouter();
  return (
    <View style ={[styles.container, {marginBottom: mb}]}>
      {
        showBackButton && (
            <View style={styles.backButton}>
                <BackButton router ={router}/>
            </View>
        )
      }
      <Text style={styles.title}>{title || ""}</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        alignItems:"center",
        justifyContent:"center",
        marginTop: Platform.OS === "android" ? 25 : 5,
        gap: 10
    },
    title:{
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color:theme.colors.textDark,
    },
    backButton:{
        position:"absolute",
        left: 0
    }
})