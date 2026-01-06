import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { ClimateEntityConfig, ClimateEntityAttributes } from '../types';
import { cssVariables, rowStyles, dropdownStyles, buttonStyles, typographyStyles } from '../styles';
import { getModeColors, getModeIcon, getModeClass, getModeLabel, normalizeMode } from '../utils/mode-colors';
import { clamp, getFriendlyName } from '../utils/format';

import './control-button';

@customElement('climate-row')
export class ClimateRow extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: ClimateEntityConfig;

  @state() private _modeDropdownOpen = false;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${rowStyles}
    ${dropdownStyles}
    ${buttonStyles}
    
    :host {
      display: block;
    }
    
    .climate-row {
      position: relative;
    }
    
    .row-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .setpoint-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .setpoint-value {
      font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
      font-size: 16px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      min-width: 36px;
      text-align: center;
    }
    
    /* Mobile wrapping */
    @media (max-width: 500px) {
      .climate-row {
        flex-wrap: wrap;
      }
      
      .row-content {
        flex: 1 1 auto;
        min-width: 60px;
      }
      
      .row-controls {
        flex: 1 1 100%;
        justify-content: flex-end;
        margin-top: 8px;
      }
    }
    
    .dropdown-wrapper {
      position: relative;
    }
    
    .dropdown-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      min-width: 120px;
      margin-bottom: 4px;
      padding: 4px 0;
      background: var(--card-background-color, var(--ha-card-background, #1c1c1c));
      border: 1px solid var(--divider-color);
      border-radius: var(--button-radius);
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .dropdown-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 100ms ease;
    }
    
    .dropdown-option:hover {
      background: var(--secondary-background-color);
    }
    
    .dropdown-option.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }
    
    .dropdown-option ha-icon {
      --mdc-icon-size: 18px;
    }
    
    .dropdown-option-label {
      font-size: 14px;
      text-transform: capitalize;
    }
    
    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
    }
  `;

  private _getEntity(): ClimateEntityAttributes | null {
    const entity = this.hass?.states[this.config?.entity];
    if (!entity) return null;
    
    return entity.attributes as ClimateEntityAttributes;
  }

  private _getState(): string {
    const entity = this.hass?.states[this.config?.entity];
    return entity?.state ?? 'off';
  }

  private _getName(): string {
    const entity = this.hass?.states[this.config?.entity];
    return this.config?.name ?? getFriendlyName(this.config.entity, entity?.attributes);
  }

  private _getIcon(): string {
    const entity = this.hass?.states[this.config?.entity];
    return this.config?.icon ?? (entity?.attributes?.icon as string) ?? 'mdi:air-conditioner';
  }

  private _toggleModeDropdown(e: Event): void {
    e.stopPropagation();
    this._modeDropdownOpen = !this._modeDropdownOpen;
  }

  private _closeDropdowns(): void {
    this._modeDropdownOpen = false;
  }

  private _handleRowClick(e: Event): void {
    // Don't open dialog if clicking on controls
    const target = e.target as HTMLElement;
    if (target.closest('.dropdown-wrapper') || target.closest('.dropdown') || 
        target.closest('.setpoint-controls') || target.closest('control-button')) {
      return;
    }
    
    // Fire more-info event to open entity dialog
    fireEvent(this, 'hass-more-info', {
      entityId: this.config.entity,
    });
  }

  private async _selectMode(mode: string): Promise<void> {
    this._modeDropdownOpen = false;
    
    await this.hass.callService('climate', 'set_hvac_mode', {
      entity_id: this.config.entity,
      hvac_mode: mode,
    });
  }

  private async _adjustTemperature(delta: number): Promise<void> {
    const attrs = this._getEntity();
    if (!attrs) return;

    const current = attrs.temperature ?? attrs.target_temp_high ?? 22;
    const step = attrs.target_temp_step ?? 1;
    const min = attrs.min_temp ?? 16;
    const max = attrs.max_temp ?? 30;

    const newTemp = clamp(current + delta * step, min, max);

    await this.hass.callService('climate', 'set_temperature', {
      entity_id: this.config.entity,
      temperature: newTemp,
    });
  }

  private _handleDecrement(): void {
    this._adjustTemperature(-1);
  }

  private _handleIncrement(): void {
    this._adjustTemperature(1);
  }

  private _renderModeDropdown() {
    const state = this._getState();
    const attrs = this._getEntity();
    // HA doesn't include 'off' in hvac_modes, so we add it manually
    const hvacModes = attrs?.hvac_modes ?? [];
    const hasOff = hvacModes.some(m => m.toLowerCase() === 'off');
    const allModes = hasOff ? hvacModes : [...hvacModes, 'off'];
    
    const normalizedMode = normalizeMode(state);
    const modeColors = getModeColors(normalizedMode);
    const modeIcon = getModeIcon(normalizedMode);

    return html`
      <div class="dropdown-wrapper">
        <div 
          class="dropdown"
          @click=${this._toggleModeDropdown}
          role="combobox"
          aria-expanded=${this._modeDropdownOpen}
          aria-haspopup="listbox"
        >
          <div class="dropdown-icon" style="color: ${modeColors.color}">
            <ha-icon .icon=${modeIcon}></ha-icon>
          </div>
          <span class="dropdown-label">${getModeLabel(state)}</span>
          <div class="dropdown-chevron">
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </div>
        </div>
        ${this._modeDropdownOpen ? html`
          <div class="dropdown-menu" role="listbox">
            ${allModes.map(mode => {
              const optionMode = normalizeMode(mode);
              const optionIcon = getModeIcon(optionMode);
              const optionColors = getModeColors(optionMode);
              const isSelected = mode === state;
              
              return html`
                <div 
                  class="dropdown-option ${isSelected ? 'selected' : ''}"
                  @click=${() => this._selectMode(mode)}
                  role="option"
                  aria-selected=${isSelected}
                >
                  <ha-icon 
                    .icon=${optionIcon} 
                    style="color: ${isSelected ? 'inherit' : optionColors.color}"
                  ></ha-icon>
                  <span class="dropdown-option-label">${getModeLabel(mode)}</span>
                </div>
              `;
            })}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderSetpointControls() {
    const state = this._getState();
    const attrs = this._getEntity();
    
    // Don't show setpoint controls for off mode
    if (state === 'off' || state === 'fan_only') {
      return nothing;
    }

    const temperature = attrs?.temperature ?? attrs?.target_temp_high;
    const min = attrs?.min_temp ?? 16;
    const max = attrs?.max_temp ?? 30;

    return html`
      <div class="setpoint-controls">
        <control-button
          icon="mdi:minus"
          ?disabled=${temperature == null || temperature <= min}
          aria-label="Decrease temperature"
          @button-click=${this._handleDecrement}
        ></control-button>
        <span class="setpoint-value value-text">
          ${temperature != null ? Math.round(temperature) : '--'}
        </span>
        <control-button
          icon="mdi:plus"
          ?disabled=${temperature == null || temperature >= max}
          aria-label="Increase temperature"
          @button-click=${this._handleIncrement}
        ></control-button>
      </div>
    `;
  }

  render() {
    if (!this.hass?.states[this.config?.entity]) {
      return html`
        <div class="row">
          <div class="row-content">
            <span class="row-name">${this.config?.name ?? 'Climate'}</span>
            <span class="row-state">Unavailable</span>
          </div>
        </div>
      `;
    }

    const state = this._getState();
    const normalizedMode = normalizeMode(state);
    const modeClass = getModeClass(normalizedMode);
    const name = this._getName();
    const icon = this._getIcon();

    const rowClasses = {
      'row': true,
      'climate-row': true,
      [modeClass]: true,
    };

    return html`
      ${this._modeDropdownOpen ? html`
        <div class="backdrop" @click=${this._closeDropdowns}></div>
      ` : nothing}
      
      <div class=${classMap(rowClasses)} @click=${this._handleRowClick} style="cursor: pointer;">
        <div class="row-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="row-content">
          <span class="row-name">${name}</span>
        </div>
        <div class="row-controls" @click=${(e: Event) => e.stopPropagation()}>
          ${this._renderModeDropdown()}
          ${this._renderSetpointControls()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'climate-row': ClimateRow;
  }
}
