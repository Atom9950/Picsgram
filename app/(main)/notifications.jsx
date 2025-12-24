import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchNotifications } from '../../services/notificationService';
import { getSentAccessRequests } from '../../services/accessRequestService';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../../components/ScreenWrapper'
import { useRouter } from 'expo-router';
import NotificationItem from '../../components/NotificationItem';
import Header from '../../components/Header'
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      // Fetch received notifications
      let notifRes = await fetchNotifications(user.id);
      console.log('Notifications fetched:', notifRes);
      
      // Fetch sent access requests
      let sentRes = await getSentAccessRequests(user.id);
      console.log('Sent requests fetched:', sentRes);
      
      let allItems = [];
      
      if (notifRes.success) {
        allItems = [...notifRes.data];
      }
      
      // Transform sent requests into notification-like objects
      if (sentRes.success && sentRes.data.length > 0) {
        const sentAsNotifications = sentRes.data.map(req => ({
          id: `sent-${req.id}`,
          senderId: req.senderid,
          receiverId: req.receiverid,
          title: 'You sent a request',
          type: 'profile_access_request',
          data: JSON.stringify({ requestId: req.id }),
          is_read: false,
          created_at: req.created_at,
          sender: req.receiver, // The receiver becomes the "sender" for display purposes
          _isSentRequest: true
        }));
        
        allItems = [...allItems, ...sentAsNotifications];
      }
      
      // Sort by created_at descending
      allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setNotifications(allItems);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  }

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notif => notif.id !== notificationId)
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper>
        <View style={styles.container}>
          <Header title='Notifications'/>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {
            notifications.map(item => {
              return (
                <NotificationItem
                  item={item}
                  key={item?.id}
                  router = {router}
                  onDelete={handleDeleteNotification}
                />
              )
              
            })
          }

          {
            notifications.length === 0 &&
              <Text style={styles.noData}>No notifications yet</Text>
          }
        </ScrollView>
        </View>
      </ScreenWrapper>
    </GestureHandlerRootView>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },

  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },

  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
