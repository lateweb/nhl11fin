// dom/components/playerChip.js

import { RosterDB } from '../../data/roster.js';

/* ========================================================
   Reusable customâ€‘select HTML generator (true combobox)
   ======================================================== */

export function createCustomSelectHTML({ players, selectedPlayerName, placeholder = 'Valitse pelaajaâ€¦' } = {}) {
  const groups =[
    {
      label: 'HyÃ¶kkÃ¤Ã¤jÃ¤t',
      players: players.filter(p => p.pos === 'F').sort((a, b) => a.number - b.number)
    },
    {
      label: 'Puolustajat',
      players: players.filter(p => p.pos === 'D').sort((a, b) => a.number - b.number)
    },
    {
      label: 'Maalivahdit',
      players: players.filter(p => p.pos === 'G').sort((a, b) => a.number - b.number)
    }
  ];

  const dropdownItems = groups
      .filter(g => g.players.length > 0)
      .map(g => {
        const options = g.players
          .map(p => {
            const selAttr = (selectedPlayerName && p.name === selectedPlayerName) ? 'aria-selected="true"' : 'aria-selected="false"';
            return `<div class="ss-option" role="option" data-value="${p.name}" ${selAttr}>#${p.number} ${p.name}</div>`;
          })
          .join('');
        return `<div class="ss-group-label" role="presentation">${g.label}</div>${options}`;
      })
      .join('');

  const selectedPlayer = selectedPlayerName
    ? players.find(p => p.name === selectedPlayerName)
    : null;
  const initialValue = selectedPlayer
    ? `#${selectedPlayer.number} ${selectedPlayer.name}`
    : '';

  return `
    <div class="searchable-select" role="combobox" aria-expanded="false" aria-haspopup="listbox">
      <div class="ss-input-wrapper">
        <input
          type="text"
          class="ss-trigger-input"
          placeholder="${placeholder}"
          value="${initialValue}"
          autocomplete="off"
          aria-autocomplete="list"
          aria-controls="ss-listbox"
        />
        <span class="ss-clear" aria-label="TyhjennÃ¤ valinta" role="button" tabindex="0">&times;</span>
      </div>
      <div class="ss-dropdown hidden" id="ss-listbox" role="listbox">
        <div class="ss-options-container">${dropdownItems}</div>
      </div>
    </div>`;
}

/* ========================================================
   Scroll trap
   ======================================================== */
function trapScroll(dropdown) {
  dropdown.addEventListener('wheel', (e) => {
    const { scrollTop, scrollHeight, clientHeight } = dropdown;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
    }
  }, { passive: false });
}

/* ========================================================
   Initialise the combobox
   ======================================================== */
export function initCustomSelect(rootElement, onChipClick) {
  const input = rootElement.querySelector('.ss-trigger-input');
  const clearBtn = rootElement.querySelector('.ss-clear');
  const dropdown = rootElement.querySelector('.ss-dropdown');
  const optionsContainer = dropdown.querySelector('.ss-options-container');

  const allOptions = Array.from(optionsContainer.querySelectorAll('.ss-option'));
  const allGroupLabels = Array.from(optionsContainer.querySelectorAll('.ss-group-label'));

  let isDropdownOpen = false;

  // Show dropdown (and filter based on current input text)
  const openDropdown = () => {
    dropdown.classList.remove('hidden');
    rootElement.setAttribute('aria-expanded', 'true');
    isDropdownOpen = true;
    filterOptions(input.value);
  };

  const closeDropdown = () => {
    dropdown.classList.add('hidden');
    rootElement.setAttribute('aria-expanded', 'false');
    isDropdownOpen = false;
  };

  const filterOptions = (query) => {
    const lowerQuery = query.toLowerCase();
    allOptions.forEach(opt => {
      const text = opt.textContent.toLowerCase();
      const match = lowerQuery === '' || text.includes(lowerQuery);
      opt.style.display = match ? '' : 'none';
    });

    allGroupLabels.forEach(label => {
      let next = label.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains('ss-group-label')) {
        if (next.style.display !== 'none') {
          hasVisible = true;
          break;
        }
        next = next.nextElementSibling;
      }
      label.style.display = hasVisible ? '' : 'none';
    });
  };

  const selectOption = (opt) => {
    const playerName = opt.dataset.value;
    if (playerName) {
      input.value = opt.textContent;   // "#26 Lehtinen"
    } else {
      input.value = '';
    }
    closeDropdown();
    onChipClick(playerName || null);
  };

  const clearSelection = () => {
    input.value = '';
    closeDropdown();
    onChipClick(null);
  };

  // â”€â”€ Input events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  input.addEventListener('focus', () => {
    if (!isDropdownOpen) openDropdown();
  });

  input.addEventListener('input', () => {
    if (!isDropdownOpen) openDropdown();
    filterOptions(input.value);
  });

  input.addEventListener('click', (e) => {
    e.stopPropagation();
    // If a selection is active, clicking the field acts like the Ã— button
    if (input.value.trim() !== '') {
      clearSelection();
      return;
    }
    // Otherwise, just open the dropdown
    if (!isDropdownOpen) openDropdown();
  });

  // â”€â”€ Clear button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSelection();
  });

  clearBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      clearSelection();
    }
  });

  // â”€â”€ Option selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Use mousedown to prevent input blur from closing dropdown before click registers
  optionsContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();  // prevent blur on input
    const opt = e.target.closest('.ss-option');
    if (opt) selectOption(opt);
  });

  // â”€â”€ Close dropdown on outside click â”€â”€â”€â”€â”€â”€â”€â”€â”€
  document.addEventListener('mousedown', (e) => {
    if (!rootElement.contains(e.target)) {
      closeDropdown();
    }
  });

  // â”€â”€ Trap scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  trapScroll(dropdown);
}

/* ========================================================
   Public render/attach helpers
   ======================================================== */
export function renderPlayerChips() {
  return createCustomSelectHTML({
    players: RosterDB,
    placeholder: 'Valitse pelaajaâ€¦'
  });
}

export function attachChipEvents(container, onChipClick) {
  const root = container.querySelector('.searchable-select');
  if (!root) return;
  initCustomSelect(root, onChipClick);
}

/* ========================================================
   Lineup selector
   ======================================================== */
export function renderLineupSelectorHTML(rosterNames, activeName) {
  const items = rosterNames.map(name => {
    const activeClass = (name === activeName) ? 'ss-option-active' : '';
    const selAttr = (name === activeName) ? 'aria-selected="true"' : 'aria-selected="false"';
    return `<div class="ss-option ${activeClass}" role="option" data-value="${name}" ${selAttr}>${name}</div>`;
  });

  return `
    <div class="searchable-select lineup-selector" role="combobox" aria-expanded="false" aria-haspopup="listbox">
      <button type="button" class="ss-trigger has-selection" aria-controls="lineup-listbox">
        <span class="ss-trigger-text">${activeName}</span>
      </button>
      <div class="ss-dropdown hidden" id="lineup-listbox" role="listbox">${items.join('')}</div>
    </div>`;
}

let lineupSelectorDocumentListenerAttached = false;

export function attachLineupSelectorEvents(container, onSelect) {
  const root = container.querySelector('.lineup-selector');
  if (!root) return;
  const trigger = root.querySelector('.ss-trigger');
  const triggerText = root.querySelector('.ss-trigger-text');
  const dropdown = root.querySelector('.ss-dropdown');

  const showDropdown = () => {
    dropdown.classList.remove('hidden');
    root.setAttribute('aria-expanded', 'true');
  };
  const hideDropdown = () => {
    dropdown.classList.add('hidden');
    root.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('hidden') ? showDropdown() : hideDropdown();
  });

  dropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('.ss-option');
    if (opt) {
      const value = opt.dataset.value;
      triggerText.textContent = value;
      hideDropdown();
      onSelect(value);
    }
  });

  trapScroll(dropdown);

  if (!lineupSelectorDocumentListenerAttached) {
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.lineup-selector').forEach(selector => {
        if (!selector.contains(e.target)) {
          selector.querySelector('.ss-dropdown')?.classList.add('hidden');
          selector.setAttribute('aria-expanded', 'false');
        }
      });
    });
    lineupSelectorDocumentListenerAttached = true;
  }
}