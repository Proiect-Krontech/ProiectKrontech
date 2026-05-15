describe('Full Order Flow E2E', () => {

  it('10_test1 - should complete full order to dashboard flow', () => {
    cy.visit('/');
    cy.get('#hero').should('be.visible');

    cy.get('#marimi').scrollIntoView();

    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__card--activ').should('have.length', 1);

    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');

    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length', 1);

    cy.get('.cos__rezumat-total').should('contain', 'RON');

    cy.get('.cos__buton-comanda').click();

    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');
    cy.get('.cos__confirmare-titlu').should('contain', 'succes');

    cy.get('.cos__cod-valoare').first().invoke('text').then((code) => {
      const activationCode = code.trim();
      expect(activationCode).to.match(/^SP-/);

      cy.visit('/dashboard');
      cy.get('.connect-page').should('be.visible');

      cy.get('#activation-code').type(activationCode);
      cy.get('.connect-card__button').click();

      cy.get('.dashboard', { timeout: 10000 }).should('be.visible');
      cy.get('.dashboard__title').should('be.visible');
      cy.get('.dashboard__code').should('contain', activationCode);
    });
  });

  it('10_test2 - should place order with multiple items', () => {
    cy.visit('/');

    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(0).click();
    cy.get('.marimi__buton-cos').click();

    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(1).click();
    cy.get('.marimi__buton-cos').click();

    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length', 2);

    cy.get('.cos__buton-comanda').click();

    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');
    cy.get('.cos__cod-card').should('have.length', 2);
  });

  it('10_test3 - should allow placing new order after first', () => {
    cy.visit('/');

    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();
    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');

    cy.get('.cos__buton-nou').click();
    cy.get('.cos__gol').should('be.visible');
  });

  it('10_test4 - should have dashboard link in order confirmation', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();
    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');
    cy.get('.cos__confirmare-link').should('have.attr', 'href', '/dashboard');
  });

  it('10_test5 - should navigate to dashboard from confirmation link', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();
    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');
    cy.get('.cos__confirmare-link').click();
    cy.url().should('include', '/dashboard');
  });

  it('10_test6 - should order with increased quantity', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();

    cy.get('.cos__buton-cantitate').last().click();
    cy.get('.cos__cantitate-valoare').should('contain', '2');

    cy.get('.cos__buton-comanda').click();
    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');
  });

  it('10_test7 - should generate codes with correct format', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-comanda').click();
    cy.get('.cos__confirmare', { timeout: 10000 }).should('be.visible');
    cy.get('.cos__cod-valoare').first().invoke('text').then((code) => {
      expect(code.trim()).to.match(/^SP-[A-Z0-9]{5,}$/);
    });
  });

  it('10_test8 - should disconnect and return to connect page', () => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: 'SP-JS33J2', pillowSize: 'M' },
    }).as('validate');

    cy.intercept('GET', '/api/status/SP-JS33J2', {
      statusCode: 200,
      body: {
        online: true, lastSeen: Date.now(), posture: 'good',
        kg: 70, F: 25, S: 25, L: 25, R: 25,
        buzzer: false, calibrated: true, calibratedOnce: true,
        weight_ref: 70, state_duration: 60, confidence: 0.9,
        hasPendingCmd: false, pendingCmd: null, history: [],
      },
    }).as('status');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@validate');

    cy.get('.dashboard__disconnect', { timeout: 5000 }).click();
    cy.get('.connect-page').should('be.visible');
  });
});
