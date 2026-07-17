// dom/components/gloryView.js

import { lineups } from '../../data/roster.js';
import { createRow, createPPRow, createGoalieRow } from './lineupRow.js';

export function renderGloryView() {
  const actualAttack = lineups.even.filter(item => item.f && !item.name.includes("Vara"));
  const actualDefense = lineups.even.filter(item => item.d && !item.name.includes("Vara"));
  const reserves = lineups.even.filter(item => item.name.includes("Vara"));

  return `
    <div class="glory-container">
      <div class="glory-section even">
        <h2 class="section-main-title">KentÃ¤lliset</h2>
        <div class="lineup-stack">
          ${actualAttack.map(line => `
            <div class="lineup-block">
              <div class="lineup-header">${line.name}</div>
              <div class="formation">${createRow(line.f, null)}</div>
            </div>`).join('')}
          ${actualDefense.map(line => `
            <div class="lineup-block">
              <div class="lineup-header">${line.name}</div>
              <div class="formation">${createRow(line.d, null)}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="glory-section pp">
        <h2 class="section-main-title">Ylivoima ðŸ”¥</h2>
        <div class="lineup-stack">
          ${lineups.pp.map(line => {
            const allRoles = [...(line.f || []), ...(line.d || [])];
            return `
              <div class="lineup-block">
                <div class="lineup-header">${line.name}</div>
                <div class="formation">
                  ${createPPRow(allRoles, null)}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="glory-section pk">
        <h2 class="section-main-title">Alivoima ðŸ§Š</h2>
        <div class="lineup-stack">
          ${lineups.pk.map(line => `
            <div class="lineup-block">
              <div class="lineup-header">${line.name}</div>
              <div class="formation">
                ${createRow(line.f, null)}
                ${createRow(line.d, null)}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="glory-section reserves">
        <h2 class="section-main-title">Varapelaajat</h2>
        <div class="lineup-stack">
          ${reserves.map(line => `
            <div class="lineup-block">
              <div class="lineup-header">${line.name}</div>
              <div class="formation">
                ${line.f ? createRow(line.f, null) : ''}
                ${line.d ? createRow(line.d, null) : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="glory-section goalies">
        <h2 class="section-main-title">Maalivahdit</h2>
        <div class="lineup-stack">
          <div class="lineup-block">
            <div class="formation">${createGoalieRow(null)}</div>
          </div>
        </div>
      </div>
    </div>`;
}