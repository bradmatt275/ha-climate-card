import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { WeatherConfig, WeatherForecast } from '../types';
import { cssVariables, forecastStyles, gridStyles, typographyStyles } from '../styles';
import { getWeatherIcon, getWeatherIconColor, getConditionLabel } from '../utils/weather-icons';
import { getDayFromISOString, getTimeFromISOString, formatTemperature } from '../utils/format';
import { DEFAULT_WEATHER_CONFIG } from '../const';

import './collapsible-section';

@customElement('forecast-section')
export class ForecastSection extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: WeatherConfig;
  @property({ type: Array }) forecast: WeatherForecast[] = [];
  @property({ type: String }) forecastType: 'daily' | 'hourly' = 'daily';
  @property({ type: Boolean }) collapsed = false;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${forecastStyles}
    ${gridStyles}
    
    :host {
      display: block;
    }
    
    .forecast-grid-with-current {
      display: flex;
      align-items: stretch;
      gap: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
      margin: 0 -4px;
      padding: 0 4px;
    }
    
    .forecast-grid-with-current::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }
    
    .current-weather {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
      background: var(--primary-background-color, rgba(255, 255, 255, 0.05));
      border-radius: var(--sensor-card-radius, 12px);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
      min-width: 80px;
    }
    
    .current-weather .current-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-color, #3B82F6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    
    .current-weather .weather-icon {
      margin: 4px 0;
    }
    
    .current-weather .weather-icon ha-icon {
      --mdc-icon-size: 32px;
    }
    
    .current-weather .current-temp {
      font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
      font-size: 24px;
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }
    
    .current-weather .current-condition {
      font-size: 12px;
      color: var(--secondary-text-color);
      text-transform: capitalize;
      margin-top: 2px;
    }
    
    .forecast-days {
      display: flex;
      flex: 1;
      justify-content: space-around;
      flex-shrink: 0;
      min-width: max-content;
    }

    .forecast-day-group {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }

    .forecast-day-boundary {
      font-size: 10px;
      font-weight: 700;
      color: var(--primary-color, #3B82F6);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 4px 0;
    }
  `;

  private _handleToggle(): void {
    this.dispatchEvent(new CustomEvent('toggle-collapse', {
      bubbles: true,
      composed: true,
      detail: { section: 'forecast', collapsed: !this.collapsed },
    }));
  }

  private _getCurrentWeather() {
    if (!this.hass || !this.config?.entity) return null;
    
    const entity = this.hass.states[this.config.entity];
    if (!entity) return null;

    // Some integrations (e.g. OpenWeatherMap) report state as "unknown" or "unavailable".
    // Fall back to the first forecast entry's condition in that case.
    let condition = entity.state;
    if (condition === 'unknown' || condition === 'unavailable') {
      condition = this.forecast[0]?.condition ?? condition;
    }

    return {
      temperature: entity.attributes.temperature,
      temperature_unit: entity.attributes.temperature_unit ?? '°C',
      condition,
    };
  }

  private _renderCurrentWeather() {
    const weather = this._getCurrentWeather();
    if (!weather) return nothing;

    const icon = getWeatherIcon(weather.condition);
    const iconColor = getWeatherIconColor(weather.condition);
    const conditionLabel = getConditionLabel(weather.condition);

    return html`
      <div class="current-weather">
        <span class="current-label">Now</span>
        <div class="weather-icon" style="color: ${iconColor}">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <span class="current-temp">
          ${weather.temperature != null 
            ? formatTemperature(weather.temperature, 1, 
                weather.temperature_unit?.includes('F') ? 'fahrenheit' : 'celsius')
            : '--'}
        </span>
        <span class="current-condition">${conditionLabel}</span>
      </div>
    `;
  }

  private _renderForecastDay(day: WeatherForecast) {
    const icon = getWeatherIcon(day.condition);
    const iconColor = getWeatherIconColor(day.condition);

    if (this.forecastType === 'hourly') {
      const timeLabel = getTimeFromISOString(day.datetime);
      return html`
        <div class="forecast-day">
          <span class="forecast-day-name">${timeLabel}</span>
          <div class="forecast-icon" style="color: ${iconColor}">
            <ha-icon .icon=${icon}></ha-icon>
          </div>
          <span class="forecast-high value-text">${Math.round(day.temperature)}°</span>
        </div>
      `;
    }

    const dayName = getDayFromISOString(day.datetime);
    const showLow = day.templow != null;

    return html`
      <div class="forecast-day">
        <span class="forecast-day-name">${dayName}</span>
        <div class="forecast-icon" style="color: ${iconColor}">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <span class="forecast-high value-text">${Math.round(day.temperature)}°</span>
        <span class="forecast-low value-text">
          ${showLow ? `${Math.round(day.templow!)}°` : '—'}
        </span>
      </div>
    `;
  }

  private _renderHourlyForecast(entries: WeatherForecast[]) {
    // Group entries by calendar date to insert day-boundary labels
    let currentDay = '';
    const groups: Array<{ dayLabel: string | null; entry: WeatherForecast }> = [];

    for (const entry of entries) {
      const day = entry.datetime.substring(0, 10);
      if (day !== currentDay) {
        groups.push({ dayLabel: getDayFromISOString(entry.datetime), entry });
        currentDay = day;
      } else {
        groups.push({ dayLabel: null, entry });
      }
    }

    return html`
      ${groups.map(({ dayLabel, entry }) => html`
        <div class="forecast-day-group">
          ${dayLabel ? html`<span class="forecast-day-boundary">${dayLabel}</span>` : nothing}
          ${this._renderForecastDay(entry)}
        </div>
      `)}
    `;
  }

  render() {
    const collapsible = this.config?.collapsible ?? DEFAULT_WEATHER_CONFIG.collapsible;
    const forecastDays = this.config?.forecast_days ?? DEFAULT_WEATHER_CONFIG.forecast_days;
    
    const displayForecast = this.forecast.slice(0, forecastDays);
    const hasCurrentWeather = this._getCurrentWeather() != null;

    if (displayForecast.length === 0 && !hasCurrentWeather) {
      return nothing;
    }

    return html`
      <collapsible-section
        title="FORECAST"
        ?collapsed=${this.collapsed}
        ?collapsible=${collapsible}
        @toggle-collapse=${this._handleToggle}
      >
        <div class="forecast-grid-with-current">
          ${this._renderCurrentWeather()}
          <div class="forecast-days">
            ${this.forecastType === 'hourly'
              ? this._renderHourlyForecast(displayForecast)
              : displayForecast.map((day) => this._renderForecastDay(day))}
          </div>
        </div>
      </collapsible-section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'forecast-section': ForecastSection;
  }
}
