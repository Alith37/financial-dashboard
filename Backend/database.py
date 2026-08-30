import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.financial_dashboard

users_collection = db.users
budgets_collection = db.budgets
goals_collection = db.goals