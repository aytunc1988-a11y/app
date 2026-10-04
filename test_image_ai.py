#!/usr/bin/env python3
"""
Test AI image generation with a smaller image
"""
import requests
import base64
from PIL import Image, ImageDraw
import io

BASE_URL = "https://dupe-app.preview.emergentagent.com/api"

def create_small_test_image():
    """Create a small 100x100 test image with real visual features"""
    img = Image.new('RGB', (100, 100), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add simple shapes for visual features
    draw.rectangle([10, 10, 90, 90], outline='black', width=2)
    draw.ellipse([30, 30, 70, 70], fill='blue', outline='red', width=1)
    draw.line([0, 0, 100, 100], fill='green', width=1)
    
    # Convert to base64 JPEG with lower quality
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=60)
    buffer.seek(0)
    b64 = base64.b64encode(buffer.read()).decode('utf-8')
    print(f"Image size: {len(b64)} bytes")
    return b64

print("Testing AI generation with small image...")
image_b64 = create_small_test_image()

payload = {
    "subject_name": "Deutsch",
    "count": 2,
    "image_base64": image_b64
}

try:
    print("Sending request (this may take 20-30 seconds)...")
    resp = requests.post(f"{BASE_URL}/ai/generate-questions", json=payload, timeout=45)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Success! Generated {len(data.get('questions', []))} questions")
        print(f"Response: {data}")
    else:
        print(f"Error: {resp.text[:500]}")
except Exception as e:
    print(f"Exception: {e}")
