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
const foods = [
  [
    "Cooked mung beans",
    71,
    5,
    12,
    0.3,
    "Sweet, astringent",
    "Cooling",
    "#9da96b",
  ],
  ["Cooked basmati rice", 130, 2.7, 28.2, 0.3, "Sweet", "Cooling", "#e4d6ae"],
  ["Steamed spinach", 23, 3, 3.8, 0.3, "Bitter", null, "#58804c"],
  ["Cooked chickpeas", 164, 8.9, 27.4, 2.6, "Astringent", "Cooling", "#c59c56"],
  ["Roasted carrot", 41, 0.9, 9.6, 0.2, "Sweet", null, "#c97e46"],
  ["Ghee", 884, 0, 0, 100, "Sweet", "Cooling", "#dbc460"],
  ["Cooked pumpkin", 20, 0.7, 4.9, 0.1, null, null, "#df9755"],
];
const nutrients = ["Energy", "Protein", "Carbohydrates", "Fat"];
const units = ["kcal", "g", "g", "g"];
const seedMeal = () => [
  { id: 0, g: 150 },
  { id: 1, g: 120 },
  { id: 2, g: 60 },
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
  Number(n.toFixed(1)).toLocaleString("en-IN", { maximumFractionDigits: 1 });
const contribution = (row, k) => (foods[row.id][k + 1] * row.g) / 100;
const totals = (meal) =>
  nutrients.map((_, k) => meal.reduce((sum, r) => sum + contribution(r, k), 0));
const source = (id, key) => foods[id][key] || "Unspecified";
function chart(p) {
  const sum = totals(p.meal);
  return (
    '<div class="chart"><span class="eyebrow small">AyuDiet Connect · Diet chart</span><h4>' +
    esc(p.name) +
    "</h4><small>Fictional patient · " +
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
  if (p.approved) message = "Plan changed. Review again before sharing.";
  p.approved = false;
  announce(message);
  save();
}
function renderChart() {
  const p = patient();
  const row = p.meal.find((r) => r.id === p.selected);
  const sum = totals(p.meal);
  $("foodTitle").textContent = row ? foods[row.id][0] : "Select a food";
  $("attrs").innerHTML = row
    ? '<span class="chip"><i>Rasa</i> · ' +
      source(row.id, 5) +
      '</span><span class="chip"><i>Virya</i> · ' +
      source(row.id, 6) +
      "</span>"
    : "";
  $("formula").innerHTML = row
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
        foods[r.id][7] +
        ";flex:" +
        r.g +
        '" aria-label="Inspect ' +
        foods[r.id][0] +
        ", " +
        round(r.g) +
        ' grams" title="' +
        foods[r.id][0] +
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
        foods[r.id][0] +
        '</button><input type="number" required min=".1" max="5000" step=".1" data-grams="' +
        r.id +
        '" value="' +
        r.g +
        '" aria-label="' +
        foods[r.id][0] +
        ' portion in grams"><span>g</span><button class="remove" data-remove="' +
        r.id +
        '" aria-label="Remove ' +
        foods[r.id][0] +
        '">×</button></div>',
    )
    .join("");
  const remaining = foods
    .map((f, i) =>
      p.meal.some((r) => r.id === i)
        ? ""
        : '<option value="' + i + '">' + f[0] + "</option>",
    )
    .join("");
  $("library").innerHTML = remaining || "<option>All foods added</option>";
  $("add").disabled = !remaining;
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
  p.meal.find((r) => r.id === id).g = e.target.valueAsNumber;
  edit("Portion updated to " + round(e.target.valueAsNumber) + " g.");
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
      $("plate")
        .querySelector('[data-select="' + p.selected + '"]')
        .focus();
    highlight(p.selected);
  } else if (b.hasAttribute("data-remove")) {
    const id = +b.dataset.remove;
    p.meal = p.meal.filter((r) => r.id !== id);
    if (p.selected === id) p.selected = p.meal[0]?.id ?? null;
    edit(foods[id][0] + " removed.");
    render();
    $("library").focus();
  } else if (b.hasAttribute("data-close")) b.closest("dialog").close();
});
$("add").onclick = () => {
  const p = patient(),
    id = +$("library").value;
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
  announce("Profile created with a sample lunch.");
};
$("review").onclick = () => {
  if (!$("review").disabled) {
    $("inspection").innerHTML = chart(patient());
    $("reviewDlg").showModal();
  }
};
$("confirm").onclick = () => {
  patient().approved = true;
  save();
  renderChart();
  $("reviewDlg").close();
  announce("Plan approved. Print or save the current chart.");
};
$("export").onclick = () => {
  if (patient().approved) window.print();
};
render();
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
            foods[r.id][0] +
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
