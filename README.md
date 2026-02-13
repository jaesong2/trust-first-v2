# Trust-First V2: Korean Recipe Matcher

> **A deterministic, governance-first cooking app.**  
> "Trust-First" means NO AI guessing in the matching engine. If the app says you can make it, you *definitely* can.

---

## 🏗️ High-Level Architecture (The "6-Agent" Model)

This project is built around a practical 6-agent architecture to ensure quality and trust at every layer.

### 1. Product Spec Agent
*   **Role:** Defines the user experience and "contract" between the UI and Data.
*   **Key Output:** 4-step walkthrough, simple "Have/Don't Have" toggles for staples, and clear confidence confidence labels (High/Medium).

### 2. Data Model & Schema Agent
*   **Role:** The single source of truth.
*   **Key Decisions:**
    *   **Single Mutable Pantry:** Users edit one "current" list (no complex history tracking).
    *   **Ingredient Aliasing:** "Green Onion" = "Daepa" = "Scallion".
    *   **Schema for V2:** Added `quantity`, `unit`, and `variant_group_id` columns.

### 3. Matching Engine Agent (The Core)
*   **Role:** A SQL-based logic engine that decides what you can cook.
*   **Logic:**
    1.  **Binary Check:** Do you have the ingredient? (Yes/No)
    2.  **Quantity Check:** Do you have *enough*? (e.g., Recipe needs 2 onions, you have 1 → Match fails or suggests reduction).
    3.  **Confidence Scoring:**
        *   **High:** 100% of core ingredients available at desired servings.
        *   **Medium:** Missing 1 core ingredient or reduced servings required.

### 4. Normalization Agent
*   **Role:** Handling the messy reality of user input.
*   **Feature:** Alias-first ingredient search (prefix/contains) with typo-tolerance fallback for near-miss queries.

### 5. Content Governance Agent
*   **Role:** Quality Control.
*   **Rules:**
    *   Recipes must have < 12 core ingredients.
    *   No "AI Hallucinated" recipes; all must be verified against a ground truth source.

### 6. Analytics & Trust Agent
*   **Role:** Monitoring for broken promises.
*   **Metrics:** "Zero Result Rate" (how often users get nothing) and "Not Relevant" feedback.

---

## ✨ V2 Key Features

### 1. quantity-Aware Matching
Unlike V1, which was just "Yes/No", V2 understands **how much** you have.
*   *Scenario:* You have 100g of pork. Recipe needs 300g.
*   *Result:* The app warns you or suggests a 1/3 portion size.

### 2. Protein-Driven Variants
Recipes are grouped by their main protein.
*   **Korean Curry:** Uses Chicken Thigh + Vegetables.
*   **Japanese Curry:** Uses Pork Belly + Vegetables.
*   *UI:* "You have pork? Try the Japanese version instead!"

### 3. "Smart Add" for Staples
User feedback loop improvement:
*   **Fresh Items (Meat/Veg):** Ask for quantity (e.g., 2 onions).
*   **Staples (Sauces/Spices):** Simple Yes/No toggle. We assume if you have Soy Sauce, you have enough for a tablespoon.

---

## 🚀 Deployment

### Option 1: GitHub Pages (Live)
We currently host this as a static web app on GitHub Pages.
*   **[Deployment Guide](./deploy_to_github.md)** - Step-by-step instructions for non-coders.

### Option 2: Local
1. Clone this repo.
2. Open `index.html`.
3. Done! (No Node.js or server required for Phase 1).

---

## 🗺️ Roadmap

### Phase 1: MVP (Completed) ✅
*   [x] Static HTML/JS Frontend (No Server).
*   [x] LocalStorage for saving pantry.
*   [x] 10 Core Recipes & 40 Ingredients.
*   [x] Quantity logic & Smart Add (with staple yes/no shortcuts).
*   [x] GitHub Deployment workflow.

### Phase 2: Cloud & Scale (Next) 🚧
*   [ ] **Validation:** Verify core logic with 50+ users.
*   [ ] **Backend:** Migrate to Supabase (Postgres).
*   [ ] **Auth:** Enable cloud sync across devices.
*   [ ] **Content:** Scale to 500 verified recipes.

### Phase 3: Intelligence 🔮
*   [ ] **Price Tracking:** "Pork is cheap today, make this."
*   [ ] **Nutrition data:** Macro tracking based on consumed quantities.
