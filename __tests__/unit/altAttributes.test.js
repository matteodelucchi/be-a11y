const altAttributes = require('../../src/rules/altAttributes');

describe('altAttributes Rule', () => {
  const defaultConfig = { rules: {}, lang: 'en', altMaxLength: 125 };

  describe('Missing alt attribute', () => {
    it('should flag images without alt attribute', () => {
      const html = '<html><body><img src="test.jpg"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('missing-alt');
      expect(errors[0].file).toBe('test.html');
    });

    it('should flag multiple images without alt attribute on different lines', () => {
      const html = '<html><body><img src="test1.jpg">\n<img src="test2.jpg"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(2);
      expect(errors.every(e => e.type === 'missing-alt')).toBe(true);
    });

    it('should report only one error for multiple images on same line', () => {
      const html = '<html><body><img src="test1.jpg"><img src="test2.jpg"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('missing-alt');
    });
  });

  describe('Empty alt attribute', () => {
    it('should NOT flag images with empty alt (treated as decorative)', () => {
      const html = '<html><body><img src="test.jpg" alt=""></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      // Empty alt is treated as decorative and valid
      expect(errors.length).toBe(0);
    });

    it('should NOT flag decorative images with empty alt and role', () => {
      const html = '<html><body><img src="test.jpg" alt="" role="presentation"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should NOT flag decorative images with aria-hidden="true"', () => {
      const html = '<html><body><img src="test.jpg" alt="" aria-hidden="true"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should flag images with whitespace-only alt', () => {
      const html = '<html><body><img src="test.jpg" alt="   "></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      // Whitespace-only alt is not empty string, so not decorative
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('alt-empty');
    });
  });

  describe('Decorative images', () => {
    it('should flag decorative images with non-empty alt', () => {
      const html = '<html><body><img src="test.jpg" alt="decorative image" role="presentation"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('alt-decorative-incorrect');
    });

    it('should flag decorative images with aria-hidden and non-empty alt', () => {
      const html = '<html><body><img src="test.jpg" alt="decorative" aria-hidden="true"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('alt-decorative-incorrect');
    });

    it('should allow decorative images with empty alt', () => {
      const html = '<html><body><img src="test.jpg" alt="" role="presentation"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Functional images', () => {
    it('should flag functional images with empty alt inside links', () => {
      const html = '<html><body><a href="#"><img src="icon.jpg" alt=""></a></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('alt-functional-empty');
    });

    it('should flag functional images with empty alt inside buttons', () => {
      const html = '<html><body><button><img src="icon.jpg" alt=""></button></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('alt-functional-empty');
    });

    it('should allow functional images with descriptive alt', () => {
      const html = '<html><body><a href="#"><img src="icon.jpg" alt="Download PDF"></a></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Alt text length', () => {
    it('should flag alt text exceeding max length', () => {
      const longAlt = 'a'.repeat(126);
      const html = `<html><body><img src="test.jpg" alt="${longAlt}"></body></html>`;
      const config = { ...defaultConfig, altMaxLength: 125 };
      const errors = altAttributes(html, 'test.html', config);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('alt-too-long');
    });

    it('should not flag alt text within max length', () => {
      const alt = 'a'.repeat(125);
      const html = `<html><body><img src="test.jpg" alt="${alt}"></body></html>`;
      const config = { ...defaultConfig, altMaxLength: 125 };
      const errors = altAttributes(html, 'test.html', config);
      expect(errors.length).toBe(0);
    });
  });

  describe('Redundant title', () => {
    it('should flag when alt and title are the same', () => {
      const html = '<html><body><img src="test.jpg" alt="Test Image" title="Test Image"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('redundant-title');
    });

    it('should flag when alt and title are the same (case insensitive)', () => {
      const html = '<html><body><img src="test.jpg" alt="Test Image" title="test image"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('redundant-title');
    });

    it('should not flag when redundant-title rule is disabled', () => {
      const html = '<html><body><img src="test.jpg" alt="Test Image" title="Test Image"></body></html>';
      const config = { ...defaultConfig, rules: { 'redundant-title': false } };
      const errors = altAttributes(html, 'test.html', config);
      expect(errors.length).toBe(0);
    });

    it('should not flag when alt and title are different', () => {
      const html = '<html><body><img src="test.jpg" alt="An image" title="A different title"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Valid images', () => {
    it('should pass for images with valid alt text', () => {
      const html = '<html><body><img src="test.jpg" alt="A descriptive alt text"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should return empty array for HTML without images', () => {
      const html = '<html><body><p>No images here</p></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Line numbers', () => {
    it('should report correct line numbers', () => {
      const html = '<html>\n<body>\n<img src="test.jpg">\n</body>\n</html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].line).toBe(3);
    });
  });

  describe('Duplicate errors', () => {
    it('should not report duplicate errors for the same element', () => {
      const html = '<html><body><img src="test.jpg"></body></html>';
      const errors = altAttributes(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
    });
  });
});
