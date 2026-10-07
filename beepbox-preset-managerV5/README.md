# 🎵 BeepBox & UltraBox Instrument Library Extension

A lightweight browser extension that lets you save, rename, organize into folders, and backup/restore custom instrument presets directly inside BeepBox, UltraBox, and other popular forks.

---

## ✨ Features

- **Folder Organization:** Group instruments into custom collapsible folders (e.g., *Bass*, *Leads*, *Drums*, *FX*).
- **One-Click Library Saving:** Copy an instrument in BeepBox/UltraBox (`Shift+C`) and save it directly to your extension library.
- **Quick Insertion:** Copy any saved preset back to your clipboard with a single click and paste it into your track (`Shift+V`).
- **Inline Renaming & Deletion:** Cleanly rename presets and folders or delete unwanted items.
- **JSON Backup & Import:** 
  - Export your entire library structure to a `.json` backup file.
  - Export individual folders as single preset packs.
  - Import preset packs or restore backups without losing folder structures.
- **Cross-Mod Compatibility:** Fully compatible across standard BeepBox and its major community forks.

---

## 🌐 Mod & Variant Compatibility

BeepBox and its forks use standard JSON text via the system clipboard to share instruments. Because of this shared architecture, this extension works seamlessly across:

| Platform | URL | Compatibility |
| :--- | :--- | :--- |
| **BeepBox** | `beepbox.co` | ✅ Fully Supported |
| **UltraBox** | `ultrabox.github.io` | ✅ Fully Supported |
| **JummBox** | `jummbox.github.io` | ✅ Fully Supported |
| **GoldBox / Modded** | Various | ✅ Fully Supported |

### 💡 Note on Cross-Platform Presets
* **UltraBox-to-UltraBox:** Saves and restores **100%** of UltraBox's advanced synthesis features, custom waves, effects, and modulation.
* **UltraBox-to-BeepBox:** Standard BeepBox gracefully ignores advanced UltraBox parameters it doesn't support, loading the closest matching base settings.
* **BeepBox-to-UltraBox:** Standard BeepBox presets open seamlessly inside UltraBox.

---

## 🚀 Installation Guide

1. Download or clone this repository to a folder on your computer.
2. Open your Chromium browser (Chrome, Edge, Brave) and navigate to `chrome://extensions`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select your extension project folder.
6. Open [BeepBox](https://www.beepbox.co/) or [UltraBox](https://ultrabox.github.io/)—the Instrument Library panel will appear in the top-right corner!

---

## 🛠️ How to Use

1. **Create Folders:** Type a name into **New Folder Name...** and click **+ Folder**.
2. **Design an Instrument:** Tweak your synth settings in BeepBox/UltraBox.
3. **Copy:** Select the channel and press `Shift + C` on your keyboard.
4. **Save:** Select your target folder from the dropdown, type an instrument name, and click **Save Copied**.
5. **Paste:** Click **Copy** next to any saved instrument in your library, select your target track in BeepBox, and press `Shift + V`.
6. **Backup / Share:** Click **Export All** to save your entire library as a `.json` file, or click the download icon (**⤓**) on a specific folder to export just that folder. Use **Import JSON** to load presets shared by others.