from fastapi import APIRouter
from app.api.scans import router as scans_router

router = APIRouter()

# Include feature routers
router.include_router(scans_router)
