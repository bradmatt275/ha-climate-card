import { LitElement, html, css, PropertyValues, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, LovelaceCard } from 'custom-card-helpers';
import {
  ClimateCardConfig,
  WeatherForecast,
  CollapsibleState,
  ForecastEvent,
} from './types';
import { sharedStyles, cardStyles, cssVariables } from './styles';
import { CARD_NAME, CARD_VERSION, DEFAULT_CONFIG, DEFAULT_WEATHER_CONFIG, DEFAULT_TEMPERATURE_SENSORS_CONFIG } from './const';

// Import editor
import './editor';

// Import all components
import './components/weather-header';
import './components/forecast-section';
import './components/temp-sensor-grid';
import './components/house-ac-section';
import './components/climate-section';
import './components/fan-section';

// Log card info
console.info(
  `%c CLIMATE-CARD %c ${CARD_VERSION} `,
  'color: white; background: #3B82F6; font-weight: bold;',
  'color: #3B82F6; background: white; font-weight: bold;'
);

@customElement('climate-card')
export class ClimateCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: ClimateCardConfig;
  @state() private _forecast: WeatherForecast[] = [];
  @state() private _collapsedState: CollapsibleState = {
    forecast: false,
    temperatures: false,
  };

  private _forecastUnsubscribe?: () => void;

  static styles = css`
    ${cssVariables}
    ${cardStyles}
    ${sharedStyles}
    
    :host {
      display: block;
    }
    
    ha-card {
      height: 100%;
      box-sizing: border-box;
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      gap: var(--section-gap, 16px);
      padding-bottom: 4px;
    }
  `;

  static getConfigElement(): LovelaceCardEditor {
    return document.createElement('climate-card-editor') as LovelaceCardEditor;
  }

  static getStubConfig(): Partial<ClimateCardConfig> {
    return {
      type: `custom:${CARD_NAME}`,
      title: 'Climate',
      weather: {
        entity: '',
      },
    };
  }

  public setConfig(config: ClimateCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Initialize collapsed state from config
    this._collapsedState = {
      forecast: config.weather?.collapsed ?? DEFAULT_WEATHER_CONFIG.collapsed,
      temperatures: config.temperature_sensors?.collapsed ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.collapsed,
    };
  }

  public getCardSize(): number {
    let size = 1; // Header

    // Forecast section
    if (this._config?.weather?.entity && !this._collapsedState.forecast) {
      size += 2;
    }

    // Temperature sensors section
    if (this._config?.temperature_sensors?.sensors?.length && !this._collapsedState.temperatures) {
      const columns = this._config.temperature_sensors.columns ?? DEFAULT_TEMPERATURE_SENSORS_CONFIG.columns;
      size += Math.ceil(this._config.temperature_sensors.sensors.length / columns) * 2;
    }

    // House AC section
    if (this._config?.house_ac) {
      size += 1 + (this._config.house_ac.zones?.length ?? 0);
    }

    // Climate entities
    if (this._config?.climate_entities?.length) {
      size += this._config.climate_entities.length;
    }

    return size;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._subscribeForecast();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribeForecast();
  }

  willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('_config') || changedProps.has('hass')) {
      const oldConfig = changedProps.get('_config') as ClimateCardConfig | undefined;
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

      // Re-subscribe if weather entity changed
      if (
        this._config?.weather?.entity &&
        (oldConfig?.weather?.entity !== this._config.weather.entity || !oldHass)
      ) {
        this._subscribeForecast();
      }
    }
  }

  private async _subscribeForecast(): Promise<void> {
    this._unsubscribeForecast();

    if (!this.hass || !this._config?.weather?.entity) {
      return;
    }

    try {
      this._forecastUnsubscribe = await this.hass.connection.subscribeMessage<ForecastEvent>(
        (event) => {
          this._forecast = event.forecast ?? [];
        },
        {
          type: 'weather/subscribe_forecast',
          entity_id: this._config.weather.entity,
          forecast_type: 'daily',
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to forecast:', error);
      // Fallback to attribute-based forecast
      this._loadForecastFromAttributes();
    }
  }

  private _unsubscribeForecast(): void {
    if (this._forecastUnsubscribe) {
      this._forecastUnsubscribe();
      this._forecastUnsubscribe = undefined;
    }
  }

  private _loadForecastFromAttributes(): void {
    if (!this.hass || !this._config?.weather?.entity) return;

    const entity = this.hass.states[this._config.weather.entity];
    if (entity?.attributes?.forecast) {
      this._forecast = entity.attributes.forecast as WeatherForecast[];
    }
  }

  private _handleCollapseToggle(e: CustomEvent): void {
    const { section, collapsed } = e.detail;
    
    this._collapsedState = {
      ...this._collapsedState,
      [section]: collapsed,
    };

    // Dispatch event for potential external state management
    this.dispatchEvent(new CustomEvent('collapse-changed', {
      bubbles: true,
      composed: true,
      detail: { section, collapsed },
    }));
  }

  private _renderWeatherHeader() {
    // Only show header if no weather entity (title only)
    if (!this._config?.weather?.entity && this._config?.title) {
      return html`
        <div class="card-header">
          <h2 class="card-title">${this._config.title}</h2>
        </div>
      `;
    }
    return nothing;
  }

  private _renderForecastSection() {
    if (!this._config?.weather?.entity) {
      return nothing;
    }

    return html`
      <forecast-section
        .hass=${this.hass}
        .config=${this._config.weather}
        .forecast=${this._forecast}
        ?collapsed=${this._collapsedState.forecast}
        @toggle-collapse=${this._handleCollapseToggle}
      ></forecast-section>
    `;
  }

  private _renderTemperatureSensors() {
    if (!this._config?.temperature_sensors?.sensors?.length) {
      return nothing;
    }

    return html`
      <temp-sensor-grid
        .hass=${this.hass}
        .config=${this._config.temperature_sensors}
        ?collapsed=${this._collapsedState.temperatures}
        @toggle-collapse=${this._handleCollapseToggle}
      ></temp-sensor-grid>
    `;
  }

  private _renderHouseAC() {
    if (!this._config?.house_ac) {
      return nothing;
    }

    return html`
      <house-ac-section
        .hass=${this.hass}
        .config=${this._config.house_ac}
      ></house-ac-section>
    `;
  }

  private _renderClimateEntities() {
    if (!this._config?.climate_entities?.length) {
      return nothing;
    }

    return html`
      ${this._config.climate_entities.map(config => html`
        <climate-section
          .hass=${this.hass}
          .config=${config}
        ></climate-section>
      `)}
    `;
  }

  private _renderFans() {
    if (!this._config?.fans?.entities?.length) {
      return nothing;
    }

    return html`
      <fan-section
        .hass=${this.hass}
        .config=${this._config.fans}
      ></fan-section>
    `;
  }

  render() {
    if (!this._config) {
      return html`<ha-card>Invalid configuration</ha-card>`;
    }

    return html`
      <ha-card>
        <div class="card-content">
          ${this._renderWeatherHeader()}
          ${this._renderForecastSection()}
          ${this._renderTemperatureSensors()}
          ${this._renderHouseAC()}
          ${this._renderClimateEntities()}
          ${this._renderFans()}
        </div>
      </ha-card>
    `;
  }
}

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_NAME,
  name: 'Climate Card',
  description: 'A unified climate monitoring and control card for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/your-repo/climate-card',
});

declare global {
  interface HTMLElementTagNameMap {
    'climate-card': ClimateCard;
  }
}
