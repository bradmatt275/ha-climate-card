import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { TemperatureSensorsConfig } from '../types';
import { cssVariables, gridStyles, typographyStyles } from '../styles';
import { DEFAULT_TEMPERATURE_SENSORS_CONFIG } from '../const';

import './collapsible-section';
import './temp-sensor-card';

@customElement('temp-sensor-grid')
export class TempSensorGrid extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TemperatureSensorsConfig;
  @property({ type: Boolean }) collapsed = false;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${gridStyles}
    
    :host {
      display: block;
    }
    
    .sensor-grid {
      --columns: var(--temp-sensor-columns, 3);
    }
  `;

  private _handleToggle(): void {
    this.dispatchEvent(new CustomEvent('toggle-collapse', {
      bubbles: true,
      composed: true,
      detail: { section: 'temperatures', collapsed: !this.collapsed },
    }));
  }

  render() {
    if (!this.config?.sensors?.length) {
      return nothing;
    }

    const collapsible = this.config.collapsible ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.collapsible;
    const columns = this.config.columns ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.columns;
    const trendHours = this.config.trend_hours ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.trend_hours;

    return html`
      <collapsible-section
        title="TEMPERATURES"
        ?collapsed=${this.collapsed}
        ?collapsible=${collapsible}
        @toggle-collapse=${this._handleToggle}
      >
        <div 
          class="sensor-grid" 
          style="--temp-sensor-columns: ${columns}"
        >
          ${this.config.sensors.map(sensor => html`
            <temp-sensor-card
              .hass=${this.hass}
              .config=${sensor}
              .trendHours=${trendHours}
            ></temp-sensor-card>
          `)}
        </div>
      </collapsible-section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'temp-sensor-grid': TempSensorGrid;
  }
}
