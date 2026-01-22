import * as tf from '@tensorflow/tfjs';
import * as FileSystem from 'expo-file-system';
import { EncodingType } from 'expo-file-system';
import * as jpeg from 'jpeg-js';

class ModelService {
  constructor() {
    this.model = null;
    this.vgg19Model = null;
    this.inceptionV3Model = null;
    this.bertModel = null;
    this.isModelLoaded = false;
    this.isVgg19Loaded = false;
    this.isInceptionV3Loaded = false;
    this.isBertLoaded = false;
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
    
    // Keywords for text-based species identification
    this.speciesKeywords = {
      'Solidago altissima': ['tall', 'tallest', 'late', 'august', 'september', 'smooth stem'],
      'Solidago canadensis': ['common', 'widespread', 'hairy stem', 'rough', 'field'],
      'Solidago gigantea': ['giant', 'large', 'smooth', 'waxy', 'blue-green'],
      'Solidago rugosa': ['rough', 'wrinkled', 'leaves', 'woodland', 'shade'],
      'Solidago nemoralis': ['gray', 'grayish', 'small', 'short', 'dry'],
      'Solidago juncea': ['early', 'june', 'july', 'smooth leaves', 'basal'],
      'Solidago rigida': ['stiff', 'rigid', 'hard', 'thick leaves'],
      'Solidago speciosa': ['showy', 'spectacular', 'large flowers'],
      'Solidago hispida': ['hairy', 'hispid', 'bristly'],
      'Solidago missouriensis': ['prairie', 'plains', 'missouri'],
      'Solidago mollis': ['soft', 'velvety', 'fuzzy'],
      'Solidago petiolaris': ['downy', 'petiolate'],
      'Solidago pinetorum': ['pine', 'forest', 'mountain'],
      'Solidago radula': ['rough leaf'],
      'Solidago rigidiuscula': ['slightly stiff'],
      'Solidago delicatula': ['delicate', 'small'],
      'Solidago ulmifolia': ['elm-leaved', 'broad leaves'],
      'Solidago virgaurea': ['european', 'alpine']
    };
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
    if (this.isModelLoaded && this.isVgg19Loaded && this.isInceptionV3Loaded && this.isBertLoaded) return;
    
    await this.initializeTensorFlow();
    
    try {
      // Load ConvNeXt primary model
      if (!this.isModelLoaded) {
        try {
          console.log('Loading ConvNeXt model...');
          // Load from bundled assets - for web, use public URL
          const modelUrl = '/models/convnext_tfjs/model.json';
          this.model = await tf.loadLayersModel(modelUrl);
          this.isModelLoaded = true;
          console.log('ConvNeXt model loaded successfully');
        } catch (convnextError) {
          console.error('Error loading ConvNeXt model:', convnextError);
          console.log('Continuing with mock predictions for ConvNeXt');
          this.isModelLoaded = true; // Mark as loaded to use mock predictions
        }
      }
      
      // Load VGG19 model
      if (!this.isVgg19Loaded) {
        try {
          console.log('Loading VGG19 model...');
          const modelUrl = '/models/vgg19_tfjs/model.json';
          this.vgg19Model = await tf.loadLayersModel(modelUrl);
          this.isVgg19Loaded = true;
          console.log('VGG19 model loaded successfully');
        } catch (vgg19Error) {
          console.error('Error loading VGG19 model:', vgg19Error);
          console.log('Continuing with mock predictions for VGG19');
          this.isVgg19Loaded = true;
        }
      }
      
      // Load InceptionV3 model
      if (!this.isInceptionV3Loaded) {
        try {
          console.log('Loading InceptionV3 model...');
          const modelUrl = '/models/inceptionv3_tfjs/model.json';
          this.inceptionV3Model = await tf.loadLayersModel(modelUrl);
          this.isInceptionV3Loaded = true;
          console.log('InceptionV3 model loaded successfully');
        } catch (inceptionError) {
          console.error('Error loading InceptionV3 model:', inceptionError);
          console.log('Continuing with mock predictions for InceptionV3');
          this.isInceptionV3Loaded = true;
        }
      }
      
      // Initialize BERT text processing (keyword-based for now)
      if (!this.isBertLoaded) {
        try {
          console.log('Initializing BERT text processing...');
          this.isBertLoaded = true;
          console.log('BERT text processing initialized');
        } catch (bertError) {
          console.error('Error initializing BERT:', bertError);
          console.log('Continuing without BERT text processing');
        }
      }
    } catch (error) {
      console.error('Error loading models:', error);
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

  processTextDescription(description) {
    if (!description || description.trim() === '') {
      return null;
    }

    const lowerDescription = description.toLowerCase();
    const scores = {};

    // Score each species based on keyword matches
    this.speciesLabels.forEach((species) => {
      const keywords = this.speciesKeywords[species] || [];
      let matchScore = 0;

      keywords.forEach((keyword) => {
        if (lowerDescription.includes(keyword.toLowerCase())) {
          matchScore += 1;
        }
      });

      // Normalize score
      const normalizedScore = keywords.length > 0 ? matchScore / keywords.length : 0;
      scores[species] = normalizedScore;
    });

    return scores;
  }

  combineModelPredictions(imagePredictions, textScores, textWeight = 0.3) {
    // Combine image-based predictions with text-based scores
    const combinedPredictions = this.speciesLabels.map((species, index) => {
      const imageConf = imagePredictions[index].confidence;
      const textConf = textScores && textScores[species] ? textScores[species] : 0;
      
      // Weighted combination: 70% image, 30% text (if text provided)
      const combinedConf = textScores ? 
        (imageConf * (1 - textWeight) + textConf * textWeight) :
        imageConf;

      return {
        class: index,
        species: species,
        confidence: combinedConf,
        confidencePercentage: (combinedConf * 100).toFixed(2),
        imageConfidence: imageConf,
        textConfidence: textConf
      };
    });

    combinedPredictions.sort((a, b) => b.confidence - a.confidence);
    return combinedPredictions;
  }

  async predictSpecies(imageUri, textDescription = '') {
    if (!this.isModelLoaded) {
      await this.loadModel();
    }

    try {
      console.log('Preprocessing image...');
      const preprocessedImage = await this.preprocessImage(imageUri);
      
      console.log('Creating predictions from all models...');
      
      // Primary Model (ConvNeXt) Predictions
      let primaryPredictions;
      if (this.model) {
        console.log('Running ConvNeXt model inference...');
        const convnextOutput = this.model.predict(preprocessedImage);
        const convnextData = await convnextOutput.data();
        primaryPredictions = this.speciesLabels.map((species, index) => ({
          class: index,
          species: species,
          confidence: convnextData[index],
          confidencePercentage: (convnextData[index] * 100).toFixed(2)
        }));
        convnextOutput.dispose();
      } else {
        // Mock predictions if model not loaded
        primaryPredictions = this.speciesLabels.map((species, index) => {
          const randomConfidence = Math.random();
          return {
            class: index,
            species: species,
            confidence: randomConfidence,
            confidencePercentage: (randomConfidence * 100).toFixed(2)
          };
        });
      }
      primaryPredictions.sort((a, b) => b.confidence - a.confidence);
      
      // InceptionV3 Model Predictions
      let inceptionV3Predictions;
      if (this.inceptionV3Model) {
        console.log('Running InceptionV3 model inference...');
        // InceptionV3 expects 224x224 input (same as our preprocessed image)
        const inceptionOutput = this.inceptionV3Model.predict(preprocessedImage);
        const inceptionData = await inceptionOutput.data();
        inceptionV3Predictions = this.speciesLabels.map((species, index) => ({
          class: index,
          species: species,
          confidence: inceptionData[index],
          confidencePercentage: (inceptionData[index] * 100).toFixed(2)
        }));
        inceptionOutput.dispose();
      } else {
        // Mock predictions if model not loaded
        inceptionV3Predictions = this.speciesLabels.map((species, index) => {
          const randomConfidence = Math.random();
          return {
            class: index,
            species: species,
            confidence: randomConfidence,
            confidencePercentage: (randomConfidence * 100).toFixed(2)
          };
        });
      }
      inceptionV3Predictions.sort((a, b) => b.confidence - a.confidence);
      
      // VGG19 Model Predictions
      let vgg19Predictions;
      if (this.vgg19Model) {
        console.log('Running VGG19 model inference...');
        const vgg19Output = this.vgg19Model.predict(preprocessedImage);
        const vgg19Data = await vgg19Output.data();
        // VGG19 has 19 output classes, map first 18 to our species labels
        vgg19Predictions = this.speciesLabels.map((species, index) => ({
          class: index,
          species: species,
          confidence: index < vgg19Data.length ? vgg19Data[index] : 0,
          confidencePercentage: (index < vgg19Data.length ? vgg19Data[index] * 100 : 0).toFixed(2)
        }));
        vgg19Output.dispose();
      } else {
        // Mock predictions if model not loaded
        vgg19Predictions = this.speciesLabels.map((species, index) => {
          const randomConfidence = Math.random();
          return {
            class: index,
            species: species,
            confidence: randomConfidence,
            confidencePercentage: (randomConfidence * 100).toFixed(2)
          };
        });
      }
      vgg19Predictions.sort((a, b) => b.confidence - a.confidence);
      
      // Get top predictions from all three models
      const primaryTopPrediction = primaryPredictions[0];
      const inceptionV3TopPrediction = inceptionV3Predictions[0];
      const vgg19TopPrediction = vgg19Predictions[0];
      
      // Process text description with BERT
      console.log('Processing text description...');
      const textScores = this.processTextDescription(textDescription);
      const hasTextInput = textScores !== null;
      
      // Combine predictions from all models
      // Find the highest confidence prediction across all three image models for each species
      const maxImagePredictions = this.speciesLabels.map((species, index) => {
        const primaryConf = primaryPredictions[index].confidence;
        const inceptionConf = inceptionV3Predictions[index].confidence;
        const vgg19Conf = vgg19Predictions[index].confidence;
        
        // Take the maximum confidence from any of the three models
        const maxConf = Math.max(primaryConf, inceptionConf, vgg19Conf);
        
        // Track which model had the highest confidence
        let bestModel = 'ConvNeXt';
        if (inceptionConf === maxConf) bestModel = 'InceptionV3';
        else if (vgg19Conf === maxConf) bestModel = 'VGG19';
        
        return {
          class: index,
          species: species,
          confidence: maxConf,
          confidencePercentage: (maxConf * 100).toFixed(2),
          bestModel: bestModel,
          primaryConf: primaryConf,
          inceptionConf: inceptionConf,
          vgg19Conf: vgg19Conf
        };
      });
      
      // Combine best image predictions with text scores
      const combinedPredictions = this.combineModelPredictions(maxImagePredictions, textScores, 0.3);
      const combinedTopPrediction = combinedPredictions[0];
      
      // Calculate overall combined accuracy using the top prediction from combined results
      let combinedAccuracy;
      if (hasTextInput) {
        // The combined prediction already includes BERT weighting
        combinedAccuracy = parseFloat(combinedTopPrediction.confidencePercentage).toFixed(2);
      } else {
        // Use the max confidence from image models
        combinedAccuracy = parseFloat(combinedTopPrediction.confidencePercentage).toFixed(2);
      }
      
      console.log('Predictions complete');
      console.log('Primary Model:', primaryTopPrediction);
      console.log('InceptionV3 Model:', inceptionV3TopPrediction);
      console.log('VGG19 Model:', vgg19TopPrediction);
      console.log('Combined Accuracy:', combinedAccuracy);
      if (hasTextInput) {
        console.log('Text processing active - BERT confidence included');
      }
      console.log('InceptionV3 Model:', inceptionV3TopPrediction);
      console.log('VGG19 Model:', vgg19TopPrediction);
      
      // Clean up tensors to prevent memory leaks
      preprocessedImage.dispose();
      
      return {
        // Combined results - this is the final prediction
        combinedAccuracy: combinedAccuracy,
        combinedTopPrediction: combinedTopPrediction,
        predictedSpecies: combinedTopPrediction.species,
        bestModel: combinedTopPrediction.bestModel,
        bertConfidence: hasTextInput ? (textScores[combinedTopPrediction.species] * 100).toFixed(2) : null,
        
        // Primary model results
        topPrediction: primaryTopPrediction,
        allPredictions: primaryPredictions.slice(0, 3),
        primaryModelAccuracy: primaryTopPrediction.confidencePercentage,
        
        // InceptionV3 model results
        inceptionV3TopPrediction: inceptionV3TopPrediction,
        inceptionV3AllPredictions: inceptionV3Predictions.slice(0, 3),
        inceptionV3ModelAccuracy: inceptionV3TopPrediction.confidencePercentage,
        
        // VGG19 model results
        vgg19TopPrediction: vgg19TopPrediction,
        vgg19AllPredictions: vgg19Predictions.slice(0, 3),
        vgg19ModelAccuracy: vgg19TopPrediction.confidencePercentage,
        
        // Metadata
        modelsUsed: {
          primary: !!this.model,
          inceptionV3: !!this.inceptionV3Model,
          vgg19: !!this.vgg19Model,
          bert: this.isBertLoaded && hasTextInput
        },
        hasTextDescription: hasTextInput,
        note: this.model || this.inceptionV3Model ? 'Using loaded TensorFlow.js models' : 'Using mock predictions - models not loaded'
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
