import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { WeatherConfig, WeatherEntityAttributes } from '../types';
import { cssVariables, headerStyles, typographyStyles } from '../styles';
import { getWeatherIcon, getWeatherIconColor, getConditionLabel } from '../utils/weather-icons';
import { formatTemperature } from '../utils/format';
import { DEFAULT_WEATHER_CONFIG } from '../const';

@customElement('weather-header')
export class WeatherHeader extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: WeatherConfig;
  @property({ type: String }) title = '';

  static styles = css`
    ${cssVariables}
    ${headerStyles}
    ${typographyStyles}
    
    :host {
      display: block;
    }
  `;

  private _getWeatherState(): WeatherEntityAttributes | null {
    if (!this.hass || !this.config?.entity) return null;
    
    const entity = this.hass.states[this.config.entity];
    if (!entity) return null;

    return {
      temperature: entity.attributes.temperature,
      temperature_unit: entity.attributes.temperature_unit ?? '°C',
      humidity: entity.attributes.humidity,
      ...entity.attributes,
    } as WeatherEntityAttributes;
  }

  private _getCondition(): string {
    if (!this.hass || !this.config?.entity) return 'unknown';
    
    const entity = this.hass.states[this.config.entity];
    return entity?.state ?? 'unknown';
  }

  render() {
    const weather = this._getWeatherState();
    const condition = this._getCondition();
    const showHumidity = this.config?.show_humidity ?? DEFAULT_WEATHER_CONFIG.show_humidity;

    const icon = getWeatherIcon(condition);
    const iconColor = getWeatherIconColor(condition);
    const conditionLabel = getConditionLabel(condition);

    return html`
      <div class="card-header">
        <div class="header-left"></div>
        ${weather ? html`
          <div class="header-right">
            <div class="weather-current">
              <div class="weather-icon" style="color: ${iconColor}">
                <ha-icon .icon=${icon}></ha-icon>
              </div>
              <span class="weather-temp value-text hero-value">
                ${weather.temperature != null 
                  ? formatTemperature(weather.temperature, 1, 
                      weather.temperature_unit?.includes('F') ? 'fahrenheit' : 'celsius')
                  : '--'}
              </span>
            </div>
            <span class="weather-condition">
              ${conditionLabel}
              ${showHumidity && weather.humidity != null 
                ? html`, ${weather.humidity}%` 
                : nothing}
            </span>
          </div>
        ` : html`
          <div class="header-right">
            <span class="weather-condition">Weather unavailable</span>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'weather-header': WeatherHeader;
  }
}
