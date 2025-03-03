import io
import structlog
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
from pdfminer.pdfparser import PDFSyntaxError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = structlog.get_logger(__name__)

class PDFException(Exception):
    """Base exception for PDF processing errors"""
    pass

class PDFService:
    def __init__(self):
        self.logger = logger.bind(service="PDFService")
        self.laparams = LAParams(
            line_overlap=0.5,
            char_margin=2.0,
            line_margin=0.5,
            word_margin=0.1,
            boxes_flow=0.5,
            detect_vertical=True,
            all_texts=True
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((PDFSyntaxError, PDFException))
    )
    async def extract_text(self, content: bytes) -> str:
        try:
            pdf_file = io.BytesIO(content)
            text = extract_text(
                pdf_file,
                codec='utf-8',
                laparams=self.laparams
            )
            
            if not text.strip():
                raise PDFException("No text content extracted from PDF")
                
            return text.strip()

        except PDFSyntaxError as e:
            self.logger.error("PDF syntax error", error=str(e))
            raise PDFException(f"Invalid PDF structure: {str(e)}")
        except Exception as e:
            self.logger.error("Unexpected error during PDF extraction", error=str(e))
            raise PDFException(f"Failed to process PDF: {str(e)}")
