document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. FIELD SURVEY
    // =====================================

    const surveyForm = document.getElementById("iotSurvey");

    if (surveyForm) {

        surveyForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const answers = new FormData(surveyForm);

            for (let i = 1; i <= 6; i++) {
                if (!answers.get("s" + i)) {
                    alert("Please answer all survey questions.");
                    return;
                }
            }

            const response = {};

            for (let i = 1; i <= 6; i++) {
                response["s" + i] = answers.get("s" + i);
            }

            let allResponses = [];

            try {
                allResponses = JSON.parse(
                    localStorage.getItem("iotSurveyResponses") || "[]"
                );

                if (!Array.isArray(allResponses)) {
                    allResponses = [];
                }

            } catch (error) {
                allResponses = [];
            }

            allResponses.push(response);

            try {
                localStorage.setItem(
                    "iotSurveyResponses",
                    JSON.stringify(allResponses)
                );
            } catch (error) {
                alert("Unable to save your response in this browser.");
                return;
            }

            const message = document.getElementById("surveyMessage");

            if (message) {
                message.innerHTML = `
                    <h3>Survey Submitted Successfully!</h3>
                    <p>Thank you for participating in our IoT Security Survey.</p>
                    <p>Your response has been saved successfully.</p>
                `;
            }

            surveyForm.reset();

        });

    }


    // =====================================
    // 2. SURVEY RESULTS
    // =====================================

    const totalElement = document.getElementById("totalResponses");

    if (totalElement) {

        let responses = [];

        try {
            responses = JSON.parse(
                localStorage.getItem("iotSurveyResponses") || "[]"
            );

            if (!Array.isArray(responses)) {
                responses = [];
            }

        } catch (error) {
            responses = [];
        }

        const noData = document.getElementById("noData");
        const chartBoxes = document.querySelectorAll(".chart-box");

        if (responses.length === 0) {

            if (noData) {
                noData.style.display = "block";
            }

            chartBoxes.forEach(function (box) {
                box.style.display = "none";
            });

            document.getElementById("resultConclusion").textContent =
                "No survey responses are available yet. Please complete the survey.";

        } else {

            if (noData) {
                noData.style.display = "none";
            }

            chartBoxes.forEach(function (box) {
                box.style.display = "block";
            });

            const total = responses.length;

            function countAnswers(question, answer) {
                return responses.filter(function (response) {
                    return response[question] === answer;
                }).length;
            }

            function getPercentage(count) {
                return Math.round((count / total) * 100);
            }

            document.getElementById("totalResponses").textContent = total;

            document.getElementById("deviceUsers").textContent =
                countAnswers("s1", "Yes");

            document.getElementById("awareUsers").textContent =
                countAnswers("s4", "Yes");


            // Create charts

            function createChart(elementId, question, options) {

                const chart = document.getElementById(elementId);

                if (!chart) return;

                let output = "";

                options.forEach(function (option) {

                    const count = countAnswers(question, option);
                    const percent = getPercentage(count);

                    output += `
                        <div class="chart-row">
                            <div class="chart-label">
                                <span>${option}</span>
                                <span>${count} (${percent}%)</span>
                            </div>

                            <div class="chart-track">
                                <div class="chart-fill"
                                     style="width: ${percent}%">
                                </div>
                            </div>
                        </div>
                    `;

                });

                chart.innerHTML = output;
            }


            createChart("deviceChart", "s2", [
                "Smart TV",
                "CCTV Camera",
                "Smart Watch",
                "Smart Speaker",
                "Other"
            ]);

            createChart("updateChart", "s3", [
                "Yes",
                "No",
                "Sometimes"
            ]);

            createChart("awarenessChart", "s4", [
                "Yes",
                "No",
                "Not Sure"
            ]);

            createChart("passwordChart", "s5", [
                "Yes",
                "No",
                "Sometimes"
            ]);


            // Generate conclusion

            const awareCount = countAnswers("s4", "Yes");
            const awarenessPercentage = getPercentage(awareCount);

            let conclusion = "";

            if (awarenessPercentage >= 70) {
                conclusion =
                    "The survey indicates a good level of IoT security awareness. Users should continue following safe security practices.";
            } else if (awarenessPercentage >= 40) {
                conclusion =
                    "The survey indicates a moderate level of IoT security awareness. More users should learn about security risks and protection methods.";
            } else {
                conclusion =
                    "The survey indicates that IoT security awareness needs improvement. More awareness and education are recommended.";
            }

            document.getElementById("resultConclusion").textContent =
                "A total of " + total +
                " responses were collected. " +
                awareCount + " respondents (" +
                awarenessPercentage +
                "%) reported awareness of IoT security risks. " +
                conclusion;

        }

    }


    // =====================================
    // 3. IOT SECURITY CHECKER
    // =====================================

    const checkerForm = document.getElementById("securityChecker");

    if (checkerForm) {

        const resultBox = document.getElementById("checkerResult");

        checkerForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const answers = new FormData(checkerForm);

            let score = 0;
            let suggestions = [];

            const tips = [
                "Use strong and unique passwords for your smart devices.",
                "Install the latest software and security updates.",
                "Protect your home Wi-Fi with a strong password.",
                "Change the default passwords provided with your devices.",
                "Review privacy settings and disable unnecessary permissions."
            ];

            for (let i = 1; i <= 5; i++) {

                const answer = answers.get("c" + i);

                if (!answer) {
                    alert("Please answer all five questions.");
                    return;
                }

                if (answer === "Yes") {
                    score += 20;
                } else {
                    suggestions.push(tips[i - 1]);
                }

            }


            // Find security category

            let category = "";
            let feedback = "";

            if (score >= 80) {

                category = "Excellent Security";
                feedback =
                    "You follow good basic IoT security practices. Keep protecting your smart devices.";

            } else if (score >= 60) {

                category = "Good Security";
                feedback =
                    "Your security practices are good, but a few improvements are still needed.";

            } else if (score >= 40) {

                category = "Needs Improvement";
                feedback =
                    "Your IoT security practices need improvement. Follow the suggestions below.";

            } else {

                category = "Poor Security";
                feedback =
                    "Your devices may have basic security weaknesses. Start improving your security practices.";

            }


            // Display suggestions

            let suggestionHTML = "";

            if (suggestions.length > 0) {

                suggestionHTML = "<h3>Recommended Improvements</h3><ul>";

                suggestions.forEach(function (tip) {
                    suggestionHTML += "<li>" + tip + "</li>";
                });

                suggestionHTML += "</ul>";

            } else {

                suggestionHTML =
                    "<p>You are following all five basic security practices. Great job!</p>";

            }


            // Display final result

            resultBox.innerHTML = `
                <h2>Your Security Score</h2>

                <h1>${score} / 100</h1>

                <h3>${category}</h3>

                <p>${feedback}</p>

                ${suggestionHTML}

                <p><small>
                    This is a basic self-assessment based on your answers.
                    It does not scan or test your actual devices.
                </small></p>
            `;

            resultBox.style.display = "block";

            resultBox.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        });


        // Clear result when reset is clicked

        checkerForm.addEventListener("reset", function () {

            resultBox.style.display = "none";
            resultBox.innerHTML = "";

        });

    }

});