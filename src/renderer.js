const search = document.getElementById("search");
const list = document.getElementById("profiles");
const count = document.getElementById("count");
const message = document.getElementById("message");
const refresh = document.getElementById("refresh");
const version = document.getElementById("version");

let allProfiles = [];
let filtered = [];
let selectedIndex = 0;

function initials(name) {
  return (name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function render() {
  const query = search.value.trim().toLowerCase();
  filtered = allProfiles.filter(profile =>
    [profile.name, profile.email, profile.directory].some(value => (value || "").toLowerCase().includes(query))
  );
  selectedIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));
  count.textContent = `${filtered.length} of ${allProfiles.length}`;
  list.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = allProfiles.length ? "No profiles match that search." : "No Chrome profiles found.";
    list.append(empty);
    return;
  }

  filtered.forEach((profile, index) => {
    const button = document.createElement("button");
    button.className = `profile${index === selectedIndex ? " selected" : ""}`;
    button.type = "button";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === selectedIndex));

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = initials(profile.name);

    const copy = document.createElement("span");
    copy.className = "profile-copy";
    const name = document.createElement("span");
    name.className = "profile-name";
    name.textContent = profile.name;
    const email = document.createElement("span");
    email.className = "profile-email";
    email.textContent = profile.email || "No account email available";
    copy.append(name, email);

    const folder = document.createElement("span");
    folder.className = "profile-folder";
    folder.textContent = profile.directory;

    const mark = document.createElement("span");
    mark.className = "open-mark";
    mark.textContent = "↗";

    button.append(avatar, copy, folder, mark);
    button.addEventListener("mouseenter", () => { selectedIndex = index; updateSelection(); });
    button.addEventListener("click", () => openSelected(index));
    list.append(button);
  });
}

function updateSelection() {
  [...list.querySelectorAll(".profile")].forEach((button, index) => {
    button.classList.toggle("selected", index === selectedIndex);
    button.setAttribute("aria-selected", String(index === selectedIndex));
  });
  list.querySelectorAll(".profile")[selectedIndex]?.scrollIntoView({ block: "nearest" });
}

async function loadProfiles() {
  message.textContent = "Loading profiles…";
  refresh.disabled = true;
  try {
    allProfiles = await window.chromeQuickSwitch.getProfiles();
    selectedIndex = 0;
    render();
    message.textContent = "";
  } catch (error) {
    allProfiles = [];
    render();
    message.textContent = error.message || "Could not read Chrome profiles.";
  } finally {
    refresh.disabled = false;
  }
}

async function openSelected(index = selectedIndex) {
  const profile = filtered[index];
  if (!profile) return;
  message.textContent = `Opening ${profile.name}…`;
  try {
    await window.chromeQuickSwitch.openProfile(profile.directory);
    message.textContent = `Opened ${profile.name}.`;
  } catch (error) {
    message.textContent = error.message || "Could not open this profile.";
  }
}

search.addEventListener("input", () => { selectedIndex = 0; render(); });
search.addEventListener("keydown", event => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
    updateSelection();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex = Math.max(0, selectedIndex - 1);
    updateSelection();
  } else if (event.key === "Enter") {
    event.preventDefault();
    openSelected();
  } else if (event.key === "Escape") {
    search.value = "";
    selectedIndex = 0;
    render();
    search.blur();
  }
});
refresh.addEventListener("click", loadProfiles);
window.chromeQuickSwitch.onLaunchError(text => { message.textContent = text; });
window.chromeQuickSwitch.getVersion().then(value => { version.textContent = `v${value}`; });
loadProfiles();
