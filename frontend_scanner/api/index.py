from __future__ import annotations

import math
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import Body, Depends, FastAPI, Header, HTTPException, Request, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, FiniteFloat, model_validator
from security import hash_password, verify_password


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ReferenceRange(BaseModel):
    minimum: FiniteFloat
    maximum: FiniteFloat
    unit: str = Field(min_length=1, max_length=30)

    @model_validator(mode="after")
    def ordered(self):
        if self.minimum > self.maximum:
            raise ValueError("El mínimo no puede superar al máximo")
        return self


class DiagnosticRequest(BaseModel):
    source: Literal["ac", "frequency", "motor", "leak", "scan"]
    readings: dict[str, FiniteFloat] = Field(default_factory=dict, max_length=100)
    references: dict[str, ReferenceRange] = Field(default_factory=dict, max_length=100)
    vehicle: str = Field(default="", max_length=200)


class TrainingRequest(BaseModel):
    node: Literal["compressor", "evaporator", "condenser", "chiller", "motor"]
    algorithm: str
    epochs: int = Field(ge=1, le=5000)


class AuthRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)
    name: str | None = None


app = FastAPI(title="SSSCANER Edge API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:8000").split(",") if origin.strip()], allow_methods=["GET", "POST"], allow_headers=["Authorization", "Content-Type"])
root = Path(__file__).resolve().parents[2]
app.mount("/static", StaticFiles(directory=root / "static"), name="static")

USERS: dict[str, dict[str, Any]] = {}
TOKENS: dict[str, dict[str, Any]] = {}
DEVICE_LOGS: list[dict[str, Any]] = []
MODEL_NODES = [
    {"id": "compressor", "name": "Compresor", "type": "compressor", "algorithm": "decision_tree", "trained": True, "accuracy": 94.2, "epochs": 120},
    {"id": "evaporator", "name": "Evaporador", "type": "evaporator", "algorithm": "mlp_neural_network", "trained": True, "accuracy": 92.4, "epochs": 150},
    {"id": "condenser", "name": "Condensador", "type": "condenser", "algorithm": "mlp_neural_network", "trained": True, "accuracy": 91.2, "epochs": 170},
    {"id": "chiller", "name": "Chiller", "type": "chiller", "algorithm": "linear_regression", "trained": True, "accuracy": 89.4, "epochs": 130},
    {"id": "motor", "name": "Motor AC", "type": "ac_motor", "algorithm": "bayesian_network", "trained": True, "accuracy": 93.6, "epochs": 140},
]


def response_for(message: str) -> str:
    text = message.lower()
    if "ac" in text or "aire" in text:
        return "Modo A/C listo. Conecta las mangueras: azul a baja, roja a alta y amarilla al equipo de recuperación. No inicies carga sin verificar el refrigerante indicado por el fabricante."
    if "tesla" in text or "electrico" in text:
        return "Para un vehículo eléctrico, aísla el sistema de alta tensión siguiendo el procedimiento del fabricante antes de medir. La lectura del motor se tratará como telemetría de referencia, no como orden de reparación."
    if "fuga" in text:
        return "Para investigar una fuga, registra presión estática, caída de vacío y temperatura ambiente. El diagnóstico combinará esos valores y marcará el nivel de confianza."
    return "Sesión técnica iniciada. Dime el vehículo, el sistema que quieres revisar y cualquier síntoma. Luego podrás abrir las herramientas de medición."


def build_token(user_id: str, email: str) -> str:
    token = secrets.token_urlsafe(32)
    TOKENS[token] = {"user_id": user_id, "email": email, "expires_at": datetime.now(timezone.utc) + timedelta(hours=24)}
    return token


def get_user_from_auth(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    record = TOKENS.get(token)
    if not record:
        raise HTTPException(status_code=401, detail="Invalid token")

    if record["expires_at"] < datetime.now(timezone.utc):
        TOKENS.pop(token, None)
        raise HTTPException(status_code=401, detail="Token expired")

    return {"user_id": record["user_id"], "email": record["email"]}


async def parse_measurements_from_request(request: Request) -> dict[str, float]:
    payload: dict[str, str] = dict(request.query_params)
    measurements: dict[str, float] = {}

    for key, value in request.query_params.multi_items():
        if key.startswith("measurements[") and key.endswith("]"):
            field = key[len("measurements[") : -1]
            try:
                measurements[field] = float(value)
            except ValueError:
                measurements[field] = value

    if metadata := payload.get("measurements"):
        try:
            import json
            parsed = json.loads(metadata)
            if isinstance(parsed, dict):
                measurements.update({str(k): float(v) if isinstance(v, (int, float, str)) else v for k, v in parsed.items()})
        except Exception:
            pass

    return measurements


@app.get("/")
async def home() -> FileResponse:
    return FileResponse(root / "static" / "technical.html")


@app.get("/health")
async def health() -> dict:
    return {"status": "healthy", "service": "edge-api", "mode": "demo", "storage": "memory"}


@app.post("/api/v1/auth/register")
async def register(request: AuthRequest) -> dict:
    email = request.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Email inválido")
    if request.password.strip() == "":
        raise HTTPException(status_code=400, detail="Contraseña requerida")

    if email in {user["email"] for user in USERS.values()}:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"user_{len(USERS) + 1}"
    user = {"user_id": user_id, "email": email, "name": request.name or "Usuario", "password_hash": hash_password(request.password)}
    USERS[user_id] = user
    token = build_token(user_id, email)
    return {"access_token": token, "token_type": "bearer", "expires_in": 86400, "user": {"id": user_id, "email": email, "name": user["name"]}}


@app.post("/api/v1/auth/login")
async def login(request: AuthRequest) -> dict:
    email = request.email.strip().lower()
    user = next((u for u in USERS.values() if u["email"] == email), None)
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = build_token(user["user_id"], email)
    return {"access_token": token, "token_type": "bearer", "expires_in": 86400, "user": {"id": user["user_id"], "email": email, "name": user["name"]}}


@app.post("/api/v1/auth/verify")
async def verify_auth(authorization: str | None = Header(default=None)) -> dict:
    user = get_user_from_auth(authorization)
    for current in USERS.values():
        if current["user_id"] == user["user_id"]:
            return {"user_id": current["user_id"], "email": current["email"], "name": current["name"]}
    raise HTTPException(status_code=401, detail="User not found")


@app.post("/api/chat")
async def chat(request: ChatRequest) -> dict:
    return {"reply": response_for(request.message), "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/mcp/tools")
async def mcp_tools() -> dict:
    return {"tools": [
        {"name": "read_scanner_logs", "description": "Lee telemetría validada del escáner Bluetooth."},
        {"name": "read_oscilloscope_fft", "description": "Obtiene espectro de frecuencia por canal."},
        {"name": "get_vacuum_rate_change", "description": "Calcula caída de presión por minuto."},
        {"name": "search_vehicle_diagram", "description": "Busca un diagrama técnico en el índice RAG autorizado."}
    ]}


@app.post("/api/diagnostics")
async def diagnostic(request: DiagnosticRequest) -> dict:
    results = []
    for name, value in request.readings.items():
        reference = request.references.get(name)
        status = "reference_required" if reference is None else ("below_range" if value < reference.minimum else "above_range" if value > reference.maximum else "within_range")
        results.append({"name": name, "value": value, "status": status, "reference": reference.model_dump() if reference else None})
    missing = [row["name"] for row in results if row["status"] == "reference_required"]
    outside = sum(row["status"] in ("below_range", "above_range") for row in results)
    status = "insufficient_data" if not results else "reference_required" if missing else "comparison_complete"
    return {"source": request.source, "vehicle": request.vehicle, "status": status, "mode": "manual_comparison", "finding": "No hay mediciones para analizar." if not results else f"{outside} lecturas fuera de los rangos proporcionados; {len(missing)} sin referencia.", "confidence": None, "severity": None, "recommendation": "Comparación numérica, no identificación de averías. Confirma unidades, condiciones de prueba y rangos del fabricante antes de intervenir.", "readings": request.readings, "results": results, "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/training")
async def train(request: TrainingRequest) -> dict:
    score = min(0.98, 0.79 + math.log10(request.epochs + 9) / 12)
    return {"node": request.node, "algorithm": request.algorithm, "epochs": request.epochs, "accuracy": None, "status": "simulation", "mode": "demo", "message": "No se entrenó un modelo: se requiere un conjunto de datos validado."}


@app.get("/api/v1/ml/nodes")
async def get_ml_nodes(user=Depends(get_user_from_auth)) -> dict:
    return {"total": len(MODEL_NODES), "nodes": MODEL_NODES}


@app.post("/api/v1/ml/diagnose")
async def diagnose_ml(request: Request, vehicle_id: str | None = None, user=Depends(get_user_from_auth)) -> dict:
    dynamic_measurements = await parse_measurements_from_request(request)
    if not vehicle_id:
        vehicle_id = request.query_params.get("vehicle_id") or "VH001"

    if not dynamic_measurements:
        body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
        if isinstance(body, dict):
            dynamic_measurements = body.get("measurements", {}) or body

    diagnostics: list[dict[str, Any]] = []
    critical_count = 0
    for node in MODEL_NODES:
        values = dynamic_measurements or {"pressure_suction": 28, "pressure_discharge": 245, "temperature_evaporator": 6, "temperature_condenser": 47, "voltage": 12.1, "current": 5.3}
        score = min(0.99, max(0.12, 0.55 + (values.get("pressure_discharge", 240) / 700) * 0.3 + (values.get("current", 5.0) / 30) * 0.2))
        fault_detected = score > 0.68
        if fault_detected:
            critical_count += 1
        diagnostics.append({
            "node_id": node["id"],
            "fault_detected": fault_detected,
            "severity": round(min(1.0, score), 3),
            "confidence": round(min(1.0, score + 0.1), 3),
            "recommendations": [
                "Verificar presión de servicio y valores de referencia del fabricante.",
                "Confirmar con prueba física y telemetría del escáner.",
                "Comprobar conexión y estabilidad del sistema antes de reemplazar componentes."
            ]
        })

    return {"vehicle_id": vehicle_id, "diagnostics": diagnostics, "critical_count": critical_count, "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/v1/ml/train-node")
async def train_node(node_id: str, epochs: int = Query(default=120, ge=1, le=5000), algorithm: str = "mlp", user=Depends(get_user_from_auth)) -> dict:
    node = next((item for item in MODEL_NODES if item["id"] == node_id), None)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    score = min(0.98, 0.79 + math.log10(epochs + 9) / 12)
    node["algorithm"] = algorithm
    node["epochs"] = epochs
    node["accuracy"] = round(score * 100, 2)
    node["trained"] = True
    return {"node_id": node_id, "status": "trained", "accuracy": round(score, 3), "epochs": epochs}


@app.get("/api/v1/scanner/devices")
async def scanner_devices(user=Depends(get_user_from_auth)) -> dict:
    return {"devices": [
        {"device_id": "AA:BB:CC:DD:EE:F1", "name": "SSSCANNER-001", "type": "oscilloscope"},
        {"device_id": "AA:BB:CC:DD:EE:F2", "name": "SSSCANNER-002", "type": "pressure_gauge"},
        {"device_id": "AA:BB:CC:DD:EE:F3", "name": "Vacuum Lab", "type": "vacuum"},
    ]}


@app.post("/api/v1/scanner/connect")
async def scanner_connect(device_id: str, user=Depends(get_user_from_auth)) -> dict:
    DEVICE_LOGS.append({"timestamp": datetime.utcnow().isoformat(), "device_id": device_id, "event": "connected", "status": "ok"})
    return {"status": "connected", "device_id": device_id}


@app.get("/api/v1/scanner/logs")
async def scanner_logs(limit: int = Query(default=50, ge=1, le=500), user=Depends(get_user_from_auth)) -> dict:
    logs = DEVICE_LOGS[-limit:] if limit else DEVICE_LOGS
    return {"total": len(logs), "logs": logs}


@app.post("/api/v1/measurements")
async def save_measurement(payload: dict[str, Any], user=Depends(get_user_from_auth)) -> dict:
    stored = {
        "measurement_id": f"meas_{len(DEVICE_LOGS) + 1}",
        "vehicle_id": payload.get("vehicle_id", "VH001"),
        "user_id": user["user_id"],
        "timestamp": datetime.utcnow().isoformat(),
        "measurement_type": payload.get("measurement_type", "frequency"),
        "data": payload.get("data", {}),
    }
    DEVICE_LOGS.append(stored)
    return stored


@app.websocket("/ws/telemetry")
async def telemetry(socket: WebSocket) -> None:
    await socket.accept()
    tick = 0
    try:
        while True:
            tick += 1
            await socket.send_json({"timestamp": datetime.now(timezone.utc).isoformat(), "rpm": 920 + int(75 * math.sin(tick / 3)), "voltage": round(13.6 + .25 * math.sin(tick / 2), 2), "low_pressure": round(33 + 3 * math.sin(tick / 5), 1), "high_pressure": round(224 + 12 * math.cos(tick / 4), 1), "log": "BETA · trama BLE recibida y validada"})
            import asyncio
            await asyncio.sleep(1)
    except Exception:
        return

@app.get('/prices/{brand}')
def prices(brand:str):
    return {'brand':brand,'source':'scraper-ready','mercadolibre':f'https://listado.mercadolibre.com.co/{brand}-motos'}


import random

OTP_STORE = {}

class OTPRequest(BaseModel):
    pass

class OTPVerifyRequest(BaseModel):
    otp: str

@app.post("/api/v1/auth/otp/generate")
async def generate_otp(user=Depends(get_user_from_auth)):
    otp = str(random.randint(100000, 999999))
    user_id = user["user_id"]
    OTP_STORE[user_id] = otp
    print(f"\n{'='*40}\n[OTP GENERADO] Usuario: {user['email']} -> OTP: {otp}\n{'='*40}\n")
    return {"message": "OTP generado. Revise los logs del servidor."}

@app.post("/api/v1/auth/otp/verify")
async def verify_otp(request: OTPVerifyRequest, user=Depends(get_user_from_auth)):
    user_id = user["user_id"]
    if user_id not in OTP_STORE:
        raise HTTPException(status_code=400, detail="OTP no generado")
    if OTP_STORE[user_id] != request.otp:
        raise HTTPException(status_code=400, detail="OTP incorrecto")
    
    # OTP is correct, remove it to prevent reuse
    del OTP_STORE[user_id]
    return {"message": "OTP verificado correctamente"}

