import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { FansConfig, FanEntityConfig } from '../types';
import { cssVariables, sectionStyles, typographyStyles, rowStyles, buttonStyles } from '../styles';
import { getFriendlyName } from '../utils/format';
import { DEFAULT_FANS_CONFIG } from '../const';

@customElement('fan-section')
export class FanSection extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: FansConfig;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${sectionStyles}
    ${rowStyles}
    ${buttonStyles}
    
    :host {
      display: block;
    }
    
    .fan-list {
      display: flex;
      flex-direction: column;
      gap: var(--row-gap, 8px);
    }
    
    .fan-row {
      display: flex;
      align-items: center;
      padding: 12px;
      background: var(--card-background-color, var(--ha-card-background));
      border-radius: var(--button-radius, 8px);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      cursor: pointer;
      transition: background-color 150ms ease;
    }
    
    .fan-row:hover {
      background: var(--secondary-background-color);
    }
    
    .fan-row.on {
      border-color: var(--climate-fan);
      background: var(--climate-fan-container);
    }
    
    .fan-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      margin-right: 12px;
      transition: all 150ms ease;
    }
    
    .fan-row.on .fan-icon {
      background: var(--climate-fan);
      color: white;
    }
    
    .fan-icon ha-icon {
      --mdc-icon-size: 20px;
    }
    
    .fan-row.on .fan-icon ha-icon {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .fan-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    
    .fan-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .fan-state {
      font-size: 12px;
      color: var(--secondary-text-color);
      text-transform: capitalize;
    }
    
    .fan-power {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
      margin-right: 12px;
    }
    
    .fan-power ha-icon {
      --mdc-icon-size: 16px;
      color: var(--warning-color, #FFC107);
    }
    
    .fan-toggle {
      display: flex;
      align-items: center;
    }
  `;

  private _getEntityState(entityId: string): boolean {
    const entity = this.hass?.states[entityId];
    return entity?.state === 'on';
  }

  private _getPowerValue(entityId: string | undefined): number | null {
    if (!entityId) return null;
    const entity = this.hass?.states[entityId];
    if (!entity) return null;
    
    const value = parseFloat(entity.state);
    return isNaN(value) ? null : value;
  }

  private _getPowerUnit(entityId: string | undefined): string {
    if (!entityId) return 'W';
    const entity = this.hass?.states[entityId];
    return entity?.attributes?.unit_of_measurement ?? 'W';
  }

  private _getName(config: FanEntityConfig): string {
    const entity = this.hass?.states[config.entity];
    return config.name ?? getFriendlyName(config.entity, entity?.attributes);
  }

  private _getIcon(config: FanEntityConfig): string {
    const entity = this.hass?.states[config.entity];
    return config.icon ?? (entity?.attributes?.icon as string) ?? 'mdi:fan';
  }

  private async _toggleFan(entityId: string): Promise<void> {
    await this.hass.callService('switch', 'toggle', {
      entity_id: entityId,
    });
  }

  private _renderFanRow(config: FanEntityConfig) {
    const isOn = this._getEntityState(config.entity);
    const name = this._getName(config);
    const icon = this._getIcon(config);
    const power = this._getPowerValue(config.power_entity);
    const powerUnit = this._getPowerUnit(config.power_entity);
    const entity = this.hass?.states[config.entity];
    const stateText = entity?.state ?? 'unavailable';

    return html`
      <div 
        class="fan-row ${isOn ? 'on' : ''}"
        @click=${() => this._toggleFan(config.entity)}
      >
        <div class="fan-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        <div class="fan-info">
          <span class="fan-name">${name}</span>
          <span class="fan-state">${stateText}</span>
        </div>
        
        ${power !== null ? html`
          <div class="fan-power">
            <ha-icon icon="mdi:flash"></ha-icon>
            <span>${Math.round(power)} ${powerUnit}</span>
          </div>
        ` : nothing}
        
        <div class="fan-toggle">
          <ha-switch
            .checked=${isOn}
            @click=${(e: Event) => e.stopPropagation()}
            @change=${() => this._toggleFan(config.entity)}
          ></ha-switch>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.config?.entities?.length) {
      return nothing;
    }

    const sectionName = this.config.section_name ?? DEFAULT_FANS_CONFIG.section_name;

    return html`
      <div class="section">
        <div class="section-header-row">
          <span class="section-header">${sectionName}</span>
        </div>
        
        <div class="fan-list">
          ${this.config.entities.map(entity => this._renderFanRow(entity))}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fan-section': FanSection;
  }
}
