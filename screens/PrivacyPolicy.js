import { ScrollView, Text, StyleSheet } from "react-native";

export default function PrivacyPolicy() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.section}>Introduction</Text>
      <Text style={styles.text}>
        Our app ("we," "our," or "us") is a platform developed at Villanova University.  This Privacy Policy explains how we collect, use, and protect your information when you use the website and mobile application (collectively, the "Service"). 
      </Text>

      <Text style={styles.section}>Information We Collect</Text>
      <Text style={styles.text}>
        Account Information 
        If you create an account, we may collect basic information such as your email address. This is securely stored in Django Authentication and used to manage your account and keep you signed in. 
      </Text>

      <Text style={styles.section}>Sighting Data</Text>
      <Text style={styles.text}>
        When you submit a flower sighting, we collect the photograph you upload, the geographic location (latitude and longitude) of the observation, the date and time of the sighting, and any optional notes you provide. This data is essential for species identification and ecological research. 
      </Text>

      <Text style={styles.section}>Location Data</Text>
      <Text style={styles.text}>
        With your permission, we collect precise geolocation data when you submit a sighting. This data is used to map observations and support pollinator research. You may choose to enter a location manually instead of using GPS. 
      </Text>

      <Text style={styles.section}>Data Sharing and Research Use</Text>
      <Text style={styles.text}>
        With your permission, we collect precise geolocation data when you submit a sighting. This data is used to map observations and support pollinator research. You may choose to enter a location manually instead of using GPS. 
      </Text>
      
      <Text style={styles.section}>Data Storage and Security</Text>
      <Text style={styles.text}>
        Your data is stored using Google Firebase and Google Cloud services, which provide industry-standard security protections including encryption in transit and at rest. We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, or destruction. 
      </Text>

      <Text style={styles.section}>Changes to This Policy</Text>
      <Text style={styles.text}>
        We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We will notify users of significant changes through the Service. Your continued use of the app and website after changes are posted constitutes acceptance of the updated policy.  
      </Text>

      {/* keep adding sections like this */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    paddingTop: 50,
    paddingBottom: 50,
    backgroundColor: "#EAE2DC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
    color: "#444",
  },
});