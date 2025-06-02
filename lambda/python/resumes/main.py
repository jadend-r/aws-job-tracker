from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from mangum import Mangum
import boto3
import os
from uuid import uuid4

app = FastAPI()
s3 = boto3.client("s3")
BUCKET = os.getenv("RESUME_BUCKET", "aws-job-tracker-prod-resumes")

@app.post("/upload")
async def upload_resume(job_id: str = Form(...), file: UploadFile = File(...)):
    filename = f"{job_id}/{uuid4()}_{file.filename}"
    try:
        s3.upload_fileobj(file.file, BUCKET, filename)
        return {"key": filename, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/preview")
def get_resume_preview(key: str):
    try:
        url = s3.generate_presigned_url("get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=300)
        return JSONResponse(content={"url": url})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

handler = Mangum(app)
