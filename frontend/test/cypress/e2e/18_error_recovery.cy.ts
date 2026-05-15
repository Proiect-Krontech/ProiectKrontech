describe('Error Recovery - Server Down & Back Up', () => {

  it('18_test1 - should recover after server error on validate', () => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 500,
      body: { success: false, message: 'Server error' },
    }).as('failValidate');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@failValidate');
    cy.get('.connect-card__error').should('be.visible');

    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: 'SP-JS33J2', pillowSize: 'M' },
    }).as('successValidate');

    cy.intercept('GET', '/api/status/SP-JS33J2', {
      statusCode: 200,
      body: {
        online: true, lastSeen: Date.now(), posture: 'good',
        kg: 70, F: 25, S: 25, L: 25, R: 25,
        buzzer: false, calibrated: true, calibratedOnce: true,
        weight_ref: 70, state_duration: 60, confidence: 0.9,
        hasPendingCmd: false, pendingCmd: null, history: [],
      },
    });

    cy.get('#activation-code').clear().type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@successValidate');
    cy.get('.dashboard', { timeout: 5000 }).should('be.visible');
  });

  it('18_test2 - should recover after network failure', () => {
    cy.intercept('POST', '/api/codes/validate', {
      forceNetworkError: true,
    }).as('networkFail');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');

    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: 'SP-JS33J2', pillowSize: 'M' },
    }).as('restored');

    cy.intercept('GET', '/api/status/SP-JS33J2', {
      statusCode: 200,
      body: {
        online: true, lastSeen: Date.now(), posture: 'good',
        kg: 70, F: 25, S: 25, L: 25, R: 25,
        buzzer: false, calibrated: true, calibratedOnce: true,
        weight_ref: 70, state_duration: 60, confidence: 0.9,
        hasPendingCmd: false, pendingCmd: null, history: [],
      },
    });

    cy.get('#activation-code').clear().type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@restored');
    cy.get('.dashboard', { timeout: 5000 }).should('be.visible');
  });

  it('18_test3 - should keep UI interactive after validation error', () => {
    cy.visit('/dashboard');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');

    cy.get('#activation-code').should('not.be.disabled');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('#activation-code').should('have.value', 'SP-JS33J2');

    cy.get('.connect-card__button').should('not.be.disabled');
  });

  it('18_test4 - should handle multiple failed attempts', () => {
    cy.visit('/dashboard');

    cy.get('#activation-code').type('WRONG1');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');

    cy.get('#activation-code').clear().type('WRONG2');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');

    cy.get('#activation-code').clear().type('WRONG3');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');

    cy.get('#activation-code').should('not.be.disabled');
    cy.get('.connect-card__button').should('not.be.disabled');
  });
});

describe('Error Recovery - Cart After Errors', () => {

  it('18_test5 - should keep cart items after failed order', () => {
    cy.intercept('POST', '/api/codes/generate', {
      statusCode: 500,
      body: { success: false },
    }).as('failOrder');

    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();

    cy.get('.cos__articol', { timeout: 5000 }).should('have.length', 1);
  });

  it('18_test6 - should allow retrying order after failure', () => {
    cy.intercept('POST', '/api/codes/generate', {
      statusCode: 500,
      body: { success: false },
    }).as('failOrder');

    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();

    cy.wait('@failOrder');

    cy.get('.cos__buton-comanda', { timeout: 5000 }).should('not.be.disabled');
  });

  it('18_test7 - should allow cart modifications after order error', () => {
    cy.intercept('POST', '/api/codes/generate', {
      statusCode: 500,
      body: { success: false },
    }).as('failOrder');

    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();
    cy.wait('@failOrder');

    cy.get('.cos__buton-cantitate', { timeout: 5000 }).last().click();
    cy.get('.cos__cantitate-valoare').should('contain', '2');
  });
});

describe('Error Recovery - Landing Page Resilience', () => {

  it('18_test8 - should render landing page without backend', () => {
    cy.intercept('/api/**', { forceNetworkError: true });

    cy.visit('/');
    cy.get('#hero').should('be.visible');
    cy.get('#functionalitati').should('exist');
    cy.get('#marimi').should('exist');
    cy.get('.footer').should('exist');
  });

  it('18_test9 - should allow adding to cart without backend', () => {
    cy.intercept('/api/**', { forceNetworkError: true });

    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');
  });

  it('18_test10 - should navigate without backend', () => {
    cy.intercept('/api/**', { forceNetworkError: true });

    cy.visit('/');
    cy.get('.navbar__buton-cta').click();
    cy.url().should('include', '/dashboard');
    cy.get('.connect-page').should('be.visible');
  });
});

describe('Error Recovery - Timeout Handling', () => {

  it('18_test11 - should handle slow server without crashing', () => {
    cy.intercept('POST', '/api/codes/validate', (req) => {
      req.reply({
        statusCode: 200,
        body: { success: true, code: 'SP-JS33J2', pillowSize: 'M' },
        delay: 3000,
      });
    }).as('slowServer');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();

    cy.get('.connect-card__button').should('be.disabled');

    cy.wait('@slowServer');
  });

  it('18_test12 - should re-enable button after failed request', () => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 500,
      body: { success: false },
    }).as('fail');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@fail');

    cy.get('.connect-card__button', { timeout: 5000 }).should('not.be.disabled');
  });
});
