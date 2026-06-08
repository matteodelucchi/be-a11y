const headingOrder = require('../../src/rules/headingOrder');

describe('headingOrder Rule', () => {
  const defaultConfig = { lang: 'en' };

  describe('Valid heading hierarchy', () => {
    it('should pass for sequential headings', () => {
      const html = '<html><body><h1>Title</h1><h2>Subtitle</h2><h3>Section</h3></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should pass for headings with single level jumps', () => {
      const html = '<html><body><h1>Title</h1><h2>Subtitle</h2><h3>Section</h3><h2>Another</h2></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should pass for headings that go back up', () => {
      const html = '<html><body><h1>Title</h1><h2>Subtitle</h2><h1>Another Title</h1></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Invalid heading hierarchy', () => {
    it('should flag h1 followed by h3 (skipping h2)', () => {
      const html = '<html><body><h1>Title</h1><h3>Section</h3></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-order');
    });

    it('should flag h2 followed by h4 (skipping h3)', () => {
      const html = '<html><body><h1>Title</h1><h2>Subtitle</h2><h4>Section</h4></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-order');
    });

    it('should flag multiple hierarchy violations', () => {
      const html = '<html><body><h1>Title</h1><h3>Section 1</h3><h2>Subtitle</h2><h4>Section 2</h4></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(2);
      expect(errors.every(e => e.type === 'heading-order')).toBe(true);
    });
  });

  describe('Sectioning elements', () => {
    it('should reset hierarchy in section elements', () => {
      const html = '<html><body><h1>Title</h1><section><h2>Section Title</h2></section></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should reset hierarchy in article elements', () => {
      const html = '<html><body><h1>Title</h1><article><h2>Article Title</h2></article></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should reset hierarchy in aside elements', () => {
      const html = '<html><body><h1>Title</h1><aside><h2>Aside Title</h2></aside></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should reset hierarchy in nav elements', () => {
      const html = '<html><body><h1>Title</h1><nav><h2>Nav Title</h2></nav></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should reset hierarchy in main elements', () => {
      const html = '<html><body><header><h1>Title</h1></header><main><h2>Main Title</h2></main></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should allow h3 after section (hierarchy resets)', () => {
      const html = '<html><body><h1>Title</h1><section><h3>Section Title</h3></section></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      // After a section, hierarchy resets, so h3 is valid
      expect(errors.length).toBe(0);
    });

    it('should flag h4 after h2 within same section', () => {
      const html = '<html><body><section><h2>Section</h2><h4>Skip</h4></section></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-order');
    });

    it('should handle nested sections', () => {
      const html = '<html><body><h1>Title</h1><section><h2>Section 1</h2><section><h3>Nested</h3></section></section></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for HTML without headings', () => {
      const html = '<html><body><p>No headings here</p></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should handle h1 only', () => {
      const html = '<html><body><h1>Title</h1></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should handle all heading levels in order', () => {
      const html = '<html><body><h1>A</h1><h2>B</h2><h3>C</h3><h4>D</h4><h5>E</h5><h6>F</h6></body></html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should report correct line numbers', () => {
      const html = '<html>\n<body>\n<h1>Title</h1>\n<h3>Skip</h3>\n</body>\n</html>';
      const errors = headingOrder(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].line).toBe(4);
    });
  });
});
