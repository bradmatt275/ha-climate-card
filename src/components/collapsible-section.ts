import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { sectionStyles, typographyStyles, cssVariables } from '../styles';

@customElement('collapsible-section')
export class CollapsibleSection extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: Boolean }) collapsed = false;
  @property({ type: Boolean }) collapsible = true;

  @state() private _contentHeight = 0;
  private _contentRef: HTMLDivElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  static styles = css`
    ${cssVariables}
    ${typographyStyles}
    ${sectionStyles}
    
    :host {
      display: block;
    }
    
    .section-content-wrapper {
      overflow: hidden;
      transition: height 200ms ease;
    }
    
    .section-content-wrapper.collapsed {
      height: 0 !important;
    }
    
    .section-content-inner {
      padding-top: 8px;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this._contentHeight = entry.contentRect.height;
      }
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  firstUpdated(): void {
    this._contentRef = this.shadowRoot?.querySelector('.section-content-inner') ?? null;
    if (this._contentRef && this._resizeObserver) {
      this._resizeObserver.observe(this._contentRef);
      this._contentHeight = this._contentRef.offsetHeight;
    }
  }

  updated(changedProps: PropertyValues): void {
    if (changedProps.has('collapsed') && this._contentRef) {
      this._contentHeight = this._contentRef.offsetHeight;
    }
  }

  private _toggleCollapse(): void {
    if (!this.collapsible) return;
    
    this.dispatchEvent(new CustomEvent('toggle-collapse', {
      bubbles: true,
      composed: true,
      detail: { collapsed: !this.collapsed },
    }));
  }

  render() {
    const headerClasses = {
      'section-header-row': true,
      'collapsible': this.collapsible,
    };

    const indicatorClasses = {
      'collapse-indicator': true,
      'collapsed': this.collapsed,
    };

    const wrapperClasses = {
      'section-content-wrapper': true,
      'collapsed': this.collapsed,
    };

    const wrapperStyle = this.collapsed 
      ? '' 
      : `height: ${this._contentHeight}px`;

    return html`
      <div class="section">
        <div 
          class=${classMap(headerClasses)}
          @click=${this._toggleCollapse}
          role=${this.collapsible ? 'button' : 'heading'}
          aria-expanded=${this.collapsible ? String(!this.collapsed) : undefined}
          tabindex=${this.collapsible ? '0' : '-1'}
          @keydown=${(e: KeyboardEvent) => {
            if (this.collapsible && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              this._toggleCollapse();
            }
          }}
        >
          ${this.collapsible ? html`
            <ha-icon 
              class=${classMap(indicatorClasses)}
              icon="mdi:chevron-down"
            ></ha-icon>
          ` : ''}
          <span class="section-header">${this.title}</span>
        </div>
        <div 
          class=${classMap(wrapperClasses)}
          style=${wrapperStyle}
          aria-hidden=${this.collapsed}
        >
          <div class="section-content-inner">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'collapsible-section': CollapsibleSection;
  }
}
