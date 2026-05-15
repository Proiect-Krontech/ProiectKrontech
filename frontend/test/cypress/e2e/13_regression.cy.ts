
describe('Regression - Landing Smoke', () => {

  it('13_test1 - should load landing without errors', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      },
    });
    cy.get('#hero').should('be.visible');
    cy.get('@consoleError').should('not.have.been.called');
  });

  it('13_test2 - should render all landing sections', () => {
    cy.visit('/');
    cy.get('#hero').should('exist');
    cy.get('#functionalitati').should('exist');
    cy.get('#cum-functioneaza').should('exist');
    cy.get('#marimi').should('exist');
    cy.get('#cos').should('exist');
    cy.get('.footer').should('exist');
  });

  it('13_test3 - should have working navbar', () => {
    cy.visit('/');
    cy.get('.navbar__logo').should('be.visible');
    cy.get('.navbar__buton-cta').should('exist');
  });

  it('13_test4 - should select size and show summary', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__rezumat').should('be.visible');
  });

  it('13_test5 - should add to cart and update badge', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');
  });

  it('13_test6 - should show item in cart', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length.greaterThan', 0);
  });
});

describe('Regression - Dashboard Smoke', () => {

  it('13_test7 - should load dashboard without errors', () => {
    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      },
    });
    cy.get('.connect-page').should('be.visible');
    cy.get('@consoleError').should('not.have.been.called');
  });

  it('13_test8 - should accept activation code input', () => {
    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('#activation-code').should('have.value', 'SP-JS33J2');
  });

  it('13_test9 - should show error for invalid code', () => {
    cy.visit('/dashboard');
    cy.get('#activation-code').type('XX-XXXXX');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('13_test10 - should catch empty submit', () => {
    cy.visit('/dashboard');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });
});

describe('Regression - API Smoke', () => {
  const API = 'http://localhost:3000';

  it('13_test11 - should return health OK', () => {
    cy.request(`${API}/api/health`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq('ok');
    });
  });

  it('13_test12 - should respond to validate endpoint', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: 'SP-JS33J2' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });

  it('13_test13 - should respond to status endpoint', () => {
    cy.request(`${API}/api/status/SP-JS33J2`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('13_test14 - should respond to dashboard endpoint', () => {
    cy.request({
      url: `${API}/api/dashboard/SP-JS33J2`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });

  it('13_test15 - should respond to cmd endpoint', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/SP-JS33J2`,
      body: { cmd: 'buzzer_on' },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
});

describe('Regression - Routing Smoke', () => {

  it('13_test16 - should serve landing on /', () => {
    cy.visit('/');
    cy.url().should('include', '/');
  });

  it('13_test17 - should serve dashboard on /dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('13_test18 - should redirect unknown routes', () => {
    cy.visit('/nonexistent-page');
    cy.get('#hero').should('be.visible');
  });

  it('13_test19 - should navigate landing to dashboard', () => {
    cy.visit('/');
    cy.get('.navbar__buton-cta').click();
    cy.url().should('include', '/dashboard');
  });

  it('13_test20 - should go back from dashboard to landing', () => {
    cy.visit('/');
    cy.get('.navbar__buton-cta').click();
    cy.go('back');
    cy.get('#hero').should('be.visible');
  });
});
