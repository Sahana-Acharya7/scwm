import os
import io
import json
import re
import uvicorn

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from PIL import Image
from ultralytics import YOLO
from groq import Groq
from supabase import create_client

# -------------------------------------------------
# 1. CONFIGURATION
# -------------------------------------------------

load_dotenv()

# --- Supabase (HTTPS-based, no ports, no DNS issues)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
print("✅ Supabase Client Connected (HTTPS)")

# --- Groq AI
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq AI Client Connected")
    except Exception as e:
        print(f"⚠️ Groq Client Error: {e}")

# --- YOLO Model
try:
    model = YOLO("best.pt")
    print("✅ Custom YOLO Model (best.pt) Loaded")
except Exception as e:
    print(f"❌ YOLO Load Error: {e}")
    model = None

# -------------------------------------------------
# 2. FASTAPI APP
# -------------------------------------------------

app = FastAPI(title="Smart Construction Waste Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# 3. GROQ SCIENTIFIC ANALYSIS
# -------------------------------------------------

def get_recycling_insight(waste_type: str):
    if not groq_client:
        return {
            "status": "Manual Review",
            "advice": "Segregate the material and follow local recycling guidelines.",
            "fact": "Proper segregation improves recycling efficiency by 30–50%."
        }

    try:
        prompt = f"""
        Act as a Senior Material Scientist and Civil Engineer.
        Analyze the construction material: '{waste_type}'.

        Return a valid JSON object with exactly three keys:
        1. status (max 4 words)
        2. advice (50–70 words, reusable/recyclable method)
        3. fact (40–60 words with numbers on environmental impact)

        Return ONLY raw JSON.
        """

        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content.strip()

        if raw.startswith("```"):
            raw = re.sub(r"^```json|^```|```$", "", raw).strip()

        return json.loads(raw)

    except Exception as e:
        print(f"Groq Error: {e}")
        return {
            "status": "Recyclable",
            "advice": f"{waste_type} can generally be recycled after cleaning and segregation.",
            "fact": f"Recycling {waste_type} can reduce embodied carbon by 40–60%."
        }

# -------------------------------------------------
# 4. API ENDPOINTS
# -------------------------------------------------

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="YOLO model not loaded")

    # Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    # YOLO inference
    results = model(image)
    detected_class = "Unknown"
    confidence = 0.0

    if results and results[0].boxes:
        box = results[0].boxes[0]
        detected_class = model.names[int(box.cls[0])]
        confidence = float(box.conf[0])

    print(f"✅ Detected: {detected_class}")

    # Groq analysis
    insight = get_recycling_insight(detected_class)

    # Save to Supabase
    try:
        response = supabase.table("scans").insert({
            "waste_type": detected_class,
            "confidence": confidence,
            "gemini_advice": insight.get("advice")
        }).execute()

        scan_id = response.data[0]["id"]

        return {
            "scan_id": scan_id,
            "waste_type": detected_class,
            "confidence": confidence,
            "status": insight.get("status"),
            "advice": insight.get("advice"),
            "fact": insight.get("fact")
        }

    except Exception as e:
        print(f"⚠️ Supabase Insert Error: {e}")
        return {
            "waste_type": detected_class,
            "confidence": confidence,
            "status": insight.get("status"),
            "advice": insight.get("advice"),
            "fact": insight.get("fact")
        }

@app.get("/history")
def get_scan_history():
    try:
        result = supabase.table("scans") \
            .select("*") \
            .order("id", desc=True) \
            .limit(10) \
            .execute()
        return result.data
    except Exception as e:
        print(f"⚠️ History Error: {e}")
        return []

@app.get("/centers")
def get_recycling_centers():
    try:
        result = supabase.table("recycling_centers") \
            .select("name,address,latitude,longitude,contact_info") \
            .execute()
        return result.data
    except Exception as e:
        print(f"⚠️ Centers Error: {e}")
        return []

# -------------------------------------------------
# 5. RUN SERVER
# -------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
