import "./style.css";

let msCurrent = 0;
let msToComplete = 30e3;

let lastProgress = 0;
let progress = 0;
let started = false;

let timeout;

let fullscreened = false;

function updateProgress() {
	if (msToComplete <= msCurrent) {
		document.querySelector("#progress-percentage").textContent = "100";
		console.log("BSOD done!");
		timeout = setTimeout(() => {
			document.querySelector("main").style.setProperty("display", "none");
			document.body.style.removeProperty("background-color");
			if (fullscreened) {
				const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
				exitFullscreen.call(document);
			}
		}, 2000);
	} else {
		const rand = (msToComplete - msCurrent) > 1000
			? Math.floor(((Math.random() * Math.min((msToComplete / 2), 10000)) - 1000) + 1000)
			: 1000;

		if (started) {
			lastProgress = progress;
			progress = Math.max(
				Math.min((msCurrent / msToComplete * (((Math.random() * 0.5) + 0.5) * 100)) + ((Math.random() * 10) - 5), 99),
				lastProgress, // Make sure progress is always going up…
			);
		} else {
			progress = 0;
			started = true;
		}

		msCurrent += rand;

		document.querySelector("#progress-percentage").textContent = String(Math.floor(progress));
		timeout = setTimeout(updateProgress, rand);
	}
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

document.querySelector("#create").addEventListener("click", () => {
	console.group("BSOD at " + Date.now());
	msCurrent = 0;
	msToComplete = document.querySelector("input[name='length']").value * 1000 || 30000;
	started = false;

	console.log("Blue screening for " + msToComplete + "ms");

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
	msCurrent = 0;
	clearTimeout(timeout);
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
	document.querySelector("#ios-warning").style.setProperty("display", "block");
}
