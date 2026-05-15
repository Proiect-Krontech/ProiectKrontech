
describe('Cross-Browser - Landing Core', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('11_test1 - should render landing page', () => {
    cy.get('#hero').should('be.visible');
    cy.get('.navbar__logo').should('be.visible');
  });

  it('11_test2 - should apply CSS variables for theming', () => {
    cy.get('.hero__buton--primar').should('be.visible')
      .and('have.css', 'background-color')
      .and('not.eq', 'rgba(0, 0, 0, 0)');
  });

  it('11_test3 - should load fonts correctly', () => {
    cy.get('.hero__titlu').should('be.visible')
      .and('have.css', 'font-size')
      .then((fontSize) => {
        expect(parseFloat(fontSize)).to.be.greaterThan(0);
      });
  });

  it('11_test4 - should render hero grid layout', () => {
    cy.get('.hero__grid').should('be.visible')
      .and('have.css', 'display')
      .and('match', /flex|grid/);
  });

  it('11_test5 - should render SVGs correctly', () => {
    cy.get('.hero__svg').should('be.visible');
    cy.get('.navbar__logo-icon').should('be.visible');
  });

  it('11_test6 - should scroll smoothly to sections', () => {
    cy.get('.hero__buton--primar').click();
    cy.get('#marimi').should('be.visible');
  });

  it('11_test7 - should handle click events on size cards', () => {
    cy.get('#marimi').scrollIntoView();
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__card--activ').should('have.length', 1);
  });

  it('11_test8 - should apply hover styles on buttons', () => {
    cy.get('.hero__buton--primar').trigger('mouseover');
    cy.get('.hero__buton--primar').should('be.visible');
  });

  it('11_test9 - should have CSS transitions on navbar', () => {
    cy.window().scrollTo(0, 100);
    cy.get('.navbar--scrollat').should('exist');
  });

  it('11_test10 - should scale SVGs on window resize', () => {
    cy.viewport(1920, 1080);
    cy.get('.hero__svg').should('be.visible');
    cy.viewport(375, 667);
    cy.get('.hero__svg').should('be.visible');
  });
});

describe('Cross-Browser - Dashboard Core', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('11_test11 - should render dashboard connect page', () => {
    cy.get('.connect-page').should('be.visible');
    cy.get('.connect-card').should('be.visible');
  });

  it('11_test12 - should accept input in all browsers', () => {
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('#activation-code').should('have.value', 'SP-JS33J2');
  });

  it('11_test13 - should handle button click', () => {
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('11_test14 - should handle Enter key submission', () => {
    cy.get('#activation-code').type('XX-XXXXX{enter}');
    cy.get('.connect-card__error').should('be.visible');
  });

  it('11_test15 - should center connect card', () => {
    cy.get('.connect-page').should('have.css', 'display')
      .and('match', /flex|grid/);
  });
});

describe('Cross-Browser - Cart Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('11_test16 - should add item to cart', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');
  });

  it('11_test17 - should increment quantity', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-cantitate').last().click();
    cy.get('.cos__cantitate-valoare').should('contain', '2');
  });

  it('11_test18 - should clear cart', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-goleste').click();
    cy.get('.cos__gol').should('be.visible');
  });
});
