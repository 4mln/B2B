from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
from plugins.gamification.schemas import BadgeTypeEnum

# -----------------------------
# Badge table
# -----------------------------
class Badge(Base):
    __tablename__ = "badges"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(Enum(BadgeTypeEnum), default=BadgeTypeEnum.CUSTOM)
    points_required = Column(Integer, default=0)
    icon_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------------------
# UserBadge table (association)
# -----------------------------
class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = {"extend_existing": True}

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    new_user_id = Column(UUID, ForeignKey("users_new.id"), nullable=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), primary_key=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    badge = relationship("Badge")

# -----------------------------
# UserPoints table
# -----------------------------
class UserPoints(Base):
    __tablename__ = "user_points"
    __table_args__ = {"extend_existing": True}

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    new_user_id = Column(UUID, ForeignKey("users_new.id"), nullable=True)
    points = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    # New relationship to unified User model
    new_user = relationship("User", foreign_keys=[new_user_id])