describe('Edge Cases - Connect Page', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('6_test1 - should show error on empty code submit', () => {
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test2 - should reject spaces-only input', () => {
    cy.get('#activation-code').type('         ');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test3 - should handle special characters in code', () => {
    cy.get('#activation-code').type('!@#$%^&*(');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test4 - should reject single character code', () => {
    cy.get('#activation-code').type('A');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test5 - should not accept more than 9 characters', () => {
    cy.get('#activation-code').type('SP-ABCDEFGHIJK');
    cy.get('#activation-code').invoke('val').then((val) => {
      expect((val as string).length).to.be.at.most(9);
    });
  });

  it('6_test6 - should handle rapid double click on submit', () => {
    cy.get('#activation-code').type('XX-XXXXX');
    cy.get('.connect-card__button').dblclick();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test7 - should handle SQL injection in code input', () => {
    cy.get('#activation-code').type("' OR 1=1");
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test8 - should handle XSS in code input', () => {
    cy.get('#activation-code').type('<script>');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });
});

describe('Edge Cases - Cart', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('6_test9 - should show empty cart by default', () => {
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__gol').should('be.visible');
    cy.get('.cos__gol-icon').should('exist');
  });

  it('6_test10 - should return to empty state after removing item', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-sterge').click();
    cy.get('.cos__gol').should('be.visible');
  });

  it('6_test11 - should remove item when quantity reaches 0', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-cantitate').first().click();
    cy.get('.cos__gol').should('be.visible');
  });

  it('6_test12 - should allow adding multiple sizes', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(0).click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(1).click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length', 2);
  });

  it('6_test13 - should clear all items from cart', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(0).click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.marimi__card').not('.marimi__card--indisponibil').eq(1).click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-goleste').click();
    cy.get('.cos__gol').should('be.visible');
  });

  it('6_test14 - should not allow adding unavailable size', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.marimi__card--indisponibil').length > 0) {
        cy.get('.marimi__card--indisponibil').first().click();
        cy.get('.marimi__buton-cos').should('be.disabled');
      } else {
        cy.get('.marimi__badge--indisponibil').should('not.exist');
      }
    });
  });

  it('6_test15 - should update cart badge count', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('contain', '1');
  });

  it('6_test16 - should hide cart badge when cart is empty', () => {
    cy.get('.navbar__cos-badge').should('not.exist');
  });
});

describe('Edge Cases - Server Errors', () => {

  it('6_test17 - should handle server error on code validation', () => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 500,
      body: { success: false, message: 'Server error' },
    }).as('serverError');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.wait('@serverError');
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test18 - should handle network timeout on validation', () => {
    cy.intercept('POST', '/api/codes/validate', {
      forceNetworkError: true,
    }).as('networkError');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('6_test19 - should show loading state during slow response', () => {
    cy.intercept('POST', '/api/codes/validate', (req) => {
      req.reply({
        statusCode: 200,
        body: { success: true, code: 'SP-JS33J2', pillowSize: 'M' },
        delay: 2000,
      });
    }).as('slowValidate');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__spinner').should('exist');
  });

  it('6_test20 - should disable button during loading', () => {
    cy.intercept('POST', '/api/codes/validate', (req) => {
      req.reply({
        statusCode: 200,
        body: { success: true, code: 'SP-JS33J2', pillowSize: 'M' },
        delay: 2000,
      });
    }).as('slowValidate');

    cy.visit('/dashboard');
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__button').should('be.disabled');
  });
});

describe('Edge Cases - API Validation', () => {
  const API = 'http://localhost:3000';

  it('6_test21 - should reject NaN weight value', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/SP-JS33J2`,
      body: { cmd: 'set_weight', value: 'abc' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('6_test22 - should reject negative weight value', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/SP-JS33J2`,
      body: { cmd: 'set_weight', value: -10 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('6_test23 - should reject generate without pillowSize', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/generate`,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('6_test24 - should accept data with empty posture', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=SP-JS33J2`,
      body: { posture: 'empty', kg: 0, F: 0, S: 0, L: 0, R: 0 },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('6_test25 - should return default status for unknown code', () => {
    cy.request({
      url: `${API}/api/status/XX-NONE1`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.online).to.be.oneOf([false, null, undefined]);
    });
  });
});
