from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./rental.db"
    site_url: str = "http://localhost:5500"
    api_public_url: str = "http://localhost:8000"
    payment_instructions: str = (
        "Для оплаты напишите в Telegram @soulmate_travel_georgia или переведите на реквизиты, "
        "которые мы пришлём после подтверждения заказа."
    )
    default_currency: str = "₾"
    cors_origins: str = "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080"
    admin_api_key: str = "change-me-in-production"
    telegram_bot_token: str = ""
    admin_telegram_ids: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def admin_telegram_id_list(self) -> list[int]:
        ids: list[int] = []
        for part in self.admin_telegram_ids.split(","):
            part = part.strip()
            if part.isdigit():
                ids.append(int(part))
        return ids


settings = Settings()
