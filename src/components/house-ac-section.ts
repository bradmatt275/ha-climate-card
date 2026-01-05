import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { HouseACConfig } from '../types';
import { cssVariables, sectionStyles, typographyStyles } from '../styles';
import { DEFAULT_HOUSE_AC_CONFIG } from '../const';

import './ac-master-row';
import './ac-zone-row';

@customElement('house-ac-section')
export class HouseACSection extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: HouseACConfig;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${sectionStyles}
    
    :host {
      display: block;
    }
    
    .zones-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }
  `;

  render() {
    if (!this.config) {
      return nothing;
    }

    const name = this.config.name ?? DEFAULT_HOUSE_AC_CONFIG.name;
    const icon = this.config.icon ?? DEFAULT_HOUSE_AC_CONFIG.icon;

    return html`
      <div class="section">
        <div class="section-header-row">
          <span class="section-header">HOUSE AC</span>
        </div>
        
        <ac-master-row
          .hass=${this.hass}
          .name=${name}
          .icon=${icon}
          .powerEntity=${this.config.power_entity ?? ''}
          .modeEntity=${this.config.mode_entity}
          .fanEntity=${this.config.fan_entity}
        ></ac-master-row>
        
        ${this.config.zones?.length ? html`
          <div class="zones-container">
            ${this.config.zones.map(zone => html`
              <ac-zone-row
                .hass=${this.hass}
                .config=${zone}
              ></ac-zone-row>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'house-ac-section': HouseACSection;
  }
}
