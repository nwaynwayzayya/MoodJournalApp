import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to Mood Journal</Text>
          <Text style={styles.sectionText}>
            Mood Journal is a kid-friendly app designed to help children track and understand their emotions. 
            With colorful emojis and simple interfaces, children can easily log their daily moods and reflect on their feelings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="happy-outline" size={24} color="#d86553" />
            <Text style={styles.featureText}>Easy mood tracking with emojis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="calendar-outline" size={24} color="#d86553" />
            <Text style={styles.featureText}>Calendar view of mood history</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="stats-chart-outline" size={24} color="#d86553" />
            <Text style={styles.featureText}>Statistics and insights</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#d86553" />
            <Text style={styles.featureText}>Secure and private</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version</Text>
          <Text style={styles.sectionText}>1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            Have questions or feedback? We'd love to hear from you!
            {'\n\n'}Email: support@moodjournal.com
            {'\n'}Website: www.moodjournal.com
          </Text>
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
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d86553',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
}); 