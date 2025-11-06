document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("map-grid");
    const results = document.getElementById("map-results");
  
    // grid visual setup
    const letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];
    const numbers = Array.from({length: 12}, (_, i) => i + 1);
  
    gridContainer.style.display = "grid";
    gridContainer.style.gridTemplateColumns = `repeat(${numbers.length}, 1fr)`;
    gridContainer.style.gap = "2px";
  
    letters.forEach(letter => {
      numbers.forEach(num => {
        const cell = document.createElement("div");
        cell.classList.add("map-cell");
        cell.dataset.grid = `${letter}${num}`;
        cell.innerText = `${letter}${num}`;
        gridContainer.appendChild(cell);
      });
    });
  
    Papa.parse("data/cemetery_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (resultsData) {
        const people = resultsData.data.map(row => ({
          name: row["Occupant"]?.trim() || "",
          ward: row["Ward"]?.trim() || "",
          block: row["Block"]?.trim() || "",
          grid: row["Grid"]?.trim() || "",
          birth: row["Birth"]?.trim() || "",
          death: row["Death"]?.trim() || ""
        })).filter(p => p.name);
  
        // click event for each cell
        document.querySelectorAll(".map-cell").forEach(cell => {
          cell.addEventListener("click", () => {
            const grid = cell.dataset.grid;
            const matches = people.filter(p => p.grid === grid);
            if (matches.length === 0) {
              results.innerHTML = `<p>No records found for ${grid}</p>`;
            } else {
              results.innerHTML = `
                <h2>Section ${grid}</h2>
                <ul>
                  ${matches.map(p => `<li>${p.name} (${p.birth} - ${p.death})</li>`).join("")}
                </ul>
              `;
            }
          });
        });
      },
      error: err => {
        console.error("Error loading map data:", err);
        results.innerText = "Error loading data.";
      }
    });
  });
  