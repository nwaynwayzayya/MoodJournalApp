import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ChangeCredentialsScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateCredentials = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newEmail && !newPassword) {
      Alert.alert('Error', 'Please enter either a new email or new password');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }
    }

    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update email if provided
      if (newEmail) {
        await updateEmail(user, newEmail);
        await updateDoc(doc(db, 'users', user.uid), {
          email: newEmail
        });
      }

      // Update password if provided
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      Alert.alert(
        'Success',
        'Credentials updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewEmail('');
              setNewPassword('');
              setConfirmPassword('');
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating credentials:', error);
      let errorMessage = 'Failed to update credentials';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log in again before changing your credentials';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#d86553" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Credentials</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={24} color="#d86553" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#d86553"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={24} color="#d86553" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={24} color="#d86553" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#d86553"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={24} color="#d86553" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#d86553"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdateCredentials}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating...' : 'Update Credentials'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f8f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d86553',
    marginLeft: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#d86553',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ffd799',
    borderRadius: 15,
    paddingRight: 15,
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333333',
  },
  eyeButton: {
    padding: 10,
  },
  button: {
    backgroundColor: '#d86553',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 