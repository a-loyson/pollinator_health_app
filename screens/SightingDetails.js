import { Button, Image, Text, View, StyleSheet, ScrollView } from "react-native";

export default function SightingDetails({ route, navigation }) {
  const { sighting } = route.params;
  
  // Extract data from sighting object
  const { 
    image, 
    prediction, 
    species, 
    description, 
    location, 
    date,
    latitude,
    longitude
  } = sighting;

  // Get top prediction - handle both formats
  const topPrediction = prediction || { species, confidence: 0, confidencePercentage: "0" };
  
  // For alternative predictions, we need them stored in the sighting
  // Currently they're not being saved - see note below

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 100 }}
      style={styles.scrollContainer}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>

        {topPrediction ? (
          <>
            <View style={styles.predictionCard}>
              <Text style={styles.sectionTitle}>Identified Species</Text>
              <Text style={styles.speciesName}>
                {topPrediction.species || species || "Unknown"}
              </Text>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence:</Text>
                <Text style={styles.confidenceValue}>
                  {topPrediction.confidencePercentage || "N/A"}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${topPrediction.confidencePercentage || 0}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Display alternative predictions if they exist */}
            {prediction?.allPredictions && prediction.allPredictions.length > 1 && (
              <View style={styles.alternativeCard}>
                <Text style={styles.sectionTitle}>Alternative Predictions</Text>
                {prediction.allPredictions.slice(1).map((pred, index) => (
                  <View key={index} style={styles.alternativeItem}>
                    <Text style={styles.alternativeSpecies}>
                      {index + 2}. {pred.species}
                    </Text>
                    <Text style={styles.alternativeConfidence}>
                      {pred.confidencePercentage}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Sighting Details */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Sighting Details</Text>
              
              {date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(date).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {(latitude && longitude) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </Text>
                </View>
              )}
              
              {description && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailValue}>{description}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>About Solidago (Goldenrod)</Text>
              <Text style={styles.infoText}>
                Solidago plants are flowering plants in the family Asteraceae. 
                They are commonly known as goldenrods and are important for 
                pollinators, particularly bees and butterflies.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              No prediction results available.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#eae2dc',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 280,
    height: 280,
    resizeMode: "cover",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  predictionCard: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  speciesName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 15,
    textAlign: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#666',
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28A745',
    borderRadius: 5,
  },
  alternativeCard: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alternativeSpecies: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  alternativeConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1B5E20',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
});