import os
import asyncio
import uvicorn
import structlog
from .server.http_server import create_app

logger = structlog.get_logger()

HTTP_PORT = int(os.getenv("HTTP_PORT", "5000"))

async def start_server():
    app = create_app()
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=HTTP_PORT,
        log_level="info"
    )
    server = uvicorn.Server(config)
    await server.serve()

def main():
    logger.info("Starting service", http_port=HTTP_PORT)
    asyncio.run(start_server())

if __name__ == "__main__":
    main()
