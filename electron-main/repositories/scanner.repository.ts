import { getDb } from '../database/database';

export interface ScannerSettings {
  id: number;
  scanner_name: string | null;
  dpi: number;
  color_mode: string;
  paper_size: string;
  duplex: number;
  auto_crop: number;
  auto_rotate: number;
}

export class ScannerRepository {
  static get(): ScannerSettings | undefined {
    return getDb()
      .prepare(
        `
        SELECT *
        FROM scanner_settings
        WHERE id = 1
      `
      )
      .get() as ScannerSettings | undefined;
  }

  static createDefault() {
    return getDb()
      .prepare(
        `
        INSERT OR IGNORE INTO scanner_settings
        (
          id,
          scanner_name,
          dpi,
          color_mode,
          paper_size,
          duplex,
          auto_crop,
          auto_rotate
        )
        VALUES
        (
          1,
          'Epson DS-530',
          300,
          'Color',
          'A4',
          0,
          1,
          1
        )
      `
      )
      .run();
  }

  static update(data: Partial<ScannerSettings>) {
    const fields = Object.keys(data)
      .map((key) => `${key}=@${key}`)
      .join(',');

    return getDb()
      .prepare(
        `
        UPDATE scanner_settings
        SET ${fields}
        WHERE id=1
      `
      )
      .run(data);
  }
}
