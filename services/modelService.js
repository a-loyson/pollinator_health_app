import * as tf from '@tensorflow/tfjs';
import * as FileSystem from 'expo-file-system';
import { EncodingType } from 'expo-file-system';
import * as jpeg from 'jpeg-js';

class ModelService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.isTfjsReady = false;
    
    // 18 Solidago species - MUST match the order from your training data
    // Class 0 = Solidago_altissima, Class 1 = Solidago_canadensis, etc.
    this.speciesLabels = [
      'Solidago altissima',
      'Solidago canadensis',
      'Solidago delicatula',
      'Solidago gigantea',
      'Solidago hispida',
      'Solidago juncea',
      'Solidago missouriensis',
      'Solidago mollis',
      'Solidago nemoralis',
      'Solidago petiolaris',
      'Solidago pinetorum',
      'Solidago radula',
      'Solidago rigida',
      'Solidago rigidiuscula',
      'Solidago rugosa',
      'Solidago speciosa',
      'Solidago ulmifolia',
      'Solidago virgaurea',
    ];
  }

  async initializeTensorFlow() {
    if (this.isTfjsReady) return;
    
    try {
      await tf.ready();
      this.isTfjsReady = true;
      console.log('TensorFlow.js is ready');
      console.log('Backend:', tf.getBackend());
    } catch (error) {
      console.error('Error initializing TensorFlow.js:', error);
      throw error;
    }
  }

  async loadModel() {
    if (this.isModelLoaded) return;
    
    await this.initializeTensorFlow();
    
    try {
      // For now, we'll use a simple mock since loading SavedModel in React Native is complex
      // In production, you should either:
      // 1. Convert the model to TensorFlow Lite format (.tflite)
      // 2. Host the model on a server and use tf.loadGraphModel with HTTP URL
      // 3. Convert to TensorFlow.js format with proper web tensors
      
      console.log('Model loading skipped - using direct prediction');
      this.isModelLoaded = true;
      
      // TODO: Load actual TensorFlow.js model when available
      // Ensure trained model outputs 18 classes for Solidago species
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to initialize model service');
    }
  }

  async preprocessImage(imageUri) {
    try {
      console.log('Reading image from:', imageUri);
      
      // Check if FileSystem is available
      if (!FileSystem || !FileSystem.readAsStringAsync) {
        throw new Error('FileSystem module not available');
      }
      
      // For now, create a simple placeholder tensor to test the pipeline
      // This bypasses the complex base64 -> JPEG decoding
      console.log('Creating placeholder tensor (224x224x3)...');
      
      // Create a random tensor as placeholder (you can replace this with actual image loading later)
      const placeholder = tf.randomUniform([1, 224, 224, 3], 0, 1);
      
      console.log('Placeholder tensor created:', placeholder.shape);
      
      return placeholder;
      
      /* 
      // Original image loading code (uncomment when ready to use real images):
      
      // Read image as base64
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: EncodingType?.Base64 || 'base64',
      });
      
      console.log('Image read successfully, length:', imgB64.length);
      
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const rawImageData = new Uint8Array(imgBuffer);
      const imageTensor = jpeg.decode(rawImageData, {useTArray: true});
      
      // Convert to tensor and resize to 224x224 (ConvNeXt input size)
      const imageTensor3d = tf.tensor3d(imageTensor.data, [
        imageTensor.height,
        imageTensor.width,
        4, // RGBA
      ]);
      
      // Remove alpha channel (take only RGB)
      const imageRGB = imageTensor3d.slice([0, 0, 0], [-1, -1, 3]);
      
      // Resize to 224x224 for ConvNeXt model
      const resized = tf.image.resizeBilinear(imageRGB, [224, 224]);
      
      // Normalize to [0, 1] range
      const normalized = resized.div(255.0);
      
      // Add batch dimension
      const batched = normalized.expandDims(0);
      
      // Clean up intermediate tensors
      imageTensor3d.dispose();
      imageRGB.dispose();
      resized.dispose();
      normalized.dispose();
      
      return batched;
      */
    } catch (error) {
      console.error('Error preprocessing image:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  async predictSpecies(imageUri) {
    if (!this.isModelLoaded) {
      await this.loadModel();
    }

    try {
      console.log('Preprocessing image...');
      const preprocessedImage = await this.preprocessImage(imageUri);
      
      console.log('Creating mock prediction...');
      // TODO: Replace with actual model prediction once model is properly loaded
      // For now, return mock predictions to test the UI
      
      const mockPredictions = this.speciesLabels.map((species, index) => {
        // Generate random confidence scores
        const randomConfidence = Math.random();
        return {
          class: index,
          species: species,
          confidence: randomConfidence,
          confidencePercentage: (randomConfidence * 100).toFixed(2)
        };
      });
      
      // Sort by confidence (highest first)
      mockPredictions.sort((a, b) => b.confidence - a.confidence);
      
      // Get top prediction
      const topPrediction = mockPredictions[0];
      
      console.log('Mock prediction complete:', topPrediction);
      
      // Clean up tensors to prevent memory leaks
      preprocessedImage.dispose();
      
      return {
        topPrediction,
        allPredictions: mockPredictions.slice(0, 3), // Return top 3 predictions
        note: 'Using mock predictions - model not loaded yet'
      };
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  }

  getSpeciesName(classIndex) {
    if (classIndex >= 0 && classIndex < this.speciesLabels.length) {
      return this.speciesLabels[classIndex];
    }
    return `Unknown Species (Class ${classIndex})`;
  }

  // Update species labels after model is loaded (optional)
  setSpeciesLabels(labels) {
    this.speciesLabels = labels;
  }
}

export default new ModelService();
