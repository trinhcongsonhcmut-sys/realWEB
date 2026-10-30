import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface TextBlockContent {
  text?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  // Legacy fields (optional)
  tagline?: string;
  headline?: string;
  description?: string;
  bulletPoints?: string[];
  ctaText?: string;
  ctaLink?: string;
}

export class TextBlock extends BaseBlock<TextBlockContent> {
  constructor(schema: PopupBlockSchema<TextBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-text');
    const c = this.schema.content;

    // Convert legacy mock content if text is not yet set
    if (c.text === undefined) {
      if (c.headline && c.headline.includes('Sky Horizon')) {
        c.text = 'Tọa lạc tại tâm điểm phồn hoa, công trình hội tụ các giá trị kiến trúc tinh tế nhất cùng hệ sinh thái tiện ích chuẩn quốc tế.\n\nKhông gian được thiết kế mở tối đa với tầm nhìn bao trọn hồ cảnh quan trung tâm, mang đến trải nghiệm sống thượng lưu khác biệt.';
      } else if (c.headline || c.description) {
        c.text = [c.headline, c.description].filter(Boolean).join('\n\n');
      } else {
        c.text = 'Nhập nội dung văn bản của bạn tại đây...';
      }
    }

    // Clean up any old mock properties
    delete c.ctaText;
    delete c.ctaLink;
    delete c.bulletPoints;
    delete c.tagline;
    delete c.headline;
    delete c.description;

    const fontFamily = c.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const fontSize = c.fontSize || '16px';
    const fontWeight = c.fontWeight || '400';
    const fontStyle = c.fontStyle || 'normal';
    const textAlign = c.textAlign || 'left';
    const textColor = c.textColor || '#f1f5f9';
    const lineHeight = c.lineHeight || '1.6';
    const letterSpacing = c.letterSpacing || 'normal';
    const textTransform = c.textTransform || 'none';

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Văn Bản'}</span>
      </div>
      <div class="popup-content-body pure-text-body">
        <div 
          class="pure-text-content" 
          contenteditable="true"
          spellcheck="false"
          style="
            font-family: ${fontFamily};
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            font-style: ${fontStyle};
            text-align: ${textAlign};
            color: ${textColor};
            line-height: ${lineHeight};
            letter-spacing: ${letterSpacing};
            text-transform: ${textTransform};
            white-space: pre-wrap;
            word-break: break-word;
            width: 100%;
            height: 100%;
            outline: none;
            cursor: text;
          "
        >${c.text || ''}</div>
      </div>
    `;

    const textEl = card.querySelector('.pure-text-content') as HTMLElement;
    if (textEl) {
      // Don't drag block when selecting or typing in text box
      textEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });

      textEl.addEventListener('input', () => {
        c.text = textEl.innerText;
        this.emitter.emit('builder:text-content-changed', { blockId: this.schema.id, text: c.text });
      });

      textEl.addEventListener('blur', () => {
        c.text = textEl.innerText;
        this.emitter.emit('builder:block-updated', this.schema);
      });
    }

    return card;
  }
}
