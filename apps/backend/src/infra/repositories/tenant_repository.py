"""
Tenant repository for Firestore.
"""

from typing import Optional

from src.infra.firestore_repository import FirestoreRepository


class TenantRepository(FirestoreRepository):
    """Repository for tenants collection."""

    def __init__(self):
        super().__init__("tenants")

    async def get_by_slug(self, slug: str) -> Optional[dict]:
        """Get tenant by slug."""
        return await self.get_by_field("slug", slug)

    async def create_tenant(
        self,
        name: str,
        slug: str,
        logo_url: Optional[str] = None,
        street: Optional[str] = None,
        number: Optional[str] = None,
        complement: Optional[str] = None,
        neighborhood: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        postal_code: Optional[str] = None,
        phone: Optional[str] = None,
        email: Optional[str] = None,
    ) -> dict:
        """Create a new tenant (church)."""
        data = {
            "name": name,
            "slug": slug,
            "logo_url": logo_url,
            "street": street,
            "number": number,
            "complement": complement,
            "neighborhood": neighborhood,
            "city": city,
            "state": state,
            "postal_code": postal_code,
            "country": "Brasil",
            "phone": phone,
            "email": email,
            "latitude": None,
            "longitude": None,
            "is_public": True,
            "config": {},
        }
        return await self.create(data)

    async def update_address(
        self,
        tenant_id: str,
        street: Optional[str] = None,
        number: Optional[str] = None,
        complement: Optional[str] = None,
        neighborhood: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        postal_code: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> Optional[dict]:
        """Update tenant address."""
        data = {}
        if street is not None:
            data["street"] = street
        if number is not None:
            data["number"] = number
        if complement is not None:
            data["complement"] = complement
        if neighborhood is not None:
            data["neighborhood"] = neighborhood
        if city is not None:
            data["city"] = city
        if state is not None:
            data["state"] = state
        if postal_code is not None:
            data["postal_code"] = postal_code
        if latitude is not None:
            data["latitude"] = latitude
        if longitude is not None:
            data["longitude"] = longitude
        
        if data:
            return await self.update(tenant_id, data)
        return await self.get(tenant_id)


# Singleton instance
tenant_repository = TenantRepository()
