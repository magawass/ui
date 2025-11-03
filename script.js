document.addEventListener("DOMContentLoaded", () => {
  const resultMessage = document.getElementById("result-message");
  const resultsContainer = document.getElementById("results-table-container");
  const resultsTableHead = document.querySelector("#results-table thead");
  const resultsTableBody = document.querySelector("#results-table tbody");
  const resultsSummary = document.getElementById("results-summary");

  document.getElementById("view-results-btn").onclick = async () => {
    const form = document.getElementById("class-select").value;
    const studentNumber = document.getElementById("student-number").value.trim();
    resultsContainer.classList.add("hidden");
    resultsTableHead.innerHTML = "";
    resultsTableBody.innerHTML = "";
    resultsSummary.innerHTML = "";
    resultMessage.innerHTML = "";

    if (!form || !studentNumber) {
      resultMessage.innerHTML = '<div class="error">Enter form and student number.</div>';
      return;
    }

    const url = `https://raw.githubusercontent.com/magawass/ui/main/${form.toLowerCase()}.csv`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          const data = results.data;
          const student = data.find(s => s["Exam Number"] === studentNumber);

          if (!student) {
            resultMessage.innerHTML = `<div class="error">Student not found in ${form} data.</div>`;
            return;
          }

          resultsTableHead.innerHTML = `<tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remarks</th></tr>`;
          let scores = [], passedSubjects = 0;

          for (const key in student) {
            if (["Exam Number", "STUDENT'S NAME"].includes(key)) continue;

            const score = parseFloat(student[key]) || 0;
            let grade, remark;

            if (score >= 80) grade = "A", remark = "Excellent";
            else if (score >= 65) grade = "B", remark = "Very Good";
            else if (score >= 55) grade = "C", remark = "Good";
            else if (score >= 40) grade = "D", remark = "Average";
            else grade = "F", remark = "Fail";

            if (score >= 40) passedSubjects++;
            scores.push(score);

            resultsTableBody.innerHTML += `<tr><td>${key}</td><td>${score}</td><td>${grade}</td><td>${remark}</td></tr>`;
          }

          const englishPass = parseFloat(student["ENGLISH"]) >= 40;
          const passedEnough = passedSubjects >= 6 && englishPass;
          const finalRemark = passedEnough ? "Pass" : "Fail";
          const avg = (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2);

          resultsSummary.innerHTML = `<p>Average: ${avg}</p><p>Remarks: ${finalRemark}</p>`;
          resultsContainer.classList.remove("hidden");
          resultMessage.innerHTML = `<div class="success">Results loaded for ${student["STUDENT'S NAME"]} (${student["Exam Number"]}).</div>`;
        }
      });
    } catch (err) {
      resultMessage.innerHTML = `<div class="error">Failed to load results. Check file name or format.</div>`;
    }
  };

  document.getElementById("back-btn").onclick = () => {
    resultsContainer.classList.add("hidden");
    resultMessage.innerHTML = "";
  };

  document.getElementById("print-btn").onclick = () => window.print();
});
