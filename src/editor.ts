import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import {
  ClimateCardConfig,
  TemperatureSensorConfig,
  ACZoneConfig,
  ClimateEntityConfig,
} from './types';
import { cssVariables } from './styles';
import { DEFAULT_CONFIG, DEFAULT_WEATHER_CONFIG, DEFAULT_TEMPERATURE_SENSORS_CONFIG, DEFAULT_HOUSE_AC_CONFIG } from './const';

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

    const target = ev.target as HTMLInputElement;
    const configPath = target.getAttribute('data-config-path');
    
    if (!configPath) return;

    const value = target.type === 'checkbox' ? target.checked : ev.detail?.value ?? target.value;
    
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
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    
    const finalKey = keys[keys.length - 1];
    if (value === '' || value === undefined) {
      delete current[finalKey];
    } else {
      current[finalKey] = value;
    }
    
    return obj;
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

  private _addZone(): void {
    const zones = [...(this._config.house_ac?.zones ?? [])];
    zones.push({
      name: `Zone ${zones.length + 1}`,
      state_entity: '',
      value_entity: '',
      value_type: 'temperature',
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
                    <label>State Entity (Binary Sensor)</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['binary_sensor'] } }}
                      .value=${zone.state_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'state_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <div class="form-group">
                    <label>Value Entity (Number)</label>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ entity: { domain: ['number'] } }}
                      .value=${zone.value_entity ?? ''}
                      @value-changed=${(e: CustomEvent) => this._updateZone(index, 'value_entity', e.detail.value || '')}
                    ></ha-selector>
                  </div>
                  <ha-select
                    label="Value Type"
                    .value=${zone.value_type ?? 'temperature'}
                    @selected=${(e: CustomEvent) => this._updateZone(index, 'value_type', (e.target as HTMLSelectElement).value)}
                  >
                    <mwc-list-item value="temperature">Temperature</mwc-list-item>
                    <mwc-list-item value="percentage">Percentage</mwc-list-item>
                  </ha-select>
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

  render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <div class="editor-container">
        ${this._renderGeneralSection()}
        ${this._renderWeatherSection()}
        ${this._renderTemperatureSensorsSection()}
        ${this._renderHouseACSection()}
        ${this._renderClimateEntitiesSection()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'climate-card-editor': ClimateCardEditor;
  }
}
