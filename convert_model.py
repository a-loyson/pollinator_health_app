#!/usr/bin/env python3
"""
Script to convert Keras .h5 models to TensorFlow.js format
This allows the models to be loaded in React Native with TensorFlow.js

Usage:
    python convert_model.py

Requirements:
    pip install tensorflowjs tensorflow
"""

import tensorflowjs as tfjs
import tensorflow as tf
import os

def convert_single_model(h5_path, output_path, model_name):
    """Convert a single .h5 model to TensorFlow.js format"""
    
    if not os.path.exists(h5_path):
        print(f"⚠️  Warning: {model_name} file not found at {h5_path}")
        print(f"   Skipping {model_name} conversion")
        return False
    
    try:
        print(f"\n{'=' * 60}")
        print(f"Converting {model_name}")
        print(f"{'=' * 60}")
        print(f"Loading Keras model from {h5_path}...")
        model = tf.keras.models.load_model(h5_path)
        
        print("Model loaded successfully!")
        print(f"Model summary:")
        model.summary()
        
        print(f"\nConverting to TensorFlow.js format...")
        print(f"Output directory: {output_path}")
        
        # Convert the model
        tfjs.converters.save_keras_model(model, output_path)
        
        print(f"\n✅ {model_name} conversion successful!")
        print(f"Model files saved to: {output_path}/")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error converting {model_name}: {str(e)}")
        return False

def convert_all_models():
    """Convert all available models"""
    
    models_to_convert = [
        {
            'name': 'InceptionV3',
            'h5_path': './inceptionv3.h5',
            'output_path': './inceptionv3_tfjs'
        },
        {
            'name': 'VGG19',
            'h5_path': './vgg19_weight.h5',
            'output_path': './vgg19_tfjs'
        }
    ]
    
    results = {}
    
    for model_config in models_to_convert:
        success = convert_single_model(
            model_config['h5_path'],
            model_config['output_path'],
            model_config['name']
        )
        results[model_config['name']] = success
    
    return results

if __name__ == "__main__":
    print("=" * 60)
    print("Model Converter - Keras .h5 to TensorFlow.js")
    print("=" * 60)
    print("\nThis script will convert the following models:")
    print("1. InceptionV3 (inceptionv3.h5)")
    print("2. VGG19 (vgg19_weight.h5)")
    print()
    
    results = convert_all_models()
    
    print("\n" + "=" * 60)
    print("CONVERSION SUMMARY")
    print("=" * 60)
    
    for model_name, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{model_name}: {status}")
    
    print("\n" + "=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print("\n1. Update modelService.js to load the converted models:")
    print("   - InceptionV3: tf.loadLayersModel('./inceptionv3_tfjs/model.json')")
    print("   - VGG19: tf.loadLayersModel('./vgg19_tfjs/model.json')")
    print("\n2. For production, host the model files on a server:")
    print("   - Upload inceptionv3_tfjs/ and vgg19_tfjs/ folders")
    print("   - Load via URL: tf.loadLayersModel('https://your-server.com/model.json')")
    print("\n3. See MODEL_INTEGRATION.md for detailed instructions")
    
    if not all(results.values()):
        print("\n⚠️  Some models failed to convert. Check the errors above.")
        exit(1)
    else:
        print("\n✅ All models converted successfully!")
        exit(0)
