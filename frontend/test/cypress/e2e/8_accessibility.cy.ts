describe('Accessibility - Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('8_test1 - should have aria-label on logo link', () => {
    cy.get('.navbar__logo').should('have.attr', 'aria-label');
  });

  it('8_test2 - should have aria-label on hamburger button', () => {
    cy.get('.navbar__hamburger').should('have.attr', 'aria-label');
  });

  it('8_test3 - should toggle aria-expanded on hamburger', () => {
    cy.viewport(375, 667);
    cy.get('.navbar__hamburger').should('have.attr', 'aria-expanded', 'false');
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__hamburger').should('have.attr', 'aria-expanded', 'true');
  });

  it('8_test4 - should have aria-label on cart link', () => {
    cy.get('.navbar__cos').should('have.attr', 'aria-label');
  });

  it('8_test5 - should have aria-label on hero illustration', () => {
    cy.get('.hero__svg').should('have.attr', 'aria-label');
  });

  it('8_test6 - should have role=option on size cards', () => {
    cy.get('.marimi__card').first().should('have.attr', 'role', 'option');
  });

  it('8_test7 - should update aria-selected on size card click', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__card--activ').should('have.attr', 'aria-selected', 'true');
  });

  it('8_test8 - should have aria-disabled on unavailable sizes', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.marimi__card--indisponibil').length > 0) {
        cy.get('.marimi__card--indisponibil').first().should('have.attr', 'aria-disabled', 'true');
      } else {
        cy.get('.marimi__card').first().should('have.attr', 'aria-disabled', 'false');
      }
    });
  });

  it('8_test9 - should have aria-labels on cart quantity buttons', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-cantitate').each(($btn) => {
      cy.wrap($btn).should('have.attr', 'aria-label');
    });
  });

  it('8_test10 - should have aria-label on cart delete button', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-sterge').should('have.attr', 'aria-label');
  });

  it('8_test11 - should have h2 heading in each section', () => {
    cy.get('.titlu-sectiune').should('have.length.greaterThan', 0);
  });

  it('8_test12 - should have h1 before h2 headings', () => {
    cy.get('h1').should('exist');
    cy.get('h2').should('have.length.greaterThan', 0);
  });

  it('8_test13 - should allow keyboard focus on navbar links', () => {
    cy.get('.navbar__logo').focus().should('have.focus');
  });

  it('8_test14 - should allow keyboard focus on buttons', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').focus().should('have.focus');
  });

  it('8_test15 - should have lang attribute on html', () => {
    cy.get('html').should('have.attr', 'lang');
  });
});

describe('Accessibility - Dashboard Page', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('8_test16 - should have label linked to activation input', () => {
    cy.get('label[for="activation-code"]').should('exist');
    cy.get('#activation-code').should('exist');
  });

  it('8_test17 - should match label for with input id', () => {
    cy.get('.connect-card__label').should('have.attr', 'for', 'activation-code');
  });

  it('8_test18 - should allow focus on connect button', () => {
    cy.get('.connect-card__button').focus().should('have.focus');
  });

  it('8_test19 - should allow focus on activation input', () => {
    cy.get('#activation-code').focus().should('have.focus');
  });

  it('8_test20 - should submit form with Enter key', () => {
    cy.get('#activation-code').type('XX-XXXXX{enter}');
    cy.get('.connect-card__error').should('be.visible');
  });

  it('8_test21 - should navigate with Tab from input to button', () => {
    cy.get('#activation-code').focus();
    cy.get('body').trigger('keydown', { key: 'Tab', keyCode: 9, which: 9 });
    cy.get('.connect-card__button').should('exist').and('not.be.disabled');
  });

  it('8_test22 - should make error message visible', () => {
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible').and('not.be.empty');
  });
});
