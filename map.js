document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("map-grid");
  const results = document.getElementById("map-results");

  // ===============================
  // GRID VISUAL SETUP
  // ===============================
  const letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
  const numbers = Array.from({length: 12}, (_, i) => i + 1);

  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = `repeat(${letters.length}, 1fr)`; // <== flipped orientation
  gridContainer.style.gridTemplateRows = `repeat(${numbers.length}, 1fr)`;
  gridContainer.style.gap = "2px";

  // Ward color codes
  const wardColors = {
    "1": "#cce3cc",
    "2": "#b7d6b7",
    "3": "#a2c9a2",
    "4": "#8ebd8e",
    "0": "#d8e3d8" // fallback for ward 0
  };

  // Make the grid boxes (letters across top, numbers down side)
  numbers.forEach(num => {
    letters.forEach(letter => {
      const cell = document.createElement("div");
      cell.classList.add("map-cell");
      cell.dataset.grid = `${letter}${num}`;
      cell.innerText = `${letter}${num}`;
      cell.style.backgroundColor = "#f0f0f0";
      gridContainer.appendChild(cell);
    });
  });

  // ===============================
  // LOAD BOTH CSV FILES
  // ===============================
  Promise.all([
    fetch("data/grid_lookup.csv").then(r => r.text()),
    fetch("data/cemetery_data.csv").then(r => r.text())
  ]).then(([lookupCSV, cemeteryCSV]) => {
    const lookupData = Papa.parse(lookupCSV, { header: true }).data;
    const cemeteryData = Papa.parse(cemeteryCSV, { header: true }).data;

    // Combine them by matching Grid/Ward/Block fields
    const combined = lookupData.map(lookup => {
      const match = cemeteryData.find(person =>
        person.Ward?.trim() === lookup.Ward?.trim() &&
        person.Block?.trim() === lookup.Block?.trim() &&
        person.Grid?.trim() === lookup.Grid?.trim()
      );
      return {
        grid: lookup.Grid?.trim(),
        ward: lookup.Ward?.trim(),
        block: lookup.Block?.trim(),
        name: match?.Occupant?.trim() || "",
        birth: match?.Birth?.trim() || "",
        death: match?.Death?.trim() || ""
      };
    });

    // ===============================
    // APPLY COLORS + CLICK EVENTS
    // ===============================
    combined.forEach(entry => {
      const cell = document.querySelector(`[data-grid="${entry.grid}"]`);
      if (cell) {
        // Color it by ward
        cell.style.backgroundColor = wardColors[entry.ward] || "#d8e3d8";

        // When you click, show all people for that grid cell
        cell.addEventListener("click", () => {
          const matches = combined.filter(p => p.grid === entry.grid);
          if (matches.length === 0) {
            results.innerHTML = `<p>No records found for ${entry.grid}</p>`;
          } else {
            results.innerHTML = `
              <h2>Section ${entry.grid}</h2>
              <ul>
                ${matches
                  .map(p => `<li>${p.name} (${p.birth} - ${p.death})</li>`)
                  .join("")}
              </ul>
            `;
          }
        });
      }
    });
  })
  .catch(err => {
    console.error("Error loading data:", err);
    results.innerText = "Error loading data.";
  });
});
