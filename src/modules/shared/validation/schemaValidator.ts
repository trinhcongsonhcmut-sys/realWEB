import { PageSchema, SectionSchema, PopupBlockSchema } from '../schemas/page.types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class PageSchemaValidator {
  public static validate(page: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!page || typeof page !== 'object') {
      return { valid: false, errors: ['Dữ liệu cấu hình trang không phải là Object hợp lệ.'], warnings };
    }

    if (!page.id) {
      errors.push('Thiếu trường "id" của trang.');
    }

    if (page.schemaVersion !== '2.0.0') {
      errors.push(`Phiên bản Schema không hợp lệ: "${page.schemaVersion}". Yêu cầu phiên bản "2.0.0".`);
    }

    if (!Array.isArray(page.sections)) {
      errors.push('Trường "sections" phải là một mảng.');
    } else {
      const sectionIds = new Set<string>();
      page.sections.forEach((sec: SectionSchema, sIdx: number) => {
        if (!sec.id) {
          errors.push(`Section tại vị trí ${sIdx} thiếu "id".`);
        } else if (sectionIds.has(sec.id)) {
          errors.push(`Section ID "${sec.id}" bị trùng lặp.`);
        } else {
          sectionIds.add(sec.id);
        }

        if (!Array.isArray(sec.blocks)) {
          errors.push(`Section "${sec.id || sIdx}" trường "blocks" phải là một mảng.`);
        } else {
          const blockIds = new Set<string>();
          sec.blocks.forEach((blk: PopupBlockSchema, bIdx: number) => {
            if (!blk.id) {
              errors.push(`Block tại vị trí ${bIdx} trong section "${sec.id}" thiếu "id".`);
            } else if (blockIds.has(blk.id)) {
              errors.push(`Block ID "${blk.id}" bị trùng lặp trong cùng section.`);
            } else {
              blockIds.add(blk.id);
            }

            // Check if any block contains huge base64 strings in content
            if (blk.content && typeof blk.content === 'object') {
              const contentStr = JSON.stringify(blk.content);
              if (contentStr.includes('data:image/') || contentStr.includes('data:video/')) {
                if (contentStr.length > 50000) {
                  errors.push(
                    `Block "${blk.id}" chứa chuỗi base64 quá lớn (>50KB). Vui lòng sử dụng MediaManager để lưu trữ nhị phân.`
                  );
                }
              }
            }
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  public static sanitize(page: PageSchema): PageSchema {
    // Sort sections by order
    const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);
    sortedSections.forEach((sec) => {
      sec.blocks = [...sec.blocks].sort((a, b) => a.order - b.order);
    });

    return {
      ...page,
      sections: sortedSections,
      updatedAt: new Date().toISOString()
    };
  }
}

