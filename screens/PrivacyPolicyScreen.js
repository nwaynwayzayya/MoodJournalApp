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

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.sectionText}>
            At Mood Journal, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect the following information:
            {'\n\n'}• Account information (email, name)
            {'\n'}• Mood entries and notes
            {'\n'}• Profile picture (optional)
            {'\n'}• Usage data and app preferences
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use your information to:
            {'\n\n'}• Provide and improve our services
            {'\n'}• Personalize your experience
            {'\n'}• Generate statistics and insights
            {'\n'}• Ensure app security
            {'\n'}• Communicate with you about updates
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate security measures to protect your personal information:
            {'\n\n'}• Data encryption
            {'\n'}• Secure authentication
            {'\n'}• Regular security updates
            {'\n'}• Limited access to personal data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Mood Journal is designed for children, and we take extra care to protect their privacy:
            {'\n\n'}• Parental consent required for account creation
            {'\n'}• No targeted advertising
            {'\n'}• Limited data collection
            {'\n'}• Parental controls available
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about our Privacy Policy, please contact us at:
            {'\n\n'}Email: privacy@moodjournal.com
            {'\n'}Phone: (555) 123-4567
          </Text>
        </View>

        <Text style={styles.lastUpdated}>
          Last updated: March 15, 2024
        </Text>
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
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 