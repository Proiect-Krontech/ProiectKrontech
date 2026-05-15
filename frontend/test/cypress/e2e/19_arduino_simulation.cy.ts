
describe('Arduino Simulation - Sensor Data Flow', () => {
  const API = 'http://localhost:3000';
  const CODE = 'SP-JS33J2';

  it('19_test1 - should accept good posture from Arduino', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'good',
        kg: 72.5,
        F: 25.1, S: 24.9, L: 25.0, R: 25.0,
        buzzer: false,
        calibrated: true,
        weight_ref: 72.0,
        state_duration: 30,
        confidence: 0.95,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('19_test2 - should accept bad posture leaning forward', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'bad',
        kg: 72.5,
        F: 60.0, S: 10.0, L: 15.0, R: 15.0,
        buzzer: true,
        calibrated: true,
        weight_ref: 72.0,
        state_duration: 5,
        confidence: 0.88,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('19_test3 - should accept bad posture leaning left', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'bad',
        kg: 72.5,
        F: 20.0, S: 20.0, L: 50.0, R: 10.0,
        buzzer: true,
        calibrated: true,
        weight_ref: 72.0,
        state_duration: 3,
        confidence: 0.82,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('19_test4 - should accept empty seat data', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'empty',
        kg: 0.5,
        F: 0, S: 0, L: 0, R: 0,
        buzzer: false,
        calibrated: true,
        weight_ref: 72.0,
        state_duration: 0,
        confidence: 1.0,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('19_test5 - should reflect latest Arduino data in status', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'good',
        kg: 80.0,
        F: 26.0, S: 24.0, L: 25.0, R: 25.0,
        buzzer: false,
        calibrated: true,
        weight_ref: 80.0,
        state_duration: 60,
        confidence: 0.92,
      },
    });

    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.posture).to.eq('good');
      expect(res.body.kg).to.eq(80.0);
      expect(res.body.calibrated).to.eq(true);
    });
  });

  it('19_test6 - should handle rapid sequential readings', () => {
    for (let i = 0; i < 5; i++) {
      cy.request({
        method: 'POST',
        url: `${API}/api/data?code=${CODE}`,
        body: {
          posture: 'good',
          kg: 70 + i,
          F: 25, S: 25, L: 25, R: 25,
          calibrated: true,
        },
      });
    }
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.kg).to.eq(74);
    });
  });

  it('19_test7 - should accumulate history entries', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.history).to.be.an('array');
      expect(res.body.history.length).to.be.greaterThan(0);
    });
  });
});

describe('Arduino Simulation - Command Queue', () => {
  const API = 'http://localhost:3000';
  const CODE = 'SP-JS33J2';

  it('19_test8 - should queue command for Arduino to pick up', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${CODE}`,
      body: { cmd: 'buzzer_on' },
    }).then((res) => {
      expect(res.body.ok).to.eq(true);
      expect(res.body.queued.cmd).to.eq('buzzer_on');
    });

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(res.body.cmd).to.eq('buzzer_on');
    });
  });

  it('19_test9 - should clear command after Arduino picks it up', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${CODE}`,
      body: { cmd: 'buzzer_off' },
    });

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(res.body.cmd).to.eq('buzzer_off');
    });

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(res.body.cmd).to.not.exist;
    });
  });

  it('19_test10 - should queue set_weight with correct value', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${CODE}`,
      body: { cmd: 'set_weight', value: 85 },
    });

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(res.body.cmd).to.eq('set_weight');
      expect(res.body.value).to.eq(85);
    });
  });

  it('19_test11 - should deliver command in data POST response', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${CODE}`,
      body: { cmd: 'calibrate' },
    });

    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: { posture: 'good', kg: 70, F: 25, S: 25, L: 25, R: 25 },
    }).then((res) => {
      expect(res.body.cmd).to.eq('calibrate');
    });
  });

  it('19_test12 - should return empty when no pending command', () => {
    cy.request(`${API}/api/command?code=${CODE}`);

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(Object.keys(res.body).length).to.eq(0);
    });
  });
});

describe('Arduino Simulation - Calibration Flow', () => {
  const API = 'http://localhost:3000';
  const CODE = 'SP-JS33J2';

  it('19_test13 - should accept uncalibrated data', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'unknown',
        kg: 0,
        F: 0, S: 0, L: 0, R: 0,
        calibrated: false,
        weight_ref: 60.0,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('19_test14 - should transition from uncalibrated to calibrated', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${CODE}`,
      body: { cmd: 'calibrate' },
    });

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(res.body.cmd).to.eq('calibrate');
    });

    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'good',
        kg: 72.0,
        F: 25, S: 25, L: 25, R: 25,
        calibrated: true,
        weight_ref: 72.0,
        confidence: 0.95,
      },
    });

    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.calibrated).to.eq(true);
      expect(res.body.calibratedOnce).to.eq(true);
    });
  });

  it('19_test15 - should handle reset_calibration command', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${CODE}`,
      body: { cmd: 'reset_calibration' },
    }).then((res) => {
      expect(res.body.ok).to.eq(true);
    });

    cy.request(`${API}/api/command?code=${CODE}`).then((res) => {
      expect(res.body.cmd).to.eq('reset_calibration');
    });
  });
});

describe('Arduino Simulation - Dashboard Reacts to Sensor Data', () => {
  const API = 'http://localhost:3000';
  const CODE = 'SP-JS33J2';

  it('19_test16 - should show Arduino data on dashboard', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${CODE}`,
      body: {
        posture: 'good',
        kg: 75.0,
        F: 26, S: 24, L: 25, R: 25,
        calibrated: true,
        weight_ref: 75.0,
        state_duration: 45,
        confidence: 0.93,
      },
    });

    cy.intercept('GET', `/api/status/${CODE}`, {
      statusCode: 200,
      body: {
        online: true, lastSeen: Date.now(), posture: 'good',
        kg: 75.0, F: 26, S: 24, L: 25, R: 25,
        buzzer: false, calibrated: true, calibratedOnce: true,
        weight_ref: 75.0, state_duration: 45, confidence: 0.93,
        hasPendingCmd: false, pendingCmd: null, history: [],
      },
    });

    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: CODE, pillowSize: 'M' },
    }).as('validate');

    cy.visit('/dashboard');
    cy.get('#activation-code').type(CODE);
    cy.get('.connect-card__button').click();
    cy.wait('@validate');

    cy.get('.dashboard__weight-number', { timeout: 5000 }).should('contain', '75.0');
    cy.get('.dashboard__status').should('contain', 'ONLINE');
  });

  it('19_test17 - should show OFFLINE when Arduino stops sending', () => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: CODE, pillowSize: 'M' },
    }).as('validate');

    cy.intercept('GET', `/api/status/${CODE}`, {
      statusCode: 200,
      body: {
        online: false, lastSeen: Date.now() - 60000, posture: 'unknown',
        kg: 0, F: 0, S: 0, L: 0, R: 0,
        buzzer: false, calibrated: false, calibratedOnce: false,
        weight_ref: 60, state_duration: 0, confidence: 1,
        hasPendingCmd: false, pendingCmd: null, history: [],
      },
    });

    cy.visit('/dashboard');
    cy.get('#activation-code').type(CODE);
    cy.get('.connect-card__button').click();
    cy.wait('@validate');

    cy.get('.dashboard__status', { timeout: 5000 }).should('contain', 'OFFLINE');
  });

  it('19_test18 - should reflect posture change on dashboard', () => {
    cy.intercept('POST', '/api/codes/validate', {
      statusCode: 200,
      body: { success: true, code: CODE, pillowSize: 'M' },
    }).as('validate');

    cy.intercept('GET', `/api/status/${CODE}`, {
      statusCode: 200,
      body: {
        online: true, lastSeen: Date.now(), posture: 'bad',
        kg: 72, F: 55, S: 15, L: 20, R: 10,
        buzzer: true, calibrated: true, calibratedOnce: true,
        weight_ref: 72, state_duration: 10, confidence: 0.85,
        hasPendingCmd: false, pendingCmd: null, history: [],
      },
    });

    cy.visit('/dashboard');
    cy.get('#activation-code').type(CODE);
    cy.get('.connect-card__button').click();
    cy.wait('@validate');

    cy.get('.dashboard__posture-label', { timeout: 5000 }).should('be.visible');
  });
});
