import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [moodDetails, setMoodDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [moods, setMoods] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const moodsQuery = query(
      collection(db, 'moods'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(moodsQuery, (querySnapshot) => {
      const moodsData = {};
      const moodsList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dateString = data.dateString;
        
        moodsData[dateString] = {
          marked: true,
          dotColor: getMoodColor(data.mood),
          selected: false,
        };
        
        moodsList.push({
          id: doc.id,
          ...data,
          date: dateString,
        });
      });
      
      setMarkedDates(moodsData);
      setMoods(moodsList);
    });

    // Subscribe to user data changes
    const userDoc = doc(db, 'users', auth.currentUser.uid);
    const userUnsubscribe = onSnapshot(userDoc, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    return () => {
      unsubscribe();
      userUnsubscribe();
    };
  }, []);

  const getMoodColor = (mood) => {
    const colors = {
      '😊 Happy': '#4CAF50',
      '😐 Neutral': '#FFC107',
      '😢 Sad': '#2196F3',
      '😡 Angry': '#F44336',
      '😴 Tired': '#9C27B0',
    };
    return colors[mood] || '#666666';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    return `${greeting},`;
  };

  const getTodayMood = () => {
    const today = new Date();
    const todayString = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    return moods.find(mood => mood.date === todayString);
  };

  const getMoodEmoji = (mood) => {
    if (!mood) return '😊';
    return mood.split(' ')[0];
  };

  const getMoodName = (mood) => {
    if (!mood) return 'Happy';
    return mood.split(' ').slice(1).join(' ');
  };

  const handleDayPress = (day) => {
    const selectedMood = moods.find(mood => mood.date === day.dateString);
    if (selectedMood) {
      setSelectedDate(day.dateString);
      setMoodDetails(selectedMood);
      setShowModal(true);
    }
  };

  const handleDeleteMood = async () => {
    try {
      await deleteDoc(doc(db, 'moods', moodDetails.id));
      Alert.alert('Success', 'Mood entry deleted successfully!');
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete mood entry');
    }
  };

  const handleEditMood = () => {
    setShowModal(false);
    navigation.navigate('Log Mood', { moodToEdit: moodDetails });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          {userData?.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={24} color="#d86553" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.todayMoodContainer}>
          <View style={styles.todayMoodHeader}>
            <Text style={styles.todayMoodTitle}>Today's Mood</Text>
            <Text style={styles.todayMoodDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          {getTodayMood() ? (
            <View style={styles.todayMoodContent}>
              <View style={styles.moodEmojiContainer}>
                <Text style={styles.todayMoodEmoji}>
                  {getMoodEmoji(getTodayMood()?.mood)}
                </Text>
              </View>
              <View style={styles.moodTextWrapper}>
                <Text style={styles.todayMoodLabel}>You're feeling</Text>
                <Text style={styles.todayMoodName}>
                  {getMoodName(getTodayMood()?.mood)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noMoodContainer}>
              <View style={styles.noMoodIconContainer}>
                <Ionicons name="calendar-outline" size={40} color="#d86553" />
              </View>
              <Text style={styles.noMoodText}>No mood logged for today</Text>
              <Text style={styles.noMoodSubtext}>Tap the + button below to log your mood!</Text>
            </View>
          )}
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Mood Calendar</Text>
            <Text style={styles.calendarSubtitle}>Track your emotional journey</Text>
          </View>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#fff',
              textSectionTitleColor: '#d86553',
              selectedDayBackgroundColor: '#d86553',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#d86553',
              dayTextColor: '#333333',
              textDisabledColor: '#d9d9d9',
              dotColor: '#d86553',
              selectedDotColor: '#ffffff',
              arrowColor: '#d86553',
              monthTextColor: '#d86553',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mood Details</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#d86553" />
              </TouchableOpacity>
            </View>

            <View style={styles.moodDetails}>
              <Text style={styles.dateText}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <View style={styles.moodDetailItem}>
                <Text style={styles.detailLabel}>Mood</Text>
                <Text style={styles.moodText}>{moodDetails?.mood}</Text>
              </View>
              <View style={styles.moodDetailItem}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.notesText}>{moodDetails?.notes || 'No notes added'}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={handleEditMood}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteMood}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Log Mood')}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f8f3',
  },
  header: {
    padding: 15,
    backgroundColor: '#d86553',
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 15,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffd799',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  todayMoodContainer: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(216, 101, 83, 0.1)',
  },
  todayMoodHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 101, 83, 0.1)',
    paddingBottom: 10,
  },
  todayMoodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d86553',
  },
  todayMoodDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  todayMoodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f8f3',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffd799',
  },
  moodEmojiContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffd799',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  todayMoodEmoji: {
    fontSize: 35,
  },
  moodTextWrapper: {
    marginLeft: 20,
    flex: 1,
  },
  todayMoodLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  todayMoodName: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
  },
  noMoodContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f8f3',
    borderRadius: 10,
  },
  noMoodIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffd799',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  noMoodText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  noMoodSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  calendarContainer: {
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d86553',
  },
  calendarSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#d86553',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d86553',
  },
  moodDetails: {
    marginBottom: 20,
  },
  moodDetailItem: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  moodText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#ffd799',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
