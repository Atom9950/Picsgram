import Icon from '@/assets/icons'
import * as FileSystem from 'expo-file-system/legacy'
import { Image } from 'expo-image'
import * as Sharing from 'expo-sharing'
import { useVideoPlayer, VideoView } from 'expo-video'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { theme } from '../constants/theme'
import { hp, stripHtmlTags, wp } from '../helpers/common'
import { CustomAlert as Alert } from '../services/alertService'
import { getSupabaseFileUrl } from '../services/imageService'
import { createNotification } from '../services/notificationService'
import { createPostLike, removePostLike } from '../services/postService'
import { getUserData } from '../services/userService'
import Avatar from './Avatar'
import ImageModal from './ImageModal'
import Loading from './Loading'
import ProfileAccessModal from './ProfileAccessModal'

const textStyles = {
  color: theme.colors.dark,
  fontSize: hp(1.75)
}

const tagsStyles = {
  body: {
    color: theme.colors.text,
    fontSize: hp(1.65),
    lineHeight: hp(2.2),
  },
  div: {
    color: theme.colors.text,
    fontSize: hp(1.65),
  },
  p: {
    color: theme.colors.text,
    fontSize: hp(1.65),
    marginBottom: 4,
  },
  ol: {
    color: theme.colors.text,
    fontSize: hp(1.65),
  },
  ul: {
    color: theme.colors.text,
    fontSize: hp(1.65),
  },
  h1: {
    color: theme.colors.textDark,
    fontSize: hp(2.3),
    fontWeight: 'bold',
    marginBottom: 8,
    width: '100%',
  },
  h4: {
    color: theme.colors.textDark,
    fontSize: hp(1.8),
    fontWeight: '600',
    marginBottom: 6,
    width: '100%',
  },
  strong: {
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  b: {
    fontWeight: 'bold',
    color: theme.colors.textDark,
  },
  em: {
    fontStyle: 'italic',
  },
  i: {
    fontStyle: 'italic',
  },
  span: {
    color: theme.colors.text,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
    fontStyle: 'italic',
    marginVertical: 8,
    color: theme.colors.textLight,
  },
  code: {
    backgroundColor: theme.colors.gray,
    color: theme.colors.glow,
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
};

const renderersProps = {
  img: {
    enableExperimentalPercentWidth: true,
  },
};

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => { },
  onEdit = () => { },
}) => {

  // DEBUG LOGGING
  // console.log("=== PostCard Debug ===");
  // console.log("Item received:", item);
  // console.log("Item ID:", item?.id);
  // console.log("Item type:", typeof item?.id);
  // console.log("Router exists:", !!router);
  // console.log("showMoreIcon:", showMoreIcon);
  // console.log("=====================");

  const shadowStyles = {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1
  }

  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [latestLikeName, setLatestLikeName] = useState(null);

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, [item?.postLikes])

  useEffect(() => {
    const fetchLatestLikeName = async () => {
      if (likes.length === 0) {
        setLatestLikeName(null);
        return;
      }

      // Get the latest like
      const latestLike = likes[likes.length - 1];
      if (!latestLike || !latestLike.userId) {
        setLatestLikeName(null);
        return;
      }

      // Check if the latest like is by the current logged-in user
      if (latestLike.userId === currentUser?.id) {
        setLatestLikeName(currentUser?.name || 'You');
        return;
      }

      // Check if user object with name is already present on the like (e.g. from local like state)
      if (latestLike.user && latestLike.user.name) {
        setLatestLikeName(latestLike.user.name);
        return;
      }

      // Fetch user data for this userId
      try {
        const res = await getUserData(latestLike.userId);
        if (res.success && res.data?.name) {
          setLatestLikeName(res.data.name);
        } else {
          setLatestLikeName(null);
        }
      } catch (error) {
        console.log('Error fetching latest like username:', error);
        setLatestLikeName(null);
      }
    };

    fetchLatestLikeName();
  }, [likes, currentUser?.id, currentUser?.name]);

  // Create video player for video posts
  const isVideo = item?.file && item.file.includes('postVideos');
  const videoSource = isVideo ? getSupabaseFileUrl(item?.file)?.uri : null;
  const player = useVideoPlayer(videoSource, player => {
    if (player) {
      player.loop = true;
    }
  });

  const openPostDetails = () => {
    if (!showMoreIcon) return null;

    console.log("=== Navigation Debug ===");
    console.log("Attempting to navigate with ID:", item?.id);
    console.log("ID type:", typeof item?.id);
    console.log("Router:", router);
    console.log("========================");

    // Make sure item.id exists
    if (!item?.id) {
      console.error("ERROR: No item.id found!");
      Alert.alert("Error", "Post ID not found");
      return;
    }

    // Navigation
    try {
      router.push({
        pathname: '/postDetails',
        params: { postId: String(item.id) }
      });
      console.log("Navigation called successfully");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Failed to navigate: " + error.message);
    }
  }

  // Like button functionality
  const onLike = async () => {
    if (liked) {
      // remove like
      let updatedLikes = likes.filter(like => like.userId != currentUser?.id);
      setLikes([...updatedLikes])
      let res = await removePostLike(item?.id, currentUser?.id);
      console.log('removed like: ', res);

      if (!res.success) {
        Alert.alert("Error", "Something went wrong!");
      }

    } else {
      // create like
      let localLike = {
        userId: currentUser?.id,
        postId: item?.id,
        user: {
          id: currentUser?.id,
          name: currentUser?.name
        }
      }
      setLikes([...likes, localLike])

      let dbLike = {
        userId: currentUser?.id,
        postId: item?.id
      }
      let res = await createPostLike(dbLike);
      console.log('added like: ', res);

      if (res.success) {
        // Send notification to post owner
        if (currentUser?.id != item?.userId) {
          let notify = {
            senderId: currentUser?.id,
            receiverId: item?.userId,
            title: 'liked your post',
            data: JSON.stringify({ postId: item?.id }),
            is_read: false,
          }
          createNotification(notify);
        }
      } else {
        Alert.alert("Error", "Something went wrong!");
      }
    }
  }

  const onShare = async () => {
    if (item?.file) {
      // Get the file URL
      const fileUrl = getSupabaseFileUrl(item?.file);

      // Check if URL exists before attempting download
      if (fileUrl?.uri) {
        try {
          // Create proper file path with extension
          const fileName = item.file.split('/').pop();
          const fileExtension = fileName.includes('.') ? '' : (item.file.includes('postImages') ? '.png' : '.mp4');
          const localPath = `${FileSystem.documentDirectory}${fileName}${fileExtension}`;

          console.log('Downloading from:', fileUrl.uri);
          console.log('Downloading to:', localPath);

          // Download the file
          setLoading(true);
          const downloadResult = await FileSystem.downloadAsync(
            fileUrl.uri,
            localPath
          );
          setLoading(false);

          console.log('Download result:', downloadResult);

          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();

          if (isAvailable) {
            // Share the downloaded file
            await Sharing.shareAsync(downloadResult.uri, {
              dialogTitle: 'Share Post',
              mimeType: item.file.includes('postImages') ? 'image/png' : 'video/mp4',
            });
          } else {
            Alert.alert('Error', 'Sharing is not available on this device');
          }

        } catch (error) {
          console.log('Error sharing file:', error);
          Alert.alert('Error', 'Failed to share the file');
        }
      } else {
        console.log('File URL is null or undefined');
        Alert.alert('Error', 'File not found');
      }
    } else {
      // If there's no file, just share the text
      let content = { message: stripHtmlTags(item?.body) };
      Share.share(content);
    }
  }

  const handleDeletePost = () => {
    Alert.alert(
      "Are you sure?",
      `Do you want to delete this post?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => onDelete(item),
          style: 'destructive'
        }
      ]
    )
  }

  const createdAt = moment(item?.created_at).format('MMM D')
  const liked = likes.filter(like => like.userId == currentUser?.id)[0] ? true : false;

  // Handle clicking on user profile (avatar or name)
  const handleProfilePress = () => {
    // Don't show request if it's the current user's own post
    if (currentUser?.id === item?.userId) {
      // Navigate to own profile or do nothing
      return;
    }

    // Show profile access request modal
    ProfileAccessModal(
      item?.user?.name,
      currentUser?.id,
      item?.userId,
      () => {
        console.log('Profile access request sent successfully');
      },
      (error) => {
        console.log('Profile access request error:', error);
      }
    );
  };

  const renderLikesText = () => {
    if (likes.length === 0) return null;

    if (latestLikeName) {
      const othersCount = likes.length - 1;
      if (othersCount === 0) {
        return (
          <Text style={styles.likesText}>
            Liked by <Text style={styles.likesTextBold}>{latestLikeName}</Text>
          </Text>
        );
      } else {
        return (
          <Text style={styles.likesText}>
            Liked by <Text style={styles.likesTextBold}>{latestLikeName}</Text> and{' '}
            <Text style={styles.likesTextBold}>
              {othersCount} {othersCount === 1 ? 'other' : 'others'}
            </Text>
          </Text>
        );
      }
    }

    // Fallback
    return (
      <Text style={styles.likesText}>
        {likes.length} {likes.length === 1 ? 'like' : 'likes'}
      </Text>
    );
  };

  return (
    <>
      <ImageModal
        visible={modalVisible}
        imageUri={getSupabaseFileUrl(item?.file)}
        onClose={() => setModalVisible(false)}
      />
      <View style={[styles.container, hasShadow && shadowStyles]}>
        <View style={styles.header}>
          {/* user info and post time */}
          <TouchableOpacity
            style={styles.userInfo}
            onPress={handleProfilePress}
            disabled={currentUser?.id === item?.userId}
            activeOpacity={currentUser?.id === item?.userId ? 1 : 0.7}
          >
            <Avatar
              size={hp(4.6)}
              uri={item?.user?.image}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{item?.user?.name}</Text>
              <Text style={styles.postTime}>{createdAt}</Text>
            </View>
          </TouchableOpacity>

          {
            showMoreIcon && (
              <TouchableOpacity onPress={openPostDetails} style={styles.moreIconBtn}>
                <Icon name='threeDotsHorizontal' size={hp(2.4)} color='white' />
              </TouchableOpacity>
            )
          }

          {
            showDelete && currentUser.id == item?.userId && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionIconBtn}>
                  <Icon name='edit' size={hp(2.1)} color='white' />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeletePost} style={[styles.actionIconBtn, styles.deleteIconBtn]}>
                  <Icon name='delete' size={hp(2.1)} color={theme.colors.heart} />
                </TouchableOpacity>
              </View>
            )
          }
        </View>

        {/* Hero Media (if file exists) */}
        {
          item?.file && (
            <View style={styles.mediaContainer}>
              {/* post image */}
              {
                item?.file?.includes('postImages') && (
                  <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.9}>
                    <Image
                      source={getSupabaseFileUrl(item?.file)}
                      transition={100}
                      style={styles.postMedia}
                      contentFit='cover'
                    />
                  </TouchableOpacity>
                )
              }

              {/* post video */}
              {
                isVideo && (
                  <VideoView
                    style={[styles.postMedia, { height: hp(35) }]}
                    player={player}
                    nativeControls
                    contentFit="cover"
                  />
                )
              }
            </View>
          )
        }

        {/* Text Body (if NO file exists, text is the hero and goes here) */}
        {
          !item?.file && item?.body && (
            <View style={styles.textHeroContainer}>
              <RenderHtml
                contentWidth={wp(100)}
                source={{ html: item?.body }}
                tagsStyles={tagsStyles}
                enableCSSInlineProcessing={true}
                ignoredStyles={["fontSize"]}
                renderersProps={renderersProps}
                defaultTextProps={{
                  allowFontScaling: false,
                }}
              />
            </View>
          )
        }

        {/* Footer Pill Actions */}
        <View style={styles.footer}>
          <View style={styles.pillActions}>
            {/* Like Pill */}
            <TouchableOpacity style={[styles.pillButton, liked && styles.pillButtonLiked]} onPress={onLike}>
              <Icon
                name='heart'
                size={22}
                fill={liked ? theme.colors.heart : 'transparent'}
                color={liked ? theme.colors.heart : 'white'}
              />
              <Text style={[styles.pillCount, liked && styles.pillTextLiked]}>
                {likes?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Comment Pill */}
            <TouchableOpacity style={styles.pillButton} onPress={openPostDetails}>
              <Icon name='comment' size={22} color='white' />
              <Text style={styles.pillCount}>
                {item?.comments?.[0]?.count || 0}
              </Text>
            </TouchableOpacity>

            {/* Share Pill */}
            {
              loading ? (
                <View style={styles.pillButton}>
                  <Loading size='small' />
                </View>
              ) : (
                <TouchableOpacity style={styles.pillButton} onPress={onShare}>
                  <Icon name='share' size={22} color='white' />
                </TouchableOpacity>
              )
            }
          </View>
        </View>

        {/* Liked by message */}
        {
          likes.length > 0 && (
            <View style={styles.likesTextContainer}>
              {renderLikesText()}
            </View>
          )
        }

        {/* Caption Section (if file exists, text goes here under the actions) */}
        {
          item?.file && item?.body && (
            <View style={styles.captionSection}>
              <RenderHtml
                contentWidth={wp(100)}
                source={{ html: item?.body }}
                tagsStyles={tagsStyles}
                enableCSSInlineProcessing={true}
                ignoredStyles={["fontSize"]}
                renderersProps={renderersProps}
                defaultTextProps={{
                  allowFontScaling: false,
                }}
              />
            </View>
          )
        }
      </View>
    </>
  )
}

export default PostCard

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    borderRadius: theme.radius.xl,
    padding: 14,
    paddingVertical: 16,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  username: {
    fontSize: hp(1.8),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.semibold,
    letterSpacing: 0.1,
  },

  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },

  moreIconBtn: {
    padding: 6,
  },

  actionIconBtn: {
    padding: 6,
    marginLeft: 6,
  },

  deleteIconBtn: {
  },

  mediaContainer: {
    marginVertical: 10,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },

  postMedia: {
    height: hp(38),
    width: '100%',
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },

  textHeroContainer: {
    marginVertical: 8,
    paddingHorizontal: 4,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },

  pillActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  pillButtonLiked: {
  },

  pillCount: {
    color: 'white',
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
  },

  pillTextLiked: {
    color: theme.colors.heart,
  },

  captionSection: {
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 4,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  likesTextContainer: {
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  likesText: {
    fontSize: hp(1.5),
    color: theme.colors.text
  },

  likesTextBold: {
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
})