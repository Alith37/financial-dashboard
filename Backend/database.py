import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")
if not MONGO_URI:
	raise RuntimeError("MONGO_URI is not configured")

client = AsyncIOMotorClient(MONGO_URI)
db = client.financial_dashboard

users_collection = db.users
budgets_collection = db.budgets
goals_collection = db.goals