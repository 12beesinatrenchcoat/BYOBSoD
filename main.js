import "./style.css";

let start; // Date.now()
let end; // Date.now() + duration

let progress = 0; // Percentage displayed on BSoD
let interval; // The updateProgress() interval
let intervalsToWait = 0; // Intervals to pause updating progress.
let intervalsToZoom = 0; // Intervals to not pause updating progress.

let fullscreened = false;

function updateProgress() {
	interval = setInterval(() => {
		const current = Date.now();

		if (current >= end) {
			progress = 100;
			document.querySelector("#progress-percentage").textContent = "100";
			console.log("BSOD done!");
			clearInterval(interval);

			setTimeout(() => {
				document.querySelector("main").style.setProperty("display", "none");
				document.body.style.removeProperty("background-color");
				if (fullscreened) {
					const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
					exitFullscreen.call(document);
				}
			}, 1000);
		}

		if (intervalsToZoom >= 1) {
			intervalsToZoom--;
		} else if (intervalsToWait >= 1) {
			intervalsToWait--;
			return;
		}

		const percent = (current - start) / (end - start);
		const percentSquared = percent ** 2;
		progress = Math.min(100, Math.max(
			100 * ((percentSquared / ((2 * (percentSquared - percent)) + 1)) + ((Math.random() * 0.1) - 0.08)),
			progress, // Make sure progress doesn't go down
		));

		if (Math.random() * percent > 0.6) {
			intervalsToZoom = Math.round(Math.random() * 10) + 1;
			console.log("zooming " + intervalsToZoom);
		} else {
			intervalsToWait = Math.round((Math.random() * (Math.min(((end - current) / 100) - 10, 75) + 10)));
			console.log("waiting " + intervalsToWait);
		}

		document.querySelector("#progress-percentage").textContent = progress.toFixed(0);
		console.log(intervalsToWait, intervalsToZoom, percent);
	}, 100);
}

// Changing background and theme color (affects iOS)
document.getElementsByName("bg-color").forEach(element => {
	element.addEventListener("change", () => {
		document.querySelector("meta[name='theme-color'")
			.setAttribute("content", element.value);
		document.querySelector("main")
			.style.setProperty("background-color", element.value);
	});
});

// Starting the BSOD
document.querySelector("#create").addEventListener("click", () => {
	start = Date.now();
	const duration = document.querySelector("input[name='length']")
		.valueAsNumber * 1000 || 30e3;
	end = start + duration;
	console.group("BSOD at " + start);

	console.log("Blue screening for " + duration + "ms");

	// Setting background and theme color again, just in case
	document.getElementsByName("bg-color").forEach(element => {
		if (element.checked) {
			document.querySelector("meta[name='theme-color'")
				.setAttribute("content", element.value);
			document.querySelector("main")
				.style.setProperty("background-color", element.value);
			document.body.style.setProperty("background-color", element.value);
		}
	});

	// Setting text
	console.group("Setting text…");
	document.querySelectorAll("fieldset > label > input[type='text']").forEach(input => {
		const bsodElement = document.querySelector("#" + input.getAttribute("name"));
		const inputValue = input.value || input.getAttribute("placeholder");
		console.log(bsodElement, inputValue);
		bsodElement.textContent = inputValue;
	});

	// Resetting variables/text
	document.querySelector("#progress-percentage").textContent = 0;
	progress = 0;
	intervalsToWait = Math.min(10, Math.floor(duration / 200));
	intervalsToZoom = 0;

	console.groupEnd(1);

	const bsodElement = document.querySelector("main");

	try {
		// For Safari. Fullscreen is supported on iPadOS / iOS >= 12, but not iPhone
		const fullscreen = bsodElement.requestFullscreen || bsodElement.webkitRequestFullscreen;
		fullscreen.call(bsodElement, {navigationUI: "hide"});
		fullscreened = true;
	} catch (error) {
		fullscreened = false;
		console.error(error);
	}

	bsodElement.style.setProperty("display", "flex");
	updateProgress();
});

// Cancelling BSOD
function cancelBSOD() {
	clearInterval(interval);
	document.querySelector("main").style.setProperty("display", "none");
	document.body.style.removeProperty("background-color");
	console.log("BSOD cancelled.");
	console.groupEnd(1);
}

document.addEventListener("keydown", event => {
	if (event.key === "Escape") {
		cancelBSOD();
	}
});

document.addEventListener("fullscreenchange", () => {
	if (!document.fullscreenElement) {
		cancelBSOD();
		fullscreened = false;
	}
});

document.addEventListener("webkitfullscreenchange", () => {
	if (!document.webkitFullscreenElement) {
		cancelBSOD();
		fullscreened = false;
	}
});

/* IOS Warning */
if (
	/iPad/.test(navigator.platform)
	|| (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
) {
	const iosWarning = document.querySelector("#ios-warning");
	iosWarning.style.setProperty("display", "block");
}
