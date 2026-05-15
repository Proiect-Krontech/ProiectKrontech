describe('API Backend Tests', () => {
  const API = 'http://localhost:3000';
  const TEST_CODE = 'SP-JS33J2';

  it('3_test1 - should return OK from health endpoint', () => {
    cy.request(`${API}/api/health`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq('ok');
    });
  });

  it('3_test2 - should return timestamp in health response', () => {
    cy.request(`${API}/api/health`).then((res) => {
      expect(res.body.timestamp).to.exist;
    });
  });

  it('3_test3 - should validate a valid activation code', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: TEST_CODE },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.eq(true);
      expect(res.body.code).to.eq(TEST_CODE);
    });
  });

  it('3_test4 - should return pillow size on validate', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: TEST_CODE },
    }).then((res) => {
      expect(res.body.pillowSize).to.be.oneOf(['S', 'M', 'L', 'XL']);
    });
  });

  it('3_test5 - should reject invalid activation code', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: 'XX-FAKE1' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.success).to.eq(false);
    });
  });

  it('3_test6 - should reject empty code', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: { code: '' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404]);
      expect(res.body.success).to.eq(false);
    });
  });

  it('3_test7 - should reject request without code field', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/validate`,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.eq(false);
    });
  });

  it('3_test8 - should return status for a code', () => {
    cy.request(`${API}/api/status/${TEST_CODE}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('online');
      expect(res.body).to.have.property('posture');
    });
  });

  it('3_test9 - should return sensor fields in status', () => {
    cy.request(`${API}/api/status/${TEST_CODE}`).then((res) => {
      expect(res.body).to.have.property('F');
      expect(res.body).to.have.property('S');
      expect(res.body).to.have.property('L');
      expect(res.body).to.have.property('R');
    });
  });

  it('3_test10 - should return weight in status', () => {
    cy.request(`${API}/api/status/${TEST_CODE}`).then((res) => {
      expect(res.body).to.have.property('kg');
      expect(res.body).to.have.property('weight_ref');
    });
  });

  it('3_test11 - should return history array in status', () => {
    cy.request(`${API}/api/status/${TEST_CODE}`).then((res) => {
      expect(res.body.history).to.be.an('array');
    });
  });

  it('3_test12 - should accept valid buzzer_on command', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'buzzer_on' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.ok).to.eq(true);
    });
  });

  it('3_test13 - should accept buzzer_off command', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'buzzer_off' },
    }).then((res) => {
      expect(res.body.ok).to.eq(true);
      expect(res.body.queued.cmd).to.eq('buzzer_off');
    });
  });

  it('3_test14 - should accept calibrate command', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'calibrate' },
    }).then((res) => {
      expect(res.body.ok).to.eq(true);
    });
  });

  it('3_test15 - should accept set_weight with valid value', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'set_weight', value: 70 },
    }).then((res) => {
      expect(res.body.ok).to.eq(true);
      expect(res.body.queued.value).to.eq(70);
    });
  });

  it('3_test16 - should reject set_weight with invalid value', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'set_weight', value: 999 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('3_test17 - should reject set_weight below 5kg', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'set_weight', value: 2 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('3_test18 - should reject unknown command', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'hack_system' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('3_test19 - should accept reset_calibration command', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/cmd/${TEST_CODE}`,
      body: { cmd: 'reset_calibration' },
    }).then((res) => {
      expect(res.body.ok).to.eq(true);
    });
  });

  it('3_test20 - should return empty from command poll', () => {
    cy.request(`${API}/api/command?code=${TEST_CODE}`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('3_test21 - should return dashboard data for valid code', () => {
    cy.request(`${API}/api/dashboard/${TEST_CODE}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.eq(true);
      expect(res.body.data).to.exist;
    });
  });

  it('3_test22 - should return all dashboard sections', () => {
    cy.request(`${API}/api/dashboard/${TEST_CODE}`).then((res) => {
      const data = res.body.data;
      expect(data).to.have.property('dailyChart');
      expect(data).to.have.property('timeDistribution');
      expect(data).to.have.property('dailyScore');
      expect(data).to.have.property('quickStats');
      expect(data).to.have.property('weeklyHistory');
    });
  });

  it('3_test23 - should return 404 for invalid dashboard code', () => {
    cy.request({
      url: `${API}/api/dashboard/XX-FAKE1`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('3_test24 - should accept sensor data POST', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=${TEST_CODE}`,
      body: {
        posture: 'good',
        kg: 72.5,
        F: 25, S: 25, L: 25, R: 25,
        buzzer: false,
        calibrated: true,
        weight_ref: 72.0,
        state_duration: 60,
        confidence: 0.9,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('3_test25 - should reject generate with invalid size', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/generate`,
      body: { pillowSize: 'XXL' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.eq(false);
    });
  });
});
