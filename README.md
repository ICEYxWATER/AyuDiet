# AyuDiet Connect - MongoDB & Express Backend (MERN Stack)

> **Ayurvedic Diet Planning with Practitioner Approval**  
> Comprehensive Cloud-Based Practice Management & Nutrient Analysis Software for Ayurvedic Dietitians.

This backend provides the **M** (MongoDB) and **E** (Express.js) foundation of the MERN stack for **AyuDiet Connect**, connecting the frontend with a dual-metric database: **Modern Nutritional Metrics (Energy, Protein, Carbs, Fat)** and **Ayurvedic Biological Metrics (Rasa, Virya, Vipaka, Guna, Dosha Balancing)**.

---

## 📋 Features Handled

1. **Dual-Metric Food Store (50 Realistic Foods across 7 Categories)**:
   - Sourced from **IFCT 2017** (National Institute of Nutrition, Hyderabad) and **Kaggle Indian Food Nutrition & Ayurvedic Properties Datasets**.
   - Categories:
     - 🌾 **Grains & Cereals** (Basmati rice, Roti, Oats, Ragi, Quinoa, Poha, Jowar)
     - 🥬 **Vegetables** (Palak, Lauki, Sweet Potato, Karela, Bhindi, Ash Gourd, Carrot)
     - 🍎 **Fruits** (Mango, Banana, Pomegranate, Papaya, Amla, Apple, Coconut)
     - 🥛 **Dairy & Alternatives** (Cow's Milk, Dahi, Paneer, Chaas, Ghee, Coconut milk)
     - 🫘 **Proteins & Legumes** (Moong dal, Toor dal, Chickpeas, Masoor dal, Rajma, Tofu, Eggs)
     - 🌿 **Spices & Herbs** (Turmeric, Cumin, Ginger, Coriander, Fennel, Ashwagandha, Black Pepper)
     - 🍯 **Oils & Natural Sweeteners** (Sesame oil, Coconut oil, Mustard oil, Raw Honey, Jaggery, Flaxseed, Almonds)
   - Every food item stores:
     - Per-100g Energy (kcal), Protein (g), Carbohydrates (g), Fat (g), Fiber (g), Micronutrients (Iron, Calcium, Vitamin C, Potassium).
     - Ayurvedic *Rasa* (Taste: Sweet, Sour, Salty, Pungent, Bitter, Astringent).
     - *Virya* (Thermal Potency: Warming / Cooling).
     - *Vipaka* (Post-digestive effect) & *Guna* (Qualities).
     - Dosha impacts on **Vata**, **Pitta**, and **Kapha** (`balances`, `increases`, or `neutral`).
     - Hex code for the 3D meal bowl graphic (`plateColor`).

2. **Patient Management & Prakriti / Agni Assessment**:
   - Profiles (Name, Age, Gender, Contact).
   - Prakriti constitutional typing (Vata, Pitta, Kapha, dual-doshas, Tridoshic).
   - Agni scoring (Sama, Vishama, Tikshna, Manda).
   - Follow-up timeline with dated progress notes, weight tracking, and symptom records.

3. **Auto-Calculating Meal Engine & Practitioner Approval**:
   - Automatic scaling: `Portion Grams × Per-100g Value ÷ 100` (e.g. 180g oats × 71 kcal ÷ 100 = 128 kcal).
   - Real-time aggregation of meal items into total Calories, Protein, Carbs, and Fat.
   - **Clinical Governance**: Any edit resets a meal plan to `Draft`. The plan must be explicitly signed off by a practitioner (`Approved`), unlocking PDF export and printing.

---

## 🗂️ Project Structure

```
AyuDiet/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── foodController.js     # Food queries, dosha filters, search
│   │   ├── patientController.js  # Patient CRUD and follow-up notes
│   │   └── dietPlanController.js # Meal plan calculations and approval
│   ├── models/
│   │   ├── Food.js               # Dual-metric food schema
│   │   ├── Patient.js            # Patient profile & follow-up schema
│   │   └── DietPlan.js           # Meal chart, macro sums, approval status
│   ├── routes/
│   │   ├── foodRoutes.js         # /api/foods
│   │   ├── patientRoutes.js      # /api/patients
│   │   └── dietPlanRoutes.js     # /api/plans
│   ├── scripts/
│   │   └── seed.js               # Seeds 49 foods + prototype demo records
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Node.js gitignore
│   ├── package.json              # Express, Mongoose, CORS, Morgan
│   └── server.js                 # Express application entrypoint
├── api/
│   ├── food-database.json        # 49 foods structured JSON dataset
│   └── food-db-api.js            # Client-side API fallback
├── index.html                    # Frontend single page
├── app.js                        # Frontend logic
└── style.css                     # Stylesheet
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB**: Either a local instance (`mongodb://localhost:27017/ayudiet`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.

### 2. Installation
Navigate into the `backend` folder:
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your MongoDB connection string:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ayudiet?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
```

### 4. Seed the Database
Populate the database with all 50 foods, categories, demo patients, and the prototype meal plan:
```bash
npm run seed
```
Output:
```
🌿 Connecting to MongoDB for seeding...
 Connected to MongoDB.
📄 Found 49 foods across 7 categories.
🧹 Clearing existing collections...
✅ Seeded 49 foods into MongoDB.
👤 Seeding demo patients...
🥣 Seeding prototype meal plan for Ananya Rao...
 Demo plan created with status: Draft (Totals: 730 kcal, 31.4g protein, 137.3g carbs, 6.1g fat)
🎉 Seeding successfully completed!
```

### 5. Start the Server
```bash
# Development mode with auto-reload:
npm run dev

# Or standard production start:
npm start
```
The server will start at: `http://localhost:5000`

---

## 📡 API Reference

### 🥗 Foods (`/api/foods`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/foods` | Fetch all foods (supports `?category=`, `?dosha=`, `?virya=`, `?search=`) |
| `GET` | `/api/foods/:identifier` | Fetch single food by MongoDB `_id` or Food Code (e.g., `GR001`) |
| `GET` | `/api/foods/categories/summary` | Get all 7 categories with food counts and icons |
| `GET` | `/api/foods/dosha/:dosha` | Get foods that balance, foods to avoid, and tridoshic foods (`Vata`, `Pitta`, `Kapha`) |
| `POST` | `/api/foods` | Add a new food item to the database |

### 👤 Patients (`/api/patients`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients` | List all patients with their active diet plan summary |
| `GET` | `/api/patients/:id` | Get patient details, full meal items, and follow-up timeline |
| `POST` | `/api/patients` | Create a new patient profile (Name, Age, Prakriti, Agni) |
| `PUT` | `/api/patients/:id` | Update patient profile |
| `POST` | `/api/patients/:id/follow-ups` | Add follow-up progress notes and observations |

### 🥣 Meal Plans (`/api/plans`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/plans/patient/:patientId` | Get the active diet plan for a patient |
| `POST` | `/api/plans` | Save or update meal items (Auto-calculates macros; resets status to `Draft`) |
| `PUT` | `/api/plans/:id/approve` | Practitioner approves plan (Unlocks PDF/Print; records timestamp) |

---

## 📤 How to Push to GitHub

Once you are ready to upload these changes to your repository [`https://github.com/ICEYxWATER/AyuDiet`](https://github.com/ICEYxWATER/AyuDiet):

1. Initialize Git in the project root (if not already done):
   ```bash
   git add backend/ api/
   git commit -m "feat(backend): add MongoDB & Express MERN stack backend with 50 Ayurvedic foods"
   ```
2. Push your changes to the `main` branch or a feature branch:
   ```bash
   git push origin main
   ```
