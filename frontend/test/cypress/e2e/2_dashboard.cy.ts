describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('2_test1 - should show connect page by default', () => {
    cy.get('.connect-page').should('be.visible');
  });

  it('2_test2 - should display connect logo SVG', () => {
    cy.get('.connect-card__logo svg').should('be.visible');
  });

  it('2_test3 - should display connect title', () => {
    cy.get('.connect-card__title').should('contain', 'Conecteaza Perna');
  });

  it('2_test4 - should display connect description', () => {
    cy.get('.connect-card__description').should('be.visible');
  });

  it('2_test5 - should have activation code input', () => {
    cy.get('#activation-code').should('be.visible');
  });

  it('2_test6 - should have placeholder on input', () => {
    cy.get('#activation-code').should('have.attr', 'placeholder', 'ex. SP-A3F8K2');
  });

  it('2_test7 - should limit input to 9 characters', () => {
    cy.get('#activation-code').should('have.attr', 'maxlength', '9');
  });

  it('2_test8 - should have connect button', () => {
    cy.get('.connect-card__button').should('contain', 'Conecteaza la Dashboard');
  });

  it('2_test9 - should display help text with order link', () => {
    cy.get('.connect-card__help').should('be.visible');
    cy.get('.connect-card__link').should('contain', 'Comanda o Smart Pillow');
  });

  it('2_test10 - should link to sizes section on landing', () => {
    cy.get('.connect-card__link').should('have.attr', 'href', '/#marimi');
  });

  it('2_test11 - should have label for input', () => {
    cy.get('.connect-card__label').should('contain', 'Cod de Activare');
  });

  it('2_test12 - should show error on empty submit', () => {
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('2_test13 - should show error for invalid code', () => {
    cy.get('#activation-code').type('XX-XXXXX');
    cy.get('.connect-card__button').click();
    cy.get('.connect-card__error').should('be.visible');
  });

  it('2_test14 - should accept text input', () => {
    cy.get('#activation-code').type('SP-JS33J2');
    cy.get('#activation-code').should('have.value', 'SP-JS33J2');
  });

  it('2_test15 - should have correct page title', () => {
    cy.title().should('contain', 'Dashboard');
  });

  it('2_test16 - should display connect card', () => {
    cy.get('.connect-card').should('be.visible');
  });

  it('2_test17 - should have connect button enabled', () => {
    cy.get('.connect-card__button').should('not.be.disabled');
  });

  it('2_test18 - should have input enabled by default', () => {
    cy.get('#activation-code').should('not.be.disabled');
  });

  it('2_test19 - should submit on Enter key press', () => {
    cy.get('#activation-code').type('XX-XXXXX{enter}');
    cy.get('.connect-card__error').should('be.visible');
  });

  it('2_test20 - should have autocomplete off on input', () => {
    cy.get('#activation-code').should('have.attr', 'autocomplete', 'off');
  });
});

describe('Dashboard - Connected State', () => {
  const TEST_CODE = 'SP-JS33J2';

  beforeEach(() => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: TEST_CODE, pillowSize: 'M', message: 'Code validated successfully.' },
    }).as('validateCode');

    cy.intercept('GET', `/api/status/${TEST_CODE}`, {
      statusCode: 200,
      body: {
        online: true,
        lastSeen: Date.now(),
        posture: 'good',
        kg: 75.5,
        F: 25, S: 25, L: 25, R: 25,
        buzzer: false,
        calibrated: true,
        calibratedOnce: true,
        weight_ref: 75.0,
        state_duration: 120,
        confidence: 0.95,
        hasPendingCmd: false,
        pendingCmd: null,
        history: [],
      },
    }).as('getStatus');

    cy.intercept('GET', `/api/dashboard/daily-score?code=${TEST_CODE}`, {
      statusCode: 200,
      body: { score: 85 },
    }).as('getDailyScore');

    cy.intercept('GET', `/api/dashboard/time-distribution?code=${TEST_CODE}`, {
      statusCode: 200,
      body: { correct: 60, attention: 25, wrong: 15 },
    }).as('getDistribution');

    cy.intercept('GET', `/api/dashboard/weekly?code=${TEST_CODE}`, {
      statusCode: 200,
      body: { days: [] },
    }).as('getWeekly');

    cy.intercept('GET', `/api/dashboard/quick-stats?code=${TEST_CODE}`, {
      statusCode: 200,
      body: { totalTime: '2h 30m', correctTime: '1h 45m', attentionTime: '30m', wrongTime: '15m' },
    }).as('getQuickStats');

    cy.visit('/dashboard');
    cy.get('#activation-code').type(TEST_CODE);
    cy.get('.connect-card__button').click();
    cy.wait('@validateCode');
  });

  it('2_test21 - should show dashboard header', () => {
    cy.get('.dashboard__title').should('be.visible');
    cy.get('.dashboard__title-brand').should('contain', 'Smart Pillow');
  });

  it('2_test22 - should display activation code', () => {
    cy.get('.dashboard__code').should('contain', 'SP-JS33J2');
  });

  it('2_test23 - should show online status', () => {
    cy.get('.dashboard__status').should('contain', 'ONLINE');
  });

  it('2_test24 - should have disconnect button', () => {
    cy.get('.dashboard__disconnect').should('contain', 'Deconecteaza');
  });

  it('2_test25 - should display posture card', () => {
    cy.get('.dashboard__card--posture').should('be.visible');
    cy.get('.dashboard__card--posture .dashboard__card-title').should('contain', 'Postura Curenta');
  });

  it('2_test26 - should display weight card', () => {
    cy.get('.dashboard__card--weight').should('be.visible');
    cy.get('.dashboard__card--weight .dashboard__card-title').should('contain', 'Greutate');
  });

  it('2_test27 - should display sensors card with 4 values', () => {
    cy.get('.dashboard__card--sensors').should('be.visible');
    cy.get('.dashboard__sensor').should('have.length', 4);
  });

  it('2_test28 - should display sensor labels FL FR BL BR', () => {
    cy.get('.dashboard__sensor-label').then(($labels) => {
      const labels = [...$labels].map((el) => el.textContent?.trim());
      expect(labels).to.include.members(['FL', 'FR', 'BL', 'BR']);
    });
  });

  it('2_test29 - should display balance card', () => {
    cy.get('.dashboard__card--balance').should('be.visible');
    cy.get('.dashboard__balance-bar').should('have.length', 2);
  });

  it('2_test30 - should display commands card with 4 buttons', () => {
    cy.get('.dashboard__card--commands').should('be.visible');
    cy.get('.dashboard__cmd-btn').should('have.length', 4);
  });

  it('2_test31 - should have buzzer off button', () => {
    cy.get('.dashboard__cmd-btn--warning').should('contain', 'buzzer');
  });

  it('2_test32 - should have calibration button', () => {
    cy.get('.dashboard__cmd-btn--success').should('contain', 'Calibrare');
  });

  it('2_test33 - should have reset calibration button', () => {
    cy.get('.dashboard__cmd-btn--danger').should('contain', 'Reset');
  });

  it('2_test34 - should display reference weight card', () => {
    cy.get('.dashboard__card--ref-weight').should('be.visible');
  });

  it('2_test35 - should have weight input with min/max', () => {
    cy.get('.dashboard__ref-weight-input')
      .should('have.attr', 'min', '5')
      .and('have.attr', 'max', '300');
  });

  it('2_test36 - should have weight submit button', () => {
    cy.get('.dashboard__ref-weight-btn').should('contain', 'Trimite');
  });

  it('2_test37 - should display history chart card', () => {
    cy.get('.dashboard__card--history').should('be.visible');
    cy.get('.dashboard__card--history canvas').should('exist');
  });

  it('2_test38 - should display daily score card', () => {
    cy.get('.dashboard__card--score').should('be.visible');
    cy.get('.dashboard__score-max').should('contain', '/100');
  });

  it('2_test39 - should display distribution chart card', () => {
    cy.get('.dashboard__card--distribution').should('be.visible');
    cy.get('.dashboard__card--distribution canvas').should('exist');
  });

  it('2_test40 - should display quick stats card with 4 stats', () => {
    cy.get('.dashboard__card--stats').should('be.visible');
    cy.get('.dashboard__stat').should('have.length', 4);
  });

  it('2_test41 - should display weekly chart card', () => {
    cy.get('.dashboard__card--weekly').should('be.visible');
    cy.get('.dashboard__card--weekly canvas').should('exist');
  });

  it('2_test42 - should return to connect page on disconnect', () => {
    cy.get('.dashboard__disconnect').click();
    cy.get('.connect-page').should('be.visible');
  });
});
