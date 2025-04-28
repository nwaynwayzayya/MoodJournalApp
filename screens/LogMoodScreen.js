import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LogMoodScreen({ route, navigation }) {
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [moodId, setMoodId] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');

  useEffect(() => {
    if (route.params?.moodToEdit) {
      const { mood: editMood, notes: editNotes, date, id } = route.params.moodToEdit;
      setMood(editMood);
      setNotes(editNotes);
      setSelectedDate(new Date(date));
      setIsEditing(true);
      setMoodId(id);
      setSelectedMood(editMood.split(' ')[0]);
    }
  }, [route.params]);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Oops!', 'Please select your mood!');
      return;
    }

    setLoading(true);
    try {
      // Create a new date string in YYYY-MM-DD format
      const dateString = selectedDate.getFullYear() + '-' +
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(selectedDate.getDate()).padStart(2, '0');
      // Create a new date object with the selected date but at the start of the day in UTC
      const selectedDateAtStartOfDay = new Date(selectedDate);
      selectedDateAtStartOfDay.setUTCHours(0, 0, 0, 0);

      const moodData = {
        userId: auth.currentUser.uid,
        mood: `${selectedMood} ${moods.find(m => m.emoji === selectedMood)?.label || ''}`,
        notes,
        date: selectedDateAtStartOfDay,
        dateString: dateString,
        timestamp: new Date(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'moods', moodId), moodData);
        Alert.alert('Yay!', 'Your mood has been updated!');
      } else {
        await addDoc(collection(db, 'moods'), moodData);
        Alert.alert('Yay!', 'Your mood has been saved!');
      }

      // Reset form
      setMood('');
      setNotes('');
      setSelectedDate(new Date());
      setIsEditing(false);
      setMoodId(null);
      setSelectedMood('');

      navigation.goBack();
    } catch (error) {
      Alert.alert('Oh no!', 'Something went wrong. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😴', label: 'Tired' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Your Mood</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.dateContainer}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#d86553" />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              accentColor="#d86553"
              textColor="#333"
              themeVariant="light"
            />
          )}

          <View style={styles.moodSelector}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <View style={styles.moodGrid}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.emoji}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.emoji && styles.selectedMoodOption,
                  ]}
                  onPress={() => setSelectedMood(mood.emoji)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodText,
                    selectedMood === mood.emoji && styles.selectedMoodText,
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Add Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="How was your day? What made you feel this way?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={loading || !selectedMood}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Mood' : 'Save Mood'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateContainer: {
    marginBottom: 25,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffd799',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d86553',
    marginBottom: 15,
  },
  moodSelector: {
    marginBottom: 25,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodOption: {
    backgroundColor: '#ffd799',
    borderColor: '#d86553',
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  moodText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedMoodText: {
    color: '#d86553',
    fontWeight: 'bold',
  },
  notesContainer: {
    marginBottom: 25,
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ffd799',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#d86553',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
