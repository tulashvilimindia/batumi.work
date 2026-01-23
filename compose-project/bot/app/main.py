"""Georgia JobBoard Telegram Bot.

Provides job search, subscription, and notification features via Telegram.

Commands:
- /start - Welcome message + language selection
- /search <keyword> - Search jobs
- /subscribe - Subscribe to categories
- /unsubscribe - Manage subscriptions
- /latest - Show latest jobs
- /help - Show help message
"""
import os
import asyncio
import httpx
import structlog
from datetime import datetime, timedelta
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
)
from telegram.constants import ParseMode

from app.database import (
    init_db,
    get_user_language,
    set_user_language,
    get_user_subscriptions,
    add_subscription,
    remove_subscription,
)

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
# HTTP is intentional - internal Docker network communication (no TLS needed)
API_URL = os.getenv("API_URL", "http://api:8000")  # NOSONAR - internal Docker network
WEB_URL = os.getenv("WEB_URL", "https://batumi.work")

# Translations
TEXTS = {
    "ge": {
        "welcome": "გამარჯობა! 👋\n\nეს არის Georgia JobBoard ბოტი.\n\nბრძანებები:\n/search <სიტყვა> - ვაკანსიების ძიება\n/subscribe - გამოწერა\n/latest - ახალი ვაკანსიები\n/help - დახმარება",
        "choose_language": "აირჩიეთ ენა / Choose language:",
        "language_set": "ენა დაყენებულია: ქართული 🇬🇪",
        "search_usage": "გთხოვთ მიუთითოთ საძიებო სიტყვა\nმაგალითი: /search პროგრამისტი",
        "no_results": "ვაკანსიები ვერ მოიძებნა 😔",
        "found_jobs": "🔍 ნაპოვნია {total} ვაკანსია:",
        "view": "ნახვა",
        "choose_category": "აირჩიეთ კატეგორია გამოსაწერად:",
        "subscribed": "✅ გამოწერილია: {category}",
        "unsubscribed": "❌ გამოწერა გაუქმდა: {category}",
        "your_subscriptions": "თქვენი გამოწერები:",
        "no_subscriptions": "გამოწერები არ გაქვთ",
        "click_to_unsubscribe": "დააჭირეთ გასაუქმებლად:",
        "latest_jobs": "📋 უახლესი ვაკანსიები:",
        "salary_available": "💰",
        "help": "ბრძანებები:\n/search <სიტყვა> - ვაკანსიების ძიება\n/subscribe - კატეგორიის გამოწერა\n/unsubscribe - გამოწერის გაუქმება\n/latest - უახლესი ვაკანსიები",
        "error": "შეცდომა მოხდა. სცადეთ მოგვიანებით.",
    },
    "en": {
        "welcome": "Hello! 👋\n\nThis is the Georgia JobBoard bot.\n\nCommands:\n/search <keyword> - Search jobs\n/subscribe - Subscribe to categories\n/latest - Latest jobs\n/help - Help",
        "choose_language": "აირჩიეთ ენა / Choose language:",
        "language_set": "Language set: English 🇬🇧",
        "search_usage": "Please provide a search keyword\nExample: /search developer",
        "no_results": "No jobs found 😔",
        "found_jobs": "🔍 Found {total} jobs:",
        "view": "View",
        "choose_category": "Choose a category to subscribe:",
        "subscribed": "✅ Subscribed: {category}",
        "unsubscribed": "❌ Unsubscribed: {category}",
        "your_subscriptions": "Your subscriptions:",
        "no_subscriptions": "You have no subscriptions",
        "click_to_unsubscribe": "Click to unsubscribe:",
        "latest_jobs": "📋 Latest jobs:",
        "salary_available": "💰",
        "help": "Commands:\n/search <keyword> - Search jobs\n/subscribe - Subscribe to category\n/unsubscribe - Manage subscriptions\n/latest - Latest jobs",
        "error": "An error occurred. Please try again later.",
    },
}


def t(key: str, lang: str = "ge", **kwargs) -> str:
    """Get translated text."""
    text = TEXTS.get(lang, TEXTS["ge"]).get(key, key)
    return text.format(**kwargs) if kwargs else text


async def get_lang(user_id: int) -> str:
    """Get user's language preference."""
    return await get_user_language(user_id) or "ge"


# Command Handlers

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    keyboard = [
        [InlineKeyboardButton("🇬🇪 ქართული", callback_data="lang_ge")],
        [InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        t("choose_language"),
        reply_markup=reply_markup,
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command."""
    user_id = update.effective_user.id
    lang = await get_lang(user_id)
    await update.message.reply_text(t("help", lang))


async def search_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /search command."""
    user_id = update.effective_user.id
    lang = await get_lang(user_id)

    query = " ".join(context.args) if context.args else ""
    if not query:
        await update.message.reply_text(t("search_usage", lang))
        return

    logger.info("search_command", user_id=user_id, query=query)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{API_URL}/api/v1/jobs",
                params={"q": query, "page_size": 5},
            )
            data = response.json()

        if not data.get("items"):
            await update.message.reply_text(t("no_results", lang))
            return

        message = t("found_jobs", lang, total=data["total"]) + "\n\n"

        for job in data["items"][:5]:
            title = job.get("title_en" if lang == "en" else "title_ge", job.get("title_ge", ""))
            company = job.get("company_name", "")
            job_url = f"{WEB_URL}/{lang}/job.html?id={job['id']}"

            message += f"💼 *{title}*\n"
            if company:
                message += f"🏢 {company}\n"
            if job.get("has_salary"):
                message += f"{t('salary_available', lang)} "
            message += f"[{t('view', lang)}]({job_url})\n\n"

        await update.message.reply_text(message, parse_mode=ParseMode.MARKDOWN)

    except Exception as e:
        logger.error("search_error", error=str(e))
        await update.message.reply_text(t("error", lang))


async def latest_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /latest command."""
    user_id = update.effective_user.id
    lang = await get_lang(user_id)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{API_URL}/api/v1/jobs",
                params={"page_size": 5, "sort_by": "created_at", "sort_order": "desc"},
            )
            data = response.json()

        if not data.get("items"):
            await update.message.reply_text(t("no_results", lang))
            return

        message = t("latest_jobs", lang) + "\n\n"

        for job in data["items"][:5]:
            title = job.get("title_en" if lang == "en" else "title_ge", job.get("title_ge", ""))
            company = job.get("company_name", "")
            job_url = f"{WEB_URL}/{lang}/job.html?id={job['id']}"

            message += f"💼 *{title}*\n"
            if company:
                message += f"🏢 {company}\n"
            if job.get("has_salary"):
                message += f"{t('salary_available', lang)} "
            message += f"[{t('view', lang)}]({job_url})\n\n"

        await update.message.reply_text(message, parse_mode=ParseMode.MARKDOWN)

    except Exception as e:
        logger.error("latest_error", error=str(e))
        await update.message.reply_text(t("error", lang))


async def subscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /subscribe command."""
    user_id = update.effective_user.id
    lang = await get_lang(user_id)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{API_URL}/api/v1/categories")
            categories = response.json()

        keyboard = []
        for cat in categories[:10]:
            name = cat.get("name_en" if lang == "en" else "name_ge", cat.get("name_ge", ""))
            keyboard.append([InlineKeyboardButton(name, callback_data=f"sub_{cat['slug']}")])

        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(t("choose_category", lang), reply_markup=reply_markup)

    except Exception as e:
        logger.error("subscribe_error", error=str(e))
        await update.message.reply_text(t("error", lang))


async def unsubscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /unsubscribe command."""
    user_id = update.effective_user.id
    lang = await get_lang(user_id)

    subscriptions = await get_user_subscriptions(user_id)

    if not subscriptions:
        await update.message.reply_text(t("no_subscriptions", lang))
        return

    message = t("your_subscriptions", lang) + "\n" + t("click_to_unsubscribe", lang)
    keyboard = []
    for sub in subscriptions:
        keyboard.append([InlineKeyboardButton(f"❌ {sub['category_name']}", callback_data=f"unsub_{sub['category_slug']}")])

    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(message, reply_markup=reply_markup)


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button callbacks."""
    query = update.callback_query
    await query.answer()

    user_id = update.effective_user.id
    data = query.data

    if data.startswith("lang_"):
        lang = data.split("_")[1]
        await set_user_language(user_id, lang)
        await query.edit_message_text(t("language_set", lang) + "\n\n" + t("welcome", lang))

    elif data.startswith("sub_"):
        category_slug = data.split("_")[1]
        lang = await get_lang(user_id)

        # Get category name
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{API_URL}/api/v1/categories")
                categories = response.json()

            category_name = next(
                (c.get("name_en" if lang == "en" else "name_ge", c.get("name_ge", ""))
                 for c in categories if c["slug"] == category_slug),
                category_slug
            )

            await add_subscription(user_id, category_slug, category_name)
            await query.edit_message_text(t("subscribed", lang, category=category_name))
            logger.info("subscription_added", user_id=user_id, category=category_slug)

        except Exception as e:
            logger.error("subscribe_callback_error", error=str(e))
            await query.edit_message_text(t("error", lang))

    elif data.startswith("unsub_"):
        category_slug = data.split("_")[1]
        lang = await get_lang(user_id)

        await remove_subscription(user_id, category_slug)
        await query.edit_message_text(t("unsubscribed", lang, category=category_slug))
        logger.info("subscription_removed", user_id=user_id, category=category_slug)


async def send_daily_digest(application: Application):
    """Send daily digest to all subscribers.

    This function is called by the scheduler daily.
    """
    logger.info("daily_digest_started")

    try:
        # Get all users with subscriptions
        from app.database import get_all_subscriptions

        subscriptions = await get_all_subscriptions()
        users_sent = 0
        errors = 0

        for user_id, user_subs in subscriptions.items():
            try:
                lang = await get_lang(user_id)
                categories = [s["category_slug"] for s in user_subs]

                # Fetch new jobs from last 24h for subscribed categories
                async with httpx.AsyncClient(timeout=10.0) as client:
                    jobs = []
                    for cat_slug in categories:
                        response = await client.get(
                            f"{API_URL}/api/v1/jobs",
                            params={
                                "category": cat_slug,
                                "page_size": 3,
                                "sort_by": "created_at",
                                "sort_order": "desc",
                            },
                        )
                        data = response.json()
                        jobs.extend(data.get("items", []))

                if not jobs:
                    continue

                # Build message
                message = "📬 *Daily Job Digest*\n\n" if lang == "en" else "📬 *ყოველდღიური დაიჯესტი*\n\n"

                for job in jobs[:5]:
                    title = job.get("title_en" if lang == "en" else "title_ge", job.get("title_ge", ""))
                    company = job.get("company_name", "")
                    job_url = f"{WEB_URL}/{lang}/job.html?id={job['id']}"

                    message += f"💼 *{title}*\n"
                    if company:
                        message += f"🏢 {company}\n"
                    message += f"[{t('view', lang)}]({job_url})\n\n"

                await application.bot.send_message(
                    chat_id=user_id,
                    text=message,
                    parse_mode=ParseMode.MARKDOWN,
                )
                users_sent += 1

            except Exception as e:
                errors += 1
                logger.warning("digest_send_error", user_id=user_id, error=str(e))

        logger.info("daily_digest_completed", users_sent=users_sent, errors=errors)

    except Exception as e:
        logger.error("daily_digest_failed", error=str(e))


def main():
    """Run the bot."""
    if not BOT_TOKEN:
        logger.error("bot_token_missing")
        print("ERROR: TELEGRAM_BOT_TOKEN environment variable is required")
        return

    logger.info("bot_starting")

    # Initialize database
    asyncio.get_event_loop().run_until_complete(init_db())

    # Create application
    application = Application.builder().token(BOT_TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("search", search_command))
    application.add_handler(CommandHandler("latest", latest_command))
    application.add_handler(CommandHandler("subscribe", subscribe_command))
    application.add_handler(CommandHandler("unsubscribe", unsubscribe_command))
    application.add_handler(CallbackQueryHandler(button_callback))

    # Schedule daily digest (9 AM daily)
    if application.job_queue:
        application.job_queue.run_daily(
            lambda ctx: asyncio.create_task(send_daily_digest(application)),
            time=datetime.strptime("09:00", "%H:%M").time(),
        )

    logger.info("bot_started")

    # Run the bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
