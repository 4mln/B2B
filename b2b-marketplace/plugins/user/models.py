# Import the new User model from app.models.user
# This creates a circular import, so we'll handle it differently
import sys
from app.db.base import Base

# Import User model dynamically to avoid circular imports
def get_user_model():
    from app.models.user import User
    return User

# For backward compatibility, we'll create a proxy
class User:
    def __new__(cls, *args, **kwargs):
        UserModel = get_user_model()
        return UserModel(*args, **kwargs)
    
    @classmethod
    def __getattr__(cls, name):
        UserModel = get_user_model()
        return getattr(UserModel, name)
