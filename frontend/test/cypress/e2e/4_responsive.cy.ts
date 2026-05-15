describe('Responsive - Mobile (375x667)', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.visit('/');
  });

  it('4_test1 - should show hamburger menu on mobile', () => {
    cy.get('.navbar__hamburger').should('be.visible');
  });

  it('4_test2 - should hide nav links by default on mobile', () => {
    cy.get('.navbar__linkuri').should('not.be.visible');
  });

  it('4_test3 - should open menu on hamburger click', () => {
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__linkuri--deschis').should('exist');
  });

  it('4_test4 - should close menu on second hamburger click', () => {
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__linkuri--deschis').should('exist');
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__linkuri--deschis').should('not.exist');
  });

  it('4_test5 - should close menu when a link is clicked', () => {
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__link').first().click();
    cy.get('.navbar__linkuri--deschis').should('not.exist');
  });

  it('4_test6 - should display logo on mobile', () => {
    cy.get('.navbar__logo').should('be.visible');
  });

  it('4_test7 - should display hero section on mobile', () => {
    cy.get('#hero').should('be.visible');
    cy.get('.hero__titlu').should('be.visible');
  });

  it('4_test8 - should display hero buttons on mobile', () => {
    cy.get('.hero__buton--primar').should('be.visible');
    cy.get('.hero__buton--secundar').should('be.visible');
  });

  it('4_test9 - should display feature cards on mobile', () => {
    cy.get('.features__card').first().scrollIntoView().should('be.visible');
  });

  it('4_test10 - should display size cards on mobile', () => {
    cy.get('.marimi__card').first().scrollIntoView().should('be.visible');
  });

  it('4_test11 - should display footer on mobile', () => {
    cy.get('.footer').scrollIntoView().should('be.visible');
  });

  it('4_test12 - should show cart icon on mobile', () => {
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__cos').should('be.visible');
  });

  it('4_test13 - should toggle aria-expanded on hamburger', () => {
    cy.get('.navbar__hamburger').should('have.attr', 'aria-expanded', 'false');
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__hamburger').should('have.attr', 'aria-expanded', 'true');
  });
});

describe('Responsive - Tablet (768x1024)', () => {
  beforeEach(() => {
    cy.viewport(768, 1024);
    cy.visit('/');
  });

  it('4_test14 - should display navbar on tablet', () => {
    cy.get('.navbar__logo').should('be.visible');
  });

  it('4_test15 - should display hero on tablet', () => {
    cy.get('#hero').should('be.visible');
  });

  it('4_test16 - should display features on tablet', () => {
    cy.get('#functionalitati').scrollIntoView().should('be.visible');
  });

  it('4_test17 - should display sizes on tablet', () => {
    cy.get('#marimi').scrollIntoView().should('be.visible');
  });
});

describe('Responsive - Desktop (1920x1080)', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit('/');
  });

  it('4_test18 - should show nav links on desktop', () => {
    cy.get('.navbar__linkuri').should('be.visible');
  });

  it('4_test19 - should hide hamburger on desktop', () => {
    cy.get('.navbar__hamburger').should('not.be.visible');
  });

  it('4_test20 - should display all sections on desktop', () => {
    cy.get('#hero').should('be.visible');
    cy.get('#functionalitati').scrollIntoView().should('be.visible');
    cy.get('#cum-functioneaza').scrollIntoView().should('be.visible');
    cy.get('#marimi').scrollIntoView().should('be.visible');
    cy.get('.footer').scrollIntoView().should('be.visible');
  });
});

describe('Responsive - Dashboard Mobile (375x667)', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.visit('/dashboard');
  });

  it('4_test21 - should display connect page on mobile', () => {
    cy.get('.connect-page').should('be.visible');
  });

  it('4_test22 - should display connect card on mobile', () => {
    cy.get('.connect-card').should('be.visible');
  });

  it('4_test23 - should allow typing in input on mobile', () => {
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('#activation-code').should('have.value', 'SP-JS33J2');
  });

  it('4_test24 - should have clickable button on mobile', () => {
    cy.get('.connect-card__button').should('be.visible').and('not.be.disabled');
  });
});
