import "./style.css";

let start; // Date.now()
let end; // Date.now() + duration

let progress = 0; // Percentage displayed on BSoD
let interval; // The updateProgress() interval
let intervalsToWait = 0; // Intervals to pause updating progress.
let intervalsToZoom = 0; // Intervals to not pause updating progress.

let fullscreened = false;

const defaults = {
	"bg-color": "#0078d7",
	emoticon: ":(",
	"big-message": "Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.",
	"more-info": "For more information about this issue and possible fixes, visit https://windows.com/stopcode",
	"support-info": "If you call a support person, give them this info:",
	"stop-code": "INVALID_DATA_ACCESS_TRAP",
};

const textKeys = ["emoticon", "big-message", "more-info", "support-info", "stop-code"];

// Changing background and theme color (affects iOS)
document.getElementsByName("bg-color").forEach(element => {
	element.addEventListener("change", () => {
		document.querySelector("meta[name='theme-color']")
			.setAttribute("content", element.value);
		document.querySelector("main")
			.style.setProperty("background-color", element.value);
	});
});

// Starting the BSoD
document.querySelector("#form").addEventListener("submit", event => {
	// Get data from form, set text on screen
	event.preventDefault();
	const formData = new FormData(event.target);

	console.log(formData);

	for (const key of textKeys) {
		console.log(key, formData.get(key));
		document.getElementById(key).textContent = formData.get(key) || defaults[key];
	}

	// Get a time to end the BSoD
	start = Date.now();
	const duration = Number(formData.get("duration")) * 1000 || 30e3;
	end = start + duration;

	// Resetting progress variables + text
	document.querySelector("#progress-percentage").textContent = 0;
	progress = 0;
	intervalsToWait = Math.min(10, Math.floor(duration / 200));
	intervalsToZoom = 0;

	console.group("BSOD at " + start);

	console.log("Blue screening for " + duration + "ms");

	// Setting background and theme color again, just in case
	const bgColor = formData.get("bg-color") || defaults["bg-color"];
	document.querySelector("meta[name='theme-color']")
		.setAttribute("content", bgColor);
	document.querySelector("main")
		.style.setProperty("background-color", bgColor);
	document.body.style.setProperty("background-color", bgColor);

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

	// Make BSoD visible.
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

// Randomly updating the "% complete". (This is a mess…)
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
			console.log("waiting " + intervalsToWait + " intervals");
		}

		document.querySelector("#progress-percentage").textContent = progress.toFixed(0);
		console.log(intervalsToWait, intervalsToZoom, percent);
	}, 100);
}

/* Display a warning if on iPad. */
if (
	/iPad/.test(navigator.platform)
	|| (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
) {
	const iosWarning = document.querySelector("#ios-warning");
	iosWarning.style.setProperty("display", "block");
}
