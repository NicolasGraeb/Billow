import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from database.config import engine, Base
import models.models

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

