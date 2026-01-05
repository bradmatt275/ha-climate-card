import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ACZoneConfig, NumberEntityAttributes } from '../types';
import { cssVariables, rowStyles, buttonStyles, typographyStyles } from '../styles';
import { formatTemperature, formatPercentage } from '../utils/format';

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
    
    .zone-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    
    .zone-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      transition: all 150ms ease;
      cursor: pointer;
    }
    
    .zone-icon:hover {
      background: var(--divider-color);
    }
    
    .zone-icon.active {
      background: rgba(var(--rgb-primary-color), 0.2);
      color: var(--zone-active, var(--primary-color));
    }
    
    .zone-info {
      flex: 1;
      min-width: 0;
    }
    
    .zone-name {
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .zone-status {
      font-size: 12px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .zone-temp {
      font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
      font-variant-numeric: tabular-nums;
    }
    
    .zone-setpoint {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
      font-size: 16px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      min-width: 60px;
      justify-content: flex-end;
    }
    
    .zone-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  private _isPoweredOn(): boolean {
    const entity = this.hass?.states[this.config?.power_entity];
    return entity?.state === 'on';
  }

  private _getTemperature(): number | null {
    if (!this.config?.temperature_entity) return null;
    const entity = this.hass?.states[this.config.temperature_entity];
    if (!entity || entity.state === 'unknown' || entity.state === 'unavailable') {
      return null;
    }
    return parseFloat(entity.state);
  }

  private _getSetpoint(): number | null {
    // Try setpoint sensor first
    if (this.config?.setpoint_entity) {
      const entity = this.hass?.states[this.config.setpoint_entity];
      if (entity && entity.state !== 'unknown' && entity.state !== 'unavailable') {
        return parseFloat(entity.state);
      }
    }
    // Fall back to setpoint number entity
    if (this.config?.setpoint_number_entity) {
      const entity = this.hass?.states[this.config.setpoint_number_entity];
      if (entity && entity.state !== 'unknown' && entity.state !== 'unavailable') {
        return parseFloat(entity.state);
      }
    }
    return null;
  }

  private _getSetpointLimits(): { min: number; max: number; step: number } {
    if (!this.config?.setpoint_number_entity) {
      return { min: 16, max: 30, step: 1 };
    }
    const entity = this.hass?.states[this.config.setpoint_number_entity];
    const attrs = entity?.attributes as NumberEntityAttributes | undefined;
    
    return {
      min: attrs?.min ?? 16,
      max: attrs?.max ?? 30,
      step: attrs?.step ?? 1,
    };
  }

  private _getControlMode(): string | null {
    if (!this.config?.control_mode_entity) return null;
    const entity = this.hass?.states[this.config.control_mode_entity];
    return entity?.state ?? null;
  }

  private async _togglePower(): Promise<void> {
    if (!this.config?.power_entity) return;
    
    await this.hass.callService('switch', 'toggle', {
      entity_id: this.config.power_entity,
    });
  }

  private async _adjustSetpoint(delta: number): Promise<void> {
    if (!this.config?.setpoint_number_entity) return;
    
    const currentValue = this._getSetpoint();
    if (currentValue === null) return;

    const { min, max, step } = this._getSetpointLimits();
    const newValue = Math.max(min, Math.min(max, currentValue + delta * step));

    await this.hass.callService('number', 'set_value', {
      entity_id: this.config.setpoint_number_entity,
      value: newValue,
    });
  }

  private _handleDecrement(): void {
    this._adjustSetpoint(-1);
  }

  private _handleIncrement(): void {
    this._adjustSetpoint(1);
  }

  /**
   * Determine the effective mode based on control_mode_entity state
   * - If control_mode_entity exists and state is "Temperature" -> temperature mode
   * - If control_mode_entity exists and state is something else (Fan, etc) -> percentage mode
   * - If no control_mode_entity -> percentage mode (fan-only zones)
   */
  private _getEffectiveMode(): 'temperature' | 'percentage' {
    const controlMode = this._getControlMode();
    if (controlMode) {
      // Check if the mode indicates temperature control
      const tempModes = ['temperature', 'temp', 'heat', 'cool', 'auto'];
      return tempModes.some(m => controlMode.toLowerCase().includes(m)) 
        ? 'temperature' 
        : 'percentage';
    }
    // No control mode entity = fan-only zone, use percentage
    return 'percentage';
  }

  private _formatSetpoint(value: number): string {
    const mode = this._getEffectiveMode();
    if (mode === 'percentage') {
      return formatPercentage(value, 0);
    }
    return formatTemperature(value, 0);
  }

  render() {
    const isOn = this._isPoweredOn();
    const temperature = this._getTemperature();
    const setpoint = this._getSetpoint();
    const controlMode = this._getControlMode();
    const icon = this.config?.icon ?? 'mdi:air-conditioner';
    const { min, max } = this._getSetpointLimits();
    const hasSetpointControl = !!this.config?.setpoint_number_entity;
    const showSetpoint = setpoint !== null;

    const iconClasses = {
      'zone-icon': true,
      'active': isOn,
    };

    return html`
      <div class="zone-row">
        <div 
          class=${classMap(iconClasses)}
          @click=${this._togglePower}
          role="button"
          tabindex="0"
          aria-label="Toggle zone power"
        >
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        <div class="zone-info">
          <div class="zone-name">${this.config?.name ?? 'Zone'}</div>
          <div class="zone-status">
            <span>${isOn ? 'On' : 'Off'}</span>
            ${temperature !== null ? html`
              <span class="zone-temp">${formatTemperature(temperature, 1)}</span>
            ` : nothing}
            ${controlMode ? html`
              <span>${controlMode}</span>
            ` : nothing}
          </div>
        </div>
        
        ${showSetpoint ? html`
          <div class="zone-setpoint">
            ${this._formatSetpoint(setpoint!)}
          </div>
        ` : nothing}
        
        ${hasSetpointControl ? html`
          <div class="zone-controls">
            <control-button
              icon="mdi:minus"
              size="small"
              ?disabled=${setpoint === null || setpoint <= min}
              aria-label="Decrease setpoint"
              @button-click=${this._handleDecrement}
            ></control-button>
            <control-button
              icon="mdi:plus"
              size="small"
              ?disabled=${setpoint === null || setpoint >= max}
              aria-label="Increase setpoint"
              @button-click=${this._handleIncrement}
            ></control-button>
          </div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ac-zone-row': ACZoneRow;
  }
}
