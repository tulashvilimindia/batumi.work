"""Seed script to populate initial data."""
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from uuid import uuid4

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.models import Category, Region, Company, Job


# Demo Categories (at least 10 as required)
CATEGORIES = [
    {"code": "it-programming", "slug": "it-programming", "name_ge": "IT და პროგრამირება", "name_en": "IT & Programming", "sort_order": 1},
    {"code": "sales-marketing", "slug": "sales-marketing", "name_ge": "გაყიდვები და მარკეტინგი", "name_en": "Sales & Marketing", "sort_order": 2},
    {"code": "finance-accounting", "slug": "finance-accounting", "name_ge": "ფინანსები და ბუღალტერია", "name_en": "Finance & Accounting", "sort_order": 3},
    {"code": "medicine-healthcare", "slug": "medicine-healthcare", "name_ge": "მედიცინა და ჯანდაცვა", "name_en": "Medicine & Healthcare", "sort_order": 4},
    {"code": "education", "slug": "education", "name_ge": "განათლება", "name_en": "Education", "sort_order": 5},
    {"code": "tourism-hospitality", "slug": "tourism-hospitality", "name_ge": "ტურიზმი და სტუმართმოყვარეობა", "name_en": "Tourism & Hospitality", "sort_order": 6},
    {"code": "construction", "slug": "construction", "name_ge": "მშენებლობა", "name_en": "Construction", "sort_order": 7},
    {"code": "logistics-transport", "slug": "logistics-transport", "name_ge": "ლოჯისტიკა და ტრანსპორტი", "name_en": "Logistics & Transport", "sort_order": 8},
    {"code": "hr-admin", "slug": "hr-admin", "name_ge": "HR და ადმინისტრაცია", "name_en": "HR & Administration", "sort_order": 9},
    {"code": "customer-service", "slug": "customer-service", "name_ge": "მომხმარებელთა მომსახურება", "name_en": "Customer Service", "sort_order": 10},
    {"code": "manufacturing", "slug": "manufacturing", "name_ge": "წარმოება", "name_en": "Manufacturing", "sort_order": 11},
    {"code": "legal", "slug": "legal", "name_ge": "იურიდიული", "name_en": "Legal", "sort_order": 12},
    {"code": "design-creative", "slug": "design-creative", "name_ge": "დიზაინი და კრეატივი", "name_en": "Design & Creative", "sort_order": 13},
    {"code": "engineering", "slug": "engineering", "name_ge": "ინჟინერია", "name_en": "Engineering", "sort_order": 14},
    {"code": "agriculture", "slug": "agriculture", "name_ge": "სოფლის მეურნეობა", "name_en": "Agriculture", "sort_order": 15},
    {"code": "other", "slug": "other", "name_ge": "სხვა", "name_en": "Other", "sort_order": 99},
]

# Georgian Regions - matching jobs.ge naming (lid values)
REGIONS = [
    # Country level
    {"slug": "georgia", "name_ge": "საქართველო", "name_en": "Georgia", "level": 1, "parent_slug": None, "sort_order": 0},
    # Region/State level - names match jobs.ge exactly
    {"slug": "tbilisi", "name_ge": "თბილისი", "name_en": "Tbilisi", "level": 2, "parent_slug": "georgia", "sort_order": 1},  # lid=1
    {"slug": "adjara", "name_ge": "აჭარის ა/რ", "name_en": "Adjara AR", "level": 2, "parent_slug": "georgia", "sort_order": 2},  # lid=14
    {"slug": "kakheti", "name_ge": "კახეთი", "name_en": "Kakheti", "level": 2, "parent_slug": "georgia", "sort_order": 3},  # lid=3
    {"slug": "mtskheta-mtianeti", "name_ge": "მცხეთა-მთიანეთი", "name_en": "Mtskheta-Mtianeti", "level": 2, "parent_slug": "georgia", "sort_order": 4},  # lid=4
    {"slug": "kvemo-kartli", "name_ge": "ქვემო ქართლი", "name_en": "Kvemo Kartli", "level": 2, "parent_slug": "georgia", "sort_order": 5},  # lid=5
    {"slug": "shida-kartli", "name_ge": "შიდა ქართლი", "name_en": "Shida Kartli", "level": 2, "parent_slug": "georgia", "sort_order": 6},  # lid=6
    {"slug": "samtskhe-javakheti", "name_ge": "სამცხე-ჯავახეთი", "name_en": "Samtskhe-Javakheti", "level": 2, "parent_slug": "georgia", "sort_order": 7},  # lid=7
    {"slug": "imereti", "name_ge": "იმერეთი", "name_en": "Imereti", "level": 2, "parent_slug": "georgia", "sort_order": 8},  # lid=8
    {"slug": "guria", "name_ge": "გურია", "name_en": "Guria", "level": 2, "parent_slug": "georgia", "sort_order": 9},  # lid=9
    {"slug": "racha-lechkhumi", "name_ge": "რაჭა-ლეჩხუმი, ქვ. სვანეთი", "name_en": "Racha-Lechkhumi", "level": 2, "parent_slug": "georgia", "sort_order": 10},  # lid=12
    {"slug": "samegrelo", "name_ge": "სამეგრელო-ზემო სვანეთი", "name_en": "Samegrelo-Zemo Svaneti", "level": 2, "parent_slug": "georgia", "sort_order": 11},  # lid=13
    {"slug": "remote", "name_ge": "დისტანციური", "name_en": "Remote", "level": 2, "parent_slug": "georgia", "sort_order": 12},  # lid=17
    # City level
    {"slug": "batumi", "name_ge": "ბათუმი", "name_en": "Batumi", "level": 3, "parent_slug": "adjara", "sort_order": 1},
    {"slug": "kutaisi", "name_ge": "ქუთაისი", "name_en": "Kutaisi", "level": 3, "parent_slug": "imereti", "sort_order": 1},
    {"slug": "rustavi", "name_ge": "რუსთავი", "name_en": "Rustavi", "level": 3, "parent_slug": "kvemo-kartli", "sort_order": 1},
    {"slug": "zugdidi", "name_ge": "ზუგდიდი", "name_en": "Zugdidi", "level": 3, "parent_slug": "samegrelo", "sort_order": 1},
    {"slug": "gori", "name_ge": "გორი", "name_en": "Gori", "level": 3, "parent_slug": "shida-kartli", "sort_order": 1},
    {"slug": "telavi", "name_ge": "თელავი", "name_en": "Telavi", "level": 3, "parent_slug": "kakheti", "sort_order": 1},
]

# Demo Jobs (at least 20 as required)
DEMO_JOBS = [
    {
        "title_ge": "Senior Python Developer",
        "title_en": "Senior Python Developer",
        "body_ge": "ვეძებთ გამოცდილ Python დეველოპერს ჩვენს გუნდში. მოთხოვნები: 5+ წლის გამოცდილება Python-ში, FastAPI/Django ცოდნა, PostgreSQL. ვთავაზობთ კონკურენტუნარიან ხელფასს და თანამედროვე სამუშაო გარემოს.",
        "body_en": "We are looking for an experienced Python developer to join our team. Requirements: 5+ years of Python experience, FastAPI/Django knowledge, PostgreSQL. We offer competitive salary and modern work environment.",
        "company_name": "TechGeorgia",
        "location": "თბილისი",
        "category_slug": "it-programming",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 4000,
        "salary_max": 6000,
        "is_vip": True,
    },
    {
        "title_ge": "Frontend React Developer",
        "title_en": "Frontend React Developer",
        "body_ge": "გამოცდილი React დეველოპერი საჭიროა სტარტაპისთვის. მოთხოვნები: React, TypeScript, REST API ინტეგრაცია. დისტანციური მუშაობა შესაძლებელია.",
        "body_en": "Experienced React developer needed for a startup. Requirements: React, TypeScript, REST API integration. Remote work possible.",
        "company_name": "StartupGE",
        "location": "თბილისი",
        "category_slug": "it-programming",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "remote_type": "hybrid",
        "has_salary": True,
        "salary_min": 3000,
        "salary_max": 5000,
    },
    {
        "title_ge": "გაყიდვების მენეჯერი",
        "title_en": "Sales Manager",
        "body_ge": "ვეძებთ ენერგიულ გაყიდვების მენეჯერს. მოთხოვნები: გაყიდვების გამოცდილება, კომუნიკაბელურობა, ინგლისური ენა. % + ფიქსირებული ხელფასი.",
        "body_en": "Looking for an energetic sales manager. Requirements: sales experience, communication skills, English language. Commission + base salary.",
        "company_name": "SalesForce Georgia",
        "location": "ბათუმი",
        "category_slug": "sales-marketing",
        "region_slug": "batumi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1500,
        "salary_max": 4000,
    },
    {
        "title_ge": "ბუღალტერი",
        "title_en": "Accountant",
        "body_ge": "საჭიროა გამოცდილი ბუღალტერი. მოთხოვნები: ფინანსური განათლება, RS.ge-ს ცოდნა, 3+ წლის გამოცდილება.",
        "body_en": "Experienced accountant needed. Requirements: finance education, RS.ge knowledge, 3+ years of experience.",
        "company_name": "FinanceGroup",
        "location": "თბილისი",
        "category_slug": "finance-accounting",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 2000,
        "salary_max": 3000,
    },
    {
        "title_ge": "ინგლისური ენის მასწავლებელი",
        "title_en": "English Teacher",
        "body_ge": "ინგლისური ენის მასწავლებელი საჭიროა კერძო სკოლისთვის. მოთხოვნები: პედაგოგიური გამოცდილება, ინგლისურის მაღალი დონე.",
        "body_en": "English teacher needed for private school. Requirements: teaching experience, high level of English.",
        "company_name": "Elite School",
        "location": "ქუთაისი",
        "category_slug": "education",
        "region_slug": "kutaisi",
        "employment_type": "full_time",
        "has_salary": False,
    },
    {
        "title_ge": "მარკეტინგის სპეციალისტი",
        "title_en": "Marketing Specialist",
        "body_ge": "ციფრული მარკეტინგის სპეციალისტი საჭიროა. SMM, SEO, Google Ads ცოდნა აუცილებელია.",
        "body_en": "Digital marketing specialist needed. SMM, SEO, Google Ads knowledge required.",
        "company_name": "Digital Agency",
        "location": "თბილისი",
        "category_slug": "sales-marketing",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 2500,
        "salary_max": 3500,
    },
    {
        "title_ge": "სასტუმროს ადმინისტრატორი",
        "title_en": "Hotel Administrator",
        "body_ge": "5 ვარსკვლავიანი სასტუმრო ეძებს ადმინისტრატორს. ინგლისური და რუსული აუცილებელია.",
        "body_en": "5-star hotel seeking administrator. English and Russian required.",
        "company_name": "Grand Hotel Batumi",
        "location": "ბათუმი",
        "category_slug": "tourism-hospitality",
        "region_slug": "batumi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1500,
        "salary_max": 2000,
    },
    {
        "title_ge": "მშენებელი-პროექტის მენეჯერი",
        "title_en": "Construction Project Manager",
        "body_ge": "მშენებლობის პროექტის მენეჯერი საჭიროა დიდი კომპანიისთვის. AutoCAD და სამშენებლო გამოცდილება აუცილებელია.",
        "body_en": "Construction project manager needed for large company. AutoCAD and construction experience required.",
        "company_name": "BuildGeorgia",
        "location": "თბილისი",
        "category_slug": "construction",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 3500,
        "salary_max": 5000,
    },
    {
        "title_ge": "მძღოლი",
        "title_en": "Driver",
        "body_ge": "კატეგორია B მძღოლი საჭიროა სატვირთო კომპანიისთვის. ლოგისტიკის გამოცდილება პლუსია.",
        "body_en": "Category B driver needed for logistics company. Logistics experience is a plus.",
        "company_name": "TransGeorgia",
        "location": "რუსთავი",
        "category_slug": "logistics-transport",
        "region_slug": "rustavi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1200,
        "salary_max": 1800,
    },
    {
        "title_ge": "HR მენეჯერი",
        "title_en": "HR Manager",
        "body_ge": "HR მენეჯერი საჭიროა საშუალო ზომის კომპანიისთვის. რეკრუტინგის და პერსონალის მართვის გამოცდილება.",
        "body_en": "HR Manager needed for mid-sized company. Recruiting and personnel management experience.",
        "company_name": "HRplus",
        "location": "თბილისი",
        "category_slug": "hr-admin",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 2500,
        "salary_max": 3500,
    },
    {
        "title_ge": "Call Center ოპერატორი",
        "title_en": "Call Center Operator",
        "body_ge": "კოლ-ცენტრის ოპერატორი საჭიროა. ორენოვანი (ქართული/ინგლისური). სრული დატვირთვა.",
        "body_en": "Call center operator needed. Bilingual (Georgian/English). Full-time position.",
        "company_name": "ServiceCall",
        "location": "თბილისი",
        "category_slug": "customer-service",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1000,
        "salary_max": 1500,
    },
    {
        "title_ge": "ექიმი-თერაპევტი",
        "title_en": "General Practitioner",
        "body_ge": "თერაპევტი საჭიროა კერძო კლინიკისთვის. სამედიცინო ლიცენზია აუცილებელია.",
        "body_en": "General practitioner needed for private clinic. Medical license required.",
        "company_name": "MedPlus Clinic",
        "location": "თბილისი",
        "category_slug": "medicine-healthcare",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 3000,
        "salary_max": 5000,
    },
    {
        "title_ge": "გრაფიკული დიზაინერი",
        "title_en": "Graphic Designer",
        "body_ge": "კრეატიული დიზაინერი საჭიროა სარეკლამო სააგენტოსთვის. Adobe CC პაკეტის ცოდნა.",
        "body_en": "Creative designer needed for advertising agency. Adobe CC knowledge required.",
        "company_name": "CreativeStudio",
        "location": "თბილისი",
        "category_slug": "design-creative",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1800,
        "salary_max": 2800,
    },
    {
        "title_ge": "იურისტი",
        "title_en": "Lawyer",
        "body_ge": "კორპორატიული იურისტი საჭიროა. კომერციული სამართლის გამოცდილება აუცილებელია.",
        "body_en": "Corporate lawyer needed. Commercial law experience required.",
        "company_name": "LegalPro",
        "location": "თბილისი",
        "category_slug": "legal",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 3000,
        "salary_max": 5000,
    },
    {
        "title_ge": "მექანიკური ინჟინერი",
        "title_en": "Mechanical Engineer",
        "body_ge": "მექანიკური ინჟინერი საჭიროა საწარმოსთვის. SolidWorks, AutoCAD.",
        "body_en": "Mechanical engineer needed for manufacturing plant. SolidWorks, AutoCAD.",
        "company_name": "IndustrialGE",
        "location": "რუსთავი",
        "category_slug": "engineering",
        "region_slug": "rustavi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 2500,
        "salary_max": 4000,
    },
    {
        "title_ge": "აგრონომი",
        "title_en": "Agronomist",
        "body_ge": "აგრონომი საჭიროა თანამედროვე ფერმისთვის კახეთში.",
        "body_en": "Agronomist needed for modern farm in Kakheti.",
        "company_name": "GreenFarm",
        "location": "თელავი",
        "category_slug": "agriculture",
        "region_slug": "telavi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1500,
        "salary_max": 2500,
    },
    {
        "title_ge": "DevOps ინჟინერი",
        "title_en": "DevOps Engineer",
        "body_ge": "DevOps ინჟინერი საჭიროა ტექნოლოგიურ კომპანიაში. AWS, Docker, Kubernetes.",
        "body_en": "DevOps engineer needed for tech company. AWS, Docker, Kubernetes.",
        "company_name": "CloudTech",
        "location": "თბილისი",
        "category_slug": "it-programming",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "remote_type": "remote",
        "has_salary": True,
        "salary_min": 4500,
        "salary_max": 7000,
        "is_vip": True,
    },
    {
        "title_ge": "შეფ-მზარეული",
        "title_en": "Head Chef",
        "body_ge": "შეფ-მზარეული საჭიროა ახალ რესტორანში ბათუმში. საერთაშორისო გამოცდილება პრიორიტეტია.",
        "body_en": "Head chef needed for new restaurant in Batumi. International experience is a priority.",
        "company_name": "SeaView Restaurant",
        "location": "ბათუმი",
        "category_slug": "tourism-hospitality",
        "region_slug": "batumi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 2500,
        "salary_max": 4000,
    },
    {
        "title_ge": "ოფის მენეჯერი",
        "title_en": "Office Manager",
        "body_ge": "ოფის მენეჯერი საჭიროა საერთაშორისო კომპანიის წარმომადგენლობისთვის.",
        "body_en": "Office manager needed for international company representation.",
        "company_name": "GlobalCorp",
        "location": "თბილისი",
        "category_slug": "hr-admin",
        "region_slug": "tbilisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 2000,
        "salary_max": 3000,
    },
    {
        "title_ge": "ელექტრიკოსი",
        "title_en": "Electrician",
        "body_ge": "გამოცდილი ელექტრიკოსი საჭიროა სამშენებლო კომპანიისთვის.",
        "body_en": "Experienced electrician needed for construction company.",
        "company_name": "ElectroBuild",
        "location": "ქუთაისი",
        "category_slug": "construction",
        "region_slug": "kutaisi",
        "employment_type": "full_time",
        "has_salary": True,
        "salary_min": 1500,
        "salary_max": 2500,
    },
]


async def seed_database():
    """Seed the database with initial data."""
    print("Connecting to database...")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Check if already seeded
        result = await session.execute(select(Category).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping...")
            return

        print("Seeding categories...")
        category_map = {}
        for cat_data in CATEGORIES:
            category = Category(**cat_data, is_active=True)
            session.add(category)
            await session.flush()
            category_map[cat_data["slug"]] = category.id
        await session.commit()
        print(f"  Created {len(CATEGORIES)} categories")

        print("Seeding regions...")
        region_map = {}
        # First pass: create all regions without parents
        for reg_data in REGIONS:
            data = {k: v for k, v in reg_data.items() if k != "parent_slug"}
            region = Region(**data, is_active=True)
            session.add(region)
            await session.flush()
            region_map[reg_data["slug"]] = region.id
        await session.commit()

        # Second pass: set parent relationships
        for reg_data in REGIONS:
            if reg_data.get("parent_slug"):
                region = await session.get(Region, region_map[reg_data["slug"]])
                region.parent_id = region_map[reg_data["parent_slug"]]
        await session.commit()
        print(f"  Created {len(REGIONS)} regions")

        print("Seeding jobs...")
        now = datetime.now(timezone.utc)
        for i, job_data in enumerate(DEMO_JOBS):
            # Extract category and region slugs
            category_slug = job_data.pop("category_slug")
            region_slug = job_data.pop("region_slug", None)

            job = Job(
                **job_data,
                category_id=category_map[category_slug],
                region_id=region_map.get(region_slug) if region_slug else None,
                status="active",
                parsed_from="manual",
                published_at=now - timedelta(days=i % 30),  # Spread over last 30 days
                deadline_at=now + timedelta(days=30 + i),  # Deadlines 30+ days from now
                first_seen_at=now,
                last_seen_at=now,
            )
            session.add(job)

        await session.commit()
        print(f"  Created {len(DEMO_JOBS)} jobs")

    print("Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
