describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('1_test1 - should display navbar with logo', () => {
    cy.get('.navbar__logo').should('be.visible');
    cy.get('.navbar__logo-text').should('contain', 'Smart Pillow');
  });

  it('1_test2 - should display navigation links', () => {
    cy.get('.navbar__link').should('have.length.greaterThan', 0);
  });

  it('1_test3 - should have dashboard button in navbar', () => {
    cy.get('.navbar__buton-cta').should('contain', 'Perna');
  });

  it('1_test4 - should display cart icon', () => {
    cy.get('.navbar__cos').should('be.visible');
  });

  it('1_test5 - should have hamburger menu button', () => {
    cy.get('.navbar__hamburger').should('exist');
  });

  it('1_test6 - should display hero section', () => {
    cy.get('#hero').should('be.visible');
  });

  it('1_test7 - should display hero title with accent', () => {
    cy.get('.hero__titlu').should('be.visible');
    cy.get('.hero__titlu-accent').should('contain', 'protejează');
  });

  it('1_test8 - should display hero badge', () => {
    cy.get('.hero__badge').should('be.visible');
  });

  it('1_test9 - should have two hero buttons', () => {
    cy.get('.hero__butoane .hero__buton').should('have.length', 2);
  });

  it('1_test10 - should link order button to sizes section', () => {
    cy.get('.hero__buton--primar').should('have.attr', 'href', '#marimi');
  });

  it('1_test11 - should link secondary button to how it works', () => {
    cy.get('.hero__buton--secundar').should('have.attr', 'href', '#cum-functioneaza');
  });

  it('1_test12 - should display 3 trust indicators', () => {
    cy.get('.hero__indicator').should('have.length', 3);
  });

  it('1_test13 - should display hero illustration', () => {
    cy.get('.hero__svg').should('be.visible');
  });

  it('1_test14 - should display features section', () => {
    cy.get('#functionalitati').should('exist');
  });

  it('1_test15 - should display features title', () => {
    cy.get('#functionalitati .titlu-sectiune').should('contain', 'De Ce Smart Pillow');
  });

  it('1_test16 - should display feature cards', () => {
    cy.get('.features__card').should('have.length.greaterThan', 0);
  });

  it('1_test17 - should have icon, title and description in each card', () => {
    cy.get('.features__card').first().within(() => {
      cy.get('.features__card-icon').should('exist');
      cy.get('.features__card-titlu').should('exist');
      cy.get('.features__card-descriere').should('exist');
    });
  });

  it('1_test18 - should display how it works section', () => {
    cy.get('#cum-functioneaza').should('exist');
  });

  it('1_test19 - should display how it works title', () => {
    cy.get('#cum-functioneaza .titlu-sectiune').should('contain', 'Cum Funcționează');
  });

  it('1_test20 - should display stepper steps', () => {
    cy.get('.stepper__pas').should('have.length.greaterThan', 0);
  });

  it('1_test21 - should have number, title and description in each step', () => {
    cy.get('.stepper__pas').first().within(() => {
      cy.get('.stepper__numar').should('exist');
      cy.get('.stepper__titlu').should('exist');
      cy.get('.stepper__descriere').should('exist');
    });
  });

  it('1_test22 - should display sizes section', () => {
    cy.get('#marimi').should('exist');
  });

  it('1_test23 - should display sizes title', () => {
    cy.get('#marimi .titlu-sectiune').should('contain', 'Alege Mărimea');
  });

  it('1_test24 - should display size cards', () => {
    cy.get('.marimi__card').should('have.length.greaterThan', 0);
  });

  it('1_test25 - should display price on size cards', () => {
    cy.get('.marimi__pret-valoare').first().should('exist');
    cy.get('.marimi__pret-moneda').first().should('contain', 'RON');
  });

  it('1_test26 - should select a size card on click', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__card--activ').should('have.length', 1);
  });

  it('1_test27 - should show summary after selecting a size', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__rezumat').should('be.visible');
    cy.get('.marimi__buton-cos').should('be.visible');
  });

  it('1_test28 - should add item to cart on button click', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('exist');
  });

  it('1_test29 - should show empty cart message when no items', () => {
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__gol').should('be.visible');
  });

  it('1_test30 - should display item in cart after adding', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol').should('have.length', 1);
  });

  it('1_test31 - should increase item quantity', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__cantitate-valoare').invoke('text').then((text) => {
      const initialQty = parseInt(text.trim());
      cy.get('.cos__buton-cantitate').last().click();
      cy.get('.cos__cantitate-valoare').invoke('text').should((newText) => {
        expect(parseInt(newText.trim())).to.eq(initialQty + 1);
      });
    });
  });

  it('1_test32 - should display total price', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__rezumat-total').should('contain', 'RON');
  });

  it('1_test33 - should show free delivery', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__livrare-gratuita').should('contain', 'Gratuita');
  });

  it('1_test34 - should clear cart on button click', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-goleste').click();
    cy.get('.cos__gol').should('be.visible');
  });

  it('1_test35 - should display delivery and warranty note', () => {
    cy.get('.marimi__nota').should('be.visible');
  });

  it('1_test36 - should display footer', () => {
    cy.get('.footer').should('exist');
  });

  it('1_test37 - should display footer logo', () => {
    cy.get('.footer__logo-text').should('contain', 'Smart Pillow');
  });

  it('1_test38 - should display navigation links in footer', () => {
    cy.get('.footer__coloana-titlu').should('have.length.greaterThan', 0);
  });

  it('1_test39 - should display contact email in footer', () => {
    cy.get('.footer__link[href*="mailto"]').should('exist');
  });

  it('1_test40 - should display contact phone in footer', () => {
    cy.get('.footer__link[href*="tel"]').should('exist');
  });

  it('1_test41 - should display copyright', () => {
    cy.get('.footer__copyright').should('contain', 'Smart Pillow');
  });

  it('1_test42 - should have footer separator line', () => {
    cy.get('.footer__separator').should('exist');
  });

  it('1_test43 - should show popular badge on M size', () => {
    cy.get('.marimi__badge--popular').should('contain', 'popular');
  });

  it('1_test44 - should have correct page title', () => {
    cy.title().should('contain', 'Smart Pillow');
  });

  it('1_test45 - should scroll to sizes section on CTA click', () => {
    cy.get('.hero__buton--primar').click();
    cy.get('#marimi').should('be.visible');
  });
});
