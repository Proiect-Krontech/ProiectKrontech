describe('Navigation & Routing', () => {

  it('5_test1 - should load landing page on /', () => {
    cy.visit('/');
    cy.get('#hero').should('be.visible');
  });

  it('5_test2 - should load dashboard on /dashboard', () => {
    cy.visit('/dashboard');
    cy.get('.connect-page').should('be.visible');
  });

  it('5_test3 - should redirect unknown route to landing', () => {
    cy.visit('/some-random-page');
    cy.get('#hero').should('be.visible');
  });

  it('5_test4 - should redirect /xyz to landing', () => {
    cy.visit('/xyz');
    cy.url().should('not.include', '/xyz');
  });

  it('5_test5 - should navigate to dashboard from navbar', () => {
    cy.visit('/');
    cy.get('.navbar__buton-cta').click();
    cy.url().should('include', '/dashboard');
    cy.get('.connect-page').should('be.visible');
  });

  it('5_test6 - should go back to landing from dashboard', () => {
    cy.visit('/');
    cy.get('.navbar__buton-cta').click();
    cy.url().should('include', '/dashboard');
    cy.go('back');
    cy.get('#hero').should('be.visible');
  });

  it('5_test7 - should go forward after going back', () => {
    cy.visit('/');
    cy.get('.navbar__buton-cta').click();
    cy.url().should('include', '/dashboard');
    cy.go('back');
    cy.url().should('not.include', '/dashboard');
    cy.go('forward');
    cy.url().should('include', '/dashboard');
  });

  it('5_test8 - should scroll to features section via anchor', () => {
    cy.visit('/');
    cy.get('.navbar__link').contains('Functionalitati').click({ force: true });
    cy.get('#functionalitati').should('be.visible');
  });

  it('5_test9 - should scroll to how it works via anchor', () => {
    cy.visit('/');
    cy.get('.hero__buton--secundar').click();
    cy.get('#cum-functioneaza').should('be.visible');
  });

  it('5_test10 - should scroll to sizes section via CTA', () => {
    cy.visit('/');
    cy.get('.hero__buton--primar').click();
    cy.get('#marimi').should('be.visible');
  });

  it('5_test11 - should link from connect page to landing sizes', () => {
    cy.visit('/dashboard');
    cy.get('.connect-card__link').should('have.attr', 'href', '/#marimi');
  });

  it('5_test12 - should have correct title on landing', () => {
    cy.visit('/');
    cy.title().should('contain', 'Smart Pillow');
  });

  it('5_test13 - should have correct title on dashboard', () => {
    cy.visit('/dashboard');
    cy.title().should('contain', 'Dashboard');
  });

  it('5_test14 - should handle /unknown#hash gracefully', () => {
    cy.visit('/unknown#test');
    cy.get('#hero').should('be.visible');
  });

  it('5_test15 - should handle multiple rapid navigations', () => {
    cy.visit('/');
    cy.visit('/dashboard');
    cy.visit('/');
    cy.get('#hero').should('be.visible');
  });
});
