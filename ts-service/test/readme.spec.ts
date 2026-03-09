import * as fs from 'fs';
import * as path from 'path';

describe('README.md', () => {
  it('exists in project root', () => {
    const readmePath = path.resolve(__dirname, '..', 'README.md');
    const exists = fs.existsSync(readmePath);
    expect(exists).toBe(true);
  });
});
