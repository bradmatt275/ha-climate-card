import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HomeAssistant } from 'custom-card-helpers';
import { SelectEntityAttributes } from '../types';
import { cssVariables, rowStyles, dropdownStyles, typographyStyles } from '../styles';
import { getModeColors, getModeIcon, getModeClass, getModeLabel, normalizeMode } from '../utils/mode-colors';

@customElement('ac-master-row')
export class ACMasterRow extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) name = 'AC';
  @property({ type: String }) icon = 'mdi:air-conditioner';
  @property({ type: String }) modeEntity = '';
  @property({ type: String }) fanEntity = '';

  @state() private _modeDropdownOpen = false;
  @state() private _fanDropdownOpen = false;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${rowStyles}
    ${dropdownStyles}
    
    :host {
      display: block;
    }
    
    .master-row {
      position: relative;
    }
    
    .row-controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .dropdown-wrapper {
      position: relative;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      min-width: 120px;
      margin-top: 4px;
      padding: 4px 0;
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color);
      border-radius: var(--button-radius);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10;
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
      z-index: 9;
    }
  `;

  private _getModeState(): { value: string; options: string[] } {
    const entity = this.hass?.states[this.modeEntity];
    const attrs = entity?.attributes as SelectEntityAttributes | undefined;
    return {
      value: entity?.state ?? 'off',
      options: attrs?.options ?? [],
    };
  }

  private _getFanState(): { value: string; options: string[] } {
    const entity = this.hass?.states[this.fanEntity];
    const attrs = entity?.attributes as SelectEntityAttributes | undefined;
    return {
      value: entity?.state ?? 'auto',
      options: attrs?.options ?? [],
    };
  }

  private _toggleModeDropdown(e: Event): void {
    e.stopPropagation();
    this._modeDropdownOpen = !this._modeDropdownOpen;
    this._fanDropdownOpen = false;
  }

  private _toggleFanDropdown(e: Event): void {
    e.stopPropagation();
    this._fanDropdownOpen = !this._fanDropdownOpen;
    this._modeDropdownOpen = false;
  }

  private _closeDropdowns(): void {
    this._modeDropdownOpen = false;
    this._fanDropdownOpen = false;
  }

  private async _selectMode(option: string): Promise<void> {
    this._modeDropdownOpen = false;
    
    await this.hass.callService('select', 'select_option', {
      entity_id: this.modeEntity,
      option: option,
    });
  }

  private async _selectFan(option: string): Promise<void> {
    this._fanDropdownOpen = false;
    
    await this.hass.callService('select', 'select_option', {
      entity_id: this.fanEntity,
      option: option,
    });
  }

  private _renderModeDropdown() {
    const { value, options } = this._getModeState();
    const normalizedMode = normalizeMode(value);
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
          <span class="dropdown-label">${getModeLabel(value)}</span>
          <div class="dropdown-chevron">
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </div>
        </div>
        ${this._modeDropdownOpen ? html`
          <div class="dropdown-menu" role="listbox">
            ${options.map(option => {
              const optionMode = normalizeMode(option);
              const optionIcon = getModeIcon(optionMode);
              const optionColors = getModeColors(optionMode);
              const isSelected = option.toLowerCase() === value.toLowerCase();
              
              return html`
                <div 
                  class="dropdown-option ${isSelected ? 'selected' : ''}"
                  @click=${() => this._selectMode(option)}
                  role="option"
                  aria-selected=${isSelected}
                >
                  <ha-icon 
                    .icon=${optionIcon} 
                    style="color: ${isSelected ? 'inherit' : optionColors.color}"
                  ></ha-icon>
                  <span class="dropdown-option-label">${getModeLabel(option)}</span>
                </div>
              `;
            })}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderFanDropdown() {
    const { value, options } = this._getFanState();

    return html`
      <div class="dropdown-wrapper">
        <div 
          class="dropdown"
          @click=${this._toggleFanDropdown}
          role="combobox"
          aria-expanded=${this._fanDropdownOpen}
          aria-haspopup="listbox"
        >
          <div class="dropdown-icon">
            <ha-icon icon="mdi:fan"></ha-icon>
          </div>
          <span class="dropdown-label">${value}</span>
          <div class="dropdown-chevron">
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </div>
        </div>
        ${this._fanDropdownOpen ? html`
          <div class="dropdown-menu" role="listbox">
            ${options.map(option => {
              const isSelected = option.toLowerCase() === value.toLowerCase();
              
              return html`
                <div 
                  class="dropdown-option ${isSelected ? 'selected' : ''}"
                  @click=${() => this._selectFan(option)}
                  role="option"
                  aria-selected=${isSelected}
                >
                  <ha-icon icon="mdi:fan"></ha-icon>
                  <span class="dropdown-option-label">${option}</span>
                </div>
              `;
            })}
          </div>
        ` : nothing}
      </div>
    `;
  }

  render() {
    const { value: modeValue } = this._getModeState();
    const normalizedMode = normalizeMode(modeValue);
    const modeClass = getModeClass(normalizedMode);

    const rowClasses = {
      'row': true,
      'master-row': true,
      [modeClass]: true,
    };

    return html`
      ${this._modeDropdownOpen || this._fanDropdownOpen ? html`
        <div class="backdrop" @click=${this._closeDropdowns}></div>
      ` : nothing}
      
      <div class=${classMap(rowClasses)}>
        <div class="row-icon">
          <ha-icon .icon=${this.icon}></ha-icon>
        </div>
        <div class="row-content">
          <span class="row-name">${this.name}</span>
        </div>
        <div class="row-controls">
          ${this._renderModeDropdown()}
          ${this._renderFanDropdown()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ac-master-row': ACMasterRow;
  }
}
