document.getElementById("resultForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = document.getElementById("formSelect").value;
  const studentNumber = document.getElementById("studentNumber").value.trim().toUpperCase();
  const csvUrl = `https://raw.githubusercontent.com/magawass/ui/main/${form}.csv`;

  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          const data = results.data;
          const student = data.find(s => s["Exam Number"] === studentNumber);

          const container = document.getElementById("resultsContainer");
          container.innerHTML = "";

          if (!student) {
            container.innerHTML = `<p>No results found for ${studentNumber}</p>`;
            return;
          }

          const subjects = Object.keys(student).filter(key => !["Exam Number", "STUDENT'S NAME"].includes(key));
          let table = `<h2>Results for ${student["STUDENT'S NAME"]}</h2><table><tr><th>Subject</th><th>Score</th></tr>`;
          let total = 0, count = 0;

          subjects.forEach(subject => {
            const score = student[subject];
            if (!isNaN(score)) {
              total += parseFloat(score);
              count++;
            }
            table += `<tr><td>${subject}</td><td>${score}</td></tr>`;
          });

          const average = count > 0 ? (total / count).toFixed(2) : "N/A";
          table += `</table><p><strong>Average:</strong> ${average}</p>`;
          container.innerHTML = table;
        }
      });
    })
    .catch(error => {
      document.getElementById("resultsContainer").innerHTML = `<p>Error loading results.</p>`;
      console.error("Error:", error);
    });
});
