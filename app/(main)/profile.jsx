import { Alert, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import Header from '../../components/Header'
import { hp, wp } from '../../helpers/common'
import Icon from '@/assets/icons'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import { FlatList } from 'react-native'
import Loading from '../../components/Loading'
import PostCard from '../../components/PostCard'

const Profile = () => {
    const {user, setAuth} = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [limit, setLimit] = useState(0);

    // Load posts when user is available
    useEffect(() => {
      if(user?.id) {
        getPosts();
      }
    }, [user?.id]);

    const onLogout = async() => {
            // setAuth(null);
            const {error} = await supabase.auth.signOut();
    
            if(error) {
                Alert.alert('Error', error.message);
         }
    };

    const getPosts = async() => {
      if(!hasMore || !user?.id) return null;
      
      const newLimit = limit + 4;
      setLimit(newLimit);

      let res = await fetchPosts(newLimit, user.id);
      if(res.success){
        if(posts.length==res.data.length){
          setHasMore(false);
        }
        setPosts(res.data)
      }
    }

    const onRefresh = async() => {
      if(!user?.id) return;
      
      setRefreshing(true);
      
      // Store current number of posts to reload the same amount
      const currentPostCount = posts.length;
      
      // Reset and fetch fresh data
      const refreshLimit = currentPostCount > 0 ? currentPostCount : 4;
      setLimit(refreshLimit);
      setHasMore(true);
      
      console.log('PROFILE - Refreshing with limit:', refreshLimit);
      
      let res = await fetchPosts(refreshLimit, user.id);
      if(res.success){
        console.log('PROFILE - Fetched posts:', res.data.length);
        setPosts(res.data);
        
        // Check if there are more posts available
        if(res.data.length < refreshLimit){
          setHasMore(false);
        }
      }
      
      setRefreshing(false);
    }

    
    const handleLogout = async() => {
        //show confirm modal
        Alert.alert('Are you sure?', 'You want to logout', [
          {
              text: 'Cancel',
              onPress: () => console.log("cancel"),
              style: 'cancel'
          },
          {
              text: 'Logout',
              onPress: () => onLogout(),
              style: 'destructive'
          }
        ])
    };

    // Show loading while user data is being fetched
    if(!user) {
      return (
        <ScreenWrapper bg={'white'}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading />
          </View>
        </ScreenWrapper>
      );
    }

  return (
    <ScreenWrapper bg={'white'}>
        <FlatList
          data={posts}
          ListHeaderComponent={<UserHeader user={user} router={router} handleLogout={handleLogout} />}
          ListHeaderComponentStyle = {{marginBottom: 30}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <PostCard
              item={item}
              currentUser={user}
              router={router}
          />       
          }

          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }

          onEndReached={() => {
            getPosts();
            console.log("got to the end")
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={hasMore?(
            <View style={{marginVertical: posts.length==0?100: 30}}>
              <Loading/>
            </View>
          ): (
            <View style={{marginVertical:30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
      
    </ScreenWrapper>
  )
}

const UserHeader = ({user, router, handleLogout}) => {
    return(
        <View style={{flex: 1, backgroundColor: "white", paddingHorizontal: wp(4)}}>
            <View>
                <Header title='Profile' mb={30}/>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={20} color={theme.colors.heart}/>
                </TouchableOpacity>              
            </View>

            <View style={styles.container}>
                <View style={{gap: 15}}>
                    <View style={styles.avatarContainer}>

                        <Avatar
                            uri={user?.image}
                            size={hp(12)}
                            rounded={theme.radius.xxl*1.4}
                        />
                        <Pressable style={styles.editIcon} onPress={() => router.push ('editProfile')}>
                            <Icon name="edit" size={18} color={theme.colors.text}/>
                        </Pressable>

                    </View>

                    {/* username and address */}
                    <View style ={{alignItems: 'center', gap: 4}}>
                        <Text style={styles.userName}>{user && user.name}</Text>
                        <Text style={styles.infoText}>{user && user.address}</Text>
                    </View>

                    {/* email phone and bio */}
                    <View style={{gap:10}}>
                        <View style={styles.info}>
                            <Icon name="mail" size={20} color={theme.colors.textLight}/>
                            <Text style={styles.infoText}>{user && user.email}</Text>
                        </View>
                        {
                            user && user.phoneNumber && (
                                <View style={styles.info}>
                                    <Icon name="call" size={20} color={theme.colors.textLight}/>
                                    <Text style={styles.infoText}>{user && user.phoneNumber}</Text>
                                </View>
                            )
                        }

                        {
                            user && user.bio && (
                                
                                <View style={styles.info}>
                                    <Text style={styles.infoText}>{user && user.bio}</Text>
                                </View>
                            )
                        }
                        
                    </View>

                </View>
            </View>
        </View>
    )
}

export default Profile

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    headerContainer: {
  marginHorizontal: wp(4),
  marginBottom: 20,
},

headerShape: {
  width: wp(100),
  height: hp(20),
},

avatarContainer: {
  height: hp(12),
  width: hp(12),
  alignSelf: 'center',
},

editIcon: {
  position: 'absolute',
  bottom: 0,
  right: -12,
  padding: 7,
  borderRadius: 50,
  backgroundColor: 'white',
  shadowColor: theme.colors.textLight,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 5,
  elevation: 7,
},

userName: {
  fontSize: hp(3),
  fontWeight: '500',
  color: theme.colors.textDark,
},

info: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

infoText: {
  fontSize: hp(1.6),
  fontWeight: '500',
  color: theme.colors.textLight,
},

logoutButton: {
  position: 'absolute',
  right: 0,
  top: 30,
  padding: 5,
  borderRadius: theme.radius.sm,
  backgroundColor: '#fee2e2',
},

listStyle: {
  paddingHorizontal: wp(4),
  paddingBottom: 30,
},

noPosts: {
  fontSize: hp(2),
  textAlign: 'center',
  color: theme.colors.text,
},

})