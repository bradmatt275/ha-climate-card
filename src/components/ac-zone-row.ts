import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ACZoneConfig } from '../types';
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
    return null;
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

  private async _pressSetpointUp(): Promise<void> {
    if (!this.config?.setpoint_up_entity) return;
    
    await this.hass.callService('button', 'press', {
      entity_id: this.config.setpoint_up_entity,
    });
  }

  private async _pressSetpointDown(): Promise<void> {
    if (!this.config?.setpoint_down_entity) return;
    
    await this.hass.callService('button', 'press', {
      entity_id: this.config.setpoint_down_entity,
    });
  }

  private _handleDecrement(): void {
    this._pressSetpointDown();
  }

  private _handleIncrement(): void {
    this._pressSetpointUp();
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
    // Show controls if we have button entities for up/down
    const hasSetpointControl = !!this.config?.setpoint_up_entity && !!this.config?.setpoint_down_entity;
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
              aria-label="Decrease setpoint"
              @button-click=${this._handleDecrement}
            ></control-button>
            <control-button
              icon="mdi:plus"
              size="small"
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
