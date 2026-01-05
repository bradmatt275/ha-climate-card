import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
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

  @state() private _zonesCollapsed = false;
  private _initializedCollapsed = false;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${sectionStyles}
    
    :host {
      display: block;
    }
    
    .zones-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    .zones-header:not(.collapsible) {
      cursor: default;
    }
    
    .zones-indicator {
      transition: transform 200ms ease;
      color: var(--secondary-text-color);
      --mdc-icon-size: 18px;
    }
    
    .zones-indicator.collapsed {
      transform: rotate(-90deg);
    }
    
    .zones-label {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      letter-spacing: 0.05em;
    }
    
    .zones-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
      transition: height 200ms ease, opacity 200ms ease;
    }
    
    .zones-container.collapsed {
      height: 0 !important;
      opacity: 0;
    }
  `;

  willUpdate(): void {
    // Initialize collapsed state from config on first render
    if (!this._initializedCollapsed && this.config) {
      this._zonesCollapsed = this.config.zones_collapsed ?? DEFAULT_HOUSE_AC_CONFIG.zones_collapsed;
      this._initializedCollapsed = true;
    }
  }

  private _toggleZones(): void {
    const collapsible = this.config.zones_collapsible ?? DEFAULT_HOUSE_AC_CONFIG.zones_collapsible;
    if (!collapsible) return;
    this._zonesCollapsed = !this._zonesCollapsed;
  }

  render() {
    if (!this.config) {
      return nothing;
    }

    const name = this.config.name ?? DEFAULT_HOUSE_AC_CONFIG.name;
    const icon = this.config.icon ?? DEFAULT_HOUSE_AC_CONFIG.icon;
    const zonesCollapsible = this.config.zones_collapsible ?? DEFAULT_HOUSE_AC_CONFIG.zones_collapsible;
    const hasZones = this.config.zones?.length > 0;

    const indicatorClasses = {
      'zones-indicator': true,
      'collapsed': this._zonesCollapsed,
    };

    const headerClasses = {
      'zones-header': true,
      'collapsible': zonesCollapsible,
    };

    const containerClasses = {
      'zones-container': true,
      'collapsed': this._zonesCollapsed,
    };

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
        
        ${hasZones ? html`
          ${zonesCollapsible ? html`
            <div 
              class=${classMap(headerClasses)}
              @click=${this._toggleZones}
              role="button"
              aria-expanded=${!this._zonesCollapsed}
              tabindex="0"
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this._toggleZones();
                }
              }}
            >
              <ha-icon 
                class=${classMap(indicatorClasses)}
                icon="mdi:chevron-down"
              ></ha-icon>
              <span class="zones-label">Zones</span>
            </div>
          ` : nothing}
          <div class=${classMap(containerClasses)}>
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
