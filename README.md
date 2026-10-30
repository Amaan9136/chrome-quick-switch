# Chrome Quick Switch

A small desktop app for finding and opening your existing Google Chrome profiles. Search by profile name, email address, or Chrome folder name, then open the profile with Enter or a click.

It is made for people who keep separate Chrome profiles for personal accounts, work, projects, and other parts of life. The app keeps the job simple: show the profiles already on your computer and get you into the right one quickly.

## What it does

- Finds Chrome profiles automatically on Windows, macOS, and common Linux setups.
- Searches profile names, account email addresses, and profile folder names.
- Numbers every profile, so you can type a number and press Enter to open it.
- Shows each profile's Google account picture when Chrome has one saved.
- Supports keyboard navigation with the Up and Down arrow keys.
- Opens the selected profile in Google Chrome.
- Refreshes the list when you create or rename profiles.
- Runs locally. It does not need an account, cloud service, or background process.

## What it does not do

- It does not create, rename, sync, or delete Chrome profiles.
- It does not read your saved passwords, browsing history, or cookies.
- It does not close other Chrome windows.
- It does not replace Google Chrome.

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- Google Chrome installed and opened at least once

### Run from source

```bash
git clone https://github.com/Amaan9136/chrome-quick-switch.git
cd chrome-quick-switch
npm install
npm start
```

### Build an installer

Build for the operating system you are currently using:

```bash
npm run dist
```

Or choose a platform explicitly:

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

Build output is placed in the `release` folder. Windows builds use NSIS, macOS builds use DMG, and Linux builds use AppImage and DEB packages.

A macOS app should be built on macOS, and a Windows installer should be built on Windows. For release builds across all three systems, use the included GitHub Actions workflow.

### Where the built app is stored

Everything the build produces is placed in the `release` folder inside the project. It is ignored by Git.

- Windows: the installer is `release\Chrome Quick Switch Setup 1.0.0.exe`. A ready-to-run copy that needs no install is `release\win-unpacked\Chrome Quick Switch.exe`.
- macOS: the `.dmg` file in `release`.
- Linux: the `.AppImage` and `.deb` files in `release`.

After you run the Windows installer, the app is installed for your user account, usually under `%LOCALAPPDATA%\Programs`, and appears in the Start menu. Until you build or install it, `npm start` runs the app straight from the project folder.

## Where profile information comes from

Chrome keeps a small profile index in a file named `Local State` inside its user data folder. This app reads the profile names, folder identifiers, and account email addresses from that index. It does not open or inspect individual profile databases. The only other file it reads is each profile's saved Google account picture, so avatars can be shown.

Default locations:

| Platform | Chrome user data folder |
| --- | --- |
| Windows | `%LOCALAPPDATA%\Google\Chrome\User Data` |
| macOS | `~/Library/Application Support/Google/Chrome` |
| Linux | `~/.config/google-chrome` |

On Linux, the app also checks common Chromium and Snap Chromium locations. If you use a custom Chrome data directory or a different Chromium-based browser, it may not be detected automatically.

## Privacy

Your profile list stays on your computer. The app does not send profile names, email addresses, or other profile details to a server. There is no analytics or telemetry code in this project.

The app needs access to Chrome's `Local State` file so it can display your profiles, and it starts Chrome with the selected profile folder when you choose one. Review the source code if you want to see exactly how this works.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Type | Filter profiles |
| Type a number | Show the profile with that number, then press Enter to open it |
| Up / Down | Move through the results |
| Enter | Open the selected profile |
| Escape | Clear the search |

## Troubleshooting

**No profiles found**

Open Google Chrome once using the same operating system account, then press Refresh in the app. Check that Chrome is using its default user data folder.

**Chrome does not open**

Make sure Google Chrome is installed. On Linux, make sure one of `google-chrome`, `google-chrome-stable`, `chromium`, or `chromium-browser` is available in your PATH.

**A profile is missing**

The app uses Chrome's profile index. Open the missing profile once in Chrome, then return to the app and refresh.

**I use more than one Chrome installation**

This first version checks the standard Chrome locations. Custom user data directories and managed enterprise installations may need a future configuration option.

**Electron failed to install correctly**

This appears when you run `npm start` and Electron's download step did not finish, so its program file is missing. Check whether `node_modules\electron\dist\electron.exe` exists. If it does not, delete `node_modules`, run `npm install` again, then run the Electron installer by hand and read its output:

```bash
npm config get ignore-scripts
node node_modules/electron/install.js
```

`ignore-scripts` should print `false`, and the `ELECTRON_SKIP_BINARY_DOWNLOAD` environment variable should not be set. If the download is blocked, set `ELECTRON_MIRROR` to a mirror and run the installer again. If it keeps failing on a very new Node version, run the installer with Node 22 and keep your own Node for everything else:

```bash
npx -y node@22 node_modules/electron/install.js
```

**The build fails with a symbolic link error on Windows**

Turn on Developer Mode in Windows settings, or run the terminal as administrator, then run `npm run dist:win` again.

**Profile pictures do not show**

Only profiles signed in to a Google account have a saved picture. Other profiles show their initials. Open the profile once in Chrome, then press Refresh in the app.

**Typing a number does not find a profile**

Numbers follow the order of the full list, which is sorted by name, so they change when you add or rename profiles. A number higher than the profile count is treated as normal search text.

## Contributing

Contributions are welcome. If you spot a bug or have an idea that would make profile switching easier, open an issue with your operating system and steps to reproduce it. For code changes, create a branch and submit a pull request with a short explanation of what changed and how you tested it.

Please avoid including personal profile data, email addresses, or screenshots that expose private account information in issues and pull requests.

## Roadmap ideas

- Support for custom Chrome and Chromium profile locations.
- Optional profile colors and favorites.
- Configurable keyboard shortcuts.
- Better detection for additional Chromium-based browsers.
- Optional launch-at-login setting.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).

## A note from the maintainer

I made this because switching between a lot of Chrome profiles should not feel like a chore. I wanted a small tool that gets out of the way, helps me find the account I need, and opens it without extra steps. If it helps you too, feel free to use it, improve it, and share what you build.