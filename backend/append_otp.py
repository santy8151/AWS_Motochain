import sys

with open(sys.argv[1], 'a', encoding='utf-8') as f:
    f.write("""
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
    print(f"\\n{'='*40}\\n[OTP GENERADO] Usuario: {user['email']} -> OTP: {otp}\\n{'='*40}\\n")
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

""")
