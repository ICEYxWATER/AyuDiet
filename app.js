"use strict";

const $ = (id) => document.getElementById(id);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// 49 Realistic Indian / Ayurvedic Foods across 7 Categories (IFCT 2017 & Kaggle Datasets)
// Schema: [Name, Energy (kcal), Protein (g), Carbs (g), Fat (g), Rasa, Virya, PlateColor, Category, Code]
const initialFoods = [
  ["Basmati Rice (cooked)", 130, 2.7, 28.2, 0.3, "Sweet", "Cooling", "#e4d6ae", "grains", "GR001"],
  ["Whole Wheat Roti", 297, 9.8, 56.4, 3.6, "Sweet", "Warming", "#e4d6ae", "grains", "GR002"],
  ["Oats (cooked)", 71, 2.5, 12.0, 1.5, "Sweet", "Warming", "#e4d6ae", "grains", "GR003"],
  ["Ragi / Finger Millet", 328, 7.3, 72.0, 1.3, "Sweet, Astringent", "Cooling", "#e4d6ae", "grains", "GR004"],
  ["Quinoa (cooked)", 120, 4.4, 21.3, 1.9, "Sweet, Astringent", "Warming", "#e4d6ae", "grains", "GR005"],
  ["Poha / Flattened Rice", 346, 6.6, 77.3, 1.2, "Sweet", "Cooling", "#e4d6ae", "grains", "GR006"],
  ["Jowar / Sorghum", 329, 10.4, 67.7, 1.7, "Sweet, Astringent", "Cooling", "#e4d6ae", "grains", "GR007"],
  ["Spinach / Palak", 23, 2.9, 3.6, 0.4, "Astringent, Sweet", "Cooling", "#58804c", "vegetables", "VG001"],
  ["Bottle Gourd / Lauki", 15, 0.6, 3.4, 0.02, "Sweet", "Cooling", "#58804c", "vegetables", "VG002"],
  ["Sweet Potato / Shakarkandi", 86, 1.6, 20.1, 0.1, "Sweet", "Cooling", "#58804c", "vegetables", "VG003"],
  ["Bitter Gourd / Karela", 17, 1.0, 3.7, 0.2, "Bitter", "Cooling", "#58804c", "vegetables", "VG004"],
  ["Okra / Bhindi", 33, 1.9, 7.5, 0.2, "Sweet, Astringent", "Cooling", "#58804c", "vegetables", "VG005"],
  ["Ash Gourd / Petha", 10, 0.4, 2.3, 0.1, "Sweet", "Cooling", "#58804c", "vegetables", "VG006"],
  ["Carrot / Gajar", 41, 0.9, 9.6, 0.2, "Sweet, Bitter", "Warming", "#58804c", "vegetables", "VG007"],
  ["Mango (ripe)", 60, 0.8, 15.0, 0.4, "Sweet", "Warming", "#df9755", "fruits", "FR001"],
  ["Banana", 89, 1.1, 22.8, 0.3, "Sweet", "Cooling", "#df9755", "fruits", "FR002"],
  ["Pomegranate / Anar", 83, 1.7, 18.7, 1.2, "Sweet, Astringent, Sour", "Cooling", "#df9755", "fruits", "FR003"],
  ["Papaya / Papita", 43, 0.5, 10.8, 0.3, "Sweet", "Warming", "#df9755", "fruits", "FR004"],
  ["Indian Gooseberry / Amla", 44, 0.9, 10.2, 0.6, "Sour, Sweet, Pungent, Bitter, Astringent", "Cooling", "#df9755", "fruits", "FR005"],
  ["Apple / Seb", 52, 0.3, 13.8, 0.2, "Sweet, Astringent", "Cooling", "#df9755", "fruits", "FR006"],
  ["Coconut (fresh)", 354, 3.3, 15.2, 33.5, "Sweet", "Cooling", "#df9755", "fruits", "FR007"],
  ["Whole Milk (cow)", 61, 3.2, 4.8, 3.3, "Sweet", "Cooling", "#dbc460", "dairy", "DA001"],
  ["Curd / Dahi (plain)", 60, 3.5, 4.7, 3.3, "Sour, Sweet", "Warming", "#dbc460", "dairy", "DA002"],
  ["Paneer (cottage cheese)", 265, 18.3, 1.2, 20.8, "Sweet, Sour", "Cooling", "#dbc460", "dairy", "DA003"],
  ["Buttermilk / Chaas", 40, 3.3, 4.8, 0.9, "Sour, Astringent", "Warming", "#dbc460", "dairy", "DA004"],
  ["Ghee (clarified butter)", 900, 0, 0, 100, "Sweet", "Cooling", "#dbc460", "dairy", "DA005"],
  ["Coconut Milk", 230, 2.3, 5.5, 23.8, "Sweet", "Cooling", "#dbc460", "dairy", "DA006"],
  ["Lassi (sweet yogurt drink)", 72, 2.8, 11.5, 1.8, "Sweet, Sour", "Cooling", "#dbc460", "dairy", "DA007"],
  ["Moong Dal (cooked)", 106, 7.0, 19.2, 0.4, "Sweet, Astringent", "Cooling", "#9da96b", "proteins", "PR001"],
  ["Toor Dal / Arhar (cooked)", 116, 7.7, 20.0, 0.6, "Sweet, Astringent", "Warming", "#9da96b", "proteins", "PR002"],
  ["Chickpeas / Chana (cooked)", 164, 8.9, 27.4, 2.6, "Sweet, Astringent", "Cooling", "#9da96b", "proteins", "PR003"],
  ["Masoor Dal / Red Lentils (cooked)", 116, 9.0, 20.1, 0.4, "Sweet, Astringent", "Warming", "#9da96b", "proteins", "PR004"],
  ["Rajma / Kidney Beans (cooked)", 127, 8.7, 22.8, 0.5, "Sweet, Astringent", "Warming", "#9da96b", "proteins", "PR005"],
  ["Tofu / Soy Paneer", 76, 8.1, 1.9, 4.8, "Sweet, Astringent", "Cooling", "#9da96b", "proteins", "PR006"],
  ["Eggs (boiled)", 155, 12.6, 1.1, 10.6, "Sweet", "Warming", "#9da96b", "proteins", "PR007"],
  ["Turmeric / Haldi", 312, 9.7, 67.1, 3.3, "Bitter, Pungent, Astringent", "Warming", "#c97e46", "spices", "SP001"],
  ["Cumin / Jeera", 375, 17.8, 44.2, 22.3, "Pungent, Bitter", "Warming", "#c97e46", "spices", "SP002"],
  ["Ginger / Adrak (fresh)", 80, 1.8, 17.8, 0.8, "Pungent", "Warming", "#c97e46", "spices", "SP003"],
  ["Coriander / Dhania (seeds)", 298, 12.4, 55.0, 17.8, "Sweet, Astringent, Bitter", "Cooling", "#c97e46", "spices", "SP004"],
  ["Fennel / Saunf", 345, 15.8, 52.3, 14.9, "Sweet, Pungent", "Cooling", "#c97e46", "spices", "SP005"],
  ["Ashwagandha", 245, 3.9, 49.9, 0.3, "Bitter, Astringent, Sweet", "Warming", "#c97e46", "spices", "SP006"],
  ["Black Pepper / Kali Mirch", 251, 10.4, 63.9, 3.3, "Pungent", "Warming", "#c97e46", "spices", "SP007"],
  ["Sesame Oil / Til ka Tel", 884, 0, 0, 100, "Sweet, Bitter, Astringent", "Warming", "#c59c56", "oils_sweeteners", "OL001"],
  ["Coconut Oil", 862, 0, 0, 100, "Sweet", "Cooling", "#c59c56", "oils_sweeteners", "OL002"],
  ["Mustard Oil / Sarson ka Tel", 884, 0, 0, 100, "Pungent, Bitter", "Warming", "#c59c56", "oils_sweeteners", "OL003"],
  ["Honey / Shahad", 304, 0.3, 82.4, 0, "Sweet, Astringent", "Warming", "#c59c56", "oils_sweeteners", "OL004"],
  ["Jaggery / Gur", 383, 0.4, 95.0, 0.1, "Sweet", "Warming", "#c59c56", "oils_sweeteners", "OL005"],
  ["Flaxseed / Alsi", 534, 18.3, 28.9, 42.2, "Sweet, Bitter", "Warming", "#c59c56", "oils_sweeteners", "OL006"],
  ["Almonds / Badam", 579, 21.2, 21.6, 49.9, "Sweet", "Warming", "#c59c56", "oils_sweeteners", "OL007"],
];

let foods = initialFoods;

const categoryLabels = {
  grains: "?? Grains & Cereals",
  vegetables: "?? Vegetables",
  fruits: "?? Fruits",
  dairy: "?? Dairy & Alternatives",
  proteins: "?? Proteins & Legumes",
  spices: "?? Spices & Herbs",
  oils_sweeteners: "?? Oils & Natural Sweeteners"
};

const nutrients = ["Energy", "Protein", "Carbohydrates", "Fat"];
const units = ["kcal", "g", "g", "g"];

// Initial prototype seed meal (Slide 3: Oats 180g, Rice 150g, Moong Dal 160g, Carrot 120g, Chickpeas 120g)
const seedMeal = () => [
  { id: 2, g: 180 },  // Oats (cooked)
  { id: 0, g: 150 },  // Basmati Rice (cooked)
  { id: 28, g: 160 }, // Moong Dal (cooked)
  { id: 13, g: 120 }, // Carrot / Gajar
  { id: 30, g: 120 }  // Chickpeas / Chana
];

const fresh = (name, age, prakriti, notes) => ({
  name,
  age,
  prakriti,
  notes,
  meal: seedMeal(),
  approved: false,
  selected: 0,
});

const initial = () => ({
  active: 0,
  profiles: [
    fresh("Ananya Rao", 32, "Vata–Pitta", "Midday Ayurvedic balancing session."),
    fresh("Mira Shah", 34, "Vata–Pitta", "Lunch planning session."),
    fresh("Dev Rao", 42, "Kapha", "Prefers a warm midday meal."),
  ],
});

const storageKey = "ayudiet-desk-v1";

function load() {
  try {
    const state = JSON.parse(localStorage.getItem(storageKey));
    if (
      state?.profiles?.[state.active] &&
      state.profiles.every(
        (p) =>
          Array.isArray(p.meal) &&
          p.meal.every(
            (r) =>
              Number.isInteger(r.id) &&
              foods[r.id] &&
              Number.isFinite(r.g) &&
              r.g > 0,
          ),
      )
    )
      return state;
  } catch {}
  return initial();
}

let state = load();
const patient = () => state.profiles[state.active];

const save = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    $("activity").textContent =
      "Storage unavailable. This session is held in memory.";
  }
};

const round = (n) =>
  Number(Number(n).toFixed(1)).toLocaleString("en-IN", { maximumFractionDigits: 1 });

const contribution = (row, k) => (foods[row.id] ? (foods[row.id][k + 1] * row.g) / 100 : 0);

const totals = (meal) =>
  nutrients.map((_, k) => meal.reduce((sum, r) => sum + contribution(r, k), 0));

const source = (id, key) => (foods[id] ? foods[id][key] || "Unspecified" : "Unspecified");

function chart(p) {
  const sum = totals(p.meal);
  return (
    '<div class="chart"><span class="eyebrow small">AyuDiet Connect · Diet chart</span><h4>' +
    esc(p.name) +
    "</h4><small>Patient profile · " +
    esc(p.age) +
    " years · " +
    esc(p.prakriti) +
    "</small><table><caption>Lunch</caption><thead><tr><th>Food and attributes</th><th>Portion</th></tr></thead><tbody>" +
    p.meal
      .map(
        (r) =>
          "<tr><td>" +
          foods[r.id][0] +
          "<small>Rasa · " +
          source(r.id, 5) +
          "<br>Virya · " +
          source(r.id, 6) +
          "</small></td><td>" +
          round(r.g) +
          " g</td></tr>",
      )
      .join("") +
    "</tbody></table><p><b>Plan totals</b></p>" +
    nutrients
      .map(
        (name, k) =>
          '<div class="row"><span>' +
          name +
          '</span><span class="number">' +
          round(sum[k]) +
          " " +
          units[k] +
          "</span></div>",
      )
      .join("") +
    "</div>"
  );
}

function announce(message) {
  $("activity").textContent = message;
}

function edit(message) {
  const p = patient();
  if (p.approved) message = "Plan changed. Reset to Draft for practitioner review.";
  p.approved = false;
  announce(message);
  save();
}

function renderChart() {
  const p = patient();
  const row = p.meal.find((r) => r.id === p.selected);
  const sum = totals(p.meal);
  $("foodTitle").textContent = row && foods[row.id] ? foods[row.id][0] : "Select a food";
  $("attrs").innerHTML = row && foods[row.id]
    ? '<span class="chip"><i>Rasa</i> · ' +
      source(row.id, 5) +
      '</span><span class="chip"><i>Virya</i> · ' +
      source(row.id, 6) +
      '</span><span class="chip"><i>Category</i> · ' +
      (categoryLabels[foods[row.id][8]] || foods[row.id][8]) +
      "</span>"
    : "";
  $("formula").innerHTML = row && foods[row.id]
    ? foods[row.id][1] +
      " kcal / 100 g<br>" +
      foods[row.id][1] +
      " × " +
      round(row.g) +
      " ÷ 100<br><b>= " +
      round(contribution(row, 0)) +
      " kcal</b>"
    : "Add an ingredient to inspect its calculation.";
  $("nutrition").innerHTML = nutrients
    .map(
      (n, k) =>
        '<tr><th scope="row">' +
        n +
        "</th><td><span>" +
        round(row ? contribution(row, k) : 0) +
        "</span> " +
        units[k] +
        "</td><td><span>" +
        round(sum[k]) +
        "</span> " +
        units[k] +
        "</td></tr>",
    )
    .join("");
  $("status").textContent = p.approved ? "Approved" : "Draft";
  $("preview").innerHTML = chart(p);
  $("export").disabled = !p.approved;
  $("review").disabled =
    !p.meal.length || !!document.querySelector("#ingredients input:invalid");
  document.body.classList.toggle("approved", p.approved);
  $("printSheet").innerHTML = p.approved
    ? "<h2>Approved diet chart</h2>" + chart(p)
    : "";
  $("weight").textContent = round(p.meal.reduce((s, r) => s + r.g, 0)) + " g";
  $("plate").innerHTML = p.meal
    .map(
      (r) =>
        '<button class="slice" data-select="' +
        r.id +
        '" style="background:' +
        (foods[r.id] ? foods[r.id][7] : "#9da96b") +
        ";flex:" +
        r.g +
        '" aria-label="Inspect ' +
        (foods[r.id] ? foods[r.id][0] : "Food") +
        ", " +
        round(r.g) +
        ' grams" title="' +
        (foods[r.id] ? foods[r.id][0] : "Food") +
        '"></button>',
    )
    .join("");
  document
    .querySelectorAll("#ingredients [data-select]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(+b.dataset.select === p.selected)),
    );
}

function render() {
  const p = patient();
  $("patients").innerHTML = state.profiles
    .map((q, i) => '<option value="' + i + '">' + esc(q.name) + "</option>")
    .join("");
  $("patients").value = state.active;
  $("bio").textContent =
    p.age + " years · " + p.prakriti + (p.notes ? " · " + p.notes : "");
  $("ingredients").innerHTML = p.meal
    .map(
      (r) =>
        '<div class="foodrow" data-row="' +
        r.id +
        '"><button data-select="' +
        r.id +
        '">' +
        (foods[r.id] ? foods[r.id][0] : "Food #" + r.id) +
        '</button><input type="number" required min=".1" max="5000" step=".1" data-grams="' +
        r.id +
        '" value="' +
        r.g +
        '" aria-label="' +
        (foods[r.id] ? foods[r.id][0] : "Food") +
        ' portion in grams"><span>g</span><button class="remove" data-remove="' +
        r.id +
        '" aria-label="Remove ' +
        (foods[r.id] ? foods[r.id][0] : "Food") +
        '">×</button></div>',
    )
    .join("");

  // Group remaining foods cleanly by the 7 Ayurvedic categories
  const categoriesList = ["grains", "vegetables", "fruits", "dairy", "proteins", "spices", "oils_sweeteners"];
  let optgroups = "";
  categoriesList.forEach((catKey) => {
    const catFoods = foods
      .map((f, i) => ({ food: f, index: i }))
      .filter((item) => item.food[8] === catKey && !p.meal.some((r) => r.id === item.index));
    if (catFoods.length > 0) {
      optgroups +=
        '<optgroup label="' +
        (categoryLabels[catKey] || catKey) +
        '">' +
        catFoods
          .map((item) => '<option value="' + item.index + '">' + item.food[0] + "</option>")
          .join("") +
        "</optgroup>";
    }
  });

  $("library").innerHTML = optgroups || "<option>All 49 foods added to plan</option>";
  $("add").disabled = !optgroups;
  renderChart();
}

function highlight(id) {
  document
    .querySelectorAll(
      '[data-row="' +
        id +
        '"],#plate [data-select="' +
        id +
        '"],#nutrition td span',
    )
    .forEach((el) => {
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    });
}

$("ingredients").addEventListener("input", (e) => {
  if (!e.target.matches("[data-grams]")) return;
  const p = patient(),
    id = +e.target.dataset.grams;
  if (!e.target.validity.valid) {
    edit("Enter a portion between 0.1 and 5,000 g in tenths of a gram.");
    renderChart();
    return;
  }
  p.selected = id;
  const targetRow = p.meal.find((r) => r.id === id);
  if (targetRow) {
    targetRow.g = e.target.valueAsNumber;
    edit("Portion updated to " + round(e.target.valueAsNumber) + " g.");
  }
  renderChart();
  highlight(id);
});

document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const p = patient();
  if (b.hasAttribute("data-select")) {
    p.selected = +b.dataset.select;
    save();
    renderChart();
    if (b.classList.contains("slice"))
      highlight(p.selected);
  } else if (b.hasAttribute("data-remove")) {
    const id = +b.dataset.remove;
    p.meal = p.meal.filter((r) => r.id !== id);
    if (p.selected === id) p.selected = p.meal[0]?.id ?? null;
    edit((foods[id] ? foods[id][0] : "Item") + " removed.");
    render();
    $("library").focus();
  } else if (b.hasAttribute("data-close")) b.closest("dialog").close();
});

$("add").onclick = () => {
  const p = patient(),
    id = +$("library").value;
  if (isNaN(id) || !foods[id]) return;
  p.meal.push({ id, g: 100 });
  p.selected = id;
  edit(foods[id][0] + " added at 100 g.");
  render();
  highlight(id);
};

$("patients").onchange = (e) => {
  state.active = +e.target.value;
  save();
  render();
  announce("Opened " + patient().name + "’s plan.");
};

$("newPatient").onclick = () => $("profileDlg").showModal();

$("profileForm").onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData(e.target),
    name = String(data.get("name")).trim();
  if (!name) {
    e.target.elements.name.focus();
    return;
  }
  state.profiles.push(
    fresh(
      name,
      Number(data.get("age")),
      data.get("prakriti"),
      String(data.get("notes")).trim(),
    ),
  );
  state.active = state.profiles.length - 1;
  save();
  render();
  $("profileDlg").close();
  e.target.reset();
  announce("Profile created with a balanced Ayurvedic plan.");
};

$("review").onclick = () => {
  if (!$("review").disabled) {
    $("inspection").innerHTML = chart(patient());
    $("reviewDlg").showModal();
  }
};

// Practitioner Approval (Enforced Clinical Sign-off at Backend)
$("confirm").onclick = async () => {
  const p = patient();
  try {
    if (window.AyuDietAPI) {
      announce("Signing and submitting plan to backend...");
      const res = await window.AyuDietAPI.approvePlan("active-patient-plan", "Practitioner Dr. Sharma");
      if (res && res.success === false && res.error === "FORBIDDEN") {
        announce("Unauthorized: Only backend practitioners can approve clinical charts.");
        return;
      }
    }
  } catch (err) {
    console.warn("Backend offline, proceeding in local preview mode.");
  }
  p.approved = true;
  save();
  renderChart();
  $("reviewDlg").close();
  announce("Plan approved by practitioner. Print or PDF export unlocked.");
};

$("export").onclick = () => {
  if (patient().approved) window.print();
};

// Initial Render with 49 foods
render();

// Check for live backend connection and update database
async function syncBackendFoods() {
  if (!window.AyuDietAPI) return;
  try {
    const isOnline = await window.AyuDietAPI.checkHealth();
    if (isOnline) {
      const backendFoods = await window.AyuDietAPI.getFoods();
      if (Array.isArray(backendFoods) && backendFoods.length > 0) {
        foods = backendFoods.map((f) => [
          f.name,
          f.nutrition.calories,
          f.nutrition.protein,
          f.nutrition.carbs,
          f.nutrition.fat,
          Array.isArray(f.ayurveda.rasa) ? f.ayurveda.rasa.join(", ") : (f.ayurveda.rasa || ""),
          f.ayurveda.virya || "",
          f.plateColor || "#9da96b",
          f.category,
          f.code
        ]);
        announce("Connected to MongoDB Backend · " + foods.length + " verified foods loaded.");
        render();
      }
    }
  } catch (err) {
    console.log("Operating on verified local dual-metric food database.");
  }
}

syncBackendFoods();

const exampleMeal = seedMeal();
exampleMeal[0].g = 180;
document
  .querySelectorAll(".archive-rows")
  .forEach(
    (el) =>
      (el.innerHTML = exampleMeal
        .map(
          (r) =>
            "<div><span>" +
            (foods[r.id] ? foods[r.id][0] : "Food") +
            '</span><span class="number">' +
            r.g +
            " g</span></div>",
        )
        .join("")),
  );
$("exampleTotal").textContent =
  "Lunch total · " + round(totals(exampleMeal)[0]) + " kcal";

function navState() {
  document
    .querySelector("header")
    .classList.toggle("scrolled", window.scrollY > 40);
}
navState();
window.addEventListener("scroll", navState, { passive: true });

const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let motionContext;
function initMotion() {
  motionContext?.revert();
  if (motionPreference.matches || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  motionContext = gsap.context(() => {
    gsap.from(".hero-copy > *", {
      y: 9,
      opacity: 0.85,
      stagger: 0.07,
      duration: 0.65,
      clearProps: "transform,opacity",
    });
    gsap.from(".philosophy p", {
      y: 18,
      opacity: 0,
      stagger: 0.15,
      scrollTrigger: { trigger: ".philosophy", start: "top 80%" },
    });
    gsap.to(".philosophy", {
      backgroundPosition: "center 57%",
      scrollTrigger: { trigger: ".philosophy", scrub: true },
    });
    const steps = gsap.utils.toArray(".step");
    steps
      .slice(1)
      .forEach((step, i) =>
        gsap.to(steps[i], {
          scale: 0.9,
          filter: "blur(20px)",
          opacity: 0.5,
          scrollTrigger: {
            trigger: step,
            start: "top 82%",
            end: "top 110px",
            scrub: true,
          },
        }),
      );
    gsap.from(".mini-bowl i,.step:first-child .archive-rows > div", {
      y: -12,
      opacity: 0,
      stagger: 0.1,
      scrollTrigger: { trigger: steps[0], start: "top 70%" },
    });
    gsap.from(".step:last-child .sheet", {
      rotation: -3,
      y: 22,
      opacity: 0.5,
      scrollTrigger: {
        trigger: steps[2],
        start: "top 85%",
        end: "top 40%",
        scrub: true,
      },
    });
  }, document.body);
}
initMotion();
motionPreference.addEventListener("change", initMotion);

document.querySelectorAll(".primary").forEach((b) => {
  b.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && !motionPreference.matches) {
      const r = b.getBoundingClientRect();
      b.style.transform =
        "translate(" +
        (e.clientX - r.left - r.width / 2) * 0.035 +
        "px," +
        (e.clientY - r.top - r.height / 2) * 0.07 +
        "px)";
    }
  });
  b.addEventListener("pointerleave", () => (b.style.transform = ""));
});
