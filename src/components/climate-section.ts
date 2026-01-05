import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ClimateEntityConfig } from '../types';
import { cssVariables, sectionStyles, typographyStyles } from '../styles';
import { getFriendlyName } from '../utils/format';

import './climate-row';

@customElement('climate-section')
export class ClimateSection extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: ClimateEntityConfig;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${sectionStyles}
    
    :host {
      display: block;
    }
  `;

  private _getSectionName(): string {
    if (this.config?.section_name) {
      return this.config.section_name;
    }
    
    // Derive from entity name
    const entity = this.hass?.states[this.config?.entity];
    const name = this.config?.name ?? getFriendlyName(this.config.entity, entity?.attributes);
    
    // Try to extract a location name (e.g., "Garage Air Con" -> "Garage")
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0].toUpperCase();
    }
    
    return name.toUpperCase();
  }

  render() {
    if (!this.config) {
      return nothing;
    }

    const sectionName = this._getSectionName();

    return html`
      <div class="section">
        <div class="section-header-row">
          <span class="section-header">${sectionName}</span>
        </div>
        
        <climate-row
          .hass=${this.hass}
          .config=${this.config}
        ></climate-row>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'climate-section': ClimateSection;
  }
}
