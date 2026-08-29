# Frontend Bugs Report

This document lists all frontend bugs found in the SellWise.Web application that need to be fixed.

---

## Critical Bugs

### 1. Redundant Validation Check (Form Submission Protection Broken)

**File:** `SellWise.Web/Views/Shared/_Layout.cshtml`  
**Line:** 228

**Bug:**
```javascript
if ($(form).valid && !$(form).valid()) return;
```

**Problem:**  
This condition will never be true because it's checking `$(form).valid` AND `!$(form).valid()`. These are logical opposites, so both cannot be true simultaneously. This completely bypasses the form submission protection logic across the entire application.

**Expected Fix:**
```javascript
if (!$(form).valid()) return;
```

---

### 2. Incorrect Bootstrap Dropdown Initialization

**File:** `SellWise.Web/Views/Shared/_Layout.cshtml`  
**Line:** 257

**Bug:**
```javascript
let dropdown = new bootstrap.Dropdown(searchInput);
```

**Problem:**  
Bootstrap dropdowns should be initialized on the dropdown container (the element with the `dropdown` class), not on the input element inside it. The `searchInput` is a child of the dropdown container `#omnisearch-widget`, so this initialization fails to work properly.

**Expected Fix:**
```javascript
const dropdownWidget = document.getElementById('omnisearch-widget');
let dropdown = new bootstrap.Dropdown(dropdownWidget);
```

---

### 3. Invalid `data-bs-target` Attribute on Offcanvas Close Button

**File:** `SellWise.Web/Views/Shared/_Layout.cshtml`  
**Line:** 57

**Bug:**
```html
<button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
```

**Problem:**  
The `data-bs-target` attribute is invalid on a close button. According to Bootstrap documentation, `data-bs-target` should only be on the toggle button that opens the offcanvas, not on the close button. The close button should only have `data-bs-dismiss="offcanvas"`.

**Expected Fix:**
```html
<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
```

---

## Minor Issues

### 4. Potential Missing Client-Side Validation for Dynamic Forms

**Files:** Multiple views use `_ValidationScriptsPartial`

**Problem:**  
Several views (Create/Edit forms for Products, Customers, etc.) rely on `_ValidationScriptsPartial` for client-side validation. However, for forms that are partially rendered or contain dynamically loaded content, the validation may not initialize properly.

**Suggested Review:**  
Verify that all forms properly initialize jQuery validation after any AJAX content loads.

---

### 5. XSS Risk Assessment

**Files:** `Order/Create.cshtml`, `_Layout.cshtml` (omnisearch)

**Problem:**  
While an `esc()` function is implemented for HTML escaping, ensure all user inputs are properly escaped before rendering. The omnisearch results inject user data via JavaScript, and the Order Create page renders product names from JSON.

**Status:** Currently mitigated with `esc()` function usage, but should be reviewed for edge cases.

---

## Priority Fix Order

1. **Critical:** Fix the redundant validation check (`_Layout.cshtml` line 228) - This breaks form submission protection
2. **Critical:** Fix the Bootstrap Dropdown initialization (`_Layout.cshtml` line 257) - This breaks omnisearch functionality
3. **Critical:** Fix the invalid `data-bs-target` attribute (`_Layout.cshtml` line 57) - Bootstrap offcanvas may not close properly
4. **Review:** Review XSS mitigation and validation initialization as needed
