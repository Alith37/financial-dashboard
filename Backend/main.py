import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from database import budgets_collection, users_collection
from auth import create_access_token, hash_password, verify_password
from schemas import UserBudgetSchema, UserCredentials

app = FastAPI(title="PetroTech Financial Dashboard API")

# Configure CORS for local development and the deployed frontend.
frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_origin_regex=r"https://financial-dashboard(?:-[a-z0-9-]+)?\.vercel\.app|https?://(?:localhost|127\.0\.0\.1)(?::\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


async def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    try:
        import jwt
        from auth import ALGORITHM, SECRET_KEY

        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise ValueError("Missing token subject")
        return username
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

@app.get("/")
async def root():
    return {"status": "online", "message": "PetroTech API is running"}


@app.post("/api/auth/register")
async def register(credentials: UserCredentials):
    if await users_collection.find_one({"username": credentials.username}):
        raise HTTPException(status_code=409, detail="Username already exists")
    await users_collection.insert_one(
        {"username": credentials.username, "password": hash_password(credentials.password)}
    )
    return {"access_token": create_access_token({"sub": credentials.username}), "token_type": "bearer"}


@app.post("/api/auth/login")
async def login(credentials: UserCredentials):
    user = await users_collection.find_one({"username": credentials.username})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": create_access_token({"sub": credentials.username}), "token_type": "bearer"}


@app.get("/api/budget/{user_id}")
async def get_budget(user_id: str, username: str = Depends(current_user)):
    if user_id != username:
        raise HTTPException(status_code=403, detail="Not allowed to access this budget")
    try:
        # Fetch user document from MongoDB
        budget_doc = await budgets_collection.find_one({"user_id": user_id})

        # If user does not exist yet, return fresh default schema
        if not budget_doc:
            return UserBudgetSchema(user_id=user_id).model_dump()

        # Strip MongoDB BSON ObjectId to prevent serialization errors
        budget_doc.pop("_id", None)

        # Merge database record with default schema so missing keys don't break old documents
        default_data = UserBudgetSchema(user_id=user_id).model_dump()
        default_data.update(budget_doc)

        # Validate and return cleaned data dictionary
        return UserBudgetSchema(**default_data).model_dump()

    except Exception as e:
        print(f"Error fetching budget for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/budget/save")
async def save_budget(data: UserBudgetSchema, username: str = Depends(current_user)):
    if data.user_id != username:
        raise HTTPException(status_code=403, detail="Not allowed to modify this budget")
    try:
        budget_dict = data.model_dump()

        # Update existing record or insert new record (upsert)
        await budgets_collection.update_one(
            {"user_id": data.user_id},
            {"$set": budget_dict},
            upsert=True
        )

        return {
            "status": "success",
            "message": "Dashboard data saved successfully",
            "user_id": data.user_id
        }

    except Exception as e:
        print(f"Error saving budget data: {e}")
        raise HTTPException(status_code=500, detail=str(e))