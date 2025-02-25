from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ..services.pdf_service import PDFService

def create_app() -> FastAPI:
    app = FastAPI()
    pdf_service = PDFService()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    @app.post("/parse-pdf")
    async def parse_pdf(file: UploadFile):
        if not file.filename.endswith('.pdf'):
            raise HTTPException(400, "File must be a PDF")
        
        content = await file.read()
        text = await pdf_service.extract_text(content)
        
        return {
            "text": text
        }

    return app
