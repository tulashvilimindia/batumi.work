# jobs.ge Categories and Filters Reference

This document provides a complete mapping of jobs.ge filter parameters to our internal system.

## URL Format

```
Base URL: https://jobs.ge/ge/

Parameters:
  - cid: Category ID (1-18)
  - lid: Location/Region ID (1-17)
  - page: Page number (1, 2, 3...)
  - q: Search query (optional)

Examples:
  IT jobs in Adjara:        https://jobs.ge/ge/?cid=6&lid=14
  Sales jobs in Tbilisi:    https://jobs.ge/ge/?cid=2&lid=1
  IT jobs in Adjara page 2: https://jobs.ge/ge/?cid=6&lid=14&page=2
```

## Category IDs (cid)

| cid | Georgian Name | English Name | Our Slug |
|-----|---------------|--------------|----------|
| 1 | ადმინისტრაცია/მენეჯმენტი | Administration/Management | `hr-admin` |
| 2 | გაყიდვები | Sales | `sales-marketing` |
| 3 | ფინანსები/სტატისტიკა | Finance/Statistics | `finance-accounting` |
| 4 | PR/მარკეტინგი | PR/Marketing | `sales-marketing` |
| 5 | ლოგისტიკა/ტრანსპორტი/დისტრიბუცია | Logistics/Transport | `logistics-transport` |
| 6 | IT/პროგრამირება | IT/Programming | `it-programming` |
| 7 | სამართალი | Law | `legal` |
| 8 | მედიცინა/ფარმაცია | Medicine/Pharmacy | `medicine-healthcare` |
| 9 | სხვა | Other | `other` |
| 10 | კვება | Food/Catering | `tourism-hospitality` |
| 11 | მშენებლობა/რემონტი | Construction/Repair | `construction` |
| 12 | განათლება | Education | `education` |
| 13 | მედია/გამომცემლობა | Media/Publishing | `design-creative` |
| 14 | სილამაზე/მოდა | Beauty/Fashion | `design-creative` |
| 16 | დასუფთავება | Cleaning | `other` |
| 17 | დაცვა/უსაფრთხოება | Security/Safety | `hr-admin` |
| 18 | ზოგადი ტექნიკური პერსონალი | General Technical Staff | `manufacturing` |

**Note:** Category IDs 15 is not used by jobs.ge.

## Region IDs (lid)

| lid | Georgian Name | English Name | Priority | Our Slug |
|-----|---------------|--------------|----------|----------|
| 14 | აჭარის ა/რ | Adjara AR | 1 | `adjara` |
| 1 | თბილისი | Tbilisi | 2 | `tbilisi` |
| 8 | იმერეთი | Imereti | 3 | `imereti` |
| 3 | კახეთი | Kakheti | 4 | `kakheti` |
| 5 | ქვემო ქართლი | Kvemo Kartli | 5 | `kvemo-kartli` |
| 6 | შიდა ქართლი | Shida Kartli | 6 | `shida-kartli` |
| 9 | გურია | Guria | 7 | `guria` |
| 7 | სამცხე-ჯავახეთი | Samtskhe-Javakheti | 8 | `samtskhe-javakheti` |
| 4 | მცხეთა-მთიანეთი | Mtskheta-Mtianeti | 9 | `mtskheta-mtianeti` |
| 13 | სამეგრელო-ზემო სვანეთი | Samegrelo | 10 | `samegrelo` |
| 12 | რაჭა-ლეჩხუმი | Racha-Lechkhumi | 11 | `racha-lechkhumi` |
| 15 | აფხაზეთის ა/რ | Abkhazia AR | 12 | `abkhazia` (disabled) |
| 16 | უცხოეთი | Abroad | 13 | `abroad` (disabled) |
| 17 | დისტანციური | Remote | 14 | `remote` |

**Note:** Regions 15 (Abkhazia) and 16 (Abroad) are disabled in our parser.

## API Usage

Our API supports both slug-based and jobs.ge-style filtering:

### Using jobs.ge IDs (Recommended)

```bash
# Get IT jobs in Adjara
curl "https://batumi.work/api/v1/jobs?cid=6&lid=14"

# Get all Sales jobs
curl "https://batumi.work/api/v1/jobs?cid=2"

# Get all jobs in Tbilisi
curl "https://batumi.work/api/v1/jobs?lid=1"
```

### Using Our Slugs

```bash
# Get IT jobs
curl "https://batumi.work/api/v1/jobs?category=it-programming"

# Get jobs in Adjara
curl "https://batumi.work/api/v1/jobs?region=adjara"
```

### Response Fields

Each job in the response includes:
- `jobsge_cid`: Original jobs.ge category ID
- `jobsge_lid`: Original jobs.ge location ID
- `category`: Our category object with slug
- `region`: Our region object with slug

## Parser Stats

Monitor parsed job counts by region and category:

```bash
curl "https://batumi.work/api/v1/stats"
```

Response includes:
- `total_jobs`: Total count of jobs
- `by_region`: Array of {lid, name, count}
- `by_category`: Array of {cid, name, count}

---

*Last updated: January 20, 2026*
