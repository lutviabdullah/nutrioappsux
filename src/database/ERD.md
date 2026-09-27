# Nutrio Database ERD

```mermaid
erDiagram
  GENDER_OPTIONS ||--o{ USERS : classifies
  ACTIVITY_LEVELS ||--o{ USERS : classifies
  DIETARY_GOALS ||--o{ USERS : classifies
  USERS ||--o{ MEAL_LOGS : records
  MEAL_TYPES ||--o{ MEAL_LOGS : classifies
  FOOD_ITEMS ||--o{ MEAL_LOGS : consumed_as
  MEAL_LOGS ||--o| NUTRITION_LEDGER_ENTRIES : snapshots
  USERS ||--o{ NUTRITION_LEDGER_ENTRIES : ledger_owner_snapshot
  FOOD_ITEMS ||--o{ NUTRITION_LEDGER_ENTRIES : food_snapshot
  USERS ||--o{ MEAL_PLANS : owns
  MEAL_PLANS ||--o{ MEAL_PLAN_ITEMS : contains
  FOOD_ITEMS ||--o{ MEAL_PLAN_ITEMS : recommends
  MEAL_TYPES o|--o{ MEAL_PLAN_ITEMS : classifies
  USERS ||--o{ USER_PREFERENCES : configures
  FOOD_CATEGORIES o|--o{ FOOD_ITEMS : classifies
  FOOD_ITEMS ||--o{ FOOD_NUTRIENTS : has
  NUTRIENTS ||--o{ FOOD_NUTRIENTS : defines
  INGREDIENT_CATEGORIES o|--o{ INGREDIENTS : classifies
  INGREDIENTS ||--o{ FOOD_INGREDIENTS : included_in
  FOOD_ITEMS ||--o{ FOOD_INGREDIENTS : contains
  FOOD_ITEMS ||--o{ FOOD_REVIEWS : receives
  EDUCATION_CATEGORIES ||--o{ EDUCATION : classifies
  AUTH_USERS ||--o| PROFILES : owns

  GENDER_OPTIONS {
    varchar code PK
    varchar label
  }
  ACTIVITY_LEVELS {
    varchar code PK
    varchar label
  }
  DIETARY_GOALS {
    varchar code PK
    varchar label
  }
  USERS {
    text id PK
    varchar email UK
    varchar username UK
    varchar gender FK
    varchar activity_level FK
    varchar dietary_goal FK
  }
  MEAL_TYPES {
    varchar code PK
    varchar label
  }
  MEAL_LOGS {
    text id PK
    text user_id FK
    text food_id FK
    varchar meal_type FK
    numeric servings
  }
  FOOD_ITEMS {
    text id PK
    text category_id FK
    varchar slug UK
    varchar name
    numeric base_price
  }
  NUTRIENTS {
    text id PK
    varchar code UK
    varchar name
    varchar unit
  }
  FOOD_NUTRIENTS {
    text id PK
    text food_id FK
    text nutrient_id FK
    numeric value
  }
  INGREDIENT_CATEGORIES {
    uuid id PK
    varchar name UK
  }
  INGREDIENTS {
    text id PK
    uuid category_id FK
    varchar name UK
  }
  FOOD_INGREDIENTS {
    text id PK
    text food_id FK
    text ingredient_id FK
    numeric quantity_g
  }
  FOOD_CATEGORIES {
    text id PK
    varchar slug UK
    varchar name UK
  }
  MEAL_PLANS {
    text id PK
    text user_id FK
    varchar name
    timestamptz start_date
  }
  MEAL_PLAN_ITEMS {
    text id PK
    text meal_plan_id FK
    text food_id FK
    varchar meal_type FK
  }
  USER_PREFERENCES {
    text id PK
    text user_id FK
    varchar preference_name
    varchar preference_value
  }
  FOOD_REVIEWS {
    text id PK
    text food_id FK
    varchar reviewer_name
    smallint rating
  }
  NUTRITION_LEDGER_ENTRIES {
    uuid id PK
    text meal_log_id FK_UK
    text user_id FK
    text food_id FK
    numeric nutrient_snapshots
    bytea entry_hash UK
  }
  EDUCATION_CATEGORIES {
    uuid id PK
    varchar slug UK
    varchar name UK
  }
  EDUCATION {
    uuid id PK
    uuid category_id FK
    varchar slug UK
    varchar title
    text summary
  }
  AUTH_USERS {
    uuid id PK
  }
  PROFILES {
    uuid user_id PK_FK
    text full_name
    text university
    text faculty
  }
```

`audit_events` is a polymorphic append-only audit log; its JSONB old/new rows are event snapshots and intentionally do not use foreign keys. `nutrition_ledger_entries` also keeps immutable nutrition, user, food, and serving snapshots so historical hashes remain verifiable. These are event-history records, not mutable operational facts.

`v_food_catalog` presents normalized nutrient rows as the existing menu API shape. `v_user_daily_nutrition` and `mv_user_daily_nutrition` are derived analytics views, not source tables.