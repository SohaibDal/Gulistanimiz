# Content schemas

## Poem JSON schema

This document describes the current shape of poem objects in `data/poems.json` and how the app uses them. It is descriptive of the existing data and code only; it does **not** introduce new required fields.

Each entry in `data/poems.json` is a single poem object with the following fields:

### `id`
- **Type:** string
- **Required:** yes
- **Purpose:** Stable identifier for the poem used for lookups, saved-poems storage, navigation, and indexing.
- **Format / constraints (current data):**
  - Numeric string without quotes in usage assumptions, but stored as a JSON string (e.g. `"001"`, `"012"`, `"038"`).
  - Values are unique within `data/poems.json`.
  - In navigation code, some lookups currently coerce route parameters with `Number(poemId)`, so ids are expected to contain only digits.

### `poetId`
- **Type:** string
- **Required:** yes
- **Purpose:** Links a poem to its poet.
- **Format / constraints (current data):**
  - String key such as `"hafez"`, `"rumi"`, `"saadi"`, `"omar-khayyam"`.
  - Must correspond to an `id` field in `data/poets.json`.
- **Relationships:**
  - The app joins poems to poets by matching `poem.poetId` to `poet.id` from `data/poets.json` (e.g. in the poem screen header and in `getPoetsWithCounts`).

### `genre`
- **Type:** string
- **Required:** yes
- **Purpose:** High-level category for the poem, used for filtering and display.
- **Format / constraints (current data):**
  - Free-text string, but current values are drawn from a small set, e.g. `"Ghazal"`, `"Rubai"`, `"Masnavi"`, `"Epic"`.
  - Used as an exact-match key in `getPoemsByGenre(genre: string)`.

### `original`
- **Type:** string
- **Required:** yes
- **Purpose:** Original text of the poem, typically in Persian.
- **Format / constraints (current data):**
  - One or more lines separated by newline characters (`"\n"`).
  - Rendered as the primary poem text in the Poem screen when the reading mode includes the original.

### `transliteration`
- **Type:** string
- **Required:** yes (in current dataset; app treats it as optional at runtime)
- **Purpose:** Latin-script transliteration of the `original` text.
- **Format / constraints (current data):**
  - Mirrors the line breaks of `original` using `"\n"`.
  - Shown or hidden via user preference (`Transliteration` toggle) and reading mode.
- **Usage notes:**
  - The app checks `!!poem.transliteration` before rendering this field, so future entries could omit it and still be valid, but all current poems provide a non-empty string.

### `translations`
- **Type:** object mapping language code → string
- **Required:** yes
- **Purpose:** Stores human-language translations of the poem.
- **Format / constraints (current data):**
  - An object whose keys are short language codes such as `"en"` and `"tr"`.
  - Each value is a string with one or more lines of translated text, using `"\n"` for line breaks.
  - All existing poems include at least English (`"en"`) and Turkish (`"tr"`) translations, and the Poem screen currently reads `poem.translations[language]` where `language` is either `"en"` or `"tr"`.
- **Example shape:**

  ```json
  "translations": {
    "en": "Human beings are limbs of one body,\nBorn of the same essence in creation.",
    "tr": "İnsanoğlu tek bir bedenin uzuvlarıdır\nYaratılışta tek bir cevherdendir"
  }
  ```

### `theme`
- **Type:** string
- **Required:** yes
- **Purpose:** Short topic label characterising the poem’s main idea.
- **Format / constraints (current data):**
  - Free-text string; examples include `"Love"`, `"Wisdom"`, `"Sufism"`, `"Humanity"`, `"Divine"`, `"Mysticism"`, `"Nature"`, `"Philosophy"`, `"Epic"`, `"Mystical"`.
  - Currently used only for display and potential future filtering/grouping.

---

## Example poem object

Below is a complete example poem object that matches the current schema and style of `data/poems.json`.

```json
{
  "id": "003",
  "poetId": "saadi",
  "genre": "Ghazal",
  "original": "بنی آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند",
  "transliteration": "Bani Adam a'zaye yek peykarand\nKe dar afarinesh ze yek gowharand",
  "translations": {
    "en": "Human beings are limbs of one body,\nBorn of the same essence in creation.",
    "tr": "İnsanoğlu tek bir bedenin uzuvlarıdır\nYaratılışta tek bir cevherdendir"
  },
  "theme": "Humanity"
}
```