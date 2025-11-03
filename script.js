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

    const url = `https://raw.githubusercontent.com/magawass/ui/main/${form.toLowerCase()}.json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const student = data.find(s => s.StudentNumber === studentNumber);

      if (!student) {
        resultMessage.innerHTML = `<div class="error">Student not found in ${form} data.</div>`;
        return;
      }

      resultsTableHead.innerHTML = `<tr><th>Subject</th><th>Score</th><th>Grade</th><th>Remarks</th><th>Teacher</th></tr>`;
      let scores = [], passedSubjects = 0;

      for (const key in student) {
        if (["StudentNumber", "Name"].includes(key) || key.endsWith("Teacher")) continue;

        const score = parseFloat(student[key]) || 0;
        const teacher = student[`${key}Teacher`] || "N/A";
        let grade, remark;

        if (form === "Form1" || form === "Form2") {
          if (score >= 80) grade = "A", remark = "Excellent";
          else if (score >= 65) grade = "B", remark = "Very Good";
          else if (score >= 55) grade = "C", remark = "Good";
          else if (score >= 40) grade = "D", remark = "Average";
          else grade = "F", remark = "Fail";
          if (score >= 40) passedSubjects++;
          scores.push(score);
        } else {
          if (score >= 80) grade = 1, remark = "Distinction";
          else if (score >= 75) grade = 2, remark = "Distinction";
          else if (score >= 70) grade = 3, remark = "Strong Credit";
          else if (score >= 65) grade = 4, remark = "Strong Credit";
          else if (score >= 60) grade = 5, remark = "Credit";
          else if (score >= 55) grade = 6, remark = "Credit";
          else if (score >= 45) grade = 7, remark = "Pass";
          else if (score >= 35) grade = 8, remark = "Pass";
          else grade = 9, remark = "Fail";
          if (grade <= 8) passedSubjects++;
          scores.push(grade);
        }

        resultsTableBody.innerHTML += `<tr><td>${key}</td><td>${score}</td><td>${grade}</td><td>${remark}</td><td>${teacher}</td></tr>`;
      }

      const englishPass = Object.keys(student).some(sub =>
        sub.toLowerCase().includes("english") && (
          (form === "Form1" || form === "Form2") ? parseFloat(student[sub]) >= 40 : parseFloat(student[sub]) <= 8
        )
      );
      const passedEnough = passedSubjects >= 6 && englishPass;
      const finalRemark = passedEnough ? "Pass" : "Fail";

      if (form === "Form1" || form === "Form2") {
        const avg = (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2);
        resultsSummary.innerHTML = `<p>Average: ${avg}</p><p>Remarks: ${finalRemark}</p>`;
      } else {
        const bestSix = scores.sort((a,b)=>a-b).slice(0,6);
        const aggregate = bestSix.reduce((a,b)=>a+b,0);
        resultsSummary.innerHTML = `<p>Aggregate: ${aggregate}</p><p>Remarks: ${finalRemark}</p>`;
      }

      resultsContainer.classList.remove("hidden");
      resultMessage.innerHTML = `<div class="success">Results loaded for ${student.Name} (${student.StudentNumber}).</div>`;
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
