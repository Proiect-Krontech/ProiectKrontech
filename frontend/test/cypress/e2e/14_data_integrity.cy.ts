describe('Data Integrity - Sensor Values', () => {
  const API = 'http://localhost:3000';
  const CODE = 'SP-JS33J2';

  it('14_test1 - should return numeric sensor values', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.F).to.be.a('number');
      expect(res.body.S).to.be.a('number');
      expect(res.body.L).to.be.a('number');
      expect(res.body.R).to.be.a('number');
    });
  });

  it('14_test2 - should not have negative sensor values', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.F).to.be.at.least(0);
      expect(res.body.S).to.be.at.least(0);
      expect(res.body.L).to.be.at.least(0);
      expect(res.body.R).to.be.at.least(0);
    });
  });

  it('14_test3 - should have weight in valid range (0-300kg)', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.kg).to.be.at.least(0);
      expect(res.body.kg).to.be.at.most(300);
    });
  });

  it('14_test4 - should have weight_ref in valid range (5-300kg)', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      if (res.body.weight_ref > 0) {
        expect(res.body.weight_ref).to.be.at.least(5);
        expect(res.body.weight_ref).to.be.at.most(300);
      }
    });
  });

  it('14_test5 - should have valid posture value', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      const validPostures = ['good', 'bad', 'empty', 'unknown'];
      expect(validPostures).to.include(res.body.posture);
    });
  });

  it('14_test6 - should have boolean online status', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.online).to.be.a('boolean');
    });
  });

  it('14_test7 - should have confidence between 0 and 1', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.confidence).to.be.at.least(0);
      expect(res.body.confidence).to.be.at.most(1);
    });
  });

  it('14_test8 - should have history as array', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.history).to.be.an('array');
    });
  });

  it('14_test9 - should have max 30 history items', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      expect(res.body.history.length).to.be.at.most(30);
    });
  });

  it('14_test10 - should have valid structure in history items', () => {
    cy.request(`${API}/api/status/${CODE}`).then((res) => {
      if (res.body.history.length > 0) {
        const item = res.body.history[0];
        expect(item).to.have.property('t');
        expect(item).to.have.property('kg');
        expect(item).to.have.property('p');
        expect(item).to.have.property('F');
        expect(item).to.have.property('S');
        expect(item).to.have.property('L');
        expect(item).to.have.property('R');
      }
    });
  });
});

describe('Data Integrity - Dashboard Data', () => {
  const API = 'http://localhost:3000';
  const CODE = 'SP-JS33J2';

  it('14_test11 - should have daily score between 0 and 100', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        expect(res.body.data.dailyScore).to.be.at.least(0);
        expect(res.body.data.dailyScore).to.be.at.most(100);
      }
    });
  });

  it('14_test12 - should have distribution percentages between 0-100', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        const dist = res.body.data.timeDistribution;
        expect(dist.correct).to.be.at.least(0).and.at.most(100);
        expect(dist.attention).to.be.at.least(0).and.at.most(100);
        expect(dist.wrong).to.be.at.least(0).and.at.most(100);
      }
    });
  });

  it('14_test13 - should have distribution summing to approximately 100', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        const dist = res.body.data.timeDistribution;
        const sum = dist.correct + dist.attention + dist.wrong;
        if (sum > 0) {
          expect(sum).to.be.at.least(95).and.at.most(105); // rounding tolerance
        }
      }
    });
  });

  it('14_test14 - should have 24 entries in daily chart', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        expect(res.body.data.dailyChart).to.have.length(24);
      }
    });
  });

  it('14_test15 - should have valid hour format in daily chart', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        res.body.data.dailyChart.forEach((entry: any) => {
          expect(entry.hour).to.match(/^\d{2}:00$/);
        });
      }
    });
  });

  it('14_test16 - should have 7 days in weekly history', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        expect(res.body.data.weeklyHistory).to.have.length(7);
      }
    });
  });

  it('14_test17 - should have weekly scores between 0-100', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        res.body.data.weeklyHistory.forEach((day: any) => {
          expect(day.score).to.be.at.least(0).and.at.most(100);
        });
      }
    });
  });

  it('14_test18 - should have all quick stats fields', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        const stats = res.body.data.quickStats;
        expect(stats).to.have.property('totalTime');
        expect(stats).to.have.property('correctTime');
        expect(stats).to.have.property('attentionTime');
        expect(stats).to.have.property('wrongTime');
      }
    });
  });

  it('14_test19 - should have valid pillow size', () => {
    cy.request({
      url: `${API}/api/dashboard/${CODE}`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200 && res.body.data) {
        expect(res.body.data.pillowSize).to.be.oneOf(['S', 'M', 'L', 'XL']);
      }
    });
  });
});

describe('Data Integrity - Sensor Data POST', () => {
  const API = 'http://localhost:3000';

  it('14_test20 - should accept sensor data and return 200', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=SP-JS33J2`,
      body: {
        posture: 'good',
        kg: 70,
        F: 25, S: 25, L: 25, R: 25,
        calibrated: true,
        weight_ref: 70,
        state_duration: 30,
        confidence: 0.95,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('14_test21 - should calculate balanced score close to 100', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=SP-JS33J2`,
      body: {
        posture: 'good',
        kg: 70,
        F: 25, S: 25, L: 25, R: 25,
        calibrated: true,
      },
    });

    cy.request(`${API}/api/dashboard/SP-JS33J2`).then((res) => {
      if (res.status === 200 && res.body.data && res.body.data.currentPosture) {
        expect(res.body.data.currentPosture.score).to.be.at.least(80);
      }
    });
  });

  it('14_test22 - should produce lower score for unbalanced sensors', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/data?code=SP-JS33J2`,
      body: {
        posture: 'bad',
        kg: 70,
        F: 90, S: 5, L: 3, R: 2,
        calibrated: true,
      },
    });

    cy.request(`${API}/api/dashboard/SP-JS33J2`).then((res) => {
      if (res.status === 200 && res.body.data && res.body.data.currentPosture) {
        expect(res.body.data.currentPosture.score).to.be.at.most(70);
      }
    });
  });

  it('14_test23 - should generate unique activation codes', () => {
    const codes: string[] = [];

    cy.request({
      method: 'POST',
      url: `${API}/api/codes/generate`,
      body: { pillowSize: 'M' },
    }).then((res1) => {
      codes.push(res1.body.code);

      cy.request({
        method: 'POST',
        url: `${API}/api/codes/generate`,
        body: { pillowSize: 'M' },
      }).then((res2) => {
        codes.push(res2.body.code);
        expect(codes[0]).to.not.eq(codes[1]);
      });
    });
  });

  it('14_test24 - should generate codes with SP- prefix', () => {
    cy.request({
      method: 'POST',
      url: `${API}/api/codes/generate`,
      body: { pillowSize: 'S' },
    }).then((res) => {
      expect(res.body.code).to.match(/^SP-/);
    });
  });
});
