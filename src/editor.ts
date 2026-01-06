import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import {
  ClimateCardConfig,
  TemperatureSensorConfig,
  ACZoneConfig,
  ClimateEntityConfig,
  FanEntityConfig,
} from './types';
import { cssVariables } from './styles';
import { DEFAULT_CONFIG, DEFAULT_WEATHER_CONFIG, DEFAULT_TEMPERATURE_SENSORS_CONFIG, DEFAULT_HOUSE_AC_CONFIG, DEFAULT_FANS_CONFIG, DEFAULT_SECTION_ORDER, SECTION_LABELS } from './const';

@customElement('climate-card-editor')
export class ClimateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: ClimateCardConfig;
  @state() private _expandedSections = new Set<string>();

  static styles = css`
    ${cssVariables}
    
    :host {
      display: block;
    }
    
    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .section {
      background: var(--secondary-background-color);
      border-radius: 8px;
      padding: 16px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }
    
    .section-title {
      font-weight: 500;
      font-size: 14px;
    }
    
    .section-content {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .row-label {
      flex: 1;
      font-size: 14px;
    }
    
    ha-selector {
      width: 100%;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .form-group label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    
    ha-textfield {
      width: 100%;
    }
    
    ha-select {
      width: 100%;
    }
    
    .list-item {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
    }
    
    .list-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .list-item-title {
      font-weight: 500;
      font-size: 13px;
    }
    
    .list-item-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .add-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: border-color 100ms ease, color 100ms ease;
    }
    
    .add-button:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    .remove-button {
      color: var(--error-color);
      cursor: pointer;
    }
    
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .thresholds-section {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 12px;
    }
    
    .thresholds-header {
      margin-bottom: 12px;
    }
    
    .thresholds-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }
    
    .thresholds-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    
    .order-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .order-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
    }
    
    .order-item-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }
    
    .order-buttons {
      display: flex;
      gap: 4px;
    }
    
    .order-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: background-color 100ms ease, color 100ms ease;
    }
    
    .order-button:hover {
      background: var(--secondary-background-color);
      color: var(--primary-color);
    }
    
    .order-button.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .order-button.disabled:hover {
      background: transparent;
      color: var(--secondary-text-color);
    }
    
    .order-button ha-icon {
      --mdc-icon-size: 20px;
    }
  `;

  public setConfig(config: ClimateCardConfig): void {
    this._config = config;
  }

  private _toggleSection(section: string): void {
    if (this._expandedSections.has(section)) {
      this._expandedSections.delete(section);
    } else {
      this._expandedSections.add(section);
    }
    this.requestUpdate();
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) return;

    const target = ev.target as HTMLInputElement & { checked?: boolean };
    const configPath = target.getAttribute('data-config-path');
    
    if (!configPath) return;

    // Check if it's a switch/checkbox by looking for the checked property
    const isSwitch = target.tagName?.toLowerCase() === 'ha-switch' || target.type === 'checkbox';
    const value = isSwitch ? target.checked : ev.detail?.value ?? target.value;
    
    const newConfig = this._setNestedValue({ ...this._config }, configPath, value);
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  /**
   * Helper method to update config value at a nested path
   */
  private _updateConfigValue(path: string, value: unknown): void {
    if (!this._config || !this.hass) return;

    const newConfig = this._setNestedValue({ ...this._config }, path, value);
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // Deep clone each level
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      } else {
        current[key] = { ...(current[key] as Record<string, unknown>) };
      }
      current = current[key] as Record<string, unknown>;
    }
    
    const finalKey = keys[keys.length - 1];
    if (value === '' || value === undefined) {
      delete current[finalKey];
    } else {
      current[finalKey] = value;
    }
    
    return result;
  }

  private _addSensor(): void {
    const sensors = [...(this._config.temperature_sensors?.sensors ?? [])];
    sensors.push({
      name: `Sensor ${sensors.length + 1}`,
      temperature_entity: '',
    });
    
    const newConfig = {
      ...this._config,
      temperature_sensors: {
        ...this._config.temperature_sensors,
        sensors,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _removeSensor(index: number): void {
    const sensors = [...(this._config.temperature_sensors?.sensors ?? [])];
    sensors.splice(index, 1);
    
    const newConfig = {
      ...this._config,
      temperature_sensors: {
        ...this._config.temperature_sensors,
        sensors,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateSensor(index: number, field: keyof TemperatureSensorConfig, value: string): void {
    const sensors = [...(this._config.temperature_sensors?.sensors ?? [])];
    sensors[index] = { ...sensors[index], [field]: value };
    
    const newConfig = {
      ...this._config,
      temperature_sensors: {
        ...this._config.temperature_sensors,
        sensors,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateThreshold(field: 'cold' | 'cool' | 'comfortable' | 'warm', value: string): void {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    const currentThresholds = this._config.temperature_sensors?.thresholds ?? {};
    
    const newConfig = {
      ...this._config,
      temperature_sensors: {
        ...this._config.temperature_sensors,
        sensors: this._config.temperature_sensors?.sensors ?? [],
        thresholds: {
          ...currentThresholds,
          [field]: numValue,
        },
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _addZone(): void {
    const zones = [...(this._config.house_ac?.zones ?? [])];
    zones.push({
      name: `Zone ${zones.length + 1}`,
      power_entity: '',
    });
    
    const newConfig = {
      ...this._config,
      house_ac: {
        ...this._config.house_ac,
        mode_entity: this._config.house_ac?.mode_entity ?? '',
        fan_entity: this._config.house_ac?.fan_entity ?? '',
        zones,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _removeZone(index: number): void {
    const zones = [...(this._config.house_ac?.zones ?? [])];
    zones.splice(index, 1);
    
    const newConfig = {
      ...this._config,
      house_ac: {
        ...this._config.house_ac,
        mode_entity: this._config.house_ac?.mode_entity ?? '',
        fan_entity: this._config.house_ac?.fan_entity ?? '',
        zones,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateZone(index: number, field: keyof ACZoneConfig, value: string): void {
    const zones = [...(this._config.house_ac?.zones ?? [])];
    zones[index] = { ...zones[index], [field]: value };
    
    const newConfig = {
      ...this._config,
      house_ac: {
        ...this._config.house_ac,
        mode_entity: this._config.house_ac?.mode_entity ?? '',
        fan_entity: this._config.house_ac?.fan_entity ?? '',
        zones,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _addClimateEntity(): void {
    const entities = [...(this._config.climate_entities ?? [])];
    entities.push({
      entity: '',
    });
    
    const newConfig = {
      ...this._config,
      climate_entities: entities,
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _removeClimateEntity(index: number): void {
    const entities = [...(this._config.climate_entities ?? [])];
    entities.splice(index, 1);
    
    const newConfig = {
      ...this._config,
      climate_entities: entities,
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateClimateEntity(index: number, field: keyof ClimateEntityConfig, value: string): void {
    const entities = [...(this._config.climate_entities ?? [])];
    entities[index] = { ...entities[index], [field]: value };
    
    const newConfig = {
      ...this._config,
      climate_entities: entities,
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _addFan(): void {
    const entities = [...(this._config.fans?.entities ?? [])];
    entities.push({
      entity: '',
    });
    
    const newConfig = {
      ...this._config,
      fans: {
        ...this._config.fans,
        entities,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _removeFan(index: number): void {
    const entities = [...(this._config.fans?.entities ?? [])];
    entities.splice(index, 1);
    
    const newConfig = {
      ...this._config,
      fans: {
        ...this._config.fans,
        entities,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _updateFan(index: number, field: keyof FanEntityConfig, value: string): void {
    const entities = [...(this._config.fans?.entities ?? [])];
    entities[index] = { ...entities[index], [field]: value };
    
    const newConfig = {
      ...this._config,
      fans: {
        ...this._config.fans,
        entities,
      },
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _getSectionOrder(): string[] {
    return [...(this._config.section_order ?? DEFAULT_SECTION_ORDER)];
  }

  private _moveSectionUp(index: number): void {
    if (index === 0) return;
    
    const order = this._getSectionOrder();
    [order[index - 1], order[index]] = [order[index], order[index - 1]];
    
    const newConfig = {
      ...this._config,
      section_order: order,
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _moveSectionDown(index: number): void {
    const order = this._getSectionOrder();
    if (index >= order.length - 1) return;
    
    [order[index], order[index + 1]] = [order[index + 1], order[index]];
    
    const newConfig = {
      ...this._config,
      section_order: order,
    };
    
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _renderGeneralSection() {
    const isExpanded = this._expandedSections.has('general');

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('general')}>
          <span class="section-title">General</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            <ha-textfield
              label="Card Title"
              .value=${this._config.title ?? DEFAULT_CONFIG.title}
              data-config-path="title"
              @change=${this._valueChanged}
            ></ha-textfield>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderSectionOrderSection() {
    const isExpanded = this._expandedSections.has('section_order');
    const order = this._getSectionOrder();

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('section_order')}>
          <span class="section-title">Section Order</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            <div class="order-list">
              ${order.map((section, index) => html`
                <div class="order-item">
                  <span class="order-item-label">${SECTION_LABELS[section] ?? section}</span>
                  <div class="order-buttons">
                    <div 
                      class="order-button ${index === 0 ? 'disabled' : ''}"
                      @click=${() => this._moveSectionUp(index)}
                    >
                      <ha-icon icon="mdi:arrow-up"></ha-icon>
                    </div>
                    <div 
                      class="order-button ${index === order.length - 1 ? 'disabled' : ''}"
                      @click=${() => this._moveSectionDown(index)}
                    >
                      <ha-icon icon="mdi:arrow-down"></ha-icon>
                    </div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderWeatherSection() {
    const isExpanded = this._expandedSections.has('weather');
    const weather = this._config.weather;

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('weather')}>
          <span class="section-title">Weather</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            <div class="form-group">
              <label>Weather Entity</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ['weather'] } }}
                .value=${weather?.entity ?? ''}
                @value-changed=${(e: CustomEvent) => this._updateConfigValue('weather.entity', e.detail.value)}
              ></ha-selector>
            </div>
            
            <ha-textfield
              type="number"
              label="Forecast Days"
              min="1"
              max="10"
              .value=${String(weather?.forecast_days ?? DEFAULT_WEATHER_CONFIG.forecast_days)}
              data-config-path="weather.forecast_days"
              @change=${this._valueChanged}
            ></ha-textfield>
            
            <div class="checkbox-row">
              <ha-switch
                .checked=${weather?.collapsible ?? DEFAULT_WEATHER_CONFIG.collapsible}
                data-config-path="weather.collapsible"
                @change=${this._valueChanged}
              ></ha-switch>
              <span>Collapsible</span>
            </div>
            
            <div class="checkbox-row">
              <ha-switch
                .checked=${weather?.collapsed ?? DEFAULT_WEATHER_CONFIG.collapsed}
                data-config-path="weather.collapsed"
                @change=${this._valueChanged}
              ></ha-switch>
              <span>Start Collapsed</span>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderTemperatureSensorsSection() {
    const isExpanded = this._expandedSections.has('sensors');
    const sensorsConfig = this._config.temperature_sensors;
    const sensors = sensorsConfig?.sensors ?? [];

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('sensors')}>
          <span class="section-title">Temperature Sensors (${sensors.length})</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            <ha-textfield
              type="number"
              label="Grid Columns"
              min="1"
              max="4"
              .value=${String(sensorsConfig?.columns ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.columns)}
              data-config-path="temperature_sensors.columns"
              @change=${this._valueChanged}
            ></ha-textfield>
            
            <ha-textfield
              type="number"
              label="Trend Hours"
              min="1"
              max="24"
              .value=${String(sensorsConfig?.trend_hours ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.trend_hours)}
              data-config-path="temperature_sensors.trend_hours"
              @change=${this._valueChanged}
            ></ha-textfield>
            
            <div class="checkbox-row">
              <ha-switch
                .checked=${sensorsConfig?.collapsible ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.collapsible}
                data-config-path="temperature_sensors.collapsible"
                @change=${this._valueChanged}
              ></ha-switch>
              <span>Collapsible</span>
            </div>
            
            <div class="checkbox-row">
              <ha-switch
                .checked=${sensorsConfig?.collapsed ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.collapsed}
                data-config-path="temperature_sensors.collapsed"
                @change=${this._valueChanged}
              ></ha-switch>
              <span>Start Collapsed</span>
            </div>
            
            <div class="thresholds-section">
              <div class="thresholds-header">
                <span class="thresholds-title">Temperature Thresholds (°C)</span>
              </div>
              <div class="thresholds-grid">
                <ha-textfield
                  type="number"
                  label="Cold (blue)"
                  .value=${String(sensorsConfig?.thresholds?.cold ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.thresholds.cold)}
                  @change=${(e: Event) => this._updateThreshold('cold', (e.target as HTMLInputElement).value)}
                ></ha-textfield>
                <ha-textfield
                  type="number"
                  label="Cool (cyan)"
                  .value=${String(sensorsConfig?.thresholds?.cool ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.thresholds.cool)}
                  @change=${(e: Event) => this._updateThreshold('cool', (e.target as HTMLInputElement).value)}
                ></ha-textfield>
                <ha-textfield
                  type="number"
                  label="Comfortable (green)"
                  .value=${String(sensorsConfig?.thresholds?.comfortable ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.thresholds.comfortable)}
                  @change=${(e: Event) => this._updateThreshold('comfortable', (e.target as HTMLInputElement).value)}
                ></ha-textfield>
                <ha-textfield
                  type="number"
                  label="Warm (orange)"
                  .value=${String(sensorsConfig?.thresholds?.warm ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.thresholds.warm)}
                  @change=${(e: Event) => this._updateThreshold('warm', (e.target as HTMLInputElement).value)}
                ></ha-textfield>
              </div>
            </div>
            
            ${sensors.map((sensor, index) => html`
              <div class="list-item">
                <div class="list-item-header">
                  <span class="list-item-title">Sensor ${index + 1}</span>
                  <ha-icon 
                    class="remove-button"
                    icon="mdi:delete"
                    @click=${() => this._removeSensor(index)}
                  ></ha-icon>
                </div>
                <div class="list-item-content">
                  <ha-textfield
                    label="Name"
                    .value=${sensor.name ?? ''}
                    @change=${(e: Event) => this._updateSensor(index, 'name', (e.target as HTMLInputElement).value)}
                  ></ha-textfield>
                  <div class="form-group">
                    <label>Temperature Entity</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['sensor'] } }}
                      .value=${sensor.temperature_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateSensor(index, 'temperature_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <div class="form-group">
                    <label>Humidity Entity (Optional)</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['sensor'] } }}
                      .value=${sensor.humidity_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateSensor(index, 'humidity_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                </div>
              </div>
            `)}
            
            <div class="add-button" @click=${this._addSensor}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Add Sensor</span>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderHouseACSection() {
    const isExpanded = this._expandedSections.has('house_ac');
    const houseAC = this._config.house_ac;
    const zones = houseAC?.zones ?? [];

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('house_ac')}>
          <span class="section-title">House AC (${zones.length} zones)</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            <ha-textfield
              label="Name"
              .value=${houseAC?.name ?? DEFAULT_HOUSE_AC_CONFIG.name}
              data-config-path="house_ac.name"
              @change=${this._valueChanged}
            ></ha-textfield>
            
            <div class="form-group">
              <label>Power Entity (Switch) - Click row to toggle</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ['switch'] } }}
                .value=${houseAC?.power_entity ?? ''}
                @value-changed=${(e: CustomEvent) => this._updateConfigValue('house_ac.power_entity', e.detail.value)}
              ></ha-selector>
            </div>
            
            <div class="form-group">
              <label>Mode Entity (Select)</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ['select'] } }}
                .value=${houseAC?.mode_entity ?? ''}
                @value-changed=${(e: CustomEvent) => this._updateConfigValue('house_ac.mode_entity', e.detail.value)}
              ></ha-selector>
            </div>
            
            <div class="form-group">
              <label>Fan Entity (Select)</label>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ entity: { domain: ['select'] } }}
                .value=${houseAC?.fan_entity ?? ''}
                @value-changed=${(e: CustomEvent) => this._updateConfigValue('house_ac.fan_entity', e.detail.value)}
              ></ha-selector>
            </div>
            
            <div class="checkbox-row">
              <ha-switch
                .checked=${houseAC?.zones_collapsible ?? DEFAULT_HOUSE_AC_CONFIG.zones_collapsible}
                data-config-path="house_ac.zones_collapsible"
                @change=${this._valueChanged}
              ></ha-switch>
              <span>Zones Collapsible</span>
            </div>
            
            <div class="checkbox-row">
              <ha-switch
                .checked=${houseAC?.zones_collapsed ?? DEFAULT_HOUSE_AC_CONFIG.zones_collapsed}
                data-config-path="house_ac.zones_collapsed"
                @change=${this._valueChanged}
              ></ha-switch>
              <span>Zones Start Collapsed</span>
            </div>
            
            <h4>Zones</h4>
            
            ${zones.map((zone, index) => html`
              <div class="list-item">
                <div class="list-item-header">
                  <span class="list-item-title">Zone ${index + 1}: ${zone.name}</span>
                  <ha-icon 
                    class="remove-button"
                    icon="mdi:delete"
                    @click=${() => this._removeZone(index)}
                  ></ha-icon>
                </div>
                <div class="list-item-content">
                  <ha-textfield
                    label="Name"
                    .value=${zone.name ?? ''}
                    @change=${(e: Event) => this._updateZone(index, 'name', (e.target as HTMLInputElement).value)}
                  ></ha-textfield>
                  <div class="form-group">
                    <label>Power Entity (Switch) *</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['switch'] } }}
                      .value=${zone.power_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'power_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <div class="form-group">
                    <label>Control Mode Entity (Select) - Optional</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['select'] } }}
                      .value=${zone.control_mode_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'control_mode_entity', e.detail.value || '')}
                    ></ha-selector>
                    <small style="color: var(--secondary-text-color); font-size: 11px;">
                      If set, zone supports Temperature/Fan mode switching. Otherwise, fan-only control.
                    </small>
                  </div>
                  <div class="form-group">
                    <label>Temperature Entity (Sensor)</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['sensor'] } }}
                      .value=${zone.temperature_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'temperature_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <div class="form-group">
                    <label>Setpoint Entity (Sensor)</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['sensor'] } }}
                      .value=${zone.setpoint_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'setpoint_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <div class="form-group">
                    <label>Setpoint Up Button</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['button'] } }}
                      .value=${zone.setpoint_up_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'setpoint_up_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <div class="form-group">
                    <label>Setpoint Down Button</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['button'] } }}
                      .value=${zone.setpoint_down_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'setpoint_down_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                </div>
              </div>
            `)}
            
            <div class="add-button" @click=${this._addZone}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Add Zone</span>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderClimateEntitiesSection() {
    const isExpanded = this._expandedSections.has('climate');
    const entities = this._config.climate_entities ?? [];

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('climate')}>
          <span class="section-title">Climate Entities (${entities.length})</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            ${entities.map((entity, index) => html`
              <div class="list-item">
                <div class="list-item-header">
                  <span class="list-item-title">Entity ${index + 1}</span>
                  <ha-icon 
                    class="remove-button"
                    icon="mdi:delete"
                    @click=${() => this._removeClimateEntity(index)}
                  ></ha-icon>
                </div>
                <div class="list-item-content">
                  <div class="form-group">
                    <label>Climate Entity</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['climate'] } }}
                      .value=${entity.entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateClimateEntity(index, 'entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <ha-textfield
                    label="Name (Optional)"
                    .value=${entity.name ?? ''}
                    @change=${(e: Event) => this._updateClimateEntity(index, 'name', (e.target as HTMLInputElement).value)}
                  ></ha-textfield>
                  <ha-textfield
                    label="Section Name (Optional)"
                    .value=${entity.section_name ?? ''}
                    @change=${(e: Event) => this._updateClimateEntity(index, 'section_name', (e.target as HTMLInputElement).value)}
                  ></ha-textfield>
                </div>
              </div>
            `)}
            
            <div class="add-button" @click=${this._addClimateEntity}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Add Climate Entity</span>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderFansSection() {
    const isExpanded = this._expandedSections.has('fans');
    const fansConfig = this._config.fans;
    const entities = fansConfig?.entities ?? [];

    return html`
      <div class="section">
        <div class="section-header" @click=${() => this._toggleSection('fans')}>
          <span class="section-title">Fans (${entities.length})</span>
          <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
        </div>
        ${isExpanded ? html`
          <div class="section-content">
            <ha-textfield
              label="Section Name"
              .value=${fansConfig?.section_name ?? DEFAULT_FANS_CONFIG.section_name}
              data-config-path="fans.section_name"
              @change=${this._valueChanged}
            ></ha-textfield>
            
            ${entities.map((fan, index) => html`
              <div class="list-item">
                <div class="list-item-header">
                  <span class="list-item-title">Fan ${index + 1}</span>
                  <ha-icon 
                    class="remove-button"
                    icon="mdi:delete"
                    @click=${() => this._removeFan(index)}
                  ></ha-icon>
                </div>
                <div class="list-item-content">
                  <div class="form-group">
                    <label>Switch Entity *</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['switch', 'fan'] } }}
                      .value=${fan.entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateFan(index, 'entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <ha-textfield
                    label="Name (Optional)"
                    .value=${fan.name ?? ''}
                    @change=${(e: Event) => this._updateFan(index, 'name', (e.target as HTMLInputElement).value)}
                  ></ha-textfield>
                  <ha-textfield
                    label="Icon (Optional)"
                    placeholder="mdi:fan"
                    .value=${fan.icon ?? ''}
                    @change=${(e: Event) => this._updateFan(index, 'icon', (e.target as HTMLInputElement).value)}
                  ></ha-textfield>
                  <div class="form-group">
                    <label>Power Sensor (Optional)</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['sensor'], device_class: ['power'] } }}
                      .value=${fan.power_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateFan(index, 'power_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                </div>
              </div>
            `)}
            
            <div class="add-button" @click=${this._addFan}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Add Fan</span>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <div class="editor-container">
        ${this._renderGeneralSection()}
        ${this._renderSectionOrderSection()}
        ${this._renderWeatherSection()}
        ${this._renderTemperatureSensorsSection()}
        ${this._renderHouseACSection()}
        ${this._renderClimateEntitiesSection()}
        ${this._renderFansSection()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'climate-card-editor': ClimateCardEditor;
  }
}
