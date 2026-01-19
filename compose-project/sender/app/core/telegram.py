"""Telegram API client using httpx."""
from typing import Optional
import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class TelegramClient:
    """Async Telegram Bot API client."""

    BASE_URL = "https://api.telegram.org"

    def __init__(self, token: Optional[str] = None, channel_id: Optional[str] = None):
        self.token = token or settings.TELEGRAM_BOT_TOKEN
        self.channel_id = channel_id or settings.TELEGRAM_CHANNEL_ID
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(timeout=30.0)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._client:
            await self._client.aclose()

    @property
    def api_url(self) -> str:
        return f"{self.BASE_URL}/bot{self.token}"

    async def send_message(
        self,
        text: str,
        chat_id: Optional[str] = None,
        parse_mode: str = "HTML",
        disable_web_page_preview: bool = False,
    ) -> dict:
        """Send a message to the channel."""
        if not self._client:
            raise RuntimeError("Client not initialized. Use async context manager.")

        url = f"{self.api_url}/sendMessage"
        payload = {
            "chat_id": chat_id or self.channel_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": disable_web_page_preview,
        }

        logger.debug("sending_telegram_message", chat_id=payload["chat_id"])

        response = await self._client.post(url, data=payload)
        result = response.json()

        if not result.get("ok"):
            error_desc = result.get("description", "Unknown error")
            logger.error(
                "telegram_api_error",
                error=error_desc,
                error_code=result.get("error_code"),
            )
            raise TelegramAPIError(error_desc, result.get("error_code"))

        logger.info(
            "message_sent",
            message_id=result["result"]["message_id"],
            chat_id=payload["chat_id"],
        )

        return result["result"]

    async def delete_message(
        self, message_id: int, chat_id: Optional[str] = None
    ) -> bool:
        """Delete a message from the channel."""
        if not self._client:
            raise RuntimeError("Client not initialized. Use async context manager.")

        url = f"{self.api_url}/deleteMessage"
        payload = {
            "chat_id": chat_id or self.channel_id,
            "message_id": message_id,
        }

        response = await self._client.post(url, data=payload)
        result = response.json()

        if not result.get("ok"):
            logger.warning(
                "delete_message_failed",
                message_id=message_id,
                error=result.get("description"),
            )
            return False

        logger.info("message_deleted", message_id=message_id)
        return True

    async def get_me(self) -> dict:
        """Get bot information."""
        if not self._client:
            raise RuntimeError("Client not initialized. Use async context manager.")

        url = f"{self.api_url}/getMe"
        response = await self._client.get(url)
        result = response.json()

        if not result.get("ok"):
            raise TelegramAPIError(result.get("description", "Unknown error"))

        return result["result"]


class TelegramAPIError(Exception):
    """Telegram API error."""

    def __init__(self, message: str, error_code: Optional[int] = None):
        self.message = message
        self.error_code = error_code
        super().__init__(message)
