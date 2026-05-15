describe('i18n - Romanian Text Display', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('16_test1 - should display diacritics in hero title', () => {
    cy.get('.hero__titlu-accent').invoke('text').then((text) => {
      expect(text).to.include('protejează');
    });
  });

  it('16_test2 - should display diacritics in hero subtitle', () => {
    cy.get('.hero__subtitlu').invoke('text').then((text) => {
      expect(text).to.include('monitorizează');
      expect(text).to.include('poziția');
      expect(text).to.include('postură');
    });
  });

  it('16_test3 - should display Romanian nav labels', () => {
    cy.get('.navbar__link').should('have.length.greaterThan', 0);
    cy.get('.navbar__buton-cta').invoke('text').then((text) => {
      expect(text.trim()).to.include('Perna');
    });
  });

  it('16_test4 - should display features section title correctly', () => {
    cy.get('#functionalitati .titlu-sectiune').invoke('text').then((text) => {
      expect(text).to.include('De Ce Smart Pillow');
    });
  });

  it('16_test5 - should display how it works title with diacritics', () => {
    cy.get('#cum-functioneaza .titlu-sectiune').invoke('text').then((text) => {
      expect(text).to.include('Funcționează');
    });
  });

  it('16_test6 - should display sizes title with diacritics', () => {
    cy.get('#marimi .titlu-sectiune').invoke('text').then((text) => {
      expect(text).to.include('Mărimea');
    });
  });

  it('16_test7 - should display delivery note with diacritics', () => {
    cy.get('.marimi__nota').invoke('text').then((text) => {
      expect(text).to.include('lucrătoare');
      expect(text).to.include('Garanție');
    });
  });

  it('16_test8 - should display city name with diacritics', () => {
    cy.get('.footer__adresa').invoke('text').then((text) => {
      expect(text).to.include('Brașov');
    });
  });

  it('16_test9 - should display copyright with correct year', () => {
    const currentYear = new Date().getFullYear().toString();
    cy.get('.footer__copyright').invoke('text').then((text) => {
      expect(text).to.include(currentYear);
      expect(text).to.include('drepturile rezervate');
    });
  });

  it('16_test10 - should display valid email format', () => {
    cy.get('.footer__link[href*="mailto"]').invoke('text').then((text) => {
      expect(text.trim()).to.match(/.+@.+\..+/);
    });
  });

  it('16_test11 - should display phone in Romanian format', () => {
    cy.get('.footer__link[href*="tel"]').invoke('text').then((text) => {
      expect(text.trim()).to.include('+40');
    });
  });
});

describe('i18n - Price & Currency Format', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('16_test12 - should display RON currency on size cards', () => {
    cy.get('.marimi__pret-moneda').each(($el) => {
      expect($el.text().trim()).to.eq('RON');
    });
  });

  it('16_test13 - should display numeric price values', () => {
    cy.get('.marimi__pret-valoare').each(($el) => {
      const price = parseFloat($el.text().trim());
      expect(price).to.be.a('number');
      expect(price).to.be.greaterThan(0);
    });
  });

  it('16_test14 - should display cart total in RON', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__rezumat-total').invoke('text').then((text) => {
      expect(text).to.include('RON');
    });
  });

  it('16_test15 - should display item price with RON in cart', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__articol-pret').invoke('text').then((text) => {
      expect(text).to.include('RON');
    });
  });

  it('16_test16 - should display free delivery in Romanian', () => {
    cy.get('.marimi__card').not('.marimi__card--indisponibil').first().click();
    cy.get('.marimi__buton-cos').click();
    cy.get('#cos').scrollIntoView();
    cy.get('.cos__livrare-gratuita').invoke('text').then((text) => {
      expect(text.trim()).to.eq('Gratuită');
    });
  });
});

describe('i18n - Dashboard Romanian Text', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('16_test17 - should display connect title in Romanian', () => {
    cy.get('.connect-card__title').invoke('text').then((text) => {
      expect(text).to.include('Conecteaza Perna');
    });
  });

  it('16_test18 - should display connect description in Romanian', () => {
    cy.get('.connect-card__description').invoke('text').then((text) => {
      expect(text).to.include('codul de activare');
    });
  });

  it('16_test19 - should display label in Romanian', () => {
    cy.get('.connect-card__label').invoke('text').then((text) => {
      expect(text).to.include('Cod de Activare');
    });
  });

  it('16_test20 - should display button text in Romanian', () => {
    cy.get('.connect-card__button').invoke('text').then((text) => {
      expect(text.trim()).to.include('Conecteaza la Dashboard');
    });
  });

  it('16_test21 - should display help text in Romanian', () => {
    cy.get('.connect-card__help').invoke('text').then((text) => {
      expect(text).to.include('Nu ai un cod');
    });
  });

  it('16_test22 - should display error in Romanian', () => {
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').invoke('text').then((text) => {
      expect(text.trim().length).to.be.greaterThan(0);
    });
  });
});
