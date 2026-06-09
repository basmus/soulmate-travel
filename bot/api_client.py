from datetime import date

import httpx

from config import settings


class ApiClient:
    def __init__(self):
        self.base = settings.api_url.rstrip("/")
        self.headers = {"X-Admin-Key": settings.admin_api_key}

    async def get_equipment(self) -> list[dict]:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{self.base}/equipment")
            r.raise_for_status()
            return r.json()

    async def get_availability(self, equipment_id: int, year: int, month: int) -> dict:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{self.base}/availability",
                params={"equipment_id": equipment_id, "year": year, "month": month},
            )
            r.raise_for_status()
            return r.json()

    async def preview_order(self, payload: dict) -> dict:
        async with httpx.AsyncClient() as client:
            r = await client.post(f"{self.base}/orders/preview", json=payload)
            if r.status_code >= 400:
                detail = r.json().get("detail", r.text)
                raise ValueError(detail)
            return r.json()

    async def create_order(self, payload: dict) -> dict:
        async with httpx.AsyncClient() as client:
            r = await client.post(f"{self.base}/orders", json=payload)
            if r.status_code >= 400:
                detail = r.json().get("detail", r.text)
                raise ValueError(detail)
            return r.json()

    async def get_orders_by_telegram(self, user_id: int) -> list[dict]:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{self.base}/orders/by-telegram/{user_id}")
            r.raise_for_status()
            return r.json()

    async def admin_list_orders(self, status: str | None = None) -> list[dict]:
        params = {}
        if status:
            params["status"] = status
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{self.base}/orders/admin/list", params=params, headers=self.headers)
            r.raise_for_status()
            return r.json()

    async def admin_update_status(self, order_id: int, status: str) -> dict:
        async with httpx.AsyncClient() as client:
            r = await client.patch(
                f"{self.base}/orders/id/{order_id}/status",
                json={"status": status},
                headers=self.headers,
            )
            r.raise_for_status()
            return r.json()

    async def admin_list_equipment(self) -> list[dict]:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{self.base}/admin/equipment", headers=self.headers)
            r.raise_for_status()
            return r.json()

    async def admin_update_equipment(self, equipment_id: int, data: dict) -> dict:
        async with httpx.AsyncClient() as client:
            r = await client.patch(
                f"{self.base}/admin/equipment/{equipment_id}",
                json=data,
                headers=self.headers,
            )
            r.raise_for_status()
            return r.json()


api = ApiClient()
