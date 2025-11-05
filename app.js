document.addEventListener("DOMContentLoaded", () => {
    const results = document.getElementById("results");
    const searchInput = document.getElementById("search");
  
    Papa.parse("data/cemetery_data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (resultsData) {
        const people = resultsData.data.map(row => ({
          name: row["Occupant"]?.trim() || "",
          birth: row["Birth"]?.trim() || "",
          death: row["Death"]?.trim() || ""
        })).filter(p => p.name);
  
        displayPeople(people);
  
        let timeout;
        searchInput.addEventListener("input", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            const term = searchInput.value.toLowerCase();
            const filtered = people.filter(p =>
              p.name.toLowerCase().includes(term)
            );
            displayPeople(filtered);
          }, 200);
        });
  
        function displayPeople(list) {
          if (list.length === 0) {
            results.innerHTML = "<p>No matching names found.</p>";
            return;
          }
  
          results.innerHTML = `
            <table class="data-table">
              <thead>
                <tr><th>Name</th><th>Birth</th><th>Death</th></tr>
              </thead>
              <tbody>
                ${list
                  .map(
                    p =>
                      `<tr><td>${p.name}</td><td>${p.birth || "-"}</td><td>${p.death || "-"}</td></tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          `;
        }
      },
      error: function (err) {
        console.error("Error loading CSV:", err);
        results.innerText = "Error loading data.";
      }
    });
  });
  