#!/usr/bin/env python3
"""
Test AI image generation with a realistic learning material image
"""
import requests
import base64
from PIL import Image, ImageDraw, ImageFont
import io

BASE_URL = "https://dupe-app.preview.emergentagent.com/api"

def create_learning_material_image():
    """Create a realistic learning material image with text"""
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()
    
    # Add title
    draw.text((20, 20), "Rechnungswesen - Bilanz", fill='black', font=font_title)
    
    # Add underline
    draw.line([(20, 45), (380, 45)], fill='black', width=2)
    
    # Add learning content text
    content = [
        "Die Bilanz zeigt die finanzielle Lage eines",
        "Unternehmens zu einem bestimmten Zeitpunkt.",
        "",
        "Aktiven (Vermögen):",
        "- Umlaufvermögen (Kasse, Bank, Debitoren)",
        "- Anlagevermögen (Maschinen, Gebäude)",
        "",
        "Passiven (Kapital):",
        "- Fremdkapital (Kreditoren, Darlehen)",
        "- Eigenkapital",
        "",
        "Bilanzgleichung: Aktiven = Passiven"
    ]
    
    y = 60
    for line in content:
        draw.text((30, y), line, fill='black', font=font_text)
        y += 20
    
    # Add a simple diagram box
    draw.rectangle([250, 100, 370, 200], outline='blue', width=2)
    draw.text((260, 110), "Aktiven", fill='blue', font=font_text)
    draw.text((260, 130), "= Passiven", fill='blue', font=font_text)
    
    # Convert to base64 JPEG
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    b64 = base64.b64encode(buffer.read()).decode('utf-8')
    print(f"Image size: {len(b64)} bytes")
    return b64

print("Testing AI generation with realistic learning material image...")
image_b64 = create_learning_material_image()

payload = {
    "subject_name": "Rechnungswesen",
    "count": 2,
    "image_base64": image_b64
}

try:
    print("Sending request (this may take 20-30 seconds)...")
    resp = requests.post(f"{BASE_URL}/ai/generate-questions", json=payload, timeout=45)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Success! Generated {len(data.get('questions', []))} questions")
        for i, q in enumerate(data.get('questions', []), 1):
            print(f"\nQuestion {i}:")
            print(f"  Type: {q.get('type')}")
            print(f"  Question: {q.get('question')[:80]}...")
            print(f"  Options: {len(q.get('options', []))} options")
    else:
        print(f"❌ Error: {resp.text[:500]}")
except Exception as e:
    print(f"❌ Exception: {e}")
