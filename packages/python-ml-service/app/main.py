import os
import asyncio
import uvicorn
import structlog
import logging
import sys
from .server.http_server import create_app

logger = structlog.get_logger()

HTTP_PORT = int(os.getenv("HTTP_PORT", "5000"))

def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    
    # Set all loggers to at least INFO level
    for logger_name in logging.root.manager.loggerDict:
        logger_obj = logging.getLogger(logger_name)
        logger_obj.setLevel(logging.INFO)

def get_app():
    return create_app()

async def start_server():
    configure_logging()
    logger.info(f"Starting server on port {HTTP_PORT}")
    
    try:
        app = get_app()
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=HTTP_PORT,
            log_level="info"
        )
        
        server = uvicorn.Server(config)
        await server.serve()
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        sys.exit(1)

def main():
    logger.info("Starting Python ML service", http_port=HTTP_PORT)
    asyncio.run(start_server())

if __name__ == "__main__":
    main()
