# Restaurant ID Information

## Current Restaurant IDs in Database

Based on the populate script, your app currently has these unique restaurant IDs:

- **rest-009** - Uncle Lim Kitchen
- **rest-010** - Burger Bros
- **rest-011** - Multiple items (reused)
- **rest-012** - Cool Sips Cafe
- **rest-013** - Multiple items (reused)
- **rest-014** - Pasta Corner
- **rest-015** - Daily Grind
- **rest-016** - (Assigned)
- **rest-017** - Multiple items (reused)
- **rest-018** - Juice Junction
- **rest-019** - Multiple items (reused)

**Total Unique Restaurants:** 11

## Restaurant ID Format

The app uses the format: `rest-XXX` where XXX is a 3-digit number with leading zeros.

Example:
- `rest-009` (single digit with leading zeros)
- `rest-020` (next available ID)
- `rest-099` (up to 99)

## Auto-Generated IDs in Add Menu Item Form

When you open the "Add Menu Item" page:

1. ✅ **Automatically counts** unique restaurants in Firestore
2. ✅ **Auto-generates** the next available restaurant ID
3. ✅ **Shows total** restaurant count next to the field
4. ✅ **Editable** - You can change it if you want to add items to an existing restaurant

### Example:
- Current total: 11 restaurants
- Auto-generated ID: `rest-020`
- You can edit to `rest-011` if adding items to an existing restaurant

## When to Use New vs Existing Restaurant ID

### Use a **NEW** Restaurant ID when:
- Adding items from a completely new restaurant
- The restaurant has never been in your system before
- Default behavior (auto-generated)

### Use an **EXISTING** Restaurant ID when:
- Adding more items to a restaurant that already exists
- Example: If "Uncle Lim Kitchen" uses `rest-009`, any new items from them should also use `rest-009`

## Best Practices

1. **For new restaurants**: Use the auto-generated ID
2. **For existing restaurants**: Find their current ID and reuse it
3. **Keep restaurant name consistent**: If using the same ID, use the same restaurant name
4. **Format**: Always use lowercase `rest-` prefix followed by 3 digits

## Finding Existing Restaurant IDs

You can check existing restaurant IDs by:
1. Looking at the Firestore console
2. Checking the populate script: `scripts/populate-menu-items.ts`
3. The Add Item form shows the total count to help track

---

## React Key Warning (Fixed)

**Issue:** "Each child in a list should have a unique key prop"

**Status:** ✅ All `.map()` functions in category pages already have unique `key={item.id}` props

**If warning persists:**
- Clear Metro bundler cache: `npx expo start -c`
- Reload the app
- The warning might be from an old cached render
