(function () {
  // Create UI elements
  const panel = document.createElement('div');
  panel.id = 'beepbox-preset-panel';
  panel.innerHTML = `
    <h3>Instrument Library</h3>
    
    <!-- Folder Creation -->
    <div class="panel-section">
      <div class="input-group">
        <input type="text" id="folder-name-input" placeholder="New Folder Name..." />
        <button id="btn-add-folder">+ Folder</button>
      </div>
    </div>

    <!-- Preset Creation -->
    <div class="panel-section">
      <div class="input-group">
        <select id="folder-select"></select>
      </div>
      <div class="input-group">
        <input type="text" id="preset-name-input" placeholder="Preset Name..." />
        <button id="btn-save-preset">Save Copied</button>
      </div>
    </div>

    <!-- Backup & Restore (Export / Import) -->
    <div class="panel-section backup-section">
      <div class="input-group">
        <button id="btn-export-all" class="btn-secondary" title="Export all folders and presets to JSON">Export All</button>
        <button id="btn-import-json" class="btn-secondary" title="Import presets from JSON file">Import JSON</button>
        <input type="file" id="file-import-input" accept=".json" style="display: none;" />
      </div>
    </div>

    <!-- Folder/Preset Tree View -->
    <div id="tree-container"></div>
  `;
  document.body.appendChild(panel);

  const folderInput = document.getElementById('folder-name-input');
  const addFolderBtn = document.getElementById('btn-add-folder');
  const folderSelect = document.getElementById('folder-select');
  const presetInput = document.getElementById('preset-name-input');
  const savePresetBtn = document.getElementById('btn-save-preset');
  const treeContainer = document.getElementById('tree-container');
  const exportAllBtn = document.getElementById('btn-export-all');
  const importJsonBtn = document.getElementById('btn-import-json');
  const fileImportInput = document.getElementById('file-import-input');

  // Load and render folders and presets
  function loadData() {
    chrome.storage.local.get(['beepbox_folders', 'beepbox_presets', 'open_folders'], (result) => {
      let folders = result.beepbox_folders || {};
      const openFolders = result.open_folders || {};

      // MIGRATION: Convert old flat presets into "Uncategorized" folder if they exist
      if (result.beepbox_presets && Object.keys(result.beepbox_presets).length > 0) {
        folders['Uncategorized'] = folders['Uncategorized'] || {};
        Object.assign(folders['Uncategorized'], result.beepbox_presets);
        chrome.storage.local.set({ beepbox_folders: folders });
        chrome.storage.local.remove('beepbox_presets');
      }

      // Default folder if empty
      if (Object.keys(folders).length === 0) {
        folders['General'] = {};
      }

      // Update dropdown selector
      folderSelect.innerHTML = '';
      for (const folderName of Object.keys(folders)) {
        const option = document.createElement('option');
        option.value = folderName;
        option.textContent = folderName;
        folderSelect.appendChild(option);
      }

      // Render Tree UI
      treeContainer.innerHTML = '';
      for (const [folderName, presets] of Object.entries(folders)) {
        const isOpen = openFolders[folderName] !== false; // Default to open

        const folderEl = document.createElement('div');
        folderEl.className = 'folder-group';
        folderEl.dataset.folder = folderName;

        folderEl.innerHTML = `
          <div class="folder-header">
            <button class="btn-toggle-folder">${isOpen ? '▼' : '►'}</button>
            <span class="folder-title" title="${folderName}">${folderName}</span>
            <div class="actions">
              <button class="btn-export-folder" title="Export this folder only">⤓</button>
              <button class="btn-delete-folder" title="Delete Folder">×</button>
            </div>
          </div>
          <ul class="preset-list" style="display: ${isOpen ? 'block' : 'none'};">
            ${
              Object.keys(presets).length === 0
                ? `<li class="empty-msg">No instruments saved yet</li>`
                : Object.entries(presets)
                    .map(
                      ([pName]) => `
              <li class="preset-item" data-preset="${pName}">
                <span class="preset-label" title="${pName}">${pName}</span>
                <input type="text" class="rename-input" value="${pName}" style="display: none;" />
                <div class="actions">
                  <button class="btn-apply" title="Copy to clipboard">Copy</button>
                  <button class="btn-rename" title="Rename preset">✎</button>
                  <button class="btn-save-rename" style="display: none;" title="Save">✓</button>
                  <button class="btn-cancel-rename" style="display: none;" title="Cancel">✕</button>
                  <button class="btn-delete-preset" title="Delete preset">×</button>
                </div>
              </li>`
                    )
                    .join('')
            }
          </ul>
        `;

        treeContainer.appendChild(folderEl);
      }
    });
  }

  // Helper to trigger JSON download
  function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Create Folder
  addFolderBtn.addEventListener('click', () => {
    const name = folderInput.value.trim();
    if (!name) return alert('Enter a folder name.');

    chrome.storage.local.get(['beepbox_folders'], (result) => {
      const folders = result.beepbox_folders || {};
      if (folders[name]) return alert('Folder already exists.');

      folders[name] = {};
      chrome.storage.local.set({ beepbox_folders: folders }, () => {
        folderInput.value = '';
        loadData();
      });
    });
  });

  // Save Instrument into Selected Folder
  savePresetBtn.addEventListener('click', async () => {
    const presetName = presetInput.value.trim();
    const folderName = folderSelect.value;

    if (!presetName) return alert('Please enter an instrument name.');
    if (!folderName) return alert('Please select a folder.');

    try {
      const text = await navigator.clipboard.readText();

      chrome.storage.local.get(['beepbox_folders'], (result) => {
        const folders = result.beepbox_folders || {};
        folders[folderName] = folders[folderName] || {};
        folders[folderName][presetName] = text;

        chrome.storage.local.set({ beepbox_folders: folders }, () => {
          presetInput.value = '';
          loadData();
        });
      });
    } catch (err) {
      alert('Please select BeepBox, press Shift+C to copy an instrument first, then click Save Copied.');
    }
  });

  // EXPORT ALL FOLDERS
  exportAllBtn.addEventListener('click', () => {
    chrome.storage.local.get(['beepbox_folders'], (result) => {
      const folders = result.beepbox_folders || {};
      if (Object.keys(folders).length === 0) {
        return alert('No preset folders to export.');
      }
      downloadJSON(folders, 'beepbox_library_backup.json');
    });
  });

  // IMPORT JSON (Triggers file picker)
  importJsonBtn.addEventListener('click', () => {
    fileImportInput.click();
  });

  fileImportInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (typeof importedData !== 'object' || importedData === null) {
          throw new Error('Invalid format');
        }

        chrome.storage.local.get(['beepbox_folders'], (result) => {
          const currentFolders = result.beepbox_folders || {};

          // CASE 1: Full Library Structure { "Folder1": { "Preset1": "..." } }
          if (Object.values(importedData).every(val => typeof val === 'object' && val !== null)) {
            for (const [fName, presets] of Object.entries(importedData)) {
              currentFolders[fName] = currentFolders[fName] || {};
              Object.assign(currentFolders[fName], presets);
            }
          } 
          // CASE 2: Single Folder / Flat Presets { "Preset1": "..." }
          else {
            const targetFolder = prompt('Enter a folder name to import these presets into:', 'Imported Presets') || 'Imported Presets';
            currentFolders[targetFolder] = currentFolders[targetFolder] || {};
            Object.assign(currentFolders[targetFolder], importedData);
          }

          chrome.storage.local.set({ beepbox_folders: currentFolders }, () => {
            alert('Presets successfully imported!');
            fileImportInput.value = ''; // Reset input
            loadData();
          });
        });
      } catch (err) {
        alert('Failed to parse JSON file. Make sure it is a valid BeepBox preset JSON.');
      }
    };
    reader.readAsText(file);
  });

  // Event Delegation for Tree Interactions
  treeContainer.addEventListener('click', async (e) => {
    const folderEl = e.target.closest('.folder-group');
    if (!folderEl) return;
    const folderName = folderEl.dataset.folder;

    // Toggle Folder Accordion
    if (e.target.classList.contains('btn-toggle-folder') || e.target.classList.contains('folder-title')) {
      const list = folderEl.querySelector('.preset-list');
      const toggleBtn = folderEl.querySelector('.btn-toggle-folder');
      const isCurrentlyOpen = list.style.display !== 'none';

      list.style.display = isCurrentlyOpen ? 'none' : 'block';
      toggleBtn.textContent = isCurrentlyOpen ? '►' : '▼';

      // Persist state
      chrome.storage.local.get(['open_folders'], (result) => {
        const openFolders = result.open_folders || {};
        openFolders[folderName] = !isCurrentlyOpen;
        chrome.storage.local.set({ open_folders: openFolders });
      });
      return;
    }

    // Export Single Folder
    if (e.target.classList.contains('btn-export-folder')) {
      chrome.storage.local.get(['beepbox_folders'], (result) => {
        const folders = result.beepbox_folders || {};
        const singleFolderData = { [folderName]: folders[folderName] || {} };
        const filename = `${folderName.toLowerCase().replace(/\s+/g, '_')}_presets.json`;
        downloadJSON(singleFolderData, filename);
      });
      return;
    }

    // Delete Folder
    if (e.target.classList.contains('btn-delete-folder')) {
      if (confirm(`Delete folder "${folderName}" and all instruments inside?`)) {
        chrome.storage.local.get(['beepbox_folders'], (result) => {
          const folders = result.beepbox_folders || {};
          delete folders[folderName];
          chrome.storage.local.set({ beepbox_folders: folders }, () => loadData());
        });
      }
      return;
    }

    // Preset-level actions
    const presetLi = e.target.closest('.preset-item');
    if (!presetLi) return;
    const presetName = presetLi.dataset.preset;

    // Copy Preset to Clipboard
    if (e.target.classList.contains('btn-apply')) {
      chrome.storage.local.get(['beepbox_folders'], async (result) => {
        const data = result.beepbox_folders?.[folderName]?.[presetName];
        if (data) {
          await navigator.clipboard.writeText(data);
          alert(`"${presetName}" copied to clipboard! Click into BeepBox and press Shift+V.`);
        }
      });
    }

    // Start Rename Preset
    else if (e.target.classList.contains('btn-rename')) {
      presetLi.querySelector('.preset-label').style.display = 'none';
      presetLi.querySelector('.btn-apply').style.display = 'none';
      presetLi.querySelector('.btn-rename').style.display = 'none';
      presetLi.querySelector('.btn-delete-preset').style.display = 'none';

      const input = presetLi.querySelector('.rename-input');
      input.style.display = 'block';
      input.focus();
      input.select();

      presetLi.querySelector('.btn-save-rename').style.display = 'inline-block';
      presetLi.querySelector('.btn-cancel-rename').style.display = 'inline-block';
    }

    // Save Preset Rename
    else if (e.target.classList.contains('btn-save-rename')) {
      const newName = presetLi.querySelector('.rename-input').value.trim();
      if (!newName) return alert('Name cannot be empty.');

      chrome.storage.local.get(['beepbox_folders'], (result) => {
        const folders = result.beepbox_folders || {};
        if (folders[folderName] && folders[folderName][presetName]) {
          const data = folders[folderName][presetName];
          delete folders[folderName][presetName];
          folders[folderName][newName] = data;

          chrome.storage.local.set({ beepbox_folders: folders }, () => loadData());
        }
      });
    }

    // Cancel Rename
    else if (e.target.classList.contains('btn-cancel-rename')) {
      loadData();
    }

    // Delete Preset
    else if (e.target.classList.contains('btn-delete-preset')) {
      chrome.storage.local.get(['beepbox_folders'], (result) => {
        const folders = result.beepbox_folders || {};
        if (folders[folderName]) {
          delete folders[folderName][presetName];
          chrome.storage.local.set({ beepbox_folders: folders }, () => loadData());
        }
      });
    }
  });

  loadData();
})();