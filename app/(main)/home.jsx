import { Alert, Platform, Pressable, StyleSheet, Text, View, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Button from '../../components/Button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Icon from '@/assets/icons'
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import { FlatList } from 'react-native'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { getUserData } from '../../services/userService'


var limit = 0;
const Home = () => {

    const {user, setAuth} = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const handlePostEvent = async(payload) => {
      if(payload.eventType == "INSERT" && payload?.new?.id){
        let newPost = {...payload.new}
        let res = await getUserData(newPost.userId);
        newPost.user = res.success? res.data: {};
        setPosts(prevPosts=> [newPost,...prevPosts]);
      }
    }

    const handleCommentEvent = async(payload) => {
      console.log('HOME - Comment event received:', payload);
      console.log('HOME - Event type:', payload.eventType);
      
      if(payload.eventType == "INSERT" && payload?.new?.id){
        const newComment = payload.new;
        console.log('HOME - INSERT - Updating post with ID:', newComment.postId);
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if(post.id === newComment.postId) {
              const newCount = (post?.comments?.[0]?.count || 0) + 1;
              console.log('HOME - Old count:', post?.comments?.[0]?.count, 'New count:', newCount);
              return {
                ...post,
                comments: [{count: newCount}]
              };
            }
            return post;
          })
        );
      }
      
      if(payload.eventType == "DELETE" && payload?.old?.id){
        const deletedComment = payload.old;
        console.log('HOME - DELETE - Updating post with ID:', deletedComment.postId);
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if(post.id === deletedComment.postId) {
              const newCount = Math.max(0, (post?.comments?.[0]?.count || 0) - 1);
              console.log('HOME - Old count:', post?.comments?.[0]?.count, 'New count:', newCount);
              return {
                ...post,
                comments: [{count: newCount}]
              };
            }
            return post;
          })
        );
      }
    }

    useEffect(() => {
      let postChannel = supabase
        .channel('posts')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'posts'}, handlePostEvent)
        .subscribe();

      let commentChannel = supabase
        .channel('comments')
        .on('postgres_changes', {event: '*', schema: 'public', table: 'comments'}, handleCommentEvent)
        .subscribe();

      // Initial load
      getPosts();

      return() => {
        supabase.removeChannel(postChannel);
        supabase.removeChannel(commentChannel);
      }
    }, [])

    const getPosts = async() => {
      if(!hasMore) return null;
      limit = limit + 4;

      let res = await fetchPosts(limit);
      if(res.success){
        if(posts.length==res.data.length){
          setHasMore(false);
        }
        setPosts(res.data)
      }
    }

    const onRefresh = async() => {
      setRefreshing(true);
      limit = 0;
      setHasMore(true);
      await getPosts();
      setRefreshing(false);
    }

  return (
    <ScreenWrapper bg={'white'}>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>PicsGram</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push('notifications')}>
              <Icon name='heart' size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name='plus' size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar
                uri={user?.image}
                size={hp(3.2)}
                rounded={theme.radius.sm}
                style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
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
            <View style={{marginVertical: posts.length==0?300: 30}}>
              <Loading/>
            </View>
          ): (
            <View style={{marginVertical:30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? hp(2) : 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4),
  },

  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },

  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },

  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },

  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },

  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },

  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },

  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  }
})