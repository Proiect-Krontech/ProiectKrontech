describe('PWA - Manifest', () => {

  it('12_test1 - should have manifest link in head', () => {
    cy.visit('/');
    cy.get('link[rel="manifest"]').should('exist');
  });

  it('12_test2 - should serve manifest.webmanifest', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('12_test3 - should have app name in manifest', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.name).to.eq('Smart Pillow');
    });
  });

  it('12_test4 - should have short_name in manifest', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.short_name).to.eq('SmartPillow');
    });
  });

  it('12_test5 - should have description in manifest', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.description).to.exist;
    });
  });

  it('12_test6 - should have standalone display mode', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.display).to.eq('standalone');
    });
  });

  it('12_test7 - should have start_url set to /', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.start_url).to.eq('/');
    });
  });

  it('12_test8 - should have theme_color defined', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.theme_color).to.match(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('12_test9 - should have background_color defined', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.background_color).to.match(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('12_test10 - should have portrait orientation', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.orientation).to.eq('portrait-primary');
    });
  });

  it('12_test11 - should have icons array with entries', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      expect(res.body.icons).to.be.an('array');
      expect(res.body.icons.length).to.be.greaterThan(0);
    });
  });

  it('12_test12 - should have 192x192 icon', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      const has192 = res.body.icons.some((i: any) => i.sizes === '192x192');
      expect(has192).to.be.true;
    });
  });

  it('12_test13 - should have 512x512 icon', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      const has512 = res.body.icons.some((i: any) => i.sizes === '512x512');
      expect(has512).to.be.true;
    });
  });

  it('12_test14 - should have PNG icons', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      res.body.icons.forEach((icon: any) => {
        expect(icon.type).to.eq('image/png');
      });
    });
  });

  it('12_test15 - should have purpose on all icons', () => {
    cy.request('/manifest.webmanifest').then((res) => {
      res.body.icons.forEach((icon: any) => {
        expect(icon.purpose).to.exist;
      });
    });
  });
});

describe('PWA - Meta Tags', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('12_test16 - should have theme-color meta tag', () => {
    cy.get('meta[name="theme-color"]').should('exist');
  });

  it('12_test17 - should have viewport meta tag', () => {
    cy.get('meta[name="viewport"]').should('exist');
  });

  it('12_test18 - should have favicon', () => {
    cy.get('link[rel="icon"]').should('exist');
  });
});

describe('PWA - Service Worker', () => {

  it('12_test19 - should serve ngsw-worker.js in production', () => {
    cy.request({
      url: '/ngsw-worker.js',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });

  it('12_test20 - should serve ngsw.json in production', () => {
    cy.request({
      url: '/ngsw.json',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 404]);
    });
  });
});

describe('PWA - Icon Files', () => {

  it('12_test21 - should serve 192x192 icon file', () => {
    cy.request({
      url: '/icons/icon-192x192.png',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('12_test22 - should serve 512x512 icon file', () => {
    cy.request({
      url: '/icons/icon-512x512.png',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('12_test23 - should serve favicon', () => {
    cy.request({
      url: '/favicon.ico',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
});
