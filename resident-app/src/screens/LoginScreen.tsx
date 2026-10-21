import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, User, MapPin, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { loginWithPhone, isLoading, error } = useAuthStore();

  const handleSignIn = async () => {
    setFormError(null);
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (!cleaned) {
      setFormError('Please enter your 10-digit mobile number.');
      return;
    }

    if (cleaned.length < 10) {
      setFormError('Mobile number must be at least 10 digits.');
      return;
    }

    if (!fullName.trim()) {
      setFormError('Please enter your full name or nickname.');
      return;
    }

    const success = await loginWithPhone({
      phone: cleaned,
      name: fullName.trim(),
      address: streetAddress.trim() || 'Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
    });

    if (success && navigation) {
      // Session automatically navigates via App.tsx auth state
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.badgeText}>Resident Community</Text>
            </View>
            <Text style={styles.title}>Resident Sign In</Text>
            <Text style={styles.subtitle}>
              Connect with local street vendors and receive live arrival alerts for your neighborhood.
            </Text>
          </View>

          {/* Error Banner */}
          {(formError || error) && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color="#e11d48" style={{ marginTop: 2 }} />
              <Text style={styles.errorText}>{formError || error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (formError) setFormError(null);
                  }}
                  autoFocus
                />
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.standardInputContainer}>
                <User size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.standardInput}
                  placeholder="e.g. Karthik S"
                  placeholderTextColor="#94a3b8"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (formError) setFormError(null);
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Neighborhood / Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Neighborhood or Street (Optional)</Text>
              <View style={styles.standardInputContainer}>
                <MapPin size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.standardInput}
                  placeholder="e.g. Venkatanarayana Road, T. Nagar"
                  placeholderTextColor="#94a3b8"
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                />
              </View>
              <Text style={styles.helperText}>
                Used to find nearby push carts within your walking radius.
              </Text>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && { opacity: 0.7 }]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Continue to VendiConnect</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <ShieldCheck size={14} color="#64748b" />
            <Text style={styles.privacyText}>
              Your phone number is hashed cryptographically and never exposed publicly or shared with street vendors.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    marginBottom: 28,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#9f1239',
    lineHeight: 18,
  },
  form: {
    marginBottom: 24,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    height: 52,
  },
  countryCodeBox: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  standardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  standardInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  helperText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    height: 52,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
});
