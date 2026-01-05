import { LitElement, html, css, svg, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { TemperatureHistoryPoint } from '../types';
import { cssVariables, sparklineStyles } from '../styles';

@customElement('sparkline-chart')
export class SparklineChart extends LitElement {
  @property({ type: Array }) data: TemperatureHistoryPoint[] = [];
  @property({ type: String }) color = 'var(--primary-text-color)';
  @property({ type: Number }) width = 100;
  @property({ type: Number }) height = 32;
  @property({ type: Boolean }) animated = true;
  @property({ type: Boolean }) showArea = true;

  @state() private _pathLength = 0;
  private _pathRef: SVGPathElement | null = null;

  static styles = css`
    ${cssVariables}
    ${sparklineStyles}
    
    :host {
      display: block;
      width: 100%;
      height: var(--sparkline-height, 40px);
    }
    
    svg {
      display: block;
      width: 100%;
      height: var(--sparkline-height, 40px);
    }
  `;

  firstUpdated(): void {
    this._pathRef = this.shadowRoot?.querySelector('.sparkline-path') ?? null;
    this._updatePathLength();
  }

  updated(changedProps: PropertyValues): void {
    if (changedProps.has('data')) {
      this._updatePathLength();
    }
  }

  private _updatePathLength(): void {
    if (this._pathRef) {
      this._pathLength = this._pathRef.getTotalLength();
      this.style.setProperty('--path-length', String(this._pathLength));
    }
  }

  private _generatePath(): string {
    if (this.data.length < 2) return '';

    const padding = 2;
    const effectiveWidth = this.width - padding * 2;
    const effectiveHeight = this.height - padding * 2;

    const values = this.data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = this.data.map((d, i) => {
      const x = padding + (i / (this.data.length - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((d.value - min) / range) * effectiveHeight;
      return { x, y };
    });

    // Generate smooth curve using quadratic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;

      if (i === 1) {
        path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
      } else {
        path += ` T ${midX} ${midY}`;
      }
    }

    // Add final point
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;

    return path;
  }

  private _generateAreaPath(): string {
    const linePath = this._generatePath();
    if (!linePath) return '';

    const padding = 2;
    const lastPoint = this.data.length > 0 
      ? padding + ((this.data.length - 1) / (this.data.length - 1)) * (this.width - padding * 2)
      : this.width - padding;
    const firstPoint = padding;

    return `${linePath} L ${lastPoint} ${this.height - padding} L ${firstPoint} ${this.height - padding} Z`;
  }

  render() {
    const pathClasses = {
      'sparkline-path': true,
      'animated': this.animated && this._pathLength > 0,
    };

    const path = this._generatePath();
    const areaPath = this.showArea ? this._generateAreaPath() : '';

    return html`
      <svg
        class="sparkline"
        viewBox="0 0 ${this.width} ${this.height}"
        preserveAspectRatio="none"
      >
        ${this.showArea && areaPath ? svg`
          <path
            class="sparkline-area"
            d=${areaPath}
            fill=${this.color}
          />
        ` : ''}
        ${path ? svg`
          <path
            class=${classMap(pathClasses)}
            d=${path}
            stroke=${this.color}
            style="--path-length: ${this._pathLength}"
          />
        ` : ''}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sparkline-chart': SparklineChart;
  }
}
