describe('Security - API Headers', () => {
  const API = 'http://localhost:3000';

  it('9_test1 - should return JSON content-type on health', () => {
    cy.request(`${API}/api/health`).then((res) => {
      expect(res.headers['content-type']).to.include('application/json');
    });
  });

  it('9_test2 - should return JSON content-type on validate', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: 'SP-JS33J2' },
    }).then((res) => {
      expect(res.headers['content-type']).to.include('application/json');
    });
  });

  it('9_test3 - should return JSON content-type on status', () => {
    cy.request(`${API}/api/status/SP-JS33J2`).then((res) => {
      expect(res.headers['content-type']).to.include('application/json');
    });
  });

  it('9_test4 - should include CORS header', () => {
    cy.request({
      url: `${API}/api/health`,
      headers: { Origin: 'http://localhost:4200' },
    }).then((res) => {
      expect(res.headers['access-control-allow-origin']).to.exist;
    });
  });
});

describe('Security - Input Validation', () => {
  const API = 'http://localhost:3000';

  it('9_test5 - should not crash on SQL injection in validate', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: "'; DROP TABLE codes; --" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it('9_test6 - should not crash on NoSQL injection in validate', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: { $gt: '' } },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404, 500]);
    });
  });

  it('9_test7 - should not crash on XSS in validate', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: '<script>alert(1)</script>' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it('9_test8 - should not crash on HTML injection', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: '<img src=x onerror=alert(1)>' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it('9_test9 - should handle very long code string', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: 'A'.repeat(10000) },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404, 413]);
    });
  });

  it('9_test10 - should handle special chars in status URL', () => {
    cy.request({
      url: `${API}/api/status/<script>`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 400, 404]);
    });
  });

  it('9_test11 - should reject cmd with injection payload', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/SP-JS33J2`,
      body: { cmd: 'buzzer_on; rm -rf /' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('9_test12 - should only accept whitelisted commands', () => {
    const invalidCmds = ['exec', 'eval', 'delete', 'drop', 'shutdown'];
    invalidCmds.forEach((cmd) => {
      cy.request({
        method: 'POST',
        url: `${API}/api/cmd/SP-JS33J2`,
        body: { cmd },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
      });
    });
  });

  it('9_test13 - should handle null byte in code', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: 'SP-\x00TEST' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
    });
  });

  it('9_test14 - should handle empty body on cmd endpoint', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/SP-JS33J2`,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('9_test15 - should handle prototype pollution in data', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=SP-JS33J2`,
      body: { __proto__: { admin: true }, posture: 'good', kg: 70 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 400]);
    });
  });
});

describe('Security - Frontend', () => {

  it('9_test16 - should not expose API keys in page source', () => {
    cy.visit('/');
    cy.document().then((doc) => {
      const html = doc.documentElement.innerHTML;
      expect(html).to.not.match(/api[_-]?key/i);
      expect(html).to.not.match(/secret/i);
      expect(html).to.not.match(/password/i);
    });
  });

  it('9_test17 - should not expose secrets on dashboard page', () => {
    cy.visit('/dashboard');
    cy.document().then((doc) => {
      const html = doc.documentElement.innerHTML;
      expect(html).to.not.match(/api[_-]?key/i);
      expect(html).to.not.match(/mongo/i);
    });
  });

  it('9_test18 - should not render HTML from user input', () => {
    cy.visit('/dashboard');
    cy.get('#activation-code').type('<b>bold</b>');
    cy.get('.connect-card').then(($card) => {
      expect($card.find('b').length).to.eq(0);
    });
  });
});
