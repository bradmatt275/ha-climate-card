import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ACZoneConfig, NumberEntityAttributes } from '../types';
import { cssVariables, rowStyles, buttonStyles, typographyStyles } from '../styles';
import { formatTemperature, formatPercentage, clamp } from '../utils/format';
import { DEFAULT_ZONE_STEP } from '../const';

import './control-button';

@customElement('ac-zone-row')
export class ACZoneRow extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: ACZoneConfig;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${rowStyles}
    ${buttonStyles}
    
    :host {
      display: block;
    }
    
    .zone-value {
      font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
      font-size: 16px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      min-width: 70px;
      text-align: right;
    }
    
    .row.active .row-icon {
      color: var(--zone-active);
      animation: zone-pulse 2s ease-in-out infinite;
    }
    
    @keyframes zone-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .value-type-icon {
      display: inline-flex;
      margin-right: 4px;
      vertical-align: middle;
    }
    
    .value-type-icon ha-icon {
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
    }
  `;

  private _getZoneState(): boolean {
    const entity = this.hass?.states[this.config?.state_entity];
    return entity?.state === 'on';
  }

  private _getZoneValue(): number | null {
    const entity = this.hass?.states[this.config?.value_entity];
    if (!entity || entity.state === 'unknown' || entity.state === 'unavailable') {
      return null;
    }
    return parseFloat(entity.state);
  }

  private _getValueLimits(): { min: number; max: number; step: number } {
    const entity = this.hass?.states[this.config?.value_entity];
    const attrs = entity?.attributes as NumberEntityAttributes | undefined;
    
    const defaultStep = this.config?.value_type === 'temperature' 
      ? DEFAULT_ZONE_STEP.temperature 
      : DEFAULT_ZONE_STEP.percentage;
    
    return {
      min: attrs?.min ?? (this.config?.value_type === 'temperature' ? 16 : 0),
      max: attrs?.max ?? (this.config?.value_type === 'temperature' ? 30 : 100),
      step: this.config?.step ?? attrs?.step ?? defaultStep,
    };
  }

  private async _adjustValue(delta: number): Promise<void> {
    const currentValue = this._getZoneValue();
    if (currentValue === null) return;

    const { min, max, step } = this._getValueLimits();
    const newValue = clamp(currentValue + delta * step, min, max);

    await this.hass.callService('number', 'set_value', {
      entity_id: this.config.value_entity,
      value: newValue,
    });
  }

  private _handleDecrement(): void {
    this._adjustValue(-1);
  }

  private _handleIncrement(): void {
    this._adjustValue(1);
  }

  private _formatValue(value: number): string {
    if (this.config?.value_type === 'percentage') {
      return formatPercentage(value, 1);
    }
    return formatTemperature(value, 1);
  }

  render() {
    const isActive = this._getZoneState();
    const value = this._getZoneValue();
    const icon = this.config?.icon ?? 'mdi:air-conditioner';
    const { min, max } = this._getValueLimits();

    const rowClasses = {
      'row': true,
      'active': isActive,
    };

    const valueIcon = this.config?.value_type === 'percentage' 
      ? 'mdi:valve' 
      : null;

    return html`
      <div class=${classMap(rowClasses)}>
        <div class="row-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="row-content">
          <span class="row-name">${this.config?.name ?? 'Zone'}</span>
          <span class="row-state">${isActive ? 'On' : 'Off'}</span>
        </div>
        <div class="zone-value value-text">
          ${valueIcon ? html`
            <span class="value-type-icon">
              <ha-icon .icon=${valueIcon}></ha-icon>
            </span>
          ` : ''}
          ${value !== null ? this._formatValue(value) : '--'}
        </div>
        <div class="row-controls">
          <control-button
            icon="mdi:minus"
            ?disabled=${value === null || value <= min}
            aria-label="Decrease"
            @button-click=${this._handleDecrement}
          ></control-button>
          <control-button
            icon="mdi:plus"
            ?disabled=${value === null || value >= max}
            aria-label="Increase"
            @button-click=${this._handleIncrement}
          ></control-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ac-zone-row': ACZoneRow;
  }
}
