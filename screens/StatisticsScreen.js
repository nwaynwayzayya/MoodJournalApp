import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function StatisticsScreen() {
  const [moodStats, setMoodStats] = useState({});
  const [totalEntries, setTotalEntries] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

  const moodColors = {
    '😊 Happy': '#4CAF50',    // Green
    '😐 Neutral': '#FFC107',  // Yellow
    '😢 Sad': '#2196F3',     // Blue
    '😡 Angry': '#F44336',   // Red
    '😴 Tired': '#9C27B0',   // Purple
  };

  useEffect(() => {
    setLoading(true);
    try {
      const moodsQuery = query(
        collection(db, 'moods'),
        where('userId', '==', auth.currentUser.uid)
      );

      const unsubscribe = onSnapshot(moodsQuery, (querySnapshot) => {
        const stats = {};
        let count = 0;
        let totalCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const mood = data.mood;
          const date = data.date.toDate();
          
          // Count all entries for total
          totalCount++;
          
          // Count entries for selected month/year
          if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
            stats[mood] = (stats[mood] || 0) + 1;
            count++;
          }
        });

        setMoodStats(stats);
        setTotalEntries(count);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      Alert.alert('Error', 'Failed to load statistics. Please try again.');
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const getMoodPercentage = (count) => {
    if (totalEntries === 0) return 0;
    return Math.round((count / totalEntries) * 100);
  };

  const chartData = Object.entries(moodStats).map(([mood, count]) => {
    const moodName = mood.split(' ')[1];
    return {
      name: moodName,
      population: count,
      color: moodColors[mood] || '#666666',
      legendFontColor: '#333',
      legendFontSize: 12,
    };
  });

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={styles.dateButtonText}>{months[selectedMonth]}</Text>
            <Ionicons name="chevron-down" size={20} color="#d86553" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowYearPicker(true)}
          >
            <Text style={styles.dateButtonText}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={20} color="#d86553" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.totalText}>
            Total Mood Entries: {totalEntries}
          </Text>
          <Text style={styles.periodText}>
            Showing entries for {months[selectedMonth]} {selectedYear}
          </Text>

          {totalEntries > 0 ? (
            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
                center={[0, 0]}
                avoidFalseZero={true}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No mood entries for this period</Text>
            </View>
          )}

          {Object.entries(moodStats).map(([mood, count]) => (
            <View key={mood} style={styles.statItem}>
              <View style={styles.moodInfo}>
                <Text style={styles.moodEmoji}>{mood.split(' ')[0]}</Text>
                <Text style={styles.moodText}>{mood.split(' ')[1]}</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      width: `${getMoodPercentage(count)}%`,
                      backgroundColor: moodColors[mood] || '#666666'
                    }
                  ]} 
                />
                <Text style={styles.percentageText}>
                  {getMoodPercentage(count)}%
                </Text>
              </View>
              <Text style={styles.countText}>{count} entries</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.modalItem,
                    selectedMonth === index && styles.selectedModalItem
                  ]}
                  onPress={() => {
                    setSelectedMonth(index);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedMonth === index && styles.selectedModalItemText
                  ]}>{month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMonthPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.modalItem,
                    selectedYear === year && styles.selectedModalItem
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedYear === year && styles.selectedModalItemText
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowYearPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    //borderBottomLeftRadius: 20,
    //borderBottomRightRadius: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffd799',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
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
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#f9f8f3',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffd799',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d86553',
    marginBottom: 20,
    textAlign: 'center',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  statItem: {
    marginBottom: 15,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  moodText: {
    fontSize: 16,
    color: '#333',
  },
  barContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 5,
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  percentageText: {
    position: 'absolute',
    right: 10,
    top: 0,
    color: '#fff',
    fontSize: 12,
    lineHeight: 20,
  },
  countText: {
    fontSize: 14,
    color: '#666',
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
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d86553',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalScrollContent: {
    paddingVertical: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedModalItem: {
    backgroundColor: '#ffd799',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedModalItemText: {
    color: '#d86553',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#666',
    fontSize: 16,
  },
});

