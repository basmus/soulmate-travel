import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class BotSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    telegram_bot_token: str = ""
    admin_telegram_ids: str = ""
    api_url: str = "http://localhost:8000"
    admin_api_key: str = "change-me-in-production"
    site_url: str = "http://localhost:5500"

    @property
    def admin_ids(self) -> list[int]:
        ids: list[int] = []
        for part in self.admin_telegram_ids.split(","):
            part = part.strip()
            if part.isdigit():
                ids.append(int(part))
        return ids


settings = BotSettings()
