describe('UI Bugs - No Horizontal Scroll', () => {

  it('15_test1 - should have no horizontal scroll on landing desktop', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth);
    });
  });

  it('15_test2 - should have no horizontal scroll on landing mobile', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth);
    });
  });

  it('15_test3 - should have no horizontal scroll on dashboard', () => {
    cy.viewport(1920, 1080);
    cy.visit('/dashboard');
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth);
    });
  });

  it('15_test4 - should have no horizontal scroll on dashboard mobile', () => {
    cy.viewport(375, 667);
    cy.visit('/dashboard');
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth);
    });
  });
});

describe('UI Bugs - Text Overflow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('15_test5 - should fully display hero title', () => {
    cy.get('.hero__titlu').should('be.visible').then(($el) => {
      expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 1);
    });
  });

  it('15_test6 - should not truncate feature card titles', () => {
    cy.get('.features__card-titlu').each(($el) => {
      cy.wrap($el).should('be.visible');
      expect($el[0].scrollHeight).to.be.at.most($el[0].clientHeight + 5);
    });
  });

  it('15_test7 - should fully show navbar logo text', () => {
    cy.get('.navbar__logo-text').should('be.visible').then(($el) => {
      expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 1);
    });
  });

  it('15_test8 - should not overflow footer text', () => {
    cy.get('.footer__descriere').scrollIntoView().should('be.visible');
  });

  it('15_test9 - should fully display price on size cards', () => {
    cy.get('.marimi__pret-valoare').each(($el) => {
      cy.wrap($el).scrollIntoView().should('be.visible');
    });
  });
});

describe('UI Bugs - Clickable Elements', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('15_test10 - should click hero primary button', () => {
    cy.get('.hero__buton--primar').should('be.visible').click();
  });

  it('15_test11 - should click hero secondary button', () => {
    cy.get('.hero__buton--secundar').should('be.visible').click();
  });

  it('15_test12 - should click size card', () => {
    cy.get('#marimi').scrollIntoView();
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().should('be.visible').click();
    cy.get('.marimi__card--activ').should('exist');
  });

  it('15_test13 - should click add to cart button', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').should('be.visible').click();
    cy.get('.navbar__cos-badge').should('exist');
  });

  it('15_test14 - should click quantity buttons', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-cantitate').last().should('be.visible').click();
  });

  it('15_test15 - should click delete button in cart', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__buton-sterge').should('be.visible').click();
  });

  it('15_test16 - should click connect button on dashboard', () => {
    cy.visit('/dashboard');
    cy.get('.connect-card__button').should('be.visible').click();
  });

  it('15_test17 - should click navbar CTA button', () => {
    cy.get('.navbar__buton-cta').should('be.visible').click();
    cy.url().should('include', '/dashboard');
  });
});

describe('UI Bugs - Z-Index & Overlapping', () => {

  it('15_test18 - should keep navbar above content on scroll', () => {
    cy.visit('/');
    cy.scrollTo(0, 500);
    cy.get('.navbar').should('be.visible');
    cy.get('.navbar').then(($nav) => {
      const zIndex = parseInt(window.getComputedStyle($nav[0]).zIndex);
      if (!isNaN(zIndex)) {
        expect(zIndex).to.be.greaterThan(0);
      }
    });
  });

  it('15_test19 - should show mobile menu above page content', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    cy.get('.navbar__hamburger').click();
    cy.get('.navbar__linkuri--deschis').should('be.visible');
  });

  it('15_test20 - should show cart badge visibly', () => {
    cy.visit('/');
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('.navbar__cos-badge').should('be.visible');
  });
});

describe('UI Bugs - Layout Consistency', () => {

  it('15_test21 - should render feature cards at consistent height', () => {
    cy.visit('/');
    cy.get('#functionalitati').scrollIntoView();
    cy.get('.features__card').then(($cards) => {
      if ($cards.length > 1) {
        const heights = [...$cards].map((c) => c.getBoundingClientRect().height);
        const maxDiff = Math.max(...heights) - Math.min(...heights);
        expect(maxDiff).to.be.lessThan(50); // allow small variance
      }
    });
  });

  it('15_test22 - should align size cards in grid', () => {
    cy.visit('/');
    cy.get('#marimi').scrollIntoView();
    cy.get('.marimi__grid').should('have.css', 'display').and('match', /flex|grid/);
  });

  it('15_test23 - should align stepper steps', () => {
    cy.visit('/');
    cy.get('#cum-functioneaza').scrollIntoView();
    cy.get('.stepper__pas').should('have.length.greaterThan', 0);
  });

  it('15_test24 - should render footer columns', () => {
    cy.visit('/');
    cy.get('.footer').scrollIntoView();
    cy.get('.footer__grid').should('be.visible');
    cy.get('.footer__coloana').should('have.length.greaterThan', 0);
  });

  it('15_test25 - should center connect card vertically', () => {
    cy.visit('/dashboard');
    cy.get('.connect-page').then(($page) => {
      const display = window.getComputedStyle($page[0]).display;
      expect(display).to.match(/flex|grid/);
    });
  });
});
