import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { buttonStyles, cssVariables } from '../styles';

@customElement('control-button')
export class ControlButton extends LitElement {
  @property({ type: String }) icon = 'mdi:plus';
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: 'aria-label' }) ariaLabel = '';

  static styles = css`
    ${cssVariables}
    ${buttonStyles}
  `;

  private _handleClick(e: Event): void {
    e.stopPropagation();
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent('button-click', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    return html`
      <button
        class="control-button"
        ?disabled=${this.disabled}
        aria-label=${this.ariaLabel || this.icon}
        @click=${this._handleClick}
      >
        <ha-icon .icon=${this.icon}></ha-icon>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'control-button': ControlButton;
  }
}
