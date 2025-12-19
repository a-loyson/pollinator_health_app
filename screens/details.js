import React, { useState } from "react";
import { Button, Image, Text, View, StyleSheet, ScrollView } from "react-native";

export default function DetailsScreen({ route, navigation }) {
  const { 
    image,
    plantDescription,
    prediction, 
    allPredictions, 
    primaryModelAccuracy,
    inceptionV3Prediction,
    inceptionV3AllPredictions,
    inceptionV3ModelAccuracy,
    vgg19Prediction, 
    vgg19AllPredictions,
    vgg19ModelAccuracy,
    combinedAccuracy,
    bertConfidence
  } = route.params;

  return (
    <ScrollView 
      contentContainerStyle={{paddingBottom: 100, flexGrow: 1}}
      style={styles.scrollContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Species Identification Results</Text>

        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>

        {prediction ? (
          <>
            {/* Combined Accuracy Card */}
            <View style={styles.combinedAccuracyCard}>
              <Text style={styles.combinedAccuracyTitle}>Combined Model Accuracy</Text>
              <Text style={styles.combinedAccuracyValue}>{combinedAccuracy}%</Text>
              <Text style={styles.combinedAccuracySubtext}>
                BERT + VGG19 + InceptionV3 + ConvNeXt
              </Text>
            </View>

            {/* Model Comparison Card - HIDDEN */}
            {false && <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Model Accuracy Comparison</Text>
              <View style={styles.modelComparisonRow}>
                <View style={styles.modelColumn}>
                  <Text style={styles.modelLabel}>ConvNeXt</Text>
                  <Text style={styles.modelAccuracy}>{primaryModelAccuracy || prediction.confidencePercentage}%</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.modelColumn}>
                  <Text style={styles.modelLabel}>InceptionV3</Text>
                  <Text style={styles.modelAccuracy}>{inceptionV3ModelAccuracy ? `${inceptionV3ModelAccuracy}%` : 'N/A'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.modelColumn}>
                  <Text style={styles.modelLabel}>VGG19</Text>
                  <Text style={styles.modelAccuracy}>{vgg19ModelAccuracy ? `${vgg19ModelAccuracy}%` : 'N/A'}</Text>
                </View>
              </View>
            </View>}

            {/* ConvNeXt Model Results */}
            <View style={styles.predictionCard}>
              <Text style={styles.sectionTitle}>ConvNeXt Model - Identified Species</Text>
              <Text style={styles.speciesName}>{prediction.species}</Text>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence:</Text>
                <Text style={styles.confidenceValue}>
                  {prediction.confidencePercentage}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${prediction.confidencePercentage}%` }
                  ]} 
                />
              </View>
            </View>

            {/* InceptionV3 Model Results */}
            {inceptionV3Prediction && (
              <View style={styles.predictionCard}>
                <Text style={styles.sectionTitle}>InceptionV3 Model - Identified Species</Text>
                <Text style={styles.speciesName}>{inceptionV3Prediction.species}</Text>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Confidence:</Text>
                  <Text style={styles.confidenceValue}>
                    {inceptionV3Prediction.confidencePercentage}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${inceptionV3Prediction.confidencePercentage}%` },
                      styles.inceptionV3ProgressFill
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* VGG19 Model Results */}
            {vgg19Prediction && (
              <View style={styles.predictionCard}>
                <Text style={styles.sectionTitle}>VGG19 Model - Identified Species</Text>
                <Text style={styles.speciesName}>{vgg19Prediction.species}</Text>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Confidence:</Text>
                  <Text style={styles.confidenceValue}>
                    {vgg19Prediction.confidencePercentage}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${vgg19Prediction.confidencePercentage}%` },
                      styles.vgg19ProgressFill
                    ]} 
                  />
                </View>
              </View>
            )}

            {/* ConvNeXt Model Alternative Predictions */}
            {allPredictions && allPredictions.length > 1 && (
              <View style={styles.alternativeCard}>
                <Text style={styles.sectionTitle}>ConvNeXt Model - Alternative Predictions</Text>
                {allPredictions.slice(1).map((pred, index) => (
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

            {/* InceptionV3 Model Alternative Predictions */}
            {inceptionV3AllPredictions && inceptionV3AllPredictions.length > 1 && (
              <View style={styles.alternativeCard}>
                <Text style={styles.sectionTitle}>InceptionV3 Model - Alternative Predictions</Text>
                {inceptionV3AllPredictions.slice(1).map((pred, index) => (
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

            {/* VGG19 Model Alternative Predictions */}
            {vgg19AllPredictions && vgg19AllPredictions.length > 1 && (
              <View style={styles.alternativeCard}>
                <Text style={styles.sectionTitle}>VGG19 Model - Alternative Predictions</Text>
                {vgg19AllPredictions.slice(1).map((pred, index) => (
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
              No prediction results available. Please try again.
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button 
            title="Analyze Another Plant" 
            onPress={() => navigation.goBack()} 
            color="#007AFF"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
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
  combinedAccuracyCard: {
    width: '100%',
    backgroundColor: '#E8E8E8',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  combinedAccuracyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  combinedAccuracyValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  combinedAccuracySubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  bertInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  bertInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  bertConfidenceText: {
    fontSize: 12,
    color: '#e8f5e9',
  },
  comparisonCard: {
    width: '100%',
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  modelComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  modelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 2,
    height: 60,
    backgroundColor: '#007AFF',
    marginHorizontal: 10,
  },
  modelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  modelAccuracy: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
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
  inceptionV3ProgressFill: {
    backgroundColor: '#FF9500',
  },
  vgg19ProgressFill: {
    backgroundColor: '#007AFF',
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
