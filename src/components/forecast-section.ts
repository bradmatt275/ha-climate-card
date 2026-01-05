import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { WeatherConfig, WeatherForecast } from '../types';
import { cssVariables, forecastStyles, gridStyles, typographyStyles } from '../styles';
import { getWeatherIcon, getWeatherIconColor } from '../utils/weather-icons';
import { getDayFromISOString } from '../utils/format';
import { DEFAULT_WEATHER_CONFIG } from '../const';

import './collapsible-section';

@customElement('forecast-section')
export class ForecastSection extends LitElement {
  @property({ attribute: false }) config!: WeatherConfig;
  @property({ type: Array }) forecast: WeatherForecast[] = [];
  @property({ type: Boolean }) collapsed = false;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${forecastStyles}
    ${gridStyles}
    
    :host {
      display: block;
    }
  `;

  private _handleToggle(): void {
    this.dispatchEvent(new CustomEvent('toggle-collapse', {
      bubbles: true,
      composed: true,
      detail: { section: 'forecast', collapsed: !this.collapsed },
    }));
  }

  private _renderForecastDay(day: WeatherForecast) {
    const dayName = getDayFromISOString(day.datetime);
    const icon = getWeatherIcon(day.condition);
    const iconColor = getWeatherIconColor(day.condition);

    // For today (index 0), low temp might not be available
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

  render() {
    const collapsible = this.config?.collapsible ?? DEFAULT_WEATHER_CONFIG.collapsible;
    const forecastDays = this.config?.forecast_days ?? DEFAULT_WEATHER_CONFIG.forecast_days;
    
    const displayForecast = this.forecast.slice(0, forecastDays);

    if (displayForecast.length === 0) {
      return nothing;
    }

    return html`
      <collapsible-section
        title="FORECAST"
        ?collapsed=${this.collapsed}
        ?collapsible=${collapsible}
        @toggle-collapse=${this._handleToggle}
      >
        <div class="forecast-grid">
          ${displayForecast.map((day) => this._renderForecastDay(day))}
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
