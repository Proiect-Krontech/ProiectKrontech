describe('State Management - Cart Persistence', () => {

  it('17_test1 - should keep cart items after navigating to dashboard', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('contain', '1');

    cy.get('.navbar__buton-cta').click();
    cy.url().should('include', '/dashboard');

    cy.go('back');

    cy.get('.navbar__cos-badge').should('contain', '1');
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length', 1);
  });

  it('17_test2 - should sync badge with total item count', () => {
    cy.visit('/');

    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(0).click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('contain', '1');

    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(1).click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('contain', '2');
  });

  it('17_test3 - should update badge when quantity increases', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();

    cy.get('.cos__buton-cantitate').last().click();
    cy.get('.navbar__cos-badge').should('contain', '2');
  });

  it('17_test4 - should remove badge when cart is cleared', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');

    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-goleste').click();
    cy.get('.navbar__cos-badge').should('not.exist');
  });

  it('17_test5 - should remove badge when last item deleted', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-sterge').click();
    cy.get('.navbar__cos-badge').should('not.exist');
  });

  it('17_test6 - should calculate total price correctly', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();

    cy.get('.marimi__pret-valoare').first().invoke('text').then((priceText) => {
      const unitPrice = parseInt(priceText.trim());

      cy.get('.marimi__buton-cos').click();
      cy.get('#cos').scrollIntoView();

      cy.get('.cos__buton-cantitate').last().click();

      cy.get('.cos__rezumat-total').invoke('text').then((totalText) => {
        const total = parseInt(totalText.replace(/[^0-9]/g, ''));
        expect(total).to.eq(unitPrice * 2);
      });
    });
  });

  it('17_test7 - should update item line price on quantity change', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();

    cy.get('.cos__articol-pret').invoke('text').then((initialText) => {
      const initialPrice = parseInt(initialText.replace(/[^0-9]/g, ''));

      cy.get('.cos__buton-cantitate').last().click();

      cy.get('.cos__articol-pret').invoke('text').then((newText) => {
        const newPrice = parseInt(newText.replace(/[^0-9]/g, ''));
        expect(newPrice).to.eq(initialPrice * 2);
      });
    });
  });

  it('17_test8 - should show empty state when cart has no items', () => {
    cy.visit('/');
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__gol').should('be.visible');
    cy.get('.cos__continut').should('not.exist');
  });

  it('17_test9 - should show content state when cart has items', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__continut').should('be.visible');
    cy.get('.cos__gol').should('not.exist');
  });

  it('17_test10 - should have only one active size at a time', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(0).click();
    cy.get('.marimi__card--activ').should('have.length', 1);

    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(1).click();
    cy.get('.marimi__card--activ').should('have.length', 1);
  });

  it('17_test11 - should update summary when changing size', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(0).click();
    cy.get('.marimi__rezumat-eticheta').invoke('text').then((text1) => {
      cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(1).click();
      cy.get('.marimi__rezumat-eticheta').invoke('text').should('not.eq', text1);
    });
  });

  it('17_test12 - should increase quantity when adding same size again', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length', 1);
    cy.get('.cos__cantitate-valoare').invoke('text').then((text) => {
      expect(parseInt(text.trim())).to.be.greaterThan(1);
    });
  });
});

describe('State Management - Dashboard Connection', () => {

  it('17_test13 - should reset to connect page on disconnect', () => {
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
    });

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@validate');

    cy.get('.dashboard__disconnect', { timeout: 5000 }).click();
    cy.get('.connect-page').should('be.visible');
    cy.get('#activation-code').should('have.value', '');
  });

  it('17_test14 - should clear error when user types new code', () => {
    cy.visit('/dashboard');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');

    cy.get('#activation-code').type('SP-');
    cy.get('.connect-card__error').should('not.exist');
  });
});
