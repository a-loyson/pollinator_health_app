import * as tf from '@tensorflow/tfjs';
// Registers the React Native platform adapter (encode / isTypedArray / fetch)
// and the rn-webgl backend. Without this side-effect import, tf.env().platform
// is undefined on React Native and both weight loading and tf.util.encodeString
// throw "Cannot read property 'isTypedArray'/'encode' of undefined".
// Import the two submodules directly rather than the package barrel, which also
// pulls in a camera helper that requires the (unused) expo-camera dependency.
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import { decodeJpeg } from '@tensorflow/tfjs-react-native/dist/decode_image';
// SDK 54 moved the classic file API to the `/legacy` entry point; the root
// `readAsStringAsync` now throws. Import the legacy API explicitly.
import * as FileSystem from 'expo-file-system/legacy';
import { EncodingType } from 'expo-file-system/legacy';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Keras 3 exports a `Normalization` preprocessing layer that tfjs has no
// built-in implementation for. It applies (x - mean) / sqrt(variance) along
// the given axis (and the inverse when `invert` is true). The mean/variance
// are carried in the layer config, so no extra weights are required.
class Normalization extends tf.layers.Layer {
  constructor(config = {}) {
    super(config);
    this.axis = config.axis;
    this.mean = config.mean;
    this.variance = config.variance;
    this.invert = config.invert || false;
  }

  call(inputs) {
    return tf.tidy(() => {
      const x = Array.isArray(inputs) ? inputs[0] : inputs;
      const mean = tf.tensor(this.mean);
      const std = tf.sqrt(tf.tensor(this.variance));
      return this.invert ? x.mul(std).add(mean) : x.sub(mean).div(std);
    });
  }

  computeOutputShape(inputShape) {
    return inputShape;
  }

  getConfig() {
    const config = super.getConfig();
    Object.assign(config, {
      axis: this.axis,
      mean: this.mean,
      variance: this.variance,
      invert: this.invert,
    });
    return config;
  }

  static get className() {
    return 'Normalization';
  }
}
tf.serialization.registerClass(Normalization);

// ConvNeXt's LayerScale: multiplies the input by a learned per-channel weight
// `gamma` (shape [projection_dim]). tfjs has no built-in implementation.
class LayerScale extends tf.layers.Layer {
  constructor(config = {}) {
    super(config);
    this.initValues = config.init_values;
    this.projectionDim = config.projection_dim;
    this.gamma = null;
  }

  build(inputShape) {
    this.gamma = this.addWeight(
      'gamma',
      [this.projectionDim],
      'float32',
      tf.initializers.constant({ value: this.initValues })
    );
    this.built = true;
  }

  call(inputs) {
    return tf.tidy(() => {
      const x = Array.isArray(inputs) ? inputs[0] : inputs;
      return x.mul(this.gamma.read());
    });
  }

  computeOutputShape(inputShape) {
    return inputShape;
  }

  getConfig() {
    const config = super.getConfig();
    Object.assign(config, {
      init_values: this.initValues,
      projection_dim: this.projectionDim,
    });
    return config;
  }

  static get className() {
    return 'LayerScale';
  }
}
tf.serialization.registerClass(LayerScale);

class ModelService {
  constructor() {
    // InceptionV3 is the sole image classifier used for predictions.
    this.inceptionV3Model = null;
    this.isInceptionV3Loaded = false;
    this.isBertLoaded = false;
    this.isTfjsReady = false;

    // The InceptionV3 model was exported with a 299x299x3 input and expects
    // pixels normalized to the [-1, 1] range (the standard InceptionV3
    // `preprocess_input` convention).
    this.inputSize = 299;

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

  // Downloads a TF.js model using React Native's native fetch, bypassing
  // tf.loadLayersModel's HTTP handler which requires window.fetch (browser only).
  // Models exported with Keras 3 serialize the input shape as `batch_shape`,
  // but tfjs (Keras 2 format) expects `batch_input_shape`. Rewrite it so the
  // layers loader can construct the InputLayer.
  _patchKeras3Topology(node) {
    if (Array.isArray(node)) {
      node.forEach((n) => this._patchKeras3Topology(n));
      return;
    }
    if (node && typeof node === 'object') {
      if (node.class_name === 'InputLayer' && node.config && node.config.batch_shape && !node.config.batch_input_shape) {
        node.config.batch_input_shape = node.config.batch_shape;
        delete node.config.batch_shape;
      }
      // Keras 3 serializes dtype as a DTypePolicy object; tfjs expects a string.
      if (node.config && node.config.dtype && typeof node.config.dtype === 'object') {
        node.config.dtype = node.config.dtype.config?.name || 'float32';
      }
      // Keras 3 stores inbound_nodes as [{args, kwargs}, ...]; tfjs expects the
      // Keras 2 form [[[layerName, nodeIndex, tensorIndex, kwargs], ...], ...].
      if (
        Array.isArray(node.inbound_nodes) &&
        node.inbound_nodes.length > 0 &&
        node.inbound_nodes[0] &&
        !Array.isArray(node.inbound_nodes[0]) &&
        node.inbound_nodes[0].args !== undefined
      ) {
        node.inbound_nodes = this._convertInboundNodes(node.inbound_nodes);
      }
      for (const key of Object.keys(node)) {
        this._patchKeras3Topology(node[key]);
      }
    }
  }

  // Convert one layer's Keras 3 inbound_nodes ([{args, kwargs}, ...]) into the
  // Keras 2 form tfjs expects: one array of [layerName, nodeIndex, tensorIndex,
  // kwargs] connections per call. List args (multi-input layers like Add) are
  // flattened into separate connections.
  _convertInboundNodes(nodes) {
    return nodes.map((node) => {
      const kwargs = node.kwargs || {};
      const connections = [];
      const collect = (arg) => {
        if (Array.isArray(arg)) {
          arg.forEach(collect);
        } else if (arg && typeof arg === 'object' && arg.class_name === '__keras_tensor__') {
          const [name, nodeIndex, tensorIndex] = arg.config.keras_history;
          connections.push([name, nodeIndex, tensorIndex, kwargs]);
        }
      };
      (node.args || []).forEach(collect);
      return connections;
    });
  }

  // ConvNeXt LayerScale weights are serialized by Keras 3 as
  // `<layer>_layer_scale/variable[_N]`. Rename them to `<layer>_layer_scale/gamma`
  // so they bind to the custom LayerScale layer's `gamma` weight by name.
  _patchKeras3Weights(weightsManifest) {
    for (const group of weightsManifest || []) {
      for (const spec of group.weights || []) {
        spec.name = spec.name.replace(/(_layer_scale)\/variable(_\d+)?$/, '$1/gamma');
      }
    }
  }

  // Resolves a Firebase Storage object path to a tokenized download URL. The
  // bucket's security rules require `request.auth != null`, so the model files
  // cannot be fetched from their raw GCS URLs anonymously (that returns 403).
  // getDownloadURL runs through the Firebase SDK using the signed-in user's
  // credentials and returns a token URL that plain fetch can then read.
  async _storageUrl(objectPath) {
    return getDownloadURL(ref(storage, objectPath));
  }

  // `dirPath` is the Storage folder holding model.json and its weight shards,
  // e.g. 'models/inceptionv3_tfjs'.
  async _loadModelFromPath(dirPath) {
    const modelJsonUrl = await this._storageUrl(`${dirPath}/model.json`);

    const modelJsonResponse = await fetch(modelJsonUrl);
    if (!modelJsonResponse.ok) {
      throw new Error(`HTTP ${modelJsonResponse.status} fetching model.json`);
    }
    const modelJson = await modelJsonResponse.json();

    this._patchKeras3Topology(modelJson.modelTopology);
    this._patchKeras3Weights(modelJson.weightsManifest);

    const weightsManifest = modelJson.weightsManifest || [];
    const weightBuffers = [];

    for (const group of weightsManifest) {
      for (const path of group.paths) {
        const url = await this._storageUrl(`${dirPath}/${path}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${path}`);
        weightBuffers.push(await res.arrayBuffer());
      }
    }

    const totalBytes = weightBuffers.reduce((n, b) => n + b.byteLength, 0);
    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const buf of weightBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return tf.loadLayersModel(tf.io.fromMemory({
      modelTopology: modelJson.modelTopology,
      weightSpecs: weightsManifest.flatMap(g => g.weights),
      weightData: combined.buffer,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
    }));
  }

  async loadModel() {
    if (this.isInceptionV3Loaded && this.isBertLoaded) return;

    await this.initializeTensorFlow();

    try {
      // InceptionV3 is the only image classifier used for predictions.
      if (!this.isInceptionV3Loaded) {
        try {
          console.log('Loading InceptionV3 model...');
          this.inceptionV3Model = await this._loadModelFromPath('models/inceptionv3_tfjs');
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

      const size = this.inputSize;

      // Read the picked/captured image as base64 and decode the JPEG bytes.
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: EncodingType?.Base64 || 'base64',
      });
      console.log('Image read successfully, length:', imgB64.length);

      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const rawImageData = new Uint8Array(imgBuffer);

      // decodeJpeg (tfjs-react-native) returns an [h, w, 3] int32 RGB tensor,
      // so there is no alpha channel to strip. Resize to the model's 299x299
      // input and normalize to [-1, 1] for InceptionV3.
      return tf.tidy(() => {
        const pixels = decodeJpeg(rawImageData);
        const resized = tf.image.resizeBilinear(pixels, [size, size]);
        const normalized = resized.div(127.5).sub(1.0); // [0,255] -> [-1,1]
        const batched = normalized.expandDims(0);
        console.log('Preprocessed image tensor:', batched.shape);
        return batched;
      });
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
    if (!this.isInceptionV3Loaded) {
      await this.loadModel();
    }

    try {
      console.log('Preprocessing image...');
      const preprocessedImage = await this.preprocessImage(imageUri);

      console.log('Running InceptionV3 model inference...');

      // InceptionV3 is the only image classifier. Build predictions in class
      // order so they can be combined with the text scores by index.
      let inceptionByClass;
      if (this.inceptionV3Model) {
        const inceptionOutput = this.inceptionV3Model.predict(preprocessedImage);
        const inceptionData = await inceptionOutput.data();
        inceptionByClass = this.speciesLabels.map((species, index) => ({
          class: index,
          species: species,
          confidence: inceptionData[index],
          confidencePercentage: (inceptionData[index] * 100).toFixed(2)
        }));
        inceptionOutput.dispose();
      } else {
        // Mock predictions if model not loaded
        inceptionByClass = this.speciesLabels.map((species, index) => {
          const randomConfidence = Math.random();
          return {
            class: index,
            species: species,
            confidence: randomConfidence,
            confidencePercentage: (randomConfidence * 100).toFixed(2)
          };
        });
      }

      const inceptionV3Predictions = inceptionByClass
        .slice()
        .sort((a, b) => b.confidence - a.confidence);
      const inceptionV3TopPrediction = inceptionV3Predictions[0];

      // Process text description with BERT (keyword-based)
      console.log('Processing text description...');
      const textScores = this.processTextDescription(textDescription);
      const hasTextInput = textScores !== null;

      // Combine InceptionV3 predictions with text scores
      const combinedPredictions = this.combineModelPredictions(inceptionByClass, textScores, 0.3);
      const combinedTopPrediction = combinedPredictions[0];
      const combinedAccuracy = parseFloat(combinedTopPrediction.confidencePercentage).toFixed(2);

      console.log('Predictions complete');
      console.log('InceptionV3 Model:', inceptionV3TopPrediction);
      console.log('Combined Accuracy:', combinedAccuracy);
      if (hasTextInput) {
        console.log('Text processing active - BERT confidence included');
      }

      // Clean up tensors to prevent memory leaks
      preprocessedImage.dispose();

      return {
        // Combined results - this is the final prediction
        combinedAccuracy: combinedAccuracy,
        combinedTopPrediction: combinedTopPrediction,
        predictedSpecies: combinedTopPrediction.species,
        bestModel: 'InceptionV3',
        bertConfidence: hasTextInput ? (textScores[combinedTopPrediction.species] * 100).toFixed(2) : null,

        // Primary results mirror InceptionV3 (the single classifier in use)
        topPrediction: inceptionV3TopPrediction,
        allPredictions: inceptionV3Predictions.slice(0, 3),
        primaryModelAccuracy: inceptionV3TopPrediction.confidencePercentage,

        // InceptionV3 model results
        inceptionV3TopPrediction: inceptionV3TopPrediction,
        inceptionV3AllPredictions: inceptionV3Predictions.slice(0, 3),
        inceptionV3ModelAccuracy: inceptionV3TopPrediction.confidencePercentage,

        // VGG19 is no longer used
        vgg19TopPrediction: null,
        vgg19AllPredictions: [],
        vgg19ModelAccuracy: null,

        // Metadata
        modelsUsed: {
          inceptionV3: !!this.inceptionV3Model,
          bert: this.isBertLoaded && hasTextInput
        },
        hasTextDescription: hasTextInput,
        note: this.inceptionV3Model ? 'Using InceptionV3 TensorFlow.js model' : 'Using mock predictions - model not loaded'
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
