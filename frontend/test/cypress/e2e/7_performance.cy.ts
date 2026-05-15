describe('Performance - Page Load', () => {

  it('7_test1 - should load landing page under 3 seconds', () => {
    const start = Date.now();
    cy.visit('/');
    cy.get('#hero').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('7_test2 - should load dashboard page under 3 seconds', () => {
    const start = Date.now();
    cy.visit('/dashboard');
    cy.get('.connect-page').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('7_test3 - should have no console errors on landing', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      },
    });
    cy.get('#hero').should('be.visible');
    cy.get('@consoleError').should('not.have.been.called');
  });

  it('7_test4 - should have no console errors on dashboard', () => {
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      },
    });
    cy.get('.connect-page').should('be.visible');
    cy.get('@consoleError').should('not.have.been.called');
  });

  it('7_test5 - should render all SVGs on landing', () => {
    cy.visit('/');
    cy.get('svg').should('have.length.greaterThan', 0);
    cy.get('svg').each(($svg) => {
      cy.wrap($svg).should('be.visible');
    });
  });
});

describe('Performance - API Response Times', () => {
  const API = 'http://localhost:3000';

  it('7_test6 - should respond to health check under 500ms', () => {
    const start = Date.now();
    cy.request(`${API}/api/health`).then(() => {
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(500);
    });
  });

  it('7_test7 - should validate code under 1 second', () => {
    const start = Date.now();
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: 'SP-JS33J2' },
    }).then(() => {
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(1000);
    });
  });

  it('7_test8 - should return status under 500ms', () => {
    const start = Date.now();
    cy.request(`${API}/api/status/SP-JS33J2`).then(() => {
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(500);
    });
  });

  it('7_test9 - should return dashboard data under 2 seconds', () => {
    const start = Date.now();
    cy.request(`${API}/api/dashboard/SP-JS33J2`).then(() => {
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(2000);
    });
  });

  it('7_test10 - should process command under 500ms', () => {
    const start = Date.now();
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/SP-JS33J2`,
      body: { cmd: 'buzzer_on' },
    }).then(() => {
      const elapsed = Date.now() - start;
      expect(elapsed).to.be.lessThan(500);
    });
  });
});

describe('Performance - Rendering', () => {

  it('7_test11 - should scroll full page without freezing', () => {
    cy.visit('/');
    cy.scrollTo('bottom', { duration: 1000 });
    cy.get('.footer').should('be.visible');
    cy.scrollTo('top', { duration: 500 });
    cy.get('#hero').should('be.visible');
  });

  it('7_test12 - should handle rapid size card clicks', () => {
    cy.visit('/');
    cy.get('#marimi').scrollIntoView();
    cy.get('.marimi__card').not('.marimi__card--indisponibil').each(($card) => {
      cy.wrap($card).click();
    });
    cy.get('.marimi__card--activ').should('have.length', 1);
  });

  it('7_test13 - should handle adding same item multiple times', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');
  });
});
