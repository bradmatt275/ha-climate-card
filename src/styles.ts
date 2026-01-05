import { css } from 'lit';

// ============================================
// CSS Custom Properties
// ============================================

export const cssVariables = css`
  :host {
    /* AC Mode Colors */
    --climate-cool: #3B82F6;
    --climate-cool-container: rgba(59, 130, 246, 0.15);
    
    --climate-heat: #F97316;
    --climate-heat-container: rgba(249, 115, 22, 0.15);
    
    --climate-fan: #06B6D4;
    --climate-fan-container: rgba(6, 182, 212, 0.15);
    
    --climate-dry: #A855F7;
    --climate-dry-container: rgba(168, 85, 247, 0.15);
    
    --climate-auto: #10B981;
    --climate-auto-container: rgba(16, 185, 129, 0.15);
    
    --climate-off: var(--secondary-text-color, #9CA3AF);
    
    /* Temperature Range Colors */
    --temp-cold: #3B82F6;
    --temp-cool: #06B6D4;
    --temp-comfortable: #10B981;
    --temp-warm: #F59E0B;
    --temp-hot: #EF4444;
    
    /* Weather Icon Colors */
    --weather-sun: #FBBF24;
    --weather-moon: #FCD34D;
    --weather-cloud: #94A3B8;
    --weather-rain: #3B82F6;
    --weather-storm: #6366F1;
    
    /* Zone State Colors */
    --zone-active: #14B8A6;
    --zone-active-container: rgba(20, 184, 166, 0.15);
    --zone-inactive: var(--secondary-text-color, #9CA3AF);
    
    /* Card Layout */
    --card-padding: 16px;
    --section-gap: 16px;
    --row-gap: 8px;
    --grid-gap: 8px;
    
    /* Border Radius */
    --card-radius: 12px;
    --button-radius: 8px;
    --sensor-card-radius: 12px;
    
    /* Touch Targets */
    --button-size: 44px;
    --button-icon-size: 20px;
  }
`;

// ============================================
// Base Card Styles
// ============================================

export const cardStyles = css`
  ha-card {
    padding: var(--card-padding);
    overflow: hidden;
  }
`;

// ============================================
// Typography Styles
// ============================================

export const typographyStyles = css`
  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin: 0;
  }
  
  .section-header {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    letter-spacing: 0.05em;
  }
  
  .value-text {
    font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
    font-variant-numeric: tabular-nums;
  }
  
  .hero-value {
    font-size: 24px;
    font-weight: 500;
  }
  
  .primary-value {
    font-size: 16px;
    font-weight: 600;
  }
  
  .secondary-value {
    font-size: 14px;
    font-weight: 400;
    color: var(--secondary-text-color);
  }
  
  .label-text {
    font-size: 12px;
    font-weight: 500;
  }
  
  .small-text {
    font-size: 12px;
    font-weight: 400;
    color: var(--secondary-text-color);
  }
`;

// ============================================
// Section Styles
// ============================================

export const sectionStyles = css`
  .section {
    margin-top: var(--section-gap);
  }
  
  .section:first-child {
    margin-top: 0;
  }
  
  .section-header-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  
  .section-header-row:not(.collapsible) {
    cursor: default;
  }
  
  .collapse-indicator {
    transition: transform 200ms ease;
    color: var(--secondary-text-color);
  }
  
  .collapse-indicator.collapsed {
    transform: rotate(-90deg);
  }
  
  .section-content {
    overflow: hidden;
    transition: height 200ms ease, opacity 200ms ease;
  }
  
  .section-content.collapsed {
    height: 0 !important;
    opacity: 0;
  }
`;

// ============================================
// Row Styles
// ============================================

export const rowStyles = css`
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--card-background-color, var(--ha-card-background));
    border: 1px solid var(--divider-color);
    border-radius: var(--card-radius);
    margin-bottom: var(--row-gap);
    transition: background-color 300ms ease, border-color 300ms ease;
  }
  
  .row:last-child {
    margin-bottom: 0;
  }
  
  .row-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    color: var(--primary-text-color);
  }
  
  .row-icon ha-icon {
    --mdc-icon-size: 24px;
  }
  
  .row-content {
    flex: 1;
    min-width: 0;
  }
  
  .row-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .row-state {
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  
  .row-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  
  /* Active row styling */
  .row.active {
    border-left: 4px solid var(--zone-active);
    background: var(--zone-active-container);
  }
  
  /* Mode-colored row */
  .row.mode-cool {
    border-left: 4px solid var(--climate-cool);
    background: var(--climate-cool-container);
  }
  
  .row.mode-heat {
    border-left: 4px solid var(--climate-heat);
    background: var(--climate-heat-container);
  }
  
  .row.mode-fan,
  .row.mode-fan_only {
    border-left: 4px solid var(--climate-fan);
    background: var(--climate-fan-container);
  }
  
  .row.mode-dry {
    border-left: 4px solid var(--climate-dry);
    background: var(--climate-dry-container);
  }
  
  .row.mode-auto,
  .row.mode-heat_cool {
    border-left: 4px solid var(--climate-auto);
    background: var(--climate-auto-container);
  }
  
  .row.mode-off {
    border-left: 4px solid transparent;
  }
`;

// ============================================
// Button Styles
// ============================================

export const buttonStyles = css`
  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--button-size);
    height: var(--button-size);
    min-width: var(--button-size);
    min-height: var(--button-size);
    border: 1px solid var(--divider-color);
    border-radius: var(--button-radius);
    background: var(--card-background-color, var(--ha-card-background));
    color: var(--primary-text-color);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 100ms ease, background-color 100ms ease;
  }
  
  .control-button:hover {
    background: var(--secondary-background-color);
  }
  
  .control-button:active {
    transform: scale(0.95);
    background: var(--divider-color);
  }
  
  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .control-button:disabled:hover {
    background: var(--card-background-color, var(--ha-card-background));
  }
  
  .control-button:disabled:active {
    transform: none;
  }
  
  .control-button ha-icon {
    --mdc-icon-size: var(--button-icon-size);
  }
`;

// ============================================
// Dropdown Styles
// ============================================

export const dropdownStyles = css`
  .dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid var(--divider-color);
    border-radius: var(--button-radius);
    background: var(--card-background-color, var(--ha-card-background));
    cursor: pointer;
    user-select: none;
    gap: 8px;
    min-width: 100px;
    transition: background-color 100ms ease;
  }
  
  .dropdown:hover {
    background: var(--secondary-background-color);
  }
  
  .dropdown-icon {
    display: flex;
    align-items: center;
  }
  
  .dropdown-icon ha-icon {
    --mdc-icon-size: 18px;
  }
  
  .dropdown-label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .dropdown-chevron {
    display: flex;
    align-items: center;
    color: var(--secondary-text-color);
  }
  
  .dropdown-chevron ha-icon {
    --mdc-icon-size: 18px;
  }
`;

// ============================================
// Grid Styles
// ============================================

export const gridStyles = css`
  .sensor-grid {
    display: grid;
    gap: var(--grid-gap);
    grid-template-columns: repeat(var(--columns, 3), 1fr);
  }
  
  @media (max-width: 800px) {
    .sensor-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 600px) {
    .sensor-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .forecast-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  }
  
  @media (max-width: 600px) {
    .forecast-grid {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .forecast-grid::-webkit-scrollbar {
      display: none;
    }
    
    .forecast-day {
      scroll-snap-align: start;
      min-width: 60px;
      flex-shrink: 0;
    }
  }
`;

// ============================================
// Sensor Card Styles
// ============================================

export const sensorCardStyles = css`
  .sensor-card {
    background: var(--card-background-color, var(--ha-card-background));
    border: 1px solid var(--divider-color);
    border-radius: var(--sensor-card-radius);
    padding: 12px;
    cursor: pointer;
    transition: background-color 100ms ease;
  }
  
  .sensor-card:hover {
    background: var(--secondary-background-color);
  }
  
  .sensor-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .sensor-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .sensor-values {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  
  .sensor-temp {
    font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
    font-size: 16px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  
  .sensor-humidity {
    display: flex;
    align-items: center;
    gap: 2px;
    font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }
  
  .sensor-humidity ha-icon {
    --mdc-icon-size: 14px;
    color: var(--weather-rain);
  }
  
  .sensor-sparkline {
    height: 32px;
    margin-top: 4px;
  }
`;

// ============================================
// Forecast Styles
// ============================================

export const forecastStyles = css`
  .forecast-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    text-align: center;
  }
  
  .forecast-day-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
  
  .forecast-icon {
    margin: 4px 0;
  }
  
  .forecast-icon ha-icon {
    --mdc-icon-size: 24px;
  }
  
  .forecast-high {
    font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  
  .forecast-low {
    font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
    font-size: 14px;
    font-weight: 400;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }
`;

// ============================================
// Header Styles
// ============================================

export const headerStyles = css`
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
  }
  
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }
  
  .weather-current {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .weather-icon ha-icon {
    --mdc-icon-size: 28px;
  }
  
  .weather-temp {
    font-family: var(--paper-font-common-code_-_font-family, 'Roboto Mono', monospace);
    font-size: 24px;
    font-weight: 500;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  
  .weather-condition {
    font-size: 14px;
    color: var(--secondary-text-color);
    text-transform: capitalize;
  }
`;

// ============================================
// Sparkline Styles
// ============================================

export const sparklineStyles = css`
  .sparkline {
    width: 100%;
    height: 100%;
  }
  
  .sparkline-path {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  .sparkline-path.animated {
    stroke-dasharray: var(--path-length);
    stroke-dashoffset: var(--path-length);
    animation: draw-sparkline 500ms ease-out forwards;
  }
  
  .sparkline-area {
    opacity: 0.2;
  }
  
  @keyframes draw-sparkline {
    to {
      stroke-dashoffset: 0;
    }
  }
`;

// ============================================
// Animation Styles
// ============================================

export const animationStyles = css`
  /* Active zone pulse */
  .zone-pulse {
    animation: zone-pulse 2s ease-in-out infinite;
  }
  
  @keyframes zone-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  /* Value change highlight */
  .value-changing {
    animation: value-flash 300ms ease;
  }
  
  @keyframes value-flash {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .sparkline-path.animated {
      stroke-dashoffset: 0 !important;
      animation: none !important;
    }
  }
`;

// ============================================
// Combined Shared Styles
// ============================================

export const sharedStyles = css`
  ${cssVariables}
  ${typographyStyles}
  ${sectionStyles}
  ${rowStyles}
  ${buttonStyles}
  ${dropdownStyles}
  ${animationStyles}
`;
