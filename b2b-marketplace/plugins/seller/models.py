from dataclasses import dataclass


@dataclass
class Seller:
    id: int
    user_id: int
    name: str = ""

