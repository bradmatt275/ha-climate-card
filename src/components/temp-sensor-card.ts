import { LitElement, html, css, PropertyValues, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { TemperatureSensorConfig, TemperatureHistoryPoint } from '../types';
import { cssVariables, sensorCardStyles, typographyStyles } from '../styles';
import { getTemperatureColor, getTemperatureColorHex } from '../utils/temperature-color';
import { formatTemperature, formatHumidity, parseStateNumber } from '../utils/format';
import { fetchHistory, downsampleHistory } from '../utils/history';

import './sparkline';

@customElement('temp-sensor-card')
export class TempSensorCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TemperatureSensorConfig;
  @property({ type: Number }) trendHours = 12;

  @state() private _history: TemperatureHistoryPoint[] = [];
  @state() private _loading = false;

  static styles = css`
    ${cssVariables}
    ${sensorCardStyles}
    ${typographyStyles}
    
    :host {
      display: block;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchHistory();
  }

  willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('config') && this.config?.temperature_entity) {
      this._fetchHistory();
    }
  }

  private async _fetchHistory(): Promise<void> {
    if (!this.hass || !this.config?.temperature_entity || this._loading) return;

    this._loading = true;

    try {
      const history = await fetchHistory(
        this.hass,
        this.config.temperature_entity,
        this.trendHours
      );
      
      // Downsample to ~50 points for smooth rendering
      this._history = downsampleHistory(history, 50);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      this._history = [];
    } finally {
      this._loading = false;
    }
  }

  private _handleClick(): void {
    // Open more-info dialog for the temperature entity
    fireEvent(this, 'hass-more-info', {
      entityId: this.config.temperature_entity,
    });
  }

  private _getTemperature(): number | null {
    const entity = this.hass?.states[this.config?.temperature_entity];
    return parseStateNumber(entity?.state) ?? null;
  }

  private _getHumidity(): number | null {
    if (!this.config?.humidity_entity) return null;
    const entity = this.hass?.states[this.config.humidity_entity];
    return parseStateNumber(entity?.state) ?? null;
  }

  render() {
    const temperature = this._getTemperature();
    const humidity = this._getHumidity();
    
    const tempColor = temperature != null 
      ? getTemperatureColor(temperature) 
      : 'var(--primary-text-color)';
    
    const sparklineColor = temperature != null 
      ? getTemperatureColorHex(temperature) 
      : '#9CA3AF';

    return html`
      <div 
        class="sensor-card"
        @click=${this._handleClick}
        role="button"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._handleClick();
          }
        }}
      >
        <div class="sensor-card-header">
          <span class="sensor-name">${this.config?.name ?? 'Sensor'}</span>
        </div>
        <div class="sensor-values">
          <span 
            class="sensor-temp value-text" 
            style="color: ${tempColor}"
          >
            ${temperature != null 
              ? formatTemperature(temperature, 1) 
              : '--'}
          </span>
          ${humidity != null ? html`
            <span class="sensor-humidity">
              <ha-icon icon="mdi:water-percent"></ha-icon>
              ${formatHumidity(humidity, 1)}
            </span>
          ` : nothing}
        </div>
        <div class="sensor-sparkline">
          <sparkline-chart
            .data=${this._history}
            .color=${sparklineColor}
            .height=${40}
            ?animated=${true}
          ></sparkline-chart>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'temp-sensor-card': TempSensorCard;
  }
}
