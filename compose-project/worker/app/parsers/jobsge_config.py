"""jobs.ge parser configuration - categories and regions mapping.

This file contains the mapping between jobs.ge filter IDs and our internal slugs.
The parser uses these mappings to iterate through all region/category combinations.
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class CategoryConfig:
    """jobs.ge category configuration."""
    cid: int                    # jobs.ge category ID (cid parameter)
    name_ge: str               # Georgian name
    name_en: str               # English name
    our_slug: str              # Our internal category slug


@dataclass
class RegionConfig:
    """jobs.ge region configuration."""
    lid: int                    # jobs.ge location ID (lid parameter)
    name_ge: str               # Georgian name
    name_en: str               # English name
    our_slug: str              # Our internal region slug
    priority: int              # Parse order (1 = first)
    enabled: bool = True       # Whether to parse this region


# =============================================================================
# CATEGORY MAPPING: jobs.ge cid → our category slug
# =============================================================================
JOBSGE_CATEGORIES: List[CategoryConfig] = [
    CategoryConfig(
        cid=1,
        name_ge="ადმინისტრაცია/მენეჯმენტი",
        name_en="Administration/Management",
        our_slug="hr-admin"
    ),
    CategoryConfig(
        cid=2,
        name_ge="გაყიდვები",
        name_en="Sales",
        our_slug="sales-marketing"
    ),
    CategoryConfig(
        cid=3,
        name_ge="ფინანსები/სტატისტიკა",
        name_en="Finance/Statistics",
        our_slug="finance-accounting"
    ),
    CategoryConfig(
        cid=4,
        name_ge="PR/მარკეტინგი",
        name_en="PR/Marketing",
        our_slug="sales-marketing"
    ),
    CategoryConfig(
        cid=5,
        name_ge="ლოგისტიკა/ტრანსპორტი/დისტრიბუცია",
        name_en="Logistics/Transport/Distribution",
        our_slug="logistics-transport"
    ),
    CategoryConfig(
        cid=6,
        name_ge="IT/პროგრამირება",
        name_en="IT/Programming",
        our_slug="it-programming"
    ),
    CategoryConfig(
        cid=7,
        name_ge="სამართალი",
        name_en="Law",
        our_slug="legal"
    ),
    CategoryConfig(
        cid=8,
        name_ge="მედიცინა/ფარმაცია",
        name_en="Medicine/Pharmacy",
        our_slug="medicine-healthcare"
    ),
    CategoryConfig(
        cid=9,
        name_ge="სხვა",
        name_en="Other",
        our_slug="other"
    ),
    CategoryConfig(
        cid=10,
        name_ge="კვება",
        name_en="Food/Catering",
        our_slug="tourism-hospitality"
    ),
    CategoryConfig(
        cid=11,
        name_ge="მშენებლობა/რემონტი",
        name_en="Construction/Repair",
        our_slug="construction"
    ),
    CategoryConfig(
        cid=12,
        name_ge="განათლება",
        name_en="Education",
        our_slug="education"
    ),
    CategoryConfig(
        cid=13,
        name_ge="მედია/გამომცემლობა",
        name_en="Media/Publishing",
        our_slug="media-journalism"
    ),
    CategoryConfig(
        cid=14,
        name_ge="სილამაზე/მოდა",
        name_en="Beauty/Fashion",
        our_slug="design-creative"
    ),
    CategoryConfig(
        cid=16,
        name_ge="დასუფთავება",
        name_en="Cleaning",
        our_slug="cleaning"
    ),
    CategoryConfig(
        cid=17,
        name_ge="დაცვა/უსაფრთხოება",
        name_en="Security/Safety",
        our_slug="security"
    ),
    CategoryConfig(
        cid=18,
        name_ge="ზოგადი ტექნიკური პერსონალი",
        name_en="General Technical Staff",
        our_slug="manufacturing"
    ),
]


# =============================================================================
# REGION MAPPING: jobs.ge lid → our region slug
# =============================================================================
JOBSGE_REGIONS: List[RegionConfig] = [
    RegionConfig(
        lid=14,
        name_ge="აჭარის ა/რ",
        name_en="Adjara AR",
        our_slug="adjara",
        priority=1,
        enabled=True
    ),
    RegionConfig(
        lid=1,
        name_ge="თბილისი",
        name_en="Tbilisi",
        our_slug="tbilisi",
        priority=2,
        enabled=True
    ),
    RegionConfig(
        lid=8,
        name_ge="იმერეთი",
        name_en="Imereti",
        our_slug="imereti",
        priority=3,
        enabled=True
    ),
    RegionConfig(
        lid=3,
        name_ge="კახეთი",
        name_en="Kakheti",
        our_slug="kakheti",
        priority=4,
        enabled=True
    ),
    RegionConfig(
        lid=5,
        name_ge="ქვემო ქართლი",
        name_en="Kvemo Kartli",
        our_slug="kvemo-kartli",
        priority=5,
        enabled=True
    ),
    RegionConfig(
        lid=6,
        name_ge="შიდა ქართლი",
        name_en="Shida Kartli",
        our_slug="shida-kartli",
        priority=6,
        enabled=True
    ),
    RegionConfig(
        lid=9,
        name_ge="გურია",
        name_en="Guria",
        our_slug="guria",
        priority=7,
        enabled=True
    ),
    RegionConfig(
        lid=7,
        name_ge="სამცხე-ჯავახეთი",
        name_en="Samtskhe-Javakheti",
        our_slug="samtskhe-javakheti",
        priority=8,
        enabled=True
    ),
    RegionConfig(
        lid=4,
        name_ge="მცხეთა-მთიანეთი",
        name_en="Mtskheta-Mtianeti",
        our_slug="mtskheta-mtianeti",
        priority=9,
        enabled=True
    ),
    RegionConfig(
        lid=13,
        name_ge="სამეგრელო-ზემო სვანეთი",
        name_en="Samegrelo-Zemo Svaneti",
        our_slug="samegrelo",
        priority=10,
        enabled=True
    ),
    RegionConfig(
        lid=12,
        name_ge="რაჭა-ლეჩხუმი, ქვ. სვანეთი",
        name_en="Racha-Lechkhumi",
        our_slug="racha-lechkhumi",
        priority=11,
        enabled=True
    ),
    RegionConfig(
        lid=15,
        name_ge="აფხაზეთის ა/რ",
        name_en="Abkhazia AR",
        our_slug="abkhazia",
        priority=12,
        enabled=False  # Disabled - no jobs typically
    ),
    RegionConfig(
        lid=16,
        name_ge="უცხოეთი",
        name_en="Abroad",
        our_slug="abroad",
        priority=13,
        enabled=False  # Disabled - outside Georgia
    ),
    RegionConfig(
        lid=17,
        name_ge="დისტანციური",
        name_en="Remote",
        our_slug="remote",
        priority=14,
        enabled=True
    ),
]


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_category_by_cid(cid: int) -> Optional[CategoryConfig]:
    """Get category config by jobs.ge cid.

    Args:
        cid: jobs.ge category ID

    Returns:
        CategoryConfig or None if not found
    """
    for cat in JOBSGE_CATEGORIES:
        if cat.cid == cid:
            return cat
    return None


def get_region_by_lid(lid: int) -> Optional[RegionConfig]:
    """Get region config by jobs.ge lid.

    Args:
        lid: jobs.ge location ID

    Returns:
        RegionConfig or None if not found
    """
    for reg in JOBSGE_REGIONS:
        if reg.lid == lid:
            return reg
    return None


def get_enabled_regions() -> List[RegionConfig]:
    """Get list of enabled regions sorted by priority.

    Returns:
        List of enabled RegionConfig sorted by priority
    """
    return sorted(
        [r for r in JOBSGE_REGIONS if r.enabled],
        key=lambda r: r.priority
    )


def get_all_categories() -> List[CategoryConfig]:
    """Get all category configurations.

    Returns:
        List of all CategoryConfig
    """
    return JOBSGE_CATEGORIES.copy()


def get_category_slug_by_cid(cid: int) -> str:
    """Get our category slug by jobs.ge cid.

    Args:
        cid: jobs.ge category ID

    Returns:
        Our category slug, or "other" if not found
    """
    cat = get_category_by_cid(cid)
    return cat.our_slug if cat else "other"


def get_region_slug_by_lid(lid: int) -> Optional[str]:
    """Get our region slug by jobs.ge lid.

    Args:
        lid: jobs.ge location ID

    Returns:
        Our region slug or None if not found
    """
    reg = get_region_by_lid(lid)
    return reg.our_slug if reg else None


# =============================================================================
# REVERSE MAPPINGS (for lookup by our slug)
# =============================================================================

def get_region_by_slug(slug: str) -> Optional[RegionConfig]:
    """Get region config by our slug.

    Args:
        slug: Our internal region slug

    Returns:
        RegionConfig or None if not found
    """
    for reg in JOBSGE_REGIONS:
        if reg.our_slug == slug:
            return reg
    return None


def get_regions_by_slugs(slugs: List[str]) -> List[RegionConfig]:
    """Get multiple region configs by their slugs.

    Args:
        slugs: List of our internal region slugs

    Returns:
        List of matching RegionConfig (preserves order, skips not found)
    """
    result = []
    for slug in slugs:
        reg = get_region_by_slug(slug)
        if reg:
            result.append(reg)
    return result
