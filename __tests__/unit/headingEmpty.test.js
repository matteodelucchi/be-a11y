const headingEmpty = require('../../src/rules/headingEmpty');

describe('headingEmpty Rule', () => {
  const defaultConfig = { lang: 'en' };

  describe('Empty headings', () => {
    it('should flag empty h1', () => {
      const html = '<html><body><h1></h1></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-empty');
    });

    it('should flag empty h2', () => {
      const html = '<html><body><h2></h2></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-empty');
    });

    it('should flag empty h3-h6', () => {
      const html = '<html><body><h3></h3><h4></h4><h5></h5><h6></h6></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(4);
      expect(errors.every(e => e.type === 'heading-empty')).toBe(true);
    });
  });

  describe('Whitespace-only headings', () => {
    it('should flag headings with only whitespace', () => {
      const html = '<html><body><h1>   </h1></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-empty');
    });

    it('should flag headings with newline whitespace', () => {
      const html = '<html><body><h1>\n\n</h1></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-empty');
    });

    it('should flag headings with tabs and spaces', () => {
      const html = '<html><body><h1>\t  \t</h1></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('heading-empty');
    });
  });

  describe('Valid headings', () => {
    it('should pass for headings with content', () => {
      const html = '<html><body><h1>Title</h1><h2>Subtitle</h2></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should pass for headings with nested elements', () => {
      const html = '<html><body><h1><span>Title</span></h1></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });

    it('should pass for HTML without headings', () => {
      const html = '<html><body><p>No headings</p></body></html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(0);
    });
  });

  describe('Line numbers', () => {
    it('should report correct line numbers', () => {
      const html = '<html>\n<body>\n<h1></h1>\n</body>\n</html>';
      const errors = headingEmpty(html, 'test.html', defaultConfig);
      expect(errors.length).toBe(1);
      expect(errors[0].line).toBe(3);
    });
  });
});
